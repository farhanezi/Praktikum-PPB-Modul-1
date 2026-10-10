# Library Loan API

REST API sederhana untuk layanan **pencatatan peminjaman buku perpustakaan**, dibangun dengan **Node.js + Express.js**, database **Supabase (PostgreSQL)**, dan di-deploy ke **Vercel**.

> Responsi Praktikum Pemrograman Perangkat Bergerak (PPB) 2026, Modul 1: Application Programming Interface (API)

## Link Deployment

| | URL |
|---|---|
| **Base URL (Vercel)** | `https://GANTI-DENGAN-URL-VERCEL.vercel.app` |
| Contoh filter | `https://GANTI-DENGAN-URL-VERCEL.vercel.app/loans?status=Terlambat` |

---

## Deskripsi & Tujuan

Perpustakaan perlu mencatat buku apa yang dipinjam oleh anggota mana, kapan harus dikembalikan, dan peminjaman mana yang sudah terlambat. API ini menyediakan:

- **CRUD data peminjaman** (`/loans`): membuat, melihat, mengubah (termasuk mencatat pengembalian), dan menghapus peminjaman.
- **Filter query**: menyaring peminjaman berdasarkan `status`, `member_id`, atau `book_id`, contohnya `GET /loans?status=Terlambat`.
- **CRUD data pendukung**: buku (`/books`) dan anggota (`/members`).
- **Status terlambat otomatis**: peminjaman berstatus `Dipinjam` yang sudah melewati `due_date` otomatis diubah menjadi `Terlambat` setiap kali data peminjaman dibaca.

Tujuan proyek:
1. Menerapkan arsitektur RESTful API (GET, POST, PUT, DELETE) untuk operasi CRUD.
2. Memisahkan logika aplikasi ke dalam **model**, **controller**, dan **router**.
3. Menghubungkan Express.js dengan Supabase sebagai *backend-as-a-service*.
4. Menggunakan *environment variable* untuk kredensial dan men-deploy API ke Vercel.

## Tech Stack

- Node.js (ES Modules) & Express.js 5
- Supabase (`@supabase/supabase-js`)
- dotenv, nodemon (development)
- Vercel (`@vercel/node`)

## Struktur Proyek

```
.
├── src/
│   ├── config/
│   │   └── supabaseClient.js     # inisialisasi klien Supabase dari .env
│   ├── controllers/              # memproses request & response HTTP
│   │   ├── bookController.js
│   │   ├── loanController.js
│   │   └── memberController.js
│   ├── models/                   # query ke tabel Supabase
│   │   ├── bookModel.js
│   │   ├── loanModel.js
│   │   └── memberModel.js
│   ├── routes/                   # pemetaan URL -> controller
│   │   ├── bookRoutes.js
│   │   ├── loanRoutes.js
│   │   └── memberRoutes.js
│   ├── utils/
│   │   └── date.js               # helper tanggal (zona Asia/Jakarta)
│   └── index.js                  # entry point server Express
├── schema.sql                    # skema tabel + data contoh untuk Supabase
├── .env.example                  # template environment variable
├── vercel.json                   # konfigurasi deployment Vercel
└── package.json
```

## Struktur Data / Schema

Relasi: satu **anggota** bisa memiliki banyak **peminjaman**, dan satu **buku** bisa dipinjam berkali-kali.

```
members (1) ──< loans >── (1) books
```

### `members` (anggota)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | Primary key, otomatis (`gen_random_uuid()`) |
| `member_code` | text | Kode anggota, unik, wajib (contoh `AGT-001`) |
| `name` | text | Nama anggota, wajib |
| `email` | text | Opsional |
| `phone` | text | Opsional |
| `created_at` | timestamptz | Otomatis |

### `books` (buku)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | Primary key, otomatis |
| `isbn` | text | Unik |
| `title` | text | Judul, wajib |
| `author` | text | Penulis, wajib |
| `publisher` | text | Opsional |
| `year` | integer | Tahun terbit |
| `stock` | integer | Default `0`, tidak boleh negatif |
| `created_at` | timestamptz | Otomatis |

### `loans` (peminjaman)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | Primary key, otomatis |
| `member_id` | uuid | FK → `members.id`, wajib |
| `book_id` | uuid | FK → `books.id`, wajib |
| `loan_date` | date | Tanggal pinjam, default hari ini |
| `due_date` | date | Jatuh tempo, wajib (API mengisi `loan_date + 7 hari` jika kosong), harus `>= loan_date` |
| `return_date` | date | Tanggal kembali, `null` jika belum dikembalikan |
| `status` | text | `Dipinjam` \| `Dikembalikan` \| `Terlambat` (default `Dipinjam`) |
| `notes` | text | Catatan, opsional |
| `created_at` | timestamptz | Otomatis |

Format tanggal: `YYYY-MM-DD`. Skema lengkap dan data contoh ada di [`schema.sql`](schema.sql).

## Daftar Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Info API & daftar endpoint |
| GET | `/loans` | Semua peminjaman (beserta data anggota & buku) |
| GET | `/loans?status=Terlambat` | Filter berdasarkan status |
| GET | `/loans?member_id=<uuid>` | Filter berdasarkan anggota |
| GET | `/loans?book_id=<uuid>` | Filter berdasarkan buku |
| GET | `/loans/:id` | Detail satu peminjaman |
| POST | `/loans` | Tambah peminjaman |
| PUT | `/loans/:id` | Ubah peminjaman / catat pengembalian |
| DELETE | `/loans/:id` | Hapus peminjaman |
| GET | `/books` | Semua buku (filter: `?title=`, `?author=`) |
| GET | `/books/:id` | Detail buku |
| POST | `/books` | Tambah buku |
| PUT | `/books/:id` | Ubah buku |
| DELETE | `/books/:id` | Hapus buku |
| GET | `/members` | Semua anggota (filter: `?name=`) |
| GET | `/members/:id` | Detail anggota |
| POST | `/members` | Tambah anggota |
| PUT | `/members/:id` | Ubah anggota |
| DELETE | `/members/:id` | Hapus anggota |

Filter query bisa digabung, misalnya `/loans?status=Dipinjam&member_id=<uuid>`. Nilai `status` tidak peka huruf besar/kecil (`terlambat` = `Terlambat`).

Kode status HTTP: `200` OK · `201` data dibuat · `400` input tidak valid · `404` data/endpoint tidak ditemukan · `500` kesalahan server.

## Contoh Request & Response

Ganti `BASE_URL` dengan `http://localhost:3000` (lokal) atau URL Vercel.

### 1. Tambah anggota: `POST /members`
```bash
curl -X POST BASE_URL/members \
  -H "Content-Type: application/json" \
  -d '{"member_code":"AGT-004","name":"Dewi Lestari","email":"dewi@email.com","phone":"08131234567"}'
```
Response `201 Created`
```json
{
  "id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11",
  "member_code": "AGT-004",
  "name": "Dewi Lestari",
  "email": "dewi@email.com",
  "phone": "08131234567",
  "created_at": "2026-10-10T08:00:00.000000+00:00"
}
```

### 2. Tambah buku: `POST /books`
```bash
curl -X POST BASE_URL/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"978-623-000-005-5","title":"Filosofi Teras","author":"Henry Manampiring","publisher":"Kompas","year":2018,"stock":3}'
```
Response `201 Created`
```json
{
  "id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30",
  "isbn": "978-623-000-005-5",
  "title": "Filosofi Teras",
  "author": "Henry Manampiring",
  "publisher": "Kompas",
  "year": 2018,
  "stock": 3,
  "created_at": "2026-10-10T08:01:00.000000+00:00"
}
```

### 3. Tambah peminjaman: `POST /loans`
`loan_date` dan `due_date` opsional (default: hari ini dan +7 hari).
```bash
curl -X POST BASE_URL/loans \
  -H "Content-Type: application/json" \
  -d '{"member_id":"6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11","book_id":"0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30","notes":"Pinjam untuk tugas"}'
```
Response `201 Created`
```json
{
  "id": "c3a9e4f1-58b2-4c07-b6d3-91e2f7a0c845",
  "member_id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11",
  "book_id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30",
  "loan_date": "2026-10-10",
  "due_date": "2026-10-17",
  "return_date": null,
  "status": "Dipinjam",
  "notes": "Pinjam untuk tugas",
  "created_at": "2026-10-10T08:02:00.000000+00:00",
  "member": { "id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11", "member_code": "AGT-004", "name": "Dewi Lestari" },
  "book": { "id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30", "title": "Filosofi Teras", "author": "Henry Manampiring" }
}
```
Jika `member_id` atau `book_id` tidak dikirim → `400`:
```json
{ "error": "member_id dan book_id wajib diisi" }
```

### 4. Lihat semua peminjaman: `GET /loans`
```bash
curl BASE_URL/loans
```
Response `200 OK`: array peminjaman, diurutkan dari `loan_date` terbaru.

### 5. Filter peminjaman terlambat: `GET /loans?status=Terlambat`
```bash
curl "BASE_URL/loans?status=Terlambat"
```
Response `200 OK`
```json
[
  {
    "id": "8d27b6c0-4e1a-4b95-a3f8-6c0d2e9f1a72",
    "member_id": "1a2b3c4d-0000-4000-8000-000000000001",
    "book_id": "5e6f7a8b-0000-4000-8000-000000000004",
    "loan_date": "2026-09-28",
    "due_date": "2026-10-05",
    "return_date": null,
    "status": "Terlambat",
    "notes": "Lewat jatuh tempo, otomatis jadi Terlambat",
    "created_at": "2026-10-10T07:00:00.000000+00:00",
    "member": { "id": "1a2b3c4d-0000-4000-8000-000000000001", "member_code": "AGT-001", "name": "Budi Santoso" },
    "book": { "id": "5e6f7a8b-0000-4000-8000-000000000004", "title": "Atomic Habits", "author": "James Clear" }
  }
]
```
Status yang tidak dikenal → `400`:
```json
{ "error": "Status tidak valid. Gunakan salah satu: Dipinjam, Dikembalikan, Terlambat" }
```

### 6. Detail peminjaman: `GET /loans/:id`
```bash
curl BASE_URL/loans/c3a9e4f1-58b2-4c07-b6d3-91e2f7a0c845
```
Response `200 OK`: satu objek peminjaman (format sama seperti nomor 3). Jika id tidak ada → `404`:
```json
{ "error": "Data peminjaman tidak ditemukan" }
```

### 7. Catat pengembalian buku: `PUT /loans/:id`
Jika `return_date` dikirim tanpa `status`, status otomatis menjadi `Dikembalikan`.
```bash
curl -X PUT BASE_URL/loans/c3a9e4f1-58b2-4c07-b6d3-91e2f7a0c845 \
  -H "Content-Type: application/json" \
  -d '{"return_date":"2026-10-15"}'
```
Response `200 OK`
```json
{
  "id": "c3a9e4f1-58b2-4c07-b6d3-91e2f7a0c845",
  "member_id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11",
  "book_id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30",
  "loan_date": "2026-10-10",
  "due_date": "2026-10-17",
  "return_date": "2026-10-15",
  "status": "Dikembalikan",
  "notes": "Pinjam untuk tugas",
  "created_at": "2026-10-10T08:02:00.000000+00:00",
  "member": { "id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11", "member_code": "AGT-004", "name": "Dewi Lestari" },
  "book": { "id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30", "title": "Filosofi Teras", "author": "Henry Manampiring" }
}
```
PUT juga bisa dipakai untuk mengubah kolom lain, misalnya memperpanjang `due_date`: `{"due_date":"2026-10-24"}`.

### 8. Hapus peminjaman: `DELETE /loans/:id`
```bash
curl -X DELETE BASE_URL/loans/c3a9e4f1-58b2-4c07-b6d3-91e2f7a0c845
```
Response `200 OK`
```json
{ "message": "Data peminjaman berhasil dihapus" }
```

> Anggota atau buku yang masih tercatat di tabel `loans` tidak bisa dihapus (dibatasi foreign key) dan API akan mengembalikan `400`. Hapus dulu data peminjamannya.

## Instalasi & Menjalankan Lokal

**Prasyarat:** Node.js 18+ dan akun [Supabase](https://supabase.com).

1. **Clone repository**
   ```bash
   git clone https://github.com/farhanezi/Praktikum-PPB-Modul-1.git
   cd Praktikum-PPB-Modul-1
   ```
2. **Install dependency**
   ```bash
   npm install
   ```
3. **Siapkan database Supabase**
   - Buat project di Supabase.
   - Buka **SQL Editor** → **New query**, salin seluruh isi [`schema.sql`](schema.sql), lalu klik **Run**. Tabel `members`, `books`, `loans` beserta data contohnya akan terbentuk.
4. **Atur environment variable**: salin `.env.example` menjadi `.env`, lalu isi dengan **Project URL** dan **anon public key** dari *Project Settings → Data API / API Keys*:
   ```env
   SUPABASE_URL=https://xxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOi...
   PORT=3000
   ```
5. **Jalankan server**
   ```bash
   npm run dev     # mode development (nodemon)
   # atau
   npm start
   ```
   Jika berhasil, muncul pesan `Server running on port 3000`. Coba buka `http://localhost:3000/loans?status=Terlambat`.

## Deploy ke Vercel

1. Push repository ini ke GitHub.
2. Login ke [Vercel](https://vercel.com) → **Add New… → Project** → pilih repository ini → **Import**.
3. Pada **Environment Variables**, tambahkan `SUPABASE_URL` dan `SUPABASE_KEY` (nilai sama dengan `.env`).
4. Klik **Deploy**. Konfigurasi build sudah diatur di [`vercel.json`](vercel.json) (`@vercel/node`, semua route diarahkan ke `src/index.js`).
5. Setelah selesai, buka URL dari tombol **Visit**, lalu uji endpoint seperti `/loans?status=Terlambat`.
