import { describe, expect, it } from 'vitest';
import { filterKelompokByKategori } from './filterKelompok';
import type { Kelompok, User } from '../types/kuesioner';

const buildKelompok = (kdkelompok: string, kategori_pegawai: Kelompok['kategori_pegawai']): Kelompok => ({
  kdkelompok,
  namakelompok: `Kelompok ${kdkelompok}`,
  kategori_pegawai,
  pertanyaan: [],
});

const buildUser = (overrides: Partial<User> = {}): User => ({
  userid: '1',
  status_pegawai: '',
  nama: 'Test',
  role: '',
  is_dosen: false,
  is_tendik_fakultas: false,
  is_tendik_unit: false,
  ...overrides,
});

describe('filterKelompokByKategori', () => {
  const semuaKelompok = [
    buildKelompok('K-DOSEN', 'dosen'),
    buildKelompok('K-TF', 'tendik_fakultas'),
    buildKelompok('K-TU', 'tendik_unit'),
    buildKelompok('K-UMUM', 'umum'),
  ];

  it('user dosen hanya melihat kelompok dosen dan umum', () => {
    const user = buildUser({ is_dosen: true });
    const hasil = filterKelompokByKategori(semuaKelompok, user);
    expect(hasil.map((k) => k.kdkelompok)).toEqual(['K-DOSEN', 'K-UMUM']);
  });

  it('user tendik_fakultas hanya melihat kelompok tendik_fakultas dan umum', () => {
    const user = buildUser({ is_tendik_fakultas: true });
    const hasil = filterKelompokByKategori(semuaKelompok, user);
    expect(hasil.map((k) => k.kdkelompok)).toEqual(['K-TF', 'K-UMUM']);
  });

  it('user tendik_unit hanya melihat kelompok tendik_unit dan umum', () => {
    const user = buildUser({ is_tendik_unit: true });
    const hasil = filterKelompokByKategori(semuaKelompok, user);
    expect(hasil.map((k) => k.kdkelompok)).toEqual(['K-TU', 'K-UMUM']);
  });

  it('user tanpa flag kategori apa pun hanya melihat kelompok umum', () => {
    const user = buildUser();
    const hasil = filterKelompokByKategori(semuaKelompok, user);
    expect(hasil.map((k) => k.kdkelompok)).toEqual(['K-UMUM']);
  });

  it('user null/undefined tetap melihat kelompok umum saja, bukan crash', () => {
    expect(filterKelompokByKategori(semuaKelompok, null).map((k) => k.kdkelompok)).toEqual(['K-UMUM']);
    expect(filterKelompokByKategori(semuaKelompok, undefined).map((k) => k.kdkelompok)).toEqual(['K-UMUM']);
  });

  it('kelompok dengan kategori_pegawai tidak valid/kosong gagal tertutup (tidak ditampilkan ke siapa pun)', () => {
    const kelompokRusak = buildKelompok('K-RUSAK', '' as Kelompok['kategori_pegawai']);
    const user = buildUser({ is_dosen: true, is_tendik_fakultas: true, is_tendik_unit: true });
    const hasil = filterKelompokByKategori([kelompokRusak], user);
    expect(hasil).toEqual([]);
  });

  it('kelompok "Kritik dan Saran" selalu ditaruh paling akhir, apa pun urutan dari API', () => {
    const kritikSaran: Kelompok = { ...buildKelompok('K-KS', 'umum'), namakelompok: 'Kritik dan Saran' };
    const daftarDenganKritikDiAwal = [kritikSaran, ...semuaKelompok];
    const user = buildUser({ is_dosen: true });
    const hasil = filterKelompokByKategori(daftarDenganKritikDiAwal, user);
    expect(hasil.map((k) => k.kdkelompok)).toEqual(['K-DOSEN', 'K-UMUM', 'K-KS']);
  });

  it('pencocokan kelompok "Kritik dan Saran" tidak case-sensitive', () => {
    const kritikSaran: Kelompok = { ...buildKelompok('K-KS', 'umum'), namakelompok: 'KRITIK & SARAN' };
    const hasil = filterKelompokByKategori([kritikSaran, ...semuaKelompok], buildUser());
    expect(hasil.map((k) => k.kdkelompok)).toEqual(['K-UMUM', 'K-KS']);
  });
});
