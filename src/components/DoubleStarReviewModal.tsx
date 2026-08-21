import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, Zap, CheckCircle2, XCircle, Clock, 
  ArrowRight, RotateCcw, Volume2, X, Trophy, Flame, ChevronRight 
} from 'lucide-react';
import { WordItem } from '../types';
import { speakWord } from '../utils/speech';
import { triggerStreakCelebrationConfetti } from '../utils/confetti';
import { VOCABULARY_DATABASE } from '../data/words';

interface DoubleStarReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWord: WordItem | null;
  onCompleteDouble: (wordId: string) => void;
  onDeclineDouble?: () => void;
  todayStars: number;
  totalStars: number;
}

export const DoubleStarReviewModal: React.FC<DoubleStarReviewModalProps> = ({
  isOpen,
  onClose,
  targetWord,
  onCompleteDouble,
  onDeclineDouble,
  todayStars,
  totalStars,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Generate a high-quality challenge question for this word
  const challenge = useMemo(() => {
    if (!targetWord) return null;

    // Pick 1 sentence with blank or definition
    const sentence = targetWord.examples[0] || '';
    // Replace the target word (case-insensitive) with blank
    const regex = new RegExp(`\\b${targetWord.word}\\b`, 'gi');
    const sentenceWithBlank = sentence.replace(regex, '__________');

    // Generate 3 distractor words from same database
    const otherWords = VOCABULARY_DATABASE.filter(w => w.id !== targetWord.id && w.type === targetWord.type);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    const distractorWords = shuffledOthers.map(w => w.word);

    // If not enough same-type words, fallback to general words
    while (distractorWords.length < 3) {
      const fallback = VOCABULARY_DATABASE.find(w => w.id !== targetWord.id && !distractorWords.includes(w.word));
      if (fallback) distractorWords.push(fallback.word);
      else break;
    }

    const options = [targetWord.word, ...distractorWords].sort(() => Math.random() - 0.5);

    return {
      sentenceWithBlank: sentenceWithBlank.includes('__________') ? sentenceWithBlank : `Which word matches the definition: "${targetWord.definition}"?`,
      correctAnswer: targetWord.word,
      options,
      definition: targetWord.definition,
      collocations: targetWord.collocations || [],
    };
  }, [targetWord]);

  if (!isOpen || !targetWord || !challenge) return null;

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const correct = selectedOption.toLowerCase() === challenge.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      triggerStreakCelebrationConfetti();
      onCompleteDouble(targetWord.id);
    }
  };

  const handlePronounce = () => {
    setIsPlayingAudio(true);
    speakWord(targetWord.word, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSkip = () => {
    if (onDeclineDouble) onDeclineDouble();
    onClose();
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Star Multiplier Badge & Active Hours Window */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-4 sm:p-5 text-white flex items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <Zap className="w-5 h-5 text-amber-100 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                  2x Star Multiplier Review
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                  ⭐ +20 Stars
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-100 font-medium mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-200" />
                <span>Daily Review Window: <strong>12:00 AM – 11:59 PM</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Close review"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Star Points Overview Bar */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-5 py-2.5 flex items-center justify-between text-xs font-bold text-amber-950">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Today's Stars: <strong>{todayStars} ⭐</strong></span>
            <span className="text-amber-300 mx-1">•</span>
            <span>All-Time: <strong>{totalStars} ⭐</strong></span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-black">
            Voluntary Review Mode
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Target Word Overview Card */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Learned Word
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  {targetWord.word}
                </h4>
                <span className="text-xs font-mono text-slate-500">
                  {targetWord.ipa}
                </span>
              </div>
            </div>

            <button
              onClick={handlePronounce}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border-slate-200'
              }`}
              title="Pronounce word"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Question / Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                Recall Challenge (Select the correct word to fill the blank):
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-indigo-50/70 border-2 border-indigo-100 rounded-2xl">
              <p className="text-base sm:text-lg text-slate-900 font-semibold leading-relaxed">
                “{challenge.sentenceWithBlank}”
              </p>
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {challenge.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-slate-50';

              if (isAnswerChecked) {
                if (option.toLowerCase() === challenge.correctAnswer.toLowerCase()) {
                  btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-400';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-300 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswerChecked}
                  className={`p-3.5 sm:p-4 rounded-xl border-2 text-left text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span className="font-semibold">{option}</span>
                  {isAnswerChecked && option.toLowerCase() === challenge.correctAnswer.toLowerCase() && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Result Message */}
          <AnimatePresence>
            {isAnswerChecked && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                {isCorrect ? (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Star className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm sm:text-base text-emerald-950">
                        🎉 DOUBLE STARS CLAIMED! (+20 Stars Added ⭐⭐)
                      </h5>
                      <p className="text-xs sm:text-sm text-emerald-900 mt-0.5 leading-relaxed">
                        Excellent active recall! You doubled your daily learning reward to <strong>20 Stars</strong> for mastering <em>"{targetWord.word}"</em>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm sm:text-base text-rose-950">
                        Incorrect. Correct answer: "{challenge.correctAnswer}"
                      </h5>
                      <p className="text-xs sm:text-sm text-rose-900 mt-0.5 leading-relaxed">
                        {targetWord.definition}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {!isAnswerChecked ? (
            <>
              <button
                onClick={handleSkip}
                className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Skip & Keep 10 Stars
              </button>

              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Check & Double Stars</span>
              </button>
            </>
          ) : isCorrect ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Collect +20 Stars & Continue</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleRetry}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue (10 Stars)</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
