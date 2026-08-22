import React, { ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clean possible malformed cache keys
      const starRaw = localStorage.getItem('wotd_star_points_v2');
      if (starRaw) {
        const parsed = JSON.parse(starRaw);
        if (parsed?.data) {
          localStorage.setItem('wotd_star_points_v2', JSON.stringify(parsed.data));
        }
      }
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Đã khôi phục ứng dụng
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ứng dụng đã tự động bảo vệ dữ liệu học tập của bạn. Nhấn nút bên dưới để tiếp tục học 10 từ hôm nay.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tiếp tục học ngay</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
