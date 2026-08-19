import React, { useState } from 'react';
import { QuoteItem } from '../types';
import { Quote, Volume2, Shuffle, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
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
      className="relative rounded-2xl bg-slate-950 mb-8 overflow-hidden shadow-xl group border-2 border-slate-800"
    >
      {/* Background Editorial Illustration with Smooth Crossfade */}
      <AnimatePresence mode="wait">
        <motion.img
          key={quote.id}
          src={quote.imageUrl}
          referrerPolicy="no-referrer"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.38, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
          className="absolute inset-0 w-full h-full object-cover filter saturate-125"
          alt={quote.author}
        />
      </AnimatePresence>

      {/* Dark High-Contrast Gradient for Elder-Friendly Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/75" />

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-center min-h-[200px]">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-indigo-300 uppercase tracking-widest bg-indigo-950/80 px-3 py-1 rounded-md border border-indigo-700/60">
            <Quote className="w-4 h-4 text-indigo-400" />
            Quote of the Day & Visual Insight
          </span>

          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-md">
            <button
              id="quote-listen-btn"
              onClick={handlePlayQuote}
              disabled={isPlayingAudio}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Listen to quote pronunciation"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-indigo-400 animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Listen</span>
            </button>

            <button
              id="quote-copy-btn"
              onClick={handleCopyQuote}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Copy quote and citation"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              id="quote-shuffle-btn"
              onClick={onRefreshQuote}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              title="Shuffle another quote illustration"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Next Quote</span>
            </button>
          </div>
        </div>

        {/* Large High-Contrast Quote Text (Suited for Elders) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <blockquote className="text-xl sm:text-2xl md:text-3xl italic font-serif text-white font-medium leading-relaxed tracking-wide drop-shadow-sm">
              “{quote.quote}”
            </blockquote>

            <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
              <p className="text-base sm:text-lg font-bold text-amber-300 tracking-wide">
                — {quote.author}
              </p>
              <span className="text-sm sm:text-base text-slate-300 font-medium">
                ({quote.role})
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-normal hidden lg:inline-block">
                • {quote.context}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
