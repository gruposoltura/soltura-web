-- Client Claim System (28-10-2026, BD-171). Volgt op BD-170.
-- 1. Label heet voortaan 'agent_lead' (NEXUS: AgentLead) i.p.v. agent_client: labels blijven Engels.
--    (Tijdens het bouwen kort 'agent_lead' geheten; alles is in dezelfde sessie omgezet naar agent_lead.)
-- 2. Basisregel: een door een makelaar aangemelde klant blijft 90 dagen op naam van die makelaar geregistreerd.
-- 3. Purge: na 90 dagen verdwijnt een niet-geconverteerde claim (contact weg, cascade ruimt aanvraag/bezichtiging op).
--    Wie wel converteerde - een ander label (suspect, buyer, ...), een bezichtiging of een koppeling aan een woning -
--    blijft staan. Geen matching op naam: een claim is per aanvraag.

-- ---------- 1. rol hernoemen ----------
-- eerst de data, dan de constraint: anders botst de oude waarde met de nieuwe lijst.
alter table core.contact_roles drop constraint if exists contact_roles_role_check;
update core.contact_roles set role = 'agent_lead' where role = 'agent_client';
update core.contacts set primary_category = 'agent_lead', updated_at = now() where primary_category = 'agent_client';
alter table core.contact_roles add constraint contact_roles_role_check
  check (role = any (array['suspect','seller','buyer','suspect_seller','agent','prospect','partner','keyholder','agent_lead']));

-- ---------- 2. v2_contacts: kolom hernoemen en rolprioriteit bijwerken ----------
alter view public.v2_contacts rename column is_agent_client to is_agent_lead;  -- BD-170 heette de kolom is_agent_client

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
          ORDER BY (array_position(ARRAY['seller'::text, 'buyer'::text, 'agent'::text, 'suspect_seller'::text, 'suspect'::text, 'prospect'::text, 'partner'::text, 'keyholder'::text, 'agent_lead'::text], r.role))
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
    -- AgentLead: klant van een samenwerkende makelaar: nooit in een mailing (28-10-2026)
    (EXISTS ( SELECT 1 FROM core.contact_roles r WHERE r.contact_id = c.id AND r.role = 'agent_lead'::text)) AS is_agent_lead
   FROM core.contacts c
     LEFT JOIN core.legacy_map lm ON lm.entity = 'contact'::text AND lm.id = c.id;

-- ---------- 3. mailpoort ----------
create or replace function public.nexus2_mailing_audience(p_type text, p_categories text[] default null::text[])
 returns table(contact_id uuid, wp_id bigint, email text, first_name text, full_name text, language text, category text, unsub_sig text)
 language sql stable security definer set search_path to ''
as $function$
  select distinct on (lower(c.email))
         c.id, c.wp_id, c.email, c.first_name, c.full_name, c.language, c.category, public.nexus2_unsub_sig(c.id, p_type)
    from public.v2_contacts c
   where c.email is not null and position('@' in c.email) > 1 and c.opt_in
     and not c.is_agent_lead   -- AgentLead (klant van een makelaar) (28-10-2026): nooit mailen
     and coalesce((c.mailing_prefs->p_type->>'on')::boolean,
                  (select m.default_opt_in from public.mailing_types m where m.slug = p_type), true)
     and (p_categories is null
          or c.category = any(p_categories)
          or replace(c.category, '-', '_') = any(p_categories))
     and not exists (select 1 from public.email_bounces b where lower(b.email) = lower(c.email))
   order by lower(c.email), c.wp_modified desc nulls last
$function$;

-- ---------- 4. verlopen claims ophalen ----------
-- Kandidaat = uitsluitend het label agent_lead, ouder dan p_days, en geen enkel teken van conversie.
create or replace function public.nexus2_claim_purge_candidates(p_days int default 90, p_max int default 200)
 returns table(contact_id uuid, created_at timestamptz, days_old int, agency text, prop_refs text)
 language sql stable security definer set search_path to ''
as $function$
  select c.id, c.created_at,
         floor(extract(epoch from now() - c.created_at) / 86400.0)::int,
         (select string_agg(distinct coalesce(ag.company, ag.full_name), ', ')
            from core.requests r
            left join core.contacts ag on ag.id = (select e.contact_id from core.contact_emails e
                                                    where lower(e.email) = lower(coalesce(r.payload->>'agent_email','-')) limit 1)
           where r.contact_id = c.id),
         (select string_agg(distinct p.reference, ', ')
            from core.requests r join core.properties p on p.id = r.property_id where r.contact_id = c.id)
    from core.contacts c
   where c.created_at < now() - make_interval(days => greatest(p_days, 1))
     and exists (select 1 from core.contact_roles r where r.contact_id = c.id and r.role = 'agent_lead')
     and not exists (select 1 from core.contact_roles r where r.contact_id = c.id and r.role <> 'agent_lead')
     and not exists (select 1 from core.viewings v where v.contact_id = c.id)
     and not exists (select 1 from core.properties p
                      where p.buyer_contact_id = c.id or p.owner_contact_id = c.id
                         or p.agency_contact_id = c.id or p.sold_agency_agent_id = c.id)
     and not exists (select 1 from core.partner_feeds f where f.agency_contact_id = c.id)
     and not exists (select 1 from core.partner_export_feeds f where f.agency_contact_id = c.id)
   order by c.created_at
   limit greatest(p_max, 1)
$function$;

-- ---------- 5. purge uitvoeren ----------
-- Verwijdert de contacten uit 4; FK's op core (aanvragen, bezichtigingen, mails, notities) staan op cascade.
-- Retourneert wat er weg is zonder klantnamen: alleen makelaardij, woningreferentie en leeftijd.
create or replace function public.nexus2_claim_purge(p_days int default 90, p_max int default 50, p_dry_run boolean default false)
 returns jsonb language plpgsql security definer set search_path to ''
as $function$
declare v_rows jsonb; v_ids uuid[]; v_n int;
begin
  select coalesce(jsonb_agg(jsonb_build_object('days_old', k.days_old, 'agency', k.agency, 'props', k.prop_refs)), '[]'::jsonb),
         coalesce(array_agg(k.contact_id), '{}'::uuid[])
    into v_rows, v_ids
    from public.nexus2_claim_purge_candidates(p_days, p_max) k;
  v_n := coalesce(array_length(v_ids, 1), 0);
  if v_n > 0 and not coalesce(p_dry_run, false) then
    delete from core.contacts c where c.id = any(v_ids);
  end if;
  return jsonb_build_object('purged', case when coalesce(p_dry_run, false) then 0 else v_n end,
                            'candidates', v_n, 'dry_run', coalesce(p_dry_run, false),
                            'days', greatest(p_days, 1), 'rows', v_rows);
end $function$;

revoke execute on function public.nexus2_claim_purge_candidates(int, int) from public, anon, authenticated;
revoke execute on function public.nexus2_claim_purge(int, int, boolean) from public, anon, authenticated;
grant execute on function public.nexus2_claim_purge_candidates(int, int), public.nexus2_claim_purge(int, int, boolean) to service_role;

-- ---------- 6. klantcheck op e-mail tot en met '@' (Client Claim System) ----------
-- De makelaar geeft voornaam, achternaam en het deel tot en met '@'. Daarmee checkt Sola of de klant al bestaat:
-- bestaat hij bij ons of bij een andere makelaar -> aanvraag geweigerd + Telegram-alarm; eigen AgentLead van dezelfde
-- makelaar -> de nieuwe aanvraag hangt aan het bestaande contact. Nooit matchen op naam.
alter table core.contacts add column if not exists claim_email_local text;
create index if not exists contacts_claim_email_local_idx on core.contacts (lower(claim_email_local)) where claim_email_local is not null;

-- nexus2_claim_check(p_local, p_agent_email) -> {status: free|own|known, local, contact_id}
--   known: er bestaat al een contact met dezelfde local part (eigen contact of claim van een andere makelaar)
--   own:   bestaand agent_lead-contact dat door DEZELFDE makelaar is aangebracht (contact_relations introduced_by)
-- nexus2_claim_register(p_contact_id, p_local) -> legt de local part vast op het contact (eenmalig, niet overschrijven)
-- nexus2_claim_attach(p_request_id, p_keep_contact) -> hangt de aanvraag aan het bestaande contact en ruimt het lege nieuwe op
-- De volledige definities staan in de migraties client_claim_check_by_email_local en claim_functions_agent_lead.

-- Uitkomst client_known mag in de intake-log (menu Bezichtiging in NEXUS):
alter table core.viewing_intake drop constraint if exists viewing_intake_outcome_check;
alter table core.viewing_intake add constraint viewing_intake_outcome_check
  check (outcome = any (array['registration_requested','registration_incomplete','agent_registered','incomplete','ref_not_found','not_available','processed','nexus_failed','skipped','client_known']));
