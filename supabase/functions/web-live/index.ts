// web-live (24-10-2026): echte live-tellers voor de website, zonder ruwe data naar de bezoeker.
// POST { pid?: uuid, sid?: string }  ->  { site: n|null, week: n|null, now: n|null }
// - site: unieke bezoekers laatste 30 min (homepage), alleen getoond vanaf SITE_MIN
// - week: unieke bezoekers die deze woning de laatste 7 dagen bekeken, vanaf WEEK_MIN
// - now:  ANDERE bezoekers (eigen sid eraf) die nu op deze woning zitten (laatste 15 min), vanaf NOW_MIN
// Team (?team=1) en bots tellen niet mee (web_events.flag). Onder de drempel: null -> site toont niets.
// Cache 60 s per woning/home, zodat de database per minuut hooguit één keer per woning wordt gevraagd.
const SITE_MIN = 8, WEEK_MIN = 5, NOW_MIN = 2;
const SB = Deno.env.get('SUPABASE_URL')!;
const SR = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cache = new Map<string, { t: number; d: { site30: number; week: number | null; now_sids: string[] } }>();

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, content-type, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function raw(pid: string | null) {
  const key = pid || 'home', hit = cache.get(key);
  if (hit && Date.now() - hit.t < 60_000) return hit.d;
  const r = await fetch(`${SB}/rest/v1/rpc/web_live_counts`, {
    method: 'POST',
    headers: { apikey: SR, authorization: `Bearer ${SR}`, 'content-type': 'application/json' },
    body: JSON.stringify({ p_property: pid }),
  });
  if (!r.ok) throw new Error(`rpc ${r.status}`);
  const d = await r.json();
  cache.set(key, { t: Date.now(), d });
  if (cache.size > 2000) cache.delete(cache.keys().next().value!);
  return d;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const b = await req.json().catch(() => ({}));
    const pid = typeof b.pid === 'string' && UUID.test(b.pid) ? b.pid : null;
    const sid = typeof b.sid === 'string' ? b.sid.slice(0, 64) : '';
    const d = await raw(pid);
    const others = (d.now_sids || []).filter((s: string) => s !== sid).length;
    return json({
      site: d.site30 >= SITE_MIN ? d.site30 : null,
      week: pid && d.week != null && d.week >= WEEK_MIN ? d.week : null,
      now: pid && others >= NOW_MIN ? others : null,
    });
  } catch (_e) {
    return json({ site: null, week: null, now: null });
  }
});
