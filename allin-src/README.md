# Infotorial "Eén vast tarief / all-in fee"

Twee pagina's A4: welke werkzaamheden Grupo Soltura bij een aankoop regelt, voor één vast tarief.
Wordt als downloadknop meegestuurd in de purchase-info-mail (n8n JARVIS-Sales-NewsletterConfirm-v2, `infoByLang`).

| Taal | Bestand in `downloads/` | Bron |
|---|---|---|
| NL | `Alles-in-een-tarief.pdf` | origineel juni 2026 (was Cloudinary `Grupo-Soltura-Aankoopgids.pdf`) |
| EN | `All-in-one-fee.pdf` | origineel juni 2026 (was Cloudinary `Grupo-Soltura-Purchase-Guide.pdf`) |
| ES | `Tarifa-todo-incluido.pdf` | `build.py`, 26-10-2026 |
| SV | `Allt-i-ett-arvode.pdf` | `build.py`, 26-10-2026 |

`build.py` reproduceert de originele opmaak (zelfde fonts Liberation Sans/Serif, kop-afbeelding en vectoriconen uit het origineel,
posities binnen ~1 pt). Teksten staan in `content.py`; nl/en zijn letterlijk overgenomen, zodat alle vier de talen opnieuw te bouwen zijn:

    python allin-src/build.py downloads es sv      # alleen ES en SV
    python allin-src/build.py downloads            # alle vier (overschrijft de originele NL/EN)

`extract_icons.py` is eenmalig gebruikt om de iconen uit de EN-PDF te halen (`assets/`).
Hernoemd 26-10-2026 (Rick): voorheen Soltura-alles-in-een-tarief / Soltura-all-in-fee / Soltura-tarifa-todo-incluido / Soltura-allt-i-ett-arvode.
