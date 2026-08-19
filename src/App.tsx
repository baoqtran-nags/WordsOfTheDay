import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WordItem, QuoteItem } from './types';
import { VOCABULARY_DATABASE } from './data/words';
import { QUOTE_DATABASE } from './data/quotes';
import { Sidebar } from './components/Sidebar';
import { WordCard } from './components/WordCard';
import { PracticeModal } from './components/PracticeModal';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { Toast, ToastMessage } from './components/Toast';
import { FontSizeMode } from './components/Header';
import { GraduationCap, Bookmark, Search, CheckCircle2, Award, ListFilter } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentWords, setCurrentWords] = useState<WordItem[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(QUOTE_DATABASE[0]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [viewFilter, setViewFilter] = useState<'all' | 'unlearned' | 'learned' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generationKey, setGenerationKey] = useState<number>(0);
  const [fontSizeMode, setFontSizeMode] = useState<FontSizeMode>(() => {
    try {
      const saved = localStorage.getItem('wotd_font_size');
      return (saved as FontSizeMode) || 'large';
    } catch {
      return 'large';
    }
  });

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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ id: Date.now().toString(), text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 3000);
  }, []);

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
          // If fewer than 10 in specific category, prioritize them and pad with other diverse items
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
        showToast('Đã lưu vào sổ tay từ vựng', 'success');
        return [...prev, id];
      }
    });
  };

  const handleToggleLearned = (id: string) => {
    setLearnedWordIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Đã chuyển về trạng thái chưa học', 'info');
        return prev.filter((item) => item !== id);
      } else {
        const item = VOCABULARY_DATABASE.find(w => w.id === id);
        showToast(`Tuyệt vời! Đã xác nhận học xong "${item?.word || 'từ này'}"`, 'success');
        return [...prev, id];
      }
    });
  };

  const handleMarkAllLearned = () => {
    const currentIds = currentWords.map((w) => w.id);
    setLearnedWordIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    showToast('🎉 Xuất sắc! Đã đánh dấu hoàn thành toàn bộ 10 từ hôm nay!', 'success');
  };

  const handleResetLearnedCurrentSet = () => {
    const currentIds = currentWords.map((w) => w.id);
    setLearnedWordIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    showToast('Đã đặt lại tiến độ học của 10 từ hôm nay', 'info');
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

      {/* Main Two-Column Master Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column (Sticky Sidebar with Brand, Date, Progress Tracker, Quote, and Category Filters) */}
          <div className="w-full lg:w-96 xl:w-[400px] shrink-0 lg:sticky lg:top-6">
            <Sidebar
              onRefresh={() => generateNewSet(selectedIndustry)}
              isRefreshing={isRefreshing}
              selectedIndustry={selectedIndustry}
              onSelectIndustry={handleSelectIndustry}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
              onOpenPractice={() => setIsPracticeOpen(true)}
              savedCount={savedWordIds.length}
              onToggleShowSavedOnly={() => setViewFilter(viewFilter === 'saved' ? 'all' : 'saved')}
              showSavedOnly={viewFilter === 'saved'}
              activeCount={displayWords.length}
              fontSizeMode={fontSizeMode}
              onToggleFontSize={handleToggleFontSize}
              quote={currentQuote}
              onRefreshQuote={() => {
                const currentIdx = QUOTE_DATABASE.findIndex((q) => q.id === currentQuote.id);
                const nextIdx = (currentIdx + 1) % QUOTE_DATABASE.length;
                setCurrentQuote(QUOTE_DATABASE[nextIdx]);
                showToast('Đã đổi câu danh ngôn tiếp theo', 'info');
              }}
              learnedCountInCurrentSet={learnedCountInCurrentSet}
              totalCurrentWordsCount={currentWords.length}
              onMarkAllLearned={handleMarkAllLearned}
              onResetLearnedCurrentSet={handleResetLearnedCurrentSet}
            />
          </div>

          {/* Right Main Column (Clean Vertical Feed of Screen-Fitting Word Cards) */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            
            {/* Top Filter & Search Header in Main Column */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                      {viewFilter === 'saved'
                        ? 'Từ vựng đã lưu'
                        : viewFilter === 'learned'
                        ? 'Từ đã học hôm nay'
                        : viewFilter === 'unlearned'
                        ? 'Từ cần học tiếp'
                        : `Bộ 10 Từ Của Ngày (${selectedIndustry})`}
                    </h2>
                    <span className="bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {displayWords.length} thẻ
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Đã hoàn thành {learnedCountInCurrentSet}/{currentWords.length} từ • Cuộn lên/xuống để học từng thẻ
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm từ, căn gốc, nghĩa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* Learning View Filter Tabs */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                  <ListFilter className="w-3.5 h-3.5" />
                  Hiển thị:
                </span>

                <button
                  onClick={() => setViewFilter('all')}
                  className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold transition-all border-2 cursor-pointer ${
                    viewFilter === 'all'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Tất cả 10 từ ({currentWords.length})
                </button>

                <button
                  onClick={() => setViewFilter('unlearned')}
                  className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold transition-all border-2 cursor-pointer ${
                    viewFilter === 'unlearned'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Chưa thuộc ({currentWords.length - learnedCountInCurrentSet})
                </button>

                <button
                  onClick={() => setViewFilter('learned')}
                  className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold transition-all border-2 cursor-pointer ${
                    viewFilter === 'learned'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ✓ Đã học ({learnedCountInCurrentSet})
                </button>

                <button
                  onClick={() => setViewFilter('saved')}
                  className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold transition-all border-2 cursor-pointer ${
                    viewFilter === 'saved'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Đã lưu ({savedWordIds.length})
                </button>
              </div>
            </div>

            {/* Word Cards Feed */}
            {displayWords.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center my-6 shadow-xs"
              >
                <Award className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {viewFilter === 'unlearned'
                    ? '🎉 Tuyệt vời! Bạn đã học thuộc tất cả 10 từ của ngày hôm nay!'
                    : 'Không có từ nào trong bộ lọc này'}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-6">
                  {viewFilter === 'unlearned'
                    ? 'Bạn có thể làm bài tập Practice để kiểm tra trí nhớ hoặc Tạo 10 từ mới.'
                    : 'Hãy chuyển về xem Tất cả 10 từ hoặc chọn danh mục khác.'}
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
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pedagogical Note at Bottom */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                    Phương pháp Dual-Coding & Căn nguyên La-tinh/Hy Lạp
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Học 10 từ vựng học thuật C1/C2 mỗi ngày kèm hình ảnh minh họa và căn nguyên từ vựng giúp kích hoạt kênh ghi nhớ kép. Sau khi học xong, nhấn nút <strong>"Xác nhận đã học"</strong> trên mỗi thẻ hoặc làm bài trắc nghiệm <strong>Practice</strong> để củng cố trí nhớ dài hạn.
                  </p>
                </div>
              </div>
            </div>

          </main>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 bg-white py-4 text-xs text-slate-500 font-semibold tracking-wide mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase">
          <span>Advanced ESL Mastery Program • CEFR C1/C2 • IELTS 7.0–8.5</span>
          <span>Words of the Day • 10 Daily Words Edition</span>
        </div>
      </footer>

      {/* Interactive Practice Quiz & Flashcard Modal */}
      <PracticeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        words={displayWords.length > 0 ? displayWords : currentWords}
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
