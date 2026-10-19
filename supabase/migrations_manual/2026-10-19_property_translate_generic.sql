-- Uniforme vertaalagents (19-10-2026): Engels is de brontaal; Nederlands en Zweeds worden allebei vertaald
-- door edge function property-translate (JARVIS-Web-TranslateNL / -TranslateSV).
create table if not exists public.translate_fail (
  property_id uuid not null references core.properties(id) on delete cascade,
  lang text not null check (lang in ('nl', 'sv')),
  attempts int not null default 0, last_error text, at timestamptz not null default now(),
  primary key (property_id, lang));
alter table public.translate_fail enable row level security;
revoke all on public.translate_fail from anon, authenticated;
insert into public.translate_fail (property_id, lang, attempts, last_error, at)
  select property_id, 'sv', attempts, last_error, at from public.sv_translate_fail on conflict do nothing;

create or replace function public.nexus2_tr_queue(p_lang text, p_limit int default 8)
returns table (property_id uuid, reference text, heading text, description text, seo_title text, seo_description text)
language sql security definer set search_path = '' as $$
  select p.id, p.reference, en.heading, en.description, en.seo_title, en.seo_description
    from core.properties p
    join core.property_texts en on en.property_id = p.id and en.lang = 'en' and nullif(btrim(en.description), '') is not null
    left join core.property_texts t on t.property_id = p.id and t.lang = p_lang
    left join public.translate_fail f on f.property_id = p.id and f.lang = p_lang
   where p_lang in ('nl', 'sv') and p.published and p.status in ('available', 'under_offer', 'reserved')
     and (t.property_id is null or nullif(btrim(t.description), '') is null or t.updated_at < en.updated_at)
     and (f.property_id is null or f.attempts < 3 or f.at < en.updated_at)
   order by coalesce(f.attempts, 0), (p.origin = 'own') desc, (p.status = 'available') desc, p.listed_at desc nulls last
   limit greatest(1, least(coalesce(p_limit, 8), 50));
$$;
create or replace function public.nexus2_tr_queue_count(p_lang text)
returns int language sql security definer set search_path = '' as $$
  select count(*)::int
    from core.properties p
    join core.property_texts en on en.property_id = p.id and en.lang = 'en' and nullif(btrim(en.description), '') is not null
    left join core.property_texts t on t.property_id = p.id and t.lang = p_lang
    left join public.translate_fail f on f.property_id = p.id and f.lang = p_lang
   where p_lang in ('nl', 'sv') and p.published and p.status in ('available', 'under_offer', 'reserved')
     and (t.property_id is null or nullif(btrim(t.description), '') is null or t.updated_at < en.updated_at)
     and (f.property_id is null or f.attempts < 3 or f.at < en.updated_at);
$$;
create or replace function public.nexus2_tr_save(p_lang text, p_property uuid, p_heading text, p_description text, p_seo_title text, p_seo_description text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_lang not in ('nl', 'sv') then raise exception 'taal % niet toegestaan', p_lang; end if;
  insert into core.property_texts (property_id, lang, heading, description, seo_title, seo_description, updated_at)
  values (p_property, p_lang, nullif(btrim(p_heading), ''), nullif(btrim(p_description), ''), nullif(btrim(p_seo_title), ''), nullif(btrim(p_seo_description), ''), now())
  on conflict (property_id, lang) do update set heading = excluded.heading, description = excluded.description,
    seo_title = excluded.seo_title, seo_description = excluded.seo_description, updated_at = now();
  delete from public.translate_fail where property_id = p_property and lang = p_lang;
end $$;
create or replace function public.nexus2_tr_fail(p_lang text, p_property uuid, p_error text)
returns void language sql security definer set search_path = '' as $$
  insert into public.translate_fail (property_id, lang, attempts, last_error, at) values (p_property, p_lang, 1, left(p_error, 300), now())
  on conflict (property_id, lang) do update set attempts = public.translate_fail.attempts + 1, last_error = excluded.last_error, at = now();
$$;
revoke all on function public.nexus2_tr_queue(text, int), public.nexus2_tr_queue_count(text), public.nexus2_tr_save(text, uuid, text, text, text, text), public.nexus2_tr_fail(text, uuid, text) from public, anon, authenticated;
grant execute on function public.nexus2_tr_queue(text, int), public.nexus2_tr_queue_count(text), public.nexus2_tr_save(text, uuid, text, text, text, text), public.nexus2_tr_fail(text, uuid, text) to service_role;

-- Agent SEO schrijft de Engelse brontekst: een gewijzigde Engelse omschrijving of kop moet de vertalingen laten verversen
-- (nexus2_set_property_seo zette updated_at niet).
do $$
declare d text; n text;
begin
  d := pg_get_functiondef('public.nexus2_set_property_seo(uuid,text,text,text,text,text,text,jsonb)'::regprocedure);
  n := replace(d, $x$    seo_enriched_at = now();$x$, $x$    seo_enriched_at = now(),
    updated_at      = case when excluded.description is distinct from null and excluded.description is distinct from core.property_texts.description
                             or excluded.heading is distinct from null and excluded.heading is distinct from core.property_texts.heading
                           then now() else core.property_texts.updated_at end;$x$);
  if n = d then raise exception 'patch set_property_seo niet toegepast'; end if;
  execute n;
end $$;

insert into public.fn_keys (name, value) values ('property-translate', encode(gen_random_bytes(24), 'hex')) on conflict do nothing;
