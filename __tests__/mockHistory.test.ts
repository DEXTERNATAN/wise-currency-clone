import { generateMockHistory, Period } from '@/services/mockHistory';

const PERIODS: Period[] = ['1D', '7D', '1M', '1Y'];

describe('generateMockHistory()', () => {
  PERIODS.forEach((period) => {
    it(`gera pontos para período ${period}`, () => {
      const points = generateMockHistory(5.12, period);
      expect(points.length).toBeGreaterThan(0);
    });
  });

  it('último ponto = taxa base exata', () => {
    const base = 5.1234;
    const points = generateMockHistory(base, '7D');
    expect(points[points.length - 1]!.value).toBe(base);
  });

  it('todos os valores são positivos', () => {
    const points = generateMockHistory(5.12, '1M');
    points.forEach((p) => {
      expect(p.value).toBeGreaterThan(0);
    });
  });

  it('datas em ordem crescente', () => {
    const points = generateMockHistory(1.5, '7D');
    for (let i = 1; i < points.length; i++) {
      expect(new Date(points[i]!.date).getTime()).toBeGreaterThan(
        new Date(points[i - 1]!.date).getTime()
      );
    }
  });
});
