import type { Kelompok, User } from '../types/kuesioner';

const isKelompokKritikSaran = (namakelompok: string): boolean => {
  const nama = namakelompok.toLowerCase();
  return nama.includes('kritik') && nama.includes('saran');
};

const URUTAN_KELOMPOK_PRIORITAS = [
  'Layanan Pengelola Institusi',
  'Layanan Kepegawaian',
  'Layanan Jaminan Keamanan dan Kebersihan',
  'Layanan Teknologi Informasi',
  'Layanan Pengembangan Karir',
  'Sarana Prasarana',
  'Pemahaman Visi Misi',
  'Pemahaman Nilai Keutamaan',
  'Pemahaman Patron Universitas',
];

export const filterKelompokByKategori = (kelompokList: Kelompok[], user: User | null | undefined): Kelompok[] => {
  const hasil = kelompokList.filter((kelompok) => {
    switch (kelompok.kategori_pegawai) {
      case 'dosen':
        return Boolean(user?.is_dosen);
      case 'tendik_fakultas':
        return Boolean(user?.is_tendik_fakultas);
      case 'tendik_unit':
        return Boolean(user?.is_tendik_unit);
      case 'umum':
        return true;
      default:
        return false;
    }
  });

  // Kelompok "Kritik dan Saran" selalu ditampilkan paling akhir, apa pun urutan dari API.
  const utama = hasil.filter((k) => !isKelompokKritikSaran(k.namakelompok));
  const kritikSaran = hasil.filter((k) => isKelompokKritikSaran(k.namakelompok));

  // Kelompok lain diurutkan sesuai URUTAN_KELOMPOK_PRIORITAS; yang tidak ada di daftar
  // tersebut tetap mempertahankan urutan relatifnya dan diletakkan setelah yang match.
  const utamaTerurut = [...utama].sort((a, b) => {
    const indexA = URUTAN_KELOMPOK_PRIORITAS.indexOf(a.namakelompok);
    const indexB = URUTAN_KELOMPOK_PRIORITAS.indexOf(b.namakelompok);
    const prioritasA = indexA === -1 ? Infinity : indexA;
    const prioritasB = indexB === -1 ? Infinity : indexB;
    return prioritasA - prioritasB;
  });

  return [...utamaTerurut, ...kritikSaran];
};
