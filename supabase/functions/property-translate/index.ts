// SOLTURA - woningteksten vertalen vanuit het Engels (brontaal) naar Nederlands of Zweeds. Sinds 19-10-2026.
// Vervangt property-translate-sv: één functie voor alle vertaalde talen, zodat NL en SV hetzelfde werken (besluit Rick 19-10-2026).
// Aangeroepen door n8n JARVIS-Web-TranslateNL en JARVIS-Web-TranslateSV met header x-fn-key = public.fn_keys[name=property-translate].
// POST {lang: 'nl'|'sv', limit?: number (max 12), dry_run?: boolean} -> {ok, lang, done, failed, remaining, items}
// Wachtrij: public.nexus2_tr_queue(lang) = gepubliceerd + beschikbaar/onder bod/gereserveerd, vertaling ontbreekt of is ouder dan de Engelse tekst;
// na 3 mislukte pogingen overgeslagen tot de Engelse tekst verandert (public.translate_fail). Opslaan: public.nexus2_tr_save.
// Alleen voor de website: uitgaande communicatie blijft Engels.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const MODEL = 'claude-sonnet-5-5';
const CRED_ID = '90d3279d-1a62-46f2-ab4a-099c79732f14';
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
let KEY: string | null = null;
async function apiKey() {
  if (KEY) return KEY;
  const env = Deno.env.get('ANTHROPIC_API_KEY');
  if (env) return (KEY = env);
  const { data, error } = await sb.from('credentials').select('secret_value').eq('id', CRED_ID).single();
  if (error || !data) throw new Error('no anthropic key');
  return (KEY = data.secret_value as string);
}

const LANG: Record<string, { name: string; style: string; numbers: string }> = {
  nl: {
    name: 'Dutch',
    style: 'Natural, fluent, warm Dutch as a Dutch property copywriter would write it. Always informal: address the reader with "je/jij", never "u". Never a word-for-word translation.',
    numbers: 'Dutch number style: dot as thousands separator, comma as decimal separator, euro sign before the amount ("€ 120.000", "3,5 km").',
  },
  sv: {
    name: 'Swedish',
    style: 'Natural, fluent, warm Swedish as a Swedish property copywriter would write it. Address the reader with "du" where the English addresses the reader. Never a word-for-word translation.',
    numbers: 'Swedish number style: space as thousands separator, comma as decimal separator ("120 000 €", "3,5 km").',
  },
};
const system = (l: string) => `You translate property listings of Grupo Soltura, a real estate agency on the southern Costa Blanca (Spain), from English into ${LANG[l].name} for the ${LANG[l].name} version of the agency's website.
Rules:
- ${LANG[l].style}
- Faithful: translate everything, add nothing, leave nothing out, invent no facts. Keep all numbers, prices, measurements and the property reference exactly.
- Keep place names, urbanisation names, street names and Spanish terms that have no ${LANG[l].name} equivalent (e.g. "naya", "solarium", "IBI", "NIE") as they are.
- ${LANG[l].numbers}
- The description may contain HTML. Keep every HTML tag and attribute exactly as it is and in the same order; translate only the text between tags. If it is plain text with line breaks, keep the line breaks.
- If a field is empty, return an empty string for it.
Always answer by calling the respond tool exactly once, with all four fields. No other text.`;
const SCHEMA = { type: 'object', properties: { heading: { type: 'string' }, description: { type: 'string' }, seo_title: { type: 'string' }, seo_description: { type: 'string' } }, required: ['heading', 'description', 'seo_title', 'seo_description'] };

async function translate(row: any, l: string) {
  const input = { heading: row.heading || '', description: row.description || '', seo_title: row.seo_title || '', seo_description: row.seo_description || '' };
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': await apiKey(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 8000, system: system(l),
      tools: [{ name: 'respond', description: `Return the ${LANG[l].name} translation of every field.`, input_schema: SCHEMA }],
      tool_choice: { type: 'auto' }, // geforceerde tool_choice wordt door dit model niet ondersteund
      messages: [{ role: 'user', content: `Property reference ${row.reference}. Translate these fields into ${LANG[l].name}:\n${JSON.stringify(input)}` }] }),
    signal: AbortSignal.timeout(140_000),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  if (j.stop_reason === 'max_tokens') throw new Error('truncated');
  const tu = (j.content || []).find((c: any) => c.type === 'tool_use');
  let out: any = tu ? tu.input || {} : null;
  if (!out) {
    const txt = (j.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
    try { out = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1)); } catch { throw new Error('no tool_use'); }
  }
  // controle: omschrijving niet leeg, zelfde aantal HTML-tags, lengte plausibel
  const tags = (s: string) => (String(s || '').match(/<[a-z\/][^>]*>/gi) || []).length;
  if (input.description && !String(out.description || '').trim()) throw new Error('empty description');
  if (tags(input.description) !== tags(out.description)) throw new Error(`html tags ${tags(input.description)} -> ${tags(out.description)}`);
  const ratio = String(out.description || '').length / Math.max(1, input.description.length);
  if (input.description.length > 200 && (ratio < 0.6 || ratio > 1.7)) throw new Error('length ratio ' + ratio.toFixed(2));
  return out;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const k = await sb.from('fn_keys').select('value').eq('name', 'property-translate').maybeSingle();
  if (!k.data || req.headers.get('x-fn-key') !== k.data.value) return json({ error: 'forbidden' }, 403);
  let b: any = {};
  try { b = await req.json(); } catch { b = {}; }
  const l = String(b.lang || '').toLowerCase();
  if (!LANG[l]) return json({ ok: false, error: 'lang must be nl or sv' }, 400);
  const limit = Math.max(1, Math.min(Number(b.limit) || 8, 12));
  const dry = b.dry_run === true;
  const { data: rows, error } = await sb.rpc('nexus2_tr_queue', { p_lang: l, p_limit: limit });
  if (error) return json({ ok: false, lang: l, error: error.message }, 500);
  const items: any[] = [];
  await Promise.all((rows || []).map(async (row: any) => {
    try {
      let t: any;
      try { t = await translate(row, l); } catch { t = await translate(row, l); } // 1x opnieuw
      if (!dry) {
        const { error: e } = await sb.rpc('nexus2_tr_save', { p_lang: l, p_property: row.property_id, p_heading: t.heading, p_description: t.description, p_seo_title: t.seo_title, p_seo_description: t.seo_description });
        if (e) throw new Error('save ' + e.message);
      }
      items.push({ reference: row.reference, ok: true, ...(dry ? { sample: String(t.heading || '').slice(0, 120) } : {}) });
    } catch (e) {
      const msg = String((e as Error)?.message || e).slice(0, 200);
      if (!dry) await sb.rpc('nexus2_tr_fail', { p_lang: l, p_property: row.property_id, p_error: msg });
      items.push({ reference: row.reference, ok: false, error: msg });
    }
  }));
  const { data: remaining } = await sb.rpc('nexus2_tr_queue_count', { p_lang: l });
  const done = items.filter((i) => i.ok).length;
  return json({ ok: true, lang: l, dry_run: dry, done, failed: items.length - done, remaining, items });
});
