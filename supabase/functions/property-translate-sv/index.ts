// SOLTURA - Zweedse woningteksten voor de Zweedse website (/sv/), sinds 19-10-2026.
// Vertaalt de Engelse tekst (core.property_texts lang 'en') naar het Zweeds en slaat die op als lang 'sv'.
// Wachtrij: public.nexus2_sv_queue (gepubliceerd, beschikbaar/onder bod/gereserveerd; ontbrekend of ouder dan de Engelse tekst;
// eigen woningen en beschikbare eerst). Opslaan: public.nexus2_sv_save.
// Aangeroepen door n8n JARVIS-Web-TranslateSV (elke 15 min) met header x-fn-key = public.fn_keys[name=property-translate-sv].
// POST {limit?: number (max 12), dry_run?: boolean} -> {ok, done, failed, remaining, items}
// Alleen voor de website: uitgaande communicatie blijft Engels (besluit Rick 19-10-2026).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const MODEL = 'claude-sonnet-5-5';
const CRED_ID = '90d3279d-1a62-46f2-ab4a-099c79732f14'; // zelfde Anthropic-sleutel als web-assistant
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

const SYSTEM = `You translate property listings of Grupo Soltura, a real estate agency on the southern Costa Blanca (Spain), from English into Swedish for the Swedish version of the agency's website.
Rules:
- Natural, fluent, warm Swedish as a Swedish property copywriter would write it. Address the reader with "du" where the English addresses the reader. Never a word-for-word translation.
- Faithful: translate everything, add nothing, leave nothing out, invent no facts. Keep all numbers, prices, measurements and the property reference exactly.
- Keep place names, urbanisation names, street names and Spanish terms that have no Swedish equivalent (e.g. "naya", "solarium", "IBI", "NIE") as they are.
- Swedish number style: space as thousands separator, comma as decimal separator ("120 000 €", "3,5 km").
- The description may contain HTML. Keep every HTML tag and attribute exactly as it is and in the same order; translate only the text between tags. If it is plain text with line breaks, keep the line breaks.
- If a field is empty, return an empty string for it.
Always answer by calling the respond tool exactly once, with all four fields. No other text.`;
const SCHEMA = {
  type: 'object',
  properties: {
    heading: { type: 'string' },
    description: { type: 'string' },
    seo_title: { type: 'string' },
    seo_description: { type: 'string' },
  },
  required: ['heading', 'description', 'seo_title', 'seo_description'],
};
async function translate(row: any) {
  const input = { heading: row.heading || '', description: row.description || '', seo_title: row.seo_title || '', seo_description: row.seo_description || '' };
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': await apiKey(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 8000, system: SYSTEM,
      tools: [{ name: 'respond', description: 'Return the Swedish translation of every field.', input_schema: SCHEMA }],
      tool_choice: { type: 'auto' }, // geforceerde tool_choice wordt door dit model niet ondersteund; de systeemprompt vraagt de tool
      messages: [{ role: 'user', content: `Property reference ${row.reference}. Translate these fields into Swedish:\n${JSON.stringify(input)}` }],
    }),
    signal: AbortSignal.timeout(140_000),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  if (j.stop_reason === 'max_tokens') throw new Error('truncated');
  const tu = (j.content || []).find((c: any) => c.type === 'tool_use');
  let out: any = tu ? tu.input || {} : null;
  if (!out) { // terugval: JSON in de tekst
    const txt = (j.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
    try { out = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1)); } catch { throw new Error('no tool_use'); }
  }
  // controle: beschrijving niet leeg en HTML-structuur gelijk (zelfde aantal tags)
  const tags = (s: string) => (String(s || '').match(/<[a-z\/][^>]*>/gi) || []).length;
  if (input.description && !String(out.description || '').trim()) throw new Error('empty description');
  if (tags(input.description) !== tags(out.description)) throw new Error(`html tags ${tags(input.description)} -> ${tags(out.description)}`);
  const ratio = String(out.description || '').length / Math.max(1, input.description.length);
  if (input.description.length > 200 && (ratio < 0.6 || ratio > 1.7)) throw new Error('length ratio ' + ratio.toFixed(2));
  return out;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const k = await sb.from('fn_keys').select('value').eq('name', 'property-translate-sv').maybeSingle();
  if (!k.data || req.headers.get('x-fn-key') !== k.data.value) return json({ error: 'forbidden' }, 403);
  let b: any = {};
  try { b = await req.json(); } catch { b = {}; }
  const limit = Math.max(1, Math.min(Number(b.limit) || 8, 12));
  const dry = b.dry_run === true;
  // top 40 van de wachtrij (eigen/beschikbaar eerst), daaruit 'limit' willekeurig: een tekst die steeds mislukt blokkeert zo de rest niet
  const { data: queue, error } = await sb.rpc('nexus2_sv_queue', { p_limit: 40 });
  if (error) return json({ ok: false, error: error.message }, 500);
  const pool = [...(queue || [])];
  const rows: any[] = [];
  while (rows.length < limit && pool.length) rows.push(pool.splice(Math.floor(Math.random() * Math.min(pool.length, limit * 2)), 1)[0]);
  const items: any[] = [];
  await Promise.all(rows.map(async (row: any) => {
    try {
      let t: any;
      try { t = await translate(row); } catch { t = await translate(row); } // 1x opnieuw (tijdelijke fout of controle mislukt)
      if (!dry) {
        const { error: e } = await sb.rpc('nexus2_sv_save', { p_property: row.property_id, p_heading: t.heading, p_description: t.description, p_seo_title: t.seo_title, p_seo_description: t.seo_description });
        if (e) throw new Error('save ' + e.message);
      }
      items.push({ reference: row.reference, ok: true, ...(dry ? { sample: String(t.heading || '').slice(0, 120) } : {}) });
    } catch (e) {
      items.push({ reference: row.reference, ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
    }
  }));
  const { data: remaining } = await sb.rpc('nexus2_sv_queue_count');
  const done = items.filter((i) => i.ok).length;
  return json({ ok: true, dry_run: dry, done, failed: items.length - done, remaining, items });
});
