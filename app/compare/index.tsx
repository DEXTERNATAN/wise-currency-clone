import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useCurrencyStore } from '@/store/currencyStore';
import { simulateTransfer, SimulationResult } from '@/services/providers';
import { convert, formatCurrency, formatRate } from '@/utils/format';
import { getCurrency } from '@/utils/currencies';

export default function CompareScreen() {
  const { fromCurrency, toCurrency, rates } = useCurrencyStore();
  const [inputAmount, setInputAmount] = useState('1000');

  const midMarketRate = useMemo(() => {
    if (!Object.keys(rates).length) return 0;
    return convert(1, fromCurrency, toCurrency, rates);
  }, [fromCurrency, toCurrency, rates]);

  const amount = parseFloat(inputAmount.replace(',', '.')) || 0;

  const results: SimulationResult[] = useMemo(() => {
    if (!midMarketRate || !amount) return [];
    return simulateTransfer(amount, midMarketRate);
  }, [amount, midMarketRate]);

  const fromCur = getCurrency(fromCurrency);
  const toCur = getCurrency(toCurrency);
  const best = results[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Comparar Provedores</Text>
        <Text style={styles.subtitle}>
          {fromCur?.flag} {fromCurrency} → {toCur?.flag} {toCurrency}
        </Text>

        {/* Input de valor */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Valor a enviar ({fromCurrency})</Text>
          <TextInput
            style={styles.input}
            value={inputAmount}
            onChangeText={(t) => setInputAmount(t.replace(/[^0-9.,]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#d1d5db"
          />
          {midMarketRate > 0 && (
            <Text style={styles.midRate}>
              Taxa mid-market: 1 {fromCurrency} = {formatRate(midMarketRate)} {toCurrency}
            </Text>
          )}
        </View>

        {/* Resultados */}
        {results.map((r, idx) => (
          <View
            key={r.provider.id}
            style={[styles.providerCard, idx === 0 && styles.providerCardBest]}
          >
            {idx === 0 && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>✓ Melhor opção</Text>
              </View>
            )}
            <View style={styles.providerHeader}>
              <Text style={styles.providerLogo}>{r.provider.logo}</Text>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{r.provider.name}</Text>
                <Text style={styles.deliveryTime}>⏱ {r.provider.deliveryTime}</Text>
              </View>
              <View style={styles.receivedBlock}>
                <Text style={styles.receivedValue}>
                  {formatCurrency(r.amountReceived, toCurrency)}
                </Text>
                <Text style={styles.receivedLabel}>recebido</Text>
              </View>
            </View>

            {/* Detalhes expansíveis */}
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Taxa efetiva</Text>
                <Text style={styles.breakdownValue}>
                  {formatRate(r.effectiveRate)} {toCurrency}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tarifa total</Text>
                <Text style={[styles.breakdownValue, styles.feeValue]}>
                  -{formatCurrency(r.feeTotal, fromCurrency)}
                </Text>
              </View>
              {idx === 0 && best && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Economia vs pior</Text>
                  <Text style={[styles.breakdownValue, styles.savingValue]}>
                    +{formatCurrency(
                      r.amountReceived - (results[results.length - 1]?.amountReceived ?? 0),
                      toCurrency
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Carregue as cotações na tela de Conversor primeiro.
            </Text>
          </View>
        )}

        <Text style={styles.disclaimer}>
          * Tarifas aproximadas para fins informativos. Consulte cada provedor para valores exatos.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: -8 },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  input: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e3a5f',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  midRate: { fontSize: 12, color: '#9ca3af' },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  providerCardBest: {
    borderColor: '#00b67a',
  },
  bestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  bestBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerLogo: { fontSize: 26 },
  providerInfo: { flex: 1, gap: 2 },
  providerName: { fontSize: 15, fontWeight: '700', color: '#1e3a5f' },
  deliveryTime: { fontSize: 11, color: '#9ca3af' },
  receivedBlock: { alignItems: 'flex-end', gap: 2 },
  receivedValue: { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },
  receivedLabel: { fontSize: 10, color: '#9ca3af' },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: { fontSize: 12, color: '#9ca3af' },
  breakdownValue: { fontSize: 12, fontWeight: '600', color: '#374151' },
  feeValue: { color: '#ef4444' },
  savingValue: { color: '#059669' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  disclaimer: { fontSize: 11, color: '#c4c9d4', textAlign: 'center', lineHeight: 16 },
});
