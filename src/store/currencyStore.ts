import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRates, RatesPayload } from '@/services/api';

const FAVORITES_KEY = 'favorites_v1';

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
}

async function persistFavorites(favorites: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // non-critical
  }
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

  setFromCurrency: (code) => set({ fromCurrency: code }),

  setToCurrency: (code) => set({ toCurrency: code }),

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
}));

export function getCurrentPair(state: CurrencyState): string {
  return `${state.fromCurrency}-${state.toCurrency}`;
}
