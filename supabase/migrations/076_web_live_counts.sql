-- Live bezoekersteller website (24-10-2026), incl. 077: 'dwell' = woning verlaten
alter table public.web_events add column if not exists flag text; -- null = bezoeker, 'team', 'bot'
create index if not exists web_events_live_idx on public.web_events (at) where flag is null;

create or replace function public.web_live_counts(p_property uuid default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'site30', (select count(distinct coalesce(vid, sid)) from web_events
               where flag is null and at > now() - interval '30 minutes'),
    'week',  case when p_property is null then null else
             (select count(distinct coalesce(vid, sid)) from web_events
              where flag is null and event = 'view_property' and property_id = p_property
                and at > now() - interval '7 days') end,
    'now_sids', case when p_property is null then '[]'::jsonb else
             coalesce((select jsonb_agg(sid) from (
                select distinct on (sid) sid, property_id, event from web_events
                where flag is null and at > now() - interval '15 minutes'
                order by sid, at desc) l where l.property_id = p_property and l.event <> 'dwell'), '[]'::jsonb) end
  );
$$;
revoke all on function public.web_live_counts(uuid) from public, anon, authenticated;
grant execute on function public.web_live_counts(uuid) to service_role;
