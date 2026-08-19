import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Copy, Check, Bookmark, Tag, ChevronDown, ChevronUp, History, Sparkles, Eye } from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';

interface WordCardProps {
  item: WordItem;
  index: number;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onShowToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  item,
  index,
  isSaved,
  onToggleSave,
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

  // Helper to highlight target word/idiom in example sentence with clear high contrast
  const renderHighlightedSentence = (sentence: string, target: string) => {
    const searchRoot = target.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const regex = new RegExp(`(${target}|${searchRoot}[a-z]*)`, 'gi');
    const parts = sentence.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          if (part.toLowerCase().includes(searchRoot.toLowerCase()) || part.toLowerCase() === target.toLowerCase()) {
            return (
              <span key={i} className="font-bold text-indigo-950 underline decoration-indigo-500 underline-offset-3 bg-indigo-50 px-1 py-0.5 rounded">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  // Palette based on industry
  const getThemeByIndustry = (industry: string) => {
    switch (industry) {
      case 'Corporate Law & Governance':
        return {
          borderTop: 'border-t-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          typeText: 'text-emerald-800',
          etymBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          etymLabel: 'text-emerald-900',
          glow: 'from-emerald-500/10'
        };
      case 'FinTech & Banking':
        return {
          borderTop: 'border-t-blue-600',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          typeText: 'text-blue-800',
          etymBg: 'bg-blue-50 border-blue-200 text-blue-950',
          etymLabel: 'text-blue-900',
          glow: 'from-blue-500/10'
        };
      case 'Tech & Data Science':
        return {
          borderTop: 'border-t-cyan-600',
          badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
          typeText: 'text-cyan-800',
          etymBg: 'bg-cyan-50 border-cyan-200 text-cyan-950',
          etymLabel: 'text-cyan-900',
          glow: 'from-cyan-500/10'
        };
      case 'Marketing & Growth':
        return {
          borderTop: 'border-t-purple-600',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          typeText: 'text-purple-800',
          etymBg: 'bg-purple-50 border-purple-200 text-purple-950',
          etymLabel: 'text-purple-900',
          glow: 'from-purple-500/10'
        };
      case 'Medicine & BioTech':
        return {
          borderTop: 'border-t-rose-600',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          typeText: 'text-rose-800',
          etymBg: 'bg-rose-50 border-rose-200 text-rose-950',
          etymLabel: 'text-rose-900',
          glow: 'from-rose-500/10'
        };
      case 'Leadership & Negotiation':
        return {
          borderTop: 'border-t-amber-600',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          typeText: 'text-amber-800',
          etymBg: 'bg-amber-50 border-amber-200 text-amber-950',
          etymLabel: 'text-amber-900',
          glow: 'from-amber-500/10'
        };
      case 'Sustainability & ESG':
        return {
          borderTop: 'border-t-teal-600',
          badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
          typeText: 'text-teal-800',
          etymBg: 'bg-teal-50 border-teal-200 text-teal-950',
          etymLabel: 'text-teal-900',
          glow: 'from-teal-500/10'
        };
      default:
        return {
          borderTop: 'border-t-indigo-600',
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          typeText: 'text-indigo-800',
          etymBg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
          etymLabel: 'text-indigo-900',
          glow: 'from-indigo-500/10'
        };
    }
  };

  const theme = getThemeByIndustry(item.industry);

  return (
    <motion.article
      id={`word-card-${item.id}`}
      layout
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={`bg-white rounded-2xl border-2 border-slate-200 shadow-md p-5 sm:p-6 border-t-8 ${theme.borderTop} flex flex-col justify-between hover:shadow-xl transition-all group`}
    >
      <div>
        {/* Conceptual Illustration Image */}
        {item.imageUrl && !imgError && (
          <div className="relative w-full h-44 sm:h-48 mb-4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group/img">
            <img
              src={item.imageUrl}
              alt={item.word}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            
            {/* Visual Concept Tag */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="font-semibold drop-shadow-md text-amber-200 text-xs sm:text-sm line-clamp-1">
                {item.imageCaption || `Visual illustration: ${item.word}`}
              </span>
            </div>
          </div>
        )}

        {/* Card Header with Large Font */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                {item.word}
              </h3>
              <button
                id={`btn-listen-${item.id}`}
                onClick={handleListen}
                disabled={isPlaying}
                className="p-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                title="Listen to crystal-clear pronunciation"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-indigo-800' : ''}`} />
              </button>
            </div>
            <p className="text-sm sm:text-base font-mono text-slate-600 mt-1 font-semibold">
              {item.ipa}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id={`btn-save-${item.id}`}
              onClick={() => onToggleSave(item.id)}
              className={`p-2 rounded-xl border-2 transition-colors ${
                isSaved
                  ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-xs'
                  : 'bg-slate-50 border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved notebook' : 'Save word'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
            </button>
            <button
              id={`btn-copy-${item.id}`}
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Copy vocabulary card"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Word Class & Domain Badges (Elder-Friendly Text Sizing) */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-xs sm:text-sm font-extrabold uppercase px-2.5 py-1 rounded-md border ${theme.badgeBg}`}>
            {item.industry}
          </span>
          <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${theme.typeText}`}>
            {item.type}
          </span>
          <span className="text-xs sm:text-sm font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
            {item.level}
          </span>
        </div>

        {/* Definition: Increased font size (18px) for effortless elder reading */}
        <p className="text-base sm:text-lg text-slate-900 mb-4 leading-relaxed font-medium">
          {item.definition}
        </p>

        {/* Collapsible Etymology & Roots Section */}
        {item.etymology && (
          <div className="mb-4">
            <button
              id={`btn-etymology-${item.id}`}
              onClick={() => setIsEtymologyOpen(!isEtymologyOpen)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-700 transition-colors py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300"
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
                  <div className={`mt-2 p-3.5 rounded-xl border-2 text-sm sm:text-base leading-relaxed ${theme.etymBg}`}>
                    <span className={`font-black text-xs sm:text-sm uppercase tracking-wider block mb-1.5 ${theme.etymLabel}`}>
                      Morphological Origin & Root Derivation:
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
      </div>

      {/* Workplace Examples & Collocations with Larger Font */}
      <div className="mt-auto space-y-2.5 border-t-2 border-slate-100 pt-3.5">
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed italic">
          “{renderHighlightedSentence(item.examples[0], item.word)}”
        </p>
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed italic">
          “{renderHighlightedSentence(item.examples[1], item.word)}”
        </p>

        {item.collocations && item.collocations.length > 0 && (
          <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">Collocations:</span>
            {item.collocations.map((col, idx) => (
              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md text-xs sm:text-sm text-slate-900 border border-slate-200 font-semibold">
                {col}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};
