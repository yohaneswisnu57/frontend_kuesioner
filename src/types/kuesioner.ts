export interface User {
  userid: string;
  status_pegawai: string;
  nama: string;
  role: string;
  is_dosen: boolean;
  is_tendik_fakultas: boolean;
  is_tendik_unit: boolean;
}

export interface Periode {
  kdperiode: string;
  is_aktif: number;
}

export interface Pertanyaan {
  idpertanyaan: number;
  pertanyaan: string;
  jenisjwb: 'A' | 'B' | 'P4' | string;
  kunci: string | null;
}

export type KategoriPegawai = 'dosen' | 'tendik_fakultas' | 'tendik_unit' | 'umum';

export interface Kelompok {
  kdkelompok: string;
  namakelompok: string;
  kategori_pegawai: KategoriPegawai;
  pertanyaan: Pertanyaan[];
}

export interface KuesionerData {
  is_sudah_mengisi: boolean;
  periode: Periode;
  kuesioner?: Kelompok[];
}

export interface JawabanPayload {
  idpertanyaan: number;
  jenisjwb: string;
  jawaban: string | number;
}

export interface SubmitPayload {
  kdperiode: string;
  jawaban: JawabanPayload[];
}
