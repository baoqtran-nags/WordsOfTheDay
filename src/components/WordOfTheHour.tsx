import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { Clock, Volume2, Shuffle, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';

interface WordOfTheHourProps {
  vocabularyDb: WordItem[];
  onSelectWord?: (word: WordItem) => void;
  onShowToast?: (text: string, type: 'success' | 'info' | 'error') => void;
}

export const WordOfTheHour: React.FC<WordOfTheHourProps> = ({
  vocabularyDb,
  onSelectWord,
  onShowToast,
}) => {
  const [currentWord, setCurrentWord] = useState<WordItem>(() => {
    // Pick based on the current hour of the day for consistency
    const hour = new Date().getHours();
    const index = hour % (vocabularyDb.length || 1);
    return vocabularyDb[index] || vocabularyDb[0];
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return (60 - minutes - 1) * 60 + (60 - seconds);
  });

  // Pick a new word every hour or on manual refresh
  const pickNewWord = (isManual = false) => {
    if (!vocabularyDb.length) return;
    const nextWords = vocabularyDb.filter((w) => w.id !== currentWord.id);
    const random = nextWords[Math.floor(Math.random() * nextWords.length)] || vocabularyDb[0];
    setCurrentWord(random);

    if (isManual && onShowToast) {
      onShowToast(`Từ vựng của giờ mới: "${random.word}"`, 'info');
    }
  };

  // Hourly countdown timer & auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          pickNewWord(false);
          return 3600; // Reset to 1 hour
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWord, vocabularyDb]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}p ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    playPronunciation(
      currentWord.word,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  if (!currentWord) return null;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b-2 border-indigo-900/60 py-2.5 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left Badge: Word of the Hour Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white text-[11px] font-black uppercase tracking-wider shadow-xs border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Word of the Hour</span>
          </div>

          <div className="flex items-center gap-1 text-slate-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Đổi từ sau:</span>
            <span className="font-mono text-amber-300 font-bold">{formatCountdown(secondsRemaining)}</span>
          </div>
        </div>

        {/* Center: Current Micro-Learning Word & Definition */}
        <div className="flex-1 flex items-center justify-center md:justify-start gap-3 min-w-0 text-center md:text-left flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold text-amber-200 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {currentWord.word}
            </span>
            <span className="text-xs font-mono text-indigo-300 hidden sm:inline font-bold">
              {currentWord.ipa}
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-800/80 text-indigo-200 border border-indigo-700">
              {currentWord.level}
            </span>
          </div>

          <span className="text-slate-500 hidden sm:inline">•</span>

          <p className="text-xs sm:text-sm text-slate-200 truncate font-medium max-w-xl">
            {currentWord.definition}
          </p>
        </div>

        {/* Right Actions: Pronounce & Shuffle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleListen}
            disabled={isPlayingAudio}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer text-xs font-bold flex items-center gap-1 ${
              isPlayingAudio
                ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-300'
                : 'bg-slate-800/80 hover:bg-slate-700 text-indigo-200 border-slate-700'
            }`}
            title="Nghe phát âm từ của giờ này (Web Speech API)"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-white' : ''}`} />
            <span className="hidden lg:inline text-[11px]">Nghe phát âm</span>
          </button>

          <button
            onClick={() => pickNewWord(true)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Đổi sang từ vựng khác ngay lập tức"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
