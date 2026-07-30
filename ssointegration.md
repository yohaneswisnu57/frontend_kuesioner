# Panduan Tim Frontend — SPA Kuesioner (`stagingsurvey.ukwms.ac.id`)

> **Dari**: Tim Simanja2  
> **Untuk**: Tim Frontend SPA Kuesioner  
> **Tanggal**: 29 Juli 2026

---

## Daftar Isi

1. [Arsitektur & Alur SSO](#1-arsitektur--alur-sso)
2. [Konfigurasi](#2-konfigurasi)
3. [Implementasi Callback](#3-implementasi-callback)
4. [Auth Guard](#4-auth-guard)
5. [API Client](#5-api-client)
6. [Logout](#6-logout)
7. [Daftar API Endpoints](#7-daftar-api-endpoints)
8. [Testing Checklist](#8-testing-checklist)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Arsitektur & Alur SSO

### Komponen yang Terlibat

| Komponen | Domain | Fungsi |
|----------|--------|--------|
| **SPA Kuesioner** | `stagingsurvey.ukwms.ac.id` | Frontend aplikasi kuesioner |
| **SSO Server** | `app.ukwms.ac.id` | Autentikasi terpusat (login/logout) |
| **Simanja2 API** | `simanja2.ukwms.ac.id` | Backend API untuk data kuesioner |

### Alur Login (Sequence Diagram)

```
┌──────────┐     ┌─────────────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  User    │     │  SPA Kuesioner          │     │  SSO Server      │     │  Simanja2 API      │
│ Browser  │     │  stagingsurvey.ukwms    │     │  app.ukwms       │     │  simanja2.ukwms    │
└────┬─────┘     └───────────┬─────────────┘     └────────┬─────────┘     └──────────┬─────────┘
     │                       │                            │                          │
     │  1. Akses SPA         │                            │                          │
     │──────────────────────>│                            │                          │
     │                       │                            │                          │
     │                       │ 2. Cek localStorage        │                          │
     │                       │    (sanctum_token)         │                          │
     │                       │                            │                          │
     │  3. Redirect ke SSO   │                            │                          │
     │<──────────────────────│                            │                          │
     │                       │                            │                          │
     │  4. Buka halaman SSO login                         │                          │
     │───────────────────────────────────────────────────>│                          │
     │                       │                            │                          │
     │                       │        5. User login       │                          │
     │                       │                            │                          │
     │  6. Redirect ke callback?token=SSO_TOKEN           │                          │
     │<──────────────────────────────────────────────────-│                          │
     │                       │                            │                          │
     │  7. SPA tangkap token │                            │                          │
     │──────────────────────>│                            │                          │
     │                       │                            │                          │
     │                       │  8. POST /api/kuesioner/login-sso {token: SSO_TOKEN}  │
     │                       │──────────────────────────────────────────────────────>│
     │                       │                            │                          │
     │                       │                            │  9. Validasi token       │
     │                       │                            │<─────────────────────────│
     │                       │                            │                          │
     │                       │                            │  10. Return user data    │
     │                       │                            │─────────────────────────>│
     │                       │                            │                          │
     │                       │  11. Response: {sanctum_token, user}                  │
     │                       │<─────────────────────────────────────────────────────-│
     │                       │                            │                          │
     │                       │ 12. Simpan sanctum_token   │                          │
     │                       │     di localStorage        │                          │
     │                       │                            │                          │
     │  13. Tampilkan SPA    │                            │                          │
     │<──────────────────────│                            │                          │
```

### Penjelasan Alur

1. User membuka `stagingsurvey.ukwms.ac.id`
2. SPA cek apakah ada `sanctum_token` di `localStorage`
3. Jika tidak ada → redirect ke SSO login
4. User login di halaman SSO `app.ukwms.ac.id`
5. SSO redirect kembali ke SPA dengan **SSO token** di query parameter
6. SPA mengirim SSO token ke Simanja2 API untuk ditukar menjadi **Sanctum token**
7. Simanja2 memvalidasi SSO token ke SSO server
8. Jika valid, Simanja2 mengembalikan Sanctum token
9. SPA menyimpan Sanctum token dan menggunakannya untuk semua API call selanjutnya

---

## 2. Konfigurasi

Gunakan environment variables untuk menyimpan URL. Contoh file `.env`:

```env
# SSO Server
VITE_SSO_URL=https://app.ukwms.ac.id

# Simanja2 API
VITE_API_BASE_URL=https://simanja2.ukwms.ac.id

# SPA Callback URL (domain SPA sendiri)
VITE_CALLBACK_URL=https://stagingsurvey.ukwms.ac.id/callback
```

> 💡 Prefix `VITE_` untuk Vite.js. Sesuaikan prefix sesuai framework yang digunakan (misal `REACT_APP_` untuk CRA, `NEXT_PUBLIC_` untuk Next.js).

Buat file konfigurasi:

```javascript
// config.js
const config = {
    SSO_URL: import.meta.env.VITE_SSO_URL || 'https://app.ukwms.ac.id',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://simanja2.ukwms.ac.id',
    CALLBACK_URL: import.meta.env.VITE_CALLBACK_URL || window.location.origin + '/callback',
};

export default config;
```

---

## 3. Implementasi Callback

Buat halaman/route `/callback` yang menangkap SSO token dari URL dan menukarnya menjadi Sanctum token.

```javascript
// callback.js
// This page handles the redirect from SSO after successful login.
// URL format: /callback?token=<SSO_TOKEN>

import config from './config.js';

async function handleSSOCallback() {
    // 1. Extract SSO token from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('token');

    if (!ssoToken) {
        console.error('SSO token not found in URL');
        showError('Token SSO tidak ditemukan. Silakan coba login kembali.');
        return;
    }

    // 2. Clean the URL (remove token from address bar for security)
    window.history.replaceState({}, document.title, '/callback');

    try {
        // 3. Exchange SSO token for Sanctum token via Simanja2 API
        const response = await fetch(`${config.API_BASE_URL}/api/kuesioner/login-sso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ token: ssoToken }),
        });

        const data = await response.json();

        // 4. Handle response
        if (response.ok && data.success) {
            // Store Sanctum token and user data
            localStorage.setItem('sanctum_token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Redirect to main page
            window.location.href = '/';
        } else {
            // Login failed
            console.error('SSO login failed:', data.message);
            showError(data.message || 'Login gagal. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Network error during SSO callback:', error);
        showError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }
}

function showError(message) {
    // Display error message to user (implement according to your UI framework)
    // Example: redirect to error page with message
    const errorPage = `/login-error?message=${encodeURIComponent(message)}`;
    window.location.href = errorPage;
}

// Execute on page load
handleSSOCallback();
```

### Response yang Diharapkan dari API

**Sukses (200):**
```json
{
    "success": true,
    "message": "Login SSO berhasil.",
    "data": {
        "token": "1|abc123def456...",
        "user": {
            "userid": "user123",
            "nama": "Nama Lengkap User",
            "role": "Nama Role"
        }
    }
}
```

**Gagal — Token invalid (401):**
```json
{
    "success": false,
    "message": "Token SSO tidak valid atau sudah kedaluwarsa."
}
```

**Gagal — User tidak terdaftar (404):**
```json
{
    "success": false,
    "message": "User tidak terdaftar di sistem Simanja."
}
```

---

## 4. Auth Guard

Proteksi halaman yang memerlukan login. Panggil fungsi ini sebelum menampilkan konten yang memerlukan autentikasi.

```javascript
// auth.js
// Authentication utilities for the SPA

import config from './config.js';

/**
 * Check if user is authenticated.
 * If not, redirect to SSO login page.
 * @returns {boolean} true if authenticated
 */
export function requireAuth() {
    const token = localStorage.getItem('sanctum_token');

    if (!token) {
        redirectToSSO();
        return false;
    }

    return true;
}

/**
 * Redirect user to SSO login page.
 * After login, SSO will redirect back to our callback URL.
 */
export function redirectToSSO() {
    const callbackUrl = encodeURIComponent(config.CALLBACK_URL);
    window.location.href = `${config.SSO_URL}/login?redirect=${callbackUrl}`;
}

/**
 * Get stored user data.
 * @returns {object|null} user object or null
 */
export function getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Get stored Sanctum token.
 * @returns {string|null} token or null
 */
export function getToken() {
    return localStorage.getItem('sanctum_token');
}

/**
 * Clear all authentication data from localStorage.
 */
export function clearAuth() {
    localStorage.removeItem('sanctum_token');
    localStorage.removeItem('user');
}
```

### Contoh Penggunaan Auth Guard

```javascript
// Di halaman utama atau router
import { requireAuth, getUser } from './auth.js';

// Check authentication before showing content
if (requireAuth()) {
    const user = getUser();
    console.log(`Welcome, ${user.nama}`);

    // Show main content...
}
```

---

## 5. API Client

Module untuk berkomunikasi dengan Simanja2 API. Otomatis menangani token dan redirect saat session expired.

```javascript
// api.js
// API client for communicating with Simanja2 backend

import config from './config.js';
import { getToken, clearAuth, redirectToSSO } from './auth.js';

/**
 * Make an authenticated API request to Simanja2.
 * Automatically handles 401 (unauthorized) by redirecting to SSO.
 *
 * @param {string} endpoint - API endpoint path (e.g., '/pertanyaan')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
        redirectToSSO();
        return;
    }

    const url = `${config.API_BASE_URL}/api/kuesioner${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        // Handle 401 Unauthorized — token expired or revoked
        if (response.status === 401) {
            clearAuth();
            redirectToSSO();
            return;
        }

        return await response.json();
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

// ============================================
// Convenience methods
// ============================================

/**
 * Get kuesioner questions for the active period.
 */
export async function getPertanyaan() {
    return apiRequest('/pertanyaan');
}

/**
 * Submit kuesioner answers.
 * @param {object} jawaban - Answer data to submit
 */
export async function submitJawaban(jawaban) {
    return apiRequest('/jawaban', {
        method: 'POST',
        body: JSON.stringify(jawaban),
    });
}

/**
 * Get current user profile.
 */
export async function getUserProfile() {
    return apiRequest('/user');
}
```

### Contoh Penggunaan API Client

```javascript
import { getPertanyaan, submitJawaban } from './api.js';

// Fetch questions
const result = await getPertanyaan();
if (result && result.success) {
    const pertanyaan = result.data;
    // Render questions...
}

// Submit answers
const jawaban = {
    // ... answer data according to API spec
};
const submitResult = await submitJawaban(jawaban);
if (submitResult && submitResult.success) {
    alert('Jawaban berhasil disimpan!');
}
```

---

## 6. Logout

```javascript
// logout.js
// Handle user logout — revoke Sanctum token and redirect to SSO

import config from './config.js';
import { getToken, clearAuth } from './auth.js';

/**
 * Logout user:
 * 1. Revoke Sanctum token via API
 * 2. Clear local storage
 * 3. Redirect to SSO login
 */
export async function logout() {
    const token = getToken();

    // 1. Revoke Sanctum token on the server
    if (token) {
        try {
            await fetch(`${config.API_BASE_URL}/api/kuesioner/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
        } catch (error) {
            // Non-blocking: proceed even if revoke fails
            console.warn('Token revoke failed:', error);
        }
    }

    // 2. Clear all auth data from localStorage
    clearAuth();

    // 3. Redirect to SSO login page
    const callbackUrl = encodeURIComponent(config.CALLBACK_URL);
    window.location.href = `${config.SSO_URL}/login?redirect=${callbackUrl}`;
}
```

### Contoh Penggunaan

```html
<button onclick="handleLogout()">Logout</button>

<script>
import { logout } from './logout.js';

async function handleLogout() {
    await logout();
}
</script>
```

---

## 7. Daftar API Endpoints

Semua endpoint berikut tersedia di `simanja2.ukwms.ac.id`:

### Endpoint Publik (Tanpa Token)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/kuesioner/login-sso` | Exchange SSO token → Sanctum token |

**Request body:**
```json
{ "token": "<SSO_TOKEN>" }
```

### Endpoint Terproteksi (Perlu Sanctum Token)

Semua endpoint berikut memerlukan header:
```
Authorization: Bearer <SANCTUM_TOKEN>
Accept: application/json
```

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/kuesioner/user` | Mendapatkan profil user yang sedang login |
| POST | `/api/kuesioner/logout` | Logout & revoke Sanctum token |
| GET | `/api/kuesioner/pertanyaan` | Mendapatkan daftar pertanyaan kuesioner |
| POST | `/api/kuesioner/jawaban` | Mengirim jawaban kuesioner |

---

## 8. Testing Checklist

Gunakan checklist ini untuk memverifikasi implementasi:

### Alur Login
- [ ] Buka SPA tanpa token → otomatis redirect ke SSO login
- [ ] Login di SSO → redirect ke `/callback?token=xxx`
- [ ] Callback berhasil exchange token → redirect ke halaman utama
- [ ] Token tersimpan di `localStorage`
- [ ] Halaman utama menampilkan data user yang benar

### API Calls
- [ ] GET `/api/kuesioner/pertanyaan` mengembalikan data
- [ ] POST `/api/kuesioner/jawaban` berhasil menyimpan
- [ ] Request dengan token expired → redirect ke SSO login (bukan error page)

### Logout
- [ ] Klik logout → token di-revoke → redirect ke SSO login
- [ ] Setelah logout, buka SPA → redirect ke SSO login (bukan menampilkan data lama)

### Edge Cases
- [ ] Buka `/callback` tanpa parameter `token` → tampilkan error
- [ ] SSO token invalid → tampilkan pesan error yang informatif
- [ ] User terdaftar di SSO tapi tidak di Simanja2 → tampilkan pesan error 404

---

## 9. Troubleshooting

### Error CORS

**Gejala**: Console browser menampilkan error `Access-Control-Allow-Origin`.

**Solusi**: CORS di Simanja2 sudah dikonfigurasi untuk menerima semua origin (`*`). Pastikan:
- Tidak menambahkan `credentials: 'include'` pada `fetch()` — ini tidak diperlukan
- URL API benar (`https://simanja2.ukwms.ac.id`)

### Token SSO Invalid

**Gejala**: API mengembalikan 401 saat exchange token.

**Kemungkinan**:
- Token sudah expired (waktu antara redirect SSO dan exchange terlalu lama)
- Token sudah pernah digunakan (one-time use)
- SSO server tidak bisa dihubungi oleh Simanja2

### Token Sanctum Expired

**Gejala**: API tiba-tiba mengembalikan 401 setelah sebelumnya bekerja.

**Solusi**: Auth guard di API client sudah menangani ini secara otomatis — user akan di-redirect ke SSO login. Pastikan logika 401 handling di `apiRequest()` sudah ter-implementasi.

---

## Kontak

Jika ada pertanyaan terkait API atau integrasi, silakan hubungi Tim Simanja2.
