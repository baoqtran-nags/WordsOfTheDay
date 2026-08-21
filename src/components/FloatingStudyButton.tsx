import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ArrowUp, Sparkles, BookOpen } from 'lucide-react';

interface FloatingStudyButtonProps {
  onOpenStudyMode: () => void;
  learnedCount: number;
  totalWords: number;
  isStudyModeOpen: boolean;
}

export const FloatingStudyButton: React.FC<FloatingStudyButtonProps> = ({
  onOpenStudyMode,
  learnedCount,
  totalWords,
  isStudyModeOpen,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating button once user scrolls past the top hero banner (260px)
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > 260);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Do not show floating button if modal is already open or not scrolled down
  if (isStudyModeOpen) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="floating-study-mode-container"
          initial={{ opacity: 0, y: 32, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-6 right-4 sm:right-8 z-40 flex items-center gap-2 shadow-2xl rounded-2xl"
        >
          {/* Main Floating Action Button: Back to Study Mode */}
          <button
            id="floating-back-to-study-btn"
            onClick={onOpenStudyMode}
            className="group relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-950/25 hover:shadow-indigo-600/40 hover:from-indigo-600 hover:to-indigo-600 border-2 border-indigo-400/40 active:scale-95 transition-all cursor-pointer select-none"
            title="Open 2-Page Study Mode for Today's Vocabulary"
          >
            {/* Animated Glow Pulse */}
            <span className="absolute -inset-0.5 rounded-2xl bg-indigo-400 opacity-20 group-hover:opacity-40 blur-xs transition-opacity" />

            <div className="relative flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="tracking-tight font-black sm:inline">
                    Back to Study Mode
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse hidden sm:inline" />
                </div>
                <span className="text-[11px] text-indigo-200 font-semibold block mt-0.5 leading-none">
                  2-Page Academic View
                </span>
              </div>

              {/* Progress Pill Indicator */}
              <div className="ml-1 px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-[11px] font-black text-white shrink-0">
                {learnedCount}/{totalWords}
              </div>
            </div>
          </button>

          {/* Quick Scroll To Top Button */}
          <button
            id="floating-scroll-top-btn"
            onClick={handleScrollToTop}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border-2 border-slate-200/90 hover:border-indigo-300 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
            title="Scroll to top of page"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
