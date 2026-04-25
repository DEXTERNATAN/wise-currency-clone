/**
 * Format a number as currency string.
 * Uses Intl.NumberFormat for locale-aware formatting.
 */
export function formatCurrency(
  value: number,
  currencyCode: string,
  locale = 'en-US'
): string {
  if (!isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 4,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currencyCode}`;
  }
}

/**
 * Format a rate with up to 6 significant digits.
 */
export function formatRate(rate: number): string {
  if (!isFinite(rate) || rate === 0) return '—';
  if (rate >= 1000) return rate.toFixed(0);
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(6);
}

/**
 * Convert amount from base currency to target using rate map.
 */
export function convert(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Record<string, number>
): number {
  if (!amount || !isFinite(amount)) return 0;
  if (fromCode === toCode) return amount;

  const fromRate = rates[fromCode];
  const toRate = rates[toCode];

  if (!fromRate || !toRate) return 0;

  // rates are relative to a base (e.g. USD)
  // amount / fromRate gives value in base, then * toRate converts to target
  const inBase = amount / fromRate;
  return inBase * toRate;
}
