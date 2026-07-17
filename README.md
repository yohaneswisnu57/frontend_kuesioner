# 📋 Kuesioner UKWMS

Aplikasi web untuk pengisian kuesioner evaluasi periodik civitas akademika **Universitas Katolik Widya Mandala Surabaya** — dosen, tenaga kependidikan unit, dan tenaga kependidikan fakultas. Dibangun dengan fokus pada pengalaman pengisian yang cepat, jelas, dan bebas gangguan.

## ✨ Fitur

- **Login berbasis NIP** — autentikasi terhubung ke sistem SIMANJA, dengan token tersimpan aman di perangkat.
- **Kuesioner bertahap (wizard)** — pertanyaan dikelompokkan per kategori dan diisi selangkah demi selangkah, lengkap dengan progress bar real-time.
- **Dua jenis jawaban** — skala Likert (Sangat Tidak Setuju → Sangat Setuju) untuk pertanyaan tertutup, dan area teks bebas untuk pertanyaan esai.
- **Validasi per langkah** — pengguna tidak bisa lanjut ke kategori berikutnya sebelum semua pertanyaan di kategori aktif terjawab.
- **Penanganan status cerdas** — pesan yang jelas saat periode kuesioner belum aktif, kelompok pertanyaan belum diset untuk peran pengguna, atau kuesioner sudah pernah diisi.
- **Mode gelap/terang** — mengikuti preferensi sistem, bisa diubah manual kapan saja.
- **Desain responsif** — nyaman digunakan dari ponsel maupun desktop, dengan target sentuh yang ramah jari.

## 🛠️ Teknologi

| Layer | Library |
|---|---|
| UI | React 19 + TypeScript |
| Routing | React Router 7 |
| Data fetching & cache | TanStack Query |
| HTTP client | Axios |
| Styling | Tailwind CSS |
| Build tool | Vite |
| Testing | Vitest + Testing Library |
| Linting | oxlint |

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 20+

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment variable
cp .env.example .env
# lalu sesuaikan VITE_API_URL dengan alamat backend API

# 3. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173` (default Vite).

### Skrip lain yang tersedia

```bash
npm run build     # build production ke folder dist/
npm run preview   # preview hasil build secara lokal
npm test          # menjalankan test suite (Vitest)
npm run lint      # menjalankan oxlint
```

## 📁 Struktur Proyek

```
src/
├── components/     # komponen UI yang dapat dipakai ulang (ThemeToggle, RequireAuth, dll.)
├── context/        # React Context untuk autentikasi dan tema
├── lib/            # klien API (axios) dan custom hooks (React Query)
├── pages/          # halaman utama: LoginPage, KuesionerPage
└── types/          # definisi tipe TypeScript untuk domain kuesioner
```

## 🔐 Konfigurasi Environment

| Variabel | Deskripsi | Contoh |
|---|---|---|
| `VITE_API_URL` | Base URL backend API kuesioner (Simanja2, Laravel Sanctum) | `http://localhost:8000/api` |

## 🚢 Deployment

Setiap push ke branch `main` otomatis memicu GitHub Actions untuk menjalankan test, melakukan build, dan men-deploy folder `dist/` ke server produksi via rsync.

## 📄 Lisensi

Proyek internal — hak cipta © Universitas Katolik Widya Mandala Surabaya.
