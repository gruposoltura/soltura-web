# Infotorial "Verkoopbegeleiding / Seller guidance"

Twee pagina's A4: wat Grupo Soltura bij een verkoop regelt, courtage alleen bij verkoop.
Wordt als downloadknop meegestuurd door de documentverzender (n8n JARVIS-Sales-DocumentSender, kind `seller_guide`, `sellerByLang`).

| Taal | Bestand in `downloads/` | Bron |
|---|---|---|
| NL | `Soltura-verkoopbegeleiding.pdf` | origineel (was Cloudinary `Soltura-Verkoopbegeleiding-Infotorial_NL.pdf`) |
| EN | `Soltura-seller-guidance.pdf` | origineel (was Cloudinary `Soltura-Verkoopbegeleiding-Infotorial_EN.pdf`) |
| ES | `Soltura-acompanamiento-en-la-venta.pdf` | `build.py`, 26-10-2026 |
| SV | `Soltura-saljradgivning.pdf` | `build.py`, 26-10-2026 |

`build.py` reproduceert de originele opmaak (fonts Liberation Sans/Serif, kop-afbeelding, vectoriconen uit het origineel;
regelposities binnen ~1 pt, zelfde regelafbrekingen in NL en EN). Teksten in `content.py`; nl/en letterlijk overgenomen.

    python seller-src/build.py downloads es sv      # alleen ES en SV
    python seller-src/build.py downloads            # alle vier (overschrijft de originele NL/EN)

`extract_icons.py` is eenmalig gebruikt om de iconen uit de EN-PDF te halen (`assets/`).
