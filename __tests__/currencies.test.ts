import { getCurrency, searchCurrencies, CURRENCIES } from '@/utils/currencies';

describe('getCurrency()', () => {
  it('encontra USD', () => {
    const c = getCurrency('USD');
    expect(c).toBeDefined();
    expect(c!.code).toBe('USD');
  });

  it('retorna undefined para código inexistente', () => {
    expect(getCurrency('XYZ')).toBeUndefined();
  });
});

describe('searchCurrencies()', () => {
  it('query vazia retorna tudo', () => {
    const results = searchCurrencies('');
    expect(results.length).toBe(CURRENCIES.length);
  });

  it('busca por código (USD)', () => {
    const results = searchCurrencies('usd');
    expect(results.some((c) => c.code === 'USD')).toBe(true);
  });

  it('busca por nome parcial', () => {
    const results = searchCurrencies('real');
    expect(results.some((c) => c.code === 'BRL')).toBe(true);
  });

  it('query sem resultado retorna array vazio', () => {
    const results = searchCurrencies('zzzzzzzzz');
    expect(results.length).toBe(0);
  });
});
