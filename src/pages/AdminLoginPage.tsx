import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SpinnerGapIcon } from '@phosphor-icons/react';
import { setToken } from '../lib/api';

export const AdminLoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    setToken(token);
    queryClient.clear();
    navigate('/kuesioner', { replace: true });
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="text-center">
        <SpinnerGapIcon size={36} weight="bold" className="mx-auto animate-spin text-amber-500" />
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Masuk...</p>
      </div>
    </div>
  );
};
