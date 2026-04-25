import { detectLocalCurrency, getDefaultCurrencyPair } from '@/utils/detectCurrency';

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

import * as Localization from 'expo-localization';
const mockGetLocales = Localization.getLocales as jest.Mock;

describe('detectLocalCurrency()', () => {
  it('detecta BRL para região BR', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'BR', languageTag: 'pt-BR' }]);
    expect(detectLocalCurrency()).toBe('BRL');
  });

  it('detecta USD para região US', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'US', languageTag: 'en-US' }]);
    expect(detectLocalCurrency()).toBe('USD');
  });

  it('detecta EUR para região DE', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'DE', languageTag: 'de-DE' }]);
    expect(detectLocalCurrency()).toBe('EUR');
  });

  it('usa languageTag quando regionCode ausente', () => {
    mockGetLocales.mockReturnValue([{ regionCode: null, languageTag: 'pt-BR' }]);
    expect(detectLocalCurrency()).toBe('BRL');
  });

  it('retorna BRL como fallback para região desconhecida', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'ZZ', languageTag: 'xx-ZZ' }]);
    expect(detectLocalCurrency()).toBe('BRL');
  });

  it('retorna BRL quando getLocales lança erro', () => {
    mockGetLocales.mockImplementation(() => { throw new Error('unavailable'); });
    expect(detectLocalCurrency()).toBe('BRL');
  });
});

describe('getDefaultCurrencyPair()', () => {
  it('retorna USD→BRL para usuário brasileiro', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'BR', languageTag: 'pt-BR' }]);
    expect(getDefaultCurrencyPair()).toEqual({ from: 'USD', to: 'BRL' });
  });

  it('retorna USD→EUR para usuário europeu', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'DE', languageTag: 'de-DE' }]);
    expect(getDefaultCurrencyPair()).toEqual({ from: 'USD', to: 'EUR' });
  });

  it('evita par USD→USD (fallback para BRL)', () => {
    mockGetLocales.mockReturnValue([{ regionCode: 'US', languageTag: 'en-US' }]);
    const pair = getDefaultCurrencyPair();
    expect(pair.from).not.toBe(pair.to);
  });
});
