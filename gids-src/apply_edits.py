#!/usr/bin/env python3
"""Past de tekstwijzigingen van de agent GuideCheck toe op de gidsbestanden.

Invoer: omgevingsvariabele EDITS_B64 = base64(JSON)
  {"files": {"content_en.py": [{"old": "...", "new": "..."}], "content_nl.py": [...], ...}}
Elke "old" moet precies 1 keer in het bestand staan, anders stopt alles (niets gewijzigd).
Daarna wordt elk gewijzigd bestand gecompileerd en geimporteerd (PAGES en L moeten bestaan).
"""
import os, sys, json, base64, importlib

ROOT = os.path.dirname(os.path.abspath(__file__))
ALLOWED = {'content_en.py', 'content_nl.py', 'content_es.py', 'content_sv.py'}


def main():
    raw = os.environ.get('EDITS_B64', '').strip()
    if not raw:
        sys.exit('geen EDITS_B64')
    data = json.loads(base64.b64decode(raw).decode('utf-8'))
    files = data.get('files') or {}
    new_text, problems, count = {}, [], 0
    for name, edits in files.items():
        if name not in ALLOWED:
            problems.append(f'{name}: bestand niet toegestaan')
            continue
        path = os.path.join(ROOT, name)
        txt = open(path, encoding='utf-8').read()
        for i, e in enumerate(edits or []):
            old, new = str(e.get('old', '')), str(e.get('new', ''))
            n = txt.count(old) if old else 0
            if n != 1:
                problems.append(f'{name} wijziging {i + 1}: tekst {n}x gevonden (moet 1x): {old[:80]!r}')
                continue
            txt = txt.replace(old, new, 1)
            count += 1
        new_text[name] = txt
    if problems:
        print('STOP: ' + ' | '.join(problems))
        sys.exit(3)
    for name, txt in new_text.items():
        compile(txt, name, 'exec')
        open(os.path.join(ROOT, name), 'w', encoding='utf-8').write(txt)
    sys.path.insert(0, ROOT)
    for name in new_text:
        m = importlib.import_module(name[:-3])
        assert getattr(m, 'PAGES', None) and getattr(m, 'L', None), name + ': PAGES/L ontbreekt'
    print(f'OK: {count} wijziging(en) in {len(new_text)} bestand(en)')


if __name__ == '__main__':
    main()
