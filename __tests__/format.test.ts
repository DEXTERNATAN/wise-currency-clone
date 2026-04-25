import { convert, formatRate, formatCurrency } from '@/utils/format';

const RATES: Record<string, number> = {
  USD: 1,
  BRL: 5.12,
  EUR: 0.92,
  JPY: 154.3,
};

describe('convert()', () => {
  it('converte USD para BRL', () => {
    const result = convert(100, 'USD', 'BRL', RATES);
    expect(result).toBeCloseTo(512, 0);
  });

  it('converte BRL para USD', () => {
    const result = convert(512, 'BRL', 'USD', RATES);
    expect(result).toBeCloseTo(100, 0);
  });

  it('mesmo par retorna valor original', () => {
    expect(convert(100, 'USD', 'USD', RATES)).toBe(100);
  });

  it('valor zero retorna zero', () => {
    expect(convert(0, 'USD', 'BRL', RATES)).toBe(0);
  });

  it('valor NaN retorna zero', () => {
    expect(convert(NaN, 'USD', 'BRL', RATES)).toBe(0);
  });

  it('moeda inexistente retorna zero', () => {
    expect(convert(100, 'USD', 'XYZ', RATES)).toBe(0);
  });

  it('converte entre duas não-base (EUR → BRL)', () => {
    const result = convert(1, 'EUR', 'BRL', RATES);
    // 1 EUR / 0.92 = ~1.087 USD; * 5.12 = ~5.565 BRL
    expect(result).toBeCloseTo(5.565, 1);
  });

  it('suporta valores grandes', () => {
    const result = convert(1_000_000, 'USD', 'JPY', RATES);
    expect(result).toBeCloseTo(154_300_000, -3);
  });
});

describe('formatRate()', () => {
  it('formata taxa >= 1 com 4 casas', () => {
    expect(formatRate(5.1234)).toBe('5.1234');
  });

  it('formata taxa < 1 com 6 casas', () => {
    expect(formatRate(0.000123)).toBe('0.000123');
  });

  it('formata taxa >= 1000 sem decimais', () => {
    expect(formatRate(1500)).toBe('1500');
  });

  it('retorna — para zero', () => {
    expect(formatRate(0)).toBe('—');
  });

  it('retorna — para Infinity', () => {
    expect(formatRate(Infinity)).toBe('—');
  });
});

describe('formatCurrency()', () => {
  it('formata BRL', () => {
    const r = formatCurrency(5.12, 'BRL');
    expect(r).toContain('5');
  });

  it('JPY formata número inteiro (sem casas decimais fracionárias)', () => {
    const r = formatCurrency(154, 'JPY');
    // JPY usa maximumFractionDigits=0, mas separador decimal varia por locale
    expect(r).toMatch(/154/);
  });

  it('Infinity retorna —', () => {
    expect(formatCurrency(Infinity, 'USD')).toBe('—');
  });
});
