// SOLTURA WEBSITE - nieuwsberichten verrijken voor de site:
// 1) og:image (thumbnail) ophalen voor berichten die nog niet gecontroleerd zijn (max 40 per aanroep)
// 2) koppen vertalen naar Engels en Nederlands met Claude (max 60 per aanroep), plus de taal van het artikel
// Idempotent en begrensd; de nieuwspagina roept dit aan zodra er berichten zonder foto of vertaling zijn.
import { createClient } from 'jsr:@supabase/supabase-js@2';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' };
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const MODEL = 'claude-haiku-5-5';
const CRED_ID = '90d3279d-1a62-46f2-ab4a-099c79732f14';
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&').replace(/&quot;/g, '"').trim();
function findImage(html: string, base: string): string | null {
  const pats = [
    /<meta[^>]+(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image(?::src)?)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
  ];
  for (const p of pats) {
    const m = html.match(p);
    if (m && m[1]) { try { const u = new URL(decode(m[1]), base); if (u.protocol === 'https:' || u.protocol === 'http:') return u.href.replace(/^http:/, 'https:'); } catch { /* ongeldig */ } }
  }
  return null;
}
async function grab(url: string): Promise<string | null> {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 7000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; SolturaBot/1.0; +https://gruposoltura.com)', accept: 'text/html' } });
    if (!r.ok || !r.body) return null;
    const reader = r.body.getReader(); const dec = new TextDecoder(); let html = '';
    while (html.length < 250000) { const { done, value } = await reader.read(); if (done) break; html += dec.decode(value, { stream: true }); if (/<\/head>/i.test(html)) break; }
    reader.cancel().catch(() => {});
    return findImage(html, r.url || url);
  } catch { return null; } finally { clearTimeout(to); }
}
async function apiKey() {
  const env = Deno.env.get('ANTHROPIC_API_KEY'); if (env) return env;
  const { data } = await sb.from('credentials').select('secret_value').eq('id', CRED_ID).single();
  return data?.secret_value as string;
}
async function translate(items: { id: number; title: string }[]) {
  const system = `You translate news headlines for the website of Grupo Soltura, a real estate agency on the Costa Blanca. For each headline return the language of the original (ISO code: es, nl, en, ...) and a natural, concise headline in British English and in Dutch (informal, natural Dutch, no literal translation). Keep names, places and numbers exact; write amounts as in the original. If the original is already in that language, return it unchanged, except: Dutch must always address the reader informally (je/jij/jouw), never formally (u/uw), so rewrite any 'u'/'uw' to 'je'/'jouw'. Answer ONLY with a JSON array: [{"id":number,"lang":"es","en":"...","nl":"..."}].`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': await apiKey(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 6000, system, messages: [{ role: 'user', content: JSON.stringify(items) }] }),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status);
  const j = await r.json();
  const txt = (j.content || []).map((c: any) => c.text || '').join('');
  const a = txt.indexOf('['), b = txt.lastIndexOf(']');
  return JSON.parse(txt.slice(a, b + 1)) as { id: number; lang: string; en: string; nl: string }[];
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const since = new Date(Date.now() - 120 * 864e5).toISOString();
  const { data: posts } = await sb.from('news_posts').select('id,title,source_url').gt('posted_at', since).order('posted_at', { ascending: false }).limit(1000);
  const { data: media } = await sb.from('web_news_media').select('news_id,title_en');
  const seen = new Map((media || []).map((d: any) => [d.news_id, d]));
  // 1) thumbnails
  const todo = (posts || []).filter((p: any) => !seen.has(p.id) && p.source_url).slice(0, 40);
  let found = 0;
  for (let i = 0; i < todo.length; i += 8) {
    const res = await Promise.all(todo.slice(i, i + 8).map(async (p: any) => ({ news_id: p.id, image_url: await grab(p.source_url), checked_at: new Date().toISOString() })));
    found += res.filter((r) => r.image_url).length;
    await sb.from('web_news_media').upsert(res);
    res.forEach((r) => seen.set(r.news_id, { news_id: r.news_id, title_en: null }));
  }
  // 2) vertalingen (alleen voor berichten die al een rij hebben)
  const tr = (posts || []).filter((p: any) => seen.has(p.id) && !seen.get(p.id).title_en && p.title).slice(0, 60);
  let translated = 0, err = '';
  for (let i = 0; i < tr.length; i += 30) {
    try {
      const out = await translate(tr.slice(i, i + 30).map((p: any) => ({ id: p.id, title: p.title })));
      for (const o of out) {
        if (!o || !o.id || !o.en || !o.nl) continue;
        await sb.from('web_news_media').update({ title_en: String(o.en).slice(0, 300), title_nl: String(o.nl).slice(0, 300), lang: String(o.lang || '').slice(0, 5) }).eq('news_id', o.id);
        translated++;
      }
    } catch (e) { err = String(e).slice(0, 120); }
  }
  const left = (posts || []).filter((p: any) => !seen.has(p.id) || !seen.get(p.id).title_en).length - translated;
  return new Response(JSON.stringify({ ok: true, checked: todo.length, found, translated, remaining: Math.max(0, left), err }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
});
