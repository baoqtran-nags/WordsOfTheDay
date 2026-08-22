import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WordItem, QuoteItem, StreakData, LearnedWordMeta, AchievementBadge } from './types';
import { VOCABULARY_DATABASE } from './data/words';
import { QUOTE_DATABASE } from './data/quotes';
import { Sidebar } from './components/Sidebar';
import { WordCard } from './components/WordCard';
import { PracticeModal } from './components/PracticeModal';
import { ReviewModeModal } from './components/ReviewModeModal';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { WordOfTheHour } from './components/WordOfTheHour';
import { StudyModeModal } from './components/StudyModeModal';
import { FloatingStudyButton } from './components/FloatingStudyButton';
import { DoubleStarReviewModal } from './components/DoubleStarReviewModal';
import { DailyStarReviewHubModal } from './components/DailyStarReviewHubModal';
import { IosInstallModal } from './components/IosInstallModal';
import { MobilePackagingModal } from './components/MobilePackagingModal';
import { OfflineLearningHub } from './components/OfflineLearningHub';
import { Toast, ToastMessage } from './components/Toast';
import { FontSizeMode, Header } from './components/Header';
import { loadStreakData, recordDailyCompletion, getLocalDateString } from './utils/streak';
import { triggerStreakCelebrationConfetti } from './utils/confetti';
import { loadLearnedWordsMeta, saveWordLearnedMeta, getWordsDueForReview } from './utils/reviewRetention';
import { evaluateAchievements, loadAchievements, UserStats } from './utils/achievements';
import {
  loadStarData,
  awardBaseWordStars,
  awardDoubleBonusStars,
  revokeWordStars,
  StarSystemData,
} from './utils/starSystem';
import {
  getDailyWordsForDate,
  getDailyQuoteForDate,
  getMillisecondsUntilMidnight,
} from './utils/dailyWordGenerator';
import {
  cacheDailyWords,
  getCachedDailyWords,
  cacheDailyQuote,
  getCachedDailyQuote,
  getOfflineGenerationsRemaining,
  recordOfflineGenerationUsed,
} from './utils/offlineStorage';
import {
  GraduationCap,
  Bookmark,
  Search,
  Award,
  ListFilter,
  Flame,
  Brain,
  Trophy,
  Maximize2,
  Minimize2,
  Eye,
  Type,
  BookOpen,
  Sparkles,
  Play,
  Calendar,
  Layers,
  Shuffle,
  WifiOff,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => getLocalDateString());
  const [currentWords, setCurrentWords] = useState<WordItem[]>(() =>
    getCachedDailyWords(getLocalDateString(), 'All')
  );
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(() =>
    getCachedDailyQuote(getLocalDateString())
  );
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineGenerationsRemaining, setOfflineGenerationsRemaining] = useState<number>(() =>
    getOfflineGenerationsRemaining(
      typeof navigator !== 'undefined' ? navigator.onLine : true,
      getLocalDateString()
    )
  );

  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [viewFilter, setViewFilter] = useState<'all' | 'unlearned' | 'learned' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generationKey, setGenerationKey] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isStudyModeOpen, setIsStudyModeOpen] = useState<boolean>(false);

  const [fontSizeMode, setFontSizeMode] = useState<FontSizeMode>(() => {
    try {
      const saved = localStorage.getItem('wotd_font_size');
      return (saved as FontSizeMode) || 'large';
    } catch {
      return 'large';
    }
  });

  // Daily Streak Data stored in localStorage
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());

  // Saved bookmark IDs
  const [savedWordIds, setSavedWordIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wotd_saved_words');
      return saved ? JSON.parse(saved) : ['w1', 'w4'];
    } catch {
      return ['w1', 'w4'];
    }
  });

  // Learned word IDs (Xác nhận đã học)
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wotd_learned_words');
      return saved ? JSON.parse(saved) : ['w1', 'w2', 'w3', 'w4', 'w5'];
    } catch {
      return ['w1', 'w2', 'w3', 'w4', 'w5'];
    }
  });

  // Learned words spaced repetition metadata (date learned, review history)
  const [learnedMeta, setLearnedMeta] = useState<Record<string, LearnedWordMeta>>(() =>
    loadLearnedWordsMeta(learnedWordIds)
  );

  // Additional stats for achievement tracking
  const [perfectQuizzesCount, setPerfectQuizzesCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('wotd_stat_perfect_quizzes');
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [reviewsCompletedCount, setReviewsCompletedCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('wotd_stat_reviews_count');
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [unlockedMap, setUnlockedMap] = useState<Record<string, { isUnlocked: boolean; unlockedAt?: string }>>(() =>
    loadAchievements()
  );

  // Star Points and 2x Multiplier System (12:00 AM - 11:59 PM Daily)
  const [starData, setStarData] = useState<StarSystemData>(() => loadStarData());
  const [activeDoubleReviewWord, setActiveDoubleReviewWord] = useState<WordItem | null>(null);
  const [isDailyStarHubOpen, setIsDailyStarHubOpen] = useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isIosInstallOpen, setIsIosInstallOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ id: Date.now().toString(), text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 3500);
  }, []);

  // 12:00 AM (Midnight) Automatic Daily Word Update Routine
  const handleMidnightRefresh = useCallback((newDateStr: string) => {
    setCurrentDateStr(newDateStr);
    const newDailyWords = getDailyWordsForDate(newDateStr, selectedIndustry);
    const newDailyQuote = getDailyQuoteForDate(newDateStr);

    setCurrentWords(newDailyWords);
    setCurrentQuote(newDailyQuote);
    setGenerationKey((k) => k + 1);

    // Refresh streak data & star points to reflect new day
    setStreakData(loadStreakData());
    setStarData(loadStarData());

    showToast(
      `✨ 12:00 AM: Automatically updated today's 10 vocabulary words (${newDateStr})! Star counter reset for the new day.`,
      'success'
    );
  }, [selectedIndustry, showToast]);

  useEffect(() => {
    // 1. One-shot timeout right at 12:00:00 AM
    const msUntilMidnight = getMillisecondsUntilMidnight();
    const midnightTimer = setTimeout(() => {
      const nextDate = getLocalDateString();
      handleMidnightRefresh(nextDate);
    }, msUntilMidnight);

    // 2. Periodic check every 30 seconds in case device was sleeping
    const checkInterval = setInterval(() => {
      const nowStr = getLocalDateString();
      if (nowStr !== currentDateStr) {
        handleMidnightRefresh(nowStr);
      }
    }, 30000);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(checkInterval);
    };
  }, [currentDateStr, handleMidnightRefresh]);

  // Network connectivity listener for offline mode
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineGenerationsRemaining(Infinity);
      showToast('🟢 Đã kết nối Internet: Tính năng đổi bộ từ và đồng bộ đã mở lại bình thường.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      const rem = getOfflineGenerationsRemaining(false, currentDateStr);
      setOfflineGenerationsRemaining(rem);
      showToast('⚡ Chế độ Ngoại tuyến: 10 từ hôm nay & các chế độ học đã sẵn sàng.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentDateStr, showToast]);

  // Synchronize active 10 daily words with localStorage cache
  useEffect(() => {
    if (currentWords.length > 0) {
      cacheDailyWords(currentDateStr, selectedIndustry, currentWords);
    }
  }, [currentDateStr, selectedIndustry, currentWords]);

  // Synchronize daily quote with localStorage cache
  useEffect(() => {
    if (currentQuote) {
      cacheDailyQuote(currentDateStr, currentQuote);
    }
  }, [currentDateStr, currentQuote]);

  // Keyboard shortcut listener: ESC exits Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        showToast('Exited Focus Mode', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, showToast]);

  const handleToggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (next) {
        showToast('Focus Mode enabled • Press ESC to exit', 'success');
      } else {
        showToast('Exited Focus Mode', 'info');
      }
      return next;
    });
  };

  // Compute words due for spaced repetition review (learned ≥ 3 days ago)
  const wordsDueForReview = useMemo(() => {
    return getWordsDueForReview(learnedWordIds, learnedMeta, VOCABULARY_DATABASE, 3);
  }, [learnedWordIds, learnedMeta]);

  // Compute User Achievements
  const userStats: UserStats = useMemo(() => ({
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    learnedWordsCount: learnedWordIds.length,
    savedWordsCount: savedWordIds.length,
    perfectQuizzesCount,
    reviewsCompletedCount,
    pronunciationsPlayedCount: 10,
  }), [streakData, learnedWordIds.length, savedWordIds.length, perfectQuizzesCount, reviewsCompletedCount]);

  const { badges, newlyUnlocked } = useMemo(() => {
    return evaluateAchievements(userStats, unlockedMap);
  }, [userStats, unlockedMap]);

  // Trigger celebration upon unlocking any new badge
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((badge) => {
        showToast(`🏆 NEW BADGE: Unlocked "${badge.title}"! ${badge.description}`, 'success');
      });
      triggerStreakCelebrationConfetti();
      setUnlockedMap((prev) => {
        const next = { ...prev };
        newlyUnlocked.forEach((b) => {
          next[b.id] = { isUnlocked: true, unlockedAt: b.unlockedAt };
        });
        return next;
      });
    }
  }, [newlyUnlocked, showToast]);

  const handleToggleFontSize = () => {
    setFontSizeMode((prev) => {
      const next: FontSizeMode = prev === 'standard' ? 'large' : prev === 'large' ? 'xlarge' : 'standard';
      try {
        localStorage.setItem('wotd_font_size', next);
      } catch (e) {}
      showToast(
        `Font size: ${next === 'xlarge' ? 'Extra Large' : next === 'large' ? 'Large (Elder-Friendly)' : 'Standard'}`,
        'info'
      );
      return next;
    });
  };

  // Persist Saved IDs
  useEffect(() => {
    try {
      localStorage.setItem('wotd_saved_words', JSON.stringify(savedWordIds));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [savedWordIds]);

  // Persist Learned IDs
  useEffect(() => {
    try {
      localStorage.setItem('wotd_learned_words', JSON.stringify(learnedWordIds));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [learnedWordIds]);

  // Check and trigger Streak completion when all 10 words in current set are learned
  const checkAndRecordStreak = useCallback((currentLearnedIds: string[], wordsInSet: WordItem[]) => {
    if (wordsInSet.length === 0) return;
    const allSetLearned = wordsInSet.every((w) => currentLearnedIds.includes(w.id));

    if (allSetLearned) {
      triggerStreakCelebrationConfetti();
      setStreakData((prev) => {
        const { updatedData, isNewCompletionToday } = recordDailyCompletion(prev);
        if (isNewCompletionToday) {
          showToast(
            `🔥 CONGRATULATIONS! You completed all 10 words and reached a ${updatedData.currentStreak}-day streak!`,
            'success'
          );
        }
        return updatedData;
      });
    }
  }, [showToast]);

  // Function to randomize 10 words based on optional industry constraint
  const generateNewSet = useCallback((industryFilter: string = 'All') => {
    if (!isOnline) {
      const remaining = getOfflineGenerationsRemaining(false, currentDateStr);
      if (remaining <= 0) {
        showToast('⚠️ Bạn đã sử dụng hết 01 lần đổi bộ từ khi ngoại tuyến. Kết nối lại Internet để mở lại tính năng này.', 'error');
        return;
      }
      // Record offline generation usage
      recordOfflineGenerationUsed(currentDateStr);
      setOfflineGenerationsRemaining(0);
    }

    setIsRefreshing(true);

    setTimeout(() => {
      let pool = [...VOCABULARY_DATABASE];
      if (industryFilter !== 'All') {
        const matching = pool.filter((w) => w.industry === industryFilter);
        if (matching.length >= 10) {
          pool = matching;
        } else {
          const others = VOCABULARY_DATABASE.filter((w) => w.industry !== industryFilter);
          const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
          pool = [...matching, ...shuffledOthers.slice(0, 10 - matching.length)];
        }
      }

      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);
      setCurrentWords(selected);
      setGenerationKey((k) => k + 1);

      const randomQuote = QUOTE_DATABASE[Math.floor(Math.random() * QUOTE_DATABASE.length)];
      setCurrentQuote(randomQuote);

      setIsRefreshing(false);
      if (!isOnline) {
        showToast('⚡ Đã đổi bộ từ ngoại tuyến thành công (Đã dùng 1/1 lần offline)!', 'success');
      } else {
        showToast('Generated 10 new illustrated vocabulary cards for today', 'success');
      }
    }, 250);
  }, [isOnline, currentDateStr, showToast]);

  const handleSelectIndustry = (industry: string) => {
    setSelectedIndustry(industry);
    setViewFilter('all');
    generateNewSet(industry);
  };

  const handleShuffleCurrentSet = () => {
    if (currentWords.length <= 1) return;
    setCurrentWords((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setGenerationKey((k) => k + 1);
    showToast('🔀 Shuffled current 10-word order', 'info');
  };

  const handleToggleSave = (id: string) => {
    setSavedWordIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved vocabulary', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Saved word to personal glossary', 'success');
        return [...prev, id];
      }
    });
  };

  const handleToggleLearned = (id: string) => {
    setLearnedWordIds((prev) => {
      const exists = prev.includes(id);
      let updated: string[];
      if (exists) {
        showToast('Marked as unlearned', 'info');
        updated = prev.filter((item) => item !== id);
        setLearnedMeta((currMeta) => saveWordLearnedMeta(id, false, currMeta));
        // Revoke stars if previously awarded
        revokeWordStars(id);
        setStarData(loadStarData());
      } else {
        const item = VOCABULARY_DATABASE.find(w => w.id === id);
        showToast(`Mastered "${item?.word || 'this word'}"! (+10 ⭐ Stars Earned)`, 'success');
        updated = [...prev, id];
        setLearnedMeta((currMeta) => saveWordLearnedMeta(id, true, currMeta));
        
        // Award base +10 stars
        const updatedStarData = awardBaseWordStars(id);
        setStarData(updatedStarData.data);

        // Prompt voluntary Double Star review challenge (12:00 AM - 11:59 PM)
        if (item) {
          setActiveDoubleReviewWord(item);
        }
      }

      // Check if all 10 words in current set are completed
      checkAndRecordStreak(updated, currentWords);
      return updated;
    });
  };

  const handleCompleteDoubleStar = (wordId: string) => {
    const updated = awardDoubleBonusStars(wordId);
    setStarData(updated.data);
    triggerStreakCelebrationConfetti();
    showToast('🎉 2X MULTIPLIER UNLOCKED! +20 Stars Added to Today’s Total! ⭐⭐', 'success');
  };

  const handleMarkAllLearned = () => {
    const currentIds = currentWords.map((w) => w.id);
    const updated = Array.from(new Set([...learnedWordIds, ...currentIds]));
    setLearnedWordIds(updated);

    // Update meta for all
    setLearnedMeta((currMeta) => {
      let nextMeta = { ...currMeta };
      currentIds.forEach((id) => {
        nextMeta = saveWordLearnedMeta(id, true, nextMeta);
        awardBaseWordStars(id);
      });
      return nextMeta;
    });

    setStarData(loadStarData());
    checkAndRecordStreak(updated, currentWords);
    showToast('🎉 Excellent! Marked all 10 words as mastered today (+100 ⭐ base stars)!', 'success');
  };

  const handleResetLearnedCurrentSet = () => {
    const currentIds = currentWords.map((w) => w.id);
    setLearnedWordIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    currentIds.forEach((id) => revokeWordStars(id));
    setStarData(loadStarData());
    showToast("Reset today's 10-word learning progress & stars", 'info');
  };

  const handleQuizComplete = (score: number, total: number) => {
    if (score === total && total > 0) {
      setPerfectQuizzesCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem('wotd_stat_perfect_quizzes', next.toString());
        } catch {}
        return next;
      });
    }
  };

  const handleReviewComplete = (score: number, total: number) => {
    setReviewsCompletedCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('wotd_stat_reviews_count', next.toString());
      } catch {}
      return next;
    });
    if (score === total && total > 0) {
      setPerfectQuizzesCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem('wotd_stat_perfect_quizzes', next.toString());
        } catch {}
        return next;
      });
    }
  };

  // Filtered words to display on feed
  const displayWords = useMemo(() => {
    let list = currentWords;

    if (viewFilter === 'saved') {
      list = VOCABULARY_DATABASE.filter((w) => savedWordIds.includes(w.id));
    } else if (viewFilter === 'learned') {
      list = currentWords.filter((w) => learnedWordIds.includes(w.id));
    } else if (viewFilter === 'unlearned') {
      list = currentWords.filter((w) => !learnedWordIds.includes(w.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          (w.etymology && w.etymology.toLowerCase().includes(q)) ||
          w.industry.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentWords, viewFilter, savedWordIds, learnedWordIds, searchQuery]);

  const learnedCountInCurrentSet = useMemo(() => {
    return currentWords.filter((w) => learnedWordIds.includes(w.id)).length;
  }, [currentWords, learnedWordIds]);

  const fontSizeClass =
    fontSizeMode === 'xlarge'
      ? 'text-lg sm:text-xl'
      : fontSizeMode === 'large'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${fontSizeClass}`}>
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Persistent Word of the Hour Micro-Learning Header Widget (Always Visible) */}
      <WordOfTheHour
        vocabularyDb={VOCABULARY_DATABASE}
        onShowToast={showToast}
      />

      {/* Minimalist Focus Mode Banner (Shown when Focus Mode is Active) */}
      {isFocusMode && (
        <div className="bg-indigo-950 text-white border-b-2 border-indigo-800 py-3 px-4 sticky top-0 z-40 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-xs">
                <Eye className="w-3.5 h-3.5" />
                Focus Mode Active
              </span>
              <span className="text-xs sm:text-sm text-indigo-200 font-semibold hidden sm:inline">
                Distraction-free reading • Press ESC to exit
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 mr-1">
                Progress: <strong className="text-white">{learnedCountInCurrentSet}/{currentWords.length}</strong>
              </span>

              <button
                onClick={handleToggleFontSize}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Change font size"
              >
                <Type className="w-4 h-4" />
              </button>

              <button
                id="focus-mode-exit-btn"
                onClick={handleToggleFocusMode}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-indigo-600" />
                <span>Exit Focus Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area - Snug mobile padding */}
      <div className={`w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 transition-all ${
        isFocusMode ? 'max-w-4xl' : 'max-w-7xl'
      }`}>
        <div className={`flex items-start gap-6 lg:gap-8 ${isFocusMode ? 'justify-center' : 'flex-col lg:flex-row'}`}>
          
          {/* Left Column (Sticky Sidebar) - Completely hidden in Focus Mode */}
          {!isFocusMode && (
            <div className="w-full lg:w-96 xl:w-[420px] lg:sticky lg:top-6">
              <Sidebar
                onRefresh={() => generateNewSet(selectedIndustry)}
                isRefreshing={isRefreshing}
                selectedIndustry={selectedIndustry}
                onSelectIndustry={handleSelectIndustry}
                onOpenStudyMode={() => setIsStudyModeOpen(true)}
                onOpenGlossary={() => setIsGlossaryOpen(true)}
                onOpenPractice={() => setIsPracticeOpen(true)}
                onOpenReview={() => setIsReviewOpen(true)}
                wordsDueForReviewCount={wordsDueForReview.length}
                savedCount={savedWordIds.length}
                onToggleShowSavedOnly={() => setViewFilter((curr) => (curr === 'saved' ? 'all' : 'saved'))}
                showSavedOnly={viewFilter === 'saved'}
                activeCount={displayWords.length}
                fontSizeMode={fontSizeMode}
                onToggleFontSize={handleToggleFontSize}
                quote={currentQuote}
                onRefreshQuote={() => {
                  const randomQuote = QUOTE_DATABASE[Math.floor(Math.random() * QUOTE_DATABASE.length)];
                  setCurrentQuote(randomQuote);
                }}
                learnedCountInCurrentSet={learnedCountInCurrentSet}
                totalCurrentWordsCount={currentWords.length}
                onMarkAllLearned={handleMarkAllLearned}
                onResetLearnedCurrentSet={handleResetLearnedCurrentSet}
                streakData={streakData}
                badges={badges}
                learnedMeta={learnedMeta}
                todayStars={starData.todayStars}
                totalStars={starData.totalStars}
                onOpenStarReviewHub={() => setIsDailyStarHubOpen(true)}
                isOnline={isOnline}
                offlineGenerationsRemaining={offlineGenerationsRemaining}
                onOpenIosInstall={() => setIsIosInstallOpen(true)}
              />
            </div>
          )}

          {/* Right Column: Scrollable Feed of 10 Word Cards */}
          <main className={`w-full min-w-0 space-y-4 sm:space-y-6 ${isFocusMode ? 'max-w-3xl mx-auto' : 'flex-1'}`}>
            
            {/* Dedicated Offline Learning Hub & Controls */}
            <OfflineLearningHub
              isOnline={isOnline}
              totalWords={currentWords.length}
              learnedCount={learnedCountInCurrentSet}
              offlineGenerationsRemaining={offlineGenerationsRemaining}
              onRefresh={() => generateNewSet(selectedIndustry)}
              isRefreshing={isRefreshing}
              onOpenStudyMode={() => setIsStudyModeOpen(true)}
              onOpenPractice={() => setIsPracticeOpen(true)}
              dateStr={currentDateStr}
            />

            {/* PRIMARY "START STUDYING" HERO BANNER (Distraction-Free 2-Page Mobile/Desktop Flashcard Experience) */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border-2 border-indigo-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/50 shrink-0">
                  <BookOpen className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/50 text-indigo-200 border border-indigo-400/40">
                      Mobile-Optimized Study Mode
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                    Study Today's 10 Words (2-Page Mobile Format)
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                    Each card fits cleanly into 2 pages: <strong>Page 1: Word & Definition</strong> • <strong>Page 2: 3 IELTS Examples</strong>
                  </p>
                </div>
              </div>

              <button
                id="hero-start-study-btn"
                onClick={() => setIsStudyModeOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Start Study Mode</span>
              </button>
            </div>

            {/* Top Toolbar & Filter Tabs */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vocabulary, definition, etymology, or industry..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Filter Tabs & Focus Mode Trigger */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setViewFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap cursor-pointer border-2 ${
                    viewFilter === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All ({currentWords.length})
                </button>
                <button
                  onClick={() => setViewFilter('unlearned')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap cursor-pointer border-2 ${
                    viewFilter === 'unlearned'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Unlearned ({currentWords.length - learnedCountInCurrentSet})
                </button>
                <button
                  onClick={() => setViewFilter('learned')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap cursor-pointer border-2 ${
                    viewFilter === 'learned'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Mastered ({learnedCountInCurrentSet})
                </button>

                {/* Shuffle Button */}
                <button
                  id="shuffle-current-set-btn"
                  onClick={handleShuffleCurrentSet}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer border-2 bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100 flex items-center gap-1.5 shadow-2xs active:scale-95"
                  title="Re-randomize the order of the current 10-word set"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Shuffle</span>
                </button>

                {/* Focus Mode Toggle Button */}
                <button
                  id="focus-mode-toggle-btn"
                  onClick={handleToggleFocusMode}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer border-2 flex items-center gap-1.5 shadow-2xs ${
                    isFocusMode
                      ? 'bg-indigo-950 text-amber-300 border-indigo-900'
                      : 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100'
                  }`}
                  title="Toggle distraction-free focus mode"
                >
                  {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-700" />}
                  <span>{isFocusMode ? 'Focusing' : 'Focus'}</span>
                </button>
              </div>

            </div>

            {/* List of 10 Word Cards */}
            {displayWords.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center shadow-xs"
              >
                <Award className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  No matching vocabulary found
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  Try clearing your search query or switching status filters.
                </p>
                <button
                  onClick={() => {
                    setViewFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer mr-3"
                >
                  View All 10 Words
                </button>
                <button
                  onClick={() => setIsPracticeOpen(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Practice Quiz
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence mode="popLayout">
                  {displayWords.map((item, index) => (
                    <WordCard
                      key={`${generationKey}-${item.id}`}
                      item={item}
                      index={index}
                      isSaved={savedWordIds.includes(item.id)}
                      isLearned={learnedWordIds.includes(item.id)}
                      onToggleSave={handleToggleSave}
                      onToggleLearned={handleToggleLearned}
                      onShowToast={showToast}
                      totalWordsInSet={displayWords.length}
                      starRecord={starData.wordRecords[item.id]}
                      onOpenDoubleReview={(word) => setActiveDoubleReviewWord(word)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pedagogical Note at Bottom (only when not in focus mode) */}
            {!isFocusMode && (
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      Automated Daily Vocabulary Rotation (12:00 AM Reset)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Every day at <strong>12:00 AM (00:00:00)</strong>, the system automatically cycles to 10 new advanced C1/C2 academic vocabulary items and a daily thought leadership quote, helping you maintain consistent daily progress seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* Footer (Hidden in Focus Mode) */}
      {!isFocusMode && (
        <footer className="border-t-2 border-slate-200 bg-white py-4 text-xs text-slate-500 font-semibold tracking-wide mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase">
            <span>Advanced ESL Mastery Program • CEFR C1/C2 • IELTS 7.0–8.5</span>
            <span>Words of the Day • 12:00 AM Auto-Refresh Edition</span>
          </div>
        </footer>
      )}

      {/* Floating Back to Study Mode Action Button (appears on scroll down) */}
      <FloatingStudyButton
        onOpenStudyMode={() => setIsStudyModeOpen(true)}
        learnedCount={learnedCountInCurrentSet}
        totalWords={currentWords.length}
        isStudyModeOpen={isStudyModeOpen}
      />

      {/* DEDICATED MOBILE & DESKTOP 2-PAGE STUDY MODE MODAL */}
      <StudyModeModal
        isOpen={isStudyModeOpen}
        onClose={() => setIsStudyModeOpen(false)}
        words={currentWords}
        learnedWordIds={learnedWordIds}
        savedWordIds={savedWordIds}
        onToggleLearned={handleToggleLearned}
        onToggleSave={handleToggleSave}
        onShowToast={showToast}
        starData={starData}
        onOpenDoubleReview={(word) => setActiveDoubleReviewWord(word)}
      />

      {/* Voluntary Double Star Review Modal for individual words */}
      <DoubleStarReviewModal
        isOpen={activeDoubleReviewWord !== null}
        onClose={() => setActiveDoubleReviewWord(null)}
        targetWord={activeDoubleReviewWord}
        onCompleteDouble={handleCompleteDoubleStar}
        todayStars={starData.todayStars}
        totalStars={starData.totalStars}
      />

      {/* Daily Star Points & Voluntary Batch Review Hub Modal */}
      <DailyStarReviewHubModal
        isOpen={isDailyStarHubOpen}
        onClose={() => setIsDailyStarHubOpen(false)}
        starData={starData}
        learnedWords={VOCABULARY_DATABASE.filter((w) => learnedWordIds.includes(w.id))}
        onOpenSingleWordReview={(word) => setActiveDoubleReviewWord(word)}
        onCompleteDouble={handleCompleteDoubleStar}
      />

      {/* Interactive Practice Quiz & Flashcard Modal */}
      <PracticeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        words={displayWords.length > 0 ? displayWords : currentWords}
        onQuizComplete={handleQuizComplete}
      />

      {/* Spaced Repetition Review Mode Modal (Words learned 3+ days ago) */}
      <ReviewModeModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        candidates={wordsDueForReview}
        vocabularyDb={VOCABULARY_DATABASE}
        onShowToast={showToast}
        onReviewComplete={handleReviewComplete}
      />

      {/* Full Glossary & Explorer Drawer */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        savedIds={savedWordIds}
        onToggleSave={handleToggleSave}
      />

      {/* Mobile Packaging & Install Modal (Android APK + iOS PWA/IPA) */}
      <MobilePackagingModal
        isOpen={isIosInstallOpen}
        onClose={() => setIsIosInstallOpen(false)}
      />
    </div>
  );
}
