import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLogin } from '../lib/hooks';
import { getToken, getErrorMessage } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(true);

  if (getToken()) return <Navigate to="/kuesioner" replace />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { userid, password },
      {
        onSuccess: () => navigate('/kuesioner', { replace: true }),
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="animate-fade-in relative w-full max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-indigo-600/30">
            S
          </div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-300 dark:to-cyan-300">
            Kuesioner Universitas Katolik Widya Mandala Surabaya
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Masuk untuk mengisi kuesioner periodik
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label htmlFor="userid" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Username(NIP)
            </label>
            <input
              id="userid"
              type="text"
              required
              autoComplete="off"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="Masukkan NIP Anda"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={isHidden ? 'password' : 'text'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder-slate-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setIsHidden((prev) => !prev)}
                aria-label={isHidden ? 'Tampilkan password' : 'Sembunyikan password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                {isHidden ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.4 19.4 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.4 19.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-3 font-bold tracking-wide text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:scale-[1.01] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {login.isPending ? (
              <>
                <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Gunakan perangkat pribadi saat mengisi kuesioner untuk menjaga keamanan akun Anda.
        </p>
      </div>
    </div>
  );
};
