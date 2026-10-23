import graphics as G

BASE = 'https://gruposoltura.com'
LINKS = {
    'home': BASE + '/nl/', 'buy': BASE + '/nl/kopen/', 'move': BASE + '/nl/emigreren/',
    'costs': BASE + '/nl/emigreren/maandlasten/', 'areas': BASE + '/nl/woonplaatsen/',
    'contact': BASE + '/nl/contact/', 'sell': BASE + '/nl/verkopen/',
    'town': BASE + '/nl/wonen-in/{}/',
    'reviews': 'https://search.google.com/local/reviews?placeid=ChIJWa-hMmmvYw0R4qKf5TapVp4',
    'maps': 'https://www.google.com/maps/search/?api=1&query=Grupo%20Soltura&query_place_id=ChIJWa-hMmmvYw0R4qKf5TapVp4',
    'wa': 'https://wa.me/34664414515',
}
T = lambda s: LINKS['town'].format(s)

L = {
    'guide_title': 'Thuis aan de Costa Blanca',
    'part': 'Deel',
    'saltlake': 'zoutmeren', 'sea': 'Middellandse Zee', 'river': 'rivier de Segura',
    'office': 'ons kantoor', 'alc': 'Luchthaven Alicante · ca. 30 min', 'rmu': 'Luchthaven Murcia · ca. 45-60 min',
    'months': ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    'layers': [('1 · De koopprijs', 'Wat je met de verkoper afspreekt', G.RED, 1.0),
               ('2 · Aankoopkosten', 'Belasting, notaris, register: ca. 10-13% + begeleiding', G.CORAL, .78),
               ('3 · Jaarlijkse kosten', 'IBI, gemeenschap, verzekering, nuts, belasting', G.LEMON, .56)],
    'proc': [('Oriëntatie', 'weken-maanden'), ('Bezichtigings-|reis', '2-4 dagen'), ('Bod', '1-3 dagen'),
             ('Reservering', 'direct'), ('Koop-|contract', '1-3 weken'), ('Controles', '2-6 weken'),
             ('Notaris', '1 dag'), ('Sleutels &|nazorg', 'maanden')],
    'dt_q': 'Wat wil je met je woning in Spanje?',
    'dt_opts': [('Vakantie-|woning', 'eigen gebruik'), ('Over-|winteren', '3-6 maanden'), ('Emigreren', 'met je gezin'),
                ('Pensioen', 'hier wonen'), ('Verhuren', 'rendement')],
}

def tc(name, slug, photo, txt, sea, apt, who):
    return {'t': name, 'img': photo, 'x': f'{txt}<div style="margin-top:1.6mm;font-size:7.6pt;color:#2E3B42"><b>Zee</b> {sea} · <b>Luchthaven</b> {apt}</div>'
            f'<div style="margin-top:1mm;font-size:7.6pt;color:#C63232;font-weight:700">Voor wie: {who}</div>', 'tag': slug}

PAGES = [
# ------------------------------------------------------------------ COVER
{'kind': 'cover', 'img': 'ai-01-cover.jpg', 'kicker': 'Woon- & koopgids 2026',
 'title': 'Thuis aan de<br>Costa Blanca',
 'sub': 'Alles wat je wilt weten voordat je een woning koopt in de Vega Baja en aan de Costa Blanca Zuid, en wat er komt kijken als je er gaat wonen.',
 'edition': 'Soltura Real Estate · sinds 2002'},

# ------------------------------------------------------------------ WELKOM
{'kind': 'page', 'label': 'Welkom', 'blocks': [
  ('cols', [[
    ('div',) and ('html', '<div class="kicker">Een woord vooraf</div>'),
    ('h2', 'Welkom in je <em>nieuwe</em> achtertuin'),
    ('lead', 'Fijn dat je deze gids hebt opgevraagd. Dat je hem leest, betekent waarschijnlijk dat je droom over een huis in de zon concreter begint te worden.'),
    ('p', 'Sinds 2002 helpen wij mensen een thuis te vinden in de Vega Baja: het groene achterland van de Costa Blanca Zuid, tussen de rivier de Segura, de zoutmeren en de zee. In die jaren zagen we de koper veranderen. Waar vroeger vooral vakantiehuizen werden gekocht, komen nu steeds vaker gezinnen die hier een nieuw leven opbouwen, mensen die op afstand werken en gepensioneerden die de winter willen ruilen voor licht.'),
    ('p', 'Wat niet veranderde: kopen in Spanje werkt anders dan thuis. Andere procedures, andere belastingen, andere valkuilen. Deze gids zet alles op een rij, eerlijk en zonder verkooppraatje. Je leest wat het echt kost, welke vragen je jezelf vooraf moet stellen, hoe het aankoopproces verloopt en wat er ná de sleutels komt.'),
    ('p', 'Veel mensen komen tegenwoordig binnen met een lijstje dat ze met AI hebben gemaakt. Prima, daar beginnen we graag mee. Maar de vragen die het verschil maken, staan zelden op dat lijstje. Die vind je hier. Ook wij zetten AI in, in al onze online uitingen, zodat je vooraf beter en vollediger geïnformeerd bent.'),
    ('p', 'Heb je na het lezen vragen? Bel, app of loop binnen in Formentera del Segura. De koffie staat klaar.'),
    ('html', '<div class="sig">Rick van Hoeven</div><p class="small" style="margin-top:1mm">Medeoprichter, Soltura Real Estate</p>'),
  ], [
    ('img', 'office-crop.jpg', 60, 'Ons kantoor in Formentera del Segura.'),
    ('quote', 'Wat Rick bijzonder maakt, is dat hij alleen praat over zaken waar hij écht verstand van heeft.', 'Google-review, oktober 2026'),
    ('panel',) and ('html', '<div class="panel lemon"><div class="kicker" style="margin-bottom:1mm">In deze gids</div><p style="margin:0">7 delen · checklists om af te vinken · rekenvoorbeelden · QR-codes naar onze website</p></div>'),
  ]], '1.25fr 1fr'),
]},

# ------------------------------------------------------------------ OVER ONS
{'kind': 'page', 'label': 'Over Soltura Real Estate', 'band': 'town-torrevieja-3.jpg', 'band_h': 32, 'band_pos': 'center 60%', 'hero': 'ai-09-aerial.jpg', 'hero_h': 78, 'hero_pos': 'center 60%', 'blocks': [
  ('sp', 72),
  ('h2', 'Lokale experts, <em>altijd een stap vooruit</em>'),
  ('stats', [('2002', 'actief in de Vega Baja'), ('4,7★', 'gemiddeld op Google'), ('4', 'talen: NL · EN · DE · ES'), ('AI', 'in al onze online kanalen')]),
  ('cols', [[
    ('h3', 'Wie we zijn'),
    ('p', 'Soltura Real Estate is een makelaarskantoor met een fysiek kantoor in Formentera del Segura, midden in ons werkgebied. Rojales, Ciudad Quesada, Benijófar, Guardamar, Torrevieja, Orihuela Costa en de dorpen ertussen kennen we straat voor straat.'),
    ('p', 'We zijn ingeschreven in het Valenciaanse makelaarsregister (RAICV 5781), lid nr. 992 van het API-college van Alicante, aangesloten bij GIPE en de AIPP.'),
  ], [
    ('h3', 'Pionieren, nu met AI'),
    ('p', 'We waren bij de eersten met dronebeelden, een eigen app en woninginformatie per sms, lang voor iedereen een smartphone had. Nu zetten we AI in, in al onze online uitingen. Op onze website zoek je in je eigen woorden en stel je over elke woning je vragen, dag en nacht. Het antwoord komt uit de echte woninggegevens.'),
    ('p', 'Het doel: dat je als koper beter en vollediger geïnformeerd bent, nog vóór je eerste gesprek met ons.'),
  ]]),
  ('callout', 'soltura', 'Wat klanten ons vertellen', 'Klanten ervaren onze website en het contact via social media als prettig: overzichtelijk, snel antwoord en alle informatie op één plek. Precies daarom blijven we vernieuwen.'),
]},

# ------------------------------------------------------------------ INHOUD
{'kind': 'page', 'label': 'Inhoud', 'blocks': [
  ('h2', 'Inhoud'),
  ('html', '''<div class="toc">
<div class="tocp"><span class="tn">01</span><div><b>Eerst nadenken, dan kijken</b><span>De 10 vragen vooraf · welk type koper ben je · werkblad wensen</span></div><span class="tpg">5</span></div>
<div class="tocp"><span class="tn">02</span><div><b>Waar wil je wonen?</b><span>Kaart van de Vega Baja · kust of dorp · 12 woonplaatsen · klimaat · bereikbaarheid</span></div><span class="tpg">9</span></div>
<div class="tocp"><span class="tn">03</span><div><b>Wat kost het echt?</b><span>De drie kostenlagen · rekenvoorbeelden · jaarlijkse kosten · hypotheek</span></div><span class="tpg">16</span></div>
<div class="tocp"><span class="tn">04</span><div><b>Welke woning past bij je?</b><span>Woningtypes vergeleken · nieuwbouw of bestaand · verhuren · slim bezichtigen</span></div><span class="tpg">21</span></div>
<div class="tocp"><span class="tn">05</span><div><b>Het aankoopproces stap voor stap</b><span>Tijdlijn · NIE en volmacht · juridische controles · de 12 duurste fouten</span></div><span class="tpg">26</span></div>
<div class="tocp"><span class="tn">06</span><div><b>Je bezichtigingsreis</b><span>Voorbereiding en paklijst · zo ziet een dag eruit · ons kantoor</span></div><span class="tpg">32</span></div>
<div class="tocp"><span class="tn">07</span><div><b>Na de sleutel: wonen &amp; leven</b><span>De eerste 30 dagen · belastingen · testament · emigreren met gezin · huisdieren · het leven hier</span></div><span class="tpg">36</span></div>
<div class="tocp end"><span class="tn">→</span><div><b>Tot slot</b><span>Onze diensten · wat klanten zeggen · checklist "Klaar om te kopen?" · contact</span></div><span class="tpg">44</span></div>
</div>'''),
  ('h3', 'Zo lees je deze gids'),
  ('cards', [
    {'icon': 'check', 't': 'Checklists', 'x': 'Vink af wat je al geregeld hebt. Print de pagina\'s of vul ze digitaal in.'},
    {'icon': 'euro', 't': 'Rekenvoorbeelden', 'x': 'Echte bedragen op basis van de belastingtarieven van oktober 2026.'},
    {'icon': 'sun', 't': 'Tips van ons team', 'x': 'Wat we in ruim twintig jaar in de praktijk leerden, kort samengevat.'},
    {'icon': 'search', 't': 'QR-codes', 'x': 'Scan voor de actuele pagina op onze website, het aanbod of een afspraak.'},
  ], 4),
  ('small', 'Deze gids bevat algemene informatie, geen persoonlijk juridisch, fiscaal of financieel advies. Regels en tarieven veranderen; stand oktober 2026. Wij kijken graag naar jouw situatie.'),
]},

# ================================================================== DEEL 1
{'kind': 'opener', 'num': '01', 'img': 'ai-05-planning.jpg', 'title': 'Eerst nadenken,<br>dan kijken',
 'intro': 'De beste aankopen beginnen niet op een woningsite, maar aan de keukentafel. Wie vooraf weet wat hij wil, ziet tijdens de bezichtigingsreis in één oogopslag welk huis het wordt en welk niet.',
 'inside': ['De 10 vragen vooraf', 'Welk type koper ben je?', 'Werkblad: jouw wensen']},

{'kind': 'page', 'label': 'Deel 1 · Eerst nadenken', 'blocks': [
  ('h2', 'De 10 vragen die je <em>jezelf</em> eerst stelt'),
  ('lead', 'Beantwoord ze eerlijk, het liefst samen met je partner of gezin. Ze bepalen waar je zoekt, wat je kunt besteden en hoe snel je kunt handelen.'),
  ('cols', [[
    ('ol', [
      '<b>Waarvoor koop ik?</b> Vakantie, overwinteren, emigreren, pensioen of verhuur. Het doel bepaalt de plek, het type woning en zelfs de manier van financieren.',
      '<b>Hoeveel maanden per jaar ben ik er?</b> Een paar weken vraagt iets anders dan het hele jaar: denk aan onderhoud, beveiliging en of je de woning wilt verhuren.',
      '<b>Wat is mijn totale budget?</b> Niet alleen de koopprijs: tel 10 tot 13% aankoopkosten, begeleiding en een buffer op. In deel 3 rekenen we het voor.',
      '<b>Koop ik met eigen geld of met een hypotheek?</b> Als niet-resident financier je meestal 60 tot 70%. Weet je je ruimte vóór je gaat kijken.',
      '<b>Zee, golf of Spaans dorp?</b> Aan de kust is het in de zomer druk, in het binnenland is het rustiger, voordeliger en authentieker.',
    ]),
  ], [
    ('html', '<ol class="num" start="6">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (6, '<b>Hoe belangrijk zijn voorzieningen op loopafstand?</b> Zonder auto wil je dicht bij winkels, artsen en vervoer wonen. In veel urbanisaties heb je een auto nodig.'),
      (7, '<b>Kan ik straks nog traplopen?</b> Denk vijftien jaar vooruit: een slaapkamer en badkamer op de begane grond zijn goud waard.'),
      (8, '<b>Hoe belangrijk is privacy?</b> Vrijstaand, geschakeld of appartement met gemeenschappelijk zwembad: het scheelt in prijs én in leefgevoel.'),
      (9, '<b>Wie gaat het huis onderhouden als ik er niet ben?</b> Een tuin met zwembad vraagt wekelijks aandacht. Reken op kosten voor beheer.'),
      (10, '<b>Wat als mijn plannen veranderen?</b> Koop een woning die ook later goed verkoopt: een goede ligging is de beste verzekering.'),
    ]) + '</ol>'),
    ('callout', 'tip', 'Tip van ons team', 'Komen jullie met z\'n tweeën? Beantwoord de vragen eerst ieder apart en vergelijk dan. De verschillen zijn precies de gesprekken die je liever thuis voert dan tijdens de bezichtiging.'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 1 · Eerst nadenken', 'blocks': [
  ('h2', 'Welk type <em>koper</em> ben je?'),
  ('lead', 'Iedere koper zoekt iets anders. Herken je jezelf? Dan weet je meteen waar je de nadruk op legt.'),
  ('svg', G.decision_tree(L)),
  ('sp', 3),
  ('cards', [
    {'t': 'Vakantiewoning', 'x': 'Je bent er een paar weken per jaar. Kies voor weinig onderhoud: een appartement of bungalow met gemeenschappelijk zwembad, dicht bij zee en luchthaven. Regel beheer en sleutelbeheer.'},
    {'t': 'Overwinteren', 'x': 'Drie tot zes maanden in de zon. Let op wintercomfort: warmtepomp, zon op het terras in de middag, isolatie. Een levendige gemeenschap in de winter maakt veel verschil.'},
    {'t': 'Emigreren met gezin', 'x': 'De woning is de aanleiding, het leven is het onderwerp. Scholen, zorg, werk en een echte buurt wegen zwaarder dan het uitzicht. Lees deel 7 eerst.'},
    {'t': 'Pensioen', 'x': 'Gelijkvloers wonen, ziekenhuis en apotheek binnen bereik, sociale contacten. Denk vooruit: wat als autorijden lastiger wordt?'},
    {'t': 'Verhuren', 'x': 'Rendement hangt af van de licentie, de ligging en de bezetting buiten het seizoen. De regels zijn strenger geworden; lees pagina 24 voordat je rekent.'},
    {'t': 'Combinatie', 'x': 'Zelf gebruiken en verhuren als je er niet bent? Kan, maar de regels voor toeristische verhuur bepalen wat haalbaar is. Bespreek het vooraf met ons.'},
  ], 3),
]},

{'kind': 'page', 'label': 'Deel 1 · Werkblad', 'blocks': [
  ('h2', 'Werkblad: <em>moet</em> hebben, mooi meegenomen'),
  ('lead', 'Vul dit in voordat je gaat kijken en neem het mee op je bezichtigingsreis. Het helpt ons ook om vooraf de juiste woningen voor je te selecteren.'),
  ('cols', [[
    ('lines', 6, 'Moet hebben (zonder dit geen deal)'),
    ('lines', 6, 'Mooi meegenomen'),
    ('lines', 3, 'Absoluut niet'),
  ], [
    ('h3', 'Kruis aan wat telt'),
    ('check', ['Loopafstand tot winkels en cafés', 'Zeezicht of open uitzicht', 'Eigen zwembad', 'Gemeenschappelijk zwembad is genoeg',
               'Slaapkamer + badkamer gelijkvloers', 'Dakterras (solarium)', 'Tuin / buitenruimte voor huisdier',
               'Garage of eigen parkeerplaats', 'Gastenverblijf of extra slaapkamer', 'Werkplek met goed internet',
               'Spaans dorp, geen urbanisatie', 'Internationale buren', 'Golfbaan in de buurt', 'School op korte afstand',
               'Verhuurlicentie mogelijk']),
    ('html', '<div class="panel lemon" style="margin-top:2mm"><b>Mijn budget, alles inbegrepen:</b><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div><div style="margin-top:2mm"><b>Ik wil kopen vóór:</b></div><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div></div>'),
  ]]),
]},

# ================================================================== DEEL 2
{'kind': 'opener', 'num': '02', 'img': 'town-rojales-1.jpg', 'title': 'Waar wil<br>je wonen?',
 'intro': 'De Vega Baja is het groene hart van de Costa Blanca Zuid: citroenboomgaarden langs de rivier de Segura, roze zoutmeren, kilometers zandstrand en Spaanse dorpen waar het leven gewoon doorgaat als de toeristen weg zijn.',
 'inside': ['Kaart van ons werkgebied', 'Kust, urbanisatie of dorp', '12 woonplaatsen', 'Klimaat', 'Bereikbaarheid']},

{'kind': 'page', 'label': 'Deel 2 · Ons werkgebied', 'blocks': [
  ('html', '<div class="kicker">Ons werkgebied</div>'),
  ('h2', 'De Vega Baja in <em>één</em> oogopslag'),
  ('lead', 'Vanuit ons kantoor in Formentera del Segura ben je binnen een halfuur bijna overal: op het strand van Guardamar, in het centrum van Torrevieja of op de luchthaven van Alicante.'),
  ('cols', [[
    ('svg', G.vega_map(L)),
    ('small', 'Schematische kaart, niet op schaal. Foto vorige pagina: de brug van Carlos III in Rojales (Orniosviajero, CC BY-SA 4.0).'),
  ], [
    ('h3', 'Vanaf ons kantoor'),
    ('table', ['Bestemming', 'Rijden'], [
      ['Strand Guardamar', 'ca. 12 min'], ['Torrevieja centrum', 'ca. 20 min'], ['Orihuela Costa', 'ca. 25 min'],
      ['Luchthaven Alicante', 'ca. 30 min'], ['Luchthaven Murcia', 'ca. 45-60 min'], ['Alicante stad', 'ca. 40 min'],
      ['Ziekenhuis Torrevieja', 'ca. 20 min']], 'compact'),
    ('callout', 'soltura', 'Waarom hier?', 'Rojales is ons hart, al sinds 2002. We werken bewust in een gebied dat we echt kennen, zodat we je kunnen vertellen in welke straat de zon \'s middags op het terras staat en waar het in augustus druk wordt.'),
  ]], '1.35fr 1fr'),
]},

{'kind': 'page', 'label': 'Deel 2 · Waar wil je wonen', 'blocks': [
  ('h2', 'Kust, urbanisatie of <em>Spaans dorp</em>?'),
  ('lead', 'Het grootste verschil zit niet in de woning, maar in de omgeving. In de Vega Baja kies je grofweg uit drie werelden, vaak op maar tien minuten van elkaar.'),
  ('cards', [
    {'img': 'town-torrevieja-3.jpg', 'tag': 'Aan de kust', 't': 'Strand op loopafstand', 'x': 'Guardamar, Torrevieja, La Mata, Orihuela Costa.<br><br><b>+</b> zee, boulevards, alles dichtbij, goed verhuurbaar<br><b>−</b> druk in juli en augustus, hogere prijzen, vaker appartementen en hoogbouw'},
    {'img': 'town-ciudad-quesada-1.jpg', 'tag': 'Urbanisatie', 't': 'Internationaal en groen', 'x': 'Ciudad Quesada, La Marina, Los Montesinos, La Finca.<br><br><b>+</b> ruime villa\'s en bungalows, golf, internationale gemeenschap, veel Nederlandstaligen<br><b>−</b> vaak een auto nodig, minder Spaans dorpsleven'},
    {'img': 'town-rojales-2.jpg', 'tag': 'Dorpskern', 't': 'Echt Spaans leven', 'x': 'Rojales, Formentera, Benijófar, Almoradí, Dolores, Catral.<br><br><b>+</b> authentiek, het hele jaar levendig, voordeliger, scholen en markt in het dorp<br><b>−</b> Spaans spreken helpt, minder zwembaden, smallere straten'},
  ], 3),
  ('callout', 'tip', 'Tip van ons team', 'Bezoek je favoriete plek twee keer: op een doordeweekse avond in november en op een zaterdag in augustus. Pas dan weet je echt hoe het is om er te wonen.'),
  ('small', 'Foto\'s: La Mata (Ximonic, CC BY-SA 4.0), Ciudad Quesada (H. Helmlechner, CC BY-SA 4.0), Rojales (Ximonic, CC BY-SA 4.0), via Wikimedia Commons.'),
]},

{'kind': 'page', 'label': 'Deel 2 · Woonplaatsen', 'blocks': [
  ('h2', 'Woonplaatsen <em>uitgelicht</em> (1/2)'),
  ('cards', [
    tc('Rojales', 'Ons hart', 'town-rojales-1.jpg', 'Oud huertadorp aan de Segura met een rustig Spaans centrum. Met Ciudad Quesada erboven heb je alle voorzieningen.', '9 km', '30 min', 'wie Spaans dorp en voorzieningen wil'),
    tc('Ciudad Quesada', 'Rojales', 'town-ciudad-quesada-2.jpg', 'Groene, internationale woonwijk op de heuvels, met golfbaan La Marquesa, restaurants en een waterpark.', '8 km', '30 min', 'gezinnen, golfers, overwinteraars'),
    tc('Formentera del Segura', 'Ons kantoor', 'town-formentera-del-segura-1.jpg', 'Compact dorp aan de Segura met kerkplein en de nieuwbouwwijk Los Palacios. Rojales en Benijófar liggen ertegenaan.', '10 km', '30 min', 'rust met alles om de hoek'),
    tc('Benijófar', 'Klein & gezellig', 'town-benijofar-1.jpg', 'Een van de kleinste gemeenten van de streek, midden in de huerta. Ongeveer de helft van de inwoners komt uit het buitenland.', '11 km', '35 min', 'wie een dorp met internationale buren zoekt'),
    tc('Guardamar del Segura', 'Aan zee', 'town-guardamar-del-segura-3.jpg', 'Ruim 11 km zandstrand met een groot dennenbos op de duinen en een dorpskern die het hele jaar leeft.', '0,5-1 km', '25-30 min', 'strandliefhebbers, wandelaars'),
    tc('Torrevieja', 'Stad aan zee', 'town-torrevieja-2.jpg', 'Levendige stad tussen twee roze zoutmeren en de zee, met inwoners uit meer dan honderd landen. Alles binnen handbereik.', 'aan zee', '35 min', 'wie stad, zee en voorzieningen wil'),
  ], 3),
  ('qr', LINKS['areas'], 'Alle 16 woonplaatsgidsen met feiten, scholen, zorg en fiesta\'s'),
]},

{'kind': 'page', 'label': 'Deel 2 · Woonplaatsen', 'blocks': [
  ('h2', 'Woonplaatsen <em>uitgelicht</em> (2/2)'),
  ('cards', [
    tc('Orihuela Costa', 'Kust', 'town-orihuela-costa-2.jpg', '16 km kust met calas, golfbanen en winkelcentrum La Zenia Boulevard. In de zomer vol.', 'aan zee', '45 min', 'zon, zee en golf'),
    tc('San Miguel de Salinas', 'Heuveldorp', 'town-san-miguel-de-salinas-1.jpg', 'Heuveldorp met uitzicht over het zoutmeer, de natuur van de Sierra Escalona achter de deur.', '12 km', '40 min', 'natuur en rust, dicht bij de kust'),
    tc('Almoradí', 'Landstadje', 'town-almoradi-2.jpg', 'Levendig Spaans stadje met een groot plein onder ficusbomen en de bekende zaterdagmarkt.', '15 km', '35 min', 'wie echt in Spanje wil wonen'),
    tc('Algorfa', 'Golf', 'town-algorfa-1.jpg', 'Klein dorp met grote urbanisaties, waaronder golfresort La Finca. Rustig, het hele jaar bewoond.', '15 km', '35 min', 'golfers en rustzoekers'),
    tc('Los Montesinos', 'Bij het zoutmeer', 'town-los-montesinos-2.jpg', 'Compact dorp tussen citrusvelden, een paar kilometer van het roze meer van Torrevieja.', '12 km', '40 min', 'rust, dichtbij Torrevieja'),
    tc('Dolores &amp; Catral', 'Huerta', 'town-dolores-2.jpg', 'Betaalbare landbouwdorpen met scholen, gezondheidscentrum en weekmarkt. Veel fincas en landelijke woningen.', '13-20 km', '30 min', 'ruimte, finca\'s, gezinnen'),
  ], 3),
  ('small', 'Foto\'s via Wikimedia Commons: Orihuela Costa (Ximonic), San Miguel (Ximonic), Almoradí (Asdflkjh), Algorfa (19Tarrestnom65), Los Montesinos (Joanbanjo), Dolores (Wikimedia Commons), Rojales (Orniosviajero), Quesada (H. Helmlechner), Formentera &amp; Benijófar (Galopax), Guardamar (Salu Heredia, CC BY 3.0), Torrevieja (Werner Wilmes, CC BY 2.0); overige CC BY-SA. Afstanden indicatief.'),
]},

{'kind': 'page', 'label': 'Deel 2 · Klimaat', 'hero': 'ai-14-beach.jpg', 'hero_h': 62, 'blocks': [
  ('sp', 56),
  ('cols', [[
    ('h2', '320 dagen zon is <em>geen</em> reclamepraatje'),
    ('p', 'De Costa Blanca Zuid is een van de droogste en zonnigste streken van Europa. De Wereldgezondheidsorganisatie noemde het klimaat hier ooit een van de gezondste ter wereld; de droge lucht en de zoutmeren zijn een verademing voor wie last heeft van gewrichten of luchtwegen.'),
  ], [
    ('stats', [('2.900', 'zonuren per jaar (ca.)'), ('300', 'mm regen per jaar (ca.)'), ('18°', 'overdag in december'), ('26°', 'zeewater in augustus')], 2),
  ]], '1.1fr 1fr'),
  ('h3', 'Temperatuur per maand (Alicante, gemiddeld) — balk: min/max · stippellijn: zeewater'),
  ('svg', G.climate_chart(L)),
  ('cols', [[('p', '<b>Winter</b> (dec-feb): zonnig en mild, \'s nachts fris. Je zit overdag op het terras, \'s avonds wil je verwarming.')],
            [('p', '<b>Lente &amp; herfst</b>: het mooiste weer, ideaal voor bezichtigingen, golf en wandelen. Af en toe een stevige bui.')],
            [('p', '<b>Zomer</b> (jun-sep): heet, 30 graden en meer. Airco en schaduw zijn geen luxe. Augustus is de drukste maand.')]]),
  ('small', 'Bron: langjarige gemiddelden AEMET, afgerond. Zeewatertemperaturen indicatief.'),
]},

{'kind': 'page', 'label': 'Deel 2 · Bereikbaarheid', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Bereikbaarheid</div>'),
    ('h2', 'Dichter bij huis dan je <em>denkt</em>'),
    ('lead', 'Twee internationale luchthavens binnen een uur, met het hele jaar door rechtstreekse vluchten naar Nederland, België, Duitsland, Scandinavië en het Verenigd Koninkrijk.'),
    ('table', ['Vanaf', 'Vliegtijd naar Alicante'], [
      ['Amsterdam, Eindhoven, Rotterdam', 'ca. 2 u 30 - 2 u 45'], ['Brussel, Charleroi', 'ca. 2 u 20'],
      ['Düsseldorf, Keulen, Weeze', 'ca. 2 u 30'], ['Londen, Manchester', 'ca. 2 u 15 - 2 u 30'],
      ['Stockholm, Kopenhagen', 'ca. 3 u 30 - 3 u 45']], 'compact'),
    ('small', 'Vliegtijden indicatief. Dienstregelingen wisselen per seizoen.'),
  ], [
    ('img', 'ai-11-plane.jpg', 70, 'Bij de landing op Alicante zie je de roze zoutmeren al liggen.'),
  ]], '1.1fr 1fr'),
  ('cards', [
    {'icon': 'plane', 't': 'Alicante-Elche (ALC)', 'x': 'De grootste luchthaven van de regio, ca. 30 minuten van Rojales. Veel vluchten, ook in de winter.'},
    {'icon': 'plane', 't': 'Murcia (RMU)', 'x': 'Kleiner en rustiger, ca. 45 tot 60 minuten. Vaak handig voor het zuidelijke deel van de kust.'},
    {'icon': 'car', 't': 'Met de auto', 'x': 'Vanuit Nederland ca. 1.900 km. De AP-7 en de CV-91/CV-95 verbinden alle dorpen. Zonder auto is wonen in de urbanisaties lastig.'},
    {'icon': 'people', 't': 'Openbaar vervoer', 'x': 'Busverbindingen tussen de grotere plaatsen en naar de luchthaven. Treinen vanuit Alicante en Elche naar Madrid (ca. 2 u 15).'},
  ], 2),
]},

# ================================================================== DEEL 3
{'kind': 'opener', 'num': '03', 'img': 'ai-15-bank.jpg', 'title': 'Wat kost<br>het echt?',
 'intro': 'De vraagprijs is maar het begin. Wie vooraf weet wat er bovenop komt en wat een woning per jaar kost, koopt met een gerust hart en houdt geld over voor de inrichting.',
 'inside': ['De drie kostenlagen', 'Rekenvoorbeelden', 'Jaarlijkse kosten', 'Hypotheek']},

{'kind': 'page', 'label': 'Deel 3 · Kosten', 'blocks': [
  ('h2', 'De drie <em>kostenlagen</em>'),
  ('lead', 'Denk in drie lagen. Wie alleen naar de eerste kijkt, komt bij de notaris of na het eerste jaar voor verrassingen te staan.'),
  ('svg', G.cost_layers(L)),
  ('sp', 3),
  ('h3', 'Laag 2 in detail: wat je bovenop de koopprijs betaalt'),
  ('table', ['Kostenpost', 'Bestaande woning', 'Nieuwbouw (van projectontwikkelaar)'], [
    ['Overdrachtsbelasting', '<b>ITP 9%</b> van de koopsom (11% boven € 1 miljoen)', '—'],
    ['Btw', '—', '<b>IVA 10%</b> van de koopsom'],
    ['Zegelrecht', '—', '<b>AJD 1,4%</b> van de koopsom'],
    ['Notaris', 'ca. € 800 - 1.500', 'ca. € 800 - 1.500'],
    ['Eigendomsregister', 'ca. € 400 - 900', 'ca. € 400 - 900'],
    ['Gestoría (afhandeling, betaling belastingen)', 'ca. € 300 - 500', 'ca. € 300 - 500'],
    ['NIE, volmacht, vertalingen', 'afhankelijk van je situatie', 'afhankelijk van je situatie'],
    ['Juridische controle en begeleiding', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">op aanvraag →</b></a>', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">op aanvraag →</b></a>'],
    ['!Vuistregel totaal', '!ca. 10 - 11% + begeleiding', '!ca. 12 - 13% + begeleiding'],
  ], 'compact'),
  ('callout', 'info', 'Goed om te weten', 'De tarieven gelden in de Comunitat Valenciana sinds 1 juni 2026 (ITP verlaagd van 10 naar 9%, AJD van 1,5 naar 1,4%). Voor jongeren tot 35 jaar, grote gezinnen en mensen met een beperking gelden onder voorwaarden lagere tarieven voor de eigen woning. Neem je een hypotheek, dan betaalt de bank sinds 2019 de belasting en de notaris van de hypotheekakte; jij betaalt de taxatie.'),
]},

{'kind': 'page', 'label': 'Deel 3 · Rekenvoorbeelden', 'blocks': [
  ('h2', 'Rekenvoorbeelden: <em>zo</em> ziet het eruit'),
  ('lead', 'Twee veelvoorkomende situaties, met de tarieven van oktober 2026. Bijkomende kosten zijn gemiddelden; jouw persoonlijke overzicht maken we graag op maat.'),
  ('cols', [[
    ('h4', 'Bestaande bungalow · € 250.000'),
    ('table', ['Post', 'Bedrag'], [
      ['Koopprijs', '€ 250.000'], ['ITP 9%', '€ 22.500'], ['Notaris', 'ca. € 1.000'], ['Register', 'ca. € 600'],
      ['Gestoría', 'ca. € 400'], ['Begeleiding', 'op aanvraag'], ['!Totaal excl. begeleiding', '!ca. € 274.500']], 'num'),
    ('h4', 'Bestaande villa · € 400.000'),
    ('table', ['Post', 'Bedrag'], [
      ['Koopprijs', '€ 400.000'], ['ITP 9%', '€ 36.000'], ['Notaris', 'ca. € 1.200'], ['Register', 'ca. € 800'],
      ['Gestoría', 'ca. € 450'], ['Begeleiding', 'op aanvraag'], ['!Totaal excl. begeleiding', '!ca. € 438.450']], 'num'),
  ], [
    ('h4', 'Nieuwbouw appartement · € 250.000'),
    ('table', ['Post', 'Bedrag'], [
      ['Koopprijs', '€ 250.000'], ['IVA 10%', '€ 25.000'], ['AJD 1,4%', '€ 3.500'], ['Notaris', 'ca. € 1.000'],
      ['Register', 'ca. € 600'], ['Gestoría', 'ca. € 400'], ['Begeleiding', 'op aanvraag'], ['!Totaal excl. begeleiding', '!ca. € 280.500']], 'num'),
    ('callout', 'warn', 'Let op bij nieuwbouw', 'De btw betaal je over elke termijn: over de aanbetaling bij reservering, over de tussentijdse betalingen en over het restant bij oplevering. Houd daar rekening mee in je planning.'),
    ('callout', 'tip', 'Tip van ons team', 'Zet de aankoopkosten apart zodra je een woning reserveert. Bij de notaris moet alles in één keer klaarstaan, inclusief een cheque of overboeking van de belasting.'),
  ]]),
  ('cta', LINKS['contact'], 'Vraag je persoonlijke kostenoverzicht aan', 'Vertel ons welke woning of welk budget je in gedachten hebt. Je krijgt een overzicht op maat, met alle posten voor jouw situatie.'),
]},

{'kind': 'page', 'label': 'Deel 3 · Jaarlijkse kosten', 'blocks': [
  ('h2', 'Wat kost een woning <em>per jaar</em>?'),
  ('lead', 'Laag 3 wordt het vaakst vergeten. Deze bedragen zijn voorbeelden voor de Vega Baja; ze verschillen per gemeente, urbanisatie en woning.'),
  ('table', ['Post', 'Appartement', 'Bungalow / geschakeld', 'Villa met zwembad'], [
    ['IBI (onroerendgoedbelasting)', '€ 300 / jaar', '€ 400 / jaar', '€ 700 / jaar'],
    ['Afvalheffing (basura)', '€ 120 / jaar', '€ 120 / jaar', '€ 140 / jaar'],
    ['Gemeenschapskosten (comunidad)', '€ 70 / maand', '€ 45 / maand', 'meestal geen'],
    ['Opstal- en inboedelverzekering', '€ 250 / jaar', '€ 350 / jaar', '€ 550 / jaar'],
    ['Onderhoud tuin en zwembad', '—', '—', '€ 60+ / maand'],
    ['Elektriciteit', '€ 70 / maand', '€ 90 / maand', '€ 140 / maand'],
    ['Water', '€ 25 / maand', '€ 35 / maand', '€ 60 / maand'],
    ['Internet en mobiel', '€ 50 / maand', '€ 50 / maand', '€ 50 / maand'],
  ], 'num compact'),
  ('cols', [[
    ('h3', 'Belasting als niet-resident'),
    ('p', 'Woon je officieel niet in Spanje, dan betaal je ook belasting als je de woning niet verhuurt: over een fictief inkomen van 1,1% (soms 2%) van de kadastrale waarde. Voor inwoners van de EU, Noorwegen en IJsland is het tarief 19%.'),
    ('panel',) and ('html', '<div class="panel"><b>Voorbeeld:</b> kadastrale waarde € 100.000 × 1,1% = € 1.100 fictief inkomen × 19% = <b>ca. € 209 per jaar</b>. Aangifte met Modelo 210, uiterlijk 31 december van het jaar erna.</div>'),
  ], [
    ('h3', 'Reken het zelf uit'),
    ('p', 'Op onze website staat een maandlastencalculator. Kies woningtype, gezinssituatie, zorg en auto, en je ziet direct wat wonen hier per maand kost. Wat je invult, blijft in je eigen browser.'),
    ('qr', LINKS['costs'], 'Maandlastencalculator'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 3 · Financieren', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Financieren</div>'),
    ('h2', 'Een Spaanse hypotheek, <em>zo</em> werkt het'),
    ('lead', 'Wie zijn financiering op tijd regelt, weet welke woningen binnen bereik liggen en kan snel handelen als de juiste langskomt.'),
    ('table', ['', 'Niet-resident', 'Resident'], [
      ['Maximale lening', 'meestal 60 - 70%', 'tot ca. 80%'], ['Looptijd', 'vaak tot je 70e-75e', 'vaak tot je 75e'],
      ['Eigen inbreng', '30 - 40% + kosten', '20% + kosten'], ['Rente', 'vast, variabel of mix', 'vast, variabel of mix']], 'compact'),
    ('h3', 'Wat de bank van je vraagt'),
    ('check', ['Paspoort en NIE', 'Inkomensbewijzen (loonstroken of jaarcijfers)', 'Laatste belastingaangiftes', 'Bankafschriften van de laatste maanden', 'Overzicht van bestaande leningen', 'Arbeidscontract of pensioenoverzicht']),
  ], [
    ('img', 'ai-15-bank.jpg', 52),
    ('h3', 'Het proces in 4 stappen'),
    ('steps', [('Voorlopig akkoord', 'Op basis van je inkomen en eigen geld bepaalt de bank je ruimte. Doe dit vóór je bezichtigingsreis.'),
               ('Taxatie (tasación)', 'Een erkend taxateur bepaalt de waarde. De bank leent over de laagste van taxatie en koopprijs.'),
               ('Bindend aanbod (FEIN)', 'Je ontvangt het minstens tien dagen vóór de notaris. Bij de notaris bevestig je dat je het begrijpt.'),
               ('Ondertekening', 'Koopakte en hypotheekakte teken je op dezelfde dag bij de notaris.')]),
    ('callout', 'soltura', 'Zo doen wij het', 'Wij brengen je in contact met Spaanse banken en regelen de hypotheek van aanvraag tot notaris. Ook het openen van een Spaanse bankrekening nemen we je uit handen.'),
  ]]),
]},

# ================================================================== DEEL 4
{'kind': 'opener', 'num': '04', 'img': 'ai-12-newbuild.jpg', 'title': 'Welke woning<br>past bij je?',
 'intro': 'Appartement of villa, nieuwbouw of een woning met karakter, zelf gebruiken of verhuren: elke keuze heeft gevolgen voor je budget, je onderhoud en je plezier.',
 'inside': ['Woningtypes vergeleken', 'Nieuwbouw of bestaand', 'Verhuren: de regels', 'Slim bezichtigen']},

{'kind': 'page', 'label': 'Deel 4 · Woningtypes', 'blocks': [
  ('h2', 'Woningtypes <em>vergeleken</em>'),
  ('lead', 'De Spaanse benamingen kom je op elke woningsite tegen. Dit betekenen ze, en hier zit het verschil.'),
  ('table', ['Type', 'Wat is het?', 'Pluspunten', 'Let op'], [
    ['<b>Appartement</b> (apartamento)', 'Woning in een complex, vaak met gemeenschappelijk zwembad', 'Weinig onderhoud, veilig afsluitbaar, betaalbaar', 'Gemeenschapskosten, geluid van buren, lift?'],
    ['<b>Penthouse</b> (ático)', 'Bovenste verdieping met groot terras of solarium', 'Licht, uitzicht, privacy', 'Warm in de zomer, trappen zonder lift'],
    ['<b>Bungalow</b>', 'Appartement op de begane grond of eerste verdieping in een laag complex, eigen opgang', 'Gelijkvloers mogelijk, eigen terras, populair', 'Benedenwoning: privacy; bovenwoning: trap'],
    ['<b>Quad / geschakeld</b> (quad, adosado)', 'Eén van vier of meer aan elkaar gebouwde woningen', 'Eigen tuin, voordeliger dan vrijstaand', 'Gedeelde muren, gemeenschapsregels'],
    ['<b>Townhouse</b> (casa adosada, dúplex)', 'Rijwoning over twee verdiepingen', 'Ruimte, vaak dakterras', 'Trappen, slaapkamers boven'],
    ['<b>Villa</b> (chalet independiente)', 'Vrijstaande woning op eigen perceel', 'Privacy, eigen zwembad, uitbreidbaar', 'Onderhoud, beveiliging, hogere kosten'],
    ['<b>Finca</b> (casa de campo)', 'Landelijke woning met grond, buiten de bebouwde kom', 'Rust, ruimte, karakter', 'Vergunningen, water, toegangsweg, legalisatie'],
  ], 'compact'),
  ('img', 'town-ciudad-quesada-1.jpg', 44, 'Ciudad Quesada: villa\'s, bungalows en appartementen op de heuvels boven Rojales (H. Helmlechner, CC BY-SA 4.0).'),
  ('callout', 'tip', 'Tip van ons team', 'Vraag bij elke woning naar de oriëntatie. Een terras op het zuiden of westen geeft in de winter zon tot laat in de middag; in de zomer wil je juist schaduw. De beste woningen hebben allebei.'),
]},

{'kind': 'page', 'label': 'Deel 4 · Nieuwbouw', 'blocks': [
  ('cols', [[
    ('h2', 'Nieuwbouw of <em>bestaand</em>?'),
    ('table', ['', 'Nieuwbouw', 'Bestaand'], [
      ['Belasting', '10% IVA + 1,4% AJD', '9% ITP'], ['Instapklaar', 'na oplevering, vaak 12-24 mnd', 'direct'],
      ['Garantie', 'wettelijke bouwgaranties', 'geen, eerlijk controleren'], ['Energie', 'modern, zuinig', 'wisselend'],
      ['Ligging', 'vaak nieuwe wijken', 'gevestigde buurten, groen'], ['Meubels', 'leeg', 'vaak gemeubileerd'],
      ['Wat je ziet', 'plattegrond en showhuis', 'het echte huis']], 'compact'),
    ('h3', 'Kopen van een projectontwikkelaar'),
    ('ul', ['Je betaalt in termijnen: reservering, aanbetaling (vaak 30-50% tijdens de bouw), restant bij oplevering.',
            'Elke betaling vóór de oplevering moet wettelijk zijn gedekt door een <b>bankgarantie of verzekering</b>. Vraag daar altijd naar.',
            'Controleer de bouwvergunning en de planning, en spreek af wat er gebeurt bij vertraging.',
            'Bij oplevering loop je samen met ons de woning na. Kleine gebreken komen op een lijst die de ontwikkelaar moet oplossen.']),
  ], [
    ('img', 'ai-12-newbuild.jpg', 58),
    ('callout', 'soltura', 'Zo werken wij met nieuwbouw', '<p>We sturen geen stapels brochures en prijslijsten. Bij nieuwbouw willen we je eerst persoonlijk spreken, en het liefst laten we je het project ter plekke zien. Een plattegrond vertelt niet hoe de zon valt, hoe de buurt voelt en hoe ver de supermarkt echt is.</p><p>Daarvoor vragen we je naam, mobiel nummer, e-mailadres en wanneer je in Spanje kunt zijn.</p>'),
    ('qr', LINKS['contact'], 'Plan een kennismaking over nieuwbouw'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 4 · Verhuren', 'blocks': [
  ('h2', 'Verhuren: wat <em>mag</em> er nog?'),
  ('lead', 'Spanje en de Comunitat Valenciana hebben de regels voor vakantieverhuur sinds 2024 flink aangescherpt. Wie wil verhuren, moet dat vóór de aankoop laten uitzoeken.'),
  ('cols', [[
    ('h3', 'Toeristische verhuur (korte termijn)'),
    ('check', [
      '<b>Registratie bij de Generalitat</b> in het register van toeristische woningen, met een verklaring van de gemeente dat verhuur op die plek is toegestaan.',
      '<b>Landelijk registratienummer</b>: sinds 1 juli 2025 mag een woning zonder dit nummer niet meer op Airbnb, Booking en andere platforms worden aangeboden.',
      '<b>Toestemming van de gemeenschap</b>: sinds april 2025 moet bij een appartementencomplex 3/5 van de eigenaren instemmen met nieuwe toeristische verhuur.',
      '<b>Gemeentelijke beperkingen</b>: sommige gemeenten staan in bepaalde wijken geen nieuwe licenties meer toe.',
      '<b>Gastenregistratie</b> bij de politie en een verzekering voor wettelijke aansprakelijkheid.',
    ]),
  ], [
    ('h3', 'Lange termijn'),
    ('p', 'Verhuur je als woning voor een jaar of langer, dan geldt de huurwet (LAU). Als particuliere verhuurder zit je in principe vast aan contracten tot vijf jaar. Eenvoudiger qua licentie, maar minder flexibel.'),
    ('h3', 'Belasting over huurinkomsten'),
    ('p', 'Als niet-resident uit de EU betaal je 19% over de netto huurinkomsten, na aftrek van kosten. Van buiten de EU 24% over het bruto bedrag. Aangifte per kwartaal met Modelo 210.'),
    ('callout', 'warn', 'Let op', 'Ga er nooit van uit dat een woning "verhuurd kan worden" omdat de huidige eigenaar het doet. Vraag naar het registratienummer en laat controleren of het op jouw naam kan worden voortgezet.'),
  ]]),
  ('img', 'ai-10-remote.jpg', 46, 'Steeds meer kopers combineren eigen gebruik met werken op afstand in plaats van verhuren.', 'center 40%'),
]},

{'kind': 'page', 'label': 'Deel 4 · Slim bezichtigen', 'band': 'ai-03-viewing.jpg', 'band_h': 62, 'band_pos': 'center 40%', 'blocks': [
  ('h2', 'Slim bezichtigen: <em>kijk verder</em> dan de keuken'),
  ('lead', 'Een mooie woning verleidt. Neem deze lijst mee en kijk ook naar wat je niet meteen ziet.'),
  ('cols', [[
    ('h3', 'In en om het huis'),
    ('check', ['Vocht- of schimmelplekken, vooral in de winter en bij benedenwoningen', 'Scheuren in muren en terrassen',
               'Leeftijd van airco, boiler en zwembadpomp', 'Waterdruk en warm water', 'Dak en dakterras: afwatering, lekkage',
               'Zijn uitbouwen, overkappingen en het zwembad legaal en ingeschreven?', 'Oriëntatie van terras en woonkamer',
               'Geluid: weg, buren, horeca, honden', 'Internet: glasvezel beschikbaar?', 'Ramen: dubbel glas, rolluiken, horren']),
  ], [
    ('h3', 'In de omgeving'),
    ('check', ['Loop een rondje: hoe ziet de straat eruit?', 'Hoe druk is het in het hoogseizoen?', 'Afstand tot supermarkt, apotheek, arts',
               'Bouwplannen in de buurt', 'Staat van het gemeenschappelijke zwembad en de tuin', 'Hoogte van de gemeenschapskosten en openstaande posten',
               'Overstromingsrisico bij laaggelegen woningen langs de Segura']),
    ('callout', 'tip', 'Uit de praktijk', 'Een klant kocht een woning met een zwembad dat nooit was gelegaliseerd. Wij zagen het in de papieren en lieten het vóór de notaris regelen. Kost de verkoper wat moeite, scheelt de koper later een boete en een probleem bij doorverkoop.'),
  ]]),
]},

# ================================================================== DEEL 5
{'kind': 'opener', 'num': '05', 'img': 'ai-04-keys.jpg', 'title': 'Het aankoopproces<br>stap voor stap',
 'intro': 'In Spanje wordt een koop pas definitief bij de notaris, maar de belangrijkste afspraken maak je daarvoor. Wie de volgorde kent, weet op elk moment waar hij staat.',
 'inside': ['Van kennismaking tot sleutel', 'NIE en volmacht', 'Juridische controles', 'De 12 duurste fouten']},

{'kind': 'page', 'label': 'Deel 5 · Het proces', 'blocks': [
  ('h2', 'Van kennismaking tot <em>sleutel</em>'),
  ('lead', 'Een gemiddelde aankoop duurt van bod tot notaris vier tot acht weken. De oriëntatie ervoor duurt bij de meeste kopers maanden: gemiddeld zit er zo\'n negen maanden tussen "financieel klaar" en de sleutel.'),
  ('svg', G.process_bar(L)),
  ('sp', 2),
  ('steps', [
    ('Reservering', 'Zodra je met de verkoper een prijs hebt afgesproken, teken je een reserveringscontract en betaal je een aanbetaling, meestal € 3.000 tot € 5.000. De woning gaat van de markt en de prijs ligt vast.', 'dag 1'),
    ('Koopcontract (contrato de arras)', 'Dit contract legt de prijs, de voorwaarden en de datum van overdracht vast. Je vult de aanbetaling aan tot meestal 10% van de koopsom.', 'binnen 1-3 weken'),
    ('Controles en voorbereiding', 'Kadaster, register, schulden, vergunningen, gemeenschapskosten: wij controleren het en vertellen je wat we vinden. We stemmen notaris, bank en eventueel advocaat op elkaar af.', 'parallel'),
    ('Overdracht bij de notaris', 'Je betaalt het restant en tekent de akte (escritura). Eén van ons is die dag bij je. Kun je niet aanwezig zijn, dan kan het met een volmacht.', 'na 4-8 weken'),
    ('Inschrijving en nazorg', 'De akte wordt ingeschreven in het eigendomsregister. Wij zetten nutsvoorzieningen, IBI en gemeenschapskosten op jouw naam.', 'daarna'),
  ]),
  ('stats', [('4-8 wkn', 'van geaccepteerd bod tot notaris'), ('10%', 'aanbetaling bij het koopcontract (gebruikelijk)'), ('± 9 mnd', 'gemiddeld van "financieel klaar" tot sleutel'), ('1 dag', 'bij de notaris, met één van ons naast je')]),
]},

{'kind': 'page', 'label': 'Deel 5 · Papieren', 'band': 'town-san-miguel-de-salinas-1.jpg', 'band_h': 38, 'band_pos': 'center 60%', 'blocks': [
  ('h2', 'NIE, bankrekening en <em>volmacht</em>'),
  ('cols', [[
    ('h3', 'Het NIE-nummer'),
    ('p', 'Je identificatienummer als buitenlander in Spanje. Je hebt het nodig voor de notaris, een bankrekening, nutsvoorzieningen en belastingen. Zonder NIE geen aankoop.'),
    ('ul', ['Aanvragen kan bij de politie in Spanje, bij een Spaans consulaat in je eigen land, of via een vertegenwoordiger met volmacht.',
            'Reken op enkele weken doorlooptijd. Start dus ruim voordat je een woning reserveert.',
            'Kopen jullie met z\'n tweeën? Dan heeft ieder een eigen NIE nodig.']),
    ('h3', 'Een Spaanse bankrekening'),
    ('p', 'Voor de betaling bij de notaris en de automatische incasso van IBI, gemeenschapskosten en nuts. De bank vraagt je paspoort, je NIE en een bewijs van inkomen of herkomst van het geld.'),
  ], [
    ('h3', 'Kopen op afstand met een volmacht'),
    ('p', 'Je hoeft niet zelf naar de notaris. Met een notariële volmacht (poder) kan iemand namens jou tekenen, betalen en de nutsvoorzieningen regelen. De volmacht teken je bij een Spaanse notaris of bij een notaris in je eigen land, met een apostille.'),
    ('quote', 'Van A tot Z wordt alles geregeld. Best bijzonder dat je op afstand een paar appartementen koopt, zonder er ook maar een keer geweest te zijn.', 'Google-review, oktober 2026'),
    ('callout', 'soltura', 'Zo doen wij het', 'Wij helpen met de formulieren en afspraken voor je NIE, openen samen met je een bankrekening en regelen desgewenst alles met een volmacht, zodat je pas voor de sleutels hoeft te komen.'),
  ]]),
  ('h3', 'Wat heb je waarvoor nodig?'),
  ('table', ['', 'NIE', 'Bankrekening', 'Volmacht'], [
    ['Paspoort of ID-kaart', '✓', '✓', '✓'], ['Ingevuld aanvraagformulier (EX-15)', '✓', '', ''],
    ['Reden van aanvraag (bijv. reservering woning)', '✓', '', ''], ['NIE', '', '✓', '✓'],
    ['Bewijs van inkomen / herkomst van het geld', '', '✓', ''], ['Apostille (bij volmacht getekend buiten Spanje)', '', '', '✓']], 'compact'),
]},

{'kind': 'page', 'label': 'Deel 5 · Controles', 'blocks': [
  ('h2', 'De juridische controle: <em>wat</em> we nakijken'),
  ('lead', 'In Spanje gaat een schuld op een woning mee naar de nieuwe eigenaar. Daarom is de controle vooraf het belangrijkste deel van de aankoop.'),
  ('cols', [[
    ('check', [
      '<b>Nota simple</b>: wie is de eigenaar volgens het eigendomsregister, en rust er een hypotheek of beslag op de woning?',
      '<b>Kadaster</b>: komen de oppervlakte en de beschrijving overeen met de werkelijkheid en met het register?',
      '<b>Vergunningen</b>: zijn de woning, uitbouwen, overkappingen en het zwembad legaal gebouwd en ingeschreven?',
      '<b>Bewoonbaarheid</b> (cédula / licencia de primera ocupación) waar die nodig is voor nutscontracten.',
      '<b>IBI</b>: zijn de onroerendgoedbelastingen van de afgelopen jaren betaald?',
    ]),
  ], [
    ('check', [
      '<b>Gemeenschap</b>: een verklaring van de beheerder dat er geen achterstand is, en of er grote uitgaven op de planning staan.',
      '<b>Nutsvoorzieningen</b>: geen openstaande rekeningen voor water en elektriciteit.',
      '<b>Energielabel</b>: verplicht bij verkoop.',
      '<b>Stedenbouwkundige situatie</b>: ligt de woning in een gebied met plannen, beperkingen of risico\'s?',
      '<b>Niet-residente verkoper</b>: de koper houdt 3% van de koopprijs in en draagt dat af aan de belastingdienst. Wij regelen dat bij de notaris.',
    ]),
  ]]),
  ('callout', 'soltura', 'Onafhankelijk en transparant', 'We vertellen je wat we vinden, ook als dat de verkoop vertraagt. Een klant schreef: "Ze zijn transparant over gebreken of niet-zichtbare kosten en zoeken alles grondig uit." Precies zo willen we werken.'),
  ('img', 'ai-04-keys.jpg', 50, '', 'center 60%'),
]},

{'kind': 'page', 'label': 'Deel 5 · Bod en arras', 'blocks': [
  ('h2', 'Bieden, reserveren en wat <em>"onder bod"</em> betekent'),
  ('cols', [[
    ('h3', 'Een bod doen'),
    ('p', 'Een bod doe je via ons, liefst schriftelijk, met de prijs, eventuele voorwaarden (zoals een hypotheek of wat er aan meubels achterblijft) en je gewenste datum van overdracht. Wij leggen het voor aan de verkoper en onderhandelen voor je.'),
    ('h3', 'Onder bod bij Soltura Real Estate'),
    ('p', 'Zodra een bod is geaccepteerd en de reservering is betaald, staat een woning bij ons onder bod. We stoppen dan met bezichtigingen en gaan ervan uit dat de verkoop doorgaat. Valt de koop toch af, dan komt de woning terug in de verkoop. Op onze website kun je je aanmelden om dan direct bericht te krijgen.'),
  ], [
    ('h3', 'Het koopcontract met aanbetaling (arras)'),
    ('table', ['Wat gebeurt er als...', 'Gevolg'], [
      ['de koper afziet van de koop', 'de koper verliest de aanbetaling'],
      ['de verkoper afziet van de koop', 'de verkoper betaalt de aanbetaling dubbel terug'],
      ['de hypotheek niet doorgaat', 'alleen geregeld als dat als voorwaarde in het contract staat']], 'compact'),
    ('p', 'Dit is de gebruikelijke vorm (arras penitenciales, art. 1454 Burgerlijk Wetboek). Lees het contract altijd goed: de voorwaarden bepalen wie welk risico draagt.'),
    ('callout', 'warn', 'Let op', 'Betaal nooit een aanbetaling rechtstreeks aan een verkoper die je niet kent, en nooit zonder schriftelijk contract. Bij ons gaat de aanbetaling via een gecontroleerde rekening met een getekend contract.'),
  ]]),
  ('cols', [[
    ('callout', 'tip', 'Tip van ons team: realistisch bieden', 'Een bod ver onder de vraagprijs kan werken bij een woning die al lang te koop staat, maar goede woningen in de Vega Baja zijn vaak snel weg. Wij vertellen je eerlijk hoe de vraagprijs zich verhoudt tot vergelijkbare verkopen.'),
  ], [
    ('qr', LINKS['home'], 'Woning onder bod? Meld je op de woningpagina aan voor "Terug in aanbod"'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 5 · Valkuilen', 'blocks': [
  ('h2', 'De 12 duurste <em>fouten</em> (en hoe je ze voorkomt)'),
  ('lead', 'In ruim twintig jaar zagen we ze allemaal voorbijkomen. Gelukkig zijn ze stuk voor stuk te voorkomen.'),
  ('cols', [[
    ('ol', [
      '<b>Alleen naar de koopprijs kijken.</b> Reken altijd met 10 tot 13% aankoopkosten, plus begeleiding en een buffer.',
      '<b>Op vakantie verliefd worden en dezelfde week tekenen.</b> Slaap er een nacht over, bekijk de buurt op een ander moment.',
      '<b>Geen juridische controle.</b> Schulden en illegale bouw gaan mee naar de nieuwe eigenaar.',
      '<b>Aanbetalen zonder contract</b> of aan iemand die je niet kent.',
      '<b>Het NIE te laat aanvragen.</b> Dan schuift de notaris op en loop je risico op je aanbetaling.',
      '<b>Uitgaan van verhuurinkomsten</b> zonder te checken of verhuur mag.',
    ]),
  ], [
    ('html', '<ol class="num">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (7, '<b>Onderhoud onderschatten.</b> Een zwembad, tuin en airco kosten geld, ook als je er niet bent.'),
      (8, '<b>Geen Spaans testament.</b> Je erfgenamen verliezen dan maanden en geld.'),
      (9, '<b>Niet-residentenbelasting vergeten.</b> Ook zonder verhuur doe je jaarlijks aangifte.'),
      (10, '<b>De zomerzon onderschatten.</b> Een westterras zonder schaduw is in augustus onbruikbaar.'),
      (11, '<b>Te ver van voorzieningen kopen</b> zonder auto, of zonder te denken aan later.'),
      (12, '<b>Alles zelf willen doen</b> in een taal en systeem dat je niet kent. Goede begeleiding verdient zich terug.'),
    ]) + '</ol>'),
  ]]),
  ('img', 'ai-16-cycling.jpg', 56, 'Goed voorbereid kopen betekent: daarna vooral genieten.', 'center 45%'),
]},

# ================================================================== DEEL 6
{'kind': 'opener', 'num': '06', 'img': 'ai-03-viewing.jpg', 'title': 'Je bezichtigings-<br>reis',
 'intro': 'Een goed voorbereide bezichtigingsreis is de snelste weg naar de juiste woning. Wij selecteren vooraf, plannen efficiënt en rijden je rond, zodat jij je kunt concentreren op het kiezen.',
 'inside': ['Voorbereiding', 'Paklijst', 'Een dag met ons', 'Ons kantoor']},

{'kind': 'page', 'label': 'Deel 6 · Voorbereiding', 'band': 'ai-11-plane.jpg', 'band_h': 62, 'band_pos': 'center', 'blocks': [
  ('h2', 'Zo bereid je de <em>reis</em> voor'),
  ('cols', [[
    ('h3', 'Wat wij vooraf van je nodig hebben'),
    ('check', ['Voor- en achternaam van alle kopers', 'Mobiel nummer en e-mailadres', 'Je reisdata en hoeveel dagen je hebt',
               'Je budget, alles inbegrepen', 'Eigen geld of hypotheek, en is die al voorlopig rond?', 'Je werkblad met wensen (pagina 8)',
               'Woningen die je online al zag, met referentie']),
    ('callout', 'tip', 'Tip van ons team', 'Kom niet in augustus als je kunt kiezen. Oktober tot en met juni is ideaal: aangenaam weer, rustige wegen en meer tijd en aandacht van ons team.'),
    ('h3', 'Hoeveel dagen?'),
    ('p', 'Reken op twee tot vier dagen. Dag 1 kennismaken en kijken, dag 2 verder kijken en terugkomen bij favorieten, dag 3 ruimte voor een tweede bezichtiging, de omgeving en eventueel de bank of de NIE.'),
  ], [
    ('h3', 'Paklijst'),
    ('check', ['Paspoort of identiteitskaart (ook nodig voor het NIE en de bank)', 'NIE, als je dat al hebt', 'Bewijs van inkomen en recente bankafschriften',
               'Je werkblad en deze gids', 'Telefoon met camera en volle batterij, powerbank', 'Meetlint voor meubels', 'Zonnebril, pet en water (ook in de winter)',
               'Gemakkelijke schoenen: trappen, dakterrassen, tuinen', 'Bankpas voor een eventuele reservering']),
    ('img', 'ai-05-planning.jpg', 60),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 6 · Een dag met ons', 'band': 'town-rojales-2.jpg', 'band_h': 72, 'band_pos': 'center 65%', 'blocks': [
  ('h2', 'Zo ziet een <em>bezichtigingsdag</em> eruit'),
  ('cols', [[
    ('steps', [
      ('Kennismaking op kantoor', 'Koffie in Formentera del Segura. We lopen je wensen nog eens door en laten je de route zien.', '10:00'),
      ('Woning 1 tot 3', 'We rijden je rond. Tussen de woningen vertellen we over de buurt, de dorpen en de prijzen.', '10:45'),
      ('Lunch', 'In een van de dorpen: even pauze, indrukken ordenen, vragen stellen. Vaak valt hier al een woning af.', '13:30'),
      ('Woning 4 tot 6', 'Op basis van wat je \'s ochtends zag, passen we het middagprogramma aan.', '15:00'),
      ('Evaluatie', 'Wat viel op, wat viel tegen? Welke woning wil je nog een keer zien, eventueel op een ander tijdstip?', '18:00'),
    ]),
  ], [
    ('img', 'ai-06-market.jpg', 62, 'Neem de tijd voor het dorp zelf: de markt vertelt je meer dan een plattegrond.'),
    ('callout', 'tip', 'Niet te veel', 'Meer dan zes tot acht woningen op een dag wordt een waas. Maak foto\'s van de straatnaam vóór je binnenstapt en schrijf meteen na elke woning drie plussen en drie minnen op.'),
    ('callout', 'soltura', 'Vooraf geselecteerd', 'Omdat we je wensen vooraf kennen, zie je alleen woningen die er echt toe doen. Vaak ook woningen die nog niet online staan.'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 6 · Ons kantoor', 'hero': 'office-crop.jpg', 'hero_h': 72, 'hero_pos': 'center', 'blocks': [
  ('sp', 66),
  ('cols', [[
    ('html', '<div class="kicker">Kom langs</div>'),
    ('h2', 'Ons kantoor in <em>Formentera del Segura</em>'),
    ('p', 'Midden in ons werkgebied, op een paar minuten van Rojales, Benijófar en Ciudad Quesada. Parkeren voor de deur.'),
    ('facts', [('Adres', 'Avda. de la Constitución s/n<br>03179 Formentera del Segura'), ('Openingstijden', 'ma-vr 10:00-14:00<br>za-zo op afspraak'),
               ('Telefoon', '+34 966 792 113'), ('WhatsApp', '+34 664 414 515'), ('E-mail', 'info@gruposoltura.com'), ('Talen', 'Nederlands, Engels, Duits, Spaans')]),
  ], [
    ('qr', LINKS['maps'], 'Route in Google Maps'),
    ('qr', LINKS['wa'], 'Stuur ons een WhatsApp'),
    ('qr', LINKS['contact'], 'Maak een afspraak'),
  ]], '1.25fr 1fr'),
  ('img', 'town-formentera-del-segura-1.jpg', 50, 'Het dorpsplein van Formentera del Segura met kerk en gemeentehuis, op een paar minuten van ons kantoor (Galopax, CC BY-SA 4.0).'),
]},

# ================================================================== DEEL 7
{'kind': 'opener', 'num': '07', 'img': 'ai-02-family.jpg', 'title': 'Na de sleutel:<br>wonen &amp; leven',
 'intro': 'Het huis kopen is één stap. Hier een leven opbouwen is de rest. Wij blijven ook na de notaris je aanspreekpunt, in je eigen taal.',
 'inside': ['De eerste 30 dagen', 'Belastingen', 'Testament', 'Emigreren met je gezin', 'Huisdieren', 'Het leven hier', 'Woordenlijst']},

{'kind': 'page', 'label': 'Deel 7 · De eerste 30 dagen', 'blocks': [
  ('h2', 'De eerste <em>30 dagen</em> na de sleutel'),
  ('lead', 'Je bent eigenaar. Dit regel je in de eerste weken, het meeste doen we samen met je of nemen we je uit handen.'),
  ('cols', [[
    ('h3', 'Huis en nuts'),
    ('check', ['Elektriciteit op je naam (met automatische incasso)', 'Water en afval op je naam', 'Internet en tv aanvragen (glasvezel?)',
               'Opstal- en inboedelverzekering afsluiten', 'Sloten laten vervangen', 'Alarmsysteem of camerabeveiliging overwegen',
               'Onderhoud tuin en zwembad regelen', 'Sleutelbeheer bij afwezigheid regelen']),
  ], [
    ('h3', 'Papieren'),
    ('check', ['IBI en basura op je naam en domiciliëren', 'Gemeenschap: beheerder informeren, incasso regelen', 'Inschrijving in het eigendomsregister controleren',
               'Spaans testament laten opstellen', 'Bij verhuizing: inschrijven in de gemeente (padrón)', 'Bij verhuizing: residencia aanvragen',
               'Als niet-resident: Modelo 210 in je agenda zetten', 'Kopie van alle akten digitaal bewaren']),
  ]]),
  ('callout', 'soltura', 'Nazorg in je eigen taal', 'Na de notaris zetten wij de nutsvoorzieningen, IBI en gemeenschapskosten op je naam. Daarna kun je voor vragen, lokale vakmensen en papierwerk gewoon bij ons terecht. Een klant schreef: "Ook van de service na verkoop was ik tevreden. Ik kon met vragen ook toen nog bij ze terecht."'),
  ('img', 'ai-08-dog.jpg', 52, '', 'center 55%'),
]},

{'kind': 'page', 'label': 'Deel 7 · Belastingen', 'band': 'ai-10-remote.jpg', 'band_h': 68, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Belastingen als <em>eigenaar</em>'),
  ('lead', 'Het grootste verschil zit in de vraag of je resident bent. Dat ben je in principe als je meer dan 183 dagen per jaar in Spanje woont of als je belangen hier liggen.'),
  ('table', ['', 'Niet-resident', 'Resident'], [
    ['Inkomstenbelasting', 'Over fictief inkomen van je woning (1,1-2% van de kadastrale waarde) en over huurinkomsten', 'Over je wereldinkomen, progressief tarief'],
    ['Tarief (EU-burger)', '19%', 'oplopend per schijf'],
    ['Aangifte', 'Modelo 210, jaarlijks (eigen gebruik) of per kwartaal (verhuur)', 'Jaarlijkse IRPF-aangifte (renta)'],
    ['IBI en basura', 'ja, jaarlijks aan de gemeente', 'ja, jaarlijks aan de gemeente'],
    ['Bij verkoop', '19% over de winst; koper houdt 3% in', 'progressief 19-30% over de winst; vrijstellingen mogelijk'],
    ['Gemeentelijke meerwaarde (plusvalía)', 'bij verkoop, betaald door de verkoper', 'bij verkoop, betaald door de verkoper'],
  ], 'compact'),
  ('cols', [[
    ('h3', 'Modelo 210: één keer per jaar'),
    ('p', 'Als niet-resident doe je elk jaar aangifte, ook als je de woning alleen zelf gebruikt. Wij verzorgen die aangifte voor veel van onze klanten; dat is ook een mooi jaarlijks contactmoment.'),
  ], [
    ('h3', 'Dubbele belasting'),
    ('p', 'Spanje heeft belastingverdragen met onder meer Nederland, België, Duitsland en het Verenigd Koninkrijk. Wie in Spanje en in eigen land aangifte doet, laat zich goed adviseren.'),
  ]]),
  ('callout', 'info', 'Goed om te weten', 'Belastingregels zijn persoonlijk. Deze pagina geeft een overzicht, geen advies. Voor jouw situatie werken we samen met fiscalisten die de Nederlandse, Belgische en Spaanse kant kennen.'),
]},

{'kind': 'page', 'label': 'Deel 7 · Testament', 'band': 'town-orihuela-costa-1.jpg', 'band_h': 66, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Erfrecht</div>'),
    ('h2', 'Een Spaans testament: <em>klein</em> moeite, groot verschil'),
    ('p', 'Een woning in Spanje valt onder Spaanse procedures, ook als je testament in eigen land goed geregeld is. Zonder Spaans testament moeten je erfgenamen eerst laten vaststellen wie erft. Dat kost maanden, vertalingen en geld, terwijl de woning niet verkocht of overgeschreven kan worden.'),
    ('h3', 'Waarom een Spaans testament'),
    ('ul', ['Snellere en goedkopere afwikkeling bij de Spaanse notaris.', 'Je kunt via de Europese Erfrechtverordening kiezen voor het erfrecht van je nationaliteit.',
            'Het Spaanse testament beperkt zich tot je bezit in Spanje en hoeft je testament thuis niet te vervangen.', 'Opstellen is eenvoudig: één afspraak bij de notaris.']),
    ('callout', 'tip', 'Erfbelasting in de Comunitat Valenciana', 'Partners, kinderen en ouders krijgen hier sinds 2023 een korting van 99% op de Spaanse erfbelasting. Laat je persoonlijke situatie wel nakijken: er gelden voorwaarden, en ook je eigen land kan heffen.'),
  ], [
    ('img', 'ai-16-cycling.jpg', 96, '', 'center'),
    ('callout', 'soltura', 'Zo doen wij het', 'Wij regelen een Spaans testament voor je bij de notaris, in je eigen taal toegelicht. Veel klanten doen het op dezelfde dag als de overdracht.'),
  ]], '1.15fr 1fr'),
]},

{'kind': 'page', 'label': 'Deel 7 · Emigreren', 'band': 'ai-02-family.jpg', 'band_h': 78, 'band_pos': 'center 35%', 'blocks': [
  ('h2', 'Emigreren met je <em>gezin</em>'),
  ('lead', 'Steeds meer van onze kopers zijn jonge gezinnen die hier een nieuw leven opbouwen. Dan is de woning de aanleiding en het leven het onderwerp.'),
  ('cols', [[
    ('cards', [
      {'icon': 'doc', 't': 'Inschrijven', 'x': '<b>Padrón</b>: inschrijving bij de gemeente, nodig voor school, zorg en veel lokale regelingen. <b>Residencia</b>: EU-burgers die langer dan drie maanden blijven, laten zich registreren als resident (bewijs van inkomen en zorgverzekering). Niet-EU-burgers hebben een visum of verblijfsvergunning nodig.'},
      {'icon': 'health', 't': 'Zorg', 'x': 'Werk je in Spanje, dan ben je verzekerd via de sociale zekerheid. EU-gepensioneerden zetten hun dekking vaak over met een S1-formulier. Anders een private zorgverzekering. Daarna inschrijven bij het gezondheidscentrum en de SIP-kaart aanvragen. Ziekenhuizen in Torrevieja en Orihuela. Alarmnummer 112.'},
    ], 1),
  ], [
    ('cards', [
      {'icon': 'school', 't': 'Scholen', 'x': 'Openbare scholen, semi-particuliere (concertado) en internationale scholen met een Brits of ander curriculum. Les op openbare scholen is in het Spaans en Valenciaans, met taalondersteuning voor nieuwkomers. Aanmelden meestal in het voorjaar; internationale scholen hebben vaak wachtlijsten. Je schoolkeuze kan bepalen waar je koopt.'},
      {'icon': 'laptop', 't': 'Werken op afstand', 'x': 'Met glasvezel in de meeste dorpen en urbanisaties werk je hier net zo goed als thuis. Voor niet-EU-burgers bestaat een visum voor digitale nomaden. Let op je belastingpositie zodra je resident wordt.'},
    ], 1),
  ]]),
  ('cta', LINKS['move'], 'Lees meer over emigreren', 'Op onze website vind je de stappen voor, tijdens en na de aankoop, en je kunt een persoonlijk stappenplan aanvragen.'),
]},

{'kind': 'page', 'label': 'Deel 7 · Huisdieren &amp; praktisch', 'band': 'town-guardamar-del-segura-3.jpg', 'band_h': 72, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('h2', 'Je <em>huisdier</em> gaat mee'),
    ('img', 'ai-08-dog.jpg', 60),
    ('h3', 'Binnen de EU reizen met hond of kat'),
    ('check', ['Chip (ISO-standaard)', 'Geldige rabiësvaccinatie, minstens 21 dagen voor vertrek', 'Europees dierenpaspoort',
               'Inschrijving bij een dierenarts in Spanje en registratie in het Valenciaanse dierenregister']),
    ('callout', 'tip', 'Tip van ons team', 'Let op processierupsen in de dennenbossen in februari en maart, en op hete tegels in de zomer. Een aansprakelijkheidsverzekering voor je hond is verstandig; de landelijke verplichting wacht nog op uitwerking.'),
  ], [
    ('h2', 'Praktisch <em>geregeld</em>'),
    ('h3', 'Je auto'),
    ('p', 'Ga je hier wonen, dan moet een auto met buitenlands kenteken op termijn een Spaans kenteken krijgen. Je rijbewijs uit de EU blijft geldig.'),
    ('h3', 'Veiligheid'),
    ('p', 'De Vega Baja is een rustige streek. Gezond verstand helpt: rolluiken, een goed slot, eventueel een alarm, en een buur of beheerder die een oogje in het zeil houdt als je weg bent.'),
    ('h3', 'Taal'),
    ('p', 'In de urbanisaties kom je ver met Engels. Wie in een Spaans dorp woont of kinderen naar school stuurt, heeft veel aan Spaans. De meeste gemeenten bieden betaalbare taalcursussen voor nieuwkomers.'),
    ('h3', 'Post en pakketten'),
    ('p', 'In veel urbanisaties wordt post niet aan huis bezorgd. Een postbus of een adres bij een servicepunt is handig.'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 7 · Het leven hier', 'band': 'ai-06-market.jpg', 'band_h': 46, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'Het leven in de <em>Vega Baja</em>'),
  ('cols', [[
    ('img', 'ai-07-food.jpg', 52, 'Rijst, vis en groenten uit de huerta: de keuken hier is eenvoudig en vers.'),
    ('h3', 'Eten en markten'),
    ('p', 'De huerta levert het hele jaar artisjokken, citrusvruchten, tomaten en granaatappels. Elke gemeente heeft een weekmarkt; die van Almoradí op zaterdag is een van de grootste. Probeer arroz con costra, caldero en een glas wijn uit de Vinalopó.'),
    ('h3', 'Natuur'),
    ('p', 'De roze zoutmeren van Torrevieja en La Mata, het natuurgebied El Hondo met flamingo\'s, de dennenbossen op de duinen van Guardamar en de Sierra Escalona: je wandelt en fietst hier het hele jaar.'),
  ], [
    ('img', 'ai-13-fiesta.jpg', 52, 'Elke gemeente viert zijn eigen fiestas, vaak dagenlang.'),
    ('h3', 'Feesten door het jaar'),
    ('table', ['Wanneer', 'Wat'], [
      ['januari', 'Driekoningen, optochten met snoep voor de kinderen'], ['februari', 'Carnaval, groot in Torrevieja'],
      ['maart/april', 'Semana Santa: processies, indrukwekkend in Orihuela'], ['juni', 'San Juan: vuurwerk en vuren op het strand'],
      ['juli/augustus', 'Fiestas in bijna elk dorp, Moros y Cristianos'], ['oktober', 'Fiestas in Rojales en in veel dorpen het oogstfeest'],
      ['december', 'Kerstmarkten en Nochevieja met twaalf druiven']], 'compact'),
    ('h3', 'Sport'),
    ('p', 'Golf (La Marquesa, La Finca, Las Colinas, Villamartín en meer), padel, zeilen, fietsen en wandelen.'),
  ]]),
]},

{'kind': 'page', 'label': 'Deel 7 · Woordenlijst', 'band': 'town-almoradi-2.jpg', 'band_h': 72, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'Handige <em>Spaanse</em> woorden voor kopers'),
  ('cols', [[
    ('table', ['Spaans', 'Betekenis'], [
      ['arras', 'aanbetaling / koopcontract met aanbetaling'], ['catastro', 'kadaster'], ['cédula de habitabilidad', 'bewoonbaarheidsverklaring'],
      ['comunidad de propietarios', 'vereniging van eigenaren'], ['escritura', 'notariële akte'], ['gestoría', 'administratiekantoor'],
      ['hipoteca', 'hypotheek'], ['IBI', 'onroerendgoedbelasting'], ['ITP', 'overdrachtsbelasting'], ['IVA', 'btw'],
      ['AJD', 'zegelrecht'], ['nota simple', 'uittreksel eigendomsregister'], ['NIE', 'identificatienummer buitenlander'],
    ], 'compact'),
  ], [
    ('table', ['Spaans', 'Betekenis'], [
      ['notaría', 'notariskantoor'], ['padrón', 'inschrijving bij de gemeente'], ['plusvalía', 'gemeentelijke meerwaardebelasting'],
      ['poder', 'volmacht'], ['Registro de la Propiedad', 'eigendomsregister'], ['residencia', 'verblijfsregistratie'], ['solarium', 'dakterras'],
      ['tasación', 'taxatie'], ['urbanización', 'woonwijk / urbanisatie'], ['huerta', 'tuinbouwgebied'], ['llave en mano', 'sleutelklaar'],
      ['obra nueva', 'nieuwbouw'], ['segunda mano', 'bestaande woning'],
    ], 'compact'),
  ]]),
  ('panel',) and ('html', '<div class="panel lemon" style="margin-top:3mm"><b>¡Bienvenidos!</b> Een paar woorden Spaans openen deuren. <i>Buenos días</i> bij de bakker, <i>gracias</i> bij de kassa en <i>¿qué tal?</i> bij de buren: je wordt sneller deel van het dorp dan je denkt.</div>'),
]},

# ================================================================== TOT SLOT
{'kind': 'page', 'label': 'Onze diensten', 'band': 'ai-04-keys.jpg', 'band_h': 72, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Wat <em>wij</em> voor je doen'),
  ('lead', 'Eén team van eerste kennismaking tot de maanden na de sleutel, in jouw taal. Je kiest wat je nodig hebt.'),
  ('cards', [
    {'icon': 'search', 't': 'Zoeken op maat', 'x': 'We selecteren woningen op jouw wensen, vaak al voordat ze online staan. Online zoek je zelf in je eigen woorden met onze AI-zoekfunctie.'},
    {'icon': 'shield', 't': 'Aankoopbegeleiding', 'x': 'Juridische controles, contracten, afstemming met notaris en bank, en een collega naast je op de dag van de overdracht.'},
    {'icon': 'bank', 't': 'Hypotheek', 'x': 'Contact met Spaanse banken, aanvraag, taxatie en begeleiding tot en met de notaris.'},
    {'icon': 'doc', 't': 'NIE, bank en volmacht', 'x': 'Formulieren, afspraken en desgewenst alles op afstand geregeld met een volmacht.'},
    {'icon': 'euro', 't': 'Modelo 210', 'x': 'Je jaarlijkse aangifte als niet-resident, zodat je er geen omkijken naar hebt.'},
    {'icon': 'key', 't': 'Testament en nazorg', 'x': 'Een Spaans testament, nutsvoorzieningen op je naam en een vast aanspreekpunt daarna.'},
    {'icon': 'home', 't': 'Verkopen', 'x': 'Gratis waardebepaling, professionele foto\'s, drone en 3D, en elke week een update over je woning.'},
    {'icon': 'people', 't': 'Netwerk', 'x': 'Betrouwbare vakmensen, beheerders, fiscalisten en advocaten die we al jaren kennen.'},
    {'icon': 'chat', 't': 'In je eigen taal', 'x': 'Nederlands, Engels, Duits en Spaans, ook na de aankoop. Online beantwoordt onze AI-assistent je vragen over elke woning, dag en nacht.'},
  ], 3),
  ('cta', LINKS['contact'], 'Tarieven en voorwaarden op aanvraag', 'Elke situatie is anders. Vertel ons wat je nodig hebt, dan ontvang je een helder voorstel zonder verrassingen.'),
]},

{'kind': 'page', 'label': 'Wat klanten zeggen', 'band': 'town-torrevieja-2.jpg', 'band_h': 44, 'band_pos': 'center 60%', 'blocks': [
  ('html', '<div style="display:flex;align-items:flex-end;gap:6mm;margin-bottom:3mm"><div><div class="kicker">Google-reviews</div><h2 style="margin:0">Wat klanten <em>zeggen</em></h2></div><div style="margin-left:auto;text-align:right"><div style="font-family:Fraunces;font-size:40pt;font-weight:700;line-height:1;color:#C63232">4,7<span style="font-size:20pt;color:#FBCC10"> ★★★★★</span></div><div class="small">gemiddeld op Google, ruim 45 reviews</div></div></div>'),
  ('cols', [[
    ('quote', 'Begin dit jaar hebben wij zelf een appartement in Spanje gekocht. Vanaf het eerste moment zijn we goed begeleid. Er werd goed geluisterd naar onze wensen en meegedacht. Zelfs het aanvragen van NIE-nummers, notaris en bankzaken wordt voor je verzorgd. Dat neemt enorm veel stress en zorgen weg.', 'Koper, 2026'),
    ('quote', 'Zeer goede ervaring. Twee keer een huis bij ze gekocht. Ze nemen de tijd voor je, zijn transparant over gebreken of niet-zichtbare kosten en zoeken alles grondig uit.', 'Koper'),
    ('quote', 'Rick and the team were recommended by a relative. The process of selling our villa was carried out in a very professional manner. A trouble-free experience.', 'Verkoper'),
  ], [
    ('quote', 'Super fijne en betrouwbare makelaar die ons meerdere malen uitstekend heeft bijgestaan met aan- en verkoopbemiddeling.', 'Koper en verkoper'),
    ('quote', 'Ontzettend fijn en kundig geholpen door Rick en zijn team. Ze regelen alles! Fijne mensen!', 'Koper, 2026'),
    ('quote', 'Zij zijn zeer behulpzaam en hebben kennis van zaken. Zeker aan te bevelen. Spreken ook Nederlands.', 'Klant, 2026'),
    ('qr', LINKS['reviews'], 'Lees alle reviews op Google'),
  ]]),
  ('small', 'Letterlijke citaten uit Google-reviews, ingekort waar aangegeven met de essentie behouden. Namen weggelaten.'),
]},

{'kind': 'page', 'label': 'Checklist', 'band': 'ai-01-cover.jpg', 'band_h': 80, 'band_pos': 'center 75%', 'blocks': [
  ('h2', 'Klaar om te <em>kopen</em>?'),
  ('lead', 'Vink af. Staan alle vinkjes, dan ben je klaar om toe te slaan als de juiste woning voorbijkomt.'),
  ('cols', [[
    ('h3', 'Voorbereiding'),
    ('check', ['Ik weet waarvoor ik koop (deel 1)', 'Mijn werkblad met wensen is ingevuld', 'Ik weet in welke 2-3 plaatsen ik wil zoeken',
               'Ik ken mijn totale budget, inclusief alle aankoopkosten', 'Mijn financiering is voorlopig rond', 'Mijn NIE is aangevraagd']),
    ('h3', 'De reis'),
    ('check', ['Mijn reisdata zijn bekend bij Soltura Real Estate', 'Ik heb paspoort, bankpas en inkomensbewijs bij me', 'Ik heb mijn eerste selectie woningen gezien']),
  ], [
    ('h3', 'De aankoop'),
    ('check', ['Ik heb een Spaanse bankrekening', 'De juridische controle is gedaan', 'Ik heb het koopcontract gelezen en begrepen',
               'De aankoopkosten staan apart', 'Mijn verhuurplannen zijn getoetst aan de regels', 'Ik heb een afspraak voor een Spaans testament']),
    ('h3', 'Daarna'),
    ('check', ['Nuts, IBI en verzekering staan op mijn naam', 'Modelo 210 of mijn residencia is geregeld', 'Ik geniet van mijn eerste avond op het terras']),
  ]]),
  ('cta', LINKS['contact'], 'Niet alles afgevinkt? Daar zijn wij voor.', 'Plan een vrijblijvend gesprek op kantoor, telefonisch of via video. We nemen samen de open punten door.'),
]},

{'kind': 'back', 'html': f'''
<div style="position:absolute;inset:0;background:url(assets/img/ai-14-beach.jpg) center top/cover"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,59,66,.15) 0%,rgba(46,59,66,.55) 30%,rgba(46,59,66,.97) 52%)"></div>
<div style="position:absolute;left:16mm;right:16mm;top:20mm">
  <div style="background:#fff;display:inline-block;border-radius:5mm;padding:4mm 5mm"><img src="assets/img/logo-square.png" style="height:30mm;display:block"/></div>
  <h1 style="font-family:Fraunces;font-weight:600;font-size:38pt;line-height:1.05;margin:12mm 0 4mm">Tot snel aan de<br>Costa Blanca</h1>
  <p style="font-size:12pt;max-width:150mm;opacity:.92">Vragen na het lezen? Bel, app of loop binnen. We denken graag met je mee, vrijblijvend en in je eigen taal.</p>
</div>
<div style="position:absolute;left:16mm;right:16mm;top:132mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm">
  <div style="font-size:10.5pt;line-height:1.7">
    <div style="color:#FBCC10;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:8pt;margin-bottom:2mm">Soltura Real Estate</div>
    Avda. de la Constitución s/n<br>03179 Formentera del Segura (Alicante)<br><br>
    <b>T</b> +34 966 792 113<br><b>WhatsApp</b> +34 664 414 515<br><b>E</b> info@gruposoltura.com<br><br>
    <b>Kantoor</b> ma-vr 10:00-14:00 · za-zo op afspraak
  </div>
  <div>
    <div class="qrrow" style="grid-template-columns:1fr 1fr;color:#2E3B42">
      <a class="qrbox v" href="{LINKS['home']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['home'])}</div><div class="qrl"><b>Ons aanbod</b></div></a>
      <a class="qrbox v" href="{LINKS['contact']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['contact'])}</div><div class="qrl"><b>Contact</b></div></a>
    </div>
  </div>
</div>
<div style="position:absolute;left:16mm;right:16mm;bottom:12mm;font-size:7.4pt;opacity:.75;line-height:1.5">
  Grupo Soltura SL · RAICV 5781 · API 992 Alicante · GIPE 3.473 · lid AIPP · gruposoltura.com<br>
  Deze gids bevat algemene informatie (stand oktober 2026) en is geen juridisch, fiscaal of financieel advies. Aan de inhoud kunnen geen rechten worden ontleend.
  Sfeerbeelden: deels gemaakt met AI; plaatsfoto's via Wikimedia Commons met vermelde licentie.
</div>'''},
]
