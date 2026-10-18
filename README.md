# Grupo Soltura — nieuwe website (proof of concept)

Statische site voor GitHub Pages. Geen build-stap: `index.html`, `css/site.css` + `css/fonts.css` (lettertypen zelf gehost in `fonts/`), `js/i18n.js`, `js/pages.js` (teksten Kopen/Verkopen/Emigreren/Privacy, NL+EN), `js/app.js`.

## Uitgangspunten
- **De woning is de hoofdzaak.** Hero is kort; het aanbod staat direct eronder. Een woning opent als sheet over de lijst (geen pagina-wissel), met vorige/volgende, vergelijkbare woningen en "meer in deze plaats" — zo blijft de bezoeker bladeren.
- **Zoeken in eigen woorden** (Claude zet de wens om in filters) en **vragen per woning** (Claude antwoordt alleen uit de woninggegevens, kosten altijd indicatief).
- **Schermvullend bladeren**: verticale swipe door het aanbod, zoals Reels.
- **Personalisatie zonder cookies van derden**: bekeken en bewaarde woningen (localStorage) sturen de volgorde "Voor jou gekozen".
- **Bewegend beeld**: drie sfeerclips (Higgsfield, eenmalig) alleen als decoratie op home/emigreren/verkopen; op hover scrubt een kaart door de foto's.
- Talen: EN + NL.

## Data (Supabase `wuvpbwowdycsdlrqkaoq`) — sinds 18-10-2026 volledig op NEXUS core
Migratie: `nexus_core_011_site_views` (bron in het NEXUS-pakket `011_site_views.sql`). De site gebruikt de anon key; core-tabellen blijven dicht, de views draaien met `security_invoker=false`.

| Object | Rol |
|---|---|
| `web_properties` (view) | Live aanbod uit `core.properties` + `property_texts` + `property_media`: alleen `published` en status `available`/`under_offer`, alleen veilige velden (geen eigenaar, huisnummer, sleutels, notities, transacties/commissies). Coördinaten afgerond op ~100 m. Sleutel = `id` (core-uuid); `wp_id` alleen nog voor oude woningen. `image` = hoofdfoto, `photos` = galerij (Storage `property-media`, nooit wp-content), `photo_count`, `url_new`. |
| `web_property_geo` (view) | Afstand strand/vliegvelden per woning (kolom `id`). |
| `web_blog_posts` (view) | Eigen blog (`core.blog_posts`, gepubliceerd, niet verlopen, NL/EN). Nieuwspagina + detail `#/news/<slug>`. Zolang de blog leeg is: koppen uit `web_news` als externe links. |
| `web_reviews` / `web_reviews_summary` (views) | Google-reviews (≥4 sterren, zonder naam) + score/aantal. |
| `web_config` | Tarieven (numeriek) en `site_base_url` (`value_text`, functie `nexus2_site_base_url()`): publieke basis-URL voor `url_new` en de partner-feed. Na de domeinwissel alleen deze waarde aanpassen. |
| `web_events` | Anonieme interactie-events (insert-only), met `wp_id` (oud) en `property_id` (uuid). |
| bucket `web-media` | Sfeervideo's en kantoorfoto. Logo via Cloudinary (`soltura/assets/brochure`). |

Edge functions: `web-assistant` (v9: woning op `id`/referentie), `web-contact` (v4: form_id, page_url, utm, losse velden, voor-/achternaam, property_id/reference → web_contact_requests → JARVIS WebFormIntake-v2 → core). `web-media-sync`/`web_media_cache` worden niet meer gebruikt.

Formuliervelden naar web-contact: `form_id` (viewForm/guideForm/buyForm/sellForm/moveForm/contactForm/nl-form), `page_url`, `utm` (utm_* uit de URL, per sessie bewaard), `lang`, `vid`, bij woningen `property_id` + `reference` (+ `wp_id` indien aanwezig); losse velden `budget`, `timing`, `area`, `property_type`, `topic`, `preferred_language`, `household`; nieuwsbrief `first_name`/`last_name` + `interests` (market_report, monthly_matches, price_reduced, weekly_news).

De site is domein-onafhankelijk (alle links via `location.origin`); hij draait zonder wijziging op gruposoltura.com.

## Favorieten mailen (sinds 18-10-2026)
Op `#/favorites` staat een zwevend paneel **"Stuur jezelf je favorieten"** (desktop open linksonder, mobiel als knop die openklapt). Voornaam, achternaam en e-mail (ook van iemand anders) -> `web-contact` v8 met `kind: 'favorites'`, `form_id: 'web-favorites-mail'`, `favorites` (referenties, max 30) en `browser_lang` (`navigator.language`).
- Keten: `web_contact_requests` -> JARVIS-Sales-WebFormIntake-v2 (contact + request `favorite` in core) -> **JARVIS-Sales-FavoritesMail** (`TjFGkuInnt7KRzcB`, webhook `jarvis-favorites-mail`): mail in de vaste klantmail-huisstijl via Brevo.
- Taal van de mail: opgeslagen taal als het e-mailadres een bekend contact is, anders de browsertaal (nl/en/es/de/fr), anders Engels.
- **Testmodus**: `#/favorites?test=1` -> de mail gaat alleen naar Rick (met testbanner), er wordt niets opgeslagen. Agent-breed: `DRY_RUN` in de Config-node.
- Link in de mail `#/favorites?add=REF1,REF2` zet de woningen (weer) bij de favorieten op het apparaat waarop de mail wordt geopend.
- Limiet: max 5 favorietenmails per e-mailadres per uur.

## Pagina's
Woningen, Kopen, Verkopen, Emigreren, Nieuws, Contact, Privacy (`#/privacy`). Team is opgegaan in Contact (`#/team` stuurt door). Onderaan elke pagina: Google-reviews, nieuwsbrief, socials, footer.

## Privacy / cookiekeuze
Zonder toestemming worden bezoeken anoniem per sessie geteld (niets opgeslagen op het apparaat). Met toestemming bewaart de browser een willekeurige bezoekerscode (`gs_vid`). Geen Google Fonts.

## Meting (sinds 18-10-2026)
- **Google Analytics 4** via de Google-tag `GT-T5MHQ45` (dezelfde als Site Kit op de oude WordPress; GA4-property 335774479). Consent Mode v2: standaard alles `denied` (cookieloze pings), `analytics_storage` wordt `granted` na 'Ja' in de cookiekeuze; advertentie-opslag blijft altijd `denied`. Cookiekeuze is geversioneerd (`gs_consent_v` = 2): wie vóór de GA-tekst koos, krijgt de vraag opnieuw.
- Hash-routes worden als pad naar GA4 gestuurd (`#/home/RH550` -> `/home/RH550`), met eigen `page_view` (`send_page_view: false`). Eventkoppeling in `GA_MAP` (app.js): `view_item`, `generate_lead` (contact/koopgids), `sign_up` (nieuwsbrief), `search`, `add_to_wishlist`, `share`, `contact_whatsapp`, `contact_call`, …
- **Meta Pixel** `1362466522519143`: alleen geladen na marketing-toestemming (cookiekeuze v3: Noodzakelijk / Statistiek / Marketing; `gs_consent_ads`). Zonder die toestemming gaat er geen enkel verzoek naar Meta. Events: PageView (per route), ViewContent (`content_type: home_listing`, `content_ids` = referentie), Lead (contact, koopgids), CompleteRegistration (nieuwsbrief), Search, AddToWishlist, Contact (WhatsApp/bellen). Intrekken = `fbq('consent','revoke')` + _fbp/_fbc gewist. Google ad_*-consent volgt dezelfde marketingkeuze.
- **Eigen meting** blijft: `web_events` -> views `bridge_site_daily` / `bridge_site_top_properties` (Bridge kpi.html) en RPC `nexus_property_web_stats` (NEXUS woning). Terugkerende bezoekers = bezoekerscode (`vid`) die op een eerdere dag al gezien is.

## Bekende punten
- Privacytekst is een concept en moet juridisch worden nagelezen; e-mailadres info@gruposoltura.com aangenomen.
- `property_distance_sea` staat bijna overal op 7000 (CPR-standaardwaarde) en wordt als onbekend behandeld.
- Marktvergelijking (`property_price_m2`) is gebaseerd op bestaande bouw; voor nieuwbouw wordt hij niet getoond.
- `web_properties` telt 518 woningen (18-10-2026: gepubliceerd + beschikbaar/onder bod in core).
- De sfeervideo's zijn 13–21 MB; comprimeren naar ~3 MB vóór livegang.

## Migratieplan: punten vanuit de nieuwe site
Afgerond 18-10-2026: woningen, foto's (Storage), nieuws (eigen blog) en formulieren lopen via core. Logo en favicon staan niet meer op wp-content.
