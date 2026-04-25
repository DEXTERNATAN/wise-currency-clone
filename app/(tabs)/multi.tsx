import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { useCurrencyStore } from '@/store/currencyStore';
import { convert, formatCurrency } from '@/utils/format';
import { getCurrency, CURRENCIES } from '@/utils/currencies';

const DEFAULT_TARGETS = ['BRL', 'EUR', 'GBP', 'JPY'];
const MAX_TARGETS = 10;

export default function MultiScreen() {
  const { fromCurrency, rates } = useCurrencyStore();
  const [inputAmount, setInputAmount] = useState('1');
  const [targets, setTargets] = useState<string[]>(DEFAULT_TARGETS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [amount, setAmount] = useState(1);

  const handleAmountChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '');
    setInputAmount(cleaned);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAmount(parseFloat(cleaned.replace(',', '.')) || 0);
    }, 300);
  }, []);

  const results = useMemo(() => {
    if (!Object.keys(rates).length || !amount) return [];
    return targets.map((code) => ({
      code,
      value: convert(amount, fromCurrency, code, rates),
    }));
  }, [amount, fromCurrency, targets, rates]);

  const fromCur = getCurrency(fromCurrency);

  const addCurrency = () => {
    if (targets.length >= MAX_TARGETS) {
      Alert.alert('Limite atingido', `Máximo de ${MAX_TARGETS} moedas simultâneas.`);
      return;
    }
    const available = CURRENCIES.map((c) => c.code).filter(
      (c) => c !== fromCurrency && !targets.includes(c)
    );
    if (available.length === 0) return;
    setTargets((prev) => [...prev, available[0]!]);
  };

  const removeCurrency = (code: string) => {
    if (targets.length <= 2) {
      Alert.alert('Mínimo', 'Mantenha pelo menos 2 moedas de destino.');
      return;
    }
    setTargets((prev) => prev.filter((c) => c !== code));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setTargets((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === targets.length - 1) return;
    setTargets((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Multi-Moeda</Text>
          <Text style={styles.subtitle}>{targets.length}/{MAX_TARGETS} moedas</Text>
        </View>

        {/* Input de origem */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Text style={styles.fromFlag}>{fromCur?.flag}</Text>
            <TextInput
              style={styles.input}
              value={inputAmount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#d1d5db"
              maxLength={15}
            />
            <Text style={styles.fromCode}>{fromCurrency}</Text>
          </View>
        </View>

        {/* Lista de resultados */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const cur = getCurrency(item.code);
            return (
              <View style={styles.resultRow}>
                <View style={styles.orderBtns}>
                  <TouchableOpacity onPress={() => moveUp(index)} style={styles.orderBtn}>
                    <Text style={styles.orderBtnText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveDown(index)} style={styles.orderBtn}>
                    <Text style={styles.orderBtnText}>▼</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.resultFlag}>{cur?.flag}</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultCode}>{item.code}</Text>
                  <Text style={styles.resultName} numberOfLines={1}>{cur?.name}</Text>
                </View>
                <Text style={styles.resultValue}>
                  {formatCurrency(item.value, item.code)}
                </Text>
                <TouchableOpacity
                  onPress={() => removeCurrency(item.code)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.addBtn, targets.length >= MAX_TARGETS && styles.addBtnDisabled]}
              onPress={addCurrency}
            >
              <Text style={styles.addBtnText}>+ Adicionar moeda</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { flex: 1, padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  subtitle: { fontSize: 13, color: '#9ca3af' },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fromFlag: { fontSize: 24 },
  input: { flex: 1, fontSize: 28, fontWeight: '700', color: '#1e3a5f' },
  fromCode: { fontSize: 16, fontWeight: '700', color: '#37517e' },
  list: { gap: 0, paddingBottom: 20 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  orderBtns: { gap: 2 },
  orderBtn: { padding: 2 },
  orderBtnText: { fontSize: 10, color: '#d1d5db' },
  resultFlag: { fontSize: 22 },
  resultInfo: { flex: 1 },
  resultCode: { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },
  resultName: { fontSize: 11, color: '#9ca3af' },
  resultValue: { fontSize: 15, fontWeight: '700', color: '#37517e' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 14, color: '#d1d5db' },
  separator: { height: 0 },
  addBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { fontSize: 14, color: '#37517e', fontWeight: '600' },
});
