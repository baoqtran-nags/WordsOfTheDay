import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Zap, Sparkles, Clock, CheckCircle2, XCircle, 
  RotateCcw, ArrowRight, X, Trophy, Volume2, ShieldCheck, Flame
} from 'lucide-react';
import { WordItem } from '../types';
import { StarSystemData } from '../utils/starSystem';
import { speakWord } from '../utils/speech';
import { triggerStreakCelebrationConfetti } from '../utils/confetti';

interface DailyStarReviewHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  starData: StarSystemData;
  learnedWords: WordItem[];
  onCompleteDouble: (wordId: string) => void;
  onOpenSingleWordReview: (word: WordItem) => void;
}

export const DailyStarReviewHubModal: React.FC<DailyStarReviewHubModalProps> = ({
  isOpen,
  onClose,
  starData,
  learnedWords,
  onCompleteDouble,
  onOpenSingleWordReview,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz'>('overview');
  const [quizWordIndex, setQuizWordIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen) return null;

  // Words that are learned but not yet doubled
  const eligibleWords = learnedWords.filter((w) => {
    const rec = starData?.wordRecords?.[w.id];
    return rec && !rec.isDoubled;
  });

  const doubledWords = learnedWords.filter((w) => {
    const rec = starData?.wordRecords?.[w.id];
    return rec && rec.isDoubled;
  });

  const currentQuizWord = eligibleWords[quizWordIndex] || null;

  // Quick challenge generation for active quiz word
  const currentChallenge = currentQuizWord ? {
    sentence: currentQuizWord.examples[0]?.replace(new RegExp(`\\b${currentQuizWord.word}\\b`, 'gi'), '__________') || `Select word meaning: "${currentQuizWord.definition}"`,
    correctAnswer: currentQuizWord.word,
    options: [
      currentQuizWord.word,
      ...learnedWords.filter(w => w.id !== currentQuizWord.id).map(w => w.word).slice(0, 3)
    ].sort(() => Math.random() - 0.5),
  } : null;

  const handleStartBatchQuiz = () => {
    if (eligibleWords.length === 0) return;
    setQuizWordIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setActiveTab('quiz');
  };

  const handleCheckQuizAnswer = () => {
    if (!selectedOption || !currentQuizWord || !currentChallenge) return;
    const correct = selectedOption.toLowerCase() === currentChallenge.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      triggerStreakCelebrationConfetti();
      onCompleteDouble(currentQuizWord.id);
    }
  };

  const handleNextQuizWord = () => {
    if (quizWordIndex < eligibleWords.length - 1) {
      setQuizWordIndex(quizWordIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsCorrect(false);
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-5 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <Star className="w-6 h-6 fill-amber-200 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl font-['Plus_Jakarta_Sans',sans-serif]">
                  Daily Star Multiplier & Voluntary Review
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase">
                  2x Boost
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-100 font-medium mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-200" />
                <span>Active Window: <strong>12:00 AM – 11:59 PM Daily</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'overview' ? (
            <>
              {/* Daily Star Points Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Today's Stars
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-amber-950">{starData.todayStars}</span>
                    <span className="text-amber-600 font-extrabold text-sm">⭐</span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                    Goal: 100–200 ⭐/day
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200">
                  <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                    All-Time Stars
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-indigo-950">{starData.totalStars}</span>
                    <span className="text-indigo-600 font-extrabold text-sm">⭐</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
                    Accumulated Points
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    2x Doubled Words
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-emerald-950">
                      {doubledWords.length}/{learnedWords.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    {eligibleWords.length} eligible to double
                  </span>
                </div>
              </div>

              {/* Spaced Review Rules & Timing Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Voluntary Star Doubling Rules (12:00 AM – 11:59 PM)</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed list-disc list-inside">
                  <li><strong>Standard Learning:</strong> Marking a word as learned gives you <strong>+10 Stars</strong> ⭐ immediately.</li>
                  <li><strong>2x Double Multiplier:</strong> Complete a rapid 15-second recall review to boost it to <strong>+20 Stars</strong> ⭐⭐.</li>
                  <li><strong>Voluntary Participation:</strong> You can choose to participate in review challenges or skip with zero penalty.</li>
                  <li><strong>24/7 Availability:</strong> Daily review challenges are open continuously from <strong>12:00 AM to 11:59 PM</strong> every day.</li>
                </ul>
              </div>

              {/* Words Available for 2x Star Boost */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Today's Words & Star Multiplier Status
                    </h4>
                  </div>
                  {eligibleWords.length > 0 && (
                    <button
                      onClick={handleStartBatchQuiz}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Double All ({eligibleWords.length})</span>
                    </button>
                  )}
                </div>

                {learnedWords.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
                    <Star className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-bold text-slate-700">No words learned today yet</p>
                    <p className="mt-1">Mark words as learned to start earning 10–20 Stars per word!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {learnedWords.map((word) => {
                      const record = starData.wordRecords[word.id];
                      const isDoubled = record?.isDoubled;

                      return (
                        <div
                          key={word.id}
                          className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition-all ${
                            isDoubled
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-white border-amber-200 hover:border-amber-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {word.word}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                                {word.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {word.definition}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            {isDoubled ? (
                              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                20 ⭐ (2x)
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenSingleWordReview(word);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                                title="Take 15-sec review to double to 20 stars"
                              >
                                <Zap className="w-3 h-3 fill-slate-950" />
                                <span>Double to 20⭐</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* BATCH QUIZ FLOW */
            currentQuizWord && currentChallenge && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                    Review Word {quizWordIndex + 1} of {eligibleWords.length}
                  </span>
                  <span className="text-amber-800 font-extrabold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                    Reward: +20 Stars ⭐⭐
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Fill the missing academic word:
                  </span>
                  <p className="text-base text-slate-900 font-semibold leading-relaxed">
                    “{currentChallenge.sentence}”
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentChallenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    let style = 'bg-white border-slate-200 text-slate-800';

                    if (isAnswerChecked) {
                      if (opt.toLowerCase() === currentChallenge.correctAnswer.toLowerCase()) {
                        style = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-100 border-rose-400 text-rose-950 font-bold';
                      } else {
                        style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    } else if (isSelected) {
                      style = 'bg-amber-100 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !isAnswerChecked && setSelectedOption(opt)}
                        disabled={isAnswerChecked}
                        className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all cursor-pointer ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isAnswerChecked && (
                  <div className={`p-3.5 rounded-xl border text-xs font-bold ${
                    isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    {isCorrect ? '🎉 Correct! +20 Stars Claimed for this word.' : `Correct answer was: "${currentChallenge.correctAnswer}"`}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {activeTab === 'overview' ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer transition-colors"
            >
              Done & Return
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setActiveTab('overview')}
                className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Back to Overview
              </button>

              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckQuizAnswer}
                  disabled={!selectedOption}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuizWord}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>{quizWordIndex < eligibleWords.length - 1 ? 'Next Word' : 'Finish Session'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
