import React, { useState, useMemo } from 'react';
import { WordItem, LearnedWordMeta } from '../types';
import { X, CheckCircle2, XCircle, RotateCcw, Volume2, ArrowRight, Award, Brain, Clock, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { playPronunciation } from '../utils/speech';
import { ReviewCandidate, generateReviewQuiz } from '../utils/reviewRetention';
import { triggerStreakCelebrationConfetti } from '../utils/confetti';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: ReviewCandidate[];
  vocabularyDb: WordItem[];
  onShowToast: (text: string, type: 'success' | 'info' | 'error') => void;
  onReviewComplete?: (score: number, total: number) => void;
}

export const ReviewModeModal: React.FC<ReviewModeModalProps> = ({
  isOpen,
  onClose,
  candidates,
  vocabularyDb,
  onShowToast,
  onReviewComplete,
}) => {
  const [step, setStep] = useState<'intro' | 'quiz' | 'summary'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Generate quiz questions dynamically from candidate words
  const questions = useMemo(() => {
    return generateReviewQuiz(candidates, vocabularyDb);
  }, [candidates, vocabularyDb]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleStartQuiz = () => {
    if (candidates.length === 0) {
      onShowToast('There are currently no words learned 3+ days ago due for review.', 'info');
      return;
    }
    setStep('quiz');
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
      // Play audio on correct answer
      playPronunciation(currentQ.correctAnswer);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setStep('summary');
      if (onReviewComplete) {
        onReviewComplete(score, totalQuestions);
      }
      if (score + (selectedOption === currentQ?.correctAnswer ? 0 : 0) >= Math.ceil(totalQuestions * 0.7)) {
        triggerStreakCelebrationConfetti();
      }
    } else {
      setIsAnswered(false);
      setSelectedOption(null);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleListenWord = (word: string) => {
    setIsPlayingAudio(true);
    playPronunciation(
      word,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white border-2 border-indigo-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Review Mode (Spaced Repetition)
                </h2>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                  3+ Days
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Strengthen long-term memory retention based on the Ebbinghaus Forgetting Curve
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close window"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1: INTRO / WORDS OVERVIEW */}
        {step === 'intro' && (
          <div className="space-y-5">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
              <Sparkles className="w-6 h-6 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-indigo-950 text-sm sm:text-base">
                  Long-term Retention Goal ({candidates.length} words due for review)
                </h3>
                <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed mt-1">
                  These are words you marked as learned <strong>3 or more days ago</strong>. Taking this spaced repetition mini-quiz reinforces active recall for IELTS Writing & Speaking.
                </p>
              </div>
            </div>

            {/* List of candidate words */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
                <span>Words due for review today ({candidates.length})</span>
                <span>Time elapsed</span>
              </div>

              {candidates.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-slate-700">No words learned 3+ days ago yet!</p>
                  <p className="text-xs mt-1">Keep learning new words today; the system will remind you to review after 3 days.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {candidates.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border-2 border-slate-200 shadow-2xs flex items-center justify-between gap-2 hover:border-indigo-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">{c.wordItem.word}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {c.wordItem.level}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 line-clamp-1">{c.wordItem.definition}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-amber-700" />
                          {c.daysSinceLearned} {c.daysSinceLearned === 1 ? 'day ago' : 'days ago'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Start Button */}
            <div className="pt-2">
              <button
                disabled={candidates.length === 0}
                onClick={handleStartQuiz}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Start Review Mini-Quiz ({candidates.length} questions)</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE QUIZ */}
        {step === 'quiz' && currentQ && (
          <div className="space-y-5">
            {/* Progress counter & score */}
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600">
              <span className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">
                Question {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-200 font-extrabold">
                Score: {score} / {totalQuestions}
              </span>
            </div>

            {/* Question sentence */}
            <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block mb-2">
                Complete the academic context sentence:
              </span>
              <p className="text-base sm:text-lg text-slate-900 font-semibold leading-relaxed">
                “{currentQ.sentenceWithBlank}”
              </p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQ.correctAnswer;

                let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black shadow-xs';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-100 border-rose-500 text-rose-950 font-bold';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`p-4 rounded-xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-900 uppercase">Definition & Etymology:</span>
                    <button
                      onClick={() => handleListenWord(currentQ.correctAnswer)}
                      className="p-1 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-800">
                    Correct Answer: <strong>{currentQ.correctAnswer}</strong>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}

            {/* Footer button */}
            <div className="pt-2 flex justify-end">
              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>{isLastQuestion ? 'View Review Summary' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SUMMARY */}
        {step === 'summary' && (
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-100 border-2 border-indigo-300 text-indigo-700 flex items-center justify-center shadow-lg">
              <Award className="w-10 h-10 animate-bounce text-indigo-700" />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Spaced Review Session Complete!
              </h3>
              <p className="text-sm text-slate-600 font-semibold mt-1">
                Long-Term Retention Index: {Math.round((score / totalQuestions) * 100)}%
              </p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Correct Answers</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-950">{score} / {totalQuestions}</span>
              </div>
              <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl">
                <span className="text-xs font-bold text-indigo-800 uppercase block">Reinforced Words</span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-950">{candidates.length} {candidates.length === 1 ? 'word' : 'words'}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Great job! These academic words have been solidified into your active recall memory. Keep up your daily streak!
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="py-3 px-5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Again</span>
              </button>

              <button
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done & Return</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
