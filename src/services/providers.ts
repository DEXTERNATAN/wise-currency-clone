export interface Provider {
  id: string;
  name: string;
  logo: string; // emoji por enquanto
  feeFixed: number; // USD fixo
  feePercent: number; // percentual sobre o valor
  rateMarkup: number; // markup sobre taxa mid-market (ex: 0.03 = 3% pior)
  deliveryTime: string;
  color: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'wise',
    name: 'Wise',
    logo: '💚',
    feeFixed: 0.5,
    feePercent: 0.0065, // ~0.65%
    rateMarkup: 0,
    deliveryTime: 'Instantâneo',
    color: '#00b67a',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '🔵',
    feeFixed: 0,
    feePercent: 0.03,
    rateMarkup: 0.025,
    deliveryTime: 'Instantâneo',
    color: '#003087',
  },
  {
    id: 'bank',
    name: 'Banco Tradicional',
    logo: '🏦',
    feeFixed: 15,
    feePercent: 0.0,
    rateMarkup: 0.04,
    deliveryTime: '2-5 dias úteis',
    color: '#6b7280',
  },
  {
    id: 'western',
    name: 'Western Union',
    logo: '🟡',
    feeFixed: 5,
    feePercent: 0.02,
    rateMarkup: 0.015,
    deliveryTime: 'Minutos',
    color: '#f59f00',
  },
  {
    id: 'remessa',
    name: 'Remessa Online',
    logo: '🟣',
    feeFixed: 0,
    feePercent: 0.012,
    rateMarkup: 0.005,
    deliveryTime: '1 dia útil',
    color: '#7048e8',
  },
];

export interface SimulationResult {
  provider: Provider;
  amountSent: number;
  feeTotal: number;
  effectiveRate: number;
  amountReceived: number;
}

export function simulateTransfer(
  amountUSD: number,
  midMarketRate: number,
  providers: Provider[] = PROVIDERS
): SimulationResult[] {
  return providers.map((p) => {
    const feeTotal = p.feeFixed + amountUSD * p.feePercent;
    const netSent = Math.max(amountUSD - feeTotal, 0);
    const effectiveRate = midMarketRate * (1 - p.rateMarkup);
    const amountReceived = netSent * effectiveRate;
    return { provider: p, amountSent: amountUSD, feeTotal, effectiveRate, amountReceived };
  }).sort((a, b) => b.amountReceived - a.amountReceived);
}
