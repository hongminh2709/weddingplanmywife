-- Chạy một lần trong SQL Editor của dự án Supabase.
-- Lời chúc được công khai cho khách xem; chỉ chủ dự án được sửa/xóa.
begin;

create table public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  timestamp timestamptz not null default now()
);

alter table public.guestbook enable row level security;
revoke all on table public.guestbook from anon, authenticated;
grant select on table public.guestbook to anon, authenticated;
grant insert (name, message) on table public.guestbook to anon, authenticated;

create policy "Guests can read wishes" on public.guestbook
  for select to anon, authenticated using (true);
create policy "Guests can add valid wishes" on public.guestbook
  for insert to anon, authenticated
  with check (char_length(btrim(name)) between 1 and 100
    and char_length(btrim(message)) between 1 and 2000);

commit;
