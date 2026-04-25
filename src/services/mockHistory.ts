export type Period = '1D' | '7D' | '1M' | '1Y';

export interface RatePoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Gera série histórica mock para um par de moedas.
 * Usa random walk para simular variação realista.
 */
export function generateMockHistory(
  baseRate: number,
  period: Period
): RatePoint[] {
  const now = Date.now();
  const points: RatePoint[] = [];

  let count: number;
  let stepMs: number;
  let volatility: number;
  let labelEvery: number;

  switch (period) {
    case '1D':
      count = 24;
      stepMs = 60 * 60 * 1000; // 1h
      volatility = 0.002;
      labelEvery = 6;
      break;
    case '7D':
      count = 7;
      stepMs = 24 * 60 * 60 * 1000; // 1d
      volatility = 0.005;
      labelEvery = 1;
      break;
    case '1M':
      count = 30;
      stepMs = 24 * 60 * 60 * 1000;
      volatility = 0.008;
      labelEvery = 7;
      break;
    case '1Y':
      count = 12;
      stepMs = 30 * 24 * 60 * 60 * 1000; // ~1 mês
      volatility = 0.025;
      labelEvery = 1;
      break;
  }

  let rate = baseRate * (1 - volatility * count * 0.3); // começa levemente abaixo

  for (let i = 0; i < count; i++) {
    const ts = now - (count - 1 - i) * stepMs;
    const d = new Date(ts);

    // Random walk com drift leve em direção à taxa atual
    const change = (Math.random() - 0.48) * volatility * rate;
    rate = Math.max(rate + change, 0.0001);

    let label = '';
    if (i % labelEvery === 0) {
      if (period === '1D') {
        label = `${d.getHours()}h`;
      } else if (period === '1Y') {
        label = d.toLocaleDateString('pt-BR', { month: 'short' });
      } else {
        label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
    }

    points.push({
      date: d.toISOString(),
      value: parseFloat(rate.toFixed(4)),
      label,
    });
  }

  // Último ponto = taxa atual exata
  if (points.length > 0) {
    points[points.length - 1]!.value = baseRate;
  }

  return points;
}
