import React, { useState } from 'react';
import { AchievementBadge } from '../types';
import { Flame, Trophy, Target, Brain, Sparkles, BookOpen, Volume2, Award, Lock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AchievementsSectionProps {
  badges: AchievementBadge[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ badges }) => {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;

  const renderIcon = (iconName: AchievementBadge['iconName'], isUnlocked: boolean, color: string) => {
    const iconClass = `w-5 h-5 ${isUnlocked ? 'text-white' : 'text-slate-400'}`;

    switch (iconName) {
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'Brain':
        return <Brain className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Volume2':
        return <Volume2 className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const getColorClasses = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-slate-100 border-slate-200 text-slate-400',
        badgeBg: 'bg-slate-300 text-slate-600',
        glow: '',
      };
    }

    switch (color) {
      case 'amber':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 text-amber-950 shadow-xs hover:border-amber-400',
          badgeBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-orange-500/20',
          glow: 'ring-2 ring-amber-400/40',
        };
      case 'emerald':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950 shadow-xs hover:border-emerald-400',
          badgeBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20',
          glow: 'ring-2 ring-emerald-400/40',
        };
      case 'indigo':
        return {
          bg: 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300 text-indigo-950 shadow-xs hover:border-indigo-400',
          badgeBg: 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-600/20',
          glow: 'ring-2 ring-indigo-400/40',
        };
      case 'rose':
        return {
          bg: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 text-rose-950 shadow-xs hover:border-rose-400',
          badgeBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/20',
          glow: 'ring-2 ring-rose-400/40',
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 text-purple-950 shadow-xs hover:border-purple-400',
          badgeBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-600/20',
          glow: 'ring-2 ring-purple-400/40',
        };
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs',
          badgeBg: 'bg-indigo-600 text-white shadow-sm',
          glow: 'ring-2 ring-indigo-400/40',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs">
      
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Digital Badges & Milestones
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold block -mt-0.5">
              Huy hiệu thành tích mở khóa
            </span>
          </div>
        </div>

        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          {unlockedCount}/{totalCount} Mở
        </span>
      </div>

      {/* Badges Grid (2 columns) */}
      <div className="grid grid-cols-2 gap-2">
        {badges.map((badge) => {
          const colors = getColorClasses(badge.accentColor, badge.isUnlocked);
          const percent = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${colors.bg}`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors.badgeBg} ${colors.glow}`}>
                  {renderIcon(badge.iconName, badge.isUnlocked, badge.accentColor)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black truncate block">
                      {badge.title}
                    </span>
                    {badge.isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                  </div>

                  {badge.isUnlocked ? (
                    <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                      ✓ Đã mở khóa
                    </span>
                  ) : (
                    <div className="mt-1">
                      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 block mt-0.5 text-right">
                        {badge.currentProgress}/{badge.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Modal / Drawer for Selected Badge */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl border-2 border-slate-200 max-w-sm w-full p-6 shadow-2xl relative text-center"
            >
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3.5 shadow-lg ${
                getColorClasses(selectedBadge.accentColor, selectedBadge.isUnlocked).badgeBg
              }`}>
                {renderIcon(selectedBadge.iconName, true, selectedBadge.accentColor)}
              </div>

              <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block mb-1.5 ${
                selectedBadge.isUnlocked
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {selectedBadge.isUnlocked ? '✓ Huy hiệu đã đạt được' : '🔒 Chưa mở khóa'}
              </span>

              <h4 className="text-xl font-extrabold text-slate-900 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                {selectedBadge.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {selectedBadge.description}
              </p>

              {/* Progress Detail */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs text-slate-700">
                <div className="flex justify-between font-bold mb-1">
                  <span>Tiến trình hoàn thành:</span>
                  <span className="font-extrabold text-indigo-700">
                    {selectedBadge.currentProgress} / {selectedBadge.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedBadge.currentProgress / selectedBadge.maxProgress) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
