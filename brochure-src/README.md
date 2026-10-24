# Woningbrochure (PDF)

`brochure.js` is de bron van de PDF-brochure die JARVIS-Sales-LeadProcessor-v2 (n8n `280vYTcWJkBORRa8`) maakt
bij een brochure-aanvraag (type `pdfbrochure`). De functie staat 1-op-1 in de Code-node **Build brochure HTML**;
pas je hier iets aan, zet het daar ook neer (en andersom).

- Data: `rpc/brochure_data(p_ref)` (web_properties + web_property_geo + web_reviews_summary).
- Talen: nl, en, es (overige -> en). Huisstijl gelijk aan de woon- en koopgids (`gids-src/style.css`).
- Assets: `/img/brand/logo-square.png` en `/img/brand/logo-wide.png` op gruposoltura.com, fonts via Google Fonts.
- PDF: PDFShift (A4, marge 0).
