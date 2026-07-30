import { Navigate } from 'react-router-dom';
import { getToken, getSsoLoginUrl } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage = () => {
  if (getToken()) return <Navigate to="/kuesioner" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="animate-fade-in relative w-full max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-indigo-600/30">
            <img src="/favicon.svg" alt="Logo UKWMS" className="h-full w-full object-contain" />
          </div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-300 dark:to-cyan-300">
            Kuesioner Universitas Katolik Widya Mandala Surabaya
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Masuk untuk mengisi kuesioner periodik
          </p>
        </div>

        <a
          href={getSsoLoginUrl()}
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-3 font-bold tracking-wide text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:scale-[1.01] hover:opacity-90"
        >
          Masuk dengan SSO UKWMS
        </a>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Gunakan perangkat pribadi saat mengisi kuesioner untuk menjaga keamanan akun Anda.
        </p>
      </div>
    </div>
  );
};
