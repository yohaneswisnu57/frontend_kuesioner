import { createContext, useContext, type ReactNode } from 'react';
import { getToken } from '../lib/api';
import { useUser } from '../lib/hooks';
import type { User } from '../types/kuesioner';

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hasToken = !!getToken();
  const { data: user, status } = useUser();

  // status stays 'pending' until the query settles (success or error), so
  // this never has the isLoading/isFetching gap that causes a false
  // "not authenticated" reading on the render right after the token appears.
  const value: AuthContextValue = {
    user,
    isLoading: hasToken && status === 'pending',
    isAuthenticated: hasToken && status === 'success' && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
