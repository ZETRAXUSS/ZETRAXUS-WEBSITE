-- Lock down trigger-only functions and admin RPCs (Supabase security advisor)
alter function public.zx_internal_on() set search_path = public;
alter function public.zx_internal_off() set search_path = public;
alter function public.zx_is_internal() set search_path = public;

revoke execute on function public.enforce_reply_limits() from public, anon, authenticated;
revoke execute on function public.enforce_report_limits() from public, anon, authenticated;
revoke execute on function public.enforce_thread_limits() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.on_follow() from public, anon, authenticated;
revoke execute on function public.on_reply_delete() from public, anon, authenticated;
revoke execute on function public.on_reply_insert() from public, anon, authenticated;
revoke execute on function public.on_reply_like() from public, anon, authenticated;
revoke execute on function public.on_thread_like() from public, anon, authenticated;

revoke execute on function public.moderate_media(uuid, boolean) from public, anon;
revoke execute on function public.set_user_ban(uuid, boolean, text) from public, anon;
revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.moderate_media(uuid, boolean) to authenticated;
grant execute on function public.set_user_ban(uuid, boolean, text) to authenticated;
grant execute on function public.set_user_role(uuid, text) to authenticated;
