import React from 'react';
import { WifiOff, CheckCircle2, Sparkles, BookOpen, Volume2, Brain, Star, Play, Lock, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface OfflineLearningHubProps {
  isOnline: boolean;
  totalWords: number;
  learnedCount: number;
  offlineGenerationsRemaining: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenStudyMode: () => void;
  onOpenPractice: () => void;
  dateStr: string;
}

export const OfflineLearningHub: React.FC<OfflineLearningHubProps> = ({
  isOnline,
  totalWords,
  learnedCount,
  offlineGenerationsRemaining,
  onRefresh,
  isRefreshing,
  onOpenStudyMode,
  onOpenPractice,
  dateStr,
}) => {
  if (isOnline) {
    return null;
  }

  const hasOfflineAllowance = offlineGenerationsRemaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/50 border-2 border-amber-300 rounded-3xl p-4 sm:p-6 shadow-md text-amber-950 space-y-4"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-300/60 shrink-0">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                Chế độ học Ngoại tuyến (Offline Mode)
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
                Đã lưu trên máy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 font-semibold mt-0.5">
              Toàn bộ nội dung học tập hôm nay ({dateStr}) hoạt động 100% không cần Internet.
            </p>
          </div>
        </div>

        {/* Offline Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs text-amber-950">
            Tiến độ: <strong>{learnedCount}/{totalWords} từ</strong>
          </span>
        </div>
      </div>

      {/* Offline Features Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
        <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-slate-800">10 Từ vựng C1/C2</span>
        </div>
        <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-slate-800">Phát âm giọng chuẩn</span>
        </div>
        <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="text-slate-800">Quiz & Flashcard</span>
        </div>
        <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
          <span className="text-slate-800">Tích lũy ⭐ Stars</span>
        </div>
      </div>

      {/* Generate Different Set: 1 Time Allowance Control */}
      <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-100/60 p-3.5 rounded-2xl border border-amber-200">
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 font-black text-amber-950">
            {hasOfflineAllowance ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Quyền đổi bộ từ ngoại tuyến: Còn 01 lần sử dụng</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">Đã dùng hết 01 lần đổi bộ từ ngoại tuyến (1/1)</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            {hasOfflineAllowance
              ? 'Bạn được phép đổi sang bộ 10 từ khác 01 lần khi không có mạng.'
              : 'Nút đã ẩn. Khi kết nối lại với Internet, tính năng đổi bộ từ sẽ hiển thị và hoạt động bình thường.'}
          </p>
        </div>

        {hasOfflineAllowance ? (
          <button
            id="offline-hub-generate-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Đổi bộ từ khác (Còn 1 lần)</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-slate-200/80 border border-slate-300 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Đã khóa (Chờ có mạng)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
