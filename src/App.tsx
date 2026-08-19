import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WordItem, QuoteItem } from './types';
import { VOCABULARY_DATABASE } from './data/words';
import { QUOTE_DATABASE } from './data/quotes';
import { Header } from './components/Header';
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
      showToast('Refreshed with a new set of 5 advanced words & idioms', 'success');
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
          w.industry.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentWords, showSavedOnly, savedWordIds, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Quote of the Day Banner */}
        <QuoteBanner
          quote={currentQuote}
          onRefreshQuote={() => {
            const currentIdx = QUOTE_DATABASE.findIndex((q) => q.id === currentQuote.id);
            const nextIdx = (currentIdx + 1) % QUOTE_DATABASE.length;
            setCurrentQuote(QUOTE_DATABASE[nextIdx]);
            showToast('Loaded new thought leader quote', 'info');
          }}
        />

        {/* Section Header & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                {showSavedOnly ? 'Your Saved Collection' : 'Daily 5 Vocabulary & Idioms'}
              </h2>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                {displayWords.length} {displayWords.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              High-utility specialized industry English & executive idioms for CEFR C1-C2 mastery.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search current words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* 5 Vocabulary & Idioms Cards Grid with Framer Motion Entrance Animations */}
        {displayWords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-12 text-center my-6 shadow-xs"
          >
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No saved words in this view
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Click the bookmark icon on any card or switch back to the daily focus set to explore new vocabulary.
            </p>
            <button
              onClick={() => {
                setShowSavedOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs"
            >
              View Daily Set
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Pedagogical Guideline / Academic Note Section */}
        <section className="mt-10 mb-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                Pedagogical Framework: Advanced Lexical Precision (CEFR C1–C2 / IELTS Band 8.0+)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                At the C1 level, vocabulary learning shifts from memorizing isolated definitions to mastering <strong>collocational agility</strong>, <strong>disciplinary nuance</strong>, and <strong>tone calibration</strong>. Using specialized idioms like <em>"paradigm shift"</em> or precision verbs like <em>"ameliorate"</em> allows you to communicate complex strategic concepts without circumlocution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-indigo-800 block mb-0.5">1. Active Collocations</span>
                  <p className="text-slate-500">Notice which prepositions and partner verbs co-occur naturally with each item.</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-indigo-800 block mb-0.5">2. Pronunciation & Stress</span>
                  <p className="text-slate-500">Use the audio playback to internalize accurate primary and secondary syllabic stress.</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-indigo-800 block mb-0.5">3. Spaced Retention</span>
                  <p className="text-slate-500">Click "Practice" above to test your recall with the interactive sentence completion quiz.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer styled according to Professional Polish design theme */}
      <footer className="border-t border-slate-200 bg-white py-4 text-[11px] text-slate-400 font-medium tracking-tight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase">
          <span>Advanced ESL Mastery Program • C1/C2 IELTS 6.5–8.0</span>
          <span>Words of the Day • Professional Industry Edition</span>
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
