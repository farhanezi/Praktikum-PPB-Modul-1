# API Peminjaman Buku Perpustakaan

Responsi Praktikum PPB 2026 Modul 1. REST API sederhana untuk mencatat peminjaman buku oleh anggota perpustakaan, dibuat dengan Node.js, Express.js, dan Supabase, lalu di-deploy ke Vercel.

Link deploy: https://praktikum-ppb-modul-1-rx5g.vercel.app

## Deskripsi

API ini dipakai untuk mengelola data peminjaman buku (tambah, lihat, ubah, hapus). Data peminjaman bisa difilter berdasarkan status, misalnya untuk melihat peminjaman yang terlambat. Ada juga endpoint untuk data buku dan anggota.

Kalau tanggal jatuh tempo sudah lewat dan buku belum dikembalikan, status peminjaman otomatis berubah jadi `Terlambat`.

Tujuan proyek ini adalah belajar membuat REST API dengan pembagian model, controller, dan route, menghubungkannya ke database Supabase, lalu men-deploy-nya ke Vercel.

## Struktur Data

Ada 3 tabel. Query untuk membuat tabelnya ada di `schema.sql`.

**members**
- id (uuid)
- member_code (text, unik)
- name (text)
- email (text)
- phone (text)

**books**
- id (uuid)
- isbn (text, unik)
- title (text)
- author (text)
- publisher (text)
- year (integer)
- stock (integer)

**loans**
- id (uuid)
- member_id (uuid, relasi ke members)
- book_id (uuid, relasi ke books)
- loan_date (date)
- due_date (date), default 7 hari setelah loan_date
- return_date (date)
- status (text): `Dipinjam`, `Dikembalikan`, atau `Terlambat`
- notes (text)

## Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | /loans | Ambil semua data peminjaman |
| GET | /loans?status=Terlambat | Filter berdasarkan status |
| GET | /loans/:id | Ambil satu data peminjaman |
| POST | /loans | Tambah peminjaman |
| PUT | /loans/:id | Ubah peminjaman |
| DELETE | /loans/:id | Hapus peminjaman |

Selain `status`, data peminjaman juga bisa difilter dengan `member_id` dan `book_id`. Endpoint `/books` dan `/members` punya operasi yang sama (GET, POST, PUT, DELETE).

## Contoh Request & Response

**POST /loans**

Request:
```json
{
  "member_id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11",
  "book_id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30",
  "notes": "Pinjam untuk tugas"
}
```

Response (201):
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
  "member": { "id": "6f1c2a7e-3b0d-4d8e-9a51-2c7f0e9b4d11", "member_code": "AGT-004", "name": "Dewi Lestari" },
  "book": { "id": "0b8e5d2c-71a4-4f39-8c6e-5d2a9f1e7b30", "title": "Filosofi Teras", "author": "Henry Manampiring" }
}
```

**GET /loans?status=Terlambat**

Response (200):
```json
[
  {
    "id": "8d27b6c0-4e1a-4b95-a3f8-6c0d2e9f1a72",
    "loan_date": "2026-09-28",
    "due_date": "2026-10-05",
    "return_date": null,
    "status": "Terlambat",
    "member": { "member_code": "AGT-001", "name": "Budi Santoso" },
    "book": { "title": "Atomic Habits", "author": "James Clear" }
  }
]
```

**PUT /loans/:id** (mencatat pengembalian buku)

Request:
```json
{
  "return_date": "2026-10-15"
}
```

Response (200): data peminjaman dengan `return_date` terisi dan `status` berubah menjadi `Dikembalikan`.

**DELETE /loans/:id**

Response (200):
```json
{
  "message": "Data peminjaman berhasil dihapus"
}
```

## Cara Menjalankan di Lokal

1. Clone repo dan install dependency
   ```
   git clone https://github.com/farhanezi/Praktikum-PPB-Modul-1.git
   cd Praktikum-PPB-Modul-1
   npm install
   ```
2. Buat project di Supabase, lalu jalankan isi file `schema.sql` di SQL Editor.
3. Buat file `.env` (lihat `.env.example`)
   ```
   SUPABASE_URL=url_project_supabase
   SUPABASE_KEY=anon_key_supabase
   PORT=3000
   ```
4. Jalankan server
   ```
   npm run dev
   ```
   Server berjalan di `http://localhost:3000`.
