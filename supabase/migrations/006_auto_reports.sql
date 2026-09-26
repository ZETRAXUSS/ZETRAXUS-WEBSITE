-- System-generated reports (AI check unavailable) are never rate limited
-- and can't be created by users directly.
alter table public.reports add column if not exists is_auto boolean not null default false;

create or replace function public.enforce_report_limits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_auto then
    return new;
  end if;
  if (select count(*) from reports
      where reporter_id = new.reporter_id and not is_auto and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'RATE_LIMIT_REPORTS' using errcode = 'P0001';
  end if;
  return new;
end $$;

revoke execute on function public.enforce_report_limits() from public, anon, authenticated;

drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports" on public.reports
  for insert with check (auth.uid() = reporter_id and not public.is_banned() and status = 'open' and not is_auto);
