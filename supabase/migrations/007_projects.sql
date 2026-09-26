-- =====================================================================
-- ZETRAXUS 007 — Projects, Worlds, Lore, Characters
-- - projects (in progress / completed) with team members
-- - creations: world | lore | character, standalone or linked to a project
-- - comments that are either a plain comment or a suggestion
-- - likes, counters, notifications, rate limits, real stats, search
-- All TEXT is written through the `post-content` edge function (AI + link
-- check); browsers can only change non-text fields allowed below.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 120),
  tagline text check (tagline is null or char_length(tagline) <= 200),
  description text not null check (char_length(btrim(description)) between 1 and 20000),
  genre text check (genre is null or char_length(genre) <= 40),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  completed_at timestamptz,
  cover_url text,
  like_count int not null default 0,
  comment_count int not null default 0,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists idx_projects_created on public.projects (created_at desc);
create index if not exists idx_projects_owner on public.projects (owner_id);
create index if not exists idx_projects_status on public.projects (status, created_at desc);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists idx_project_members_user on public.project_members (user_id);

create table if not exists public.creations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('world', 'lore', 'character')),
  author_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  world_id uuid references public.creations(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 2 and 120),
  subtitle text check (subtitle is null or char_length(subtitle) <= 160),
  type_tag text check (type_tag is null or char_length(type_tag) <= 40),
  fields jsonb not null default '{}'::jsonb,
  cover_url text,
  map_url text,
  planet_url text,
  like_count int not null default 0,
  comment_count int not null default 0,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists idx_creations_kind on public.creations (kind, created_at desc);
create index if not exists idx_creations_project on public.creations (project_id) where project_id is not null;
create index if not exists idx_creations_author on public.creations (author_id);
create index if not exists idx_creations_world on public.creations (world_id) where world_id is not null;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  creation_id uuid references public.creations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'comment' check (kind in ('comment', 'suggestion')),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  suggestion_state text not null default 'open' check (suggestion_state in ('open', 'added')),
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  check ((project_id is not null)::int + (creation_id is not null)::int = 1)
);
create index if not exists idx_comments_project on public.comments (project_id, created_at) where project_id is not null;
create index if not exists idx_comments_creation on public.comments (creation_id, created_at) where creation_id is not null;

create table if not exists public.likes (
  target_type text not null check (target_type in ('project', 'creation', 'comment')),
  target_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (target_type, target_id, user_id)
);
create index if not exists idx_likes_user on public.likes (user_id);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.creations enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

create or replace function public.is_project_member(p uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects where id = p and owner_id = uid)
      or exists (select 1 from project_members where project_id = p and user_id = uid and status = 'accepted')
$$;

create or replace function public.is_project_owner(p uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects where id = p and owner_id = uid)
$$;

create or replace function public.can_edit_creation(c uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from creations cr
     where cr.id = c
       and (cr.author_id = uid or (cr.project_id is not null and public.is_project_member(cr.project_id, uid)))
  )
$$;

create or replace function public.is_approved_media(p_url text, p_kinds text[])
returns boolean language sql stable security definer set search_path = public as $$
  select p_url is null or exists (
    select 1 from media_uploads m where m.url = p_url and m.status = 'approved' and m.kind = any(p_kinds)
  )
$$;

-- ---------------------------------------------------------------------
-- Media: new kinds + links to projects / creations
-- ---------------------------------------------------------------------

alter table public.media_uploads drop constraint if exists media_uploads_kind_check;
alter table public.media_uploads
  add constraint media_uploads_kind_check
  check (kind in ('forum', 'avatar', 'project', 'world_map', 'world_planet', 'lore', 'character'));
alter table public.media_uploads add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.media_uploads add column if not exists creation_id uuid references public.creations(id) on delete cascade;
create index if not exists idx_media_project on public.media_uploads (project_id) where project_id is not null;
create index if not exists idx_media_creation on public.media_uploads (creation_id) where creation_id is not null;

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
  if new.project_id is distinct from old.project_id and new.project_id is not null
     and not public.is_project_member(new.project_id) then
    raise exception 'NOT_YOUR_PROJECT' using errcode = 'P0001';
  end if;
  if new.creation_id is distinct from old.creation_id and new.creation_id is not null
     and not public.can_edit_creation(new.creation_id) then
    raise exception 'NOT_YOUR_CREATION' using errcode = 'P0001';
  end if;

  return new;
end $$;

-- ---------------------------------------------------------------------
-- Protect columns (text only via edge function)
-- ---------------------------------------------------------------------

create or replace function public.protect_project_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status is distinct from old.status then
    new.completed_at := case when new.status = 'completed' then now() else null end;
  end if;

  if public.zx_is_internal() then
    return new;
  end if;

  new.owner_id := old.owner_id;
  new.title := old.title;
  new.tagline := old.tagline;
  new.description := old.description;
  new.genre := old.genre;
  new.like_count := old.like_count;
  new.comment_count := old.comment_count;
  new.view_count := old.view_count;
  new.created_at := old.created_at;
  new.edited_at := old.edited_at;
  new.updated_at := now();

  if not public.is_approved_media(new.cover_url, array['project']) then
    new.cover_url := old.cover_url;
  end if;

  return new;
end $$;

drop trigger if exists protect_project_columns on public.projects;
create trigger protect_project_columns before update on public.projects
  for each row execute function public.protect_project_columns();

create or replace function public.protect_creation_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.zx_is_internal() then
    return new;
  end if;

  new.kind := old.kind;
  new.author_id := old.author_id;
  new.title := old.title;
  new.subtitle := old.subtitle;
  new.type_tag := old.type_tag;
  new.fields := old.fields;
  new.like_count := old.like_count;
  new.comment_count := old.comment_count;
  new.view_count := old.view_count;
  new.created_at := old.created_at;
  new.edited_at := old.edited_at;
  new.updated_at := now();

  if new.project_id is distinct from old.project_id and new.project_id is not null
     and not public.is_project_member(new.project_id) then
    new.project_id := old.project_id;
  end if;
  if new.world_id is distinct from old.world_id and new.world_id is not null
     and not exists (select 1 from creations w where w.id = new.world_id and w.kind = 'world') then
    new.world_id := old.world_id;
  end if;

  if not public.is_approved_media(new.cover_url, array['lore', 'character', 'project', 'world_map', 'world_planet']) then
    new.cover_url := old.cover_url;
  end if;
  if not public.is_approved_media(new.map_url, array['world_map']) then
    new.map_url := old.map_url;
  end if;
  if not public.is_approved_media(new.planet_url, array['world_planet']) then
    new.planet_url := old.planet_url;
  end if;

  return new;
end $$;

drop trigger if exists protect_creation_columns on public.creations;
create trigger protect_creation_columns before update on public.creations
  for each row execute function public.protect_creation_columns();

create or replace function public.protect_comment_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.zx_is_internal() then
    return new;
  end if;

  new.project_id := old.project_id;
  new.creation_id := old.creation_id;
  new.author_id := old.author_id;
  new.kind := old.kind;
  new.body := old.body;
  new.like_count := old.like_count;
  new.created_at := old.created_at;
  new.edited_at := old.edited_at;

  -- Only the project team / creation editors mark suggestions as added.
  if new.suggestion_state is distinct from old.suggestion_state then
    if old.kind <> 'suggestion'
       or not (
         (old.project_id is not null and public.is_project_member(old.project_id))
         or (old.creation_id is not null and public.can_edit_creation(old.creation_id))
         or public.is_staff()
       ) then
      new.suggestion_state := old.suggestion_state;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists protect_comment_columns on public.comments;
create trigger protect_comment_columns before update on public.comments
  for each row execute function public.protect_comment_columns();

create or replace function public.protect_member_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.zx_is_internal() then
    return new;
  end if;
  new.project_id := old.project_id;
  new.user_id := old.user_id;
  new.invited_by := old.invited_by;
  new.created_at := old.created_at;
  return new;
end $$;

drop trigger if exists protect_member_columns on public.project_members;
create trigger protect_member_columns before update on public.project_members
  for each row execute function public.protect_member_columns();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------

drop policy if exists "Projects are public" on public.projects;
create policy "Projects are public" on public.projects for select using (true);
drop policy if exists "Team updates project" on public.projects;
create policy "Team updates project" on public.projects for update
  using ((public.is_project_member(id) and not public.is_banned()) or public.is_staff())
  with check ((public.is_project_member(id) and not public.is_banned()) or public.is_staff());
drop policy if exists "Owner deletes project" on public.projects;
create policy "Owner deletes project" on public.projects for delete
  using (owner_id = auth.uid() or public.is_staff());

drop policy if exists "Members are public" on public.project_members;
create policy "Members are public" on public.project_members for select using (true);
drop policy if exists "Owner invites" on public.project_members;
create policy "Owner invites" on public.project_members for insert
  with check (
    public.is_project_owner(project_id) and not public.is_banned()
    and user_id <> auth.uid() and status = 'pending' and invited_by = auth.uid()
  );
drop policy if exists "Invitee accepts" on public.project_members;
create policy "Invitee accepts" on public.project_members for update
  using (user_id = auth.uid()) with check (user_id = auth.uid() and status = 'accepted');
drop policy if exists "Owner removes or member leaves" on public.project_members;
create policy "Owner removes or member leaves" on public.project_members for delete
  using (user_id = auth.uid() or public.is_project_owner(project_id) or public.is_staff());

drop policy if exists "Creations are public" on public.creations;
create policy "Creations are public" on public.creations for select using (true);
drop policy if exists "Editors update creation" on public.creations;
create policy "Editors update creation" on public.creations for update
  using ((public.can_edit_creation(id) and not public.is_banned()) or public.is_staff())
  with check ((public.can_edit_creation(id) and not public.is_banned()) or public.is_staff());
drop policy if exists "Editors delete creation" on public.creations;
create policy "Editors delete creation" on public.creations for delete
  using (author_id = auth.uid() or (project_id is not null and public.is_project_owner(project_id)) or public.is_staff());

drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public" on public.comments for select using (true);
drop policy if exists "Team marks suggestions" on public.comments;
create policy "Team marks suggestions" on public.comments for update
  using (
    (project_id is not null and public.is_project_member(project_id))
    or (creation_id is not null and public.can_edit_creation(creation_id))
    or public.is_staff()
  )
  with check (true);
drop policy if exists "Author or team deletes comment" on public.comments;
create policy "Author or team deletes comment" on public.comments for delete
  using (
    author_id = auth.uid()
    or (project_id is not null and public.is_project_owner(project_id))
    or (creation_id is not null and exists (select 1 from creations c where c.id = creation_id and c.author_id = auth.uid()))
    or public.is_staff()
  );

drop policy if exists "Likes are public" on public.likes;
create policy "Likes are public" on public.likes for select using (true);
drop policy if exists "Users like" on public.likes;
create policy "Users like" on public.likes for insert with check (user_id = auth.uid() and not public.is_banned());
drop policy if exists "Users unlike" on public.likes;
create policy "Users unlike" on public.likes for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Notifications: new types + targets
-- ---------------------------------------------------------------------

alter table public.notifications add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.notifications add column if not exists creation_id uuid references public.creations(id) on delete cascade;
alter table public.notifications add column if not exists comment_id uuid references public.comments(id) on delete cascade;
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'reply', 'thread_like', 'reply_like', 'follow', 'moderation',
  'project_comment', 'project_suggestion', 'project_like', 'project_invite', 'suggestion_added',
  'creation_comment', 'creation_like'
));

create or replace function public.notify_ext(
  p_user uuid, p_actor uuid, p_type text,
  p_project uuid default null, p_creation uuid default null, p_comment uuid default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null or p_user = p_actor then
    return;
  end if;
  if p_type in ('project_like', 'creation_like') and exists (
    select 1 from notifications
     where user_id = p_user and actor_id is not distinct from p_actor and type = p_type
       and project_id is not distinct from p_project and creation_id is not distinct from p_creation
       and created_at > now() - interval '1 day'
  ) then
    return;
  end if;
  insert into notifications (user_id, actor_id, type, project_id, creation_id, comment_id)
  values (p_user, p_actor, p_type, p_project, p_creation, p_comment);
end $$;
revoke execute on function public.notify_ext(uuid, uuid, text, uuid, uuid, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Counters + notification triggers
-- ---------------------------------------------------------------------

create or replace function public.on_like_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  row_ likes%rowtype;
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
  v_owner uuid;
begin
  if tg_op = 'DELETE' then row_ := old; else row_ := new; end if;
  perform zx_internal_on();
  if row_.target_type = 'project' then
    update projects set like_count = greatest(like_count + delta, 0) where id = row_.target_id returning owner_id into v_owner;
    perform zx_internal_off();
    if tg_op = 'INSERT' then perform notify_ext(v_owner, row_.user_id, 'project_like', row_.target_id); end if;
  elsif row_.target_type = 'creation' then
    update creations set like_count = greatest(like_count + delta, 0) where id = row_.target_id returning author_id into v_owner;
    perform zx_internal_off();
    if tg_op = 'INSERT' then perform notify_ext(v_owner, row_.user_id, 'creation_like', null, row_.target_id); end if;
  else
    update comments set like_count = greatest(like_count + delta, 0) where id = row_.target_id;
    perform zx_internal_off();
  end if;
  return row_;
end $$;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change after insert or delete on public.likes
  for each row execute function public.on_like_change();

create or replace function public.on_comment_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  row_ comments%rowtype;
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
  v_owner uuid;
begin
  if tg_op = 'DELETE' then row_ := old; else row_ := new; end if;
  perform zx_internal_on();
  if row_.project_id is not null then
    update projects set comment_count = greatest(comment_count + delta, 0) where id = row_.project_id returning owner_id into v_owner;
  else
    update creations set comment_count = greatest(comment_count + delta, 0) where id = row_.creation_id returning author_id into v_owner;
  end if;
  perform zx_internal_off();

  if tg_op = 'INSERT' then
    if row_.project_id is not null then
      perform notify_ext(v_owner, row_.author_id,
        case when row_.kind = 'suggestion' then 'project_suggestion' else 'project_comment' end,
        row_.project_id, null, row_.id);
    else
      perform notify_ext(v_owner, row_.author_id, 'creation_comment', null, row_.creation_id, row_.id);
    end if;
  end if;
  return row_;
end $$;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change after insert or delete on public.comments
  for each row execute function public.on_comment_change();

create or replace function public.on_suggestion_added()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'suggestion' and new.suggestion_state = 'added' and old.suggestion_state <> 'added' then
    perform notify_ext(new.author_id, auth.uid(), 'suggestion_added', new.project_id, new.creation_id, new.id);
  end if;
  return new;
end $$;

drop trigger if exists on_suggestion_added on public.comments;
create trigger on_suggestion_added after update on public.comments
  for each row execute function public.on_suggestion_added();

create or replace function public.on_member_invite()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform notify_ext(new.user_id, new.invited_by, 'project_invite', new.project_id);
  return new;
end $$;

drop trigger if exists on_member_invite on public.project_members;
create trigger on_member_invite after insert on public.project_members
  for each row execute function public.on_member_invite();

-- ---------------------------------------------------------------------
-- Rate limits (non-staff)
-- ---------------------------------------------------------------------

create or replace function public.enforce_project_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(new.owner_id) then return new; end if;
  if (select count(*) from projects where owner_id = new.owner_id and created_at > now() - interval '1 day') >= 3 then
    raise exception 'RATE_LIMIT_PROJECTS' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists enforce_project_limits on public.projects;
create trigger enforce_project_limits before insert on public.projects
  for each row execute function public.enforce_project_limits();

create or replace function public.enforce_creation_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(new.author_id) then return new; end if;
  if (select count(*) from creations where author_id = new.author_id and created_at > now() - interval '1 hour') >= 12 then
    raise exception 'RATE_LIMIT_CREATIONS' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists enforce_creation_limits on public.creations;
create trigger enforce_creation_limits before insert on public.creations
  for each row execute function public.enforce_creation_limits();

create or replace function public.enforce_comment_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff(new.author_id) then return new; end if;
  if (select count(*) from comments where author_id = new.author_id and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'RATE_LIMIT_REPLIES' using errcode = 'P0001';
  end if;
  if exists (select 1 from comments where author_id = new.author_id and created_at > now() - interval '10 minutes'
             and btrim(body) = btrim(new.body)) then
    raise exception 'DUPLICATE_CONTENT' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists enforce_comment_limits on public.comments;
create trigger enforce_comment_limits before insert on public.comments
  for each row execute function public.enforce_comment_limits();

create or replace function public.enforce_member_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from project_members where project_id = new.project_id) >= 20 then
    raise exception 'TEAM_FULL' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists enforce_member_limits on public.project_members;
create trigger enforce_member_limits before insert on public.project_members
  for each row execute function public.enforce_member_limits();

-- ---------------------------------------------------------------------
-- Reports, moderation, views, stats, search
-- ---------------------------------------------------------------------

alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('thread', 'reply', 'user', 'media', 'project', 'creation', 'comment'));

-- Approving a pending project / world image attaches it automatically.
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
  if p_approve then
    if m.kind = 'avatar' then
      update profiles set avatar_url = m.url where id = m.owner_id;
    elsif m.kind = 'project' and m.project_id is not null then
      update projects set cover_url = m.url where id = m.project_id and cover_url is null;
    elsif m.kind = 'world_map' and m.creation_id is not null then
      update creations set map_url = m.url where id = m.creation_id;
    elsif m.kind = 'world_planet' and m.creation_id is not null then
      update creations set planet_url = m.url where id = m.creation_id;
    elsif m.kind in ('lore', 'character') and m.creation_id is not null then
      update creations set cover_url = coalesce(cover_url, m.url) where id = m.creation_id;
    end if;
  end if;
  perform zx_internal_off();

  perform notify(m.owner_id, auth.uid(), 'moderation', m.thread_id, m.reply_id,
    case when p_approve then 'media_approved' else 'media_rejected' end);
end $$;
revoke execute on function public.moderate_media(uuid, boolean) from public, anon;
grant execute on function public.moderate_media(uuid, boolean) to authenticated;

create or replace function public.increment_view(p_type text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform zx_internal_on();
  if p_type = 'project' then
    update projects set view_count = view_count + 1 where id = p_id;
  elsif p_type = 'creation' then
    update creations set view_count = view_count + 1 where id = p_id;
  end if;
  perform zx_internal_off();
end $$;

create or replace function public.projects_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total', (select count(*) from projects),
    'in_progress', (select count(*) from projects where status = 'in_progress'),
    'completed', (select count(*) from projects where status = 'completed'),
    'creators', (select count(distinct uid) from (
        select owner_id as uid from projects
        union select user_id from project_members where status = 'accepted'
        union select author_id from creations) s),
    'worlds', (select count(*) from creations where kind = 'world'),
    'lores', (select count(*) from creations where kind = 'lore'),
    'characters', (select count(*) from creations where kind = 'character')
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
    return json_build_object('threads', '[]'::json, 'users', '[]'::json, 'categories', '[]'::json,
                             'projects', '[]'::json, 'creations', '[]'::json);
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
    ), '[]'::json),
    'projects', coalesce((
      select json_agg(r) from (
        select pr.id, pr.title, pr.tagline, pr.status, pr.cover_url, p.display_name as author_name
          from projects pr join profiles p on p.id = pr.owner_id
         where pr.title ilike pattern or pr.tagline ilike pattern or pr.genre ilike pattern
         order by (pr.title ilike pattern) desc, pr.created_at desc
         limit lim
      ) r
    ), '[]'::json),
    'creations', coalesce((
      select json_agg(r) from (
        select cr.id, cr.kind, cr.title, cr.subtitle, cr.cover_url, p.display_name as author_name
          from creations cr join profiles p on p.id = cr.author_id
         where cr.title ilike pattern or cr.subtitle ilike pattern or cr.type_tag ilike pattern
         order by (cr.title ilike pattern) desc, cr.created_at desc
         limit lim
      ) r
    ), '[]'::json)
  );
end $$;

grant execute on function public.increment_view(text, uuid) to anon, authenticated;
grant execute on function public.projects_stats() to anon, authenticated;

-- Trigger-only functions are never callable from the API
revoke execute on function public.on_like_change() from public, anon, authenticated;
revoke execute on function public.on_comment_change() from public, anon, authenticated;
revoke execute on function public.on_suggestion_added() from public, anon, authenticated;
revoke execute on function public.on_member_invite() from public, anon, authenticated;
revoke execute on function public.enforce_project_limits() from public, anon, authenticated;
revoke execute on function public.enforce_creation_limits() from public, anon, authenticated;
revoke execute on function public.enforce_comment_limits() from public, anon, authenticated;
revoke execute on function public.enforce_member_limits() from public, anon, authenticated;

do $$
begin
  begin
    alter publication supabase_realtime add table public.comments;
  exception when duplicate_object then null;
  end;
end $$;

-- Likes have no FK (polymorphic) → clean them up when the target goes away.
create or replace function public.cleanup_target_likes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from likes where target_type = tg_argv[0] and target_id = old.id;
  return old;
end $$;
revoke execute on function public.cleanup_target_likes() from public, anon, authenticated;

drop trigger if exists cleanup_likes on public.projects;
create trigger cleanup_likes after delete on public.projects
  for each row execute function public.cleanup_target_likes('project');
drop trigger if exists cleanup_likes on public.creations;
create trigger cleanup_likes after delete on public.creations
  for each row execute function public.cleanup_target_likes('creation');
drop trigger if exists cleanup_likes on public.comments;
create trigger cleanup_likes after delete on public.comments
  for each row execute function public.cleanup_target_likes('comment');
