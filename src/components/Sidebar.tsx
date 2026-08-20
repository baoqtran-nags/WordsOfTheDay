import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, BookOpen, Layers, CheckSquare, Bookmark, Calendar, Type, Quote, Volume2, Shuffle, CheckCircle2, Award, RotateCcw, Flame, Trophy, Check, Brain, Clock, BarChart3, Play } from 'lucide-react';
import { INDUSTRY_CATEGORIES } from '../data/words';
import { QuoteItem, StreakData, AchievementBadge, LearnedWordMeta } from '../types';
import { playPronunciation } from '../utils/speech';
import { getLast7DaysStatus, getLocalDateString } from '../utils/streak';
import { FontSizeMode } from './Header';
import { triggerStreakCelebrationConfetti } from '../utils/confetti';
import { AchievementsSection } from './AchievementsSection';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedIndustry: string;
  onSelectIndustry: (industry: string) => void;
  onOpenStudyMode: () => void;
  onOpenGlossary: () => void;
  onOpenPractice: () => void;
  onOpenReview: () => void;
  wordsDueForReviewCount: number;
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
  streakData: StreakData;
  justCompletedSet?: boolean;
  badges: AchievementBadge[];
  learnedMeta: Record<string, LearnedWordMeta>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onRefresh,
  isRefreshing,
  selectedIndustry,
  onSelectIndustry,
  onOpenStudyMode,
  onOpenGlossary,
  onOpenPractice,
  onOpenReview,
  wordsDueForReviewCount,
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
  onResetLearnedCurrentSet,
  streakData,
  justCompletedSet = false,
  badges,
  learnedMeta,
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const todayStr = getLocalDateString();
  const isCompletedToday = streakData.lastCompletedDate === todayStr;
  const last7Days = getLast7DaysStatus(streakData.completedDates);

  const [isPlayingQuote, setIsPlayingQuote] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const progressPercent = totalCurrentWordsCount > 0
    ? Math.round((learnedCountInCurrentSet / totalCurrentWordsCount) * 100)
    : 0;

  const isAllLearned = totalCurrentWordsCount > 0 && learnedCountInCurrentSet === totalCurrentWordsCount;

  // Trigger celebratory confetti and pulse when user reaches 100% completion of the day
  useEffect(() => {
    if (isAllLearned && (!hasTriggeredConfetti || justCompletedSet)) {
      triggerStreakCelebrationConfetti();
      setHasTriggeredConfetti(true);
    } else if (!isAllLearned) {
      setHasTriggeredConfetti(false);
    }
  }, [isAllLearned, justCompletedSet, hasTriggeredConfetti]);

  const handlePlayQuote = () => {
    if (isPlayingQuote) return;
    setIsPlayingQuote(true);
    playPronunciation(
      `"${quote.quote}" — ${quote.author}.`,
      () => setIsPlayingQuote(false),
      () => setIsPlayingQuote(false)
    );
  };

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
              <span className="text-xs text-slate-500 font-semibold">10 Từ mỗi ngày • Tự cập nhật 12:00 AM</span>
            </div>
          </div>
        </div>

        {/* Date line */}
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 flex items-center justify-between gap-2.5 mb-4 text-indigo-950 font-bold text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-700 shrink-0" />
            <span>Today: {todayFormatted}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-200/80 text-indigo-900">
            12:00 AM Reset
          </span>
        </div>

        {/* Daily Streak Card with celebratory pulse animation */}
        <motion.div
          animate={
            isAllLearned
              ? {
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    '0px 4px 6px -1px rgba(245, 158, 11, 0.1)',
                    '0px 12px 24px -2px rgba(245, 158, 11, 0.45)',
                    '0px 4px 6px -1px rgba(245, 158, 11, 0.1)',
                  ],
                }
              : {}
          }
          transition={{ duration: 1.2, repeat: isAllLearned ? 2 : 0, ease: 'easeInOut' }}
          className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl p-4.5 mb-4 shadow-md relative overflow-hidden"
        >
          {/* Celebratory golden glow */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />

          {/* Sparkles indicator if completed today */}
          {isCompletedToday && (
            <div className="absolute top-2 right-2 flex items-center gap-1 text-amber-200 text-xs font-black animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={
                  streakData.currentStreak > 0
                    ? {
                        scale: [1, 1.15, 1],
                        rotate: [0, -3, 3, 0],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner text-amber-200 border border-white/30"
              >
                <Flame className={`w-7 h-7 ${streakData.currentStreak > 0 ? 'text-amber-200 fill-amber-300' : 'text-white'}`} />
              </motion.div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-100 block">
                  Chuỗi học liên tiếp (Daily Streak)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-sm font-bold text-amber-100">
                    {streakData.currentStreak === 1 ? 'Ngày liên tục' : 'Ngày liên tục'}
                  </span>
                </div>
              </div>
            </div>

            {/* Longest streak badge */}
            <div className="bg-black/25 backdrop-blur-xs border border-white/20 rounded-xl px-2.5 py-1 text-right shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-200 uppercase">
                <Trophy className="w-3 h-3 text-amber-300" />
                <span>Kỷ lục</span>
              </div>
              <span className="text-sm font-black text-white">{streakData.longestStreak} ngày</span>
            </div>
          </div>

          {/* 7-day visual week calendar dots */}
          <div className="bg-black/20 rounded-xl p-2.5 border border-white/15 relative z-10">
            <div className="flex items-center justify-between gap-1">
              {last7Days.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold text-amber-100/90">{d.dayLabel}</span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      d.isCompleted
                        ? 'bg-white text-orange-600 shadow-xs ring-2 ring-white/60 scale-105'
                        : d.isToday
                        ? 'bg-amber-400/40 text-white border-2 border-dashed border-white'
                        : 'bg-black/25 text-white/50'
                    }`}
                    title={`${d.dateString}: ${d.isCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'}`}
                  >
                    {d.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : d.isToday ? '•' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-center text-[11px] font-bold text-amber-100">
              {isCompletedToday ? (
                <span className="text-emerald-100">🎉 Đã duy trì chuỗi ngày hôm nay!</span>
              ) : (
                <span>Học xong 10 từ hôm nay để tăng chuỗi 🔥</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Daily Learning Progress Box */}
        <div className={`p-4 rounded-xl border-2 mb-4 transition-all ${
          isAllLearned
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base">
              {isAllLearned ? (
                <Award className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
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
              🎉 Xuất sắc! Bạn đã hoàn thành 10/10 từ và tăng chuỗi học!
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

        {/* PRIMARY "VÀO HỌC NGAY" IMMERSIVE 2-PAGE MOBILE/DESKTOP STUDY BUTTON */}
        <button
          id="sidebar-study-now-btn"
          onClick={onOpenStudyMode}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 border-2 border-indigo-700 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-base sm:text-lg font-black text-white hover:opacity-95 transition-all shadow-lg active:scale-98 cursor-pointer mb-3 group"
        >
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <span>Vào Học Ngay (10 Từ Hôm Nay)</span>
        </button>

        {/* Manual Refresh / Regenerate Button */}
        <button
          id="sidebar-refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-2xs active:scale-98 disabled:opacity-60 cursor-pointer mb-3"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Tạo lại bộ từ khác</span>
        </button>

        {/* Dedicated "Review Mode" Button (Spaced Repetition 3+ Days) */}
        <button
          id="sidebar-review-btn"
          onClick={onOpenReview}
          className="w-full mb-3 p-3 rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-950 font-extrabold text-sm flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block leading-tight">Review Mode (Ôn tập C1/C2)</span>
              <span className="text-[11px] text-indigo-700 font-semibold">Ghi nhớ dài hạn (3+ ngày trước)</span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-2xs">
            {wordsDueForReviewCount} từ
          </span>
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

      {/* Weekly Activity Chart (Recharts) */}
      <WeeklyActivityChart
        learnedMeta={learnedMeta}
        learnedCountToday={learnedCountInCurrentSet}
      />

      {/* Digital Achievements & Milestone Badges */}
      <AchievementsSection badges={badges} />

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
