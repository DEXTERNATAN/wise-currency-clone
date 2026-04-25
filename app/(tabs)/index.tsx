import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useCurrencyStore, getCurrentPair } from '@/store/currencyStore';
import { useConversion } from '@/hooks/useConversion';
import { CurrencyButton } from '@/components/CurrencyButton';
import { RateInfo } from '@/components/RateInfo';
import { formatCurrency } from '@/utils/format';

export default function HomeScreen() {
  const {
    amount,
    fromCurrency,
    toCurrency,
    updatedAt,
    fromCache,
    loading,
    error,
    setAmount,
    swapCurrencies,
    fetchRates,
    loadFavorites,
    initPrefs,
    toggleFavorite,
    favorites,
  } = useCurrencyStore();

  const { result, rate } = useConversion();

  const swapRotation = useRef(new Animated.Value(0)).current;
  const [inputValue, setInputValue] = useState(amount);
  const [refreshing, setRefreshing] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAmountChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9.,]/g, '');
      setInputValue(cleaned);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setAmount(cleaned), 300);
    },
    [setAmount]
  );

  useEffect(() => {
    initPrefs().then(() => fetchRates());
    loadFavorites();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRates();
    setRefreshing(false);
  }, [fetchRates]);

  const handleSwap = () => {
    Animated.timing(swapRotation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => swapRotation.setValue(0));
    swapCurrencies();
  };

  const spinInterpolate = swapRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const pair = getCurrentPair(useCurrencyStore.getState());
  const isFavorite = favorites.includes(pair);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#37517e"
            colors={['#37517e']}
          />
        }
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Conversor de Moedas</Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(pair)}
            style={styles.favoriteBtn}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Info da taxa */}
        {!loading && rate > 0 && (
          <RateInfo
            fromCode={fromCurrency}
            toCode={toCurrency}
            rate={rate}
            updatedAt={updatedAt}
            fromCache={fromCache}
          />
        )}

        <View style={styles.card}>
          {/* Input de valor */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.amountInput}
              value={inputValue}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#d1d5db"
              maxLength={15}
            />
          </View>

          {/* Moeda de origem */}
          <CurrencyButton
            code={fromCurrency}
            onPress={() =>
              router.push({
                pathname: '/currency-picker',
                params: { target: 'from' },
              })
            }
          />

          {/* Botão de swap */}
          <View style={styles.swapRow}>
            <View style={styles.divider} />
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <TouchableOpacity
                style={styles.swapButton}
                onPress={handleSwap}
                activeOpacity={0.8}
              >
                <Text style={styles.swapIcon}>⇅</Text>
              </TouchableOpacity>
            </Animated.View>
            <View style={styles.divider} />
          </View>

          {/* Moeda de destino */}
          <CurrencyButton
            code={toCurrency}
            onPress={() =>
              router.push({
                pathname: '/currency-picker',
                params: { target: 'to' },
              })
            }
          />

          {/* Resultado */}
          <View style={styles.resultContainer}>
            {loading ? (
              <ActivityIndicator color="#37517e" size="small" />
            ) : error ? (
              <Text style={styles.errorText}>⚠️ {error}</Text>
            ) : (
              <Text style={styles.result}>
                {formatCurrency(result, toCurrency)}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.pullHint}>↓ Puxe para atualizar cotações</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll: { flex: 1 },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  favoriteBtn: { padding: 4 },
  favoriteIcon: { fontSize: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
    marginBottom: 4,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1e3a5f',
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#37517e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapIcon: { fontSize: 20, color: '#fff' },
  resultContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
  },
  result: { fontSize: 28, fontWeight: '700', color: '#37517e' },
  errorText: { fontSize: 14, color: '#ef4444' },
  pullHint: { fontSize: 12, color: '#d1d5db', textAlign: 'center' },
});
