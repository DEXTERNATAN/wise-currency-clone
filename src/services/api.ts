import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_RATES, MOCK_UPDATED_AT } from './mockRates';

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const USE_MOCK = true; // flip to false when Firebase Functions are ready

export interface RatesPayload {
  base: string;
  rates: Record<string, number>;
  updatedAt: Date;
  fromCache: boolean;
}

interface CacheEntry {
  base: string;
  rates: Record<string, number>;
  savedAt: number;
}

async function readCache(): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

async function writeCache(base: string, rates: Record<string, number>): Promise<void> {
  try {
    const entry: CacheEntry = { base, rates, savedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // non-critical — ignore
  }
}

function isCacheExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.savedAt > CACHE_TTL_MS;
}

async function fetchFromMock(): Promise<RatesPayload> {
  // Simulate tiny async delay for realistic UX
  await new Promise((r) => setTimeout(r, 300));
  return {
    base: 'USD',
    rates: MOCK_RATES,
    updatedAt: MOCK_UPDATED_AT,
    fromCache: false,
  };
}

async function fetchFromFirebase(): Promise<RatesPayload> {
  // TODO (Issue #10): replace with real Firebase Function URL
  const url = process.env['EXPO_PUBLIC_FIREBASE_FUNCTION_URL'];
  if (!url) throw new Error('EXPO_PUBLIC_FIREBASE_FUNCTION_URL not set');

  const res = await fetch(`${url}/getRates`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { base: string; rates: Record<string, number> };
  return {
    base: data.base,
    rates: data.rates,
    updatedAt: new Date(),
    fromCache: false,
  };
}

/**
 * Main entry point for exchange rate fetching.
 * Cache-first: returns stale data immediately, refreshes in background when expired.
 */
export async function getRates(): Promise<RatesPayload> {
  const cached = await readCache();

  if (cached && !isCacheExpired(cached)) {
    return {
      base: cached.base,
      rates: cached.rates,
      updatedAt: new Date(cached.savedAt),
      fromCache: true,
    };
  }

  try {
    const fresh = USE_MOCK ? await fetchFromMock() : await fetchFromFirebase();
    await writeCache(fresh.base, fresh.rates);
    return fresh;
  } catch (err) {
    if (cached) {
      // Stale cache is better than nothing
      return {
        base: cached.base,
        rates: cached.rates,
        updatedAt: new Date(cached.savedAt),
        fromCache: true,
      };
    }
    throw err;
  }
}

export async function clearRatesCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
