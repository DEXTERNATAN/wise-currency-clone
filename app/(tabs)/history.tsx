import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useCurrencyStore } from '@/store/currencyStore';
import { generateMockHistory, Period } from '@/services/mockHistory';
import { convert, formatRate } from '@/utils/format';
import { getCurrency } from '@/utils/currencies';

const PERIODS: Period[] = ['1D', '7D', '1M', '1Y'];
const PERIOD_LABELS: Record<Period, string> = {
  '1D': '1 Dia',
  '7D': '7 Dias',
  '1M': '1 Mês',
  '1Y': '1 Ano',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HistoryScreen() {
  const { fromCurrency, toCurrency, rates } = useCurrencyStore();
  const [period, setPeriod] = useState<Period>('7D');

  const currentRate = useMemo(() => {
    if (!Object.keys(rates).length) return 0;
    return convert(1, fromCurrency, toCurrency, rates);
  }, [fromCurrency, toCurrency, rates]);

  const history = useMemo(() => {
    if (!currentRate) return [];
    return generateMockHistory(currentRate, period);
  }, [currentRate, period]);

  const chartData = useMemo(
    () =>
      history.map((p) => ({
        value: p.value,
        label: p.label ?? '',
        dataPointText: '',
      })),
    [history]
  );

  const minVal = useMemo(
    () => Math.min(...history.map((p) => p.value)),
    [history]
  );
  const maxVal = useMemo(
    () => Math.max(...history.map((p) => p.value)),
    [history]
  );

  const fromCur = getCurrency(fromCurrency);
  const toCur = getCurrency(toCurrency);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Histórico de Câmbio</Text>
          <View style={styles.pairBadge}>
            <Text style={styles.pairText}>
              {fromCur?.flag} {fromCurrency} → {toCur?.flag} {toCurrency}
            </Text>
          </View>
        </View>

        {/* Taxa atual */}
        {currentRate > 0 && (
          <View style={styles.currentRateCard}>
            <Text style={styles.currentRateLabel}>Taxa atual</Text>
            <Text style={styles.currentRateValue}>
              1 {fromCurrency} = {formatRate(currentRate)} {toCurrency}
            </Text>
          </View>
        )}

        {/* Seletor de período */}
        <View style={styles.periodSelector}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  period === p && styles.periodBtnTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico */}
        {chartData.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#37517e" />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <Text style={styles.chartPeriodLabel}>{PERIOD_LABELS[period]}</Text>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 80}
              height={180}
              color="#37517e"
              thickness={2}
              startFillColor="#37517e"
              endFillColor="#f0f4ff"
              startOpacity={0.3}
              endOpacity={0.05}
              areaChart
              curved
              hideDataPoints
              hideRules
              xAxisColor="#e5e7eb"
              yAxisColor="#e5e7eb"
              yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 9 }}
              noOfSections={4}
              maxValue={maxVal * 1.01}
              mostNegativeValue={minVal * 0.99}
              initialSpacing={8}
              endSpacing={8}
            />

            {/* Estatísticas */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Mínima</Text>
                <Text style={[styles.statValue, styles.statMin]}>
                  {formatRate(minVal)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Máxima</Text>
                <Text style={[styles.statValue, styles.statMax]}>
                  {formatRate(maxVal)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Variação</Text>
                <Text style={styles.statValue}>
                  {(((maxVal - minVal) / minVal) * 100).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.disclaimer}>
          * Dados históricos simulados para fins de demonstração.
          {'\n'}Integração com Firebase será implementada na issue #10.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { gap: 6 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  pairBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pairText: { fontSize: 13, color: '#37517e', fontWeight: '600' },
  currentRateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  currentRateLabel: { fontSize: 13, color: '#9ca3af' },
  currentRateValue: { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#e8eef8',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: '#37517e' },
  periodBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  periodBtnTextActive: { color: '#fff' },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartPeriodLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, color: '#9ca3af' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },
  statMin: { color: '#ef4444' },
  statMax: { color: '#22c55e' },
  loading: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  loadingText: { color: '#9ca3af', fontSize: 14 },
  disclaimer: {
    fontSize: 11,
    color: '#c4c9d4',
    textAlign: 'center',
    lineHeight: 16,
  },
});
