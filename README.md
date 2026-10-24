# Grupo Soltura — nieuwe website (proof of concept)

Site voor GitHub Pages: `index.html`, `css/site.css` + `css/fonts.css` (lettertypen zelf gehost in `fonts/`), `js/routes.js` (URL-schema), `js/i18n.js`, `js/pages.js` (teksten Kopen/Verkopen/Emigreren/Privacy, NL+EN), `js/app.js`, `js/resolve.js` (doorverwijzingen).

## URL's, build en SEO (sinds 19-10-2026)
Elke pagina heeft een echte URL per taal; Google krijgt bij het eerste verzoek volledige HTML, daarna neemt de app het over.

| Pagina | EN | NL |
|---|---|---|
| Home | `/en/` (en `/`, canonical `/en/`) | `/nl/` |
| Kopen / Verkopen / Emigreren | `/en/buying/` · `/en/selling/` · `/en/move-to-spain/` | `/nl/kopen/` · `/nl/verkopen/` · `/nl/emigreren/` |
| Woonplaatsen | `/en/areas/` · `/en/living-in/<slug>/` | `/nl/woonplaatsen/` · `/nl/wonen-in/<slug>/` |
| Woning | `/en/property/<ref>-<soort>-<plaats>/` | `/nl/woning/<ref>-<soort>-<plaats>/` |
| Nieuws | `/en/news/` · `/en/news/<slug>/` | `/nl/nieuws/` · `/nl/nieuws/<slug>/` |
| Contact, privacy, favorieten | `/en/contact/` · `/en/privacy/` · `/en/favorites/` (noindex) | `/nl/contact/` · `/nl/privacy/` · `/nl/favorieten/` (noindex) |

- **Woning-URL:** de referentie (eerste deel) is de sleutel; het leesbare deel mag veranderen. Een afwijkend leesbaar deel gaat met een 301 (Worker) of in de app naar de canonieke vorm. Een woning opent nog steeds als sheet over de lijst, maar met een eigen URL (`pushState`); sluiten = terug.
- **Taal** komt uit het pad. De taalwissel gaat naar de tegenhanger-URL (nieuws via `group_id`, anders het nieuwsoverzicht). Op `/` gaat wie Nederlands koos (of een Nederlandse browser heeft) naar `/nl/`; crawlers krijgen geen taal-redirect.
- **Oude links blijven werken:** `#/home/RH550`, `/?lang=nl#/area/rojales`, `#/favorites?add=...` (FavoritesMail), `?test=1` worden bij binnenkomst omgezet naar het echte pad. Oude WordPress-paden en verouderde nieuwe paden: `js/resolve.js` (in `404.html` client-side, in de Worker als 301). Verdwenen woning -> 301 naar de woonplaatsgids van die plaats, anders het aanbod.
- **Build:** `node scripts/build.mjs` (Node 20, geen dependencies) leest `web_properties`, `web_town_guides`, `web_blog_posts` met de publieke sleutel en schrijft `dist/`: per URL een `index.html` met inhoud, unieke title/description, canonical, hreflang (nl/en/x-default), Open Graph en JSON-LD (`RealEstateAgent`, `BreadcrumbList`, `Place`, `RealEstateListing`+`Offer`, `NewsArticle`; geen `FAQPage`), `sitemap.xml` (index) + `sitemap-pages/areas/homes/news.xml`, `routes.json` (referentie -> URL, verdwenen woningen -> gids, plaatsnaam -> gids) en `404.html` (de app in site-layout, noindex). Lokaal testen zonder netwerk: `--offline data.json` met `{props, guides, posts}`.
- **Faalveiligheid:** Supabase-fout of minder dan 50% van de woningen van de vorige build (`/routes.json` live) -> de build breekt af, er wordt niets gepubliceerd, Brevo-mail naar Rick (secret `BREVO_API_KEY`). Verdwenen woningen worden onthouden via de vorige `routes.json`.
- **Deploy** (`.github/workflows/pages.yml`): bij push op `main`, elke nacht 01:30 UTC, en via `repository_dispatch` type `content-changed` (vanuit n8n bij publicatie of statuswijziging van een woning).
- **Cloudflare Worker:** `worker/worker.js` wordt gemaakt met `node scripts/make-worker.mjs` (template + `js/routes.js` + `js/resolve.js`) en met de hand geplakt in `gruposoltura-legacy`. Na elke wijziging aan `routes.js`/`resolve.js` opnieuw genereren en plakken.
- **Meting:** GA4 `page_path` = het echte pad; `web_events` en de eventnamen zijn ongewijzigd. Formulieren sturen `page_url` met het echte pad mee.

## Live bezoekers (sinds 24-10-2026)
Echte aantallen uit `web_events`, via edge function `web-live` (cache 60 s, alleen getallen naar de bezoeker; ruwe telling `web_live_counts()` is alleen voor service_role). Onder de drempel toont de site niets.
- **Homepage** (subtiel, onder "woningen nu online"): unieke bezoekers laatste 30 min, vanaf 8.
- **Woningpagina** (gele balk onder de prijs): unieke bezoekers die de woning de laatste 7 dagen bekeken, vanaf 5; plus "X kijken er nu naar" als er minstens 2 *anderen* in de laatste 15 min op die woning zitten (laatste event, geen `dwell`).
- Ververst elke minuut zolang het tabblad zichtbaar is.
- **Team en bots tellen niet mee**: kolom `web_events.flag` (`team`/`bot`). Teamapparaat markeren: eenmalig `https://gruposoltura.com/?team=1` openen (per browser; `?team=0` zet het uit). Bots: user-agent/webdriver.
- **`sid` is sinds 24-10-2026 per tabblad-sessie** (sessionStorage) i.p.v. per paginalading; tellingen per sid van voor die datum zijn paginaladingen.

## Woningpagina: aanvragen (sinds 24-10-2026)
Doel: meer aanvragen, rustiger pagina (besluiten Rick 24-10-2026).
- **Snelknoppen** onder de prijs: bij een beschikbare woning *Stuur me de brochure + kosten* (nieuwbouw: *Stuur me het kostenoverzicht*) + *Plan bezichtiging*; gereserveerd: *Laat me weten als hij terugkomt* + *Vraag het ons*.
- **Brochureblok** bovenaan de rechterkolom (`#sendBox`, `sendHtml`/`bindSend`), bij elke beschikbare woning: aanvinken **Brochure (PDF)** (alleen `broOk`, dus geen nieuwbouw) en/of **Kostenoverzicht (PDF)**, met drie ja/nee-vragen (NIE, Spaanse hypotheek, volmacht). Voornaam, achternaam, e-mail.
  **Eén aanvraag**: `web-contact` kind `brochure` met `fields.docs` (`brochure`/`costs`), `fields.nie/mortgage/power_of_attorney` en `browser_lang` -> WebFormIntake-v2 (geeft `docs`, `cost_answers`, `browser_lang`, `contact_created` door) -> LeadProcessor-v2 (type `pdfbrochure`).
- **LeadProcessor-v2** (sinds 24-10-2026): `Get Contact Language (brochure)` -> `Resolve Brochure Language` -> `Get Brochure Data` -> `Build brochure HTML` (alleen de woningbrochure) -> `Brochure PDF?` -> PDFShift -> `Collect PDFs` -> `Build Brochure Mail` -> Brevo. **Eén vaste mail** (geen AI-tekst): de woningbrochure als **bijlage**, het kostenoverzicht als **downloadknop** naar het statische PDF; verder alleen reclame voor de koopgids, met een blauwe knop met Sola (`img/email/sola-guide-<taal>.png`, naar de gidspagina; de gids is alleen via Sola op te vragen).
  - **Taal** (mail en PDF's): bestond het contact al vóór de aanvraag, dan de voorkeurstaal van het contact; anders de browsertaal. Ondersteund NL/EN/ES/SV, anders EN. (Het contact zelf blijft de taal van het formulier houden; Zweedse site = EN, zie Zweeds.)
  - **Kostenoverzicht** = **statisch document** per taal, net als de koopgids: `downloads/soltura-kostenoverzicht-2026-nl.pdf`, `soltura-cost-overview-2026-en.pdf`, `soltura-resumen-de-gastos-2026-es.pdf`, `soltura-kostnadsoversikt-2026-sv.pdf`. Wordt **niet** per aanvraag gemaakt. Inhoud: soorten bijkomende kosten en waarom, **zonder eigen bedragen** (concurrentie), alleen de wettelijke belastingpercentages. Bron: `brochure-src/costs.js` (generieke modus, zonder woning); na een wijziging de vier PDF's opnieuw renderen en hier vervangen (de bestandsnaam blijft, de mail linkt ernaar).
  - **Woningbrochure** = per aanvraag (bijlage, PDFShift). Bron `brochure-src/brochure.js`, 1-op-1 in de Code-node *Build brochure HTML*. Nieuwbouw krijgt geen woningbrochure; alleen kosten = geen PDFShift, alleen de mail met de link.
  - **Leadcard** voor de makelaar: wat er verstuurd is, de antwoorden NIE/hypotheek/volmacht en de opdracht om binnen een dag de **specifieke kosten** te bespreken.
- **Koopgids** staat niet op de woning (alleen gidspagina en Sola).
- **Kostenblok**: prijs + belasting, all-in-uitleg, knop *Stuur me het kostenoverzicht* (opent het brochureblok) en WhatsApp.
- **Sola**: één plek (chatblok) met een vaste chip naar het brochureblok.
- **Marktvergelijking** alleen t/m **+5%** (`MARKET_SHOW_MAX`).
- **Mobiel (≤900px)**: vaste balk onderin met *WhatsApp* + *Brochure* (nieuwbouw: *Kosten*; gereserveerd: *Hou me op de hoogte*).

## Uitgangspunten
- **De woning is de hoofdzaak.** Hero is kort; het aanbod staat direct eronder. Een woning opent als sheet over de lijst (geen pagina-wissel), met vorige/volgende, vergelijkbare woningen en "meer in deze plaats" — zo blijft de bezoeker bladeren.
- **Zoeken in eigen woorden** (Claude zet de wens om in filters) en **vragen per woning** (Claude antwoordt alleen uit de woninggegevens, kosten altijd indicatief).
- **Schermvullend bladeren**: verticale swipe door het aanbod, zoals Reels.
- **Personalisatie zonder cookies van derden**: bekeken en bewaarde woningen (localStorage) sturen de volgorde "Voor jou gekozen".
- **Bewegend beeld**: drie sfeerclips (Higgsfield, eenmalig) alleen als decoratie op home/emigreren/verkopen; op hover scrubt een kaart door de foto's.
- Talen: EN + NL + SV (Zweeds sinds 19-10-2026).

## Data (Supabase `wuvpbwowdycsdlrqkaoq`) — sinds 18-10-2026 volledig op NEXUS core
Migratie: `nexus_core_011_site_views` (bron in het NEXUS-pakket `011_site_views.sql`). De site gebruikt de anon key; core-tabellen blijven dicht, de views draaien met `security_invoker=false`.

| Object | Rol |
|---|---|
| `web_properties` (view) | Live aanbod uit `core.properties` + `property_texts` + `property_media`: alleen `published` en status `available`/`under_offer`, alleen veilige velden (geen eigenaar, huisnummer, sleutels, notities, transacties/commissies). Coördinaten afgerond op ~100 m. Sleutel = `id` (core-uuid); `wp_id` alleen nog voor oude woningen. `image` = hoofdfoto, `photos` = galerij (Storage `property-media`, nooit wp-content), `photo_count`, `url_new`. |
| `web_property_geo` (view) | Afstand strand/vliegvelden per woning (kolom `id`). |
| `web_blog_posts` (view) | Eigen blog (`core.blog_posts`, gepubliceerd, niet verlopen, NL/EN). Nieuwspagina + detail `/en/news/<slug>/` · `/nl/nieuws/<slug>/`. Zolang de blog leeg is: koppen uit `web_news` als externe links. |
| `web_reviews` / `web_reviews_summary` (views) | Google-reviews (≥4 sterren, zonder naam) + score/aantal. |
| `web_config` | Tarieven (numeriek) en `site_base_url` (`value_text`, functie `nexus2_site_base_url()`): publieke basis-URL voor `url_new` en de partner-feed. Na de domeinwissel alleen deze waarde aanpassen. |
| `web_events` | Anonieme interactie-events (insert-only), met `wp_id` (oud) en `property_id` (uuid). |
| bucket `web-media` | Sfeervideo's en kantoorfoto. Logo via Cloudinary (`soltura/assets/brochure`). |

Edge functions: `web-assistant` (v9: woning op `id`/referentie), `web-contact` (v4: form_id, page_url, utm, losse velden, voor-/achternaam, property_id/reference → web_contact_requests → JARVIS WebFormIntake-v2 → core). `web-media-sync`/`web_media_cache` worden niet meer gebruikt.

Formuliervelden naar web-contact: `form_id` (viewForm/guideForm/buyForm/sellForm/moveForm/contactForm/nl-form), `page_url`, `utm` (utm_* uit de URL, per sessie bewaard), `lang`, `vid`, bij woningen `property_id` + `reference` (+ `wp_id` indien aanwezig); losse velden `budget`, `timing`, `area`, `property_type`, `topic`, `preferred_language`, `household`; nieuwsbrief `first_name`/`last_name` + `interests` (market_report, monthly_matches, price_reduced, weekly_news).

De site is domein-onafhankelijk (alle links via `location.origin`); hij draait zonder wijziging op gruposoltura.com.

## Favorieten mailen (sinds 18-10-2026)
Op `/en/favorites/` · `/nl/favorieten/` staat een zwevend paneel **"Stuur jezelf je favorieten"** (desktop open linksonder, mobiel als knop die openklapt). Voornaam, achternaam en e-mail (ook van iemand anders) -> `web-contact` v8 met `kind: 'favorites'`, `form_id: 'web-favorites-mail'`, `favorites` (referenties, max 30) en `browser_lang` (`navigator.language`).
- Keten: `web_contact_requests` -> JARVIS-Sales-WebFormIntake-v2 (contact + request `favorite` in core) -> **JARVIS-Sales-FavoritesMail** (`TjFGkuInnt7KRzcB`, webhook `jarvis-favorites-mail`): mail in de vaste klantmail-huisstijl via Brevo.
- Taal van de mail: opgeslagen taal als het e-mailadres een bekend contact is, anders de browsertaal (nl/en/es/de/fr), anders Engels.
- **Testmodus**: `/nl/favorieten/?test=1` (oud: `#/favorites?test=1`) -> de mail gaat alleen naar Rick (met testbanner), er wordt niets opgeslagen. Agent-breed: `DRY_RUN` in de Config-node.
- Link in de mail `#/favorites?add=REF1,REF2` (wordt omgezet naar `/en/favorites/?add=...`) zet de woningen (weer) bij de favorieten op het apparaat waarop de mail wordt geopend.
- Limiet: max 5 favorietenmails per e-mailadres per uur.

## Zweeds (sinds 19-10-2026)
Besluit Rick: de website is volledig Zweeds onder `/sv/` (taalkiezer met Zweedse vlag), maar **alle uitgaande communicatie blijft Engels**.
- **Paden:** `/sv/` · `/sv/kopa/` · `/sv/salja/` · `/sv/flytta-till-spanien/` · `/sv/orter/` · `/sv/bo-i/<slug>/` · `/sv/bostad/<ref>-<soort>-<plaats>/` · `/sv/nyheter/` · `/sv/kontakt/` · `/sv/integritet/` · `/sv/favoriter/` (noindex). hreflang `sv` in alle pagina's en sitemaps.
- **Teksten:** interface `I18N.sv` (`js/i18n.js` + aanvulling in `js/pages.js`), pagina's `PAGES.sv`. Berichten aan kantoor (WhatsApp-tekst, bezichtiging, kostenoverzicht) blijven Engels.
- **Woningen:** Engels is de brontaal; Nederlands en Zweeds worden op dezelfde manier vertaald (besluit 19-10-2026). Edge function `property-translate` (`lang` nl|sv, claude-sonnet-5-5), aangestuurd door n8n **JARVIS-Web-TranslateNL** (`LKcv0aWT4nPGs7Yk`, token `TranslateNL`) en **JARVIS-Web-TranslateSV** (`FIRu1fYTepDQVK1C`, token `TranslateSV`), elk elke 5 min, 10 per run. Wachtrij `nexus2_tr_queue(lang)`: vertaling ontbreekt of de Engelse tekst is nieuwer, pas nadat Agent SEO de Engelse tekst schreef (vangnet na 6 uur). Mislukt 3x: overgeslagen tot de Engelse tekst verandert (`translate_fail`). In `web_properties` als `body_sv`/`heading_sv`/`summary_sv` (NL: `body_nl`). Agent SEO schrijft alleen nog Engels.
- **Partnerimport** (`partner-feed-import` v6): schrijft en/es/de/fr (nl alleen als de feed geen Engels heeft) en overschrijft een tekst alleen als de feedtekst echt veranderd is (`core.property_texts.feed_hash`), zodat vertalingen en Agent SEO niet elke nacht opnieuw draaien.
- **Woonplaatsgidsen:** `core.town_guides` lang `sv` (16 plaatsen, zelfde slugs).
- **Nieuws:** geen Zweedse berichten; `/sv/nyheter/` toont de Engelse versie.
- **Assistent:** `web-assistant` v14 antwoordt in de taal van de bezoeker, terugval Zweeds op `/sv/`.
- **Communicatie Engels:** `web-contact` v9 zet `sv` om naar `en` (contacttaal en FavoritesMail); `nexus2_submit_form` maakt een contact van de Zweedse site aan met taal `en`. De sitetaal blijft zichtbaar in `payload.site_lang` en `page_url`.

## Pagina's
Woningen, Kopen, Verkopen, Emigreren, Woonplaatsen, Nieuws, Contact, Privacy (zie de URL-tabel hierboven). Team is opgegaan in Contact (`#/team` stuurt door). Onderaan elke pagina: Google-reviews, nieuwsbrief, socials, footer.

## Woonplaatsgidsen (sinds 18-10-2026)
- Tabel `core.town_guides` (één rij per plaats per taal: `slug`, `lang`, `town`, `aliases`, `title`, `lead`, `facts`, `sections`, `photos`, `sources`, `sort`, `status`, `review_notes`), view `web_town_guides` (alleen `published`, foto-URL erbij).
- Secties met vaste sleutels: housing, work, population, education, distances (tabel), shops, culture, festivals (tabel), health, outdoor, indoor. Tekst-HTML gaat door `sanitizeRich`.
- Een woning hoort bij een gids als `town` of `suburb` (zonder accenten) gelijk is aan de plaatsnaam of een alias (bv. Ciudad Quesada → Rojales). Het woningpaneel toont dan een link "Wonen in <plaats>"; de gids toont woningen uit die plaats.
- Foto's: Wikimedia Commons (alleen CC0/PD/CC BY/CC BY-SA), gekopieerd naar Storage `property-media/towns/<slug>/<n>.jpg` door edge function `town-photos` (bron `supabase/functions/town-photos`, sleutel in `public.fn_keys`), getoond via Image Transformations met naamsvermelding.
- Eerste inhoud: `supabase/seed/town_guides.json` (10 plaatsen, NL+EN). Wijzigen kan direct in `core.town_guides`; open punten per plaats in `review_notes`.

## Privacy / cookiekeuze
Zonder toestemming worden bezoeken anoniem per sessie geteld (niets opgeslagen op het apparaat). Met toestemming bewaart de browser een willekeurige bezoekerscode (`gs_vid`). Geen Google Fonts.

## Meting (sinds 18-10-2026)
- **Google Analytics 4** via de Google-tag `GT-T5MHQ45` (dezelfde als Site Kit op de oude WordPress; GA4-property 335774479). Consent Mode v2: standaard alles `denied` (cookieloze pings), `analytics_storage` wordt `granted` na 'Ja' in de cookiekeuze; advertentie-opslag blijft altijd `denied`. Cookiekeuze is geversioneerd (`gs_consent_v` = 2): wie vóór de GA-tekst koos, krijgt de vraag opnieuw.
- GA4 krijgt het echte pad (`/nl/woning/rh550-.../`) met eigen `page_view` (`send_page_view: false`); bij een woning komt de `page_view` met `view_item`. Eventkoppeling in `GA_MAP` (app.js): `view_item`, `generate_lead` (contact/koopgids), `sign_up` (nieuwsbrief), `search`, `add_to_wishlist`, `share`, `contact_whatsapp`, `contact_call`, …
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
