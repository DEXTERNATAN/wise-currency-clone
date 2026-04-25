import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { getCurrency } from '@/utils/currencies';

interface Props {
  code: string;
  onPress: () => void;
}

export function CurrencyButton({ code, onPress }: Props) {
  const currency = getCurrency(code);
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.flag}>{currency?.flag ?? '🏳️'}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.name} numberOfLines={1}>{currency?.name ?? code}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faff',
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  flag: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  code: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a5f',
  },
  name: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
});
