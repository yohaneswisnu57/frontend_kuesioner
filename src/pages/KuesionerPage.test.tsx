import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KuesionerPage } from './KuesionerPage';
import { apiClient, setToken, clearToken } from '../lib/api';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import type { KuesionerData } from '../types/kuesioner';

const kuesionerData: KuesionerData = {
  is_sudah_mengisi: false,
  periode: { kdperiode: '2026-1', is_aktif: 1 },
  kuesioner: [
    {
      kdkelompok: 'K1',
      namakelompok: 'Kelompok Layanan',
      pertanyaan: [
        { idpertanyaan: 1, pertanyaan: 'Layanan cepat?', jenisjwb: 'A', kunci: '' },
        { idpertanyaan: 2, pertanyaan: 'Staf ramah?', jenisjwb: 'B', kunci: '' },
        { idpertanyaan: 3, pertanyaan: 'Saran Anda?', jenisjwb: 'C', kunci: '' },
      ],
    },
  ],
};

const fakeUser = { userid: '12345', nama: 'Budi', role: 'dosen' };

const mockGetByUrl = (kuesionerResponse: KuesionerData) =>
  vi.spyOn(apiClient, 'get').mockImplementation((url: string) => {
    if (url === '/kuesioner/user') return Promise.resolve({ data: { data: fakeUser } });
    if (url === '/kuesioner/pertanyaan') return Promise.resolve({ data: { data: kuesionerResponse } });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });

const renderKuesionerPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/kuesioner']}>
          <AuthProvider>
            <KuesionerPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
};

describe('KuesionerPage - mengirim jawaban ke backend', () => {
  beforeEach(() => {
    setToken('fake-token');
    vi.restoreAllMocks();
  });

  it('mengirim seluruh jawaban yang dipilih user sebagai payload SubmitPayload ke POST /kuesioner/jawaban', async () => {
    mockGetByUrl(kuesionerData);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });

    const user = userEvent.setup();
    renderKuesionerPage();

    expect(await screen.findByText('Layanan cepat?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'S' }));
    await user.click(screen.getByRole('button', { name: 'Benar' }));
    await user.type(screen.getByPlaceholderText('Ketik jawaban Anda di sini...'), 'Lebih cepat lagi ya');

    await user.click(screen.getByRole('button', { name: /kirim semua jawaban/i }));

    await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
    expect(postSpy).toHaveBeenCalledWith('/kuesioner/jawaban', {
      kdperiode: '2026-1',
      jawaban: [
        { idpertanyaan: 1, jenisjwb: 'A', kdkelompok: 'K1', jawaban: 'S' },
        { idpertanyaan: 2, jenisjwb: 'B', kdkelompok: 'K1', jawaban: 'B' },
        { idpertanyaan: 3, jenisjwb: 'C', kdkelompok: 'K1', jawaban: 'Lebih cepat lagi ya' },
      ],
    });
  });

  it('menonaktifkan tombol kirim selama belum semua soal terjawab (tidak mengirim payload tidak lengkap)', async () => {
    mockGetByUrl(kuesionerData);
    const postSpy = vi.spyOn(apiClient, 'post');

    const user = userEvent.setup();
    renderKuesionerPage();

    expect(await screen.findByText('Layanan cepat?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'S' }));

    const submitButton = screen.getByRole('button', { name: /kirim semua jawaban/i });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('tidak menampilkan form jawaban jika user sudah pernah mengisi kuesioner periode ini', async () => {
    mockGetByUrl({ ...kuesionerData, is_sudah_mengisi: true });
    const postSpy = vi.spyOn(apiClient, 'post');

    renderKuesionerPage();

    expect(await screen.findByRole('heading', { name: /terima kasih/i })).toBeInTheDocument();
    expect(screen.queryByText('Layanan cepat?', { exact: false })).not.toBeInTheDocument();
    expect(postSpy).not.toHaveBeenCalled();
  });

  afterEach(() => {
    clearToken();
  });
});
