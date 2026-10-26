"""Eenmalig gebruikt (26-10-2026): haalt de vectoriconen uit de originele infotorial verkoopbegeleiding (EN) als SVG.
Gebruik: python seller-src/extract_icons.py <Soltura-Verkoopbegeleiding-Infotorial_EN.pdf> seller-src/assets
De roze cirkel achter de iconen zit niet in de SVG; die tekent style.css."""
import sys, pymupdf as fitz
src = fitz.open(sys.argv[1]); out = sys.argv[2]
S = 34.75
def sq(x, y): return (x, y, x + S, y + S)
ICONS = {'valuation': (0, sq(16.8, 534.2)), 'docs': (0, sq(314.4, 534.2)),
         'present': (0, sq(16.8, 672.7)), 'viewing': (0, sq(314.4, 672.7)),
         'contract': (1, sq(16.8, 15.6)), 'poa': (1, sq(314.4, 15.6)),
         'notary': (1, sq(16.8, 168.9)), 'tax': (1, sq(314.4, 168.9)),
         'transfer': (1, sq(16.8, 322.9)), 'settle': (1, sq(314.4, 322.9)),
         'check': (0, (39.7, 439.9, 63.4, 463.6))}
hexc = lambda c: '#%02x%02x%02x' % tuple(round(x * 255) for x in c)
f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
draws = [src[0].get_drawings(), src[1].get_drawings()]
for n, (pg, r) in ICONS.items():
    R = fitz.Rect(r); G = fitz.Rect(R.x0 - .5, R.y0 - .5, R.x1 + .5, R.y1 + .5); x0, y0 = R.x0, R.y0; parts = []
    for dr in draws[pg]:
        if not G.contains(dr['rect']) or (dr.get('fill') and hexc(dr['fill']) == '#fbe4e4'): continue
        d = []; cur = None
        def mv(a):
            global cur
            if cur is None or abs(cur.x - a.x) > .01 or abs(cur.y - a.y) > .01: d.append(f'M{f(a.x-x0)} {f(a.y-y0)}')
        for it in dr['items']:
            k = it[0]
            if k == 'l': mv(it[1]); d.append(f'L{f(it[2].x-x0)} {f(it[2].y-y0)}'); cur = it[2]
            elif k == 'c':
                a, c1, c2, b = it[1:5]; mv(a)
                d.append(f'C{f(c1.x-x0)} {f(c1.y-y0)} {f(c2.x-x0)} {f(c2.y-y0)} {f(b.x-x0)} {f(b.y-y0)}'); cur = b
            elif k == 're':
                q = it[1]; d.append(f'M{f(q.x0-x0)} {f(q.y0-y0)}H{f(q.x1-x0)}V{f(q.y1-y0)}H{f(q.x0-x0)}Z'); cur = None
            elif k == 'qu':
                q = it[1]; d.append('M' + ' L'.join(f'{f(p.x-x0)} {f(p.y-y0)}' for p in (q.ul, q.ur, q.lr, q.ll)) + 'Z'); cur = None
        if dr.get('closePath'): d.append('Z')
        t = dr['type']
        attr = [f'fill="{hexc(dr["fill"])}"' if 'f' in t and dr.get('fill') else 'fill="none"']
        if 's' in t and dr.get('color'):
            lc = dr.get('lineCap'); lc = lc[0] if isinstance(lc, (tuple, list)) else (lc or 0)
            attr.append(f'stroke="{hexc(dr["color"])}" stroke-width="{f(dr["width"])}" stroke-linecap="{["butt","round","square"][int(lc)]}" stroke-linejoin="{["miter","round","bevel"][int(dr.get("lineJoin") or 0)]}"')
        if dr.get('even_odd'): attr.append('fill-rule="evenodd"')
        parts.append(f'<path d="{"".join(d)}" {" ".join(attr)}/>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{f(R.width)}pt" height="{f(R.height)}pt" viewBox="0 0 {f(R.width)} {f(R.height)}">' + ''.join(parts) + '</svg>'
    open(f'{out}/{n}.svg', 'w').write(svg); print(n, len(parts))
