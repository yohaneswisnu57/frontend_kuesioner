import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 text-white">
          <div className="max-w-md rounded-3xl border border-red-500/20 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-400">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-100">Terjadi Kesalahan</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Maaf, terjadi kendala teknis pada aplikasi. Silakan coba muat ulang halaman.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
