import React from 'react';
import { Sparkles, RefreshCw, BookOpen, Layers, CheckSquare, Bookmark, Calendar, Type, Star, Zap, WifiOff, CheckCircle2 } from 'lucide-react';
import { INDUSTRY_CATEGORIES } from '../data/words';

export type FontSizeMode = 'standard' | 'large' | 'xlarge';

interface HeaderProps {
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
  todayStars: number;
  totalStars: number;
  onOpenStarReviewHub: () => void;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
  todayStars,
  totalStars,
  onOpenStarReviewHub,
  isOnline = true,
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="border-b-2 border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Badges */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 text-white font-black text-2xl shrink-0">
              W
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Words of the Day
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-700" />
                  C1 / Advanced
                </span>
                {!isOnline ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                    Offline Mode (Cached)
                  </span>
                ) : (
                  <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Offline Ready
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  IELTS 6.5–8.0 • VSTEP C1
                </span>
              </div>

              {/* Explicit "Today is [month, day, year]" line with large, legible font */}
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm md:text-base font-extrabold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                  <Calendar className="w-4 h-4 text-indigo-700" />
                  Today is {todayFormatted}
                </span>
                <span className="text-slate-300 hidden md:inline">•</span>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Specialized industry English, corporate idioms & visual illustrations
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons with comfortable Elder-Friendly Touch Targets */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            
            {/* Star Points & 2x Review Multiplier Hub Widget */}
            <button
              id="header-star-points-btn"
              onClick={onOpenStarReviewHub}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-black rounded-xl border-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-950 border-amber-300 transition-all shadow-xs cursor-pointer active:scale-95 group"
              title="Daily Learning Stars & Voluntary 2x Review (12:00 AM – 11:59 PM)"
            >
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold">{todayStars} ⭐</span>
              </div>
              <span className="text-amber-400 font-bold">•</span>
              <span className="text-[11px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-slate-950" />
                2x Boost
              </span>
            </button>

            {/* Font Size Adjuster */}
            <button
              id="header-fontsize-btn"
              onClick={onToggleFontSize}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 transition-all shadow-xs cursor-pointer"
              title="Toggle font size for elder-friendly readability"
            >
              <Type className="w-4 h-4 text-indigo-600" />
              <span>
                Text Size: {fontSizeMode === 'xlarge' ? 'Extra Large' : fontSizeMode === 'large' ? 'Large' : 'Standard'}
              </span>
            </button>

            {/* Saved Bookmark Filter */}
            <button
              id="header-saved-btn"
              onClick={onToggleShowSavedOnly}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 transition-all cursor-pointer ${
                showSavedOnly
                  ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title="Filter by bookmarked vocabulary"
            >
              <Bookmark className={`w-4 h-4 ${showSavedOnly ? 'fill-amber-600 text-amber-600' : 'text-slate-500'}`} />
              <span>Saved ({savedCount})</span>
            </button>

            {/* Practice Quiz */}
            <button
              id="header-practice-btn"
              onClick={onOpenPractice}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 transition-all shadow-xs cursor-pointer"
              title="Practice active words with interactive quiz"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Practice ({activeCount})</span>
            </button>

            {/* Glossary / Explorer */}
            <button
              id="header-glossary-btn"
              onClick={onOpenGlossary}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 transition-all shadow-xs cursor-pointer"
              title="Browse complete database of specialized vocabulary"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>All Words</span>
            </button>

            {/* Refresh / Generate New Set */}
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600 rounded-xl bg-indigo-600 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>New 10 Words</span>
            </button>
          </div>
        </div>

        {/* Industry Filter Pills */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Domain:
          </span>
          {INDUSTRY_CATEGORIES.map((category) => {
            const isSelected = selectedIndustry === category;
            return (
              <button
                key={category}
                id={`filter-pill-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectIndustry(category)}
                className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all font-bold border-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
