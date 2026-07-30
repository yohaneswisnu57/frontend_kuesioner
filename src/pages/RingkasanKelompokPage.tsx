import { ArrowLeftIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useKuesioner } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { filterKelompokByKategori } from '../lib/filterKelompok';

const KATEGORI_LABEL: Record<string, string> = {
  dosen: 'Dosen',
  tendik_fakultas: 'Tendik Fakultas',
  tendik_unit: 'Tendik Unit',
  umum: 'Umum',
};

const kategoriUser = (user: ReturnType<typeof useAuth>['user']) => {
  if (!user) return [];
  const kategori: string[] = [];
  if (user.is_dosen) kategori.push('Dosen');
  if (user.is_tendik_fakultas) kategori.push('Tendik Fakultas');
  if (user.is_tendik_unit) kategori.push('Tendik Unit');
  return kategori;
};

export const RingkasanKelompokPage = () => {
  const { user } = useAuth();
  const { data: kuesionerData, isLoading, isError, error } = useKuesioner();

  const kelompokList = filterKelompokByKategori(kuesionerData?.kuesioner ?? [], user);
  const totalPertanyaan = kelompokList.reduce((sum, k) => sum + k.pertanyaan.length, 0);
  const kategoriLabelUser = kategoriUser(user);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 px-4 py-10 dark:bg-zinc-950 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/kuesioner"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeftIcon size={16} weight="bold" />
          Kembali ke Kuesioner
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900 md:p-8">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ringkasan Jumlah Pertanyaan per Kelompok
          </h1>
          {kuesionerData?.periode?.kdperiode && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Periode: {kuesionerData.periode.kdperiode}
            </p>
          )}
          {user && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Login sebagai <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{user.nama}</strong> — kategori:{' '}
              {kategoriLabelUser.length > 0 ? (
                kategoriLabelUser.join(', ')
              ) : (
                <span className="italic">tidak ada kategori khusus (hanya kelompok umum)</span>
              )}
            </p>
          )}

          {isLoading && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <SpinnerGapIcon size={18} weight="bold" className="animate-spin text-amber-500" />
              Memuat data...
            </div>
          )}

          {isError && (
            <p className="mt-8 text-sm text-rose-600 dark:text-rose-400">{getErrorMessage(error)}</p>
          )}

          {!isLoading && !isError && kelompokList.length === 0 && (
            <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
              Tidak ada kelompok pertanyaan yang berlaku untuk kategori Anda pada periode ini.
            </p>
          )}

          {!isLoading && !isError && kelompokList.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                    <th className="py-2 pr-4 font-semibold">Kode</th>
                    <th className="py-2 pr-4 font-semibold">Nama Kelompok</th>
                    <th className="py-2 pr-4 font-semibold">Kategori</th>
                    <th className="py-2 pr-0 text-right font-semibold">Jumlah Pertanyaan</th>
                  </tr>
                </thead>
                <tbody>
                  {kelompokList.map((kelompok) => (
                    <tr
                      key={kelompok.kdkelompok}
                      className="border-b border-zinc-100 text-zinc-700 last:border-0 dark:border-white/5 dark:text-zinc-200"
                    >
                      <td className="py-2 pr-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{kelompok.kdkelompok}</td>
                      <td className="py-2 pr-4">{kelompok.namakelompok}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          {KATEGORI_LABEL[kelompok.kategori_pegawai] ?? (kelompok.kategori_pegawai || '(kosong)')}
                        </span>
                      </td>
                      <td className="py-2 pr-0 text-right font-semibold">{kelompok.pertanyaan.length}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-200 font-bold text-zinc-900 dark:border-white/10 dark:text-zinc-50">
                    <td className="py-2 pr-4" colSpan={3}>
                      Total
                    </td>
                    <td className="py-2 pr-0 text-right">{totalPertanyaan}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
