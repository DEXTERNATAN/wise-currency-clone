import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';

admin.initializeApp();
const db = admin.firestore();

const EXCHANGE_API_KEY = defineSecret('EXCHANGE_API_KEY');
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

interface ExchangeApiResponse {
  base: string;
  rates: Record<string, number>;
}

async function fetchAndCacheRates(apiKey: string): Promise<ExchangeApiResponse> {
  const cached = await db.collection('exchange_rates').doc('latest').get();

  if (cached.exists) {
    const data = cached.data()!;
    const updatedAt: Date = data['updatedAt'].toDate();
    if (Date.now() - updatedAt.getTime() < CACHE_TTL_MS) {
      return { base: data['base'], rates: data['rates'] };
    }
  }

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json = (await res.json()) as { base_code: string; conversion_rates: Record<string, number> };

  const payload: ExchangeApiResponse = {
    base: json.base_code,
    rates: json.conversion_rates,
  };

  await db.collection('exchange_rates').doc('latest').set({
    ...payload,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return payload;
}

/**
 * GET /getRates — retorna cotações (com cache Firestore)
 * Chamado pelo app via EXPO_PUBLIC_FIREBASE_FUNCTION_URL
 */
export const getRates = onRequest(
  { secrets: [EXCHANGE_API_KEY], cors: true },
  async (_req, res) => {
    try {
      const data = await fetchAndCacheRates(EXCHANGE_API_KEY.value());
      res.json(data);
    } catch (err) {
      console.error('getRates error:', err);
      res.status(500).json({ error: 'Falha ao buscar cotações' });
    }
  }
);

/**
 * Job agendado — atualiza cotações a cada 15 minutos
 */
export const refreshRatesScheduled = onSchedule(
  { schedule: 'every 15 minutes', secrets: [EXCHANGE_API_KEY] },
  async () => {
    try {
      await fetchAndCacheRates(EXCHANGE_API_KEY.value());
      console.log('Cotações atualizadas via cron');
    } catch (err) {
      console.error('refreshRatesScheduled error:', err);
    }
  }
);

/**
 * Job agendado — verifica alertas de câmbio dos usuários
 * Roda a cada 15 minutos após o refresh de cotações
 */
export const checkAlerts = onSchedule('every 15 minutes', async () => {
  const ratesDoc = await db.collection('exchange_rates').doc('latest').get();
  if (!ratesDoc.exists) return;

  const rates = ratesDoc.data()!['rates'] as Record<string, number>;

  const alertsSnap = await db
    .collection('alerts')
    .where('active', '==', true)
    .where('triggeredAt', '==', null)
    .get();

  const batch = db.batch();
  const triggered: string[] = [];

  alertsSnap.forEach((doc) => {
    const alert = doc.data();
    const fromRate: number = rates[alert['fromCurrency']] ?? 0;
    const toRate: number = rates[alert['toCurrency']] ?? 0;
    if (!fromRate || !toRate) return;

    const currentRate = toRate / fromRate;
    const hit =
      alert['direction'] === 'above'
        ? currentRate >= alert['targetRate']
        : currentRate <= alert['targetRate'];

    if (hit) {
      batch.update(doc.ref, {
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      triggered.push(doc.id);
    }
  });

  if (triggered.length > 0) {
    await batch.commit();
    console.log(`${triggered.length} alerta(s) disparado(s)`);
    // TODO: enviar FCM push notification para cada usuário afetado
  }
});
