import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { RequireAuth } from '../components/RequireAuth';
import { apiClient, setToken, clearToken, getToken } from '../lib/api';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';

const renderApp = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/kuesioner']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/kuesioner"
                element={
                  <RequireAuth>
                    <div>Halaman Kuesioner</div>
                  </RequireAuth>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
};

describe('AuthProvider - token yang ditolak backend (mis. dari login-as)', () => {
  beforeEach(() => {
    setToken('token-tidak-valid');
  });

  afterEach(() => {
    clearToken();
    vi.restoreAllMocks();
  });

  it('membuang token yang gagal (bukan 401) dan berhenti di /login, tidak bolak-balik ke /kuesioner', async () => {
    // LoginPage hanya memeriksa keberadaan token (bukan validitasnya). Jika
    // token gagal divalidasi lewat error selain 401 (403/422/500/network) dan
    // tidak pernah dibuang, LoginPage akan langsung memantulkan kembali ke
    // /kuesioner setiap kali RequireAuth melempar ke /login — loop tanpa
    // henti yang tampak seperti "stuck" di spinner.
    vi.spyOn(apiClient, 'get').mockRejectedValue({ isAxiosError: true, response: { status: 500 } });

    renderApp();

    const ssoLink = await screen.findByRole('link', { name: /masuk dengan sso/i });
    expect(ssoLink).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it('membuang token saat GET /kuesioner/user sukses (200) tapi data usernya null', async () => {
    // Axios hanya melempar error untuk status non-2xx. Kalau backend
    // membalas 200 dengan `data: null` (mis. `{ success: false, data: null }`),
    // react-query mencatatnya sebagai status 'success' dengan user null — bukan
    // 'error' — jadi harus tetap dianggap gagal otentikasi.
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { success: false, data: null } });

    renderApp();

    const ssoLink = await screen.findByRole('link', { name: /masuk dengan sso/i });
    expect(ssoLink).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });
});
