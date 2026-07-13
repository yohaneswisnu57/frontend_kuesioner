import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://simanja2.ukwms.ac.id/api';
const TOKEN_KEY = 'simanja_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

const GENERIC_ERROR_MESSAGE = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';

/**
 * Backend sometimes returns raw HTML (Laravel debug/whoops page, SSO
 * redirect page) instead of JSON. Never surface that to the UI — always
 * fall back to a generic message unless the backend gave a clean JSON
 * `message` field.
 */
export const getErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return GENERIC_ERROR_MESSAGE;

  const contentType = error.response?.headers?.['content-type'] ?? '';
  const responseData = error.response?.data;

  if (typeof contentType === 'string' && contentType.includes('text/html')) {
    return GENERIC_ERROR_MESSAGE;
  }

  if (responseData && typeof responseData === 'object' && typeof (responseData as { message?: unknown }).message === 'string') {
    return (responseData as { message: string }).message;
  }

  if (!error.response) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }

  return GENERIC_ERROR_MESSAGE;
};
