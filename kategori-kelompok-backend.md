# Instruksi Backend: Field `kategori_pegawai` pada Kelompok Kuesioner

## Latar belakang

Frontend SPA (`frontend_survey`) saat ini menentukan kelompok pertanyaan mana yang boleh dilihat user dengan cara **string-matching** nama kelompok (`namakelompok`) terhadap kata kunci `"dosen"`, `"tendik fakultas"`, `"tendik unit"`, lalu mencocokkannya ke flag boolean user (`is_dosen`, `is_tendik_fakultas`, `is_tendik_unit`). Ini rapuh: kalau admin mengubah label tampilan kelompok (rebranding, perbaikan typo, terjemahan), filtering ikut rusak diam-diam tanpa ada yang sadar sampai user komplain tidak bisa isi kuesioner.

Perbaikan yang disepakati: pisahkan **label tampilan** (`namakelompok`) dari **kategori akses** (siapa yang berhak mengisi) dengan field eksplisit baru.

## Perubahan yang dibutuhkan di backend

### 1. Field baru pada entitas Kelompok

Tambahkan kolom `kategori_pegawai` pada tabel/entitas kelompok kuesioner, dengan tipe enum/string, **wajib diisi (NOT NULL)**, nilai yang diizinkan hanya salah satu dari 4 berikut:

```
'dosen' | 'tendik_fakultas' | 'tendik_unit' | 'umum'
```

- `'dosen'` — hanya tampil untuk user dengan `is_dosen = true`.
- `'tendik_fakultas'` — hanya tampil untuk user dengan `is_tendik_fakultas = true`.
- `'tendik_unit'` — hanya tampil untuk user dengan `is_tendik_unit = true`.
- `'umum'` — tampil untuk semua user, tanpa syarat kategori.

**Tidak boleh ada state kosong/null.** Ini keputusan desain yang disengaja (fail-closed): kalau field ini kosong, frontend tidak akan menampilkan kelompok tersebut sama sekali (lebih aman gagal tertutup daripada diam-diam bocor ke kategori yang salah). Karena itu field ini harus **wajib diisi** di level database/validasi, bukan opsional.

### 2. Response API `GET /kuesioner/pertanyaan`

Field `kategori_pegawai` harus disertakan pada setiap object kelompok dalam response ini (endpoint yang dipakai `useKuesioner` di frontend). Contoh shape yang diharapkan frontend:

```json
{
  "is_sudah_mengisi": false,
  "periode": { "kdperiode": "20251", "is_aktif": 1 },
  "kuesioner": [
    {
      "kdkelompok": "K01",
      "namakelompok": "Kepuasan Layanan Dosen",
      "kategori_pegawai": "dosen",
      "pertanyaan": [ ... ]
    },
    {
      "kdkelompok": "K05",
      "namakelompok": "Fasilitas Umum Kampus",
      "kategori_pegawai": "umum",
      "pertanyaan": [ ... ]
    }
  ]
}
```

Tidak ada perubahan lain pada shape response — `namakelompok` tetap ada dan tetap dipakai murni sebagai label tampilan (judul step di wizard), sudah tidak lagi dipakai untuk logika filtering.

### 3. Backfill data existing

Semua kelompok yang sudah ada di database harus diisi `kategori_pegawai` berdasarkan `namakelompok` yang sudah bersih/konsisten (dikonfirmasi sudah di-set rapi oleh admin: persis mengandung "DOSEN", "TENDIK UNIT", "TENDIK FAKULTAS", atau selain itu berarti umum). Jalankan migrasi/skrip satu kali untuk memetakan otomatis, contoh logika pemetaan (sesuaikan dengan konvensi penamaan aktual di database):

```
lower(namakelompok) mengandung "dosen"           -> kategori_pegawai = 'dosen'
lower(namakelompok) mengandung "tendik fakultas" -> kategori_pegawai = 'tendik_fakultas'
lower(namakelompok) mengandung "tendik unit"     -> kategori_pegawai = 'tendik_unit'
selain itu                                       -> kategori_pegawai = 'umum'
```

**Setelah backfill, wajib verifikasi manual**: query semua kelompok aktif dan pastikan setiap baris punya `kategori_pegawai` terisi salah satu dari 4 nilai valid, tidak ada yang null/kosong.

### 4. Panel admin (di luar scope frontend SPA ini)

Form/panel admin yang dipakai untuk mengelola Kelompok (di luar repo `frontend_survey`) perlu ditambah input untuk `kategori_pegawai` (dropdown 4 pilihan di atas), supaya admin bisa mengelola kategori ini untuk kelompok baru ke depannya tanpa perlu ubah database manual.

## Urutan rilis (penting)

Frontend versi baru akan **fail-closed** kalau `kategori_pegawai` tidak ada/kosong pada suatu kelompok — kelompok itu tidak akan ditampilkan sama sekali ke user manapun. Karena itu urutan wajib:

1. **Backend deploy dulu**: tambahkan field, jalankan backfill, verifikasi semua kelompok aktif sudah terisi.
2. Baru setelah dikonfirmasi aman, **frontend deploy** menyusul dengan logika filter versi baru (baca `kategori_pegawai`, bukan lagi string-matching `namakelompok`).

Frontend versi lama (yang masih string-matching) tetap kompatibel dan tidak terpengaruh selama masa transisi backend deploy duluan — field baru itu akan diabaikan begitu saja oleh frontend lama.

## Yang TIDAK berubah

- Endpoint lain (`/kuesioner/login-sso`, `/kuesioner/user`, submit jawaban) tidak terpengaruh.
- Flag `is_dosen` / `is_tendik_fakultas` / `is_tendik_unit` pada `User` tetap seperti sekarang, tidak berubah.
- `namakelompok` tetap ada dan tetap dipakai sebagai label tampilan saja.
