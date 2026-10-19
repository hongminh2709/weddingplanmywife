-- Chạy một lần trong SQL Editor của dự án Supabase.
-- Tên khách chỉ được truy xuất theo mã; không cấp quyền liệt kê bảng.
begin;

create table public.invitation_links (
  code text primary key default ('s_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)),
  guest_name text not null check (char_length(btrim(guest_name)) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.invitation_links enable row level security;
revoke all on table public.invitation_links from public, anon, authenticated;

create function public.create_invitation_link(guest text)
returns text language plpgsql security definer set search_path = pg_catalog, public as $$
declare new_code text;
begin
  if guest is null or char_length(btrim(guest)) not between 1 and 120 then
    raise exception 'Invalid guest name';
  end if;
  insert into public.invitation_links (guest_name) values (btrim(guest)) returning code into new_code;
  return new_code;
end;
$$;

create function public.get_invitation_guest(link_code text)
returns text language sql stable security definer set search_path = pg_catalog, public as $$
  select guest_name from public.invitation_links where code = link_code;
$$;

revoke all on function public.create_invitation_link(text) from public;
revoke all on function public.get_invitation_guest(text) from public;
grant execute on function public.create_invitation_link(text) to anon, authenticated;
grant execute on function public.get_invitation_guest(text) to anon, authenticated;

commit;
