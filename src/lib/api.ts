import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://simanja2.ukwms.ac.id/api';
const SSO_URL = import.meta.env.VITE_SSO_URL || 'https://app.ukwms.ac.id';
const TOKEN_KEY = 'simanja_token';

export const getSsoLoginUrl = () => {
  const callbackUrl = import.meta.env.VITE_CALLBACK_URL || `${window.location.origin}/callback`;
  return `${SSO_URL.replace(/\/$/, '')}/login?redirect=${encodeURIComponent(callbackUrl)}`;
};

export const getSsoHomeUrl = () => SSO_URL.replace(/\/$/, '');

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
      // Do not redirect if we are already on /login or /callback (SSO processing page)
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/callback' && currentPath !== '/sso/callback') {
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
