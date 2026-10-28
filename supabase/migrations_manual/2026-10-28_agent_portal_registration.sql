-- Makelaarsportaal (28-10-2026, BD-169): registratie via Sola, e-mailcode bij registratie, wijziging en nieuw apparaat.
-- Tabellen in core (RLS aan, geen toegang voor anon/authenticated); RPC's alleen voor service_role (edge function agent-viewing).
create table if not exists core.agent_portal_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purpose text not null check (purpose in ('login','register')),
  code_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);
create index if not exists agent_portal_codes_email_idx on core.agent_portal_codes (lower(email), created_at desc);
alter table core.agent_portal_codes enable row level security;
revoke all on core.agent_portal_codes from anon, authenticated;

create table if not exists core.agent_portal_devices (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references core.contacts(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists agent_portal_devices_contact_idx on core.agent_portal_devices (contact_id);
alter table core.agent_portal_devices enable row level security;
revoke all on core.agent_portal_devices from anon, authenticated;

-- nieuwe code (max 5 per e-mailadres per 30 min); geeft id terug of null bij limiet
create or replace function public.agent_portal_code_new(p_email text, p_purpose text, p_hash text, p_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_n int;
begin
  select count(*) into v_n from core.agent_portal_codes c where lower(c.email) = lower(p_email) and c.created_at > now() - interval '30 minutes';
  if v_n >= 5 then return null; end if;
  update core.agent_portal_codes c set used_at = now() where lower(c.email) = lower(p_email) and c.purpose = p_purpose and c.used_at is null;
  insert into core.agent_portal_codes (email, purpose, code_hash, payload, expires_at)
  values (lower(btrim(p_email)), p_purpose, p_hash, coalesce(p_payload, '{}'::jsonb), now() + interval '15 minutes') returning id into v_id;
  return v_id;
end $$;

-- code controleren: { ok, reason (wrong|expired|used|attempts|missing), email, purpose, payload }
create or replace function public.agent_portal_code_check(p_id uuid, p_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r core.agent_portal_codes;
begin
  select * into r from core.agent_portal_codes c where c.id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'missing'); end if;
  if r.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'used'); end if;
  if r.expires_at < now() then return jsonb_build_object('ok', false, 'reason', 'expired'); end if;
  if r.attempts >= 5 then return jsonb_build_object('ok', false, 'reason', 'attempts'); end if;
  if r.code_hash <> p_hash then
    update core.agent_portal_codes c set attempts = c.attempts + 1 where c.id = p_id;
    return jsonb_build_object('ok', false, 'reason', case when r.attempts + 1 >= 5 then 'attempts' else 'wrong' end);
  end if;
  update core.agent_portal_codes c set used_at = now() where c.id = p_id;
  return jsonb_build_object('ok', true, 'email', r.email, 'purpose', r.purpose, 'payload', r.payload);
end $$;

-- vertrouwd apparaat (180 dagen)
create or replace function public.agent_portal_device_new(p_contact uuid, p_email text, p_hash text, p_ua text)
returns void language sql security definer set search_path = '' as $$
  insert into core.agent_portal_devices (contact_id, email, token_hash, user_agent, expires_at)
  values (p_contact, lower(btrim(p_email)), p_hash, left(p_ua, 300), now() + interval '180 days');
$$;
create or replace function public.agent_portal_device_check(p_hash text, p_email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v uuid;
begin
  update core.agent_portal_devices d set last_seen_at = now()
   where d.token_hash = p_hash and lower(d.email) = lower(btrim(p_email)) and d.expires_at > now()
  returning d.contact_id into v;
  return v;
end $$;
create or replace function public.agent_portal_device_forget(p_hash text)
returns void language sql security definer set search_path = '' as $$
  update core.agent_portal_devices d set expires_at = now() where d.token_hash = p_hash;
$$;

-- wie kennen we al met dit e-mailadres / dit mobiele nummer (laatste 9 cijfers)?
create or replace function public.agent_portal_reg_lookup(p_email text, p_mobile text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_email text := lower(btrim(coalesce(p_email,''))); v_d text := right(regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g'), 9);
  e jsonb; m jsonb; v_eid uuid; v_mid uuid;
begin
  select ce.contact_id into v_eid from core.contact_emails ce where lower(ce.email) = v_email order by ce.is_primary desc limit 1;
  if length(v_d) = 9 then
    select ph.contact_id into v_mid from core.contact_phones ph where right(ph.phone_digits, 9) = v_d
     order by (ph.contact_id = v_eid) desc nulls last, exists (select 1 from core.contact_roles r where r.contact_id = ph.contact_id and r.role = 'agent') desc, ph.is_primary desc limit 1;
  end if;
  if v_eid is not null then
    select jsonb_build_object('id', c.id, 'first_name', c.first_name, 'last_name', c.last_name, 'company', c.company,
      'is_agent', exists (select 1 from core.contact_roles r where r.contact_id = c.id and r.role = 'agent'),
      'has_mobile', length(v_d) = 9 and exists (select 1 from core.contact_phones ph where ph.contact_id = c.id and right(ph.phone_digits, 9) = v_d))
      into e from core.contacts c where c.id = v_eid;
  end if;
  if v_mid is not null and v_mid is distinct from v_eid then
    select jsonb_build_object('id', c.id, 'company', c.company,
      'is_agent', exists (select 1 from core.contact_roles r where r.contact_id = c.id and r.role = 'agent'),
      'email', (select ce.email from core.contact_emails ce where ce.contact_id = c.id order by ce.is_primary desc limit 1))
      into m from core.contacts c where c.id = v_mid;
  end if;
  return jsonb_build_object('email_contact', e, 'mobile_contact', m);
end $$;

-- registratie toepassen: nieuw contact of bestaand contact bijwerken; altijd rol agent, rol suspect eraf.
-- Het e-mailadres wint: bestaat het al, dan is dat contact het doel; anders p.target (gekozen via het mobiele nummer) of nieuw.
create or replace function public.agent_portal_register(p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_new boolean := false; v_apply boolean := coalesce((p->>'apply')::boolean, true);
  v_email text := lower(btrim(coalesce(p->>'email',''))); v_mobile text := btrim(coalesce(p->>'mobile',''));
  v_d text := regexp_replace(coalesce(p->>'mobile',''),'[^0-9]','','g');
  v_first text := nullif(btrim(coalesce(p->>'first_name','')),''); v_last text := nullif(btrim(coalesce(p->>'last_name','')),'');
  v_company text := nullif(btrim(coalesce(p->>'company','')),''); v_lang text := lower(left(nullif(btrim(coalesce(p->>'language','')),''),2));
  c core.contacts; v_before jsonb; v_ch text[] := '{}';
begin
  if v_email = '' then raise exception 'email ontbreekt'; end if;
  select ce.contact_id into v_id from core.contact_emails ce where lower(ce.email) = v_email order by ce.is_primary desc limit 1;
  if v_id is null then v_id := nullif(p->>'target','')::uuid; end if;
  if v_id is null then
    v_new := true;
    insert into core.contacts (title, first_name, last_name, company, language, source, primary_category)
    values ('agency', v_first, v_last, v_company, case when v_lang in ('nl','en','es','de','fr','sv','no','da','fi','ru') then v_lang end, 'agent-portal', 'agent')
    returning id into v_id;
    insert into core.contact_emails (contact_id, email, is_primary) values (v_id, v_email, true);
    if length(v_d) >= 9 then insert into core.contact_phones (contact_id, phone, is_primary) values (v_id, v_mobile, true); end if;
    v_ch := array['nieuw makelaarscontact'];
  else
    select * into c from core.contacts where id = v_id;
    v_before := jsonb_build_object('first_name', c.first_name, 'last_name', c.last_name, 'company', c.company,
      'emails', (select coalesce(jsonb_agg(ce.email), '[]'::jsonb) from core.contact_emails ce where ce.contact_id = v_id),
      'phones', (select coalesce(jsonb_agg(ph.phone), '[]'::jsonb) from core.contact_phones ph where ph.contact_id = v_id),
      'primary_category', c.primary_category);
    if v_apply then
      if v_first is not null and lower(coalesce(c.first_name,'')) <> lower(v_first) then v_ch := v_ch || ('voornaam: ' || coalesce(c.first_name,'-') || ' -> ' || v_first); end if;
      if v_last is not null and lower(coalesce(c.last_name,'')) <> lower(v_last) then v_ch := v_ch || ('achternaam: ' || coalesce(c.last_name,'-') || ' -> ' || v_last); end if;
      if v_company is not null and lower(regexp_replace(coalesce(c.company,''),'[^a-zA-Z0-9]','','g')) <> lower(regexp_replace(v_company,'[^a-zA-Z0-9]','','g')) then
        v_ch := v_ch || ('makelaardij: ' || coalesce(c.company,'-') || ' -> ' || v_company); end if;
      update core.contacts set first_name = coalesce(v_first, first_name), last_name = coalesce(v_last, last_name),
        company = coalesce(v_company, company), updated_at = now() where id = v_id;
      if not exists (select 1 from core.contact_emails ce where ce.contact_id = v_id and lower(ce.email) = v_email) then
        insert into core.contact_emails (contact_id, email, is_primary) values (v_id, v_email, false);
        v_ch := v_ch || ('e-mail toegevoegd: ' || v_email);
      end if;
      update core.contact_emails ce set is_primary = (lower(ce.email) = v_email) where ce.contact_id = v_id;
      if length(v_d) >= 9 then
        if not exists (select 1 from core.contact_phones ph where ph.contact_id = v_id and right(ph.phone_digits,9) = right(v_d,9)) then
          insert into core.contact_phones (contact_id, phone, is_primary) values (v_id, v_mobile, false);
          v_ch := v_ch || ('mobiel toegevoegd: ' || v_mobile);
        end if;
        update core.contact_phones ph set is_primary = (right(ph.phone_digits,9) = right(v_d,9)) where ph.contact_id = v_id;
      end if;
    end if;
  end if;
  if not exists (select 1 from core.contact_roles r where r.contact_id = v_id and r.role = 'agent') then
    insert into core.contact_roles (contact_id, role) values (v_id, 'agent');
    if not v_new then v_ch := v_ch || 'rol makelaar toegevoegd'::text; end if;
  end if;
  if exists (select 1 from core.contact_roles r where r.contact_id = v_id and r.role = 'suspect') then
    delete from core.contact_roles r where r.contact_id = v_id and r.role = 'suspect';
    v_ch := v_ch || 'rol suspect verwijderd'::text;
  end if;
  update core.contacts set primary_category = 'agent' where id = v_id and primary_category is distinct from 'agent';
  return jsonb_build_object('contact_id', v_id, 'created', v_new, 'changes', to_jsonb(v_ch), 'before', v_before);
end $$;

revoke execute on function public.agent_portal_code_new(text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.agent_portal_code_check(uuid, text) from public, anon, authenticated;
revoke execute on function public.agent_portal_device_new(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.agent_portal_device_check(text, text) from public, anon, authenticated;
revoke execute on function public.agent_portal_device_forget(text) from public, anon, authenticated;
revoke execute on function public.agent_portal_reg_lookup(text, text) from public, anon, authenticated;
revoke execute on function public.agent_portal_register(jsonb) from public, anon, authenticated;
grant execute on function public.agent_portal_code_new(text, text, text, jsonb), public.agent_portal_code_check(uuid, text),
  public.agent_portal_device_new(uuid, text, text, text), public.agent_portal_device_check(text, text), public.agent_portal_device_forget(text),
  public.agent_portal_reg_lookup(text, text), public.agent_portal_register(jsonb) to service_role;
