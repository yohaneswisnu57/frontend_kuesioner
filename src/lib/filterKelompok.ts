import type { Kelompok, User } from '../types/kuesioner';

export const filterKelompokByKategori = (kelompokList: Kelompok[], user: User | null | undefined): Kelompok[] =>
  kelompokList.filter((kelompok) => {
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
