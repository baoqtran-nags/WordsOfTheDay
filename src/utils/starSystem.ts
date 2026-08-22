// Star & Daily Learning Points System
// Rewards 10 Base Stars per learned word
// Offers a 2x Multiplier (+10 Bonus Stars = 20 Total) upon taking the voluntary Daily Review Challenge (12:00 AM - 11:59 PM)

export interface WordStarRecord {
  baseStars: number;
  bonusStars: number;
  isDoubled: boolean;
  awardedDate: string; // "YYYY-MM-DD"
  reviewedAt?: string;
}

export interface StarSystemData {
  totalStars: number;
  todayStars: number;
  todayDate: string; // "YYYY-MM-DD"
  wordRecords: Record<string, WordStarRecord>; // wordId -> Record
  dailyReviewsCompleted: number;
}

const STORAGE_KEY = 'wotd_star_points_v2';

export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const loadStarData = (): StarSystemData => {
  const todayKey = getTodayDateKey();
  const defaultData: StarSystemData = {
    totalStars: 0,
    todayStars: 0,
    todayDate: todayKey,
    wordRecords: {},
    dailyReviewsCompleted: 0,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;

    let parsed: any = JSON.parse(raw);
    
    // Auto-unwrap if stored as { data: StarSystemData, starsAdded: ... }
    if (parsed && parsed.data && typeof parsed.data === 'object') {
      parsed = parsed.data;
    }

    const totalStars = typeof parsed.totalStars === 'number' ? parsed.totalStars : 0;
    const todayDate = typeof parsed.todayDate === 'string' ? parsed.todayDate : todayKey;
    const wordRecords = parsed.wordRecords && typeof parsed.wordRecords === 'object' ? parsed.wordRecords : {};
    let todayStars = typeof parsed.todayStars === 'number' ? parsed.todayStars : 0;
    let dailyReviewsCompleted = typeof parsed.dailyReviewsCompleted === 'number' ? parsed.dailyReviewsCompleted : 0;

    // Check if the saved date is today
    if (todayDate !== todayKey) {
      // Recalculate today's stars from records that were awarded today (if any)
      todayStars = 0;
      dailyReviewsCompleted = 0;
      Object.values(wordRecords).forEach((rec: any) => {
        if (rec && rec.awardedDate === todayKey) {
          todayStars += (rec.baseStars || 0) + (rec.bonusStars || 0);
        }
        if (rec && typeof rec.reviewedAt === 'string' && rec.reviewedAt.startsWith(todayKey)) {
          dailyReviewsCompleted += 1;
        }
      });

      const updated: StarSystemData = {
        totalStars,
        todayStars,
        todayDate: todayKey,
        wordRecords,
        dailyReviewsCompleted,
      };
      saveStarData(updated);
      return updated;
    }

    return {
      totalStars,
      todayStars,
      todayDate,
      wordRecords,
      dailyReviewsCompleted,
    };
  } catch (e) {
    console.error('Error loading star points data:', e);
    return defaultData;
  }
};

export const saveStarData = (data: StarSystemData): void => {
  try {
    // Ensure clean sanitized format before writing
    const sanitized: StarSystemData = {
      totalStars: typeof data.totalStars === 'number' ? data.totalStars : 0,
      todayStars: typeof data.todayStars === 'number' ? data.todayStars : 0,
      todayDate: data.todayDate || getTodayDateKey(),
      wordRecords: data.wordRecords && typeof data.wordRecords === 'object' ? data.wordRecords : {},
      dailyReviewsCompleted: typeof data.dailyReviewsCompleted === 'number' ? data.dailyReviewsCompleted : 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving star points data:', e);
  }
};

/**
 * Award base stars (+10) when a word is marked as learned.
 * If word was already awarded base stars, returns without duplicating.
 */
export const awardBaseWordStars = (wordId: string): { data: StarSystemData; starsAdded: number; isFirstTime: boolean } => {
  const current = loadStarData();
  const todayKey = getTodayDateKey();
  const existing = current.wordRecords[wordId];

  if (existing && existing.baseStars > 0) {
    return { data: current, starsAdded: 0, isFirstTime: false };
  }

  const BASE_REWARD = 10;
  const newRecord: WordStarRecord = {
    baseStars: BASE_REWARD,
    bonusStars: 0,
    isDoubled: false,
    awardedDate: todayKey,
  };

  const nextRecords = {
    ...current.wordRecords,
    [wordId]: newRecord,
  };

  const updated: StarSystemData = {
    ...current,
    todayDate: todayKey,
    totalStars: current.totalStars + BASE_REWARD,
    todayStars: current.todayStars + BASE_REWARD,
    wordRecords: nextRecords,
  };

  saveStarData(updated);
  return { data: updated, starsAdded: BASE_REWARD, isFirstTime: true };
};

/**
 * Award double stars (+10 extra bonus stars = 20 total) when user finishes review challenge.
 */
export const awardDoubleBonusStars = (wordId: string): { data: StarSystemData; bonusAdded: number; success: boolean } => {
  const current = loadStarData();
  const todayKey = getTodayDateKey();
  const record = current.wordRecords[wordId];

  // If already doubled, do not add duplicate bonus
  if (record && record.isDoubled) {
    return { data: current, bonusAdded: 0, success: false };
  }

  const BONUS_REWARD = 10;
  const nowIso = new Date().toISOString();

  const updatedRecord: WordStarRecord = {
    baseStars: record ? record.baseStars : 10,
    bonusStars: BONUS_REWARD,
    isDoubled: true,
    awardedDate: record ? record.awardedDate : todayKey,
    reviewedAt: nowIso,
  };

  const nextRecords = {
    ...current.wordRecords,
    [wordId]: updatedRecord,
  };

  // If word had no base record before, total added is base (10) + bonus (10) = 20
  const pointsDelta = record ? BONUS_REWARD : 20;

  const updated: StarSystemData = {
    ...current,
    todayDate: todayKey,
    totalStars: current.totalStars + pointsDelta,
    todayStars: current.todayStars + pointsDelta,
    dailyReviewsCompleted: current.dailyReviewsCompleted + 1,
    wordRecords: nextRecords,
  };

  saveStarData(updated);
  return { data: updated, bonusAdded: pointsDelta, success: true };
};

/**
 * Revoke stars if user unmarks a word as learned
 */
export const revokeWordStars = (wordId: string): StarSystemData => {
  const current = loadStarData();
  const record = current.wordRecords[wordId];

  if (!record) return current;

  const pointsLost = record.baseStars + record.bonusStars;
  const todayKey = getTodayDateKey();

  const nextRecords = { ...current.wordRecords };
  delete nextRecords[wordId];

  const updated: StarSystemData = {
    ...current,
    totalStars: Math.max(0, current.totalStars - pointsLost),
    todayStars: record.awardedDate === todayKey ? Math.max(0, current.todayStars - pointsLost) : current.todayStars,
    wordRecords: nextRecords,
  };

  saveStarData(updated);
  return updated;
};

/**
 * Helper to check if current time is within daily review hours (12:00 AM - 11:59 PM = all day)
 */
export const isWithinDailyReviewHours = (): { isOpen: boolean; timeRangeLabel: string } => {
  // Available from 00:00:00 to 23:59:59 (24/7 daily window)
  return {
    isOpen: true,
    timeRangeLabel: '12:00 AM – 11:59 PM (All Day)',
  };
};
