import { MOCK_RATES } from '@/services/mockRates';

describe('MOCK_RATES', () => {
  it('contém USD com valor 1 (base)', () => {
    expect(MOCK_RATES['USD']).toBe(1);
  });

  it('contém BRL com valor positivo', () => {
    expect(MOCK_RATES['BRL']).toBeGreaterThan(1);
  });

  it('todas as taxas são números positivos finitos', () => {
    Object.entries(MOCK_RATES).forEach(([code, rate]) => {
      expect(typeof rate).toBe('number');
      expect(isFinite(rate)).toBe(true);
      expect(rate).toBeGreaterThan(0);
    });
  });

  it('cobre pelo menos 20 moedas', () => {
    expect(Object.keys(MOCK_RATES).length).toBeGreaterThanOrEqual(20);
  });
});
