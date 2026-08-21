import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import {
  X,
  Volume2,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  History,
  Tag,
  Copy,
  Check,
  RefreshCw,
  Award,
  ArrowRight,
  ArrowLeft,
  Eye,
  Star,
  Zap,
} from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { getThreeContextAwareExamples, fetchAlternativeAcademicScenarios, ContextScenario } from '../utils/academicExamples';
import { triggerStreakCelebrationConfetti } from '../utils/confetti';
import { StarSystemData } from '../utils/starSystem';
import { motion, AnimatePresence } from 'motion/react';

interface StudyModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
  learnedWordIds: string[];
  savedWordIds: string[];
  onToggleLearned: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShowToast: (text: string, type: 'success' | 'info' | 'error') => void;
  starData?: StarSystemData;
  onOpenDoubleReview?: (word: WordItem) => void;
}

export const StudyModeModal: React.FC<StudyModeModalProps> = ({
  isOpen,
  onClose,
  words,
  learnedWordIds,
  savedWordIds,
  onToggleLearned,
  onToggleSave,
  onShowToast,
  starData,
  onOpenDoubleReview,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'word' | 'examples'>('word');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right'>('right');
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Touch swipe gesture tracking
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);

  const goToTab = (tab: 'word' | 'examples') => {
    if (tab === activeTab) return;
    setSwipeDirection(tab === 'examples' ? 'left' : 'right');
    setActiveTab(tab);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Detect horizontal swipe gesture:
    // 1. Min horizontal distance of 40px
    // 2. Horizontal movement exceeds vertical movement (to allow normal scrolling)
    // 3. Gesture completed within 700ms
    if (Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 700) {
      if (deltaX < 0) {
        // Swiped Left (finger moved left) -> navigate forward to Examples page
        if (activeTab === 'word') {
          goToTab('examples');
        }
      } else {
        // Swiped Right (finger moved right) -> navigate back to Word page
        if (activeTab === 'examples') {
          goToTab('word');
        }
      }
    }
  };

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab('word');
      setSwipeDirection('right');
      setIsPlayingWord(false);
      setPlayingSentenceIndex(null);
      setImgError(false);
    }
  }, [isOpen]);

  const currentWord = words[currentIndex] || words[0];
  const isLearned = currentWord ? learnedWordIds.includes(currentWord.id) : false;
  const isSaved = currentWord ? savedWordIds.includes(currentWord.id) : false;

  const standardScenarios = currentWord ? getThreeContextAwareExamples(currentWord) : [];
  const alternativeScenarios = currentWord ? fetchAlternativeAcademicScenarios(currentWord) : [];
  const currentScenarios: ContextScenario[] = isAlternativeMode ? alternativeScenarios : standardScenarios;

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < words.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setActiveTab('word');
          setSwipeDirection('right');
          setImgError(false);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setActiveTab('word');
          setSwipeDirection('right');
          setImgError(false);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        goToTab(activeTab === 'word' ? 'examples' : 'word');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, words.length, onClose]);

  if (!isOpen || !currentWord) return null;

  const handleListenWord = () => {
    if (isPlayingWord) return;
    setIsPlayingWord(true);
    playPronunciation(currentWord.word, {
      rate: 0.85,
      pitch: 1.0,
      accent: 'US',
      onStart: () => setIsPlayingWord(true),
      onEnd: () => setIsPlayingWord(false),
      onError: () => {
        setIsPlayingWord(false);
        onShowToast('Web Speech API: Voice not supported', 'info');
      },
    });
  };

  const handleListenSentence = (sentence: string, sentenceIdx: number) => {
    if (playingSentenceIndex === sentenceIdx) return;
    setPlayingSentenceIndex(sentenceIdx);
    playPronunciation(sentence, {
      rate: 0.9,
      pitch: 1.0,
      accent: 'US',
      onStart: () => setPlayingSentenceIndex(sentenceIdx),
      onEnd: () => setPlayingSentenceIndex(null),
      onError: () => {
        setPlayingSentenceIndex(null);
        onShowToast('Unable to pronounce this sentence', 'info');
      },
    });
  };

  const handleCopyWord = () => {
    const text = `${currentWord.word} (${currentWord.ipa})\n${currentWord.definition}\n${currentWord.etymology ? `Etymology: ${currentWord.etymology}` : ''}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    onShowToast(`Copied "${currentWord.word}"`, 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setActiveTab('word');
      setSwipeDirection('right');
      setImgError(false);
    } else {
      triggerStreakCelebrationConfetti();
      onShowToast('🎉 You completed all 10 words for today!', 'success');
      onClose();
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActiveTab('word');
      setSwipeDirection('right');
      setImgError(false);
    }
  };

  const renderHighlightedSentence = (sentence: string, target: string) => {
    const searchRoot = target.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const regex = new RegExp(`(${target}|${searchRoot}[a-z]*)`, 'gi');
    const parts = sentence.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          if (part.toLowerCase().includes(searchRoot.toLowerCase()) || part.toLowerCase() === target.toLowerCase()) {
            return (
              <span
                key={i}
                className="font-extrabold text-indigo-950 underline decoration-indigo-500 underline-offset-4 bg-indigo-50 px-1 py-0.5 rounded"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Main Mobile-Fit Container (100dvh on mobile, clean modal on desktop) */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border-2 border-slate-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
              Study Mode • Card {currentIndex + 1}/{words.length}
            </span>
            
            {/* Star Points Status Pill */}
            {isLearned ? (
              starData?.wordRecords[currentWord.id]?.isDoubled ? (
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-950 bg-amber-400 border border-amber-500 px-2.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                  20 ⭐ (2x Boosted)
                </span>
              ) : onOpenDoubleReview ? (
                <button
                  onClick={() => onOpenDoubleReview(currentWord)}
                  className="inline-flex items-center gap-1 text-xs font-black text-amber-950 bg-amber-300 hover:bg-amber-400 px-2.5 py-0.5 rounded-full transition-all cursor-pointer animate-pulse"
                  title="Voluntary Review: Double to 20 Stars (12:00 AM - 11:59 PM)"
                >
                  <Zap className="w-3 h-3 fill-amber-900" />
                  10 ⭐ (Double x2)
                </button>
              ) : (
                <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full">
                  10 ⭐
                </span>
              )
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                +10 Stars
              </span>
            )}

            {isLearned && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-black text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Learned
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pronunciation audio button */}
            <button
              onClick={handleListenWord}
              disabled={isPlayingWord}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPlayingWord
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-300'
              }`}
              title="Pronounce word (Web Speech API)"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingWord ? 'animate-bounce' : ''}`} />
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleSave(currentWord.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isSaved ? 'Saved' : 'Save word'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close Study Mode (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar under header */}
        <div className="w-full bg-slate-800 h-1.5 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        {/* Two-Page Tab Switcher: [Page 1: Word & Meaning] vs [Page 2: 3 Academic Examples] */}
        <div className="bg-slate-100 p-2 sm:px-6 flex items-center gap-2 border-b border-slate-200 shrink-0">
          <button
            onClick={() => goToTab('word')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'word'
                ? 'bg-white text-indigo-950 shadow-sm border-2 border-indigo-200'
                : 'text-slate-600 hover:bg-slate-200/70 border-2 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Page 1: Word & Definition</span>
          </button>

          <button
            onClick={() => goToTab('examples')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'examples'
                ? 'bg-white text-indigo-950 shadow-sm border-2 border-indigo-200'
                : 'text-slate-600 hover:bg-slate-200/70 border-2 border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Page 2: 3 Academic Examples</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-black">
              3
            </span>
          </button>
        </div>

        {/* Mobile Touch Swipe Indicator Pill Bar */}
        <div className="sm:hidden px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500 select-none">
          {activeTab === 'word' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="text-slate-700 font-black">1/2: Word</span>
              </div>
              <button
                onClick={() => goToTab('examples')}
                className="flex items-center gap-1 text-indigo-600 font-extrabold hover:text-indigo-800 cursor-pointer"
              >
                <span>Swipe left for 3 Examples</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => goToTab('word')}
                className="flex items-center gap-1 text-indigo-600 font-extrabold hover:text-indigo-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Swipe right for Word</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span className="text-slate-700 font-black">2/2: Examples</span>
              </div>
            </>
          )}
        </div>

        {/* Scrollable / Fit Content Body with Horizontal Touch-Swipe Listeners */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-pan-y"
        >
          <AnimatePresence mode="wait" custom={swipeDirection}>
            {activeTab === 'word' ? (
              /* TAB 1: Word, Phonetics, Illustration, Definition, Latin/Greek Roots */
              <motion.div
                key={`word-${currentWord.id}`}
                custom={swipeDirection}
                initial={{ opacity: 0, x: swipeDirection === 'left' ? -25 : 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: swipeDirection === 'left' ? 25 : -25 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Word Title & Pronunciation Box */}
                <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                      {currentWord.word}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base sm:text-lg font-mono font-bold text-indigo-700">
                        {currentWord.ipa}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">🔊 US English</span>
                    </div>
                  </div>

                  <button
                    onClick={handleListenWord}
                    className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Categorization Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300">
                    {currentWord.industry}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-300">
                    {currentWord.type}
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {currentWord.level} (IELTS 7.5–8.5)
                  </span>
                </div>

                {/* Definition Box - Placed directly under the word & badges */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Definition & Strategic Meaning
                  </span>
                  <p className="text-base sm:text-lg text-slate-900 font-semibold leading-relaxed">
                    {currentWord.definition}
                  </p>
                </div>

                {/* Etymology / Morphological Roots */}
                {currentWord.etymology && (
                  <div className="bg-amber-50/70 rounded-2xl border-2 border-amber-200 p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider mb-1.5">
                      <History className="w-4 h-4 text-amber-700" />
                      <span>Latin / Greek Etymology & Morphology:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                      {currentWord.etymology}
                    </p>
                  </div>
                )}

                {/* Illustration Image - Positioned at the bottom below definition */}
                {currentWord.imageUrl && !imgError && (
                  <div className="relative w-full h-36 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-xs group">
                    <img
                      src={currentWord.imageUrl}
                      alt={currentWord.word}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-amber-200 text-xs font-bold line-clamp-1 drop-shadow-md">
                      {currentWord.imageCaption || `Metaphor: ${currentWord.word}`}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* TAB 2: 3 Academic Examples & Collocations */
              <motion.div
                key={`examples-${currentWord.id}`}
                custom={swipeDirection}
                initial={{ opacity: 0, x: swipeDirection === 'left' ? 25 : -25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: swipeDirection === 'left' ? -25 : 25 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Header of examples tab */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                      3 Academic Examples (IELTS Band 8.0–9.0):
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsAlternativeMode((prev) => !prev);
                      onShowToast(
                        !isAlternativeMode ? 'Switched to 3 new advanced examples' : 'Returned to standard examples',
                        'info'
                      );
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isAlternativeMode ? 'Standard' : 'Alternative'}</span>
                  </button>
                </div>

                {/* 3 Context Examples */}
                <div className="space-y-3">
                  {currentScenarios.map((scenario, sIdx) => {
                    const isThisPlaying = playingSentenceIndex === sIdx;
                    return (
                      <div
                        key={sIdx}
                        className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${scenario.badgeColor}`}>
                              {scenario.badge}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              {scenario.category}
                            </span>
                          </div>

                          <button
                            onClick={() => handleListenSentence(scenario.sentence, sIdx)}
                            disabled={isThisPlaying}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isThisPlaying
                                ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 scale-105'
                                : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border-slate-200'
                            }`}
                            title="Listen to this sentence"
                          >
                            <Volume2 className={`w-4 h-4 ${isThisPlaying ? 'animate-bounce' : ''}`} />
                          </button>
                        </div>

                        <p className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
                          “{renderHighlightedSentence(scenario.sentence, currentWord.word)}”
                        </p>

                        {scenario.syntacticNote && (
                          <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                            💡 <span className="font-semibold text-slate-700">Band 8.5+ Feature:</span>{' '}
                            {scenario.syntacticNote}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Collocations */}
                {currentWord.collocations && currentWord.collocations.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <span>Academic Collocations:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentWord.collocations.map((col, idx) => (
                        <span
                          key={idx}
                          className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-slate-900 border border-slate-300 shadow-2xs"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation & Action Controls Bar (Always fixed at bottom on mobile) */}
        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:py-4 border-t-2 border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {/* Previous Button */}
          <button
            onClick={handlePrevWord}
            disabled={currentIndex === 0}
            className="py-2.5 px-3 sm:px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Mark as Learned Toggle Button */}
          <button
            onClick={() => onToggleLearned(currentWord.id)}
            className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
              isLearned
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'text-white' : 'text-emerald-700'}`} />
            <span>{isLearned ? '✓ Learned' : 'Mark as Learned'}</span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextWord}
            className="py-2.5 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer transition-colors shadow-sm active:scale-98"
          >
            <span className="hidden sm:inline">
              {currentIndex === words.length - 1 ? 'Finish' : 'Next'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
