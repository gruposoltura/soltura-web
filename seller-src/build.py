"""Bouwt de infotorial "verkoopbegeleiding / seller guidance" (A4, 2 pagina's) per taal naar PDF.
Gebruik:  python seller-src/build.py <uitmap> [taal ...]      (zonder taal: nl en es sv)
Vereist: playwright + chromium, fonts Liberation Sans/Serif (zelfde fonts als het origineel op Cloudinary).
Teksten: content.py. Bestandsnamen: content.FILES. Iconen: assets/ (extract_icons.py). De PDF's horen in downloads/ van de site."""
import base64, html, os, re, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from content import T, FILES  # noqa: E402

A = HERE / 'assets'
def svg(n): return 'data:image/svg+xml;base64,' + base64.b64encode((A / f'{n}.svg').read_bytes()).decode()
HDR = 'data:image/jpeg;base64,' + base64.b64encode((A / 'header.jpg').read_bytes()).decode()
CSS = (HERE / 'style.css').read_text()

def card(c):
    ic, h, p, tag = c
    return (f'<div class="card"><div class="ic"><img src="{svg(ic)}"></div>'
            f'<h3>{h}</h3><p>{p}</p><div class="tag">{tag}</div></div>')

def page_html(lang):
    t = T[lang]; cards = t['cards']
    return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>{t['title']}</title><style>{CSS}</style></head><body>
<section class="page p1">
  <img class="hdr" src="{HDR}">
  <div class="bar"><span>{t['place']}</span><a href="https://www.gruposoltura.com/">www.gruposoltura.com</a></div>
  <div class="hero"><div class="k">{t['kicker']}</div><h1>{t['h1']}</h1><p>{t['intro']}</p></div>
  <div class="fee"><div class="badge"><span class="x">{t['badgeX']}</span><span class="f{' long' if len(t['badge']) > 7 else ''}">{t['badge']}</span></div>
    <div><div class="k gold">{t['feeK']}</div><h2>{t['feeH']}</h2><p>{t['feeP']}</p></div></div>
  <div class="also"><img src="{svg('check')}"><p><b>{t['alsoB']}</b> {t['alsoP']}</p></div>
  <div class="k gk">{t['gridK']}</div>
  <div class="grid">{''.join(card(c) for c in cards[:4])}</div>
</section>
<section class="page p2">
  <div class="grid">{''.join(card(c) for c in cards[4:])}</div>
  <div class="cta"><p class="note">{t['note']}</p><h2>{t['ctaH']}</h2><p class="ctap">{t['ctaP']}</p>
    <div class="btns"><a class="btn red" href="https://www.gruposoltura.com/">{t['btnWeb']}</a><a class="btn dark" href="tel:+34966792113">{t['btnCall']}</a></div></div>
  <div class="foot"><a class="www" href="https://www.gruposoltura.com/">www.gruposoltura.com</a>
    <p>Copyright © 2026 Grupo Soltura S.L. — {t['rights']}</p>
    <p>Grupo Soltura S.L.<br>Avd de Constitución s/n<br>03179 Formentera del Segura (ALC)</p>
    <p>Member No. 992 of the Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)<br>Member No. 3.473 of the Asociación Profesional de Gestores Intermediarios en promociones de<br>Edificaciones (GIPE) y Confédération Européenne de L'Immobilier (CEI)<br>Member of the Association of International Property Professionals (AIPP)</p>
    <a class="pv" href="{t['privacyUrl']}">{t['privacy']}</a></div>
</section></body></html>'''

def build(out, langs):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        for l in langs:
            pg.set_content(page_html(l)); pg.wait_for_timeout(150)
            over = pg.evaluate("() => [...document.querySelectorAll('.page')].map(s => s.scrollHeight - s.clientHeight)")
            if any(o > 1 for o in over): raise SystemExit(f'{l}: inhoud loopt over de pagina ({over})')
            pg.pdf(path=str(out / FILES[l]), prefer_css_page_size=True, print_background=True)
            print(l, '->', out / FILES[l])
        b.close()

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2:] or ['nl', 'en', 'es', 'sv'])
