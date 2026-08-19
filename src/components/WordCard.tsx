import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Copy, Check, Bookmark, Tag, ChevronDown, ChevronUp, History } from 'lucide-react';
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

  // Helper to highlight target word/idiom in example sentence
  const renderHighlightedSentence = (sentence: string, target: string) => {
    const searchRoot = target.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const regex = new RegExp(`(${target}|${searchRoot}[a-z]*)`, 'gi');
    const parts = sentence.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          if (part.toLowerCase().includes(searchRoot.toLowerCase()) || part.toLowerCase() === target.toLowerCase()) {
            return (
              <span key={i} className="font-semibold text-slate-900 underline decoration-indigo-400/60 underline-offset-2">
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
          borderTop: 'border-t-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700',
          typeText: 'text-emerald-600',
          etymBg: 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950',
          etymLabel: 'text-emerald-800'
        };
      case 'FinTech & Banking':
        return {
          borderTop: 'border-t-blue-500',
          badgeBg: 'bg-blue-50 text-blue-700',
          typeText: 'text-blue-600',
          etymBg: 'bg-blue-50/70 border-blue-200/80 text-blue-950',
          etymLabel: 'text-blue-800'
        };
      case 'Tech & Data Science':
        return {
          borderTop: 'border-t-cyan-500',
          badgeBg: 'bg-cyan-50 text-cyan-700',
          typeText: 'text-cyan-600',
          etymBg: 'bg-cyan-50/70 border-cyan-200/80 text-cyan-950',
          etymLabel: 'text-cyan-800'
        };
      case 'Marketing & Growth':
        return {
          borderTop: 'border-t-purple-500',
          badgeBg: 'bg-purple-50 text-purple-700',
          typeText: 'text-purple-600',
          etymBg: 'bg-purple-50/70 border-purple-200/80 text-purple-950',
          etymLabel: 'text-purple-800'
        };
      case 'Medicine & BioTech':
        return {
          borderTop: 'border-t-rose-500',
          badgeBg: 'bg-rose-50 text-rose-700',
          typeText: 'text-rose-600',
          etymBg: 'bg-rose-50/70 border-rose-200/80 text-rose-950',
          etymLabel: 'text-rose-800'
        };
      case 'Leadership & Negotiation':
        return {
          borderTop: 'border-t-amber-500',
          badgeBg: 'bg-amber-50 text-amber-700',
          typeText: 'text-amber-600',
          etymBg: 'bg-amber-50/70 border-amber-200/80 text-amber-950',
          etymLabel: 'text-amber-800'
        };
      case 'Sustainability & ESG':
        return {
          borderTop: 'border-t-teal-500',
          badgeBg: 'bg-teal-50 text-teal-700',
          typeText: 'text-teal-600',
          etymBg: 'bg-teal-50/70 border-teal-200/80 text-teal-950',
          etymLabel: 'text-teal-800'
        };
      default:
        return {
          borderTop: 'border-t-indigo-500',
          badgeBg: 'bg-indigo-50 text-indigo-700',
          typeText: 'text-indigo-600',
          etymBg: 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950',
          etymLabel: 'text-indigo-800'
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
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 border-t-4 ${theme.borderTop} flex flex-col justify-between hover:shadow-md transition-shadow group`}
    >
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                {item.word}
              </h3>
              <button
                id={`btn-listen-${item.id}`}
                onClick={handleListen}
                disabled={isPlaying}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                title="Listen to pronunciation"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-indigo-600 animate-bounce' : ''}`} />
              </button>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{item.ipa}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg}`}>
              {item.industry}
            </span>
            <button
              id={`btn-save-${item.id}`}
              onClick={() => onToggleSave(item.id)}
              className={`p-1 rounded-md transition-colors ${
                isSaved ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save word'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              id={`btn-copy-${item.id}`}
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Copy word"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Word Class Subhead */}
        <div className="flex items-center gap-2 mb-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${theme.typeText}`}>
            {item.type}
          </p>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {item.level}
          </span>
        </div>

        {/* Definition */}
        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
          {item.definition}
        </p>

        {/* Collapsible Etymology Section */}
        {item.etymology && (
          <div className="mb-3.5">
            <button
              id={`btn-etymology-${item.id}`}
              onClick={() => setIsEtymologyOpen(!isEtymologyOpen)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors py-1 px-1.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200"
            >
              <History className="w-3 h-3 text-slate-400" />
              <span>Etymology & Roots</span>
              {isEtymologyOpen ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
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
                  <div className={`mt-1.5 p-3 rounded-lg border text-xs leading-relaxed ${theme.etymBg}`}>
                    <span className={`font-bold text-[10px] uppercase tracking-wider block mb-1 ${theme.etymLabel}`}>
                      Morphological Origin & Root Analysis:
                    </span>
                    <p className="text-slate-700 font-normal">
                      {item.etymology}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Workplace Examples & Collocations */}
      <div className="mt-auto space-y-2 border-t border-slate-100 pt-3">
        <p className="text-[12px] text-slate-600 leading-normal italic">
          “{renderHighlightedSentence(item.examples[0], item.word)}”
        </p>
        <p className="text-[12px] text-slate-600 leading-normal italic">
          “{renderHighlightedSentence(item.examples[1], item.word)}”
        </p>

        {item.collocations && item.collocations.length > 0 && (
          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600">Collocations:</span>
            {item.collocations.map((col, idx) => (
              <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 border border-slate-200 font-medium">
                {col}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};
