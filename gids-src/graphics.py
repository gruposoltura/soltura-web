"""SVG-infographics voor de gids (taalneutraal; labels komen uit de content)."""

INK = '#2E3B42'; RED = '#C63232'; CORAL = '#FF7068'; LEMON = '#FBCC10'; DEEP = '#384850'
MIST = '#E3E6E7'; SALT = '#F7F7F5'; MUTED = '#77858C'

LON0, LON1, LAT0, LAT1 = -0.850, -0.600, 37.920, 38.175
W, H = 800, 1035

def P(lat, lon):
    return ((lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H)

COAST = [(38.20, -0.628), (38.17, -0.633), (38.145, -0.638), (38.115, -0.643), (38.09, -0.648), (38.06, -0.651), (38.035, -0.654), (38.01, -0.664),
         (37.985, -0.674), (37.965, -0.688), (37.945, -0.706), (37.925, -0.728), (37.905, -0.748), (37.885, -0.756)]
RIVER = [(38.098, -0.87), (38.098, -0.83), (38.096, -0.80), (38.090, -0.775), (38.086, -0.752), (38.088, -0.735), (38.090, -0.72),
         (38.095, -0.70), (38.102, -0.675), (38.108, -0.646)]
TOWNS = [
    ('Rojales', 38.088, -0.723, 12, -6, 'start'),
    ('Ciudad Quesada', 38.068, -0.715, 12, 16, 'start'),
    ('Benijófar', 38.077, -0.739, 6, 24, 'start'),
    ('Daya Vieja', 38.106, -0.738, 12, -8, 'start'),
    ('San Fulgencio', 38.106, -0.698, 12, -4, 'start'),
    ('Guardamar', 38.090, -0.655, 14, 2, 'start'),
    ('Daya Nueva', 38.113, -0.762, 0, -20, 'middle'),
    ('Almoradí', 38.109, -0.792, -12, 2, 'end'),
    ('Dolores', 38.140, -0.770, 12, 2, 'start'),
    ('Catral', 38.160, -0.804, -12, 2, 'end'),
    ('Algorfa', 38.059, -0.794, -12, 2, 'end'),
    ('Los Montesinos', 38.027, -0.744, -12, 2, 'end'),
    ('San Miguel de Salinas', 37.979, -0.789, 12, 2, 'start'),
    ('Torrevieja', 37.978, -0.682, 14, 2, 'start'),
    ('Orihuela Costa', 37.935, -0.737, -12, 2, 'end'),
]

def vega_map(L):
    pts = ' '.join(f'{x:.1f},{y:.1f}' for x, y in (P(a, b) for a, b in COAST))
    sea = f'<polygon points="{pts} {W+50},{H+50} {W+50},-50" fill="#CFE8EE"/>'
    coastline = f'<polyline points="{pts}" fill="none" stroke="#9CCFDB" stroke-width="4"/>'
    rv = ' '.join(f'{x:.1f},{y:.1f}' for x, y in (P(a, b) for a, b in RIVER))
    river = f'<polyline points="{rv}" fill="none" stroke="#6FB7CB" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
    def ell(lat, lon, rlon, rlat, rot, fill):
        x, y = P(lat, lon); rx = rlon / (LON1 - LON0) * W; ry = rlat / (LAT1 - LAT0) * H
        return f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" transform="rotate({rot} {x:.1f} {y:.1f})" fill="{fill}"/>'
    lakes = ell(37.997, -0.708, .022, .017, -35, '#F6B9C4') + ell(38.045, -0.690, .010, .011, -20, '#F6B9C4')
    x, y = P(37.997, -0.708); lk = f'<text x="{x:.0f}" y="{y+6:.0f}" font-size="19" text-anchor="middle" fill="#B04060" font-style="italic">{L["saltlake"]}</text>'
    sx, sy = P(37.975, -0.640); sea_lbl = f'<text x="{sx:.0f}" y="{sy:.0f}" font-size="28" fill="#4E9BB2" font-family="Fraunces" font-style="italic" transform="rotate(-58 {sx:.0f} {sy:.0f})">{L["sea"]}</text>'
    rx_, ry_ = P(38.098, -0.835); rlbl = f'<text x="{rx_:.0f}" y="{ry_-12:.0f}" font-size="17" fill="#3F8EA3" font-style="italic">{L["river"]}</text>'
    halo = 'paint-order="stroke" stroke="#F4F1EA" stroke-width="6" stroke-linejoin="round"'
    towns = ''
    for name, lat, lon, dx, dy, anc in TOWNS:
        x, y = P(lat, lon)
        towns += (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="#fff" stroke="{INK}" stroke-width="3.5"/>'
                  f'<text x="{x+dx:.1f}" y="{y+dy+7:.1f}" font-size="21" font-weight="700" fill="{INK}" text-anchor="{anc}" {halo}>{name}</text>')
    x, y = P(38.085, -0.748)
    office = (f'<path d="M{x:.1f},{y:.1f} c-16,-20 -27,-31 -27,-45 a27,27 0 1 1 54,0 c0,14 -11,25 -27,45z" fill="{RED}"/>'
              f'<circle cx="{x:.1f}" cy="{y-45:.1f}" r="10" fill="#fff"/>'
              f'<text x="{x-36:.1f}" y="{y-44:.1f}" font-size="22" font-weight="800" fill="{RED}" text-anchor="end" {halo}>Formentera del Segura</text>'
              f'<text x="{x-36:.1f}" y="{y-20:.1f}" font-size="18" font-weight="700" fill="{INK}" text-anchor="end" {halo}>{L["office"]}</text>')
    def arrow(x1, y1, x2, y2, label, tx, ty, anc):
        return (f'<path d="M{x1},{y1} L{x2},{y2}" stroke="{INK}" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#arr)"/>'
                f'<text x="{tx}" y="{ty}" font-size="19" font-weight="800" fill="{INK}" text-anchor="{anc}" {halo}>{label}</text>')
    arrows = (arrow(705, 80, 760, 20, '✈ ' + L['alc'], 700, 102, 'end') +
              arrow(160, 960, 60, 1010, '✈ ' + L['rmu'], 170, 950, 'start') +
              arrow(90, 160, 25, 160, '← Orihuela', 100, 166, 'start') +
              arrow(486, 60, 486, 12, 'Elche · Alicante', 500, 48, 'start'))
    defs = f'<defs><marker id="arr" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="{INK}"/></marker></defs>'
    frame = f'<rect x="0" y="0" width="{W}" height="{H}" fill="#F4F1EA"/>'
    return (f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope" style="border-radius:14px">{defs}{frame}{sea}{coastline}{lakes}{river}'
            f'{lk}{sea_lbl}{rlbl}{towns}{office}{arrows}</svg>')

def climate_chart(L):
    mx = [17, 18, 20, 22, 25, 29, 31, 32, 29, 26, 21, 18]
    mn = [7, 7, 9, 11, 14, 18, 21, 22, 19, 15, 11, 8]
    sea = [14, 14, 14, 16, 18, 22, 25, 26, 25, 22, 18, 16]
    w, h = 720, 300; left, bot, top = 40, 40, 20
    cw = (w - left - 10) / 12
    def Y(v): return top + (h - top - bot) * (1 - v / 35)
    out = f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope">'
    for v in (0, 10, 20, 30):
        out += f'<line x1="{left}" x2="{w-10}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{MIST}" stroke-width="1"/><text x="{left-8}" y="{Y(v)+4:.1f}" font-size="12" fill="{MUTED}" text-anchor="end">{v}°</text>'
    pts = []
    for i in range(12):
        x = left + i * cw + cw * 0.18; bw = cw * 0.64
        out += f'<rect x="{x:.1f}" y="{Y(mx[i]):.1f}" width="{bw:.1f}" height="{Y(mn[i])-Y(mx[i]):.1f}" rx="7" fill="url(#g)"/>'
        out += f'<text x="{x+bw/2:.1f}" y="{Y(mx[i])-6:.1f}" font-size="12" font-weight="800" fill="{INK}" text-anchor="middle">{mx[i]}°</text>'
        out += f'<text x="{x+bw/2:.1f}" y="{Y(mn[i])+15:.1f}" font-size="11" fill="{MUTED}" text-anchor="middle">{mn[i]}°</text>'
        out += f'<text x="{x+bw/2:.1f}" y="{h-12}" font-size="12" font-weight="700" fill="{INK}" text-anchor="middle">{L["months"][i]}</text>'
        pts.append((x + bw / 2, Y(sea[i])))
    out += '<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + f'" fill="none" stroke="#2A9DB8" stroke-width="3" stroke-dasharray="7 5"/>'
    out += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="#2A9DB8"/>' for x, y in pts)
    out += f'<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{RED}"/><stop offset=".55" stop-color="{CORAL}"/><stop offset="1" stop-color="{LEMON}"/></linearGradient></defs>'
    out += '</svg>'
    return out

def cost_layers(L):
    """Drie kostenlagen als gestapelde staven."""
    rows = L['layers']  # [(titel, uitleg, kleur, breedte%)]
    w = 720; y = 0; out = ''
    for i, (t, x, col, pct) in enumerate(rows):
        bw = w * pct
        out += (f'<rect x="0" y="{y}" width="{bw}" height="74" rx="14" fill="{col}"/>'
                f'<text x="22" y="{y+32}" font-size="20" font-weight="800" fill="{"#2E3B42" if col==LEMON else "#fff"}">{t}</text>'
                f'<text x="22" y="{y+56}" font-size="14" fill="{"#2E3B42" if col==LEMON else "#fff"}" opacity=".92">{x}</text>')
        y += 86
    return f'<svg viewBox="0 0 {w} {y}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope">{out}</svg>'

def process_bar(L):
    """Horizontale procesbalk met 8 stappen."""
    steps = L['proc']
    n = len(steps); w = 720; h = 150; gap = w / n
    out = f'<line x1="{gap/2}" x2="{w-gap/2}" y1="40" y2="40" stroke="url(#pg)" stroke-width="8" stroke-linecap="round"/>'
    for i, (t, d) in enumerate(steps):
        x = gap / 2 + i * gap
        out += (f'<circle cx="{x:.1f}" cy="40" r="22" fill="#fff" stroke="{RED}" stroke-width="5"/>'
                f'<text x="{x:.1f}" y="47" font-size="19" font-weight="800" fill="{RED}" text-anchor="middle">{i+1}</text>')
        for j, line in enumerate(t.split('|')):
            out += f'<text x="{x:.1f}" y="{88+j*17}" font-size="14" font-weight="800" fill="{INK}" text-anchor="middle">{line}</text>'
        out += f'<text x="{x:.1f}" y="{90+len(t.split("|"))*17+4}" font-size="12.5" fill="{MUTED}" text-anchor="middle">{d}</text>'
    out += f'<defs><linearGradient id="pg"><stop offset="0" stop-color="{RED}"/><stop offset=".6" stop-color="{CORAL}"/><stop offset="1" stop-color="{LEMON}"/></linearGradient></defs>'
    return f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope">{out}</svg>'

def decision_tree(L):
    """Welk type koper ben je: vraag -> 5 profielen."""
    q = L['dt_q']; opts = L['dt_opts']  # [(titel, sub)]
    w = 720; out = ''
    out += f'<rect x="160" y="0" width="400" height="58" rx="29" fill="{INK}"/><text x="360" y="36" font-size="18" font-weight="800" fill="#fff" text-anchor="middle">{q}</text>'
    n = len(opts); cw = w / n
    cols = [RED, CORAL, '#E8A400', DEEP, '#2A9DB8']
    for i, (t, s) in enumerate(opts):
        cx = cw * i + cw / 2
        out += f'<path d="M360,58 C360,92 {cx:.0f},88 {cx:.0f},118" fill="none" stroke="{MIST}" stroke-width="3"/>'
        out += f'<rect x="{cx-cw/2+5:.0f}" y="118" width="{cw-10:.0f}" height="84" rx="14" fill="{cols[i]}"/>'
        for j, line in enumerate(t.split('|')):
            out += f'<text x="{cx:.0f}" y="{146+j*19}" font-size="16" font-weight="800" fill="#fff" text-anchor="middle">{line}</text>'
        out += f'<text x="{cx:.0f}" y="{190}" font-size="12" fill="#fff" opacity=".9" text-anchor="middle">{s}</text>'
    return f'<svg viewBox="0 0 {w} 206" xmlns="http://www.w3.org/2000/svg" font-family="Manrope">{out}</svg>'
