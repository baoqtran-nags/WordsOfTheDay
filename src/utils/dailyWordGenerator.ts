import { WordItem, QuoteItem } from '../types';
import { VOCABULARY_DATABASE } from '../data/words';
import { QUOTE_DATABASE } from '../data/quotes';
import { getLocalDateString } from './streak';

// Hash function to turn date string (e.g. "2026-08-19") into integer seed
export const hashDateString = (dateStr: string): number => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Seeded pseudo-random number generator (Mulberry32)
export const createSeededRandom = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Returns exactly 10 deterministic words for a given calendar day (auto updates at 12:00 AM)
 */
export const getDailyWordsForDate = (
  dateStr: string = getLocalDateString(),
  industryFilter: string = 'All'
): WordItem[] => {
  const seed = hashDateString(dateStr);
  const random = createSeededRandom(seed);

  let pool = [...VOCABULARY_DATABASE];

  if (industryFilter !== 'All') {
    const matching = pool.filter((w) => w.industry === industryFilter);
    if (matching.length >= 10) {
      pool = matching;
    } else {
      const others = pool.filter((w) => w.industry !== industryFilter);
      // Sort with seeded random
      const shuffledOthers = [...others].sort(() => random() - 0.5);
      pool = [...matching, ...shuffledOthers.slice(0, 10 - matching.length)];
    }
  }

  // Shuffle pool with seeded random
  const shuffled = [...pool].sort(() => random() - 0.5);
  return shuffled.slice(0, 10);
};

/**
 * Returns deterministic Quote of the Day for a given calendar day
 */
export const getDailyQuoteForDate = (dateStr: string = getLocalDateString()): QuoteItem => {
  const seed = hashDateString(`quote-${dateStr}`);
  const index = seed % QUOTE_DATABASE.length;
  return QUOTE_DATABASE[index] || QUOTE_DATABASE[0];
};

/**
 * Calculate milliseconds remaining until 12:00:00 AM (midnight next day)
 */
export const getMillisecondsUntilMidnight = (): number => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};
