import React, { useState } from 'react';
import { QuoteItem } from '../types';
import { Quote, Volume2, Shuffle, Check, Sparkles } from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';

interface QuoteBannerProps {
  quote: QuoteItem;
  onRefreshQuote: () => void;
}

export const QuoteBanner: React.FC<QuoteBannerProps> = ({ quote, onRefreshQuote }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handlePlayQuote = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    playPronunciation(
      `"${quote.quote}" — ${quote.author}.`,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopyQuote = () => {
    const textToCopy = `"${quote.quote}"\n— ${quote.author} (${quote.role})\nContext: ${quote.context}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section 
      id="quote-of-the-day-banner"
      className="relative rounded-2xl bg-slate-900 mb-8 overflow-hidden shadow-lg group border border-slate-800"
    >
      {/* Background Image with Grayscale and High Contrast Overlay */}
      <AnimatePresence mode="wait">
        <motion.img
          key={quote.id}
          src={quote.imageUrl}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.35, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Quote Background"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/60" />

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 md:px-10 flex flex-col justify-center min-h-[160px]">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
            <Quote className="w-3 h-3 text-indigo-400" />
            Quote of the Day
          </span>

          <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-md border border-slate-700/60 rounded-lg p-1">
            <button
              id="quote-listen-btn"
              onClick={handlePlayQuote}
              disabled={isPlayingAudio}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Listen to quote"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-indigo-400 animate-pulse' : ''}`} />
            </button>
            <button
              id="quote-copy-btn"
              onClick={handleCopyQuote}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy quote and citation"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
            </button>
            <button
              id="quote-shuffle-btn"
              onClick={onRefreshQuote}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Shuffle another quote"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quote Text Animated */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <blockquote className="text-lg sm:text-xl md:text-2xl italic font-serif text-white opacity-95 leading-relaxed">
              “{quote.quote}”
            </blockquote>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <p className="text-xs sm:text-sm font-semibold text-indigo-300 uppercase tracking-widest">
                — {quote.author}, {quote.role}
              </p>
              <span className="text-[11px] text-slate-400 font-normal hidden md:inline-block">
                • {quote.context}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
