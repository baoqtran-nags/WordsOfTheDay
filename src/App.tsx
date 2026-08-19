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
import { Toast, ToastMessage } from './components/Toast';
import { FontSizeMode } from './components/Header';
import { loadStreakData, recordDailyCompletion } from './utils/streak';
import { triggerStreakCelebrationConfetti } from './utils/confetti';
import { loadLearnedWordsMeta, saveWordLearnedMeta, getWordsDueForReview } from './utils/reviewRetention';
import { evaluateAchievements, loadAchievements, UserStats } from './utils/achievements';
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
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentWords, setCurrentWords] = useState<WordItem[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(QUOTE_DATABASE[0]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [viewFilter, setViewFilter] = useState<'all' | 'unlearned' | 'learned' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generationKey, setGenerationKey] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
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
      // If empty on first visit, seed a few initial words so Review Mode (3+ days retention) is immediately testable
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

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ id: Date.now().toString(), text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 3500);
  }, []);

  // Keyboard shortcut listener: ESC exits Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        showToast('Đã thoát Chế độ Tập trung', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, showToast]);

  const handleToggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (next) {
        showToast('Đã bật Chế độ Tập trung (Focus Mode) • Nhấn ESC để thoát', 'success');
      } else {
        showToast('Đã thoát Chế độ Tập trung', 'info');
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
        showToast(`🏆 HUY HIỆU MỚI: Mở khóa "${badge.title}"! ${badge.description}`, 'success');
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
        `Cỡ chữ: ${next === 'xlarge' ? 'Rất lớn (Extra Large)' : next === 'large' ? 'Lớn (Elder-Friendly)' : 'Tiêu chuẩn'}`,
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
            `🔥 CHÚC MỪNG! Bạn đã hoàn thành 10 từ và đạt chuỗi ${updatedData.currentStreak} ngày liên tục!`,
            'success'
          );
        }
        return updatedData;
      });
    }
  }, [showToast]);

  // Function to randomize 10 words based on optional industry constraint
  const generateNewSet = useCallback((industryFilter: string = 'All') => {
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
      showToast('Đã tạo 10 thẻ từ vựng minh họa mới của ngày', 'success');
    }, 250);
  }, [showToast]);

  // Initial load with 10 words
  useEffect(() => {
    const initial10 = VOCABULARY_DATABASE.slice(0, 10);
    setCurrentWords(initial10);
  }, []);

  const handleSelectIndustry = (industry: string) => {
    setSelectedIndustry(industry);
    setViewFilter('all');
    generateNewSet(industry);
  };

  const handleToggleSave = (id: string) => {
    setSavedWordIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Đã xóa khỏi danh sách lưu', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Đã lưu từ vựng vào kho lưu trữ', 'success');
        return [...prev, id];
      }
    });
  };

  const handleToggleLearned = (id: string) => {
    setLearnedWordIds((prev) => {
      const exists = prev.includes(id);
      let updated: string[];
      if (exists) {
        showToast('Đã chuyển về trạng thái chưa học', 'info');
        updated = prev.filter((item) => item !== id);
        setLearnedMeta((currMeta) => saveWordLearnedMeta(id, false, currMeta));
      } else {
        const item = VOCABULARY_DATABASE.find(w => w.id === id);
        showToast(`Tuyệt vời! Đã xác nhận học xong "${item?.word || 'từ này'}"`, 'success');
        updated = [...prev, id];
        setLearnedMeta((currMeta) => saveWordLearnedMeta(id, true, currMeta));
      }

      // Check if all 10 words in current set are completed
      checkAndRecordStreak(updated, currentWords);
      return updated;
    });
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
      });
      return nextMeta;
    });

    checkAndRecordStreak(updated, currentWords);
    showToast('🎉 Xuất sắc! Đã đánh dấu hoàn thành toàn bộ 10 từ hôm nay!', 'success');
  };

  const handleResetLearnedCurrentSet = () => {
    const currentIds = currentWords.map((w) => w.id);
    setLearnedWordIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    showToast('Đã đặt lại tiến độ học của 10 từ hôm nay', 'info');
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
                Đọc tập trung không xao nhãng • Nhấn ESC để quay lại
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 mr-1">
                Tiến độ: <strong className="text-white">{learnedCountInCurrentSet}/{currentWords.length}</strong>
              </span>

              <button
                onClick={handleToggleFontSize}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Thay đổi cỡ chữ"
              >
                <Type className="w-4 h-4" />
              </button>

              <button
                id="focus-mode-exit-btn"
                onClick={handleToggleFocusMode}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-indigo-600" />
                <span>Thoát Focus Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 transition-all ${
        isFocusMode ? 'max-w-4xl' : 'max-w-7xl'
      }`}>
        <div className={`flex items-start gap-8 ${isFocusMode ? 'justify-center' : 'flex-col lg:flex-row'}`}>
          
          {/* Left Column (Sticky Sidebar) - Completely hidden in Focus Mode */}
          {!isFocusMode && (
            <div className="w-full lg:w-96 xl:w-[420px] lg:sticky lg:top-6">
              <Sidebar
                onRefresh={() => generateNewSet(selectedIndustry)}
                isRefreshing={isRefreshing}
                selectedIndustry={selectedIndustry}
                onSelectIndustry={handleSelectIndustry}
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
              />
            </div>
          )}

          {/* Right Column: Scrollable Feed of 10 Word Cards */}
          <main className={`w-full min-w-0 space-y-6 ${isFocusMode ? 'max-w-3xl mx-auto' : 'flex-1'}`}>
            
            {/* Top Toolbar & Filter Tabs */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tra cứu từ vựng, định nghĩa hoặc từ gốc Latin..."
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
                  Tất cả ({currentWords.length})
                </button>
                <button
                  onClick={() => setViewFilter('unlearned')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap cursor-pointer border-2 ${
                    viewFilter === 'unlearned'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Chưa học ({currentWords.length - learnedCountInCurrentSet})
                </button>
                <button
                  onClick={() => setViewFilter('learned')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap cursor-pointer border-2 ${
                    viewFilter === 'learned'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Đã học ({learnedCountInCurrentSet})
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
                  title="Bật/Tắt chế độ đọc tập trung (ẩn thanh bên & footer)"
                >
                  {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-700" />}
                  <span>{isFocusMode ? 'Đang Focus' : 'Focus Mode'}</span>
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
                  Không tìm thấy từ vựng phù hợp
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  Hãy thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
                </p>
                <button
                  onClick={() => {
                    setViewFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer mr-3"
                >
                  Xem Tất cả 10 từ
                </button>
                <button
                  onClick={() => setIsPracticeOpen(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Luyện tập Quiz
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
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
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pedagogical Note at Bottom (only when not in focus mode) */}
            {!isFocusMode && (
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      Phương pháp Duy trì Chuỗi Ngày & Mở Khóa Huy Hiệu (Gamified Spaced Repetition)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Hệ thống số hóa thành tích ghi nhận tiến trình học tập liên tục của bạn: từ chuỗi <strong>7-Day Streak</strong>, thành thạo <strong>100 Words Mastered</strong>, đến việc đạt điểm tuyệt đối <strong>Quiz Ace</strong>. Hãy tiếp tục duy trì việc ôn tập và học 10 từ mỗi ngày!
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
        <footer className="border-t-2 border-slate-200 bg-white py-4 text-xs text-slate-500 font-semibold tracking-wide mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase">
            <span>Advanced ESL Mastery Program • CEFR C1/C2 • IELTS 7.0–8.5</span>
            <span>Words of the Day • Focus Mode & Achievements Edition</span>
          </div>
        </footer>
      )}

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
    </div>
  );
}
