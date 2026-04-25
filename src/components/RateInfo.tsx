import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatRate } from '@/utils/format';

interface Props {
  fromCode: string;
  toCode: string;
  rate: number;
  updatedAt: Date | null;
  fromCache: boolean;
}

export function RateInfo({ fromCode, toCode, rate, updatedAt, fromCache }: Props) {
  const minutesAgo = updatedAt
    ? Math.floor((Date.now() - updatedAt.getTime()) / 60000)
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.rate}>
        1 {fromCode} = {formatRate(rate)} {toCode}
      </Text>
      {minutesAgo !== null && (
        <Text style={styles.timestamp}>
          {fromCache ? '📦 cached · ' : '🔄 live · '}
          {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  rate: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
