import React, { useState, useMemo } from 'react';
import { WordItem } from '../types';
import { X, CheckCircle2, XCircle, RotateCcw, Volume2, ArrowRight, Award } from 'lucide-react';
import { playPronunciation } from '../utils/speech';

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
}

export const PracticeModal: React.FC<PracticeModalProps> = ({ isOpen, onClose, words }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'quiz' | 'flashcard'>('quiz');
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate quiz questions dynamically from the active words
  const questions = useMemo(() => {
    return words.map((item, idx) => {
      const target = item.word;
      const root = target.split(' ')[0].replace(/[^a-zA-Z]/g, '');
      const baseSentence = item.examples[0];
      const regex = new RegExp(`(${target}|${root}[a-z]*)`, 'gi');
      const sentenceWithBlank = baseSentence.replace(regex, '________');

      const otherWords = words.filter((w) => w.id !== item.id).map((w) => w.word);
      const allOptions = [item.word, ...otherWords.slice(0, 3)].sort(() => Math.random() - 0.5);

      return {
        id: `q-${idx}`,
        targetWord: item.word,
        item,
        sentenceWithBlank,
        correctAnswer: item.word,
        options: allOptions,
        explanation: item.definition
      };
    });
  }, [words]);

  if (!isOpen || words.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQ.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setIsFlipped(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Practice & Retention Check
            </h2>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setMode('quiz')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  mode === 'quiz' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fill-in Quiz
              </button>
              <button
                onClick={() => setMode('flashcard')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  mode === 'flashcard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flashcards
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="py-6 flex-1 flex flex-col justify-between">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {mode === 'quiz' ? (
              /* Quiz View */
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                    Industry Context: {currentQ.item.industry}
                  </span>
                  <p className="text-base text-slate-800 leading-relaxed font-medium">
                    “{currentQ.sentenceWithBlank}”
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((option, idx) => {
                    let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-indigo-300';
                    if (isAnswered) {
                      if (option === currentQ.correctAnswer) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold';
                      } else if (option === selectedOption) {
                        btnStyle = 'bg-rose-50 border-rose-500 text-rose-800';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between text-sm shadow-xs ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {isAnswered && option === currentQ.correctAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && option === selectedOption && option !== currentQ.correctAnswer && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Definition:</span>
                    {currentQ.explanation}
                  </div>
                )}
              </div>
            ) : (
              /* Flashcard View */
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[220px] bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  {!isFlipped ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block mb-1">
                        {currentQ.item.industry} • {currentQ.item.level}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {currentQ.item.word}
                      </h3>
                      <p className="font-mono text-xs text-slate-500 mb-4">{currentQ.item.ipa}</p>
                      <span className="text-xs text-indigo-600 font-medium underline decoration-dotted">
                        Click card to flip and reveal definition
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block mb-1">
                        Definition & Application
                      </span>
                      <p className="text-sm text-slate-800 mb-4 leading-relaxed font-medium">
                        {currentQ.item.definition}
                      </p>
                      <div className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-200">
                        "{currentQ.item.examples[0]}"
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => playPronunciation(currentQ.item.word)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg border border-slate-300 shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    Pronounce
                  </button>
                </div>
              </div>
            )}

            {/* Next Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={mode === 'quiz' && !isAnswered}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next Word'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Practice Session Completed!
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              You achieved a retention score of <span className="text-emerald-700 font-bold">{score}/{questions.length}</span> on today's focus set.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Back to Words
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
