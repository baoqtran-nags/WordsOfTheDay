import React, { useState } from 'react';
import { Smartphone, Apple, Play, Download, Copy, Check, ExternalLink, Sparkles, Terminal, FileCode, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobilePackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePackagingModal: React.FC<MobilePackagingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'ipa'>('pwa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-sefgmsoaw6nhekfh3vysrd-46348951848.asia-southeast1.run.app';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border-2 border-indigo-200 relative overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600" />

          {/* Close button */}
          <button
            id="packaging-modal-close"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Đóng gói cài đặt Android & iOS
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-indigo-700">
                Lựa chọn phương thức tối ưu nhất cho thiết bị của bạn
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('pwa')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pwa'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Cài tức thì (Khuyên dùng)</span>
            </button>

            <button
              onClick={() => setActiveTab('apk')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'apk'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Android (.APK)</span>
            </button>

            <button
              onClick={() => setActiveTab('ipa')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ipa'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-4 h-4 text-slate-900 shrink-0" />
              <span>iOS (.IPA / Xcode)</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="space-y-4">
            {/* TAB 1: PWA (Instant Install - No PC needed) */}
            {activeTab === 'pwa' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      Cách nhanh nhất — Cài trực tiếp từ điện thoại trong 10 giây
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ứng dụng đã có sẵn <b>PWA Standalone & Service Worker Offline</b>. Khi cài đặt theo cách này, ứng dụng sẽ có icon riêng trên màn hình chính, tự động full-screen tràn viền như file APK/IPA mà không tốn dung lượng máy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Android */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                      <Play className="w-4 h-4 fill-emerald-600" />
                      <span>Dành cho Android (Chrome)</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                      <li>Mở link bằng <b>Google Chrome</b></li>
                      <li>Bấm biểu tượng <b>3 chấm (⋮)</b> góc trên</li>
                      <li>Chọn <b>"Cài đặt ứng dụng"</b> (Install app)</li>
                    </ol>
                  </div>

                  {/* iOS */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <Apple className="w-4 h-4 fill-slate-900" />
                      <span>Dành cho iOS (Safari)</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                      <li>Mở link bằng <b>Safari</b> trên iPhone</li>
                      <li>Bấm nút <b>Chia sẻ (Share ⎋)</b> ở đáy màn hình</li>
                      <li>Chọn <b>"Thêm vào MH chính"</b> (Add to Home)</li>
                    </ol>
                  </div>
                </div>

                {/* Copy Link button */}
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {currentUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentUrl, 'url')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedCode === 'url' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Android APK (PWABuilder / Capacitor) */}
            {activeTab === 'apk' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span>Cách 1: Tải trực tiếp file APK qua PWABuilder (Không cần viết code)</span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    1. Truy cập <b>PWABuilder.com</b> (Dịch vụ chính thức của Microsoft để đóng gói PWA thành APK).<br/>
                    2. Dán link ứng dụng của bạn vào và nhấn <b>Start</b>.<br/>
                    3. Chọn <b>Android ➔ Generate APK / AAB</b> để tải file cài đặt về điện thoại và cài đặt ngay.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all"
                    >
                      <span>Mở PWABuilder.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Cách 2: Đóng gói bằng Capacitor CLI (Dành cho Lập trình viên)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(
                        `# 1. Tải source code từ Settings > Export Zip về máy\n# 2. Chạy lệnh cài đặt Capacitor\nnpm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "WOTD English" "com.wotd.english"\nnpm run build\nnpx cap add android\nnpx cap open android`,
                        'capacitor-android'
                      )}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedCode === 'capacitor-android' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'capacitor-android' ? 'Đã chép' : 'Chép lệnh'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto text-slate-300">
                    {`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "WOTD English" "com.wotd.english"
npm run build
npx cap add android
npx cap open android # Mở trong Android Studio để build APK`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: iOS (.IPA / Xcode) */}
            {activeTab === 'ipa' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Apple className="w-4 h-4 text-slate-900" />
                    <h4 className="font-extrabold text-slate-900">
                      Quy định đóng gói iOS (.IPA) của Apple
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Theo quy định bảo mật của Apple, việc tạo file <b>.IPA</b> hoặc cài lên iPhone yêu cầu phải có <b>máy tính Mac + Xcode</b> và tài khoản <b>Apple Developer Certificate</b> để ký số (Code Signing).
                  </p>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-indigo-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Đóng gói Xcode bằng Capacitor iOS (Trên máy Mac)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(
                        `# 1. Tải Source Code (Export ZIP từ Settings menu)\n# 2. Cài đặt Capacitor iOS\nnpm install @capacitor/core @capacitor/cli @capacitor/ios\nnpx cap init "WOTD English" "com.wotd.english"\nnpm run build\nnpx cap add ios\nnpx cap open ios # Mở trong Xcode để cắm cáp nạp vào iPhone hoặc xuất IPA`,
                        'capacitor-ios'
                      )}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedCode === 'capacitor-ios' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'capacitor-ios' ? 'Đã chép' : 'Chép lệnh'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto text-slate-300">
                    {`npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "WOTD English" "com.wotd.english"
npm run build
npx cap add ios
npx cap open ios # Mở Xcode để build ra file IPA`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" />
              <span>Bạn có thể tải mã nguồn qua Settings &gt; Export ZIP</span>
            </div>
            <button
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
