import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRates, RatesPayload } from '@/services/api';
import { getDefaultCurrencyPair } from '@/utils/detectCurrency';

const FAVORITES_KEY = 'favorites_v1';
const PREFS_KEY = 'currency_prefs_v1';

interface SavedPrefs {
  fromCurrency: string;
  toCurrency: string;
}

interface CurrencyState {
  // Converter
  amount: string;
  fromCurrency: string;
  toCurrency: string;

  // Rates
  rates: Record<string, number>;
  ratesBase: string;
  updatedAt: Date | null;
  fromCache: boolean;
  loading: boolean;
  error: string | null;

  // Favorites
  favorites: string[]; // e.g. ['USD-BRL', 'EUR-BRL']
  favoritesLoaded: boolean;

  // Actions
  setAmount: (amount: string) => void;
  setFromCurrency: (code: string) => void;
  setToCurrency: (code: string) => void;
  swapCurrencies: () => void;
  fetchRates: () => Promise<void>;
  toggleFavorite: (pair: string) => void;
  loadFavorites: () => Promise<void>;
  initPrefs: () => Promise<void>;
}

async function persistFavorites(favorites: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // non-critical
  }
}

async function persistPrefs(from: string, to: string): Promise<void> {
  try {
    const prefs: SavedPrefs = { fromCurrency: from, toCurrency: to };
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  amount: '1',
  fromCurrency: 'USD',
  toCurrency: 'BRL',

  rates: {},
  ratesBase: 'USD',
  updatedAt: null,
  fromCache: false,
  loading: false,
  error: null,

  favorites: [],
  favoritesLoaded: false,

  setAmount: (amount) => set({ amount }),

  setFromCurrency: (code) => {
    set({ fromCurrency: code });
    persistPrefs(code, get().toCurrency);
  },

  setToCurrency: (code) => {
    set({ toCurrency: code });
    persistPrefs(get().fromCurrency, code);
  },

  swapCurrencies: () => {
    const { fromCurrency, toCurrency } = get();
    set({ fromCurrency: toCurrency, toCurrency: fromCurrency });
  },

  fetchRates: async () => {
    set({ loading: true, error: null });
    try {
      const payload: RatesPayload = await getRates();
      set({
        rates: payload.rates,
        ratesBase: payload.base,
        updatedAt: payload.updatedAt,
        fromCache: payload.fromCache,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Falha ao carregar cotações',
      });
    }
  },

  toggleFavorite: (pair) => {
    const { favorites } = get();
    const exists = favorites.includes(pair);
    const updated = exists
      ? favorites.filter((f) => f !== pair)
      : [...favorites, pair].slice(0, 10); // máx 10
    set({ favorites: updated });
    persistFavorites(updated);
  },

  loadFavorites: async () => {
    if (get().favoritesLoaded) return;
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        set({ favorites: parsed, favoritesLoaded: true });
      } else {
        set({ favoritesLoaded: true });
      }
    } catch {
      set({ favoritesLoaded: true });
    }
  },

  /**
   * Inicializa preferências de moeda:
   * - Se já existe prefs salvo → restaura última escolha do usuário
   * - Se primeira abertura → detecta moeda local automaticamente
   */
  initPrefs: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw) as SavedPrefs;
        set({ fromCurrency: prefs.fromCurrency, toCurrency: prefs.toCurrency });
      } else {
        // Primeira abertura: detectar moeda local
        const { from, to } = getDefaultCurrencyPair();
        set({ fromCurrency: from, toCurrency: to });
        await persistPrefs(from, to);
      }
    } catch {
      // fallback silencioso: mantém USD→BRL
    }
  },
}));

export function getCurrentPair(state: CurrencyState): string {
  return `${state.fromCurrency}-${state.toCurrency}`;
}
