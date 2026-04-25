import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrencyStore } from '@/store/currencyStore';
import { searchCurrencies, Currency } from '@/utils/currencies';

export default function CurrencyPickerScreen() {
  const { target } = useLocalSearchParams<{ target: 'from' | 'to' }>();
  const [query, setQuery] = useState('');
  const { setFromCurrency, setToCurrency } = useCurrencyStore();

  const filtered = searchCurrencies(query);

  const handleSelect = (currency: Currency) => {
    if (target === 'from') setFromCurrency(currency.code);
    else setToCurrency(currency.code);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search currency (e.g. USD, Real)"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)} activeOpacity={0.7}>
            <Text style={styles.flag}>{item.flag}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <Text style={styles.symbol}>{item.symbol}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchInput: {
    backgroundColor: '#f8faff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e3a5f',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  flag: { fontSize: 24 },
  textContainer: { flex: 1 },
  code: { fontSize: 15, fontWeight: '700', color: '#1e3a5f' },
  name: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  symbol: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#f9fafb', marginLeft: 60 },
});
