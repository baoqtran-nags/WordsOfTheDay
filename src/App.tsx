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
import { GraduationCap, Bookmark, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentWords, setCurrentWords] = useState<WordItem[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteItem>(QUOTE_DATABASE[0]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
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

  const [savedWordIds, setSavedWordIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wotd_saved_words');
      return saved ? JSON.parse(saved) : ['w1', 'w4'];
    } catch {
      return ['w1', 'w4'];
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
        `Font size: ${next === 'xlarge' ? 'Extra Large' : next === 'large' ? 'Large (Elder-Friendly)' : 'Standard'}`,
        'info'
      );
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('wotd_saved_words', JSON.stringify(savedWordIds));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [savedWordIds]);

  const generateNewSet = useCallback((industryFilter: string = 'All') => {
    setIsRefreshing(true);

    setTimeout(() => {
      let pool = [...VOCABULARY_DATABASE];
      if (industryFilter !== 'All') {
        pool = pool.filter((w) => w.industry === industryFilter);
        if (pool.length < 5) {
          const others = VOCABULARY_DATABASE.filter((w) => w.industry !== industryFilter);
          const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
          pool = [...pool, ...shuffledOthers.slice(0, 5 - pool.length)];
        }
      }

      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);
      setCurrentWords(selected);
      setGenerationKey((k) => k + 1);

      const randomQuote = QUOTE_DATABASE[Math.floor(Math.random() * QUOTE_DATABASE.length)];
      setCurrentQuote(randomQuote);

      setIsRefreshing(false);
      showToast('Generated 5 illustrated vocabulary cards', 'success');
    }, 250);
  }, [showToast]);

  useEffect(() => {
    const initial5 = VOCABULARY_DATABASE.slice(0, 5);
    setCurrentWords(initial5);
  }, []);

  const handleSelectIndustry = (industry: string) => {
    setSelectedIndustry(industry);
    setShowSavedOnly(false);
    generateNewSet(industry);
  };

  const handleToggleSave = (id: string) => {
    setSavedWordIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved collection', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Saved to your notebook', 'success');
        return [...prev, id];
      }
    });
  };

  const displayWords = useMemo(() => {
    let list = currentWords;

    if (showSavedOnly) {
      list = VOCABULARY_DATABASE.filter((w) => savedWordIds.includes(w.id));
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
  }, [currentWords, showSavedOnly, savedWordIds, searchQuery]);

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
          
          {/* Left Column (Sticky Sidebar with Brand, Date, Quote, and Category Filters) */}
          <div className="w-full lg:w-96 xl:w-[400px] shrink-0 lg:sticky lg:top-6">
            <Sidebar
              onRefresh={() => generateNewSet(selectedIndustry)}
              isRefreshing={isRefreshing}
              selectedIndustry={selectedIndustry}
              onSelectIndustry={handleSelectIndustry}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
              onOpenPractice={() => setIsPracticeOpen(true)}
              savedCount={savedWordIds.length}
              onToggleShowSavedOnly={() => setShowSavedOnly((prev) => !prev)}
              showSavedOnly={showSavedOnly}
              activeCount={displayWords.length}
              fontSizeMode={fontSizeMode}
              onToggleFontSize={handleToggleFontSize}
              quote={currentQuote}
              onRefreshQuote={() => {
                const currentIdx = QUOTE_DATABASE.findIndex((q) => q.id === currentQuote.id);
                const nextIdx = (currentIdx + 1) % QUOTE_DATABASE.length;
                setCurrentQuote(QUOTE_DATABASE[nextIdx]);
                showToast('Next thought leader quote loaded', 'info');
              }}
            />
          </div>

          {/* Right Main Column (Clean Vertical Feed of Screen-Fitting Word Cards) */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            
            {/* Top Filter & Search Header in Main Column */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                    {showSavedOnly ? 'Saved Vocabulary Collection' : `Focus Words (${selectedIndustry})`}
                  </h2>
                  <span className="bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {displayWords.length} items
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Scroll down to view each card • Each box is fitted for effortless reading
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search word, root, definition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            {/* Word Cards Feed */}
            {displayWords.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center my-6 shadow-xs"
              >
                <Bookmark className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No vocabulary found in this filter
                </h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-6">
                  Switch back to the daily focus set or search for different terms.
                </p>
                <button
                  onClick={() => {
                    setShowSavedOnly(false);
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  View Daily Set
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
                      onToggleSave={handleToggleSave}
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
                    Pedagogical Note: Dual-Coding & Root Mnemonics
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    By combining visual metaphors on the left with Latin and Greek etymology and real executive collocations on the right, you build robust neural pathways for active IELTS 7.5+ and CEFR C1/C2 fluency.
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
          <span>Advanced ESL Mastery Program • CEFR C1/C2 • IELTS 6.5–8.5</span>
          <span>Words of the Day • Left-Column Structured Edition</span>
        </div>
      </footer>

      {/* Interactive Practice Quiz & Flashcard Modal */}
      <PracticeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        words={displayWords.length > 0 ? displayWords : VOCABULARY_DATABASE.slice(0, 5)}
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
