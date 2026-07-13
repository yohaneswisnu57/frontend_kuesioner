export interface User {
  userid: string;
  nama: string;
  role: string;
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

export interface Kelompok {
  kdkelompok: string;
  namakelompok: string;
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
  kdkelompok: string;
  jawaban: string | number;
}

export interface SubmitPayload {
  kdperiode: string;
  jawaban: JawabanPayload[];
}
