import React from 'react';
import { Share, PlusSquare, Smartphone, X, CheckCircle, Sparkles, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-indigo-200 relative overflow-hidden"
        >
          {/* Top Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Cài đặt trên iPhone 15 Pro Max
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-indigo-700">
                Sử dụng cá nhân • Chạy như ứng dụng iOS độc lập
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 text-slate-800 text-sm">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3.5 items-start">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                1
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900">
                  Mở ứng dụng trên trình duyệt <span className="text-indigo-600">Safari</span>
                </p>
                <p className="text-xs text-slate-600">
                  Đảm bảo bạn đang mở liên kết này bằng trình duyệt Safari trên iPhone 15 Pro Max.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3.5 items-start">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                2
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  Nhấn nút <Share className="w-4 h-4 text-indigo-600 inline" /> <span className="font-black text-indigo-700">Chia sẻ (Share)</span>
                </p>
                <p className="text-xs text-slate-600">
                  Nút biểu tượng hình vuông có mũi tên hướng lên ở thanh công cụ dưới đáy màn hình Safari.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3.5 items-start">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                3
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  Chọn <PlusSquare className="w-4 h-4 text-indigo-600 inline" /> <span className="font-black text-indigo-700">"Thêm vào MH chính" (Add to Home Screen)</span>
                </p>
                <p className="text-xs text-slate-600">
                  Cuộn xuống danh sách tùy chọn, chọn <b>Thêm vào MH chính</b> rồi nhấn nút <b>Thêm (Add)</b> ở góc trên bên phải.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits pill */}
          <div className="mt-5 p-3.5 bg-slate-100 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Tự động full màn hình không viền trình duyệt, tối ưu Dynamic Island & lưu offline 10 từ/ngày.
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCopy}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl border-2 border-slate-300 hover:bg-slate-50 font-bold text-slate-800 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã sao chép link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Sao chép link Web</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Đã hiểu</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
