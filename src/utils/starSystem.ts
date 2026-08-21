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

    const parsed: StarSystemData = JSON.parse(raw);
    
    // Check if the saved date is today
    if (parsed.todayDate !== todayKey) {
      // Calculate today's stars from records that were awarded today (if any)
      let todayCount = 0;
      let reviewsToday = 0;
      Object.values(parsed.wordRecords || {}).forEach((rec) => {
        if (rec.awardedDate === todayKey) {
          todayCount += rec.baseStars + rec.bonusStars;
        }
        if (rec.reviewedAt?.startsWith(todayKey)) {
          reviewsToday += 1;
        }
      });

      const updated: StarSystemData = {
        ...parsed,
        todayDate: todayKey,
        todayStars: todayCount,
        dailyReviewsCompleted: reviewsToday,
      };
      saveStarData(updated);
      return updated;
    }

    return parsed;
  } catch (e) {
    console.error('Error loading star points data:', e);
    return defaultData;
  }
};

export const saveStarData = (data: StarSystemData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
