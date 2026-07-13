import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const token = getToken();
  const { isLoading, isAuthenticated } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
