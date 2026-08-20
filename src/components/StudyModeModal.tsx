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
  Eye,
} from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { getThreeContextAwareExamples, fetchAlternativeAcademicScenarios, ContextScenario } from '../utils/academicExamples';
import { triggerStreakCelebrationConfetti } from '../utils/confetti';
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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'word' | 'examples'>('word');
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab('word');
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
          setImgError(false);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setActiveTab('word');
          setImgError(false);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'word' ? 'examples' : 'word'));
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
        onShowToast('Web Speech API: Trình duyệt chưa hỗ trợ phát âm', 'info');
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
        onShowToast('Không thể phát âm câu này', 'info');
      },
    });
  };

  const handleCopyWord = () => {
    const text = `${currentWord.word} (${currentWord.ipa})\n${currentWord.definition}\n${currentWord.etymology ? `Etymology: ${currentWord.etymology}` : ''}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    onShowToast(`Đã sao chép từ "${currentWord.word}"`, 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setActiveTab('word');
      setImgError(false);
    } else {
      triggerStreakCelebrationConfetti();
      onShowToast('🎉 Bạn đã xem hết toàn bộ 10 từ của ngày hôm nay!', 'success');
      onClose();
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActiveTab('word');
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
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
              Vào Học • Thẻ {currentIndex + 1}/{words.length}
            </span>
            {isLearned && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Đã thuộc
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
              title="Phát âm từ vựng (Web Speech API)"
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
              title={isSaved ? 'Đã lưu' : 'Lưu từ'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
              title="Đóng chế độ học (ESC)"
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

        {/* Two-Page Tab Switcher: [Trang 1: Từ vựng & Nghĩa] vs [Trang 2: 3 Ví dụ chuẩn] */}
        <div className="bg-slate-100 p-2 sm:px-6 flex items-center gap-2 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('word')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'word'
                ? 'bg-white text-indigo-950 shadow-sm border-2 border-indigo-200'
                : 'text-slate-600 hover:bg-slate-200/70 border-2 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Trang 1: Từ Vựng & Nghĩa</span>
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'examples'
                ? 'bg-white text-indigo-950 shadow-sm border-2 border-indigo-200'
                : 'text-slate-600 hover:bg-slate-200/70 border-2 border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Trang 2: 3 Ví Dụ Học Thuật</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-black">
              3
            </span>
          </button>
        </div>

        {/* Scrollable / Fit Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'word' ? (
              /* TAB 1: Từ vựng, Phiên âm, Hình ảnh minh họa, Định nghĩa, Gốc từ Latin/Greek */
              <motion.div
                key={`word-${currentWord.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
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
                    title="Nghe phát âm chuẩn"
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

                {/* Illustration Image (Compact fit on mobile) */}
                {currentWord.imageUrl && !imgError && (
                  <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-xs group">
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

                {/* Definition Box */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Định nghĩa & Ý nghĩa chiến lược
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
                      <span>Gốc từ Latin & Cấu trúc hình thái học:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                      {currentWord.etymology}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* TAB 2: 3 Ví dụ học thuật theo chuẩn IELTS C1/C2 & Collocations */
              <motion.div
                key={`examples-${currentWord.id}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Header of examples tab */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                      3 Ví dụ học thuật (IELTS Band 8.0–9.0):
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsAlternativeMode((prev) => !prev);
                      onShowToast(
                        !isAlternativeMode ? 'Đã đổi sang 3 ví dụ chuyên sâu mới' : 'Đã quay lại ví dụ chuẩn',
                        'info'
                      );
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isAlternativeMode ? 'Ví dụ chuẩn' : 'Ngữ cảnh mở rộng'}</span>
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
                            title="Nghe phát âm câu này"
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
                      <span>Cụm từ cố định (Academic Collocations):</span>
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
            <span className="hidden sm:inline">Từ trước</span>
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
            <span>{isLearned ? '✓ Đã thuộc từ này' : 'Xác nhận đã học'}</span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextWord}
            className="py-2.5 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer transition-colors shadow-sm active:scale-98"
          >
            <span className="hidden sm:inline">
              {currentIndex === words.length - 1 ? 'Hoàn thành' : 'Từ tiếp'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
