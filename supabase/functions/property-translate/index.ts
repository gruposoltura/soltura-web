// SOLTURA - woningteksten vertalen vanuit het Engels (brontaal) naar Nederlands, Zweeds of Spaans. Sinds 19-10-2026 (Spaans sinds 26-10-2026).
// Vervangt property-translate-sv: één functie voor alle vertaalde talen, zodat NL, SV en ES hetzelfde werken (besluit Rick 19-10-2026).
// Aangeroepen door n8n JARVIS-Web-TranslateNL, -TranslateSV en -TranslateES met header x-fn-key = public.fn_keys[name=property-translate].
// POST {lang: 'nl'|'sv'|'es', limit?: number (max 12), dry_run?: boolean} -> {ok, lang, done, failed, remaining, stuck, stuck_refs, items}
// Wachtrij: public.nexus2_tr_queue(lang) = gepubliceerd + beschikbaar/onder bod/gereserveerd, vertaling ontbreekt of is ouder dan de Engelse tekst;
// voor ES blijft een Spaanse feedtekst (feed_hash gevuld) staan, alleen ontbrekende of eigen vertalingen worden (opnieuw) vertaald.
// na 3 mislukte pogingen overgeslagen tot de Engelse tekst verandert (public.translate_fail). Opslaan: public.nexus2_tr_save.
// 21-10-2026: 'stuck' = opgegeven vertalingen (public.nexus2_tr_stuck); de n8n-run-log zet dan status warn, zodat ze niet onzichtbaar blijven.
// 25-10-2026: controle vergelijkt de volgorde van de tagnamen (niet alleen het aantal); bij een afgekeurde vertaling krijgt het model
// bij de herkansing de reden en de verplichte taglijst mee. dry_run toont bij een fout een stuk van de afgekeurde uitvoer (debug).
// Alleen voor de website.
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
  es: {
    name: 'Spanish',
    style: 'Natural, fluent, warm Spanish of Spain (castellano) as a Spanish property copywriter would write it. Address the reader with "tú" where the English addresses the reader. Use the usual Spanish property terms (vivienda, obra nueva, reventa, parcela, adosado, pareado, ático, solárium, piscina comunitaria). Never a word-for-word translation.',
    numbers: 'Spanish number style: dot as thousands separator, comma as decimal separator, euro sign after the amount ("120.000 €", "3,5 km").',
  },
};
const system = (l: string) => `You translate property listings of Grupo Soltura, a real estate agency on the southern Costa Blanca (Spain), from English into ${LANG[l].name} for the ${LANG[l].name} version of the agency's website.
Rules:
- ${LANG[l].style}
- Faithful: translate everything, add nothing, leave nothing out, invent no facts. Keep all numbers, prices, measurements and the property reference exactly.
- Keep place names, urbanisation names, street names and Spanish terms that have no ${LANG[l].name} equivalent (e.g. "naya", "solarium", "IBI", "NIE") as they are.
- ${LANG[l].numbers}
- The description may contain HTML. Keep every HTML tag and attribute exactly as it is and in the same order; translate only the text between tags. Every <p>, </p>, <a ...> and </a> in the input must appear in your description, in the same order. Never convert HTML to Markdown or plain text.
- If it is plain text with line breaks, keep the line breaks.
- If a field is empty, return an empty string for it.
Always answer by calling the respond tool exactly once, with all four fields. No other text.`;
const SCHEMA = { type: 'object', properties: { heading: { type: 'string' }, description: { type: 'string' }, seo_title: { type: 'string' }, seo_description: { type: 'string' } }, required: ['heading', 'description', 'seo_title', 'seo_description'] };

const TAG_RE = /<[a-z\/][^>]*>/gi;
const tagList = (s: string) => String(s || '').match(TAG_RE) || [];
const tagName = (t: string) => { const m = t.match(/^<\s*(\/?)\s*([a-z0-9]+)/i); return m ? (m[1] + m[2]).toLowerCase() : t; };
const tagSeq = (s: string) => tagList(s).map(tagName).join(' ');

class TxError extends Error { bad?: string; kind?: string; }

async function translate(row: any, l: string, retryHint?: string) {
  const input = { heading: row.heading || '', description: row.description || '', seo_title: row.seo_title || '', seo_description: row.seo_description || '' };
  let user = `Property reference ${row.reference}. Translate these fields into ${LANG[l].name}:\n${JSON.stringify(input)}`;
  if (retryHint) user += `\n\n${retryHint}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': await apiKey(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 8000, system: system(l),
      tools: [{ name: 'respond', description: `Return the ${LANG[l].name} translation of every field.`, input_schema: SCHEMA }],
      tool_choice: { type: 'auto' }, // geforceerde tool_choice wordt door dit model niet ondersteund
      messages: [{ role: 'user', content: user }] }),
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
  // controle: omschrijving niet leeg, zelfde tags in dezelfde volgorde, lengte plausibel
  if (input.description && !String(out.description || '').trim()) throw new Error('empty description');
  const nIn = tagList(input.description).length, nOut = tagList(out.description).length;
  if (nIn !== nOut || tagSeq(input.description) !== tagSeq(out.description)) {
    const e = new TxError(nIn !== nOut ? `html tags ${nIn} -> ${nOut}` : `html tag order differs`);
    e.kind = 'tags'; e.bad = String(out.description || '');
    throw e;
  }
  const ratio = String(out.description || '').length / Math.max(1, input.description.length);
  if (input.description.length > 200 && (ratio < 0.6 || ratio > 1.7)) throw new Error('length ratio ' + ratio.toFixed(2));
  return out;
}

function hintFor(row: any, e: any) {
  const base = `A previous answer was rejected: ${String(e?.message || e)}.`;
  if (e?.kind !== 'tags') return base + ' Please try again and follow every rule.';
  const tags = tagList(row.description || '');
  return `${base} The description field must contain exactly these ${tags.length} HTML tags, in this order, copied literally (attributes included):\n${tags.join('\n')}\nReturn the complete translated description with all of them; translate only the text between the tags.`;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const k = await sb.from('fn_keys').select('value').eq('name', 'property-translate').maybeSingle();
  if (!k.data || req.headers.get('x-fn-key') !== k.data.value) return json({ error: 'forbidden' }, 403);
  let b: any = {};
  try { b = await req.json(); } catch { b = {}; }
  const l = String(b.lang || '').toLowerCase();
  if (!LANG[l]) return json({ ok: false, error: 'lang must be nl, sv or es' }, 400);
  const limit = Math.max(1, Math.min(Number(b.limit) || 8, 12));
  const dry = b.dry_run === true;
  const { data: rows, error } = await sb.rpc('nexus2_tr_queue', { p_lang: l, p_limit: limit });
  if (error) return json({ ok: false, lang: l, error: error.message }, 500);
  const items: any[] = [];
  await Promise.all((rows || []).map(async (row: any) => {
    let first: any = null;
    try {
      let t: any;
      try { t = await translate(row, l); }
      catch (e) { first = e; t = await translate(row, l, hintFor(row, e)); } // 1x opnieuw, met de reden erbij
      if (!dry) {
        const { error: e } = await sb.rpc('nexus2_tr_save', { p_lang: l, p_property: row.property_id, p_heading: t.heading, p_description: t.description, p_seo_title: t.seo_title, p_seo_description: t.seo_description });
        if (e) throw new Error('save ' + e.message);
      }
      items.push({ reference: row.reference, ok: true, retried: !!first, ...(first ? { first_error: String(first.message || first).slice(0, 120) } : {}), ...(dry ? { sample: String(t.heading || '').slice(0, 120) } : {}) });
    } catch (e) {
      const msg = String((e as Error)?.message || e).slice(0, 200);
      if (!dry) await sb.rpc('nexus2_tr_fail', { p_lang: l, p_property: row.property_id, p_error: msg });
      const dbg: any = {};
      if (dry) for (const [n, x] of [['first', first], ['second', e]] as [string, any][]) {
        if (x?.bad !== undefined) dbg[n] = { error: String(x.message), tags: tagList(x.bad).map(tagName), head: x.bad.slice(0, 400) };
      }
      items.push({ reference: row.reference, ok: false, error: msg, ...(dry ? { debug: dbg } : {}) });
    }
  }));
  const { data: remaining } = await sb.rpc('nexus2_tr_queue_count', { p_lang: l });
  const { data: stuckRows } = await sb.rpc('nexus2_tr_stuck', { p_lang: l });
  const stuck = (stuckRows || []) as any[];
  const done = items.filter((i) => i.ok).length;
  return json({ ok: true, lang: l, dry_run: dry, done, failed: items.length - done, remaining, stuck: stuck.length,
    stuck_refs: stuck.slice(0, 5).map((s) => s.reference + ': ' + String(s.last_error || '').slice(0, 80)), items });
});
