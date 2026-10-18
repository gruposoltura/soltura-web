// town-photos: zoekt rechtenvrije foto's op Wikimedia Commons en zet ze in eigen Storage
// (property-media/towns/<slug>/...). Grupo Soltura linkt nooit naar foto's elders.
// Beveiliging: header x-town-key moet gelijk zijn aan public.fn_keys[name=town-photos] (alleen service_role leesbaar).
import { createClient } from "npm:@supabase/supabase-js@2";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "GrupoSolturaTownGuides/1.0 (https://gruposoltura.com; info@gruposoltura.com)";
const OK_LIC = /^(cc0|public domain|pd|cc[- ]by(-sa)?[- ]\d)/i;

const strip = (s = "") => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function commons(params: Record<string, string>) {
  const u = new URL(API);
  Object.entries({ format: "json", formatversion: "2", origin: "*", ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("commons " + r.status);
  return r.json();
}

function meta(p: any) {
  const ii = p?.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata || {};
  const lic = strip(m.LicenseShortName?.value || "");
  return {
    title: p.title, width: ii.width, height: ii.height, mime: ii.mime,
    thumb: ii.thumburl || ii.url, page_url: ii.descriptionurl,
    author: strip(m.Artist?.value || "").slice(0, 120), license: lic,
    license_url: m.LicenseUrl?.value || null, ok: OK_LIC.test(lic),
    desc: strip(m.ImageDescription?.value || "").slice(0, 200),
  };
}

const IIPROP = { prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1400" };

Deno.serve(async (req) => {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const k = await sb.from("fn_keys").select("value").eq("name", "town-photos").maybeSingle();
  const key = req.headers.get("x-town-key");
  if (!key || !k.data || key !== k.data.value) return new Response("forbidden", { status: 403 });
  const body = await req.json().catch(() => ({}));
  try {
    if (body.mode === "candidates" || body.mode === "search") {
      const q = body.mode === "candidates"
        ? { generator: "categorymembers", gcmtitle: body.category, gcmtype: "file", gcmlimit: String(body.limit || 50) }
        : { generator: "search", gsrsearch: body.q, gsrnamespace: "6", gsrlimit: String(body.limit || 30) };
      const j = await commons({ action: "query", ...q, ...IIPROP });
      const out = (j.query?.pages || []).map(meta).filter((x: any) => x && /jpe?g|png/.test(x.mime || ""));
      return Response.json({ ok: true, n: out.length, files: out });
    }
    if (body.mode === "fetch") {
      const res: any[] = [];
      for (const [i, title] of (body.titles as string[]).entries()) {
        const j = await commons({ action: "query", titles: title, ...IIPROP });
        const m = meta(j.query?.pages?.[0]);
        if (!m) { res.push({ title, error: "niet gevonden" }); continue; }
        if (!m.ok) { res.push({ title, error: "licentie " + m.license }); continue; }
        const img = await fetch(m.thumb, { headers: { "User-Agent": UA } });
        if (!img.ok) { res.push({ title, error: "download " + img.status }); continue; }
        const buf = new Uint8Array(await img.arrayBuffer());
        const ext = /png/.test(m.mime) ? "png" : "jpg";
        const path = `towns/${body.slug}/${i + 1}.${ext}`;
        const up = await sb.storage.from("property-media").upload(path, buf, { contentType: ext === "png" ? "image/png" : "image/jpeg", upsert: true });
        if (up.error) { res.push({ title, error: up.error.message }); continue; }
        res.push({ title, path, bytes: buf.length, author: m.author, license: m.license, license_url: m.license_url, page_url: m.page_url, width: m.width, height: m.height });
      }
      return Response.json({ ok: true, slug: body.slug, photos: res });
    }
    return Response.json({ ok: false, error: "mode?" }, { status: 400 });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
});
