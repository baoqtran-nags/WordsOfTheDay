import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WordItem, QuoteItem } from './types';
import { VOCABULARY_DATABASE } from './data/words';
import { QUOTE_DATABASE } from './data/quotes';
import { Header, FontSizeMode } from './components/Header';
import { QuoteBanner } from './components/QuoteBanner';
import { WordCard } from './components/WordCard';
import { PracticeModal } from './components/PracticeModal';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { Toast, ToastMessage } from './components/Toast';
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
      return (saved as FontSizeMode) || 'large'; // Default to large for elder comfort
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
        `Font size set to: ${next === 'xlarge' ? 'Extra Large' : next === 'large' ? 'Large (Elder-Friendly)' : 'Standard'}`,
        'info'
      );
      return next;
    });
  };

  // Save bookmarked IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wotd_saved_words', JSON.stringify(savedWordIds));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [savedWordIds]);

  // Function to randomize 5 words based on optional industry constraint
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

      // Also randomize Quote
      const randomQuote = QUOTE_DATABASE[Math.floor(Math.random() * QUOTE_DATABASE.length)];
      setCurrentQuote(randomQuote);

      setIsRefreshing(false);
      showToast('Refreshed with a new set of 5 illustrated words & idioms', 'success');
    }, 250);
  }, [showToast]);

  // Initial load
  useEffect(() => {
    const initial5 = VOCABULARY_DATABASE.slice(0, 5);
    setCurrentWords(initial5);
  }, []);

  // Handle Industry change
  const handleSelectIndustry = (industry: string) => {
    setSelectedIndustry(industry);
    setShowSavedOnly(false);
    generateNewSet(industry);
  };

  // Toggle saved word
  const handleToggleSave = (id: string) => {
    setSavedWordIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved collection', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Saved to your vocabulary notebook', 'success');
        return [...prev, id];
      }
    });
  };

  // Filter words to display on grid
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
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${fontSizeClass}`}>
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Header */}
      <Header
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Quote of the Day Banner with Illustrated Visual */}
        <QuoteBanner
          quote={currentQuote}
          onRefreshQuote={() => {
            const currentIdx = QUOTE_DATABASE.findIndex((q) => q.id === currentQuote.id);
            const nextIdx = (currentIdx + 1) % QUOTE_DATABASE.length;
            setCurrentQuote(QUOTE_DATABASE[nextIdx]);
            showToast('Loaded new illustrated thought leader quote', 'info');
          }}
        />

        {/* Section Header & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                {showSavedOnly ? 'Your Saved Collection' : 'Daily 5 Illustrated Words & Idioms'}
              </h2>
              <span className="bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-black px-3 py-1 rounded-full border border-indigo-200">
                {displayWords.length} {displayWords.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
              High-utility specialized industry English, root etymologies & executive idioms for CEFR C1-C2 mastery.
            </p>
          </div>

          {/* Search bar with large text */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search current words or roots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* 5 Vocabulary & Idioms Cards Grid with Framer Motion Entrance Animations */}
        {displayWords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center my-6 shadow-xs"
          >
            <Bookmark className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No saved words in this view
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-6">
              Click the bookmark icon on any card or switch back to the daily focus set to explore new vocabulary.
            </p>
            <button
              onClick={() => {
                setShowSavedOnly(false);
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer"
            >
              View Daily Set
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

        {/* Pedagogical Framework Section with Enlarged Accessible Type */}
        <section className="mt-12 mb-8 bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-800 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                Pedagogical Framework: Advanced Lexical Precision & Visual Mnemonics
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-5">
                Visual illustrations and Latin/Greek morphological roots activate dual-coding memory channels. Combining visual concept imagery with precise collocations enables effortless retention of advanced vocabulary (CEFR C1–C2 / IELTS 7.0–8.5).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-900 block mb-1 text-base sm:text-lg">1. Visual Metaphors</span>
                  <p className="text-slate-600">Connect abstract industry terms to clear visual cues for deeper cognitive recall.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-900 block mb-1 text-base sm:text-lg">2. Root Derivations</span>
                  <p className="text-slate-600">Expand the Etymology drawer on each card to unlock entire morphological word families.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-900 block mb-1 text-base sm:text-lg">3. Spaced Practice</span>
                  <p className="text-slate-600">Click "Practice" in the header to reinforce comprehension with active sentence quiz recall.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 bg-white py-5 text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase">
          <span>Advanced ESL Mastery Program • CEFR C1/C2 • IELTS 6.5–8.5</span>
          <span>Words of the Day • Illustrated Edition</span>
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
