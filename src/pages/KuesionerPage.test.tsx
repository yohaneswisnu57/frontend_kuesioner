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
        { idpertanyaan: 2, pertanyaan: 'Staf ramah?', jenisjwb: 'A', kunci: '' },
      ],
    },
  ],
};

const multiKelompokData: KuesionerData = {
  is_sudah_mengisi: false,
  periode: { kdperiode: '2026-1', is_aktif: 1 },
  kuesioner: [
    {
      kdkelompok: 'K1',
      namakelompok: 'Kelompok Layanan',
      pertanyaan: [{ idpertanyaan: 1, pertanyaan: 'Layanan cepat?', jenisjwb: 'A', kunci: '' }],
    },
    {
      kdkelompok: 'K2',
      namakelompok: 'Kelompok Fasilitas',
      pertanyaan: [{ idpertanyaan: 2, pertanyaan: 'Fasilitas memadai?', jenisjwb: 'A', kunci: '' }],
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

    const setujuButtons = screen.getAllByRole('button', { name: 'Setuju' });
    await user.click(setujuButtons[0]);
    const tidakSetujuButtons = screen.getAllByRole('button', { name: 'Tidak Setuju' });
    await user.click(tidakSetujuButtons[1]);
    await user.click(screen.getByRole('button', { name: /kirim semua jawaban/i }));

    await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
    expect(postSpy).toHaveBeenCalledWith('/kuesioner/jawaban', {
      kdperiode: '2026-1',
      jawaban: [
        { idpertanyaan: 1, jenisjwb: 'A', kdkelompok: 'K1', jawaban: 'S' },
        { idpertanyaan: 2, jenisjwb: 'A', kdkelompok: 'K1', jawaban: 'TS' },
      ],
    });
  });

  it('menonaktifkan tombol kirim selama belum semua soal terjawab (tidak mengirim payload tidak lengkap)', async () => {
    mockGetByUrl(kuesionerData);
    const postSpy = vi.spyOn(apiClient, 'post');

    const user = userEvent.setup();
    renderKuesionerPage();

    expect(await screen.findByText('Layanan cepat?', { exact: false })).toBeInTheDocument();

    const setujuButtons = screen.getAllByRole('button', { name: 'Setuju' });
    await user.click(setujuButtons[0]);

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

  it('menampilkan satu kategori per langkah dan hanya mengirim setelah kategori terakhir dilanjutkan', async () => {
    mockGetByUrl(multiKelompokData);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });

    const user = userEvent.setup();
    renderKuesionerPage();

    expect(await screen.findByText('Layanan cepat?', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('Fasilitas memadai?', { exact: false })).not.toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /lanjut/i });
    expect(nextButton).toBeDisabled();
    expect(screen.queryByRole('button', { name: /kirim semua jawaban/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Setuju' }));
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    expect(await screen.findByText('Fasilitas memadai?', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText('Layanan cepat?', { exact: false })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Setuju' }));
    await user.click(screen.getByRole('button', { name: /kirim semua jawaban/i }));

    await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
    expect(postSpy).toHaveBeenCalledWith('/kuesioner/jawaban', {
      kdperiode: '2026-1',
      jawaban: [
        { idpertanyaan: 1, jenisjwb: 'A', kdkelompok: 'K1', jawaban: 'S' },
        { idpertanyaan: 2, jenisjwb: 'A', kdkelompok: 'K2', jawaban: 'S' },
      ],
    });
  });

  afterEach(() => {
    clearToken();
  });
});
