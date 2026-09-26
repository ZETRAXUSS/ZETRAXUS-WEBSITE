-- ZETRAXUS 008 — approving a pending cover / portrait always attaches it
-- (uploads with creation_id / project_id are always "the" image for that slot).

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
      update projects set cover_url = m.url where id = m.project_id;
    elsif m.kind = 'world_map' and m.creation_id is not null then
      update creations set map_url = m.url where id = m.creation_id;
    elsif m.kind = 'world_planet' and m.creation_id is not null then
      update creations set planet_url = m.url where id = m.creation_id;
    elsif m.kind in ('lore', 'character') and m.creation_id is not null then
      update creations set cover_url = m.url where id = m.creation_id;
    end if;
  end if;
  perform zx_internal_off();

  perform notify(m.owner_id, auth.uid(), 'moderation', m.thread_id, m.reply_id,
    case when p_approve then 'media_approved' else 'media_rejected' end);
end $$;
revoke execute on function public.moderate_media(uuid, boolean) from public, anon;
grant execute on function public.moderate_media(uuid, boolean) to authenticated;
