# Woon- en koopgids: bron en maandelijkse controle (agent GuideCheck)

Deze map is de bron van de gids (NL, EN, ES, SV). `content_en.py` is leidend; `content_nl.py`,
`content_es.py` en `content_sv.py` zijn vertalingen met dezelfde opbouw. Wordt niet op de site
gepubliceerd (staat in de skiplijst van `scripts/build.mjs`); alleen de PDF's in `downloads/` en de
waaierbeelden in `img/gids/` zijn live.

## Handmatig bouwen
```
pip install playwright qrcode pillow   # + poppler-utils
python3 gids-src/publish.py            # bouwt alle 4, stopt bij overgelopen tekst, vervangt downloads/*.pdf en img/gids/*.webp
```
Bestandsnamen van de PDF's nooit wijzigen: de links staan in mails en op de site.

## Maandelijkse controle (volledig automatisch, los van Claude-sessies)
1. **n8n `JARVIS-Research-GuideCheck`** draait elke 1e van de maand om 06:37 (Madrid).
   Haalt de vier bestanden op (raw.githubusercontent.com), plus Ava's kennis (`web_guide_knowledge`)
   en `web_config`, en laat Claude met webzoeken de feiten controleren (belastingen ITP/IVA/AJD,
   hypotheek, Modelo 210, verhuurregels, plusvalía/retención, NIE/padrón/residencia, zorg,
   huisdieren, Soltura-gegevens). Alleen exact toepasbare, onderbouwde wijzigingen blijven over.
2. **Geen wijziging**: log in `jarvis_runs` (GuideCheck), `checked_on` bijgewerkt, geen Telegram.
3. **Wel wijziging**: Claude vertaalt dezelfde correctie naar NL/ES/SV; n8n start
   `.github/workflows/guide-update.yml` met de wijzigingen. Die past ze toe (`apply_edits.py`,
   alles of niets), bouwt alle vier de PDF's opnieuw (`publish.py`), vervangt de oude, ververst
   de waaier, verhoogt de cacheversie in `sw.js`, commit, start de site-deploy en meldt terug op
   webhook `jarvis-guide-check`. n8n logt dat en stuurt **dan pas** Telegram aan Rick.
   Mislukt de build, dan wordt er niets gepubliceerd en logt n8n een fout (geen Telegram).
4. Ava's kennisrijen en tarieven in `web_config` worden in dezelfde run bijgewerkt.
