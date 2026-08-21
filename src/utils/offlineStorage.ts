import { WordItem, QuoteItem } from '../types';
import { getDailyWordsForDate, getDailyQuoteForDate } from './dailyWordGenerator';
import { getLocalDateString } from './streak';

const OFFLINE_WORDS_CACHE_PREFIX = 'wotd_offline_words_';
const OFFLINE_QUOTE_CACHE_PREFIX = 'wotd_offline_quote_';
const OFFLINE_METADATA_KEY = 'wotd_offline_sync_meta';

export interface OfflineCacheMeta {
  lastCachedDate: string;
  cachedAt: number;
  isOfflineAvailable: boolean;
  industryFilter: string;
  totalWordsInCache: number;
}

/**
 * Cache current day's word data in localStorage for offline availability
 */
export function cacheDailyWords(
  dateStr: string = getLocalDateString(),
  industry: string = 'All',
  words: WordItem[]
): void {
  try {
    const key = `${OFFLINE_WORDS_CACHE_PREFIX}${dateStr}_${industry}`;
    localStorage.setItem(key, JSON.stringify(words));

    // Also store generic current active words cache
    localStorage.setItem('wotd_current_active_words', JSON.stringify(words));

    // Update offline cache metadata
    const meta: OfflineCacheMeta = {
      lastCachedDate: dateStr,
      cachedAt: Date.now(),
      isOfflineAvailable: true,
      industryFilter: industry,
      totalWordsInCache: words.length,
    };
    localStorage.setItem(OFFLINE_METADATA_KEY, JSON.stringify(meta));
  } catch (error) {
    console.warn('Failed to cache daily words to localStorage:', error);
  }
}

/**
 * Retrieve cached daily words from localStorage, falling back to deterministic generator
 */
export function getCachedDailyWords(
  dateStr: string = getLocalDateString(),
  industry: string = 'All'
): WordItem[] {
  try {
    const key = `${OFFLINE_WORDS_CACHE_PREFIX}${dateStr}_${industry}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Try fallback to active words if matching
    const activeCached = localStorage.getItem('wotd_current_active_words');
    if (activeCached) {
      const parsed = JSON.parse(activeCached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error reading cached daily words:', error);
  }

  // Fallback to deterministic local generator (which is entirely local and offline-ready)
  const freshWords = getDailyWordsForDate(dateStr, industry);
  cacheDailyWords(dateStr, industry, freshWords);
  return freshWords;
}

/**
 * Cache current daily quote in localStorage
 */
export function cacheDailyQuote(
  dateStr: string = getLocalDateString(),
  quote: QuoteItem
): void {
  try {
    const key = `${OFFLINE_QUOTE_CACHE_PREFIX}${dateStr}`;
    localStorage.setItem(key, JSON.stringify(quote));
  } catch (error) {
    console.warn('Failed to cache daily quote:', error);
  }
}

/**
 * Retrieve cached daily quote
 */
export function getCachedDailyQuote(dateStr: string = getLocalDateString()): QuoteItem {
  try {
    const key = `${OFFLINE_QUOTE_CACHE_PREFIX}${dateStr}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Error reading cached daily quote:', error);
  }

  const freshQuote = getDailyQuoteForDate(dateStr);
  cacheDailyQuote(dateStr, freshQuote);
  return freshQuote;
}

/**
 * Get offline storage status metadata
 */
export function getOfflineCacheMeta(): OfflineCacheMeta | null {
  try {
    const raw = localStorage.getItem(OFFLINE_METADATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
