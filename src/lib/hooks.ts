import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getToken, setToken, clearToken } from './api';
import type { KuesionerData, SubmitPayload, User } from '../types/kuesioner';

export const useUser = () => {
  return useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/kuesioner/user');
      return data.data;
    },
    enabled: !!getToken(),
    retry: false,
  });
};

export interface LoginPayload {
  userid: string;
  password: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await apiClient.post('/kuesioner/login', payload);
      return data;
    },
    onSuccess: (data) => {
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user;
      if (token) setToken(token);
      if (user) queryClient.setQueryData(['user-profile'], user);
    },
  });
};

export const useLoginSSO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ssoToken: string) => {
      const { data } = await apiClient.post('/kuesioner/login-sso', { token: ssoToken });
      return data.data as { token: string; user: User };
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['user-profile'], data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/kuesioner/logout');
    },
    onSettled: () => {
      clearToken();
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};

export const useKuesioner = () => {
  return useQuery<KuesionerData>({
    queryKey: ['kuesioner-pertanyaan'],
    queryFn: async () => {
      const { data } = await apiClient.get('/kuesioner/pertanyaan');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!getToken(),
  });
};

export const useSubmitJawaban = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const { data } = await apiClient.post('/kuesioner/jawaban', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kuesioner-pertanyaan'] });
    },
  });
};
