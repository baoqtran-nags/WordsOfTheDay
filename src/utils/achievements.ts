import { AchievementBadge, StreakData } from '../types';

const ACHIEVEMENTS_STORAGE_KEY = 'wotd_achievements_v1';

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  learnedWordsCount: number;
  savedWordsCount: number;
  perfectQuizzesCount: number;
  reviewsCompletedCount: number;
  pronunciationsPlayedCount: number;
}

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: '7_day_streak',
    title: '7-Day Streak',
    description: 'Maintain a 10-word daily study streak for 7 consecutive days.',
    iconName: 'Flame',
    category: 'streak',
    isUnlocked: false,
    currentProgress: 0,
    maxProgress: 7,
    accentColor: 'amber',
  },
  {
    id: '100_words_mastered',
    title: '100 Words Mastered',
    description: 'Master and confirm retention of 100 advanced C1/C2 academic vocabulary items.',
    iconName: 'Trophy',
    category: 'mastery',
    isUnlocked: false,
    currentProgress: 0,
    maxProgress: 100,
    accentColor: 'indigo',
  },
  {
    id: 'quiz_ace',
    title: 'Quiz Ace',
    description: 'Achieve a perfect 100% score on any interactive fill-in quiz challenge.',
    iconName: 'Target',
    category: 'quiz',
    isUnlocked: false,
    currentProgress: 0,
    maxProgress: 1,
    accentColor: 'emerald',
  },
  {
    id: 'first_day_champ',
    title: 'First Day Champ',
    description: 'Complete all 10 words in a single day to inaugurate your daily streak.',
    iconName: 'Sparkles',
    category: 'streak',
    isUnlocked: false,
    currentProgress: 0,
    maxProgress: 1,
    accentColor: 'purple',
  },
  {
    id: 'spaced_repetition_master',
    title: 'Memory Architect',
    description: 'Complete a Spaced Repetition retention review for words learned 3+ days ago.',
    iconName: 'Brain',
    category: 'review',
    isUnlocked: false,
    currentProgress: 0,
    maxProgress: 1,
    accentColor: 'rose',
  },
  {
    id: 'vocabulary_collector',
    title: 'Vocab Collector',
    description: 'Bookmark and store 10 or more target terms in your personal glossary.',
    iconName: 'BookOpen',
    category: 'mastery',
    isUnlocked: false,
    currentProgress: 0,
    maxProgress: 10,
    accentColor: 'amber',
  },
];

/**
 * Loads unlocked achievements from localStorage
 */
export function loadAchievements(): Record<string, { isUnlocked: boolean; unlockedAt?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Evaluates all achievement badges against current user stats
 */
export function evaluateAchievements(
  stats: UserStats,
  savedUnlockedMap: Record<string, { isUnlocked: boolean; unlockedAt?: string }>
): {
  badges: AchievementBadge[];
  newlyUnlocked: AchievementBadge[];
} {
  const updatedUnlockedMap = { ...savedUnlockedMap };
  const newlyUnlocked: AchievementBadge[] = [];

  const badges: AchievementBadge[] = INITIAL_ACHIEVEMENTS.map((badge) => {
    let currentProgress = 0;
    let shouldUnlock = false;

    switch (badge.id) {
      case '7_day_streak':
        currentProgress = Math.min(stats.longestStreak || stats.currentStreak, 7);
        shouldUnlock = (stats.longestStreak >= 7) || (stats.currentStreak >= 7);
        break;

      case '100_words_mastered':
        currentProgress = Math.min(stats.learnedWordsCount, 100);
        shouldUnlock = stats.learnedWordsCount >= 100;
        break;

      case 'quiz_ace':
        currentProgress = Math.min(stats.perfectQuizzesCount, 1);
        shouldUnlock = stats.perfectQuizzesCount >= 1;
        break;

      case 'first_day_champ':
        currentProgress = Math.min(stats.currentStreak > 0 || stats.learnedWordsCount >= 10 ? 1 : 0, 1);
        shouldUnlock = stats.currentStreak > 0 || stats.learnedWordsCount >= 10;
        break;

      case 'spaced_repetition_master':
        currentProgress = Math.min(stats.reviewsCompletedCount, 1);
        shouldUnlock = stats.reviewsCompletedCount >= 1;
        break;

      case 'vocabulary_collector':
        currentProgress = Math.min(stats.savedWordsCount, 10);
        shouldUnlock = stats.savedWordsCount >= 10;
        break;

      default:
        break;
    }

    const previouslyUnlocked = !!updatedUnlockedMap[badge.id]?.isUnlocked;
    const isUnlocked = previouslyUnlocked || shouldUnlock;
    let unlockedAt = updatedUnlockedMap[badge.id]?.unlockedAt;

    if (!previouslyUnlocked && shouldUnlock) {
      unlockedAt = new Date().toISOString();
      updatedUnlockedMap[badge.id] = { isUnlocked: true, unlockedAt };
      newlyUnlocked.push({
        ...badge,
        isUnlocked: true,
        unlockedAt,
        currentProgress: badge.maxProgress,
      });
    }

    return {
      ...badge,
      isUnlocked,
      unlockedAt,
      currentProgress: isUnlocked ? badge.maxProgress : currentProgress,
    };
  });

  if (newlyUnlocked.length > 0 && typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedUnlockedMap));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  return { badges, newlyUnlocked };
}
