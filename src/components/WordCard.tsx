import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Copy, Check, Bookmark, Tag, ChevronDown, ChevronUp, History, CheckCircle2, Sparkles, RefreshCw, GraduationCap, Building2, MessageSquare, BookOpen, Star, Zap } from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { getThreeContextAwareExamples, fetchAlternativeAcademicScenarios, ContextScenario } from '../utils/academicExamples';
import { WordStarRecord } from '../utils/starSystem';
import { motion, AnimatePresence } from 'motion/react';

interface WordCardProps {
  item: WordItem;
  index: number;
  isSaved: boolean;
  isLearned: boolean;
  onToggleSave: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onShowToast: (text: string, type: 'success' | 'info' | 'error') => void;
  totalWordsInSet?: number;
  starRecord?: WordStarRecord;
  onOpenDoubleReview?: (word: WordItem) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  item,
  index,
  isSaved,
  isLearned,
  onToggleSave,
  onToggleLearned,
  onShowToast,
  totalWordsInSet = 10,
  starRecord,
  onOpenDoubleReview,
}) => {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isEtymologyOpen, setIsEtymologyOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Dynamic context-aware academic scenarios
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);
  const [isFetchingAlt, setIsFetchingAlt] = useState(false);

  const standardScenarios = getThreeContextAwareExamples(item);
  const alternativeScenarios = fetchAlternativeAcademicScenarios(item);
  const currentScenarios: ContextScenario[] = isAlternativeMode ? alternativeScenarios : standardScenarios;

  // Pronounce word using Web Speech API
  const handleListenWord = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlayingWord) return;

    setIsPlayingWord(true);
    const success = playPronunciation(
      item.word,
      {
        rate: 0.85,
        pitch: 1.0,
        accent: 'US',
        onStart: () => setIsPlayingWord(true),
        onEnd: () => setIsPlayingWord(false),
        onError: () => {
          setIsPlayingWord(false);
          onShowToast('Web Speech API: Voice not supported in this browser', 'info');
        }
      }
    );

    if (!success) {
      setIsPlayingWord(false);
      onShowToast('Web Speech API is not supported in this browser environment', 'info');
    }
  };

  // Pronounce individual context sentence
  const handleListenSentence = (sentence: string, sentenceIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingSentenceIndex === sentenceIdx) return;

    setPlayingSentenceIndex(sentenceIdx);
    const success = playPronunciation(
      sentence,
      {
        rate: 0.90, // Natural cadence for academic speech
        pitch: 1.0,
        accent: 'US',
        onStart: () => setPlayingSentenceIndex(sentenceIdx),
        onEnd: () => setPlayingSentenceIndex(null),
        onError: () => {
          setPlayingSentenceIndex(null);
          onShowToast('Unable to pronounce this sentence', 'info');
        }
      }
    );

    if (!success) setPlayingSentenceIndex(null);
  };

  const handleToggleAltExamples = () => {
    setIsFetchingAlt(true);
    setTimeout(() => {
      setIsAlternativeMode((prev) => !prev);
      setIsFetchingAlt(false);
      onShowToast(
        !isAlternativeMode ? 'Loaded 3 new advanced academic examples (Band 8.5+)' : 'Returned to standard examples',
        'info'
      );
    }, 200);
  };

  const handleCopy = () => {
    const etymText = item.etymology ? `\nEtymology: ${item.etymology}` : '';
    const examplesText = currentScenarios
      .map((s, i) => `${i + 1}. [${s.badge}] ${s.sentence}`)
      .join('\n');

    const formatted = `${item.word} (${item.ipa})\nType: ${item.type} | Industry: ${item.industry} | Level: ${item.level}\nDefinition: ${item.definition}${etymText}\n\nAcademic Context Examples (IELTS C1/C2 Standards):\n${examplesText}`;
    
    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    onShowToast(`Copied word and 3 academic examples for "${item.word}"!`, 'success');
    setTimeout(() => setIsCopied(false), 2000);
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
              <span key={i} className="font-extrabold text-indigo-950 underline decoration-indigo-500 underline-offset-4 bg-indigo-50 px-1 py-0.5 rounded">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const getThemeByIndustry = (industry: string) => {
    switch (industry) {
      case 'Corporate Law & Governance':
        return {
          borderTop: 'border-t-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          typeText: 'text-emerald-800',
          etymBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          etymLabel: 'text-emerald-900',
        };
      case 'FinTech & Banking':
        return {
          borderTop: 'border-t-blue-600',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          typeText: 'text-blue-800',
          etymBg: 'bg-blue-50 border-blue-200 text-blue-950',
          etymLabel: 'text-blue-900',
        };
      case 'Tech & Data Science':
        return {
          borderTop: 'border-t-cyan-600',
          badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
          typeText: 'text-cyan-800',
          etymBg: 'bg-cyan-50 border-cyan-200 text-cyan-950',
          etymLabel: 'text-cyan-900',
        };
      case 'Marketing & Growth':
        return {
          borderTop: 'border-t-purple-600',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          typeText: 'text-purple-800',
          etymBg: 'bg-purple-50 border-purple-200 text-purple-950',
          etymLabel: 'text-purple-900',
        };
      case 'Medicine & BioTech':
        return {
          borderTop: 'border-t-rose-600',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          typeText: 'text-rose-800',
          etymBg: 'bg-rose-50 border-rose-200 text-rose-950',
          etymLabel: 'text-rose-900',
        };
      case 'Leadership & Negotiation':
        return {
          borderTop: 'border-t-amber-600',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          typeText: 'text-amber-800',
          etymBg: 'bg-amber-50 border-amber-200 text-amber-950',
          etymLabel: 'text-amber-900',
        };
      case 'Sustainability & ESG':
        return {
          borderTop: 'border-t-teal-600',
          badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
          typeText: 'text-teal-800',
          etymBg: 'bg-teal-50 border-teal-200 text-teal-950',
          etymLabel: 'text-teal-900',
        };
      default:
        return {
          borderTop: 'border-t-indigo-600',
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          typeText: 'text-indigo-800',
          etymBg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
          etymLabel: 'text-indigo-900',
        };
    }
  };

  const theme = getThemeByIndustry(item.industry);

  return (
    <motion.article
      id={`word-card-${item.id}`}
      layout="position"
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.05, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`snap-start scroll-mt-3 sm:scroll-mt-6 rounded-2xl border-2 shadow-md border-t-6 sm:border-t-8 ${theme.borderTop} p-4 sm:p-6 md:p-7 flex flex-col md:flex-row gap-4 sm:gap-6 hover:shadow-xl transition-all w-full relative overflow-hidden ${
        isLearned
          ? 'bg-emerald-50/40 border-emerald-300'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Mobile Index & Learned Indicator Bar */}
      <div className="flex items-center justify-between gap-2 md:hidden pb-1 border-b border-slate-100 flex-wrap">
        <span className="text-[11px] font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
          Card {index + 1} / {totalWordsInSet}
        </span>

        {isLearned ? (
          <div className="flex items-center gap-1.5">
            {starRecord?.isDoubled ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-950 bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                20 ⭐ (2x)
              </span>
            ) : onOpenDoubleReview ? (
              <button
                onClick={() => onOpenDoubleReview(item)}
                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-950 bg-amber-300 hover:bg-amber-400 border border-amber-400 px-2 py-0.5 rounded-full transition-all cursor-pointer animate-pulse"
                title="Voluntary Review: Double to 20 Stars (12:00 AM - 11:59 PM)"
              >
                <Zap className="w-3 h-3 fill-amber-900" />
                10 ⭐ (Double x2)
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                10 ⭐
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Learned
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            +10 Stars
          </span>
        )}
      </div>

      {/* Desktop Top Right Badges: Learned & Star Multiplier */}
      <div className="hidden md:flex absolute top-4 right-4 z-10 items-center gap-2">
        {isLearned && (
          <>
            {starRecord?.isDoubled ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black shadow-xs border border-amber-500">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>20 STARS (2X BOOSTED)</span>
              </div>
            ) : onOpenDoubleReview ? (
              <button
                onClick={() => onOpenDoubleReview(item)}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-full text-xs font-black shadow-xs border border-amber-500 cursor-pointer transition-all active:scale-95 animate-pulse"
                title="Voluntary Review: Double to 20 Stars (12:00 AM - 11:59 PM)"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>10 ⭐ • DOUBLE TO 20 ⭐ (REVIEW)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-950 rounded-full text-xs font-bold border border-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>10 STARS</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LEARNED</span>
            </div>
          </>
        )}
      </div>

      {/* Left Column: Visual Illustration & Core Identity */}
      <div className="w-full md:w-5/12 lg:w-4/12 shrink-0 flex flex-col justify-between">
        <div>
          {/* Word Heading + Speaker Pronunciation Button */}
          <div className="flex items-center justify-between gap-2">
            <h3 
              onClick={() => handleListenWord()}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] hover:text-indigo-600 transition-colors cursor-pointer break-words"
              title="Click to hear word pronunciation (Web Speech API)"
            >
              {item.word}
            </h3>

            {/* Main Speaker Pronunciation Button (Min touch target 44px on mobile) */}
            <button
              id={`btn-listen-${item.id}`}
              onClick={handleListenWord}
              disabled={isPlayingWord}
              aria-label={`Listen to pronunciation of ${item.word}`}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all border cursor-pointer shrink-0 flex items-center justify-center ${
                isPlayingWord
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-105'
                  : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 hover:shadow-xs active:scale-95'
              }`}
              title="Listen to pronunciation (Web Speech API)"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingWord ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Phonetics IPA with Click-to-Listen */}
          <div 
            onClick={() => handleListenWord()}
            className="flex items-center gap-1.5 text-sm sm:text-base font-mono text-slate-600 font-bold mt-0.5 sm:mt-1 cursor-pointer hover:text-indigo-600 transition-colors group"
            title="Click to listen to IPA pronunciation"
          >
            <span>{item.ipa}</span>
            <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 font-sans font-semibold">🔊 US</span>
          </div>

          {/* Chips & Tags - With nowrap to prevent tag breakage */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 mb-3 flex-wrap">
            <span className={`text-[11px] sm:text-xs font-black uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border whitespace-nowrap ${theme.badgeBg}`}>
              {item.industry}
            </span>
            <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${theme.typeText}`}>
              {item.type}
            </span>
            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 whitespace-nowrap">
              {item.level}
            </span>
          </div>

          {/* Illustration Container - Placed below word & identity */}
          {item.imageUrl && !imgError && (
            <div className="relative w-full h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 group/img shadow-2xs">
              <img
                src={item.imageUrl}
                alt={item.word}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2.5 right-2.5 text-amber-200 text-[11px] sm:text-xs font-bold line-clamp-1 drop-shadow-md">
                {item.imageCaption || `Metaphor: ${item.word}`}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Mark as Learned + Save + Copy (44px min touch target) */}
        <div className="flex flex-col gap-2 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/80">
          
          {/* Primary "Mark as Learned" Button */}
          <button
            id={`btn-learned-${item.id}`}
            onClick={() => onToggleLearned(item.id)}
            className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 ${
              isLearned
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
            }`}
            title={isLearned ? 'Unmark as learned' : 'Mark word as learned'}
          >
            <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'text-white' : 'text-emerald-700'}`} />
            <span>{isLearned ? '✓ Learned' : 'Mark as Learned'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id={`btn-save-${item.id}`}
              onClick={() => onToggleSave(item.id)}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 ${
                isSaved
                  ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              id={`btn-copy-${item.id}`}
              onClick={handleCopy}
              className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer active:scale-98"
              title="Copy Word Details & 3 IELTS Examples"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Definition, Roots, 3 Context-Aware Academic Examples & Collocations */}
      <div className="flex-1 flex flex-col justify-between border-t-2 md:border-t-0 md:border-l-2 border-slate-200/70 pt-3 sm:pt-4 md:pt-0 md:pl-6">
        <div>
          {/* Definition */}
          <div className="mb-3">
            <span className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
              Definition & Strategic Meaning
            </span>
            <p className="text-base sm:text-lg md:text-xl text-slate-900 font-semibold leading-relaxed">
              {item.definition}
            </p>
          </div>

          {/* Etymology Section */}
          {item.etymology && (
            <div className="mb-3">
              <button
                id={`btn-etymology-${item.id}`}
                onClick={() => setIsEtymologyOpen(!isEtymologyOpen)}
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-700 transition-colors py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 cursor-pointer min-h-[40px]"
              >
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Etymology & Roots (Latin / Greek)</span>
                </div>
                {isEtymologyOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isEtymologyOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-2 p-3 sm:p-3.5 rounded-xl border-2 text-xs sm:text-sm md:text-base leading-relaxed ${theme.etymBg}`}>
                      <span className={`font-black text-[11px] sm:text-xs uppercase tracking-wider block mb-1 ${theme.etymLabel}`}>
                        Morphological Origin & Root Breakdown:
                      </span>
                      <p className="text-slate-900 font-normal leading-relaxed">
                        {item.etymology}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 3 Context-Aware Academic Examples (IELTS C1/C2 Academic Standards) */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border-2 border-slate-200 space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80 flex-wrap">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">
                  3 Academic Examples (Band 8.0+):
                </span>
              </div>

              {/* Dynamic Context Fetcher Button */}
              <button
                onClick={handleToggleAltExamples}
                disabled={isFetchingAlt}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg transition-colors cursor-pointer ml-auto"
                title="Generate alternative academic contexts"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingAlt ? 'animate-spin' : ''}`} />
                <span>{isAlternativeMode ? 'Standard' : 'Alternative'}</span>
              </button>
            </div>

            {/* Render 3 Distinct Context Scenarios */}
            <div className="space-y-2.5">
              {currentScenarios.map((scenario, sIdx) => {
                const isThisPlaying = playingSentenceIndex === sIdx;
                return (
                  <div
                    key={sIdx}
                    className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 transition-all hover:border-slate-300"
                  >
                    {/* Context Header with Category Badge & Speaker */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded border whitespace-nowrap ${scenario.badgeColor}`}>
                          {scenario.badge}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                          {scenario.category}
                        </span>
                      </div>

                      {/* Speaker Pronunciation for this exact sentence (36px touch target) */}
                      <button
                        onClick={(e) => handleListenSentence(scenario.sentence, sIdx, e)}
                        disabled={isThisPlaying}
                        className={`min-w-[34px] min-h-[34px] p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                          isThisPlaying
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-1 ring-indigo-300 scale-105'
                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 border-slate-200 active:scale-95'
                        }`}
                        title={`Listen to pronunciation for sentence ${sIdx + 1} (Web Speech API)`}
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isThisPlaying ? 'animate-bounce text-white' : ''}`} />
                      </button>
                    </div>

                    {/* Sentence text with highlighted target vocabulary */}
                    <p className="text-xs sm:text-sm md:text-base text-slate-900 leading-relaxed font-medium">
                      “{renderHighlightedSentence(scenario.sentence, item.word)}”
                    </p>

                    {/* Syntactic & Academic Commentary */}
                    {scenario.syntacticNote && (
                      <p className="text-[10px] sm:text-[11px] text-slate-500 italic pt-0.5 border-t border-slate-100">
                        💡 <span className="font-semibold text-slate-600">Band 8.5+:</span> {scenario.syntacticNote}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Collocations */}
        {item.collocations && item.collocations.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/70 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">Collocations:</span>
            {item.collocations.map((col, idx) => (
              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] sm:text-xs text-slate-900 border border-slate-200 font-bold whitespace-nowrap">
                {col}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};
