# Grupo Soltura — nieuwe website (proof of concept)

Statische site voor GitHub Pages. Geen build-stap: `index.html`, `css/site.css`, `js/i18n.js`, `js/app.js`.

## Uitgangspunten
- **De woning is de hoofdzaak.** Hero is kort; het aanbod staat direct eronder. Een woning opent als sheet over de lijst (geen pagina-wissel), met vorige/volgende, vergelijkbare woningen en "meer in deze plaats" — zo blijft de bezoeker bladeren.
- **Zoeken in eigen woorden** (Claude zet de wens om in filters) en **vragen per woning** (Claude antwoordt alleen uit de woninggegevens, kosten altijd indicatief).
- **Schermvullend bladeren**: verticale swipe door het aanbod, zoals Reels.
- **Personalisatie zonder cookies van derden**: bekeken en bewaarde woningen (localStorage) sturen de volgorde "Voor jou gekozen".
- **Bewegend beeld**: drie sfeerclips (Higgsfield, eenmalig) alleen als decoratie op home/emigreren/verkopen; op hover scrubt een kaart door de foto's.
- Talen: EN + NL.

## Data (Supabase `wuvpbwowdycsdlrqkaoq`)
| Object | Rol |
|---|---|
| `web_properties` (view) | Live aanbod, alleen veilige velden (geen eigenaar, huisnummer, sleutels, interne notities). Coördinaten afgerond op ~100 m. |
| `web_media_cache` | WP-attachment-id → foto-URL voor galerijen. Nu gevuld voor ~45 woningen; de rest toont de hoofdfoto. |
| `web_news` (view) | Nieuwskoppen uit `news_posts`. |
| `web_events` | Anonieme interactie-events (insert-only). `web_engagement_daily` telt woningen per sessie. |
| `web_assistant_log` | Vragen aan de assistent (IP alleen gehasht). |
| `web_contact_requests` | Contact/bezichtiging/waardebepaling. |
| bucket `web-media` | De drie sfeervideo's. |

Edge functions (bron van `web-assistant` in `supabase/functions/`): `web-assistant` (Claude Haiku), `web-contact` (opslaan + Brevo-mail, POC: naar rick@), `web-gallery` (reserve).

## Bekende punten
- Galerij-URL's staan niet in Supabase; de publieke WP media-API geeft niets terug. Volledige sync hoort bij de migratie (n8n-agent of tijdens export).
- `property_distance_sea` staat bijna overal op 7000 (CPR-standaardwaarde) en wordt als onbekend behandeld.
- Marktvergelijking (`property_price_m2`) is gebaseerd op bestaande bouw; voor nieuwbouw wordt hij niet getoond.
- `web_properties` telt 507 woningen, de huidige site 448: verschil uitzoeken vóór migratie.
- De sfeervideo's zijn 13–21 MB; comprimeren naar ~3 MB vóór livegang.
