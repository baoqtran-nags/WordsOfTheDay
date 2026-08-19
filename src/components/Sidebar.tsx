import React from 'react';
import { Sparkles, RefreshCw, BookOpen, Layers, CheckSquare, Bookmark, Calendar, Type, Quote, Volume2, Shuffle, CheckCircle2, Award, RotateCcw } from 'lucide-react';
import { INDUSTRY_CATEGORIES } from '../data/words';
import { QuoteItem } from '../types';
import { playPronunciation } from '../utils/speech';
import { FontSizeMode } from './Header';

interface SidebarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedIndustry: string;
  onSelectIndustry: (industry: string) => void;
  onOpenGlossary: () => void;
  onOpenPractice: () => void;
  savedCount: number;
  onToggleShowSavedOnly: () => void;
  showSavedOnly: boolean;
  activeCount: number;
  fontSizeMode: FontSizeMode;
  onToggleFontSize: () => void;
  quote: QuoteItem;
  onRefreshQuote: () => void;
  learnedCountInCurrentSet: number;
  totalCurrentWordsCount: number;
  onMarkAllLearned: () => void;
  onResetLearnedCurrentSet: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onRefresh,
  isRefreshing,
  selectedIndustry,
  onSelectIndustry,
  onOpenGlossary,
  onOpenPractice,
  savedCount,
  onToggleShowSavedOnly,
  showSavedOnly,
  activeCount,
  fontSizeMode,
  onToggleFontSize,
  quote,
  onRefreshQuote,
  learnedCountInCurrentSet,
  totalCurrentWordsCount,
  onMarkAllLearned,
  onResetLearnedCurrentSet
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const [isPlayingQuote, setIsPlayingQuote] = React.useState(false);

  const handlePlayQuote = () => {
    if (isPlayingQuote) return;
    setIsPlayingQuote(true);
    playPronunciation(
      `"${quote.quote}" — ${quote.author}.`,
      () => setIsPlayingQuote(false),
      () => setIsPlayingQuote(false)
    );
  };

  const progressPercent = totalCurrentWordsCount > 0
    ? Math.round((learnedCountInCurrentSet / totalCurrentWordsCount) * 100)
    : 0;

  const isAllLearned = totalCurrentWordsCount > 0 && learnedCountInCurrentSet === totalCurrentWordsCount;

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] shrink-0 flex flex-col gap-5">
      
      {/* Brand & App Info Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white font-black text-2xl shrink-0">
            W
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Words of the Day
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-700" />
                C1 / Advanced
              </span>
              <span className="text-xs text-slate-500 font-semibold">10 Từ mỗi ngày • IELTS 7.0–8.5</span>
            </div>
          </div>
        </div>

        {/* Date line */}
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 flex items-center gap-2.5 mb-4 text-indigo-950 font-bold text-sm sm:text-base">
          <Calendar className="w-5 h-5 text-indigo-700 shrink-0" />
          <span>Today is {todayFormatted}</span>
        </div>

        {/* Daily Learning Progress Box (Xác nhận đã học) */}
        <div className={`p-4 rounded-xl border-2 mb-4 transition-all ${
          isAllLearned
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base">
              {isAllLearned ? (
                <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              )}
              <span>Tiến độ học hôm nay:</span>
            </div>
            <span className="text-sm font-black px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              {learnedCountInCurrentSet}/{totalCurrentWordsCount} từ
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllLearned ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isAllLearned ? (
            <div className="text-xs sm:text-sm font-bold text-emerald-800 bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
              🎉 Xuất sắc! Bạn đã hoàn thành 10/10 từ hôm nay!
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Đạt {progressPercent}% mục tiêu ngày</span>
              <button
                onClick={onMarkAllLearned}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
              >
                Học xong cả {totalCurrentWordsCount} từ
              </button>
            </div>
          )}

          {learnedCountInCurrentSet > 0 && (
            <div className="mt-2 text-right">
              <button
                onClick={onResetLearnedCurrentSet}
                className="text-[11px] text-slate-400 hover:text-rose-600 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại tiến độ
              </button>
            </div>
          )}
        </div>

        {/* Primary Generator Button (10 words) */}
        <button
          id="sidebar-refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-indigo-600 rounded-xl bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer mb-3"
        >
          <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Tạo 10 Từ Mới Hôm Nay</span>
        </button>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-bold">
          <button
            id="sidebar-practice-btn"
            onClick={onOpenPractice}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Practice ({activeCount})</span>
          </button>

          <button
            id="sidebar-glossary-btn"
            onClick={onOpenGlossary}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>All Words (55)</span>
          </button>

          <button
            id="sidebar-saved-btn"
            onClick={onToggleShowSavedOnly}
            className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 transition-colors shadow-2xs cursor-pointer ${
              showSavedOnly
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${showSavedOnly ? 'fill-amber-600 text-amber-600' : 'text-slate-500'}`} />
            <span>Saved ({savedCount})</span>
          </button>

          <button
            id="sidebar-fontsize-btn"
            onClick={onToggleFontSize}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Toggle Font Size"
          >
            <Type className="w-4 h-4 text-indigo-600" />
            <span>Text: {fontSizeMode === 'xlarge' ? 'Extra' : fontSizeMode === 'large' ? 'Large' : 'Normal'}</span>
          </button>
        </div>
      </div>

      {/* Quote of the Day in Left Column */}
      <div className="bg-slate-950 text-white rounded-2xl border-2 border-slate-800 overflow-hidden shadow-md relative group p-5">
        <img
          src={quote.imageUrl}
          referrerPolicy="no-referrer"
          alt={quote.author}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/80" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-300 uppercase tracking-wider bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-800">
              <Quote className="w-3.5 h-3.5 text-indigo-400" />
              Quote of the Day
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePlayQuote}
                disabled={isPlayingQuote}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Listen to quote"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingQuote ? 'text-indigo-400 animate-bounce' : ''}`} />
              </button>
              <button
                onClick={onRefreshQuote}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                title="Next quote"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <blockquote className="text-base sm:text-lg italic font-serif text-white font-medium leading-relaxed drop-shadow-sm mb-2.5">
            “{quote.quote}”
          </blockquote>

          <div className="text-xs text-slate-300 font-medium">
            <strong className="text-amber-300 font-bold block">{quote.author}</strong>
            <span>{quote.role}</span>
          </div>
        </div>
      </div>

      {/* Domain / Industry Filter Menu */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Layers className="w-4 h-4 text-indigo-600" />
          Filter by Industry Domain
        </h3>

        <div className="flex flex-col gap-1.5">
          {INDUSTRY_CATEGORIES.map((cat) => {
            const isSelected = selectedIndustry === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectIndustry(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between border-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
