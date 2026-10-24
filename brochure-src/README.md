# Woningbrochure (PDF)

`brochure.js` is de bron van de PDF-brochure die JARVIS-Sales-LeadProcessor-v2 (n8n `280vYTcWJkBORRa8`) maakt
bij een brochure-aanvraag (type `pdfbrochure`). De functie staat 1-op-1 in de Code-node **Build brochure HTML**;
pas je hier iets aan, zet het daar ook neer (en andersom).

- Data: `rpc/brochure_data(p_ref)` (web_properties + web_property_geo + web_reviews_summary).
- Talen: nl, en, es, sv (overige -> en). Huisstijl gelijk aan de woon- en koopgids (`gids-src/style.css`).
- Assets: `/img/brand/logo-square.png` en `/img/brand/logo-wide.png` op gruposoltura.com, fonts via Google Fonts.
- PDF: PDFShift (A4, marge 0).

# Kostenoverzicht (statisch PDF)

`costs.js` is de bron van het kostenoverzicht. Dat is een **statisch** document per taal in `/downloads/`
(nl, en, es, sv), net als de koopgids; de brochuremail geeft er een downloadknop naar. Het wordt niet per aanvraag
gemaakt. Aanpassen: `buildCosts({ p: {}, cfg }, taal, assets)` (generieke modus) lokaal renderen naar PDF en de vier
bestanden in `/downloads/` vervangen onder dezelfde naam.
