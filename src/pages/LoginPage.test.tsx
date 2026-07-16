import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { apiClient, clearToken } from '../lib/api';
import { ThemeProvider } from '../context/ThemeContext';

const renderLoginPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
};

describe('LoginPage - mengirim input ke backend', () => {
  beforeEach(() => {
    clearToken();
    vi.restoreAllMocks();
  });

  it('mengirim userid dan password persis seperti yang diketik user ke POST /kuesioner/login', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { data: { token: 'fake-token', user: { userid: '12345', nama: 'Budi', role: 'dosen' } } },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), '12345');
    await user.type(screen.getByLabelText(/^password$/i), 'rahasia123');
    await user.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
    expect(postSpy).toHaveBeenCalledWith('/kuesioner/login', {
      userid: '12345',
      password: 'rahasia123',
    });
  });

  it('menyimpan token dari backend setelah login berhasil', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { data: { token: 'token-abc', user: { userid: '999', nama: 'Ani', role: 'staf' } } },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), '999');
    await user.type(screen.getByLabelText(/^password$/i), 'secret');
    await user.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => expect(localStorage.getItem('simanja_token')).toBe('token-abc'));
  });

  it('menampilkan pesan error dari backend saat login gagal, tanpa mengirim ulang data lama', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 401,
        headers: { 'content-type': 'application/json' },
        data: { message: 'User ID atau password salah.' },
      },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), 'salah');
    await user.type(screen.getByLabelText(/^password$/i), 'salah');
    await user.click(screen.getByRole('button', { name: /masuk/i }));

    expect(await screen.findByText('User ID atau password salah.')).toBeInTheDocument();
    expect(localStorage.getItem('simanja_token')).toBeNull();
  });

  it('tidak mengirim request ketika field wajib kosong (validasi HTML required)', async () => {
    const postSpy = vi.spyOn(apiClient, 'post');
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: /masuk/i }));

    expect(postSpy).not.toHaveBeenCalled();
  });
});
