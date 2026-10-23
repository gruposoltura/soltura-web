#!/usr/bin/env python3
"""Soltura woon- en koopgids: HTML-renderer + PDF via Playwright.
Gebruik: python3 build.py nl|en|es
"""
import sys, os, base64, io, importlib, json, subprocess
import qrcode
from qrcode.image.svg import SvgPathImage

ROOT = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ROOT, 'assets')

def img(name):
    return 'assets/img/' + name

# ---------------------------------------------------------------- icons
ICONS = {
 'check': '<path d="M20 6 9 17l-5-5"/>',
 'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 'alert': '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
 'home': '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 'key': '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
 'euro': '<path d="M4 10h12M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12a7.9 7.9 0 0 0 7.8 8 7.7 7.7 0 0 0 5.2-2"/>',
 'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
 'doc': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>',
 'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
 'pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
 'chat': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 'people': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
 'paw': '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.8 1.1 3.6 3.6 0 0 0-2.5-2.4A3.5 3.5 0 0 1 6 10.9 5 5 0 0 1 9 10z"/>',
 'school': '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
 'health': '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
 'star': '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
 'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 'bank': '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>',
 'wave': '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
 'car': '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 6H8.4a2 2 0 0 0-1.7.9L4 10l-1.6.6A2 2 0 0 0 1 12.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
 'tool': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
 'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
 'laptop': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
 'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
 'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
 'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 'golf': '<path d="M12 18V2l7 4-7 4"/><path d="M9 17.3C5.5 17.8 3 19 3 20.5 3 22 7 23 12 23s9-1 9-2.5c0-1.5-2.5-2.7-6-3.2"/>',
}
def icon(name, size=18, color='currentColor', sw=1.8):
    return (f'<svg class="ic" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>')

def qr_svg(url, fg='#2E3B42'):
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url); q.make(fit=True)
    m = q.get_matrix(); n = len(m)
    rects = ''.join(f'M{x},{y}h1v1h-1z' for y, row in enumerate(m) for x, v in enumerate(row) if v)
    return f'<svg viewBox="0 0 {n} {n}" shape-rendering="crispEdges"><path fill="{fg}" d="{rects}"/></svg>'

# ---------------------------------------------------------------- blocks
def esc_attr(s): return s.replace('"', '&quot;')

def render_block(b, C):
    t = b[0]
    if t == 'h2':   return f'<h2>{b[1]}</h2>'
    if t == 'h3':   return f'<h3>{b[1]}</h3>'
    if t == 'h4':   return f'<h4>{b[1]}</h4>'
    if t == 'lead': return f'<p class="lead">{b[1]}</p>'
    if t == 'p':    return f'<p>{b[1]}</p>'
    if t == 'small':return f'<p class="small">{b[1]}</p>'
    if t == 'html': return b[1]
    if t == 'sp':   return f'<div style="height:{b[1]}mm"></div>'
    if t == 'ul':
        return '<ul class="dots">' + ''.join(f'<li>{x}</li>' for x in b[1]) + '</ul>'
    if t == 'ol':
        return '<ol class="num">' + ''.join(f'<li><span class="n">{i+1}</span><div>{x}</div></li>' for i, x in enumerate(b[1])) + '</ol>'
    if t == 'check':  # checklist with boxes
        cls = 'checklist' + (' two' if len(b) > 2 and b[2] == 2 else '')
        return f'<ul class="{cls}">' + ''.join(f'<li><span class="box"></span><div>{x}</div></li>' for x in b[1]) + '</ul>'
    if t == 'callout':
        kind, title, text = b[1], b[2], b[3]
        ic = {'tip': 'sun', 'warn': 'alert', 'soltura': 'home', 'info': 'doc'}[kind]
        col = {'tip': '#C63232', 'warn': '#C63232', 'soltura': '#FBCC10', 'info': '#384850'}[kind]
        return (f'<div class="callout {kind}"><div class="ct">{icon(ic, 17, col, 2)}<span>{title}</span></div>'
                f'<div class="cb">{text}</div></div>')
    if t == 'table':
        head, rows = b[1], b[2]
        cls = 'tbl ' + (b[3] if len(b) > 3 else '')
        h = '<tr>' + ''.join(f'<th>{x}</th>' for x in head) + '</tr>'
        r = ''.join('<tr' + (' class="tot"' if str(row[0]).startswith('!') else '') + '>' +
                    ''.join(f'<td>{str(x).lstrip("!")}</td>' for x in row) + '</tr>' for row in rows)
        return f'<table class="{cls}"><thead>{h}</thead><tbody>{r}</tbody></table>'
    if t == 'cols':
        ratio = b[2] if len(b) > 2 else None
        cols = b[1]
        style = f'grid-template-columns:{ratio}' if ratio else f'grid-template-columns:repeat({len(cols)},1fr)'
        return f'<div class="cols" style="{style}">' + ''.join(
            '<div>' + ''.join(render_block(x, C) for x in col) + '</div>' for col in cols) + '</div>'
    if t == 'img':
        src, h = b[1], b[2]
        cap = b[3] if len(b) > 3 else ''
        pos = b[4] if len(b) > 4 else 'center'
        capt = f'<figcaption>{cap}</figcaption>' if cap else ''
        return f'<figure class="ph"><div class="phi" style="height:{h}mm;background-image:url({img(src)});background-position:{pos}"></div>{capt}</figure>'
    if t == 'stats':
        sc = b[2] if len(b) > 2 else 4
        return f'<div class="stats" style="--sc:{sc}">' + ''.join(
            f'<div class="stat"><div class="sv">{v}</div><div class="sl">{l}</div></div>' for v, l in b[1]) + '</div>'
    if t == 'quote':
        return f'<blockquote class="q"><div class="qm">“</div><p>{b[1]}</p><cite>{b[2]}</cite></blockquote>'
    if t == 'cards':
        n = b[2] if len(b) > 2 else 3
        out = f'<div class="cards" style="grid-template-columns:repeat({n},1fr)">'
        for c in b[1]:
            ic = icon(c['icon'], 20, '#C63232', 2) if c.get('icon') else ''
            ph = f'<div class="cimg" style="background-image:url({img(c["img"])})"></div>' if c.get('img') else ''
            tag = f'<div class="ctag">{c["tag"]}</div>' if c.get('tag') else ''
            out += f'<div class="card">{ph}<div class="cin">{tag}<div class="chd">{ic}<b>{c["t"]}</b></div><div class="ctx">{c["x"]}</div></div></div>'
        return out + '</div>'
    if t == 'steps':  # vertical timeline
        out = '<div class="timeline">'
        for i, s in enumerate(b[1]):
            when = f'<span class="when">{s[2]}</span>' if len(s) > 2 and s[2] else ''
            out += f'<div class="tl"><div class="tln">{i+1}</div><div class="tlb"><div class="tlt">{s[0]}{when}</div><div class="tlx">{s[1]}</div></div></div>'
        return out + '</div>'
    if t == 'qr':
        url, label = b[1], b[2]
        return f'<a class="qrbox" href="{url}"><div class="qrc">{qr_svg(url)}</div><div class="qrl"><b>{label}</b><span>{url.replace("https://","")}</span></div></a>'
    if t == 'qrrow':
        out = '<div class="qrrow">'
        for url, label in b[1]:
            out += f'<a class="qrbox v" href="{url}"><div class="qrc">{qr_svg(url)}</div><div class="qrl"><b>{label}</b><span>{url.replace("https://","")}</span></div></a>'
        return out + '</div>'
    if t == 'cta':
        url, title, text = b[1], b[2], b[3]
        return (f'<a class="cta" href="{url}"><div class="ctaq">{qr_svg(url, "#FFFFFF")}</div><div><div class="ctat">{title}</div>'
                f'<div class="ctax">{text}</div><div class="ctau">{url.replace("https://","")} →</div></div></a>')
    if t == 'lines':  # writing lines
        n = b[1]; lab = b[2] if len(b) > 2 else ''
        return f'<div class="wl"><div class="wlh">{lab}</div>' + '<div class="line"></div>' * n + '</div>'
    if t == 'svg':  return f'<div class="svgw">{b[1]}</div>'
    if t == 'facts':
        return '<dl class="facts">' + ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in b[1]) + '</dl>'
    raise ValueError(t)

# ---------------------------------------------------------------- pages
def page_header(label, C):
    return (f'<header class="ph-head"><img src="{img("logo-wide.png")}" class="hlogo"/>'
            f'<span class="hlab">{label}</span></header>')

def page_footer(n, C):
    return (f'<footer class="pf"><span>{C.L["guide_title"]}</span>'
            f'<span class="pn">{n}</span><a href="{C.LINKS["home"]}">gruposoltura.com</a></footer>')

def render_page(p, n, C):
    kind = p['kind']
    if kind == 'cover':
        return f'''<section class="page cover">
<div class="cbg" style="background-image:url({img(p['img'])})"></div><div class="cshade"></div>
<div class="clogo"><img src="{img('logo-square.png')}"/></div>
<div class="ctxt"><div class="ckick">{p['kicker']}</div><h1>{p['title']}</h1><div class="csub">{p['sub']}</div></div>
<div class="cfoot"><span>{p['edition']}</span><span>gruposoltura.com</span></div><div class="sunbar"></div></section>'''
    if kind == 'opener':
        return f'''<section class="page opener">
<div class="obg" style="background-image:url({img(p['img'])});background-position:{p.get('pos','center')}"></div><div class="oshade"></div>
<div class="otop"><img src="{img('logo-square.png')}"/></div>
<div class="otxt"><div class="onum">{p['num']}</div><div class="olab">{C.L['part']} {p['num']}</div><h1>{p['title']}</h1><p>{p['intro']}</p>
<div class="oin">{''.join(f'<span>{x}</span>' for x in p.get('inside', []))}</div></div><div class="sunbar"></div></section>'''
    if kind == 'back':
        return f'<section class="page back">{p["html"]}<div class="sunbar"></div></section>'
    # standard content page
    hero = ''
    if p.get('hero'):
        hero = f'<div class="hero" style="height:{p.get("hero_h", 70)}mm;background-image:url({img(p["hero"])});background-position:{p.get("hero_pos","center")}"></div>'
    body = ''.join(render_block(b, C) for b in p['blocks'])
    cls = 'page content' + (' withhero' if hero else '') + (' ' + p['cls'] if p.get('cls') else '')
    head = page_header(p.get('label', ''), C)
    band = ''; bstyle = ''
    if p.get('band'):
        bh = p.get('band_h', 70)
        band = f'<div class="band" style="height:{bh}mm;background-image:url({img(p["band"])});background-position:{p.get("band_pos","center")}"></div>'
        bstyle = f' style="bottom:{17 + bh + 5}mm"'
    return f'<section class="{cls}">{hero}{head}<div class="body"{bstyle}>{body}</div>{band}{page_footer(n, C)}</section>'

CSS = open(os.path.join(ROOT, 'style.css')).read()

def build(lang):
    C = importlib.import_module('content_' + lang)
    pages = C.PAGES
    html = [f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>{C.L["guide_title"]} | Soltura Real Estate</title><style>{CSS}</style></head><body>']
    for i, p in enumerate(pages):
        html.append(render_page(p, i + 1, C))
    html.append('</body></html>')
    out = os.path.join(ROOT, f'gids_{lang}.html')
    open(out, 'w').write('\n'.join(html))
    return out, C

if __name__ == '__main__':
    lang = sys.argv[1] if len(sys.argv) > 1 else 'nl'
    out, C = build(lang)
    print(out)
