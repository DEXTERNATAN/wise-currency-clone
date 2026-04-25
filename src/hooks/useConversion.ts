import { useMemo } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';
import { convert } from '@/utils/format';

export function useConversion() {
  const { amount, fromCurrency, toCurrency, rates } = useCurrencyStore();

  const result = useMemo(() => {
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || !Object.keys(rates).length) return 0;
    return convert(num, fromCurrency, toCurrency, rates);
  }, [amount, fromCurrency, toCurrency, rates]);

  const rate = useMemo(() => {
    if (!Object.keys(rates).length) return 0;
    return convert(1, fromCurrency, toCurrency, rates);
  }, [fromCurrency, toCurrency, rates]);

  return { result, rate };
}
