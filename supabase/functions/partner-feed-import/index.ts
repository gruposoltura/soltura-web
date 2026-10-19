// @ts-nocheck — postgres.js-typen te streng voor dynamische kolommen; runtime getest.
// partner-feed-import — leest één Kyero-feed van een partnermakelaar en verwerkt die in core.properties.
// Vervangt de CPR "XML Imports" + Jarvis PropertyGuard (locatie/gemeente/woningtype).
// Aanroep (service-niveau): POST {"feed":"REDSP","dry_run":true|false,"offset":0,"limit":100}  (standaard dry_run)
// Regels per feed uit core.partner_feeds: build_filter, city_whitelist, city_blacklist, ref_exclude_prefix, withdraw_min_ratio.
// Foto's worden niet hier gedownload: nieuwe foto's krijgen een rij met source_url; media-sync haalt ze op.
//
// v3 (17-10-2026): streaming + paginering.
// v4 (18-10-2026, NEXUS menu XML): city_blacklist, runlog in core.partner_feed_runs, preview vanuit NEXUS.
// v5 (18-10-2026): zwembadtype en open parkeerplekken uit de feedkenmerken.
//  - <pool>1 zegt niet of het privé of gemeenschappelijk is; de kenmerken ("Private Pool", "Communal Pool", "Pool, communal" ...)
//    zijn leidend. features: 'pool' = privé, 'communal_pool' = gemeenschappelijk. Zonder type-kenmerk blijft <pool>1 privé.
//  - parking_spaces: "Number of Parking Spaces: N", anders 1 bij een open-parkeerkenmerk ("Parking - Space", "Off road parking" ...).
//  - bij een bestaande woning wordt het zwembadtype alleen bijgewerkt als de feed een type noemt; overige kenmerken blijven staan.
// v6 (19-10-2026, uniforme vertalingen): Engels is de brontaal; Nederlands en Zweeds komen van de vertaalagents
//  (JARVIS-Web-TranslateNL / -TranslateSV). Daarom:
//  - de feed schrijft en, es, de, fr; nl alleen als de feed geen Engelse tekst heeft (anders zou de vertaling elke nacht overschreven worden);
//  - een tekst wordt alleen overschreven als de feedtekst echt veranderd is (vingerafdruk in core.property_texts.feed_hash).
//    Zo blijft de Engelse tekst van Agent SEO staan en worden vertalingen niet elke nacht opnieuw gemaakt.
//  - eerste keer (feed_hash nog leeg bij een bestaande tekst): alleen de vingerafdruk opslaan, tekst en updated_at ongemoeid.
import postgres from "npm:postgres@3.4.5";

type Sql = ReturnType<typeof postgres>;
export type FeedItem = {
  id: string; date: string; ref: string; price: number | null; new_build: boolean; type: string; town: string;
  province: string; country: string; location_detail: string; lat: number | null; lng: number | null; beds: number | null;
  baths: number | null; pool: boolean; built: number | null; plot: number | null; energy: string; url: string;
  desc: Record<string, string>; features: string[]; images: string[];
};

export const norm = (t: string | null | undefined) =>
  (t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const TYPE_MAP: Record<string, string> = {
  "apartment": "apartment", "flat": "apartment", "ground floor apartment": "apartment", "penthouse": "penthouse",
  "town house": "townhouse", "townhouse": "townhouse", "terraced house": "townhouse", "quad house": "quadrant",
  "quad": "quadrant", "quadrant": "quadrant", "bungalow": "bungalow", "villa": "villa", "detached": "villa",
  "detached villa": "villa", "house": "villa", "semi detached": "semi-detached", "semi detached house": "semi-detached",
  "semi detached villa": "semi-detached", "duplex": "duplex", "finca": "finca", "country house": "finca", "estate": "finca",
  "studio": "studio", "country property": "finca", "rustic": "finca", "cave house": "other", "commercial": "commercial", "plot": "plot", "land": "plot", "attic": "penthouse",
};

/** Zwembadtype en open parkeerplekken uit de feedkenmerken. */
const RX_COMMUNAL = /(communal|community|shared)( swimming)? pool|pool,? communal|piscina comunitaria/;
const RX_PRIVATE = /private( swimming)? pool|pool,? private|piscina privada/;
const RX_PARK_N = /number of parking spaces: *(\d+)/;
const RX_PARK_OPEN = /(^|\| )(parking - space|off road parking|parking off-road|off-road parking|parking, uncovered|parking space|parking|communal parking|parking communal)( \||$)/;
export function featureDerive(it: FeedItem) {
  const f = it.features.map((x) => x.toLowerCase().trim()).join(" | ");
  const communal = RX_COMMUNAL.test(f), priv = RX_PRIVATE.test(f);
  const pools: string[] = [];
  if (priv || (it.pool && !communal)) pools.push("pool");
  if (communal) pools.push("communal_pool");
  const n = f.match(RX_PARK_N);
  const parking = n ? Math.min(99, Number(n[1])) : (RX_PARK_OPEN.test(f) ? 1 : null);
  return { pools, typed: communal || priv, parking };
}

// ---------- teksten: welke talen de feed schrijft, en een vingerafdruk per tekst (v6) ----------
const FEED_LANGS = ["en", "es", "de", "fr"]; // nl/sv: vertaalagents (Engels is de bron)
export function feedTextLangs(desc: Record<string, string>) {
  const langs = FEED_LANGS.filter((l) => desc[l]);
  if (!desc.en && desc.nl) langs.push("nl"); // geen Engels in de feed: dan de Nederlandse feedtekst
  return langs;
}
export async function textHash(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// ---------- lichte XML-verwerking ----------
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s: string) => s.indexOf("&") < 0 ? s : s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, e) => {
  if (e[0] === "#") { const c = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(c); } catch { return m; } }
  return ENT[e] ?? m;
});
/** Tekstinhoud van een stuk XML: CDATA letterlijk, de rest entity-gedecodeerd (zoals sax). */
const textOf = (raw: string) => {
  if (raw.indexOf("<![CDATA[") < 0) return decode(raw);
  let out = ""; let i = 0;
  while (i < raw.length) {
    const s = raw.indexOf("<![CDATA[", i);
    if (s < 0) { out += decode(raw.slice(i)); break; }
    out += decode(raw.slice(i, s));
    const e = raw.indexOf("]]>", s + 9);
    if (e < 0) { out += raw.slice(s + 9); break; }
    out += raw.slice(s + 9, e); i = e + 3;
  }
  return out;
};
const quickTag = (block: string, tag: string) => {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? textOf(m[1]).trim() : "";
};

const TOKEN = /<!\[CDATA\[([\s\S]*?)\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([A-Za-z_][\w.:-]*)[^>]*?(\/?)>/g;
const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return Number.isFinite(n) ? n : null; };

/** Ontleedt één <property>-blok (zelfde semantiek als de vroegere sax-parser: pad property/x, property/parent/x). */
export function parseProperty(block: string): FeedItem {
  const cur: FeedItem = { id: "", date: "", ref: "", price: null, new_build: false, type: "", town: "",
    province: "", country: "", location_detail: "", lat: null, lng: null, beds: null, baths: null, pool: false, built: null, plot: null,
    energy: "", url: "", desc: {}, features: [], images: [] };
  const path: string[] = [];
  let text = ""; let last = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(block))) {
    if (m.index > last) text += decode(block.slice(last, m.index));
    last = TOKEN.lastIndex;
    if (m[1] !== undefined) { text += m[1]; continue; }
    if (!m[3]) continue; // commentaar / processing instruction
    const name = m[3].toLowerCase();
    const closing = m[2] === "/", selfClosing = m[4] === "/";
    if (!closing) { path.push(name); text = ""; if (!selfClosing) continue; }
    const tag = path[path.length - 1];
    const parent = path[path.length - 2];
    const v = text.trim();
    const depth = path.length; // property = 1
    if (depth === 2) {
      switch (tag) {
        case "id": cur.id = v; break; case "date": cur.date = v; break; case "ref": cur.ref = v; break;
        case "price": cur.price = num(v); break; case "new_build": cur.new_build = v === "1"; break; case "type": cur.type = v; break;
        case "town": cur.town = v; break; case "province": cur.province = v; break; case "country": cur.country = v; break;
        case "location_detail": cur.location_detail = v; break; case "beds": cur.beds = num(v); break; case "baths": cur.baths = num(v); break;
        case "pool": cur.pool = v === "1"; break;
      }
    } else if (depth > 2) {
      if (parent === "location") { if (tag === "latitude") cur.lat = num(v); if (tag === "longitude") cur.lng = num(v); }
      else if (parent === "surface_area") { if (tag === "built") cur.built = num(v); if (tag === "plot") cur.plot = num(v); }
      else if (parent === "energy_rating" && tag === "consumption") cur.energy = v.toUpperCase();
      else if (parent === "url" && tag === "en") cur.url = v;
      else if (parent === "desc" && v) cur.desc[tag] = v.replace(/&#13;|\r/g, "\n");
      else if (parent === "features" && tag === "feature" && v) cur.features.push(v);
      else if (parent === "image" && tag === "url" && v) cur.images.push(v);
    }
    path.pop(); text = "";
  }
  return cur;
}

export type FeedRules = { build_filter: string | null; city_whitelist: string[] | null; city_blacklist?: string[] | null; ref_exclude_prefix: string | null };
export type Parsed = { in_feed: number; skipped_build: number; skipped_city: number; skipped_excluded: number; skipped_ref: number;
  items: FeedItem[]; towns: Map<string, { name: string; n: number; status: string }> };

/** Streamt Kyero-XML, knipt per <property> en houdt alleen woningen vast die door build/plaats/ref-filters komen. */
export async function parseKyero(stream: ReadableStream<Uint8Array>, rules: FeedRules): Promise<Parsed> {
  const whitelist = new Set<string>((rules.city_whitelist ?? []).map((c) => norm(c)).filter(Boolean));
  const blacklist = new Set<string>((rules.city_blacklist ?? []).map((c) => norm(c)).filter(Boolean));
  const out: Parsed = { in_feed: 0, skipped_build: 0, skipped_city: 0, skipped_excluded: 0, skipped_ref: 0, items: [], towns: new Map() };
  const seeTown = (town: string, status: string) => {
    const k = norm(town) || "?";
    const t = out.towns.get(k) ?? { name: town || "?", n: 0, status };
    t.n++; if (t.status !== "accepted" && status === "accepted") t.status = status;
    out.towns.set(k, t);
  };
  const OPEN = /<property[\s>]/g;
  const handle = (block: string) => {
    const ref = quickTag(block, "ref");
    if (!ref) return;
    out.in_feed++;
    const nb = quickTag(block, "new_build") === "1";
    const town = quickTag(block, "town");
    if (rules.build_filter === "RESALES" && nb) { out.skipped_build++; seeTown(town, "build"); return; }
    if (rules.build_filter === "NEWDEV" && !nb) { out.skipped_build++; seeTown(town, "build"); return; }
    if (whitelist.size && !whitelist.has(norm(town))) { out.skipped_city++; seeTown(town, "not_whitelisted"); return; }
    if (blacklist.size && (blacklist.has(norm(town)) || blacklist.has(norm(quickTag(block, "location_detail"))))) {
      out.skipped_excluded++; seeTown(town, "excluded"); return;
    }
    if (rules.ref_exclude_prefix && ref.startsWith(rules.ref_exclude_prefix)) { out.skipped_ref++; seeTown(town, "ref"); return; }
    seeTown(town, "accepted");
    const it = parseProperty(block);
    if (it.ref) out.items.push(it);
  };
  let buf = "";
  const reader = stream.pipeThrough(new TextDecoderStream() as unknown as TransformStream<Uint8Array, string>).getReader();
  const drain = (final: boolean) => {
    let pos = 0;
    while (true) {
      OPEN.lastIndex = pos;
      const o = OPEN.exec(buf);
      if (!o) { pos = final ? buf.length : Math.max(pos, buf.length - 16); break; }
      const c = buf.indexOf("</property>", o.index);
      if (c < 0) { pos = o.index; break; }
      handle(buf.slice(o.index, c + 11));
      pos = c + 11;
    }
    buf = buf.slice(pos);
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += value;
    if (buf.length > 65536) drain(false);
  }
  drain(true);
  return out;
}

export type Report = Record<string, unknown>;

export async function runFeedImport(sql: Sql, code: string, parsed: Parsed, dryRun: boolean, offset = 0, limit = 100): Promise<Report> {
  const all = parsed.items;
  const page = all.slice(offset, offset + limit);
  const isLast = offset + limit >= all.length;
  const report: Report = { feed: code, dry_run: dryRun, in_feed: parsed.in_feed, offset, limit, page_items: page.length,
    next_offset: isLast ? null : offset + limit };
  const run = async (tx: Sql) => {
    const [feed] = await tx`select * from core.partner_feeds where code = ${code} for update`;
    if (!feed) throw new Error(`onbekende feed ${code}`);
    const rules = new Map<string, { action: string; target: string | null }>();
    for (const r of await tx`select type, action, target from core.property_type_rules`) rules.set(r.type, r);
    const aliases = new Map<string, number>();
    for (const a of await tx`select alias, location_id from core.location_aliases`) aliases.set(a.alias, a.location_id);
    const locs = new Map<number, { name: string; parent_id: number | null }>();
    for (const l of await tx`select id, name, parent_id from core.locations`) locs.set(l.id, l);
    const resolveLoc = (town: string, detail: string) => {
      const t = norm(town), d = norm(detail);
      const townId = aliases.get(`${t}|`) ?? aliases.get(`${t.replace(/ (town|village|country|city)$/, "")}|`);
      const root = (id?: number) => { let x = id; let g = 0; while (x && locs.get(x)?.parent_id && g++ < 5) x = locs.get(x)!.parent_id!; return x; };
      const muni = root(townId);
      const munName = muni ? norm(locs.get(muni)!.name) : "";
      const areaId = (d && muni ? aliases.get(`${d}|${munName}`) : undefined) ?? (townId && locs.get(townId)?.parent_id ? townId : undefined);
      return { location_id: areaId ?? muni ?? null, city: muni ? locs.get(muni)!.name : town || null, area: areaId ? locs.get(areaId)!.name : (detail || null) };
    };
    let skippedType = 0;
    const accepted: (FeedItem & { category: string })[] = [];
    for (const it of page) {
      let cat = TYPE_MAP[norm(it.type)] ?? (norm(it.type) || "other");
      const rule = rules.get(cat);
      if (rule?.action === "merge" && rule.target) cat = rule.target;
      if (rule?.action === "block") skippedType++;   // CPR importeert deze wel (bijv. commercial); alleen tellen
      accepted.push({ ...it, category: cat });
    }
    Object.assign(report, { skipped_build_type: parsed.skipped_build, skipped_city: parsed.skipped_city, skipped_excluded: parsed.skipped_excluded,
      skipped_ref: parsed.skipped_ref, blocked_type_imported: skippedType, accepted: all.length });

    const existing = new Map<string, Record<string, unknown>>();
    for (const p of await tx`select id, external_ref, status, price from core.properties where partner_feed_id = ${feed.id}`) existing.set(p.external_ref as string, p);
    const pagePids = accepted.map((it) => existing.get(it.ref)?.id as string | undefined).filter(Boolean) as string[];
    const mediaByProp = new Map<string, Set<string>>();
    if (pagePids.length) {
      for (const m of await tx`select property_id, source_url from core.property_media where property_id in ${tx(pagePids)} and source_url is not null`) {
        const k = m.property_id as string; if (!mediaByProp.has(k)) mediaByProp.set(k, new Set());
        mediaByProp.get(k)!.add(m.source_url as string);
      }
    }
    let nextRef = feed.next_ref_number as number;
    let inserted = 0, updated = 0, reactivated = 0, priceChanges = 0, newMedia = 0, removedMedia = 0, textsChanged = 0;
    for (const it of accepted) {
      const loc = resolveLoc(it.town, it.location_detail);
      const der = featureDerive(it);
      const features: string[] = [...der.pools];
      const fields: Record<string, unknown> = {
        category: it.category, build_type: it.new_build ? "new_build" : "resale", price: it.price, bedrooms: it.beds, bathrooms: it.baths,
        build_area: it.built, plot_area: it.plot, energy_label: /^[A-G]$/.test(it.energy) ? it.energy : null,
        country: it.country || "Spain", province: it.province || null, city: loc.city, location_area: loc.area, location_id: loc.location_id,
        lat: it.lat, lng: it.lng, external_id: it.id, external_url: it.url || null,
        external_updated_at: it.date ? new Date(it.date.replace(" ", "T") + "Z") : null,
        feature_options: { feed: it.features.slice(0, 80) },
      };
      if (der.parking != null) fields.parking_spaces = der.parking;
      const ex = existing.get(it.ref);
      let pid: string;
      if (!ex) {
        const reference = `${feed.ref_prefix}${nextRef++}`;
        const [row] = await tx`insert into core.properties ${tx({ ...fields, reference, origin: "partner", status: "available", published: true,
          agency_contact_id: feed.agency_contact_id, listing_agent_id: feed.responsible_id, partner_feed_id: feed.id, external_ref: it.ref,
          listed_at: new Date(), features }, ...Object.keys(fields), "reference", "origin", "status", "published", "agency_contact_id", "listing_agent_id",
          "partner_feed_id", "external_ref", "listed_at", "features")} returning id`;
        pid = row.id; inserted++;
        existing.set(it.ref, { id: pid, external_ref: it.ref, status: "available", price: it.price });
        if (it.price) await tx`insert into core.property_price_history (property_id, price, source) values (${pid}, ${it.price}, ${"feed:" + code})`;
      } else {
        pid = ex.id as string;
        const wasOff = ["withdrawn", "off_market"].includes(ex.status as string);
        const priceChanged = it.price != null && Number(ex.price) !== Number(it.price);
        await tx`update core.properties set ${tx(fields, ...Object.keys(fields))},
                   status = case when status in ('withdrawn','off_market') then 'available' else status end,
                   published = case when status in ('withdrawn','off_market','available') then true else published end,
                   withdrawn_at = null,
                   price_previous = case when ${priceChanged} then price else price_previous end,
                   price_changed_at = case when ${priceChanged} then now() else price_changed_at end
                 where id = ${pid}`;
        if (der.typed) {
          await tx`update core.properties set features = array(select distinct e from unnest(
                     array_remove(array_remove(coalesce(features, '{}'::text[]), 'pool'), 'communal_pool') || ${tx.array(der.pools)}::text[]) e)
                   where id = ${pid}`;
        }
        if (priceChanged) { priceChanges++; await tx`insert into core.property_price_history (property_id, price, source) values (${pid}, ${it.price}, ${"feed:" + code})`; }
        if (wasOff) { reactivated++; await tx`update core.property_media set delete_after = null where property_id = ${pid}`; }
        updated++;
      }
      // v6: alleen bij een echt gewijzigde feedtekst overschrijven (zie kop)
      const texts = await Promise.all(feedTextLangs(it.desc).map(async (l) => ({ property_id: pid, lang: l, description: it.desc[l], feed_hash: await textHash(it.desc[l]) })));
      if (texts.length) {
        const r = await tx`insert into core.property_texts ${tx(texts, "property_id", "lang", "description", "feed_hash")}
                 on conflict (property_id, lang) do update set
                   description = case when core.property_texts.feed_hash is null and nullif(btrim(core.property_texts.description), '') is not null
                                      then core.property_texts.description else excluded.description end,
                   updated_at  = case when core.property_texts.feed_hash is null and nullif(btrim(core.property_texts.description), '') is not null
                                      then core.property_texts.updated_at else now() end,
                   feed_hash   = excluded.feed_hash
                 where core.property_texts.feed_hash is distinct from excluded.feed_hash`;
        textsChanged += r.count;
      }
      const have = mediaByProp.get(pid) ?? new Set<string>();
      const want = it.images.slice(0, 60);
      if (have.size === 0 && want.length) {
        const r = await tx`update core.property_media set delete_after = current_date where property_id = ${pid} and source_url is null and delete_after is null`;
        removedMedia += r.count;
      }
      const keepSort = new Map<string, number>();
      const ins: { property_id: string; kind: string; sort: number; is_main: boolean; source_url: string }[] = [];
      for (let i = 0; i < want.length; i++) {
        if (have.has(want[i])) keepSort.set(want[i], i);
        else ins.push({ property_id: pid, kind: "photo", sort: i, is_main: i === 0, source_url: want[i] });
      }
      if (keepSort.size) {
        await tx`update core.property_media m set sort = v.sort, is_main = (v.sort = 0)
                 from unnest(${tx.array([...keepSort.keys()])}::text[], ${tx.array([...keepSort.values()])}::int[]) as v(url, sort)
                 where m.property_id = ${pid} and m.source_url = v.url`;
      }
      if (ins.length) {
        await tx`insert into core.property_media ${tx(ins, "property_id", "kind", "sort", "is_main", "source_url")}`;
        newMedia += ins.length;
      }
      const gone = [...have].filter((u) => !want.includes(u));
      if (gone.length) {
        const r = await tx`update core.property_media set delete_after = current_date where property_id = ${pid} and source_url in ${tx(gone)}`;
        removedMedia += r.count;
      }
    }
    Object.assign(report, { inserted, updated, reactivated, price_changes: priceChanges, new_media: newMedia, removed_media: removedMedia, texts_changed: textsChanged });
    if (!isLast) {
      await tx`update core.partner_feeds set next_ref_number = ${nextRef} where id = ${feed.id}`;
      Object.assign(report, { withdrawn: 0, would_withdraw: 0 });
    } else {
      const seenRefs = new Set<string>(all.map((it) => it.ref));
      const prev = (feed.last_item_count as number | null) ?? 0;
      const tooSmall = prev > 0 && all.length < prev * Number(feed.withdraw_min_ratio);
      let withdrawn = 0;
      const missing = [...existing.entries()].filter(([ref, p]) => !seenRefs.has(ref) && ["available", "under_offer", "draft"].includes(p.status as string));
      if (tooSmall) report.withdraw_guard = `feed levert ${all.length} tegen ${prev} vorige run; niets ingetrokken`;
      else if (missing.length) {
        const ids = missing.map(([, p]) => p.id as string);
        await tx`update core.properties set status = 'withdrawn', published = false, withdrawn_at = now() where id in ${tx(ids)}`;
        await tx`update core.property_media set delete_after = current_date + interval '2 years' where property_id in ${tx(ids)}`;
        withdrawn = ids.length;
      }
      await tx`update core.partner_feeds set next_ref_number = ${nextRef}, last_run_at = now(),
                 last_item_count = ${tooSmall ? prev : all.length} where id = ${feed.id}`;
      Object.assign(report, { withdrawn, would_withdraw: missing.length });
    }
    if (dryRun) throw new DryRunDone();
  };
  try { await sql.begin(run); } catch (e) { if (!(e instanceof DryRunDone)) throw e; }
  return report;
}
class DryRunDone extends Error {}

/** Voorvertoning (NEXUS-testknop): niets schrijven; tellingen + wat er nieuw zou komen en wat zou worden ingetrokken. */
export async function previewFeed(sql: Sql, code: string, parsed: Parsed, feedId: string | null, lastCount: number | null, ratio: number) {
  const existing = new Map<string, string>();
  if (feedId) for (const p of await sql`select external_ref, status from core.properties where partner_feed_id = ${feedId}`) existing.set(p.external_ref as string, p.status as string);
  const seen = new Set(parsed.items.map((i) => i.ref));
  const isNew = parsed.items.filter((i) => !existing.has(i.ref)).length;
  const missing = [...existing.entries()].filter(([ref, st]) => !seen.has(ref) && ["available", "under_offer", "draft"].includes(st)).length;
  const prev = lastCount ?? 0;
  const tooSmall = prev > 0 && parsed.items.length < prev * ratio;
  const towns = [...parsed.towns.values()].sort((a, b) => b.n - a.n).slice(0, 150);
  return { feed: code, preview: true, in_feed: parsed.in_feed, skipped_build_type: parsed.skipped_build, skipped_city: parsed.skipped_city,
    skipped_excluded: parsed.skipped_excluded, skipped_ref: parsed.skipped_ref, accepted: parsed.items.length, new: isNew,
    existing: parsed.items.length - isNew, would_withdraw: tooSmall ? 0 : missing,
    withdraw_guard: tooSmall ? `feed levert ${parsed.items.length} tegen ${prev} vorige run; er zou niets worden ingetrokken` : null, towns };
}

// Toegang: service-niveau (n8n), of een NEXUS-beheerder (alleen voorvertoning). De gateway (verify_jwt) heeft de JWT al gecontroleerd.
const claims = (tok: string) => {
  if (tok.split(".").length !== 3) return null;
  try { return JSON.parse(atob(tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); } catch { return null; }
};
async function isServiceRole(req: Request): Promise<boolean> {
  const tok = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "") || (req.headers.get("apikey") ?? "");
  if (!tok) return false;
  if (tok === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;
  const c = claims(tok);
  if (c) return c.role === "service_role";
  if (!tok.startsWith("sb_secret_")) return false;
  const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/storage/v1/bucket/nexus-migration`, { headers: { apikey: tok, Authorization: `Bearer ${tok}` } });
  await r.body?.cancel();
  return r.ok;
}
async function nexusAdminEmail(req: Request, sql: Sql): Promise<string | null> {
  const tok = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const c = claims(tok);
  if (!c || c.role !== "authenticated" || !c.email) return null;
  const [r] = await sql`select 1 as ok from public.nexus_team where active and role = 'admin' and lower(email) = lower(${String(c.email)})`;
  return r ? String(c.email) : null;
}

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function logRun(sql: Sql, code: string, dry: boolean, source: string, ok: boolean, report: unknown, error: string | null) {
  try {
    const [f] = await sql`select id from core.partner_feeds where code = ${code}`;
    if (!f) return;
    await sql`insert into core.partner_feed_runs (feed_id, dry_run, source, ok, report, error)
              values (${f.id}, ${dry}, ${source}, ${ok}, ${report ? sql.json(report) : null}, ${error ? error.slice(0, 2000) : null})`;
    if (!dry) await sql`update core.partner_feeds set last_error = ${ok ? null : (error ?? "").slice(0, 2000)},
                          last_error_at = case when ${ok} then last_error_at else now() end where id = ${f.id}`;
    if (Math.random() < 0.05) await sql`delete from core.partner_feed_runs where at < now() - interval '180 days'`;
  } catch (e) { console.error("partner-feed-import runlog", e); }
}

if (globalThis.Deno?.env.get("SUPABASE_URL")) {
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1, prepare: false, onnotice: () => {} });
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    let code = ""; let dry = true; let source = "schedule"; let offset = 0;
    try {
      const service = await isServiceRole(req);
      const admin = service ? null : await nexusAdminEmail(req, sql);
      if (!service && !admin) return json({ ok: false, error: "forbidden" }, 403);
      const body = await req.json().catch(() => ({}));
      code = String(body.feed ?? "");
      offset = Math.max(0, Math.floor(Number(body.offset) || 0));
      const limit = Math.min(500, Math.max(1, Math.floor(Number(body.limit) || 100)));
      const preview = !service || body.preview === true;
      dry = preview || body.dry_run !== false;
      source = String(body.source ?? "schedule");
      const [feed] = await sql`select id, url, active, build_filter, city_whitelist, city_blacklist, ref_exclude_prefix, last_item_count, withdraw_min_ratio
                                 from core.partner_feeds where code = ${code}`;
      // NEXUS-voorvertoning mag onbewaarde regels/URL meesturen om ze eerst uit te proberen
      const o = preview && body.rules && typeof body.rules === "object" ? body.rules : {};
      const url = String(o.url ?? feed?.url ?? "");
      if (!/^https?:\/\/\S+$/i.test(url)) return json({ ok: false, feed: code, error: `feed ${code} onbekend of zonder url` }, 400);
      const rules: FeedRules = {
        build_filter: "build_filter" in o ? (o.build_filter || null) : feed?.build_filter ?? null,
        city_whitelist: "city_whitelist" in o ? o.city_whitelist : feed?.city_whitelist ?? null,
        city_blacklist: "city_blacklist" in o ? o.city_blacklist : feed?.city_blacklist ?? null,
        ref_exclude_prefix: "ref_exclude_prefix" in o ? (o.ref_exclude_prefix || null) : feed?.ref_exclude_prefix ?? null,
      };
      const res = await fetch(url, { headers: { "User-Agent": "GrupoSoltura-NEXUS/1.0" } });
      if (!res.ok || !res.body) {
        const err = `feed ${code}: HTTP ${res.status}`;
        if (!preview) await logRun(sql, code, dry, source, false, null, err);
        return json({ ok: false, feed: code, error: err }, 502);
      }
      const parsed = await parseKyero(res.body, rules);
      if (preview) {
        const report = await previewFeed(sql, code, parsed, feed?.id ?? null, feed?.last_item_count ?? null, Number(feed?.withdraw_min_ratio ?? 0.7));
        if (feed) await logRun(sql, code, true, "nexus", true, { ...report, towns: undefined, by: admin ?? "service" }, null);
        return json({ ok: true, feed: code, report });
      }
      const report = await runFeedImport(sql, code, parsed, dry, offset, limit);
      if (report.next_offset == null) await logRun(sql, code, dry, source, true, report, null);
      return json({ ok: true, feed: code, next_offset: report.next_offset, report });
    } catch (err) {
      if (code) await logRun(sql, code, dry, source, false, { offset }, String(err));
      return json({ ok: false, feed: code, error: String(err) }, 500);
    }
  });
}
