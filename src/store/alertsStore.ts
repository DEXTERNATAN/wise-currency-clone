import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERTS_KEY = 'rate_alerts_v1';

export type AlertDirection = 'above' | 'below';

export interface RateAlert {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  direction: AlertDirection;
  targetRate: number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface AlertsState {
  alerts: RateAlert[];
  loaded: boolean;
  loadAlerts: () => Promise<void>;
  addAlert: (alert: Omit<RateAlert, 'id' | 'createdAt'>) => Promise<void>;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  checkAlerts: (rates: Record<string, number>) => RateAlert[];
}

async function persist(alerts: RateAlert[]) {
  try {
    await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  } catch {}
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  loaded: false,

  loadAlerts: async () => {
    if (get().loaded) return;
    try {
      const raw = await AsyncStorage.getItem(ALERTS_KEY);
      const alerts = raw ? (JSON.parse(raw) as RateAlert[]) : [];
      set({ alerts, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addAlert: async (data) => {
    const alert: RateAlert = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().alerts, alert];
    set({ alerts: updated });
    await persist(updated);
  },

  toggleAlert: (id) => {
    const updated = get().alerts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    set({ alerts: updated });
    persist(updated);
  },

  deleteAlert: (id) => {
    const updated = get().alerts.filter((a) => a.id !== id);
    set({ alerts: updated });
    persist(updated);
  },

  /**
   * Verifica alertas contra taxas atuais.
   * Retorna alertas disparados (para exibir notificação).
   * Base das taxas: USD.
   */
  checkAlerts: (rates) => {
    const triggered: RateAlert[] = [];
    const updated = get().alerts.map((alert) => {
      if (!alert.active || alert.triggeredAt) return alert;

      const fromRate = rates[alert.fromCurrency];
      const toRate = rates[alert.toCurrency];
      if (!fromRate || !toRate) return alert;

      const currentRate = toRate / fromRate;
      const hit =
        alert.direction === 'above'
          ? currentRate >= alert.targetRate
          : currentRate <= alert.targetRate;

      if (hit) {
        triggered.push(alert);
        return { ...alert, triggeredAt: new Date().toISOString() };
      }
      return alert;
    });
    if (triggered.length > 0) {
      set({ alerts: updated });
      persist(updated);
    }
    return triggered;
  },
}));
