import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Unexpected application error' };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0B1F3D] p-6 text-slate-100">
          <div className="max-w-md rounded-2xl border border-red-500/40 bg-[#12284A] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>خطای سیستمی / Application Error</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F26A1B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FF8A3D]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>بارگذاری مجدد / Reload</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
