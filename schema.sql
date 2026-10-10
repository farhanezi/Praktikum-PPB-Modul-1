-- =========================================================
-- Library Loan API - Skema database (Supabase / PostgreSQL)
-- Jalankan SELURUH isi file ini sekaligus di Supabase SQL Editor.
-- =========================================================

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  member_code text unique not null,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  isbn text unique,
  title text not null,
  author text not null,
  publisher text,
  year integer,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  book_id uuid not null references books(id),
  loan_date date not null default current_date,
  due_date date not null,
  return_date date,
  status text not null default 'Dipinjam'
    check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  notes text,
  created_at timestamptz not null default now(),
  check (due_date >= loan_date)
);

-- API memakai anon key, jadi tabel dibiarkan tanpa RLS (sama seperti tabel modul)
alter table members disable row level security;
alter table books disable row level security;
alter table loans disable row level security;

grant select, insert, update, delete on members, books, loans to anon, authenticated;

-- =========================================================
-- Data contoh
-- =========================================================

insert into members (member_code, name, email, phone) values
  ('AGT-001', 'Budi Santoso', 'budi@email.com', '08123456789'),
  ('AGT-002', 'Siti Aminah', 'siti@email.com', '08129876543'),
  ('AGT-003', 'Andi Pratama', 'andi@email.com', '08571234567')
on conflict (member_code) do nothing;

insert into books (isbn, title, author, publisher, year, stock) values
  ('978-623-000-001-1', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 5),
  ('978-623-000-002-2', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 3),
  ('978-623-000-003-3', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 2),
  ('978-623-000-004-4', 'Atomic Habits', 'James Clear', 'Avery', 2018, 4)
on conflict (isbn) do nothing;

-- Tanggal dibuat relatif terhadap hari ini supaya contoh status selalu relevan
insert into loans (member_id, book_id, loan_date, due_date, return_date, status, notes)
select m.id, b.id, v.loan_date, v.due_date, v.return_date, v.status, v.notes
from (values
  ('AGT-001', '978-623-000-001-1', current_date - 3,  current_date + 4,  null::date,        'Dipinjam',     'Peminjaman reguler'),
  ('AGT-002', '978-623-000-002-2', current_date - 20, current_date - 13, current_date - 14, 'Dikembalikan', 'Dikembalikan tepat waktu'),
  ('AGT-003', '978-623-000-003-3', current_date - 30, current_date - 23, null::date,        'Terlambat',    'Belum dikembalikan'),
  ('AGT-001', '978-623-000-004-4', current_date - 12, current_date - 5,  null::date,        'Dipinjam',     'Lewat jatuh tempo, otomatis jadi Terlambat')
) as v(member_code, isbn, loan_date, due_date, return_date, status, notes)
join members m on m.member_code = v.member_code
join books b on b.isbn = v.isbn
where not exists (select 1 from loans);
