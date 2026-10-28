-- Makelaarsklant + opvolging bezichtigingsaanvragen (28-10-2026, BD-170).
-- 1. Nieuw contactlabel 'agent_client': de klant van een samenwerkende makelaar. Niet onze suspect; nooit mailen.
-- 2. Uitgesloten van alle uitgaande mail (nexus2_mailing_audience is de poort voor alle bulkmailers en de matcher).
-- 3. Bestaande, via een makelaar aangemaakte contacten krijgen dit label en verliezen hun andere labels.
-- 4. Functies voor de 24-uursopvolging: openstaande aanvragen ophalen en afmelden via een ondertekende link.

-- ---------- 1. rol toestaan ----------
alter table core.contact_roles drop constraint if exists contact_roles_role_check;
alter table core.contact_roles add constraint contact_roles_role_check
  check (role = any (array['suspect','seller','buyer','suspect_seller','agent','prospect','partner','keyholder','agent_client']));

-- ---------- 2. v2_contacts: label meenemen (kolom erbij, bestaande kolommen ongewijzigd) ----------
create or replace view public.v2_contacts as
 SELECT lm.wp_id,
    c.id,
    ( SELECT e.email FROM core.contact_emails e WHERE e.contact_id = c.id ORDER BY e.is_primary DESC LIMIT 1) AS email,
    c.full_name,
    ( SELECT p.phone FROM core.contact_phones p WHERE p.contact_id = c.id ORDER BY p.is_primary DESC LIMIT 1) AS phone,
    'publish'::text AS status,
    c.mailing_optin AS opt_in,
    upper(c.language) AS language,
    COALESCE(replace(c.primary_category, '_'::text, '-'::text), ( SELECT replace(r.role, '_'::text, '-'::text) AS replace
           FROM core.contact_roles r
          WHERE r.contact_id = c.id
          ORDER BY (array_position(ARRAY['seller'::text, 'buyer'::text, 'agent'::text, 'suspect_seller'::text, 'suspect'::text, 'prospect'::text, 'partner'::text, 'keyholder'::text, 'agent_client'::text], r.role))
         LIMIT 1)) AS category,
    ( SELECT lt.wp_id FROM core.legacy_map lt WHERE lt.entity = 'team_member'::text AND lt.id = c.owner_id) AS agent_wp_id,
    ( SELECT lt.wp_id FROM core.legacy_map lt WHERE lt.entity = 'team_member'::text AND lt.id = c.owner_id) AS wp_author_id,
    (EXISTS ( SELECT 1 FROM core.contact_roles r WHERE r.contact_id = c.id AND r.role = 'agent'::text)) AS is_agent,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('name', replace(r.role, '_'::text, '-'::text), 'slug', replace(r.role, '_'::text, '-'::text), 'taxonomy', 'cpr_contact_tag')) AS jsonb_agg
           FROM core.contact_roles r WHERE r.contact_id = c.id), '[]'::jsonb) AS labels,
    c.updated_at AS wp_modified,
    c.first_name,
    c.last_name,
    c.mailing_prefs,
    ((c.mailing_prefs -> 'review_invite'::text) ->> 'last'::text)::timestamp with time zone AS review_invite_lastdate,
    ( SELECT t.email FROM core.team_members t WHERE t.id = c.owner_id) AS owner_email,
    c.created_at,
    -- klant van een samenwerkende makelaar: nooit in een mailing (28-10-2026)
    (EXISTS ( SELECT 1 FROM core.contact_roles r WHERE r.contact_id = c.id AND r.role = 'agent_client'::text)) AS is_agent_client
   FROM core.contacts c
     LEFT JOIN core.legacy_map lm ON lm.entity = 'contact'::text AND lm.id = c.id;

-- ---------- 3. uitsluiten van alle uitgaande mail ----------
create or replace function public.nexus2_mailing_audience(p_type text, p_categories text[] default null::text[])
 returns table(contact_id uuid, wp_id bigint, email text, first_name text, full_name text, language text, category text, unsub_sig text)
 language sql stable security definer set search_path to ''
as $function$
  select distinct on (lower(c.email))
         c.id, c.wp_id, c.email, c.first_name, c.full_name, c.language, c.category, public.nexus2_unsub_sig(c.id, p_type)
    from public.v2_contacts c
   where c.email is not null and position('@' in c.email) > 1 and c.opt_in
     and not c.is_agent_client   -- klant van een samenwerkende makelaar (28-10-2026): nooit mailen
     and coalesce((c.mailing_prefs->p_type->>'on')::boolean,
                  (select m.default_opt_in from public.mailing_types m where m.slug = p_type), true)
     and (p_categories is null
          or c.category = any(p_categories)
          or replace(c.category, '-', '_') = any(p_categories))
     and not exists (select 1 from public.email_bounces b where lower(b.email) = lower(c.email))
   order by lower(c.email), c.wp_modified desc nulls last
$function$;

-- ---------- 4. bestaande door een makelaar aangemelde klanten omzetten ----------
-- Alleen contacten die via een bezichtigingsaanvraag van een makelaar zijn ontstaan (bron agent-portal of appointment-agent).
with v as (
  select distinct c.id
    from core.requests r join core.contacts c on c.id = r.contact_id
   where r.source in ('agent-portal','appointment-agent')
)
, del as (delete from core.contact_roles r using v where r.contact_id = v.id and r.role <> 'agent_client' returning 1)
, ins as (insert into core.contact_roles (contact_id, role) select v.id, 'agent_client' from v on conflict do nothing returning 1)
update core.contacts c set primary_category = 'agent_client', mailing_optin = false, updated_at = now()
  from v where c.id = v.id;

-- ---------- 5. ondertekende afmeldlink ----------
insert into private.app_secret (name, secret)
select 'viewing_hmac', encode(extensions.gen_random_bytes(32), 'hex')
where not exists (select 1 from private.app_secret s where s.name = 'viewing_hmac');

create or replace function public.nexus2_viewing_sig(p_request_id uuid)
 returns text language sql stable security definer set search_path to 'private', 'extensions', 'pg_catalog'
as $function$
  select case when coalesce((select secret from private.app_secret where name = 'viewing_hmac'), '') = '' then ''
    else substr(encode(hmac(p_request_id::text || ':viewing', (select secret from private.app_secret where name = 'viewing_hmac'), 'sha256'), 'hex'), 1, 24) end
$function$;

-- ---------- 6. openstaande bezichtigingsaanvragen van makelaars ----------
-- p_hours: minimaal zo oud; p_max_reminders: stop na zoveel herinneringen.
create or replace function public.nexus2_agent_viewings_pending(p_hours int default 24, p_max_reminders int default 3)
 returns table(request_id uuid, created_at timestamptz, hours_open numeric, ref text, client_name text,
               day text, "time" text, agent_name text, agent_company text, agent_email text,
               rep_email text, rep_name text, prop_rep_email text, prop_rep_name text, has_keys boolean,
               reminders int, sig text)
 language sql stable security definer set search_path to ''
as $function$
  select r.id, r.created_at, round((extract(epoch from now() - r.created_at) / 3600.0)::numeric, 1),
         p.reference, nullif(btrim(coalesce(c.first_name,'') || ' ' || coalesce(c.last_name,'')), ''),
         r.payload->>'day', r.payload->>'time',
         ag.full_name, ag.company, r.payload->>'agent_email',
         coalesce(own.email, prep.email), coalesce(own.display_name, prep.display_name),
         prep.email, prep.display_name, coalesce(v.has_keys, false),
         coalesce((r.payload->>'reminders')::int, 0), public.nexus2_viewing_sig(r.id)
    from core.requests r
    left join core.contacts c on c.id = r.contact_id
    left join core.properties p on p.id = r.property_id
    left join public.v2_properties v on v.id = p.id
    left join core.team_members own on own.id = c.owner_id and own.active
    left join core.team_members prep on prep.id = p.listing_agent_id and prep.active
    left join core.contacts ag on ag.id = (select e.contact_id from core.contact_emails e
                                            where lower(e.email) = lower(coalesce(r.payload->>'agent_email','-')) limit 1)
   where r.source in ('agent-portal','appointment-agent') and r.type = 'viewing'
     and r.status not in ('closed') and r.processed_at is null
     and r.created_at < now() - make_interval(hours => greatest(p_hours, 1))
     and coalesce((r.payload->>'reminders')::int, 0) < greatest(p_max_reminders, 1)
     and (r.payload->>'reminded_at' is null or (r.payload->>'reminded_at')::timestamptz < now() - interval '20 hours')
   order by r.created_at
$function$;

create or replace function public.nexus2_agent_viewing_reminded(p_request_id uuid)
 returns void language sql security definer set search_path to ''
as $function$
  update core.requests r
     set payload = coalesce(r.payload, '{}'::jsonb)
                 || jsonb_build_object('reminders', coalesce((r.payload->>'reminders')::int, 0) + 1,
                                       'reminded_at', to_jsonb(now()))
   where r.id = p_request_id;
$function$;

-- ---------- 7. afmelden: aanvraag afgehandeld ----------
-- Wordt aangeroepen vanuit de knop in de herinneringsmail (n8n-webhook met id + handtekening).
create or replace function public.nexus2_agent_viewing_handled(p_request_id uuid, p_sig text, p_by text default null)
 returns jsonb language plpgsql security definer set search_path to ''
as $function$
declare r core.requests%rowtype;
begin
  select * into r from core.requests where id = p_request_id;
  if not found then return jsonb_build_object('ok', false, 'reason', 'missing'); end if;
  if coalesce(p_sig,'') = '' or p_sig <> public.nexus2_viewing_sig(p_request_id) then
    return jsonb_build_object('ok', false, 'reason', 'signature');
  end if;
  if r.status = 'closed' or r.processed_at is not null then
    return jsonb_build_object('ok', true, 'already', true, 'ref', (select p.reference from core.properties p where p.id = r.property_id));
  end if;
  update core.requests
     set status = 'closed', processed_at = now(),
         payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object('handled_by', nullif(btrim(coalesce(p_by,'')),''), 'handled_at', to_jsonb(now()))
   where id = p_request_id;
  return jsonb_build_object('ok', true, 'already', false,
    'ref', (select p.reference from core.properties p where p.id = r.property_id),
    'client', (select nullif(btrim(coalesce(c.first_name,'') || ' ' || coalesce(c.last_name,'')), '') from core.contacts c where c.id = r.contact_id));
end $function$;

revoke execute on function public.nexus2_viewing_sig(uuid) from public, anon, authenticated;
revoke execute on function public.nexus2_agent_viewings_pending(int, int) from public, anon, authenticated;
revoke execute on function public.nexus2_agent_viewing_reminded(uuid) from public, anon, authenticated;
revoke execute on function public.nexus2_agent_viewing_handled(uuid, text, text) from public, anon, authenticated;
grant execute on function public.nexus2_viewing_sig(uuid), public.nexus2_agent_viewings_pending(int, int),
  public.nexus2_agent_viewing_reminded(uuid), public.nexus2_agent_viewing_handled(uuid, text, text) to service_role;
