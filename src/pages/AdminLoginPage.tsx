import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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

  return null;
};
