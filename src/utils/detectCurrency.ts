import * as Localization from 'expo-localization';

/**
 * Mapa de região (ISO 3166-1 alpha-2) → código de moeda ISO 4217.
 * Cobre os principais mercados relevantes para o app.
 */
const REGION_TO_CURRENCY: Record<string, string> = {
  BR: 'BRL', // Brasil
  US: 'USD', // Estados Unidos
  GB: 'GBP', // Reino Unido
  DE: 'EUR', // Alemanha
  FR: 'EUR', // França
  IT: 'EUR', // Itália
  ES: 'EUR', // Espanha
  PT: 'EUR', // Portugal
  NL: 'EUR', // Holanda
  BE: 'EUR', // Bélgica
  AT: 'EUR', // Áustria
  JP: 'JPY', // Japão
  CN: 'CNY', // China
  AU: 'AUD', // Austrália
  CA: 'CAD', // Canadá
  CH: 'CHF', // Suíça
  MX: 'MXN', // México
  AR: 'ARS', // Argentina
  CL: 'CLP', // Chile
  CO: 'COP', // Colômbia
  PE: 'PEN', // Peru
  UY: 'UYU', // Uruguai
  BO: 'BOB', // Bolívia
  IN: 'INR', // Índia
  KR: 'KRW', // Coreia do Sul
  SG: 'SGD', // Singapura
  HK: 'HKD', // Hong Kong
  NO: 'NOK', // Noruega
  SE: 'SEK', // Suécia
  DK: 'DKK', // Dinamarca
  NZ: 'NZD', // Nova Zelândia
  ZA: 'ZAR', // África do Sul
  TR: 'TRY', // Turquia
  RU: 'RUB', // Rússia
  PL: 'PLN', // Polônia
  CZ: 'CZK', // República Tcheca
  HU: 'HUF', // Hungria
};

const FIRST_OPEN_KEY = 'first_open_done';
const DEFAULT_FROM = 'USD';
const DEFAULT_TO = 'BRL';

/**
 * Detecta a moeda local do dispositivo via locale/região.
 * Retorna o código ISO 4217 ou 'BRL' como fallback.
 */
export function detectLocalCurrency(): string {
  try {
    const locales = Localization.getLocales();
    for (const locale of locales) {
      // Tenta pela região explícita (ex: pt-BR → BR)
      if (locale.regionCode) {
        const currency = REGION_TO_CURRENCY[locale.regionCode];
        if (currency) return currency;
      }
      // Tenta extrair região do languageTag (ex: "pt-BR" → "BR")
      const parts = locale.languageTag.split('-');
      const region = parts[parts.length - 1]?.toUpperCase();
      if (region && region.length === 2) {
        const currency = REGION_TO_CURRENCY[region];
        if (currency) return currency;
      }
    }
  } catch {
    // expo-localization falhou — usar fallback
  }
  return DEFAULT_TO;
}

/**
 * Retorna o par padrão para primeira abertura.
 * fromCurrency: USD (base universal)
 * toCurrency: moeda local detectada
 */
export function getDefaultCurrencyPair(): { from: string; to: string } {
  const localCurrency = detectLocalCurrency();
  return {
    from: DEFAULT_FROM,
    to: localCurrency === DEFAULT_FROM ? DEFAULT_TO : localCurrency,
  };
}
