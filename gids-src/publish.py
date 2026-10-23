#!/usr/bin/env python3
"""Bouwt alle gidsen opnieuw en zet ze op de website.

Gebruik:  python3 gids-src/publish.py [pad-naar-soltura-web]   (standaard: de map erboven)
  1. build.py per taal -> gids_<lang>.html
  2. Playwright -> PDF, met overflow-check per pagina (stopt bij overflow)
  3. overschrijft <web>/downloads/<naam>.pdf (vaste namen,
     links in mails en op de site blijven werken; het oude bestand verdwijnt)
  4. maakt de waaierbeelden <web>/img/gids/<lang>-<pagina>.webp (440 px breed)
Vereist: pip install playwright qrcode pillow ; pdftoppm (poppler-utils).
"""
import sys, os, asyncio, subprocess, tempfile, glob
from playwright.async_api import async_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
LANGS = {
    'nl': ('Soltura-Woon-en-Koopgids-2026-NL.pdf', 'soltura-woon-en-koopgids-2026-nl.pdf'),
    'en': ('Soltura-Buying-Guide-2026-EN.pdf', 'soltura-buying-guide-2026-en.pdf'),
    'es': ('Soltura-Guia-de-Compra-2026-ES.pdf', 'soltura-guia-de-compra-2026-es.pdf'),
    'sv': ('Soltura-Kopguide-2026-SV.pdf', 'soltura-kopguide-2026-sv.pdf'),
}
FAN = [1, 5, 14, 16, 26]
OVERFLOW_JS = '''() => [...document.querySelectorAll('.page')].map((pg, i) => {
  const body = pg.querySelector('.body'); if (!body) return null;
  let maxB = 0; const top = body.getBoundingClientRect().top;
  body.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (r.height) maxB = Math.max(maxB, r.bottom - top); });
  const lim = body.getBoundingClientRect().height;
  return maxB > lim + 1 ? `p${i+1}: ${Math.round(maxB - lim)}px over` : null; }).filter(Boolean)'''


async def render(html, pdf):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto('file://' + html, wait_until='networkidle')
        await pg.evaluate('document.fonts.ready')
        over = await pg.evaluate(OVERFLOW_JS)
        await pg.pdf(path=pdf, format='A4', print_background=True, prefer_css_page_size=True)
        await b.close()
        return over


def main(web):
    sys.path.insert(0, ROOT)
    import build
    tmp = tempfile.mkdtemp(prefix='gids-')
    built, problems = {}, []
    for lang, (repo_name, web_name) in LANGS.items():
        html, _ = build.build(lang)
        pdf = os.path.join(tmp, repo_name)
        over = asyncio.run(render(html, pdf))
        print(lang, 'OVERFLOW', over)
        if over:
            problems.append(f'{lang}: {over}')
        built[lang] = pdf
    if problems:
        print('STOP: tekst loopt over de pagina. Niets gepubliceerd.\n' + '\n'.join(problems))
        sys.exit(2)
    os.makedirs(os.path.join(web, 'img', 'gids'), exist_ok=True)
    for lang, (repo_name, web_name) in LANGS.items():
        pdf = built[lang]
        dsts = [os.path.join(web, 'downloads', web_name)]
        if os.path.isdir(os.path.join(ROOT, 'pdf')):
            dsts.append(os.path.join(ROOT, 'pdf', repo_name))
        for dst in dsts:
            if os.path.exists(dst):
                os.remove(dst)  # oude versie weg
            with open(pdf, 'rb') as s, open(dst, 'wb') as d:
                d.write(s.read())
        for n in FAN:
            prefix = os.path.join(tmp, f'fan_{lang}_{n}')
            subprocess.run(['pdftoppm', '-f', str(n), '-l', str(n), '-r', '80', '-png', '-singlefile', pdf, prefix], check=True)
            im = Image.open(prefix + '.png').convert('RGB')
            w = 440
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(os.path.join(web, 'img', 'gids', f'{lang}-{n}.webp'), 'WEBP', quality=82)
        print(lang, 'gepubliceerd ->', web_name)
    for f in glob.glob(os.path.join(ROOT, 'gids_*.html')):
        os.remove(f)
    print('KLAAR')


if __name__ == '__main__':
    main(os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..')))
