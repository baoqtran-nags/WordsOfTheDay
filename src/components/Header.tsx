import React from 'react';
import { Sparkles, RefreshCw, BookOpen, Layers, CheckSquare, Bookmark } from 'lucide-react';
import { INDUSTRY_CATEGORIES } from '../data/words';

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
  activeCount
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Badges */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-extrabold text-xl">
              W
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Words of the Day
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                  Level: C1 / Advanced
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  IELTS 6.5–8.0 • VSTEP C1
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Advanced industry English, corporate idioms & academic precision • {currentDate}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Saved Bookmark Filter */}
            <button
              id="header-saved-btn"
              onClick={onToggleShowSavedOnly}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                showSavedOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title="Filter by bookmarked vocabulary"
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>Saved ({savedCount})</span>
            </button>

            {/* Practice Quiz */}
            <button
              id="header-practice-btn"
              onClick={onOpenPractice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all shadow-xs"
              title="Practice active words with interactive quiz"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Practice ({activeCount})</span>
            </button>

            {/* Glossary / Explorer */}
            <button
              id="header-glossary-btn"
              onClick={onOpenGlossary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all shadow-xs"
              title="Browse complete database of specialized vocabulary"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">All Words</span>
              <span className="sm:hidden">Glossary</span>
            </button>

            {/* Refresh / Generate New Set */}
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Dataset</span>
            </button>
          </div>
        </div>

        {/* Industry Filter Pills */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Domain:
          </span>
          {INDUSTRY_CATEGORIES.map((category) => {
            const isSelected = selectedIndustry === category;
            return (
              <button
                key={category}
                id={`filter-pill-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectIndustry(category)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80 hover:text-slate-900'
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
