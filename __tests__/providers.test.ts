import { simulateTransfer, PROVIDERS } from '@/services/providers';

describe('simulateTransfer()', () => {
  const midRate = 5.12; // USD → BRL
  const amount = 1000;

  it('retorna resultado para todos os provedores', () => {
    const results = simulateTransfer(amount, midRate);
    expect(results.length).toBe(PROVIDERS.length);
  });

  it('resultados ordenados por valor recebido decrescente', () => {
    const results = simulateTransfer(amount, midRate);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.amountReceived).toBeGreaterThanOrEqual(
        results[i]!.amountReceived
      );
    }
  });

  it('Wise tem melhor resultado (sem markup)', () => {
    const results = simulateTransfer(amount, midRate);
    expect(results[0]!.provider.id).toBe('wise');
  });

  it('valor recebido sempre positivo', () => {
    const results = simulateTransfer(amount, midRate);
    results.forEach((r) => {
      expect(r.amountReceived).toBeGreaterThan(0);
    });
  });

  it('tarifa total >= 0', () => {
    const results = simulateTransfer(amount, midRate);
    results.forEach((r) => {
      expect(r.feeTotal).toBeGreaterThanOrEqual(0);
    });
  });

  it('taxa efetiva <= mid-market', () => {
    const results = simulateTransfer(amount, midRate);
    results.forEach((r) => {
      expect(r.effectiveRate).toBeLessThanOrEqual(midRate + 0.0001);
    });
  });
});
