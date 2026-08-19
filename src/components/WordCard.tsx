import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Copy, Check, Bookmark, Tag, ChevronDown, ChevronUp, History, CheckCircle2 } from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';

interface WordCardProps {
  item: WordItem;
  index: number;
  isSaved: boolean;
  isLearned: boolean;
  onToggleSave: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onShowToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  item,
  index,
  isSaved,
  isLearned,
  onToggleSave,
  onToggleLearned,
  onShowToast
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEtymologyOpen, setIsEtymologyOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleListen = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const success = playPronunciation(
      item.word,
      () => setIsPlaying(false),
      () => {
        setIsPlaying(false);
        onShowToast('Audio pronunciation unavailable in current browser', 'info');
      }
    );
    if (!success) setIsPlaying(false);
  };

  const handleCopy = () => {
    const etymText = item.etymology ? `\nEtymology: ${item.etymology}` : '';
    const formatted = `${item.word} (${item.ipa})\nType: ${item.type} | Industry: ${item.industry} | Level: ${item.level}\nDefinition: ${item.definition}${etymText}\nExamples:\n1. ${item.examples[0]}\n2. ${item.examples[1]}`;
    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    onShowToast(`Copied "${item.word}" to clipboard!`, 'success');
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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.35,
        delay: index * 0.03,
        ease: 'easeOut',
      }}
      className={`snap-start scroll-mt-6 rounded-2xl border-2 shadow-md border-t-8 ${theme.borderTop} p-5 sm:p-7 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all w-full relative ${
        isLearned
          ? 'bg-emerald-50/40 border-emerald-300'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Learned Badge Indicator */}
      {isLearned && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ĐÃ HỌC • LEARNED</span>
        </div>
      )}

      {/* Left Column: Visual Illustration & Core Identity */}
      <div className="w-full md:w-5/12 lg:w-4/12 shrink-0 flex flex-col justify-between">
        <div>
          {/* Illustration Container */}
          {item.imageUrl && !imgError && (
            <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3.5 group/img shadow-2xs">
              <img
                src={item.imageUrl}
                alt={item.word}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 text-amber-200 text-xs font-bold line-clamp-1 drop-shadow-md">
                {item.imageCaption || `Metaphor: ${item.word}`}
              </div>
            </div>
          )}

          {/* Word Heading + Audio */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {item.word}
            </h3>
            <button
              id={`btn-listen-${item.id}`}
              onClick={handleListen}
              disabled={isPlaying}
              className="p-2.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 cursor-pointer shrink-0"
              title="Listen to pronunciation"
            >
              <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-indigo-800' : ''}`} />
            </button>
          </div>

          {/* Phonetics & Class */}
          <p className="text-sm sm:text-base font-mono text-slate-600 font-bold mt-1">
            {item.ipa}
          </p>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md border ${theme.badgeBg}`}>
              {item.industry}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider ${theme.typeText}`}>
              {item.type}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
              {item.level}
            </span>
          </div>
        </div>

        {/* Action Buttons: Mark as Learned + Save + Copy */}
        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-200/80">
          
          {/* Primary "Đã học / Mark as Learned" Button */}
          <button
            id={`btn-learned-${item.id}`}
            onClick={() => onToggleLearned(item.id)}
            className={`w-full py-2.5 px-3 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isLearned
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
            }`}
            title={isLearned ? 'Bỏ đánh dấu đã học' : 'Xác nhận đã thuộc từ này'}
          >
            <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'text-white' : 'text-emerald-700'}`} />
            <span>{isLearned ? '✓ Đã thuộc từ này' : 'Xác nhận đã học'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id={`btn-save-${item.id}`}
              onClick={() => onToggleSave(item.id)}
              className={`flex-1 py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
            </button>

            <button
              id={`btn-copy-${item.id}`}
              onClick={handleCopy}
              className="py-2 px-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              title="Copy Word Details"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Definition, Roots, Examples & Collocations */}
      <div className="flex-1 flex flex-col justify-between border-t-2 md:border-t-0 md:border-l-2 border-slate-200/70 pt-4 md:pt-0 md:pl-6">
        <div>
          {/* Definition with Elder-friendly Large Typography */}
          <div className="mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
              Definition & Strategic Meaning
            </span>
            <p className="text-base sm:text-lg md:text-xl text-slate-900 font-semibold leading-relaxed">
              {item.definition}
            </p>
          </div>

          {/* Etymology Section */}
          {item.etymology && (
            <div className="mb-4">
              <button
                id={`btn-etymology-${item.id}`}
                onClick={() => setIsEtymologyOpen(!isEtymologyOpen)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-700 transition-colors py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 cursor-pointer"
              >
                <History className="w-4 h-4 text-indigo-600" />
                <span>Etymology & Roots (Latin / Greek)</span>
                {isEtymologyOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
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
                    <div className={`mt-2.5 p-3.5 rounded-xl border-2 text-sm sm:text-base leading-relaxed ${theme.etymBg}`}>
                      <span className={`font-black text-xs sm:text-sm uppercase tracking-wider block mb-1 ${theme.etymLabel}`}>
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

          {/* Workplace Examples */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Professional Context & Examples:
            </span>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed italic">
              1. “{renderHighlightedSentence(item.examples[0], item.word)}”
            </p>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed italic">
              2. “{renderHighlightedSentence(item.examples[1], item.word)}”
            </p>
          </div>
        </div>

        {/* Collocations */}
        {item.collocations && item.collocations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
            <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">Collocations:</span>
            {item.collocations.map((col, idx) => (
              <span key={idx} className="bg-slate-100 px-2.5 py-0.5 rounded-md text-xs sm:text-sm text-slate-900 border border-slate-200 font-bold">
                {col}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};
