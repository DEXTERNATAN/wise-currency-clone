import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useCurrencyStore } from '@/store/currencyStore';
import { getCurrency } from '@/utils/currencies';
import { formatRate } from '@/utils/format';
import { convert } from '@/utils/format';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite, rates, setFromCurrency, setToCurrency } =
    useCurrencyStore();

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>☆</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap ☆ on the converter screen to save a currency pair.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} pairs saved</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const [fromCode, toCode] = item.split('-');
          const fromCur = getCurrency(fromCode ?? '');
          const toCur = getCurrency(toCode ?? '');
          const rate = Object.keys(rates).length
            ? convert(1, fromCode ?? '', toCode ?? '', rates)
            : null;

          return (
            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.7}
              onPress={() => {
                if (fromCode && toCode) {
                  setFromCurrency(fromCode);
                  setToCurrency(toCode);
                }
              }}
            >
              <View style={styles.flags}>
                <Text style={styles.flag}>{fromCur?.flag}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.flag}>{toCur?.flag}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.pair}>{item}</Text>
                {rate !== null && (
                  <Text style={styles.rate}>
                    1 {fromCode} = {formatRate(rate)} {toCode}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(item)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeIcon}>⭐</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4ff' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  list: { padding: 16, gap: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  flags: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flag: { fontSize: 22 },
  arrow: { fontSize: 12, color: '#9ca3af' },
  info: { flex: 1 },
  pair: { fontSize: 15, fontWeight: '700', color: '#1e3a5f' },
  rate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  removeBtn: { padding: 4 },
  removeIcon: { fontSize: 18 },
  separator: { height: 0 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
});
