/**
 * Static mock rates for local development.
 * Base: USD. All rates are approximate (2026-04).
 * Switch to real API via USE_MOCK env flag.
 */
export const MOCK_RATES: Record<string, number> = {
  USD: 1,
  BRL: 5.12,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.3,
  CAD: 1.37,
  AUD: 1.54,
  CHF: 0.90,
  CNY: 7.24,
  MXN: 17.1,
  ARS: 885.0,
  CLP: 950.0,
  COP: 3950.0,
  PEN: 3.75,
  UYU: 39.0,
  BOB: 6.91,
  INR: 83.5,
  KRW: 1345.0,
  SGD: 1.35,
  HKD: 7.82,
  NOK: 10.55,
  SEK: 10.42,
  DKK: 6.87,
  NZD: 1.63,
  ZAR: 18.6,
  TRY: 32.5,
  RUB: 90.2,
  PLN: 3.97,
  CZK: 22.9,
  HUF: 356.0,
};

export const MOCK_UPDATED_AT = new Date('2026-04-25T12:00:00Z');
