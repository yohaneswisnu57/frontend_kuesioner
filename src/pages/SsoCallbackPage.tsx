import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, getErrorMessage, setToken as saveTokenToStorage } from '../lib/api';

export const SsoCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const attempted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const ssoError = searchParams.get('error');

  useEffect(() => {
    if (attempted.current) return;
    
    if (ssoError) {
      setError(ssoError);
      return;
    }

    if (!token) {
      setError('Token SSO tidak ditemukan.');
      return;
    }

    attempted.current = true;

    const validate = async () => {
      try {
        const { data } = await apiClient.post('/kuesioner/login-sso', { token });
        
        // Simpan token
        saveTokenToStorage(data.data.token);
        
        // Set user profile data in React Query cache
        queryClient.setQueryData(['user-profile'], data.data.user);
        
        // Redirect ke kuesioner dengan navigate (tanpa full reload)
        navigate('/kuesioner', { replace: true });
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };

    validate();
  }, [token, ssoError, navigate, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
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
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Memvalidasi sesi SSO...</p>
          </>
        )}
      </div>
    </div>
  );
};
