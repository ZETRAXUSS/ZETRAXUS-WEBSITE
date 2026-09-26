-- =====================================================================
-- ZETRAXUS 002 — real forum, moderation, notifications, bookmarks,
-- reports, AI-moderated media uploads, anti-spam limits, site search.
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

-- Set while trusted triggers/RPCs touch protected columns.
create or replace function public.zx_internal_on() returns void
language plpgsql as $$ begin perform set_config('zx.internal', '1', true); end $$;

create or replace function public.zx_internal_off() returns void
language plpgsql as $$ begin perform set_config('zx.internal', '', true); end $$;

create or replace function public.zx_is_internal() returns boolean
language sql stable as $$
  select coalesce(current_setting('zx.internal', true), '') = '1'
      or coalesce(auth.role(), '') not in ('authenticated', 'anon')
$$;

-- ---------------------------------------------------------------------
-- Profiles: roles, bans, protected columns
-- ---------------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'creator', 'moderator', 'admin'));

alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists banned_reason text;

alter table public.profiles drop constraint if exists profiles_display_name_len;
alter table public.profiles
  add constraint profiles_display_name_len
  check (char_length(btrim(display_name)) between 1 and 40);

alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles
  add constraint profiles_bio_len check (bio is null or char_length(bio) <= 500);

create or replace function public.is_staff(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = uid and role in ('moderator', 'admin'))
$$;

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = uid and role = 'admin')
$$;

create or replace function public.is_banned(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_banned from profiles where id = uid), false)
$$;

create or replace function public.protect_profile_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if public.zx_is_internal() then
    return new;
  end if;

  new.id := old.id;
  new.created_at := old.created_at;

  if not public.is_admin() then
    new.role := old.role;
  end if;

  if not public.is_staff() then
    new.is_banned := old.is_banned;
    new.banned_reason := old.banned_reason;
    -- Avatars only change through the moderated upload pipeline.
    new.avatar_url := old.avatar_url;
  end if;

  return new;
end $$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- New users (email + Google OAuth)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text;
  candidate text;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  base := lower(regexp_replace(split_part(coalesce(new.email, 'creator'), '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
  if base is null or char_length(base) < 3 then
    base := 'creator';
  end if;
  base := left(base, 20);
  candidate := base;

  while exists (select 1 from profiles where username = candidate) loop
    candidate := base || '_' || lpad((floor(random() * 10000))::int::text, 4, '0');
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    candidate,
    left(coalesce(
      nullif(btrim(meta->>'display_name'), ''),
      nullif(btrim(meta->>'full_name'), ''),
      nullif(btrim(meta->>'name'), ''),
      'Creator'
    ), 40),
    nullif(meta->>'avatar_url', ''),
    'user'
  );

  return new;
end $$;

-- ---------------------------------------------------------------------
-- Categories (bilingual) + seed
-- ---------------------------------------------------------------------

alter table public.forum_categories add column if not exists sort_order int not null default 0;
alter table public.forum_categories add column if not exists name_tr text;
alter table public.forum_categories add column if not exists description_tr text;

insert into public.forum_categories (name, slug, description, name_tr, description_tr, sort_order) values
  ('General',    'general',    'Welcome, introductions and off-topic chatter.', 'Genel',      'Tanışma, hoş geldin ve konu dışı sohbetler.', 1),
  ('Projects',   'projects',   'Discuss and showcase creative projects.',       'Projeler',   'Yaratıcı projeleri tartış ve sergile.',       2),
  ('Worlds',     'worlds',     'Share worldbuilding ideas and concepts.',       'Dünyalar',   'Dünya kurma fikirlerini ve konseptleri paylaş.', 3),
  ('Stories',    'stories',    'Creative writing and narrative discussions.',   'Hikâyeler',  'Yaratıcı yazarlık ve anlatı üzerine sohbetler.', 4),
  ('Characters', 'characters', 'Character design and development.',             'Karakterler','Karakter tasarımı ve gelişimi.',              5),
  ('Theory',     'theory',     'Deep analysis and theoretical discussions.',    'Teori',      'Derin analizler ve teorik tartışmalar.',      6)
on conflict (slug) do update set
  name_tr = excluded.name_tr,
  description_tr = excluded.description_tr,
  sort_order = excluded.sort_order;

drop policy if exists "Only admins can delete categories" on public.forum_categories;
create policy "Only admins can delete categories" on public.forum_categories
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- Threads
-- ---------------------------------------------------------------------

alter table public.forum_threads add column if not exists reply_count int not null default 0;
alter table public.forum_threads add column if not exists like_count int not null default 0;
alter table public.forum_threads add column if not exists view_count int not null default 0;
alter table public.forum_threads add column if not exists last_activity_at timestamptz not null default now();
alter table public.forum_threads add column if not exists is_pinned boolean not null default false;
alter table public.forum_threads add column if not exists is_locked boolean not null default false;
alter table public.forum_threads add column if not exists edited_at timestamptz;

alter table public.forum_threads drop constraint if exists forum_threads_title_len;
alter table public.forum_threads
  add constraint forum_threads_title_len check (char_length(btrim(title)) between 3 and 200);
alter table public.forum_threads drop constraint if exists forum_threads_body_len;
alter table public.forum_threads
  add constraint forum_threads_body_len check (char_length(btrim(body)) between 1 and 20000);

create index if not exists idx_forum_threads_activity on public.forum_threads (is_pinned desc, last_activity_at desc);
create index if not exists idx_forum_threads_title_trgm on public.forum_threads using gin (title extensions.gin_trgm_ops);

create or replace function public.protect_thread_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.zx_is_internal() then
    return new;
  end if;

  new.author_id := old.author_id;
  new.created_at := old.created_at;
  new.reply_count := old.reply_count;
  new.like_count := old.like_count;
  new.view_count := old.view_count;
  new.last_activity_at := old.last_activity_at;

  if not public.is_staff() then
    new.is_pinned := old.is_pinned;
    new.is_locked := old.is_locked;
  end if;

  if new.title is distinct from old.title or new.body is distinct from old.body then
    new.edited_at := now();
    new.updated_at := now();
  end if;

  return new;
end $$;

drop trigger if exists protect_thread_columns on public.forum_threads;
create trigger protect_thread_columns
  before update on public.forum_threads
  for each row execute function public.protect_thread_columns();

drop policy if exists "Authenticated users can create threads" on public.forum_threads;
create policy "Authenticated users can create threads" on public.forum_threads
  for insert with check (auth.uid() = author_id and not public.is_banned());

drop policy if exists "Users can update their own threads" on public.forum_threads;
create policy "Users can update their own threads" on public.forum_threads
  for update using ((auth.uid() = author_id and not public.is_banned()) or public.is_staff())
  with check ((auth.uid() = author_id and not public.is_banned()) or public.is_staff());

drop policy if exists "Users can delete their own threads" on public.forum_threads;
create policy "Users can delete their own threads" on public.forum_threads
  for delete using (auth.uid() = author_id or public.is_staff());

-- ---------------------------------------------------------------------
-- Replies
-- ---------------------------------------------------------------------

alter table public.forum_replies add column if not exists like_count int not null default 0;
alter table public.forum_replies add column if not exists edited_at timestamptz;

alter table public.forum_replies drop constraint if exists forum_replies_body_len;
alter table public.forum_replies
  add constraint forum_replies_body_len check (char_length(btrim(body)) between 1 and 10000);

create index if not exists idx_forum_replies_thread_created on public.forum_replies (thread_id, created_at);

create or replace function public.protect_reply_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.zx_is_internal() then
    return new;
  end if;

  new.author_id := old.author_id;
  new.thread_id := old.thread_id;
  new.created_at := old.created_at;
  new.like_count := old.like_count;

  if new.body is distinct from old.body then
    new.edited_at := now();
    new.updated_at := now();
  end if;

  return new;
end $$;

drop trigger if exists protect_reply_columns on public.forum_replies;
create trigger protect_reply_columns
  before update on public.forum_replies
  for each row execute function public.protect_reply_columns();

drop policy if exists "Authenticated users can create replies" on public.forum_replies;
create policy "Authenticated users can create replies" on public.forum_replies
  for insert with check (
    auth.uid() = author_id
    and not public.is_banned()
    and (
      public.is_staff()
      or exists (select 1 from forum_threads t where t.id = thread_id and not t.is_locked)
    )
  );

drop policy if exists "Users can update their own replies" on public.forum_replies;
create policy "Users can update their own replies" on public.forum_replies
  for update using ((auth.uid() = author_id and not public.is_banned()) or public.is_staff())
  with check ((auth.uid() = author_id and not public.is_banned()) or public.is_staff());

drop policy if exists "Users can delete their own replies" on public.forum_replies;
create policy "Users can delete their own replies" on public.forum_replies
  for delete using (auth.uid() = author_id or public.is_staff());

-- Likes: banned users cannot like
drop policy if exists "Users can create their own likes" on public.thread_likes;
create policy "Users can create their own likes" on public.thread_likes
  for insert with check (auth.uid() = user_id and not public.is_banned());

drop policy if exists "Users can create their own likes" on public.reply_likes;
create policy "Users can create their own likes" on public.reply_likes
  for insert with check (auth.uid() = user_id and not public.is_banned());

-- ---------------------------------------------------------------------
-- Anti-spam (B): server-side rate limits, cannot be bypassed by clients
-- ---------------------------------------------------------------------

create or replace function public.enforce_thread_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(new.author_id) then
    return new;
  end if;

  if (select count(*) from forum_threads
      where author_id = new.author_id and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'RATE_LIMIT_THREADS' using errcode = 'P0001';
  end if;

  if (select count(*) from forum_threads
      where author_id = new.author_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'RATE_LIMIT_THREADS_DAILY' using errcode = 'P0001';
  end if;

  if exists (select 1 from forum_threads
             where author_id = new.author_id
               and created_at > now() - interval '1 hour'
               and lower(btrim(title)) = lower(btrim(new.title))) then
    raise exception 'DUPLICATE_CONTENT' using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists enforce_thread_limits on public.forum_threads;
create trigger enforce_thread_limits
  before insert on public.forum_threads
  for each row execute function public.enforce_thread_limits();

create or replace function public.enforce_reply_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(new.author_id) then
    return new;
  end if;

  if (select count(*) from forum_replies
      where author_id = new.author_id and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'RATE_LIMIT_REPLIES' using errcode = 'P0001';
  end if;

  if (select count(*) from forum_replies
      where author_id = new.author_id and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'RATE_LIMIT_REPLIES_HOURLY' using errcode = 'P0001';
  end if;

  if exists (select 1 from forum_replies
             where author_id = new.author_id
               and created_at > now() - interval '10 minutes'
               and btrim(body) = btrim(new.body)) then
    raise exception 'DUPLICATE_CONTENT' using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists enforce_reply_limits on public.forum_replies;
create trigger enforce_reply_limits
  before insert on public.forum_replies
  for each row execute function public.enforce_reply_limits();

-- ---------------------------------------------------------------------
-- Notifications (8)
-- ---------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('reply', 'thread_like', 'reply_like', 'follow', 'moderation')),
  thread_id uuid references public.forum_threads(id) on delete cascade,
  reply_id uuid references public.forum_replies(id) on delete cascade,
  message text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

create or replace function public.notify(
  p_user uuid, p_actor uuid, p_type text,
  p_thread uuid default null, p_reply uuid default null, p_message text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null or p_user = p_actor then
    return;
  end if;
  -- collapse duplicate like/follow spam into one notification per day
  if p_type in ('thread_like', 'reply_like', 'follow') and exists (
    select 1 from notifications
    where user_id = p_user and actor_id is not distinct from p_actor and type = p_type
      and thread_id is not distinct from p_thread and reply_id is not distinct from p_reply
      and created_at > now() - interval '1 day'
  ) then
    return;
  end if;
  insert into notifications (user_id, actor_id, type, thread_id, reply_id, message)
  values (p_user, p_actor, p_type, p_thread, p_reply, p_message);
end $$;

revoke execute on function public.notify(uuid, uuid, text, uuid, uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Counters + notification triggers
-- ---------------------------------------------------------------------

create or replace function public.on_reply_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
begin
  perform zx_internal_on();
  update forum_threads
     set reply_count = reply_count + 1, last_activity_at = now()
   where id = new.thread_id
   returning author_id into owner;
  perform zx_internal_off();
  perform notify(owner, new.author_id, 'reply', new.thread_id, new.id);
  return new;
end $$;

drop trigger if exists on_reply_insert on public.forum_replies;
create trigger on_reply_insert after insert on public.forum_replies
  for each row execute function public.on_reply_insert();

create or replace function public.on_reply_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform zx_internal_on();
  update forum_threads set reply_count = greatest(reply_count - 1, 0) where id = old.thread_id;
  perform zx_internal_off();
  return old;
end $$;

drop trigger if exists on_reply_delete on public.forum_replies;
create trigger on_reply_delete after delete on public.forum_replies
  for each row execute function public.on_reply_delete();

create or replace function public.on_thread_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
begin
  perform zx_internal_on();
  if tg_op = 'INSERT' then
    update forum_threads set like_count = like_count + 1 where id = new.thread_id returning author_id into owner;
    perform zx_internal_off();
    perform notify(owner, new.user_id, 'thread_like', new.thread_id, null);
    return new;
  else
    update forum_threads set like_count = greatest(like_count - 1, 0) where id = old.thread_id;
    perform zx_internal_off();
    return old;
  end if;
end $$;

drop trigger if exists on_thread_like on public.thread_likes;
create trigger on_thread_like after insert or delete on public.thread_likes
  for each row execute function public.on_thread_like();

create or replace function public.on_reply_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
  t uuid;
begin
  perform zx_internal_on();
  if tg_op = 'INSERT' then
    update forum_replies set like_count = like_count + 1 where id = new.reply_id
      returning author_id, thread_id into owner, t;
    perform zx_internal_off();
    perform notify(owner, new.user_id, 'reply_like', t, new.reply_id);
    return new;
  else
    update forum_replies set like_count = greatest(like_count - 1, 0) where id = old.reply_id;
    perform zx_internal_off();
    return old;
  end if;
end $$;

drop trigger if exists on_reply_like on public.reply_likes;
create trigger on_reply_like after insert or delete on public.reply_likes
  for each row execute function public.on_reply_like();

create or replace function public.on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform notify(new.following_id, new.follower_id, 'follow');
  return new;
end $$;

drop trigger if exists on_follow on public.follows;
create trigger on_follow after insert on public.follows
  for each row execute function public.on_follow();

create or replace function public.increment_thread_view(p_thread uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform zx_internal_on();
  update forum_threads set view_count = view_count + 1 where id = p_thread;
  perform zx_internal_off();
end $$;

-- ---------------------------------------------------------------------
-- Bookmarks (H)
-- ---------------------------------------------------------------------

create table if not exists public.thread_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, thread_id)
);

create index if not exists idx_bookmarks_user on public.thread_bookmarks (user_id, created_at desc);
alter table public.thread_bookmarks enable row level security;

drop policy if exists "Users read own bookmarks" on public.thread_bookmarks;
create policy "Users read own bookmarks" on public.thread_bookmarks
  for select using (auth.uid() = user_id);
drop policy if exists "Users create own bookmarks" on public.thread_bookmarks;
create policy "Users create own bookmarks" on public.thread_bookmarks
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own bookmarks" on public.thread_bookmarks;
create policy "Users delete own bookmarks" on public.thread_bookmarks
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Reports (A)
-- ---------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'reply', 'user', 'media')),
  target_id uuid not null,
  reason text not null check (reason in ('spam', 'harassment', 'nsfw', 'violence', 'misinformation', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create index if not exists idx_reports_status on public.reports (status, created_at desc);
alter table public.reports enable row level security;

drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports" on public.reports
  for insert with check (auth.uid() = reporter_id and not public.is_banned() and status = 'open');
drop policy if exists "Users read own reports, staff read all" on public.reports;
create policy "Users read own reports, staff read all" on public.reports
  for select using (auth.uid() = reporter_id or public.is_staff());
drop policy if exists "Staff update reports" on public.reports;
create policy "Staff update reports" on public.reports
  for update using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff delete reports" on public.reports;
create policy "Staff delete reports" on public.reports
  for delete using (public.is_staff());

create or replace function public.enforce_report_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from reports
      where reporter_id = new.reporter_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'RATE_LIMIT_REPORTS' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists enforce_report_limits on public.reports;
create trigger enforce_report_limits before insert on public.reports
  for each row execute function public.enforce_report_limits();

-- ---------------------------------------------------------------------
-- Media uploads (7): written only by the `moderate-upload` edge function
-- ---------------------------------------------------------------------

create table if not exists public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('forum', 'avatar')),
  path text not null,
  url text not null,
  width int,
  height int,
  status text not null default 'pending' check (status in ('approved', 'pending', 'rejected')),
  moderation jsonb,
  thread_id uuid references public.forum_threads(id) on delete cascade,
  reply_id uuid references public.forum_replies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_media_thread on public.media_uploads (thread_id) where thread_id is not null;
create index if not exists idx_media_reply on public.media_uploads (reply_id) where reply_id is not null;
create index if not exists idx_media_status on public.media_uploads (status, created_at desc);
create index if not exists idx_media_owner on public.media_uploads (owner_id, created_at desc);
alter table public.media_uploads enable row level security;

drop policy if exists "Approved media is public" on public.media_uploads;
create policy "Approved media is public" on public.media_uploads
  for select using (status = 'approved' or auth.uid() = owner_id or public.is_staff());
drop policy if exists "Owners attach own media" on public.media_uploads;
create policy "Owners attach own media" on public.media_uploads
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners or staff delete media" on public.media_uploads;
create policy "Owners or staff delete media" on public.media_uploads
  for delete using (auth.uid() = owner_id or public.is_staff());

create or replace function public.protect_media_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.zx_is_internal() then
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.kind := old.kind;
  new.path := old.path;
  new.url := old.url;
  new.width := old.width;
  new.height := old.height;
  new.status := old.status;
  new.moderation := old.moderation;
  new.created_at := old.created_at;

  if new.thread_id is distinct from old.thread_id and new.thread_id is not null
     and not exists (select 1 from forum_threads where id = new.thread_id and author_id = auth.uid()) then
    raise exception 'NOT_YOUR_THREAD' using errcode = 'P0001';
  end if;

  if new.reply_id is distinct from old.reply_id and new.reply_id is not null
     and not exists (select 1 from forum_replies where id = new.reply_id and author_id = auth.uid()) then
    raise exception 'NOT_YOUR_REPLY' using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists protect_media_columns on public.media_uploads;
create trigger protect_media_columns
  before update on public.media_uploads
  for each row execute function public.protect_media_columns();

-- Storage bucket (public read; writes only via the edge function / service role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Staff delete media objects" on storage.objects;
create policy "Staff delete media objects" on storage.objects
  for delete using (bucket_id = 'media' and public.is_staff());

drop policy if exists "Owners delete own media objects" on storage.objects;
create policy "Owners delete own media objects" on storage.objects
  for delete using (bucket_id = 'media' and (storage.foldername(name))[2] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- Moderation RPCs (A)
-- ---------------------------------------------------------------------

create or replace function public.moderate_media(p_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  m media_uploads%rowtype;
begin
  if not public.is_staff() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  select * into m from media_uploads where id = p_id;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  perform zx_internal_on();
  update media_uploads set status = case when p_approve then 'approved' else 'rejected' end where id = p_id;
  if p_approve and m.kind = 'avatar' then
    update profiles set avatar_url = m.url where id = m.owner_id;
  end if;
  perform zx_internal_off();

  perform notify(m.owner_id, auth.uid(), 'moderation', m.thread_id, m.reply_id,
    case when p_approve then 'media_approved' else 'media_rejected' end);
end $$;

create or replace function public.set_user_ban(p_user uuid, p_banned boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if p_user = auth.uid() then
    raise exception 'CANNOT_BAN_SELF' using errcode = 'P0001';
  end if;
  if public.is_staff(p_user) and not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  perform zx_internal_on();
  update profiles
     set is_banned = p_banned,
         banned_reason = case when p_banned then left(p_reason, 300) else null end
   where id = p_user;
  perform zx_internal_off();
end $$;

create or replace function public.set_user_role(p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if p_role not in ('user', 'creator', 'moderator', 'admin') then
    raise exception 'INVALID_ROLE' using errcode = 'P0001';
  end if;
  if p_user = auth.uid() then
    raise exception 'CANNOT_CHANGE_OWN_ROLE' using errcode = 'P0001';
  end if;

  perform zx_internal_on();
  update profiles set role = p_role where id = p_user;
  perform zx_internal_off();
end $$;

-- ---------------------------------------------------------------------
-- Stats + search (1, 2)
-- ---------------------------------------------------------------------

create or replace function public.forum_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'threads', (select count(*) from forum_threads),
    'replies', (select count(*) from forum_replies),
    'members', (select count(*) from profiles),
    'categories', coalesce((
      select json_agg(json_build_object(
        'id', c.id,
        'threads', (select count(*) from forum_threads t where t.category_id = c.id),
        'replies', (select coalesce(sum(t.reply_count), 0) from forum_threads t where t.category_id = c.id)
      ))
      from forum_categories c
    ), '[]'::json)
  )
$$;

create or replace function public.search_site(q text, lim int default 6)
returns json language plpgsql stable security invoker set search_path = public as $$
declare
  term text;
  pattern text;
begin
  term := btrim(coalesce(q, ''));
  if char_length(term) < 2 then
    return json_build_object('threads', '[]'::json, 'users', '[]'::json, 'categories', '[]'::json);
  end if;

  term := left(term, 80);
  pattern := '%' || replace(replace(replace(term, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  lim := least(greatest(coalesce(lim, 6), 1), 20);

  return json_build_object(
    'threads', coalesce((
      select json_agg(r) from (
        select t.id, t.title, left(t.body, 180) as excerpt, t.reply_count, t.like_count,
               t.created_at, c.slug as category_slug, c.name as category_name, c.name_tr as category_name_tr,
               p.display_name as author_name, p.username as author_username
          from forum_threads t
          join forum_categories c on c.id = t.category_id
          join profiles p on p.id = t.author_id
         where t.title ilike pattern or t.body ilike pattern
         order by (t.title ilike pattern) desc, t.last_activity_at desc
         limit lim
      ) r
    ), '[]'::json),
    'users', coalesce((
      select json_agg(r) from (
        select id, username, display_name, avatar_url, role
          from profiles
         where (username ilike pattern or display_name ilike pattern) and not is_banned
         order by (username ilike pattern) desc, created_at asc
         limit lim
      ) r
    ), '[]'::json),
    'categories', coalesce((
      select json_agg(r) from (
        select id, slug, name, name_tr, description, description_tr
          from forum_categories
         where name ilike pattern or name_tr ilike pattern or description ilike pattern or description_tr ilike pattern
         order by sort_order
         limit lim
      ) r
    ), '[]'::json)
  );
end $$;

-- ---------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------

do $$
begin
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.forum_replies;
  exception when duplicate_object then null;
  end;
end $$;

-- Internal helpers are never callable from the API
revoke execute on function public.zx_internal_on() from public, anon, authenticated;
revoke execute on function public.zx_internal_off() from public, anon, authenticated;
