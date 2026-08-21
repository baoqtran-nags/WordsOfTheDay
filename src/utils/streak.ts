import { StreakData } from '../types';

const STREAK_STORAGE_KEY = 'wotd_streak_data';

export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
};

export const loadStreakData = (): StreakData => {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) {
      const parsed: StreakData = JSON.parse(raw);
      const today = getLocalDateString();
      const yesterday = getYesterdayDateString();

      // Check if streak was broken (last completion was before yesterday)
      if (parsed.lastCompletedDate && parsed.lastCompletedDate !== today && parsed.lastCompletedDate !== yesterday) {
        // Streak is broken, reset currentStreak to 0 but keep longestStreak
        return {
          ...parsed,
          currentStreak: 0,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading streak from localStorage:', e);
  }

  // Default initial streak data
  return {
    currentStreak: 1, // Welcome user with 1 day streak
    longestStreak: 1,
    lastCompletedDate: getYesterdayDateString(), // simulate streak ready to continue today
    completedDates: [getYesterdayDateString()],
  };
};

export const saveStreakData = (data: StreakData): void => {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving streak to localStorage:', e);
  }
};

export const recordDailyCompletion = (currentData: StreakData): { updatedData: StreakData; isNewCompletionToday: boolean } => {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  if (currentData.lastCompletedDate === today) {
    // Already recorded for today
    return { updatedData: currentData, isNewCompletionToday: false };
  }

  let newCurrentStreak = 1;
  if (currentData.lastCompletedDate === yesterday) {
    newCurrentStreak = currentData.currentStreak + 1;
  }

  const newLongestStreak = Math.max(currentData.longestStreak, newCurrentStreak);
  const newCompletedDates = Array.from(new Set([...currentData.completedDates, today]));

  const updatedData: StreakData = {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastCompletedDate: today,
    completedDates: newCompletedDates,
  };

  saveStreakData(updatedData);
  return { updatedData, isNewCompletionToday: true };
};

export interface DayStatus {
  dayLabel: string; // 'M', 'T', 'W', etc.
  dateString: string;
  isToday: boolean;
  isCompleted: boolean;
}

export const getLast7DaysStatus = (completedDates: string[]): DayStatus[] => {
  const days: DayStatus[] = [];
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayLabel = dayNames[d.getDay()];

    days.push({
      dayLabel,
      dateString: dateStr,
      isToday: dateStr === todayStr,
      isCompleted: completedDates.includes(dateStr),
    });
  }

  return days;
};
