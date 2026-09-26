-- Usernames: unique, public handle chosen by the user (a-z, 0-9, _ ; 3-20).
-- New accounts no longer derive it from the email address, and existing
-- email-derived handles are regenerated from the display name.

create or replace function public.zx_slugify(input text)
returns text language sql immutable set search_path = public as $$
  select left(regexp_replace(
    translate(lower(coalesce(input, '')), 'çğıöşüâîûéè ', 'cgiosuaiuee_'),
    '[^a-z0-9_]', '', 'g'), 16)
$$;

create or replace function public.zx_unique_username(base text)
returns text language plpgsql set search_path = public as $$
declare
  seed text := public.zx_slugify(base);
  candidate text;
begin
  if seed is null or char_length(seed) < 3 then
    seed := 'creator';
  end if;
  candidate := seed;
  while exists (select 1 from profiles where username = candidate) loop
    candidate := left(seed, 15) || '_' || lpad((floor(random() * 10000))::int::text, 4, '0');
  end loop;
  return candidate;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  name text := left(coalesce(
    nullif(btrim(meta->>'display_name'), ''),
    nullif(btrim(meta->>'full_name'), ''),
    nullif(btrim(meta->>'name'), ''),
    'Creator'
  ), 40);
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (new.id, public.zx_unique_username(name), name, nullif(meta->>'avatar_url', ''), 'user');
  return new;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Regenerate handles that expose the email address
do $$
declare r record;
begin
  perform set_config('zx.internal', '1', true);
  for r in
    select p.id, p.display_name from profiles p join auth.users u on u.id = p.id
    where lower(p.username) = lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
       or p.username !~ '^[a-z0-9_]{3,20}$'
  loop
    update profiles set username = '__tmp_' || left(replace(r.id::text, '-', ''), 14) where id = r.id;
    update profiles set username = public.zx_unique_username(r.display_name) where id = r.id;
  end loop;
end $$;

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$');
