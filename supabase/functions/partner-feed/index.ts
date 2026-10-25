// partner-feed — Kyero v3-feed van onze gepubliceerde eigen woningen voor partnermakelaars.
// Vervangt CPR "XML Export". Elke makelaar heeft een eigen token (core.partner_export_feeds.token).
// URL: https://<project>.supabase.co/functions/v1/partner-feed/<token>
//   (ook ok: .../partner-feed/<token>/, .../partner-feed/exportxml/gruposoltura/<token>/ en ?token=<token>,
//    zodat een latere rewrite van het oude WP-pad hier 1-op-1 op kan landen).
// Eigen tokencontrole, daarom verify_jwt=false. Onbekend/inactief token → 404.
// Woninglink: zie v15 hieronder.
// v7 (18-10-2026, NEXUS menu XML): elke aanroep ook in core.partner_export_feed_hits (90 dagen), ook geweigerde (inactief = 404).
// v8 (18-10-2026, Rick): variant 'idealista' bevat NOOIT nieuwbouw (build_type = 'new_build'), ook niet met export_feeds 'idealista'.
//   Aanleiding: Idealista-incidentmelding "obra nueva publicada en segunda mano".
// v9 (19-10-2026, Rick): ook de partnerfeeds (variant 'gruposoltura') bevatten GEEN nieuwbouw meer.
// v10 (23-10-2026, Rick): variant 'thinkspain' — portaal thinkSPAIN, eigen formaat v1.16
//   (https://www.thinkspainproperty.com/thinkspain.xml).
// v11 (23-10-2026, Rick): thinkspain = max 20 woningen, nieuwbouw MAG. Alle eigen beschikbare woningen;
//   eerst bestaande bouw, daarna nieuwbouw, binnen elke groep nieuwste eerst; afgekapt op 20.
// v12 (23-10-2026, Rick): thinkspain NOOIT adres of locatie: geen straat, huisnummer, postcode, kadaster,
//   coordinaten; display_address altijd 0. Afstanden (km_*) blijven. "Adres nooit zichtbaar in een advertentie."
// v13 (23-10-2026, Rick): partnerfeeds (gruposoltura/resales/newdevelopments) NOOIT coordinaten.
//   thinkspain: straat, huisnummer, postcode en volledig adres WEL mee, met display_address=0 (verborgen).
//   Kadaster en coordinaten hebben in thinkSPAIN v1.16 geen verberg-vlag -> blijven weg.
// v14 (23-10-2026, Rick): thinkSPAIN-pakket = 25 woningen + 1 uitgelicht -> TS_MAX 25. Uitgelicht (RH550) gaat via het
//   thinkSPAIN-panel; v1.16 kent geen featured-veld.
// v15 (24-10-2026, UTM-conventie): woninglink = echt pad (/en/property/<ref>/, /nl/woning/<ref>/) i.p.v. /#/home/<REF>,
//   met utm_source = idealista | thinkspain | partner_<naam feed>, utm_medium=referral, utm_campaign=listing, utm_content=<REF>.
//   De site leest de woning uit de referentie in de slug en zet het pad daarna om naar de volledige slug (querystring blijft).
// v16 (25-10-2026, Rick): feature 'pool_unspecified' (zwembad, prive/gemeenschappelijk onbekend) -> <pool>1, maar GEEN
//   "private pool"-featuretekst. 'pool' (= prive) en 'communal_pool' ongewijzigd.
import postgres from "npm:postgres@3.4.5";

const DEFAULT_SITE = "https://gruposoltura.com";
const STORAGE_PUBLIC = `${Deno.env.get("SUPABASE_URL") ?? ""}/storage/v1/object/public/property-media/`;
const MAX_IMAGES = 50;
const TS_MAX = 25;
const LANGS = ["en", "nl", "es"] as const;
const TS_LANGS = ["en", "es", "nl", "de", "fr", "sv"] as const;

const esc = (v: unknown) =>
  String(v ?? "")
    // ongeldige XML 1.0-tekens weg (komen voor in geplakte WP-teksten)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tag = (name: string, v: unknown) =>
  v === null || v === undefined || v === "" ? `<${name}/>` : `<${name}>${esc(v)}</${name}>`;
// thinkSPAIN: optionele tags weglaten als ze leeg zijn
const opt = (name: string, v: unknown) => (v === null || v === undefined || v === "" ? "" : `<${name}>${esc(v)}</${name}>`);
const decodeEntities = (s: string) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
const plain = (html: string | null) =>
  decodeEntities(
    (html ?? "").replace(/\r/g, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6])>/gi, "\n").replace(/<[^>]+>/g, ""),
  ).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
const ACC_FROM = "áéíóúàèìòùäëïöüâêîôûñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑÇ";
const ACC_TO = "aeiouaeiouaeiouaeiouncAEIOUAEIOUAEIOUAEIOUNC";
const coord = (v: unknown) => (v === null || v === undefined ? null : Math.round(Number(v) * 1e6) / 1e6);
// v16: elk zwembad (prive, gemeenschappelijk of onbekend) telt voor de generieke pool-vlag
const POOL_FEATURES = new Set(["pool", "communal_pool", "pool_unspecified"]);

// v15: UTM-bron per feed. Portalen vast, partnermakelaars partner_<naam>.
export function utmSource(variant: string, feedName?: string | null): string {
  if (variant === "idealista") return "idealista";
  if (variant === "thinkspain") return "thinkspain";
  const slug = String(feedName ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/\(.*?\)/g, "").replace(/\.(com|es|nl|eu)\b/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  return slug ? `partner_${slug}` : "partner";
}
// v15: echt pad + UTM. Spaans heeft geen eigen site-taal -> Engels.
export function propUrl(site: string, ref: unknown, lang: string, source: string): string {
  const r = String(ref ?? "").trim();
  const path = lang === "nl" ? "nl/woning" : "en/property";
  const qs = `utm_source=${encodeURIComponent(source)}&utm_medium=referral&utm_campaign=listing&utm_content=${encodeURIComponent(r.toUpperCase())}`;
  return `${site}/${path}/${encodeURIComponent(r.toLowerCase())}/?${qs}`;
}

const FEATURE_TEXT: Record<string, string> = {
  pool: "private pool", communal_pool: "community pool", air_conditioning: "air-conditioning",
  air_conditioning_preinstalled: "pre-installed air-conditioning", central_heating: "central heating",
  underfloor_heating: "underfloor heating", solarium: "solarium", furnished: "fully furnished", semi_furnished: "partly furnished",
  fireplace: "fireplace", security_system: "security system", secure_parking: "secure parking", basement: "basement",
  storage_shed: "storage room", intercom: "intercom", fully_fenced: "fully fenced", split_heating: "split system heating",
  split_aircon: "split system airco", gas_heating: "gas heating", remote_garage: "remote garage", study: "study",
  workshop: "workshop", courtyard: "courtyard", deck: "deck", family_room: "family room",
  ducted_heating: "ducted heating", ducted_cooling: "ducted cooling", outdoor_entertaining: "outdoor entertaining",
};

const OPTION_SUFFIX: Record<string, string> = {
  kitchen: "kitchen", floor: "floor", aircon: "airco", terrace: "terrace", pool: "pool", heating: "heating",
};
const count = (n: unknown, one: string, many = `${one}s`) => {
  const v = Number(n ?? 0);
  return v > 0 ? `${v} ${v > 1 ? many : one}` : null;
};
const NOTES = "Soltura Real Estate - Your dream under the sun."; // zoals CPR

// thinkSPAIN-typenlijst (nota 1 in hun spec); niet-gelijste typen mogen als eigen tekst
const TS_TYPE: Record<string, string> = {
  villa: "Villa", apartment: "Apartment", penthouse: "Penthouse", bungalow: "Bungalow",
  quadrant: "Quad House", "semi-detached": "Semi-detached Villa", townhouse: "Townhouse",
  duplex: "Duplex", finca: "Finca/Country House",
};

export type FeedVariant = "gruposoltura" | "resales" | "newdevelopments" | "idealista" | "thinkspain";

export async function siteBase(sql: ReturnType<typeof postgres>): Promise<string> {
  try {
    const [r] = await sql`select to_jsonb(w) as j from public.web_config w where key = 'site_base_url'`;
    const j = (r?.j ?? {}) as Record<string, unknown>;
    const v = String(j.value_text ?? j.value ?? "").trim();
    if (/^https?:\/\/\S+$/.test(v)) return v.replace(/\/+$/, "").replace(/^https?:\/\/www\./i, "https://");
  } catch (_) { /* val terug op default */ }
  return DEFAULT_SITE;
}

async function loadRows(sql: ReturnType<typeof postgres>, variant: FeedVariant) {
  const descLangs = variant === "thinkspain" ? [...TS_LANGS] : [...LANGS];
  return await sql`
    select p.*, lm.wp_id,
           (select json_build_object('lat', g.lat, 'lng', g.lng, 'basis', x.basis)
              from (values (1, p.suburb, 'area'), (2, l.name, case when l.kind = 'municipality' then 'town' else 'area' end),
                           (3, lp.name, 'town'), (4, p.city, 'town')) x(o, nm, basis)
              join public.web_geo_points g on g.kind = 'town' and x.nm is not null
               and lower(translate(g.name, ${ACC_FROM}, ${ACC_TO})) = lower(translate(x.nm, ${ACC_FROM}, ${ACC_TO}))
             order by x.o limit 1) as centroid,
           coalesce((select json_object_agg(t.lang, t.description) from core.property_texts t
                      where t.property_id = p.id and t.lang = any(${sql.array(descLangs)}) and coalesce(t.description,'') <> ''), '{}') as descs,
           coalesce((select json_agg(json_build_object('s', m.storage_path, 'l', m.legacy_url, 'u', m.source_url)
                                     order by m.is_main desc nulls last, m.sort nulls last, m.created_at)
                       from core.property_media m where m.property_id = p.id and m.kind = 'photo'), '[]') as photos
      from core.properties p
      left join core.legacy_map lm on lm.entity = 'property' and lm.id = p.id
      left join core.locations l on l.id = p.location_id
      left join core.locations lp on lp.id = l.parent_id
     -- Rick 18-10 13:41: woningen onder bod (under_offer) gaan NIET naar Idealista en NIET naar de partnerfeeds
     -- Rick 18-10 18:41: nieuwbouw gaat NOOIT naar Idealista (ook niet via export_feeds)
     -- Rick 19-10 11:15: nieuwbouw gaat ook NIET naar de partnerfeeds (variant gruposoltura)
     -- Rick 23-10: thinkSPAIN mag nieuwbouw (max 25, zie buildThinkSpain)
     where p.origin = 'own' and p.published and p.status = 'available' and not coalesce(p.no_export, false)
       and ((${variant} = 'gruposoltura' and p.build_type is distinct from 'new_build')
            or (${variant} = 'resales' and p.build_type = 'resale')
            or (${variant} = 'newdevelopments' and p.build_type = 'new_build')
            or (${variant} = 'idealista' and p.build_type is distinct from 'new_build'
                and (p.reference ~ '^[A-Z]{2}[0-9]{3}$' or 'idealista' = any(coalesce(p.export_feeds, '{}'::text[]))))
            or (${variant} = 'thinkspain'))
     order by p.updated_at desc`;
}

// gedeelde helpers voor features en foto's
function featureList(p: Record<string, any>): string[] {
  const feats: string[] = [];
  if (p.year_built) feats.push(`built in ${p.year_built}`);
  if (p.orientation) feats.push(`facing ${String(p.orientation).toLowerCase()}`);
  if (p.object_style) feats.push(`${String(p.object_style).toLowerCase()} style`);
  for (const f of p.features ?? []) if (FEATURE_TEXT[f]) feats.push(FEATURE_TEXT[f]);
  if (p.bedrooms) feats.push(`${p.bedrooms} bedroom${p.bedrooms > 1 ? "s" : ""}`);
  if (p.bathrooms) feats.push(`${p.bathrooms} bathroom${p.bathrooms > 1 ? "s" : ""}`);
  if (p.living_rooms) feats.push(`${p.living_rooms} living`);
  if (p.kitchens) feats.push(`${p.kitchens} kitchen`);
  for (const f of [count(p.ensuites, "ensuite"), count(p.toilets, "toilet"), count(p.floors, "floor")]) if (f) feats.push(f);
  if (p.balconies) feats.push(p.balconies > 1 ? `${p.balconies} balconies` : "balcony");
  if (p.terraces) feats.push(p.terraces > 1 ? `${p.terraces} terraces` : "terrace");
  if (p.patios) feats.push(p.patios > 1 ? `${p.patios} patios` : "patio");
  if (p.garages) feats.push(p.garages > 1 ? `${p.garages} garages` : "garage");
  if (p.carports) feats.push(p.carports > 1 ? `${p.carports} carports` : "carport");
  for (const v of String(p.views ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)) feats.push(`${v} views`);
  for (const [group, list] of Object.entries((p.feature_options ?? {}) as Record<string, string[]>)) {
    const suffix = OPTION_SUFFIX[group];
    for (const v of Array.isArray(list) ? list : []) {
      if (!v) continue;
      const s = String(v).toLowerCase().trim();
      if (s === "community" && group !== "community") feats.push(`community ${group}`);
      else feats.push(suffix && !s.endsWith(suffix) ? `${s} ${suffix}` : s);
    }
  }
  return [...new Set(feats)];
}
function photoUrls(p: Record<string, any>): string[] {
  const seen = new Set<string>();
  return (p.photos as { s: string | null; l: string | null; u: string | null }[])
    .map((m) => (m.s ? STORAGE_PUBLIC + m.s.replace(/^\/+/, "") : m.l || m.u))
    .filter((u): u is string => !!u && !seen.has(u) && !!seen.add(u))
    .slice(0, MAX_IMAGES);
}
const fallbackDesc = (p: Record<string, any>) =>
  `${p.category ? p.category[0].toUpperCase() + p.category.slice(1) : "Property"} in ${p.city ?? ""}`.trim();

export async function buildFeed(sql: ReturnType<typeof postgres>, variant: FeedVariant, feedName?: string | null): Promise<{ xml: string; count: number }> {
  if (variant === "thinkspain") return buildThinkSpain(sql);
  const site = await siteBase(sql);
  const source = utmSource(variant, feedName);
  const rows = await loadRows(sql, variant);
  const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>\n<root>\n<kyero><feed_version>3</feed_version></kyero>'];
  for (const p of rows) {
    const uniqFeats = featureList(p);
    const photos = photoUrls(p);
    const hasPool = (p.features ?? []).some((f: string) => POOL_FEATURES.has(f));
    const descs = (p.descs ?? {}) as Record<string, string>;
    const descEn = plain(descs.en) || fallbackDesc(p);
    const descXml = LANGS.map((l) => (l === "en" ? tag("en", descEn) : descs[l] ? tag(l, plain(descs[l])) : "")).join("");
    const lat = coord(p.lat), lng = coord(p.lng);
    parts.push(
      "<property>" +
        tag("id", p.wp_id ?? p.reference) +
        tag("date", new Date(p.updated_at).toISOString().replace("T", " ").slice(0, 19)) +
        tag("ref", p.reference) +
        tag("price", p.price_hidden || p.price_on_request ? 0 : Math.round(Number(p.price ?? 0))) +
        tag("currency", "EUR") + tag("price_freq", "sale") +
        tag("new_build", p.build_type === "new_build" ? 1 : 0) +
        tag("type", p.category) + tag("town", p.city) + tag("province", p.province) + tag("country", p.country ?? "Spain") +
        tag("location_detail", p.location_area ?? p.suburb) +
        (lat && lng && variant === "idealista" ? `<location>${tag("latitude", lat)}${tag("longitude", lng)}</location>` : "") +
        (variant === "idealista"
          ? `<address>${tag("street", p.street)}${tag("street_number", p.street_number)}${tag("postal_code", p.postal_code)}${tag("hidden", p.hide_address ? 1 : 0)}</address>` +
            (!(lat && lng) && p.centroid?.lat != null
              ? `<location_approx>${tag("latitude", coord(p.centroid.lat))}${tag("longitude", coord(p.centroid.lng))}${tag("basis", p.centroid.basis)}</location_approx>`
              : "")
          : "") +
        tag("beds", p.bedrooms ?? 0) + tag("baths", p.bathrooms ?? 0) + tag("pool", hasPool ? 1 : 0) +
        `<surface_area>${tag("built", Math.round(Number(p.build_area ?? 0)))}${tag("plot", Math.round(Number(p.plot_area ?? 0)))}</surface_area>` +
        `<energy_rating>${tag("consumption", /^[A-G]$/i.test(p.energy_label ?? "") ? String(p.energy_label).toUpperCase() : "X")}${tag("emissions", "X")}</energy_rating>` +
        `<url>${LANGS.map((l) => tag(l, propUrl(site, p.reference, l, source))).join("")}</url>` +
        `<desc>${descXml}</desc>` +
        `<features>${uniqFeats.map((f) => tag("feature", f)).join("")}</features>` +
        tag("notes", NOTES) +
        `<images>${photos.map((u, i) => `<image id="${i + 1}">${tag("url", u)}</image>`).join("")}</images>` +
        "</property>",
    );
  }
  parts.push("</root>");
  return { xml: parts.join("\n"), count: rows.length };
}

// ---------- thinkSPAIN v1.16 ----------
const km = (m: unknown) => (m === null || m === undefined || Number(m) < 0 ? null : Math.round(Number(m) / 100) / 10);
const pos = (n: unknown) => (Number(n ?? 0) > 0 ? Math.round(Number(n)) : null);

async function buildThinkSpain(sql: ReturnType<typeof postgres>): Promise<{ xml: string; count: number }> {
  const site = await siteBase(sql);
  const all = await loadRows(sql, "thinkspain");
  // eerst bestaande bouw, dan nieuwbouw (beide al nieuwste eerst), max 25
  const rows = [...all.filter((p) => p.build_type !== "new_build"), ...all.filter((p) => p.build_type === "new_build")].slice(0, TS_MAX);
  const parts: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n<thinkspain><import_version>1.16</import_version></thinkspain>\n<agent><name>Grupo Soltura</name></agent>',
  ];
  for (const p of rows) {
    const url = propUrl(site, p.reference, "en", "thinkspain");
    const feats = featureList(p);
    const features = (p.features ?? []) as string[];
    if (features.includes("communal_pool") && !feats.includes("piscina comunitaria")) feats.push("piscina comunitaria");
    const photos = photoUrls(p);
    const descs = (p.descs ?? {}) as Record<string, string>;
    const descXml = TS_LANGS.map((l) => {
      const t = l === "en" ? (plain(descs.en) || fallbackDesc(p)) : plain(descs[l] ?? "");
      return t ? `<${l}>${esc(t)}</${l}>` : "";
    }).join("");
    // Rick 23-10: adres alleen mee met display_address=0 (verborgen). Kadaster en coordinaten nooit: daar heeft
    // thinkSPAIN geen verberg-vlag voor.
    const fullAddr = [[p.street, p.street_number].filter(Boolean).join(" "), [p.postal_code, p.city].filter(Boolean).join(" "), p.province]
      .map((x) => String(x ?? "").trim()).filter(Boolean).join(", ");
    const energy = /^[A-G]$/i.test(p.energy_label ?? "")
      ? `<energy_rating>${opt("consumption", String(p.energy_label).toUpperCase())}</energy_rating>`
      : "";
    const hasPool = features.some((f) => POOL_FEATURES.has(f));
    const hasAir = features.some((f) => /air_conditioning$|split_aircon|ducted_cooling/.test(f));
    const hasHeat = features.some((f) => /heating/.test(f));
    const hasGarage = Number(p.garages ?? 0) > 0 || features.includes("remote_garage");
    const cat = String(p.category ?? "").toLowerCase();
    parts.push(
      "<property>" +
        opt("last_amended_date", new Date(p.updated_at).toISOString().replace("T", " ").slice(0, 19)) +
        opt("unique_id", p.reference) +
        opt("agent_ref", p.reference) +
        opt("euro_price", p.price_hidden || p.price_on_request ? 0 : Math.round(Number(p.price ?? 0))) +
        opt("currency", "EUR") +
        opt("sale_type", "sale") +
        opt("property_type", TS_TYPE[cat] ?? (p.category ? p.category[0].toUpperCase() + p.category.slice(1) : "Villa")) +
        opt("new_build", p.build_type === "new_build" ? 1 : 0) +
        opt("year_built", p.year_built && Number(p.year_built) > 1000 ? p.year_built : null) +
        opt("street_name", p.street) +
        opt("street_number", p.street_number) +
        opt("town", p.city) +
        opt("location_detail", p.location_area ?? p.suburb) +
        opt("province", p.province ?? "Alicante") +
        opt("postcode", p.postal_code) +
        opt("full_address", p.street ? fullAddr : null) +
        opt("display_address", 0) +
        opt("url", url) +
        `<description>${descXml}</description>` +
        `<images>${photos.map((u, i) => `<photo id="${i + 1}">${opt("url", u)}</photo>`).join("")}</images>` +
        opt("bedrooms", pos(p.bedrooms)) +
        opt("bathrooms", pos(p.bathrooms)) +
        opt("toilets", pos(p.toilets)) +
        opt("living_area", pos(p.build_area)) +
        opt("plot_size", pos(p.plot_area)) +
        opt("pool", hasPool ? 1 : 0) +
        opt("aircon", hasAir ? 1 : 0) +
        opt("heating", hasHeat ? 1 : 0) +
        opt("garage", hasGarage ? 1 : 0) +
        opt("levels", pos(p.floors)) +
        (feats.length ? `<features>${feats.map((f) => opt("feature", f)).join("")}</features>` : "") +
        energy +
        opt("km_town", km(p.distance_city_m)) +
        opt("km_airport", km(p.distance_airport_m)) +
        opt("km_beach", km(p.distance_sea_m)) +
        "</property>",
    );
  }
  parts.push("</root>");
  return { xml: parts.join("\n"), count: rows.length };
}

const notFound = () => new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });

if (Deno.env.get("SUPABASE_URL")) {
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 2, prepare: false, onnotice: () => {} });
  const hit = async (feedId: string, req: Request, count: number | null, status: number) => {
    try {
      await sql`insert into core.partner_export_feed_hits (feed_id, user_agent, item_count, status)
                values (${feedId}, ${(req.headers.get("user-agent") ?? "").slice(0, 200)}, ${count}, ${status})`;
      if (Math.random() < 0.02) await sql`delete from core.partner_export_feed_hits where at < now() - interval '90 days'`;
    } catch (e) { console.error("partner-feed hit log", e); }
  };
  Deno.serve(async (req) => {
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("method not allowed", { status: 405 });
    const u = new URL(req.url);
    const segs = u.pathname.split("/").filter(Boolean);
    const token = u.searchParams.get("token") ?? segs[segs.length - 1] ?? "";
    if (!/^[a-zA-Z0-9]{8,64}$/.test(token)) return notFound();
    const [feed] = await sql`select id, name, variant, active from core.partner_export_feeds where token = ${token}`;
    if (!feed) return notFound();
    if (!feed.active) { await hit(feed.id, req, null, 404); return notFound(); }
    try {
      const { xml, count } = await buildFeed(sql, feed.variant as FeedVariant, feed.name);
      try {
        await sql`update core.partner_export_feeds
                     set last_accessed_at = now(), access_count = access_count + 1, last_item_count = ${count},
                         last_user_agent = ${(req.headers.get("user-agent") ?? "").slice(0, 200)}
                   where id = ${feed.id}`;
      } catch (e) { console.error("partner-feed access log", e); }
      await hit(feed.id, req, count, 200);
      return new Response(req.method === "HEAD" ? null : xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store", "X-Property-Count": String(count) },
      });
    } catch (e) {
      console.error("partner-feed", e);
      await hit(feed.id, req, null, 503);
      return new Response("feed temporarily unavailable", { status: 503 });
    }
  });
}
