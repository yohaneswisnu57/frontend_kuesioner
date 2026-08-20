import type { Kelompok, User } from '../types/kuesioner';

const isKelompokKritikSaran = (namakelompok: string | null | undefined): boolean => {
  const nama = (namakelompok ?? '').toLowerCase();
  return nama.includes('kritik') && nama.includes('saran');
};

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

  // Kelompok lain diurutkan sesuai kolom `urutan` dari backend (sumber kebenaran),
  // bukan pencocokan nama string yang rapuh terhadap typo/spasi.
  const utamaTerurut = [...utama].sort((a, b) => a.urutan - b.urutan);

  return [...utamaTerurut, ...kritikSaran];
};
