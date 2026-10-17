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
| `web_media_cache` | WP-attachment-id → foto-URL voor galerijen. Gevuld voor alle live woningen (15.329 foto's, 17-10-2026); nieuwe woningen worden bij openen aangevuld via edge function `web-media-sync`. |
| `web_news` (view) | Nieuwskoppen uit `news_posts`. |
| `web_events` | Anonieme interactie-events (insert-only). `web_engagement_daily` telt woningen per sessie. |
| `web_assistant_log` | Vragen aan de assistent (IP alleen gehasht). |
| `web_contact_requests` | Contact/bezichtiging/waardebepaling. |
| bucket `web-media` | De drie sfeervideo's. |

Edge functions (bron van `web-assistant` in `supabase/functions/`): `web-assistant` (Claude Haiku), `web-contact` (opslaan + Brevo-mail, POC: naar rick@), `web-media-sync` (galerijfoto's), `web-gallery` (reserve).

Instelbare waarden (belastingtarieven, hypotheekrente, all-in tarief): tabel `web_config`.

## Bekende punten
- `property_distance_sea` staat bijna overal op 7000 (CPR-standaardwaarde) en wordt als onbekend behandeld.
- Marktvergelijking (`property_price_m2`) is gebaseerd op bestaande bouw; voor nieuwbouw wordt hij niet getoond.
- `web_properties` telt 507 woningen, de huidige site 448: verschil uitzoeken vóór migratie.
- De sfeervideo's zijn 13–21 MB; comprimeren naar ~3 MB vóór livegang.

## Migratieplan: punten vanuit de nieuwe site
- **`wp-content/uploads` kopiëren naar Supabase Storage, vóór WordPress uitgaat.** Alle woningfoto's (15.329 in `web_media_cache`), hoofdfoto's (`nexus_property_raw.image`) en het logo verwijzen nog naar `gruposoltura.com/wp-content/uploads/`. Zonder kopie vallen alle foto's op de nieuwe site weg. Daarna: URL's in `web_media_cache` en de hoofdfoto-bron omzetten naar de Storage-URL's (één update-query op het pad-deel).
- Logo naar eigen opslag (nu `wp-content/uploads/2020/06/Soltura-logo-345x120-1.png`).
- `web-media-sync` en de koppeling via JARVIS-Infra-WpProbe vervallen na de migratie; foto's worden dan direct in Supabase beheerd.
- Nieuwsbrief/contact van de nieuwe site schrijven nu alleen naar `web_contact_requests` (+ mail naar rick@); bij de migratie aansluiten op contacts/opt-ins en de bevestigingsmail.
