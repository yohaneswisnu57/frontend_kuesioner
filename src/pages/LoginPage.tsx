import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLogin } from '../lib/hooks';
import { getToken, getErrorMessage } from '../lib/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="animate-fade-in relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-indigo-600/30">
            S
          </div>
          <h1 className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent">
            Kuesioner Simanja
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Masuk untuk mengisi kuesioner evaluasi periodik
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label htmlFor="userid" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              User ID (NIP)
            </label>
            <input
              id="userid"
              type="text"
              required
              autoComplete="off"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="Masukkan NIP Anda"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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

        <p className="mt-6 text-center text-xs text-slate-500">
          Gunakan perangkat pribadi saat mengisi kuesioner untuk menjaga keamanan akun Anda.
        </p>
      </div>
    </div>
  );
};
