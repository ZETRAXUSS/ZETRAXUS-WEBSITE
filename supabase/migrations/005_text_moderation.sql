-- Forum text must go through the `post-content` edge function (AI check).
-- Browsers can no longer insert threads/replies or change their text directly.

drop policy if exists "Authenticated users can create threads" on public.forum_threads;
drop policy if exists "Authenticated users can create replies" on public.forum_replies;

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
  new.edited_at := old.edited_at;
  new.updated_at := old.updated_at;

  -- Text edits only through the moderated edge function.
  new.title := old.title;
  new.body := old.body;

  if not public.is_staff() then
    new.is_pinned := old.is_pinned;
    new.is_locked := old.is_locked;
    new.category_id := old.category_id;
  end if;

  return new;
end $$;

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
  new.body := old.body;
  new.edited_at := old.edited_at;
  new.updated_at := old.updated_at;

  return new;
end $$;
