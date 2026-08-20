import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SpinnerGapIcon } from '@phosphor-icons/react';
import { apiClient, getErrorMessage, setToken, clearToken } from '../lib/api';

export const AdminLoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const attempted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (attempted.current) return;

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    attempted.current = true;

    const validate = async () => {
      // Token is set before the request so the axios interceptor attaches it
      // as the Authorization header, but nothing is committed to app state
      // until the backend confirms it actually resolves to a user — a
      // login-as token that is invalid/expired/wrong-scope must fail here,
      // not deep inside /kuesioner after the UI already looks logged in.
      setToken(token);
      try {
        const { data } = await apiClient.get('/kuesioner/user');
        queryClient.clear();
        queryClient.setQueryData(['user-profile'], data.data);
        navigate('/kuesioner', { replace: true });
      } catch (err) {
        clearToken();
        setError(getErrorMessage(err));
      }
    };

    validate();
  }, [token, navigate, queryClient]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        {error ? (
          <>
            <p className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</p>
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:opacity-90"
            >
              Kembali ke Login
            </Link>
          </>
        ) : (
          <>
            <SpinnerGapIcon size={36} weight="bold" className="mx-auto animate-spin text-amber-500" />
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Masuk...</p>
          </>
        )}
      </div>
    </div>
  );
};
