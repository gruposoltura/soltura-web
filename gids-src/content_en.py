import graphics as G

BASE = 'https://gruposoltura.com'
LINKS = {
    'home': BASE + '/en/', 'buy': BASE + '/en/buying/', 'move': BASE + '/en/move-to-spain/',
    'costs': BASE + '/en/move-to-spain/monthly-costs/', 'areas': BASE + '/en/areas/',
    'contact': BASE + '/en/contact/', 'sell': BASE + '/en/selling/',
    'town': BASE + '/en/living-in/{}/',
    'reviews': 'https://search.google.com/local/reviews?placeid=ChIJWa-hMmmvYw0R4qKf5TapVp4',
    'maps': 'https://www.google.com/maps/search/?api=1&query=Grupo%20Soltura&query_place_id=ChIJWa-hMmmvYw0R4qKf5TapVp4',
    'wa': 'https://wa.me/34664414515',
}
T = lambda s: LINKS['town'].format(s)

L = {
    'guide_title': 'At Home on the Costa Blanca',
    'part': 'Part',
    'saltlake': 'salt lakes', 'sea': 'Mediterranean Sea', 'river': 'River Segura',
    'office': 'our office', 'alc': 'Alicante Airport · approx. 30 min', 'rmu': 'Murcia Airport · approx. 45-60 min',
    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'layers': [('1 · The purchase price', 'What you agree with the seller', G.RED, 1.0),
               ('2 · Buying costs', 'Tax, notary, land registry: approx. 10-13% + guidance', G.CORAL, .78),
               ('3 · Annual costs', 'IBI, community fees, insurance, utilities, tax', G.LEMON, .56)],
    'proc': [('Orientation', 'weeks-months'), ('Viewing|trip', '2-4 days'), ('Offer', '1-3 days'),
             ('Reservation', 'immediately'), ('Purchase|contract', '1-3 weeks'), ('Checks', '2-6 weeks'),
             ('Notary', '1 day'), ('Keys &|aftercare', 'months')],
    'dt_q': 'What do you want from your Spanish home?',
    'dt_opts': [('Holiday|home', 'own use'), ('Winter', '3-6 months'), ('Relocate', 'with family'),
                ('Retirement', 'live here'), ('Letting', 'return')],
}

def tc(name, slug, photo, txt, sea, apt, who):
    return {'t': name, 'img': photo, 'x': f'{txt}<div style="margin-top:1.6mm;font-size:7.6pt;color:#2E3B42"><b>Sea</b> {sea} · <b>Airport</b> {apt}</div>'
            f'<div style="margin-top:1mm;font-size:7.6pt;color:#C63232;font-weight:700">Ideal for: {who}</div>', 'tag': slug}

PAGES = [
# ------------------------------------------------------------------ COVER
{'kind': 'cover', 'img': 'ai-01-cover.jpg', 'kicker': 'Living & buying guide 2026',
 'title': 'At Home on the<br>Costa Blanca',
 'sub': 'Everything you want to know before buying a home in the Vega Baja and on the southern Costa Blanca, and what to expect when you come to live here.',
 'edition': 'Soltura Real Estate · since 2002'},

# ------------------------------------------------------------------ WELCOME
{'kind': 'page', 'label': 'Welcome', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">A word before you start</div>'),
    ('h2', 'Welcome to your <em>new</em> back garden'),
    ('lead', 'Thank you for requesting this guide. If you are reading it, your dream of a home in the sun is probably starting to take shape.'),
    ('p', 'Since 2002 we have been helping people find a home in the Vega Baja: the green hinterland of the southern Costa Blanca, between the River Segura, the salt lakes and the sea. Over those years we have watched our buyers change. Where people once mainly bought holiday homes, we now increasingly meet families building a new life here, people who work remotely and retirees who want to swap winter for light.'),
    ('p', 'What hasn\'t changed: buying in Spain works differently from back home. Different procedures, different taxes, different pitfalls. This guide sets it all out, honestly and without the sales talk. You\'ll read what it really costs, which questions to ask yourself first, how the purchase works and what comes after you get the keys.'),
    ('p', 'These days many people arrive with a list they put together with AI. That\'s fine, and a good place to start. But the questions that really make the difference are rarely on that list. You\'ll find them here. We use AI ourselves too, across everything we do online, so you are better and more fully informed before we even meet.'),
    ('p', 'Any questions after reading? Call, send a WhatsApp or drop in at our office in Formentera del Segura. The coffee\'s on.'),
    ('html', '<div class="sig">Rick van Hoeven</div><p class="small" style="margin-top:1mm">Co-founder, Soltura Real Estate</p>'),
  ], [
    ('img', 'office-crop.jpg', 60, 'Our office in Formentera del Segura.'),
    ('quote', 'What makes Rick special is that he only talks about things he genuinely knows about.', 'Google review, October 2026 (translated from Dutch)'),
    ('html', '<div class="panel lemon"><div class="kicker" style="margin-bottom:1mm">In this guide</div><p style="margin:0">7 parts · checklists to tick off · worked examples · QR codes to our website</p></div>'),
  ]], '1.25fr 1fr'),
]},

# ------------------------------------------------------------------ ABOUT US
{'kind': 'page', 'label': 'About Soltura Real Estate', 'band': 'town-torrevieja-3.jpg', 'band_h': 32, 'band_pos': 'center 60%', 'hero': 'ai-09-aerial.jpg', 'hero_h': 78, 'hero_pos': 'center 60%', 'blocks': [
  ('sp', 72),
  ('h2', 'Local experts, <em>always one step ahead</em>'),
  ('stats', [('2002', 'active in the Vega Baja'), ('4.7★', 'average on Google'), ('4', 'languages: NL · EN · DE · ES'), ('AI', 'in all our online channels')]),
  ('cols', [[
    ('h3', 'Who we are'),
    ('p', 'Soltura Real Estate is an estate agency with a physical office in Formentera del Segura, right in the heart of the area we cover. We know Rojales, Ciudad Quesada, Benijófar, Guardamar, Torrevieja, Orihuela Costa and the villages in between street by street.'),
    ('p', 'We are listed in the Valencian register of estate agents (RAICV 5781), member no. 992 of the API association of Alicante, and affiliated with GIPE and the AIPP.'),
  ], [
    ('h3', 'Pioneering, now with AI'),
    ('p', 'We were among the first with drone footage, our own app and property details by text message, long before everyone had a smartphone. Today we use AI in everything we publish online. On our website you search in your own words and ask questions about any property, day and night, with answers drawn from the actual property data.'),
    ('p', 'The aim: that you, as a buyer, are better and more fully informed, even before your first conversation with us.'),
  ]]),
  ('callout', 'soltura', 'What our clients tell us', 'Clients describe our website and our contact via social media as a pleasant experience: clear, quick to respond and all the information in one place. That is exactly why we keep innovating.'),
]},

# ------------------------------------------------------------------ CONTENTS
{'kind': 'page', 'label': 'Contents', 'blocks': [
  ('h2', 'Contents'),
  ('html', '''<div class="toc">
<div class="tocp"><span class="tn">01</span><div><b>Think first, then look</b><span>The 10 questions to ask first · what kind of buyer are you · wish-list worksheet</span></div><span class="tpg">5</span></div>
<div class="tocp"><span class="tn">02</span><div><b>Where do you want to live?</b><span>Map of the Vega Baja · coast or village · 12 towns · climate · getting here</span></div><span class="tpg">9</span></div>
<div class="tocp"><span class="tn">03</span><div><b>What does it really cost?</b><span>The three cost layers · worked examples · annual costs · mortgage</span></div><span class="tpg">16</span></div>
<div class="tocp"><span class="tn">04</span><div><b>Which property suits you?</b><span>Property types compared · new build or resale · letting · viewing smartly</span></div><span class="tpg">21</span></div>
<div class="tocp"><span class="tn">05</span><div><b>The buying process step by step</b><span>Timeline · NIE and power of attorney · legal checks · the 12 costliest mistakes</span></div><span class="tpg">26</span></div>
<div class="tocp"><span class="tn">06</span><div><b>Your viewing trip</b><span>Preparation and packing list · what a day looks like · our office</span></div><span class="tpg">32</span></div>
<div class="tocp"><span class="tn">07</span><div><b>After the keys: living here</b><span>The first 30 days · taxes · will · moving with your family · pets · life here</span></div><span class="tpg">36</span></div>
<div class="tocp end"><span class="tn">→</span><div><b>Finally</b><span>Our services · what clients say · checklist "Ready to buy?" · contact</span></div><span class="tpg">44</span></div>
</div>'''),
  ('h3', 'How to use this guide'),
  ('cards', [
    {'icon': 'check', 't': 'Checklists', 'x': 'Tick off what you have already arranged. Print the pages or fill them in digitally.'},
    {'icon': 'euro', 't': 'Worked examples', 'x': 'Real figures based on the tax rates in force in October 2026.'},
    {'icon': 'sun', 't': 'Tips from our team', 'x': 'What more than twenty years in practice have taught us, in a nutshell.'},
    {'icon': 'search', 't': 'QR codes', 'x': 'Scan for the latest page on our website, our listings or to book an appointment.'},
  ], 4),
  ('small', 'This guide contains general information, not personal legal, tax or financial advice. Rules and rates change; information as of October 2026. We are happy to look at your own situation.'),
]},

# ================================================================== PART 1
{'kind': 'opener', 'num': '01', 'img': 'ai-05-planning.jpg', 'title': 'Think first,<br>then look',
 'intro': 'The best purchases don\'t start on a property website, but at the kitchen table. If you know what you want beforehand, you\'ll see at a glance during your viewing trip which house it will be, and which it won\'t.',
 'inside': ['The 10 questions to ask first', 'What kind of buyer are you?', 'Worksheet: your wishes']},

{'kind': 'page', 'label': 'Part 1 · Think first', 'blocks': [
  ('h2', 'The 10 questions to ask <em>yourself</em> first'),
  ('lead', 'Answer them honestly, ideally together with your partner or family. They decide where you search, what you can spend and how quickly you can act.'),
  ('cols', [[
    ('ol', [
      '<b>Why am I buying?</b> Holidays, wintering, relocating, retirement or letting. The purpose decides the location, the type of property and even how you finance it.',
      '<b>How many months a year will I be here?</b> A few weeks calls for something different from the whole year: think of maintenance, security and whether you want to let the property.',
      '<b>What is my total budget?</b> Not just the purchase price: add 10 to 13% buying costs, guidance and a buffer. We do the sums in Part 3.',
      '<b>Am I buying with my own money or with a mortgage?</b> As a non-resident you can usually finance 60 to 70%. Know your limits before you start viewing.',
      '<b>Sea, golf or Spanish village?</b> The coast is busy in summer; inland is quieter, better value and more authentic.',
    ]),
  ], [
    ('html', '<ol class="num" start="6">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (6, '<b>How important are amenities within walking distance?</b> Without a car you\'ll want to live close to shops, doctors and transport. In many urbanisations you need a car.'),
      (7, '<b>Will I still manage the stairs later on?</b> Think fifteen years ahead: a bedroom and bathroom on the ground floor are worth their weight in gold.'),
      (8, '<b>How important is privacy?</b> Detached, semi-detached or an apartment with a communal pool: it makes a difference in price and in how you live.'),
      (9, '<b>Who will look after the house when I\'m away?</b> A garden with a pool needs weekly attention. Budget for management.'),
      (10, '<b>What if my plans change?</b> Buy a property that will sell well later: a good location is the best insurance.'),
    ]) + '</ol>'),
    ('callout', 'tip', 'Tip from our team', 'Buying as a couple? Answer the questions separately first, then compare. The differences are exactly the conversations you\'d rather have at home than during a viewing.'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 1 · Think first', 'blocks': [
  ('h2', 'What kind of <em>buyer</em> are you?'),
  ('lead', 'Every buyer is looking for something different. Recognise yourself? Then you\'ll know straight away where to put the emphasis.'),
  ('svg', G.decision_tree(L)),
  ('sp', 3),
  ('cards', [
    {'t': 'Holiday home', 'x': 'You\'re here a few weeks a year. Choose low maintenance: an apartment or bungalow with a communal pool, close to the sea and the airport. Arrange management and key holding.'},
    {'t': 'Wintering', 'x': 'Three to six months in the sun. Look for winter comfort: a heat pump, afternoon sun on the terrace, insulation. A lively community in winter makes a big difference.'},
    {'t': 'Relocating with family', 'x': 'The house is the reason, life is the subject. Schools, healthcare, work and a real neighbourhood matter more than the view. Read Part 7 first.'},
    {'t': 'Retirement', 'x': 'Single-level living, hospital and pharmacy within reach, a social life. Think ahead: what if driving becomes harder?'},
    {'t': 'Letting', 'x': 'Returns depend on the licence, the location and occupancy outside the season. The rules have become stricter; read page 24 before doing the sums.'},
    {'t': 'A combination', 'x': 'Use it yourself and let it when you\'re away? Possible, but the holiday-letting rules decide what is feasible. Discuss it with us first.'},
  ], 3),
]},

{'kind': 'page', 'label': 'Part 1 · Worksheet', 'blocks': [
  ('h2', 'Worksheet: <em>must</em> have, nice to have'),
  ('lead', 'Fill this in before you start viewing and bring it on your viewing trip. It also helps us select the right properties for you in advance.'),
  ('cols', [[
    ('lines', 6, 'Must have (no deal without it)'),
    ('lines', 6, 'Nice to have'),
    ('lines', 3, 'Absolutely not'),
  ], [
    ('h3', 'Tick what matters'),
    ('check', ['Walking distance to shops and cafés', 'Sea view or open view', 'Private pool', 'A communal pool is fine',
               'Bedroom + bathroom on the ground floor', 'Roof terrace (solarium)', 'Garden / outdoor space for a pet',
               'Garage or own parking space', 'Guest accommodation or extra bedroom', 'Workspace with good internet',
               'Spanish village, not an urbanisation', 'International neighbours', 'Golf course nearby', 'School close by',
               'Holiday-let licence possible']),
    ('html', '<div class="panel lemon" style="margin-top:2mm"><b>My budget, all-in:</b><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div><div style="margin-top:2mm"><b>I want to buy before:</b></div><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div></div>'),
  ]]),
]},

# ================================================================== PART 2
{'kind': 'opener', 'num': '02', 'img': 'town-rojales-1.jpg', 'title': 'Where do you<br>want to live?',
 'intro': 'The Vega Baja is the green heart of the southern Costa Blanca: lemon groves along the River Segura, pink salt lakes, miles of sandy beach and Spanish villages where life simply carries on when the tourists have gone.',
 'inside': ['Map of our area', 'Coast, urbanisation or village', '12 towns', 'Climate', 'Getting here']},

{'kind': 'page', 'label': 'Part 2 · Our area', 'blocks': [
  ('html', '<div class="kicker">Our area</div>'),
  ('h2', 'The Vega Baja at a <em>glance</em>'),
  ('lead', 'From our office in Formentera del Segura you can reach almost anywhere within half an hour: the beach at Guardamar, the centre of Torrevieja or Alicante airport.'),
  ('cols', [[
    ('svg', G.vega_map(L)),
    ('small', 'Schematic map, not to scale. Photo on previous page: the Carlos III bridge in Rojales (Orniosviajero, CC BY-SA 4.0).'),
  ], [
    ('h3', 'From our office'),
    ('table', ['Destination', 'By car'], [
      ['Guardamar beach', 'approx. 12 min'], ['Torrevieja centre', 'approx. 20 min'], ['Orihuela Costa', 'approx. 25 min'],
      ['Alicante airport', 'approx. 30 min'], ['Murcia airport', 'approx. 45-60 min'], ['Alicante city', 'approx. 40 min'],
      ['Torrevieja hospital', 'approx. 20 min']], 'compact'),
    ('callout', 'soltura', 'Why here?', 'Rojales has been our heart since 2002. We deliberately work in an area we truly know, so we can tell you which street gets the afternoon sun on the terrace and where it gets busy in August.'),
  ]], '1.35fr 1fr'),
]},

{'kind': 'page', 'label': 'Part 2 · Where to live', 'blocks': [
  ('h2', 'Coast, urbanisation or <em>Spanish village</em>?'),
  ('lead', 'The biggest difference isn\'t the house, it\'s the surroundings. In the Vega Baja you choose, roughly speaking, between three worlds, often only ten minutes apart.'),
  ('cards', [
    {'img': 'town-torrevieja-3.jpg', 'tag': 'On the coast', 't': 'Beach within walking distance', 'x': 'Guardamar, Torrevieja, La Mata, Orihuela Costa.<br><br><b>+</b> sea, promenades, everything close by, easy to let<br><b>−</b> busy in July and August, higher prices, more apartments and high-rise'},
    {'img': 'town-ciudad-quesada-1.jpg', 'tag': 'Urbanisation', 't': 'International and green', 'x': 'Ciudad Quesada, La Marina, Los Montesinos, La Finca.<br><br><b>+</b> spacious villas and bungalows, golf, international community, many Dutch and English speakers<br><b>−</b> you often need a car, less Spanish village life'},
    {'img': 'town-rojales-2.jpg', 'tag': 'Village centre', 't': 'Real Spanish life', 'x': 'Rojales, Formentera, Benijófar, Almoradí, Dolores, Catral.<br><br><b>+</b> authentic, lively all year, better value, schools and market in the village<br><b>−</b> speaking Spanish helps, fewer pools, narrower streets'},
  ], 3),
  ('callout', 'tip', 'Tip from our team', 'Visit your favourite spot twice: on a weekday evening in November and on a Saturday in August. Only then will you really know what it\'s like to live there.'),
  ('small', 'Photos: La Mata (Ximonic, CC BY-SA 4.0), Ciudad Quesada (H. Helmlechner, CC BY-SA 4.0), Rojales (Ximonic, CC BY-SA 4.0), via Wikimedia Commons.'),
]},

{'kind': 'page', 'label': 'Part 2 · Towns', 'blocks': [
  ('h2', 'Towns in the <em>spotlight</em> (1/2)'),
  ('cards', [
    tc('Rojales', 'Our heart', 'town-rojales-1.jpg', 'Old huerta village on the Segura with a quiet Spanish centre. With Ciudad Quesada above it, you have every amenity.', '9 km', '30 min', 'Spanish village life plus amenities'),
    tc('Ciudad Quesada', 'Rojales', 'town-ciudad-quesada-2.jpg', 'Green, international residential area on the hills, with La Marquesa golf course, restaurants and a water park.', '8 km', '30 min', 'families, golfers, winter visitors'),
    tc('Formentera del Segura', 'Our office', 'town-formentera-del-segura-1.jpg', 'Compact village on the Segura with a church square and the newer Los Palacios district. Rojales and Benijófar are right next door.', '10 km', '30 min', 'peace with everything nearby'),
    tc('Benijófar', 'Small & friendly', 'town-benijofar-1.jpg', 'One of the smallest municipalities in the area, set among the huerta. About half the residents come from abroad.', '11 km', '35 min', 'a village with international neighbours'),
    tc('Guardamar del Segura', 'By the sea', 'town-guardamar-del-segura-3.jpg', 'More than 11 km of sandy beach with a large pine forest on the dunes and a town centre that is lively all year round.', '0.5-1 km', '25-30 min', 'beach lovers, walkers'),
    tc('Torrevieja', 'Seaside city', 'town-torrevieja-2.jpg', 'Lively city between two pink salt lakes and the sea, with residents from more than a hundred countries. Everything within reach.', 'by the sea', '35 min', 'city, sea and amenities'),
  ], 3),
  ('qr', LINKS['areas'], 'All 16 town guides with facts, schools, healthcare and fiestas'),
]},

{'kind': 'page', 'label': 'Part 2 · Towns', 'blocks': [
  ('h2', 'Towns in the <em>spotlight</em> (2/2)'),
  ('cards', [
    tc('Orihuela Costa', 'Coast', 'town-orihuela-costa-2.jpg', '16 km of coastline with coves, golf courses and the La Zenia Boulevard shopping centre. Full in summer.', 'by the sea', '45 min', 'sun, sea and golf'),
    tc('San Miguel de Salinas', 'Hill village', 'town-san-miguel-de-salinas-1.jpg', 'Hill village overlooking the salt lake, with the nature of the Sierra Escalona on the doorstep.', '12 km', '40 min', 'nature and peace, near the coast'),
    tc('Almoradí', 'Market town', 'town-almoradi-2.jpg', 'Lively Spanish town with a large square shaded by ficus trees and the well-known Saturday market.', '15 km', '35 min', 'those who want to live in real Spain'),
    tc('Algorfa', 'Golf', 'town-algorfa-1.jpg', 'Small village with large urbanisations, including the La Finca golf resort. Quiet, lived in all year round.', '15 km', '35 min', 'golfers and peace seekers'),
    tc('Los Montesinos', 'By the salt lake', 'town-los-montesinos-2.jpg', 'Compact village among citrus fields, a few kilometres from Torrevieja\'s pink lake.', '12 km', '40 min', 'peace, close to Torrevieja'),
    tc('Dolores &amp; Catral', 'Huerta', 'town-dolores-2.jpg', 'Affordable farming villages with schools, a health centre and a weekly market. Many fincas and rural homes.', '13-20 km', '30 min', 'space, fincas, families'),
  ], 3),
  ('small', 'Photos via Wikimedia Commons: Orihuela Costa (Ximonic), San Miguel (Ximonic), Almoradí (Asdflkjh), Algorfa (19Tarrestnom65), Los Montesinos (Joanbanjo), Dolores (Wikimedia Commons), Rojales (Orniosviajero), Quesada (H. Helmlechner), Formentera &amp; Benijófar (Galopax), Guardamar (Salu Heredia, CC BY 3.0), Torrevieja (Werner Wilmes, CC BY 2.0); others CC BY-SA. Distances are indicative.'),
]},

{'kind': 'page', 'label': 'Part 2 · Climate', 'hero': 'ai-14-beach.jpg', 'hero_h': 62, 'blocks': [
  ('sp', 56),
  ('cols', [[
    ('h2', '320 days of sun is <em>no</em> sales pitch'),
    ('p', 'The southern Costa Blanca is one of the driest and sunniest regions in Europe. The World Health Organization once called the climate here one of the healthiest in the world; the dry air and the salt lakes are a relief for anyone with joint or respiratory complaints.'),
  ], [
    ('stats', [('2,900', 'hours of sunshine a year (approx.)'), ('300', 'mm of rain a year (approx.)'), ('18°', 'daytime in December'), ('26°', 'sea temperature in August')], 2),
  ]], '1.1fr 1fr'),
  ('h3', 'Temperature by month (Alicante, average) — bar: min/max · dotted line: sea'),
  ('svg', G.climate_chart(L)),
  ('cols', [[('p', '<b>Winter</b> (Dec-Feb): sunny and mild, chilly at night. You sit on the terrace by day; in the evening you\'ll want heating.')],
            [('p', '<b>Spring &amp; autumn</b>: the best weather, ideal for viewings, golf and walking. The occasional heavy shower.')],
            [('p', '<b>Summer</b> (Jun-Sep): hot, 30 degrees and above. Air conditioning and shade are no luxury. August is the busiest month.')]]),
  ('small', 'Source: AEMET long-term averages, rounded. Sea temperatures are indicative.'),
]},

{'kind': 'page', 'label': 'Part 2 · Getting here', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Getting here</div>'),
    ('h2', 'Closer to home than you <em>think</em>'),
    ('lead', 'Two international airports within an hour, with direct flights all year round to the Netherlands, Belgium, Germany, Scandinavia and the United Kingdom.'),
    ('table', ['From', 'Flight time (approx.)'], [
      ['Amsterdam, Eindhoven, Rotterdam', '2 h 30 - 2 h 45'], ['Brussels, Charleroi', '2 h 20'],
      ['Düsseldorf, Cologne, Weeze', '2 h 30'], ['London, Manchester', '2 h 15 - 2 h 30'],
      ['Stockholm, Copenhagen', '3 h 30 - 3 h 45']], 'compact'),
    ('small', 'Flight times are indicative. Schedules vary by season.'),
  ], [
    ('img', 'ai-11-plane.jpg', 70, 'Coming in to land at Alicante, you can already see the pink salt lakes.'),
  ]], '1.1fr 1fr'),
  ('cards', [
    {'icon': 'plane', 't': 'Alicante-Elche (ALC)', 'x': 'The largest airport in the region, approx. 30 minutes from Rojales. Plenty of flights, in winter too.'},
    {'icon': 'plane', 't': 'Murcia (RMU)', 'x': 'Smaller and quieter, approx. 45 to 60 minutes away. Often handy for the southern part of the coast.'},
    {'icon': 'car', 't': 'By car', 'x': 'Approx. 1,900 km from the Netherlands. The AP-7 and the CV-91/CV-95 connect all the villages. Living in the urbanisations without a car is difficult.'},
    {'icon': 'people', 't': 'Public transport', 'x': 'Bus links between the larger towns and to the airport. Trains from Alicante and Elche to Madrid (approx. 2 h 15).'},
  ], 2),
]},

# ================================================================== PART 3
{'kind': 'opener', 'num': '03', 'img': 'ai-15-bank.jpg', 'title': 'What does it<br>really cost?',
 'intro': 'The asking price is only the beginning. If you know in advance what comes on top and what a home costs per year, you buy with peace of mind and still have money left for the furniture.',
 'inside': ['The three cost layers', 'Worked examples', 'Annual costs', 'Mortgage']},

{'kind': 'page', 'label': 'Part 3 · Costs', 'blocks': [
  ('h2', 'The three <em>cost layers</em>'),
  ('lead', 'Think in three layers. If you only look at the first, you\'ll get surprises at the notary or after the first year.'),
  ('svg', G.cost_layers(L)),
  ('sp', 3),
  ('h3', 'Layer 2 in detail: what you pay on top of the price'),
  ('table', ['Cost item', 'Resale property', 'New build (from a developer)'], [
    ['Transfer tax', '<b>ITP 9%</b> of the price (11% above €1 million)', '—'],
    ['VAT', '—', '<b>IVA 10%</b> of the price'],
    ['Stamp duty', '—', '<b>AJD 1.4%</b> of the price'],
    ['Notary', 'approx. €800 - 1,500', 'approx. €800 - 1,500'],
    ['Land registry', 'approx. €400 - 900', 'approx. €400 - 900'],
    ['Gestoría (processing, paying taxes)', 'approx. €300 - 500', 'approx. €300 - 500'],
    ['NIE, power of attorney, translations', 'depends on your situation', 'depends on your situation'],
    ['Legal checks and guidance', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">on request →</b></a>', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">on request →</b></a>'],
    ['!Rule of thumb, total', '!approx. 10 - 11% + guidance', '!approx. 12 - 13% + guidance'],
  ], 'compact'),
  ('callout', 'info', 'Good to know', 'These rates have applied in the Comunitat Valenciana since 1 June 2026 (ITP reduced from 10 to 9%, AJD from 1.5 to 1.4%). Lower rates apply, subject to conditions, for a main home bought by under-35s, large families and people with a disability. If you take out a mortgage, since 2019 the bank pays the tax and the notary for the mortgage deed; you pay for the valuation.'),
]},

{'kind': 'page', 'label': 'Part 3 · Worked examples', 'blocks': [
  ('h2', 'Worked examples: <em>this</em> is how it looks'),
  ('lead', 'Two common situations, at October 2026 rates. Additional costs are averages; we are happy to prepare your personal breakdown.'),
  ('cols', [[
    ('h4', 'Resale bungalow · €250,000'),
    ('table', ['Item', 'Amount'], [
      ['Purchase price', '€250,000'], ['ITP 9%', '€22,500'], ['Notary', 'approx. €1,000'], ['Registry', 'approx. €600'],
      ['Gestoría', 'approx. €400'], ['Guidance', 'on request'], ['!Total excl. guidance', '!approx. €274,500']], 'num'),
    ('h4', 'Resale villa · €400,000'),
    ('table', ['Item', 'Amount'], [
      ['Purchase price', '€400,000'], ['ITP 9%', '€36,000'], ['Notary', 'approx. €1,200'], ['Registry', 'approx. €800'],
      ['Gestoría', 'approx. €450'], ['Guidance', 'on request'], ['!Total excl. guidance', '!approx. €438,450']], 'num'),
  ], [
    ('h4', 'New-build apartment · €250,000'),
    ('table', ['Item', 'Amount'], [
      ['Purchase price', '€250,000'], ['IVA 10%', '€25,000'], ['AJD 1.4%', '€3,500'], ['Notary', 'approx. €1,000'],
      ['Registry', 'approx. €600'], ['Gestoría', 'approx. €400'], ['Guidance', 'on request'], ['!Total excl. guidance', '!approx. €280,500']], 'num'),
    ('callout', 'warn', 'New build: watch out', 'You pay VAT on every instalment: on the reservation deposit, on the stage payments and on the balance at completion. Allow for that in your planning.'),
    ('callout', 'tip', 'Tip from our team', 'Set the buying costs aside as soon as you reserve a property. At the notary everything has to be ready in one go, including a cheque or transfer for the tax.'),
  ]]),
  ('cta', LINKS['contact'], 'Request your personal cost breakdown', 'Tell us which property or budget you have in mind. You\'ll receive a tailored breakdown with every item that applies to your situation.'),
]},

{'kind': 'page', 'label': 'Part 3 · Annual costs', 'blocks': [
  ('h2', 'What does a home cost <em>per year</em>?'),
  ('lead', 'Layer 3 is the one most often forgotten. These amounts are examples for the Vega Baja; they vary by municipality, urbanisation and property.'),
  ('table', ['Item', 'Apartment', 'Bungalow / semi-detached', 'Villa with pool'], [
    ['IBI (property tax)', '€300 / year', '€400 / year', '€700 / year'],
    ['Refuse charge (basura)', '€120 / year', '€120 / year', '€140 / year'],
    ['Community fees (comunidad)', '€70 / month', '€45 / month', 'usually none'],
    ['Buildings and contents insurance', '€250 / year', '€350 / year', '€550 / year'],
    ['Garden and pool maintenance', '—', '—', '€60+ / month'],
    ['Electricity', '€70 / month', '€90 / month', '€140 / month'],
    ['Water', '€25 / month', '€35 / month', '€60 / month'],
    ['Internet and mobile', '€50 / month', '€50 / month', '€50 / month'],
  ], 'num compact'),
  ('cols', [[
    ('h3', 'Tax as a non-resident'),
    ('p', 'If you are not officially resident in Spain, you pay tax even when you don\'t let the property: on a deemed income of 1.1% (sometimes 2%) of the cadastral value. For residents of the EU, Norway and Iceland the rate is 19%.'),
    ('html', '<div class="panel"><b>Example:</b> cadastral value €100,000 × 1.1% = €1,100 deemed income × 19% = <b>approx. €209 a year</b>. Filed on Modelo 210, by 31 December of the following year.</div>'),
  ], [
    ('h3', 'Work it out yourself'),
    ('p', 'Our website has a monthly-costs calculator. Choose the property type, household, healthcare and car, and you\'ll see straight away what living here costs per month. What you enter stays in your own browser.'),
    ('qr', LINKS['costs'], 'Monthly-costs calculator'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 3 · Financing', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Financing</div>'),
    ('h2', 'A Spanish mortgage: <em>this</em> is how it works'),
    ('lead', 'If you arrange your financing in good time, you know which properties are within reach and can act fast when the right one comes along.'),
    ('table', ['', 'Non-resident', 'Resident'], [
      ['Maximum loan', 'usually 60 - 70%', 'up to approx. 80%'], ['Term', 'often until age 70-75', 'often until age 75'],
      ['Own funds', '30 - 40% + costs', '20% + costs'], ['Interest', 'fixed, variable or mixed', 'fixed, variable or mixed']], 'compact'),
    ('h3', 'What the bank will ask for'),
    ('check', ['Passport and NIE', 'Proof of income (payslips or annual accounts)', 'Most recent tax returns', 'Bank statements for recent months', 'Overview of existing loans', 'Employment contract or pension statement']),
  ], [
    ('img', 'ai-15-bank.jpg', 52),
    ('h3', 'The process in 4 steps'),
    ('steps', [('Agreement in principle', 'Based on your income and own funds, the bank decides how much you can borrow. Do this before your viewing trip.'),
               ('Valuation (tasación)', 'An accredited valuer sets the value. The bank lends on the lower of the valuation and the purchase price.'),
               ('Binding offer (FEIN)', 'You receive it at least ten days before the notary. At the notary you confirm that you understand it.'),
               ('Signing', 'You sign the title deed and the mortgage deed at the notary on the same day.')]),
    ('callout', 'soltura', 'How we do it', 'We put you in touch with Spanish banks and handle the mortgage from application to notary. We\'ll also take care of opening a Spanish bank account for you.'),
  ]]),
]},

# ================================================================== PART 4
{'kind': 'opener', 'num': '04', 'img': 'ai-12-newbuild.jpg', 'title': 'Which property<br>suits you?',
 'intro': 'Apartment or villa, new build or a home with character, for your own use or to let: every choice affects your budget, your maintenance and your enjoyment.',
 'inside': ['Property types compared', 'New build or resale', 'Letting: the rules', 'Viewing smartly']},

{'kind': 'page', 'label': 'Part 4 · Property types', 'blocks': [
  ('h2', 'Property types <em>compared</em>'),
  ('lead', 'You\'ll come across the Spanish terms on every property website. This is what they mean, and this is where the differences lie.'),
  ('table', ['Type', 'What is it?', 'Pros', 'Watch out for'], [
    ['<b>Apartment</b> (apartamento)', 'A home in a complex, often with a communal pool', 'Low maintenance, secure, affordable', 'Community fees, noise from neighbours, lift?'],
    ['<b>Penthouse</b> (ático)', 'Top floor with a large terrace or solarium', 'Light, views, privacy', 'Hot in summer, stairs if there\'s no lift'],
    ['<b>Bungalow</b>', 'Ground- or first-floor apartment in a low-rise complex, own entrance', 'Single-level option, own terrace, popular', 'Ground floor: privacy; upper floor: stairs'],
    ['<b>Quad / semi-detached</b> (quad, adosado)', 'One of four or more joined homes', 'Own garden, cheaper than detached', 'Shared walls, community rules'],
    ['<b>Townhouse</b> (casa adosada, dúplex)', 'Terraced house over two floors', 'Space, often a roof terrace', 'Stairs, bedrooms upstairs'],
    ['<b>Villa</b> (chalet independiente)', 'Detached house on its own plot', 'Privacy, private pool, room to extend', 'Maintenance, security, higher costs'],
    ['<b>Finca</b> (casa de campo)', 'Rural house with land, outside the town', 'Peace, space, character', 'Permits, water, access road, legalisation'],
  ], 'compact'),
  ('img', 'town-ciudad-quesada-1.jpg', 44, 'Ciudad Quesada: villas, bungalows and apartments on the hills above Rojales (H. Helmlechner, CC BY-SA 4.0).'),
  ('callout', 'tip', 'Tip from our team', 'Ask about the orientation of every property. A south- or west-facing terrace gives you sun until late afternoon in winter; in summer you\'ll want shade instead. The best homes have both.'),
]},

{'kind': 'page', 'label': 'Part 4 · New build', 'blocks': [
  ('cols', [[
    ('h2', 'New build or <em>resale</em>?'),
    ('table', ['', 'New build', 'Resale'], [
      ['Tax', '10% IVA + 1.4% AJD', '9% ITP'], ['Move in', 'after completion, often 12-24 months', 'straight away'],
      ['Guarantee', 'statutory building guarantees', 'none, check carefully'], ['Energy', 'modern, efficient', 'varies'],
      ['Location', 'often new areas', 'established, green areas'], ['Furniture', 'empty', 'often furnished'],
      ['What you see', 'floor plan and show home', 'the real house']], 'compact'),
    ('h3', 'Buying from a developer'),
    ('ul', ['You pay in instalments: reservation, deposit (often 30-50% during construction), balance on completion.',
            'By law, every payment before completion must be covered by a <b>bank guarantee or insurance</b>. Always ask for it.',
            'Check the building licence and the schedule, and agree what happens in case of delay.',
            'On completion you inspect the property together with us. Minor defects go on a snagging list the developer must resolve.']),
  ], [
    ('img', 'ai-12-newbuild.jpg', 58),
    ('callout', 'soltura', 'How we handle new build', '<p>We don\'t send piles of brochures and price lists. With new build we first want to speak to you personally, and ideally show you the project on site. A floor plan doesn\'t tell you how the sun falls, how the neighbourhood feels or how far the supermarket really is.</p><p>For that we ask for your name, mobile number, email address and when you can be in Spain.</p>'),
    ('qr', LINKS['contact'], 'Book an introductory meeting about new build'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 4 · Letting', 'blocks': [
  ('h2', 'Letting: what is still <em>allowed</em>?'),
  ('lead', 'Since 2024 Spain and the Comunitat Valenciana have tightened the rules on holiday lets considerably. If you want to let, have it checked before you buy.'),
  ('cols', [[
    ('h3', 'Holiday letting (short term)'),
    ('check', [
      '<b>Registration with the Generalitat</b> in the register of tourist accommodation, with a statement from the town hall that letting is permitted at that location.',
      '<b>National registration number</b>: since 1 July 2025 a property without this number may no longer be advertised on Airbnb, Booking and other platforms.',
      '<b>Community consent</b>: since April 2025, in an apartment complex 3/5 of the owners must agree to new holiday letting.',
      '<b>Municipal restrictions</b>: some municipalities no longer grant new licences in certain areas.',
      '<b>Guest registration</b> with the police and public liability insurance.',
    ]),
  ], [
    ('h3', 'Long term'),
    ('p', 'If you let the property as a home for a year or more, the tenancy act (LAU) applies. As a private landlord you are in principle tied to contracts of up to five years. Simpler licensing, but less flexible.'),
    ('h3', 'Tax on rental income'),
    ('p', 'As a non-resident from the EU you pay 19% on net rental income, after deducting expenses. From outside the EU it is 24% on the gross amount. Filed quarterly on Modelo 210.'),
    ('callout', 'warn', 'Watch out', 'Never assume a property "can be let" because the current owner does so. Ask for the registration number and have it checked whether it can be continued in your name.'),
  ]]),
  ('img', 'ai-10-remote.jpg', 46, 'More and more buyers combine their own use with remote working instead of letting.', 'center 40%'),
]},

{'kind': 'page', 'label': 'Part 4 · Viewing smartly', 'band': 'ai-03-viewing.jpg', 'band_h': 62, 'band_pos': 'center 40%', 'blocks': [
  ('h2', 'Viewing smartly: <em>look beyond</em> the kitchen'),
  ('lead', 'A beautiful home is seductive. Take this list with you and look at what you don\'t see straight away.'),
  ('cols', [[
    ('h3', 'In and around the house'),
    ('check', ['Damp or mould, especially in winter and in ground-floor homes', 'Cracks in walls and terraces',
               'Age of the air conditioning, water heater and pool pump', 'Water pressure and hot water', 'Roof and roof terrace: drainage, leaks',
               'Are extensions, covered terraces and the pool legal and registered?', 'Orientation of the terrace and living room',
               'Noise: road, neighbours, bars, dogs', 'Internet: is fibre available?', 'Windows: double glazing, shutters, fly screens']),
  ], [
    ('h3', 'In the neighbourhood'),
    ('check', ['Walk around: what does the street look like?', 'How busy is it in high season?', 'Distance to supermarket, pharmacy, doctor',
               'Building plans in the area', 'Condition of the communal pool and garden', 'Level of community fees and any arrears',
               'Flood risk for low-lying homes along the Segura']),
    ('callout', 'tip', 'From practice', 'A client was buying a home with a pool that had never been legalised. We spotted it in the paperwork and had it sorted before the notary. A bit of effort for the seller, but it saves the buyer a fine and problems when reselling.'),
  ]]),
]},

# ================================================================== PART 5
{'kind': 'opener', 'num': '05', 'img': 'ai-04-keys.jpg', 'title': 'The buying process<br>step by step',
 'intro': 'In Spain a purchase only becomes final at the notary, but the most important agreements are made before that. If you know the order of things, you always know where you stand.',
 'inside': ['From first meeting to keys', 'NIE and power of attorney', 'Legal checks', 'The 12 costliest mistakes']},

{'kind': 'page', 'label': 'Part 5 · The process', 'blocks': [
  ('h2', 'From first meeting to <em>keys</em>'),
  ('lead', 'On average a purchase takes four to eight weeks from offer to notary. The orientation before that takes most buyers months: on average there are about nine months between "financially ready" and the keys.'),
  ('svg', G.process_bar(L)),
  ('sp', 2),
  ('steps', [
    ('Reservation', 'As soon as you have agreed a price with the seller, you sign a reservation contract and pay a deposit, usually €3,000 to €5,000. The property comes off the market and the price is fixed.', 'day 1'),
    ('Purchase contract (contrato de arras)', 'This contract sets out the price, the conditions and the completion date. You top up the deposit, usually to 10% of the price.', 'within 1-3 weeks'),
    ('Checks and preparation', 'Land registry, cadastre, debts, permits, community fees: we check it all and tell you what we find. We coordinate the notary, the bank and, if needed, a lawyer.', 'in parallel'),
    ('Completion at the notary', 'You pay the balance and sign the deed (escritura). One of us is with you on the day. If you can\'t be there, it can be done with a power of attorney.', 'after 4-8 weeks'),
    ('Registration and aftercare', 'The deed is entered in the land registry. We transfer the utilities, IBI and community fees into your name.', 'afterwards'),
  ]),
  ('stats', [('4-8 wks', 'from accepted offer to notary'), ('10%', 'deposit with the purchase contract (usual)'), ('± 9 mths', 'on average from "financially ready" to keys'), ('1 day', 'at the notary, with one of us beside you')]),
]},

{'kind': 'page', 'label': 'Part 5 · Paperwork', 'band': 'town-san-miguel-de-salinas-1.jpg', 'band_h': 34, 'band_pos': 'center 60%', 'blocks': [
  ('h2', 'NIE, bank account and <em>power of attorney</em>'),
  ('cols', [[
    ('h3', 'The NIE number'),
    ('p', 'Your identification number as a foreigner in Spain. You need it for the notary, a bank account, utilities and taxes. No NIE, no purchase.'),
    ('ul', ['You can apply at a police station in Spain, at a Spanish consulate in your home country, or through a representative with power of attorney.',
            'Allow a few weeks. So start well before you reserve a property.',
            'Buying as a couple? Each of you needs your own NIE.']),
    ('h3', 'A Spanish bank account'),
    ('p', 'For the payment at the notary and the direct debits for IBI, community fees and utilities. The bank asks for your passport, your NIE and proof of income or of the origin of the funds.'),
  ], [
    ('h3', 'Buying remotely with power of attorney'),
    ('p', 'You don\'t have to go to the notary yourself. With a notarised power of attorney (poder) someone can sign, pay and arrange the utilities on your behalf. You sign it at a Spanish notary or at a notary in your own country, with an apostille.'),
    ('quote', 'Everything is arranged from A to Z. Quite something to buy a couple of apartments remotely without ever having been there.', 'Google review, October 2026 (translated)'),
    ('callout', 'soltura', 'How we do it', 'We help with the forms and appointments for your NIE, open a bank account with you and, if you wish, arrange everything with a power of attorney, so you only need to come for the keys.'),
  ]]),
  ('h3', 'What do you need for what?'),
  ('table', ['', 'NIE', 'Bank account', 'Power of attorney'], [
    ['Passport or ID card', '✓', '✓', '✓'], ['Completed application form (EX-15)', '✓', '', ''],
    ['Reason for application (e.g. property reservation)', '✓', '', ''], ['NIE', '', '✓', '✓'],
    ['Proof of income / origin of funds', '', '✓', ''], ['Apostille (if signed outside Spain)', '', '', '✓']], 'compact'),
]},

{'kind': 'page', 'label': 'Part 5 · Checks', 'blocks': [
  ('h2', 'The legal check: <em>what</em> we look into'),
  ('lead', 'In Spain, debts on a property pass to the new owner. That is why the checks beforehand are the most important part of the purchase.'),
  ('cols', [[
    ('check', [
      '<b>Nota simple</b>: who is the owner according to the land registry, and is there a mortgage or charge on the property?',
      '<b>Cadastre</b>: do the size and description match reality and the land registry?',
      '<b>Permits</b>: were the house, extensions, covered terraces and pool built legally and registered?',
      '<b>Habitability</b> (cédula / licencia de primera ocupación) where it\'s needed for utility contracts.',
      '<b>IBI</b>: has the property tax for recent years been paid?',
    ]),
  ], [
    ('check', [
      '<b>Community</b>: a certificate from the administrator that there are no arrears, and whether major expenses are planned.',
      '<b>Utilities</b>: no outstanding water or electricity bills.',
      '<b>Energy certificate</b>: compulsory when selling.',
      '<b>Planning situation</b>: is the property in an area with plans, restrictions or risks?',
      '<b>Non-resident seller</b>: the buyer withholds 3% of the price and pays it to the tax office. We arrange this at the notary.',
    ]),
  ]]),
  ('callout', 'soltura', 'Independent and transparent', 'We tell you what we find, even if it delays the sale. One client wrote: "They are transparent about defects and hidden costs and research everything thoroughly." That\'s exactly how we want to work.'),
  ('img', 'ai-04-keys.jpg', 50, '', 'center 60%'),
]},

{'kind': 'page', 'label': 'Part 5 · Offer and arras', 'blocks': [
  ('h2', 'Making an offer, reserving and what <em>"under offer"</em> means'),
  ('cols', [[
    ('h3', 'Making an offer'),
    ('p', 'You make an offer through us, preferably in writing, with the price, any conditions (such as a mortgage or which furniture stays) and your preferred completion date. We present it to the seller and negotiate on your behalf.'),
    ('h3', 'Under offer at Soltura Real Estate'),
    ('p', 'As soon as an offer has been accepted and the reservation paid, a property is under offer with us. We then stop viewings and assume the sale will go ahead. If the sale falls through after all, the property comes back on the market. On our website you can sign up to be notified straight away.'),
  ], [
    ('h3', 'The purchase contract with deposit (arras)'),
    ('table', ['What happens if...', 'Consequence'], [
      ['the buyer pulls out', 'the buyer loses the deposit'],
      ['the seller pulls out', 'the seller repays double the deposit'],
      ['the mortgage falls through', 'only covered if it is a condition in the contract']], 'compact'),
    ('p', 'This is the usual form (arras penitenciales, art. 1454 of the Spanish Civil Code). Always read the contract carefully: the conditions decide who carries which risk.'),
    ('callout', 'warn', 'Watch out', 'Never pay a deposit directly to a seller you don\'t know, and never without a written contract. With us the deposit goes through a controlled account with a signed contract.'),
  ]]),
  ('cols', [[
    ('callout', 'tip', 'Tip from our team: offer realistically', 'An offer well below the asking price can work for a property that has been on the market for a long time, but good homes in the Vega Baja often go quickly. We\'ll tell you honestly how the asking price compares with similar sales.'),
  ], [
    ('qr', LINKS['home'], 'Property under offer? Sign up on its page for "Back on the market"'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 5 · Pitfalls', 'blocks': [
  ('h2', 'The 12 costliest <em>mistakes</em> (and how to avoid them)'),
  ('lead', 'In more than twenty years we\'ve seen them all. Fortunately, every one of them can be avoided.'),
  ('cols', [[
    ('ol', [
      '<b>Looking only at the price.</b> Always allow 10 to 13% buying costs, plus guidance and a buffer.',
      '<b>Falling in love on holiday and signing the same week.</b> Sleep on it and see the area at a different time.',
      '<b>No legal check.</b> Debts and illegal building work pass to the new owner.',
      '<b>Paying a deposit without a contract</b> or to someone you don\'t know.',
      '<b>Applying for the NIE too late.</b> The notary date slips and your deposit is at risk.',
      '<b>Counting on rental income</b> without checking whether letting is allowed.',
    ]),
  ], [
    ('html', '<ol class="num">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (7, '<b>Underestimating maintenance.</b> A pool, garden and air conditioning cost money, even when you\'re not there.'),
      (8, '<b>No Spanish will.</b> Your heirs will lose months and money.'),
      (9, '<b>Forgetting non-resident tax.</b> Even without letting, you file a return every year.'),
      (10, '<b>Underestimating the summer sun.</b> A west-facing terrace without shade is unusable in August.'),
      (11, '<b>Buying too far from amenities</b> without a car, or without thinking about later.'),
      (12, '<b>Trying to do it all yourself</b> in a language and system you don\'t know. Good guidance pays for itself.'),
    ]) + '</ol>'),
  ]]),
  ('img', 'ai-16-cycling.jpg', 56, 'Buying well prepared means you can simply enjoy it afterwards.', 'center 45%'),
]},

# ================================================================== PART 6
{'kind': 'opener', 'num': '06', 'img': 'ai-03-viewing.jpg', 'title': 'Your viewing<br>trip',
 'intro': 'A well-prepared viewing trip is the fastest route to the right home. We pre-select, plan efficiently and drive you around, so you can concentrate on choosing.',
 'inside': ['Preparation', 'Packing list', 'A day with us', 'Our office']},

{'kind': 'page', 'label': 'Part 6 · Preparation', 'band': 'ai-11-plane.jpg', 'band_h': 62, 'band_pos': 'center', 'blocks': [
  ('h2', 'How to prepare your <em>trip</em>'),
  ('cols', [[
    ('h3', 'What we need from you in advance'),
    ('check', ['First and last names of all buyers', 'Mobile number and email address', 'Your travel dates and how many days you have',
               'Your budget, all-in', 'Own funds or a mortgage, and is it agreed in principle?', 'Your wish-list worksheet (page 8)',
               'Properties you\'ve already seen online, with reference']),
    ('callout', 'tip', 'Tip from our team', 'Avoid August if you can choose. October to June is ideal: pleasant weather, quiet roads and more time and attention from our team.'),
    ('h3', 'How many days?'),
    ('p', 'Allow two to four days. Day 1 getting to know each other and viewing, day 2 more viewing and revisiting favourites, day 3 time for a second viewing, the surroundings and possibly the bank or the NIE.'),
  ], [
    ('h3', 'Packing list'),
    ('check', ['Passport or ID card (also needed for the NIE and the bank)', 'NIE, if you already have one', 'Proof of income and recent bank statements',
               'Your worksheet and this guide', 'Phone with camera and full battery, power bank', 'Tape measure for furniture', 'Sunglasses, cap and water (in winter too)',
               'Comfortable shoes: stairs, roof terraces, gardens', 'Bank card for a possible reservation']),
    ('img', 'ai-05-planning.jpg', 60),
  ]]),
]},

{'kind': 'page', 'label': 'Part 6 · A day with us', 'band': 'town-rojales-2.jpg', 'band_h': 72, 'band_pos': 'center 65%', 'blocks': [
  ('h2', 'What a <em>viewing day</em> looks like'),
  ('cols', [[
    ('steps', [
      ('Meeting at the office', 'Coffee in Formentera del Segura. We go through your wishes once more and show you the route.', '10:00'),
      ('Properties 1 to 3', 'We drive you around. Between viewings we tell you about the area, the villages and the prices.', '10:45'),
      ('Lunch', 'In one of the villages: a break, time to sort out your impressions and ask questions. Often one property drops out here.', '13:30'),
      ('Properties 4 to 6', 'Based on what you saw in the morning, we adjust the afternoon programme.', '15:00'),
      ('Review', 'What stood out, what disappointed? Which property would you like to see again, perhaps at a different time of day?', '18:00'),
    ]),
  ], [
    ('img', 'ai-06-market.jpg', 62, 'Take time for the village itself: the market tells you more than a floor plan.'),
    ('callout', 'tip', 'Not too many', 'More than six to eight properties in a day becomes a blur. Photograph the street name before you go in and jot down three pluses and three minuses straight after each viewing.'),
    ('callout', 'soltura', 'Pre-selected', 'Because we know your wishes in advance, you only see properties that really matter. Often including homes that aren\'t online yet.'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 6 · Our office', 'hero': 'office-crop.jpg', 'hero_h': 72, 'hero_pos': 'center', 'blocks': [
  ('sp', 66),
  ('cols', [[
    ('html', '<div class="kicker">Come and see us</div>'),
    ('h2', 'Our office in <em>Formentera del Segura</em>'),
    ('p', 'Right in the middle of our area, a few minutes from Rojales, Benijófar and Ciudad Quesada. Parking at the door.'),
    ('facts', [('Address', 'Avda. de la Constitución s/n<br>03179 Formentera del Segura'), ('Opening hours', 'Mon-Fri 10:00-14:00<br>Sat-Sun by appointment'),
               ('Phone', '+34 966 792 113'), ('WhatsApp', '+34 664 414 515'), ('Email', 'info@gruposoltura.com'), ('Languages', 'Dutch, English, German, Spanish')]),
  ], [
    ('qr', LINKS['maps'], 'Directions in Google Maps'),
    ('qr', LINKS['wa'], 'Send us a WhatsApp'),
    ('qr', LINKS['contact'], 'Book an appointment'),
  ]], '1.25fr 1fr'),
  ('img', 'town-formentera-del-segura-1.jpg', 50, 'The village square of Formentera del Segura with church and town hall, a few minutes from our office (Galopax, CC BY-SA 4.0).'),
]},

# ================================================================== PART 7
{'kind': 'opener', 'num': '07', 'img': 'ai-02-family.jpg', 'title': 'After the keys:<br>living here',
 'intro': 'Buying the house is one step. Building a life here is the rest. We remain your point of contact after the notary too, in your own language.',
 'inside': ['The first 30 days', 'Taxes', 'Will', 'Moving with your family', 'Pets', 'Life here', 'Glossary']},

{'kind': 'page', 'label': 'Part 7 · The first 30 days', 'blocks': [
  ('h2', 'The first <em>30 days</em> after the keys'),
  ('lead', 'You\'re the owner. This is what to arrange in the first few weeks; we do most of it together with you or take it off your hands.'),
  ('cols', [[
    ('h3', 'House and utilities'),
    ('check', ['Electricity in your name (with direct debit)', 'Water and refuse in your name', 'Order internet and TV (fibre?)',
               'Take out buildings and contents insurance', 'Have the locks changed', 'Consider an alarm or camera system',
               'Arrange garden and pool maintenance', 'Arrange key holding while you\'re away']),
  ], [
    ('h3', 'Paperwork'),
    ('check', ['IBI and basura in your name and paid by direct debit', 'Community: inform the administrator, set up direct debit', 'Check the entry in the land registry',
               'Have a Spanish will drawn up', 'If moving here: register with the town hall (padrón)', 'If moving here: apply for residencia',
               'As a non-resident: put Modelo 210 in your diary', 'Keep digital copies of all deeds']),
  ]]),
  ('callout', 'soltura', 'Aftercare in your own language', 'After the notary we transfer the utilities, IBI and community fees into your name. After that you can always come to us with questions, for local tradespeople and for paperwork. One client wrote: "I was also happy with the after-sales service. I could still go to them with questions afterwards."'),
  ('img', 'ai-08-dog.jpg', 52, '', 'center 55%'),
]},

{'kind': 'page', 'label': 'Part 7 · Taxes', 'band': 'ai-10-remote.jpg', 'band_h': 68, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Taxes as an <em>owner</em>'),
  ('lead', 'The biggest difference is whether you are resident. In principle you are if you live in Spain for more than 183 days a year or if your main interests are here.'),
  ('table', ['', 'Non-resident', 'Resident'], [
    ['Income tax', 'On deemed income from your property (1.1-2% of the cadastral value) and on rental income', 'On your worldwide income, progressive rate'],
    ['Rate (EU citizen)', '19%', 'rising by band'],
    ['Tax return', 'Modelo 210, annually (own use) or quarterly (letting)', 'Annual IRPF return (renta)'],
    ['IBI and basura', 'yes, annually to the town hall', 'yes, annually to the town hall'],
    ['On sale', '19% on the gain; buyer withholds 3%', 'progressive 19-30% on the gain; exemptions possible'],
    ['Municipal gains tax (plusvalía)', 'on sale, paid by the seller', 'on sale, paid by the seller'],
  ], 'compact'),
  ('cols', [[
    ('h3', 'Modelo 210: once a year'),
    ('p', 'As a non-resident you file a return every year, even if you only use the property yourself. We handle this return for many of our clients; it\'s also a nice annual moment to catch up.'),
  ], [
    ('h3', 'Double taxation'),
    ('p', 'Spain has tax treaties with, among others, the Netherlands, Belgium, Germany and the United Kingdom. If you file in Spain and in your home country, get good advice.'),
  ]]),
  ('callout', 'info', 'Good to know', 'Tax rules are personal. This page gives an overview, not advice. For your situation we work with tax advisers who know both the Spanish side and your home country\'s.'),
]},

{'kind': 'page', 'label': 'Part 7 · Will', 'band': 'town-orihuela-costa-1.jpg', 'band_h': 66, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Inheritance</div>'),
    ('h2', 'A Spanish will: <em>little</em> effort, big difference'),
    ('p', 'A property in Spain falls under Spanish procedures, even if your will at home is well arranged. Without a Spanish will your heirs first have to establish who inherits. That takes months, translations and money, while the property cannot be sold or transferred.'),
    ('h3', 'Why a Spanish will'),
    ('ul', ['Faster and cheaper settlement at the Spanish notary.', 'Under the European Succession Regulation you can choose the inheritance law of your nationality.',
            'The Spanish will covers only your assets in Spain and doesn\'t need to replace your will at home.', 'Easy to arrange: one appointment at the notary.']),
    ('callout', 'tip', 'Inheritance tax in the Comunitat Valenciana', 'Since 2023 partners, children and parents here receive a 99% reduction on Spanish inheritance tax. Do have your personal situation checked: conditions apply, and your home country may also levy tax.'),
  ], [
    ('img', 'ai-16-cycling.jpg', 96, '', 'center'),
    ('callout', 'soltura', 'How we do it', 'We arrange a Spanish will for you at the notary, explained in your own language. Many clients do it on the same day as completion.'),
  ]], '1.15fr 1fr'),
]},

{'kind': 'page', 'label': 'Part 7 · Relocating', 'band': 'ai-02-family.jpg', 'band_h': 78, 'band_pos': 'center 35%', 'blocks': [
  ('h2', 'Moving here with your <em>family</em>'),
  ('lead', 'More and more of our buyers are young families building a new life here. Then the house is the reason and life is the subject.'),
  ('cols', [[
    ('cards', [
      {'icon': 'doc', 't': 'Registering', 'x': '<b>Padrón</b>: registration with the town hall, needed for school, healthcare and many local schemes. <b>Residencia</b>: EU citizens staying longer than three months register as residents (proof of income and health insurance). Non-EU citizens need a visa or residence permit.'},
      {'icon': 'health', 't': 'Healthcare', 'x': 'If you work in Spain, you are covered through social security. EU pensioners often transfer their cover with an S1 form. Otherwise private health insurance. Then register at your health centre and apply for the SIP card. Hospitals in Torrevieja and Orihuela. Emergency number 112.'},
    ], 1),
  ], [
    ('cards', [
      {'icon': 'school', 't': 'Schools', 'x': 'State schools, state-funded private (concertado) schools and international schools with a British or other curriculum. Lessons at state schools are in Spanish and Valencian, with language support for newcomers. Applications are usually in spring; international schools often have waiting lists. Your choice of school may decide where you buy.'},
      {'icon': 'laptop', 't': 'Working remotely', 'x': 'With fibre in most villages and urbanisations, you can work here just as well as at home. For non-EU citizens there is a digital nomad visa. Mind your tax position once you become resident.'},
    ], 1),
  ]]),
  ('cta', LINKS['move'], 'Read more about moving to Spain', 'On our website you\'ll find the steps before, during and after the purchase, and you can request a personal step-by-step plan.'),
]},

{'kind': 'page', 'label': 'Part 7 · Pets &amp; practicalities', 'band': 'town-guardamar-del-segura-3.jpg', 'band_h': 72, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('h2', 'Your <em>pet</em> comes too'),
    ('img', 'ai-08-dog.jpg', 60),
    ('h3', 'Travelling with a dog or cat within the EU'),
    ('check', ['Microchip (ISO standard)', 'Valid rabies vaccination, at least 21 days before departure', 'European pet passport',
               'Registration with a vet in Spain and in the Valencian animal register']),
    ('callout', 'tip', 'Tip from our team', 'Watch out for processionary caterpillars in the pine woods in February and March, and for hot tiles in summer. Liability insurance for your dog is sensible; the national obligation is still awaiting implementation.'),
  ], [
    ('h2', 'Practical <em>matters</em>'),
    ('h3', 'Your car'),
    ('p', 'If you come to live here, a car with foreign plates will eventually need Spanish registration. Your EU driving licence remains valid.'),
    ('h3', 'Security'),
    ('p', 'The Vega Baja is a quiet region. Common sense helps: shutters, a good lock, perhaps an alarm, and a neighbour or property manager who keeps an eye on things while you\'re away.'),
    ('h3', 'Language'),
    ('p', 'In the urbanisations you\'ll get a long way with English. If you live in a Spanish village or send children to school, Spanish helps a lot. Most municipalities offer affordable language courses for newcomers.'),
    ('h3', 'Post and parcels'),
    ('p', 'In many urbanisations post isn\'t delivered to the door. A PO box or an address at a service point is handy.'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 7 · Life here', 'band': 'ai-06-market.jpg', 'band_h': 46, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'Life in the <em>Vega Baja</em>'),
  ('cols', [[
    ('img', 'ai-07-food.jpg', 52, 'Rice, fish and vegetables from the huerta: the cooking here is simple and fresh.'),
    ('h3', 'Food and markets'),
    ('p', 'The huerta produces artichokes, citrus fruit, tomatoes and pomegranates all year round. Every municipality has a weekly market; the Saturday market in Almoradí is one of the largest. Try arroz con costra, caldero and a glass of wine from the Vinalopó.'),
    ('h3', 'Nature'),
    ('p', 'The pink salt lakes of Torrevieja and La Mata, the El Hondo nature reserve with its flamingos, the pine woods on the dunes at Guardamar and the Sierra Escalona: you can walk and cycle here all year.'),
  ], [
    ('img', 'ai-13-fiesta.jpg', 52, 'Every municipality celebrates its own fiestas, often for days on end.'),
    ('h3', 'Festivals through the year'),
    ('table', ['When', 'What'], [
      ['January', 'Three Kings, parades with sweets for the children'], ['February', 'Carnival, big in Torrevieja'],
      ['March/April', 'Semana Santa: processions, impressive in Orihuela'], ['June', 'San Juan: fireworks and bonfires on the beach'],
      ['July/August', 'Fiestas in almost every village, Moros y Cristianos'], ['October', 'Fiestas in Rojales and harvest festivals in many villages'],
      ['December', 'Christmas markets and Nochevieja with twelve grapes']], 'compact'),
    ('h3', 'Sport'),
    ('p', 'Golf (La Marquesa, La Finca, Las Colinas, Villamartín and more), padel, sailing, cycling and walking.'),
  ]]),
]},

{'kind': 'page', 'label': 'Part 7 · Glossary', 'band': 'town-almoradi-2.jpg', 'band_h': 66, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'Useful <em>Spanish</em> words for buyers'),
  ('cols', [[
    ('table', ['Spanish', 'Meaning'], [
      ['arras', 'deposit / purchase contract with deposit'], ['catastro', 'cadastre (land survey register)'], ['cédula de habitabilidad', 'certificate of habitability'],
      ['comunidad de propietarios', 'owners\' association'], ['escritura', 'notarial title deed'], ['gestoría', 'administrative agency'],
      ['hipoteca', 'mortgage'], ['IBI', 'property tax'], ['ITP', 'transfer tax'], ['IVA', 'VAT'],
      ['AJD', 'stamp duty'], ['nota simple', 'land registry extract'], ['NIE', 'foreigner\'s identification number'],
    ], 'compact'),
  ], [
    ('table', ['Spanish', 'Meaning'], [
      ['notaría', 'notary\'s office'], ['padrón', 'town hall registration'], ['plusvalía', 'municipal capital gains tax'],
      ['poder', 'power of attorney'], ['Registro de la Propiedad', 'land registry'], ['residencia', 'residence registration'], ['solarium', 'roof terrace'],
      ['tasación', 'valuation'], ['urbanización', 'residential estate / urbanisation'], ['huerta', 'market-garden land'], ['llave en mano', 'turnkey'],
      ['obra nueva', 'new build'], ['segunda mano', 'resale property'],
    ], 'compact'),
  ]]),
  ('html', '<div class="panel lemon" style="margin-top:3mm"><b>¡Bienvenidos!</b> A few words of Spanish open doors. <i>Buenos días</i> at the bakery, <i>gracias</i> at the till and <i>¿qué tal?</i> to the neighbours: you\'ll become part of the village sooner than you think.</div>'),
]},

# ================================================================== FINALLY
{'kind': 'page', 'label': 'Our services', 'band': 'ai-04-keys.jpg', 'band_h': 72, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'What <em>we</em> do for you'),
  ('lead', 'One team from the first meeting to the months after you get the keys, in your language. You choose what you need.'),
  ('cards', [
    {'icon': 'search', 't': 'Tailored search', 'x': 'We select properties to match your wishes, often before they go online. Online, you search in your own words with our AI search.'},
    {'icon': 'shield', 't': 'Purchase guidance', 'x': 'Legal checks, contracts, coordination with notary and bank, and a colleague beside you on completion day.'},
    {'icon': 'bank', 't': 'Mortgage', 'x': 'Contact with Spanish banks, application, valuation and guidance right through to the notary.'},
    {'icon': 'doc', 't': 'NIE, bank and power of attorney', 'x': 'Forms, appointments and, if you wish, everything arranged remotely with a power of attorney.'},
    {'icon': 'euro', 't': 'Modelo 210', 'x': 'Your annual non-resident tax return, so you don\'t have to think about it.'},
    {'icon': 'key', 't': 'Will and aftercare', 'x': 'A Spanish will, utilities in your name and a permanent point of contact afterwards.'},
    {'icon': 'home', 't': 'Selling', 'x': 'Free valuation, professional photos, drone and 3D, and a weekly update on your property.'},
    {'icon': 'people', 't': 'Network', 'x': 'Reliable tradespeople, property managers, tax advisers and lawyers we have known for years.'},
    {'icon': 'chat', 't': 'In your own language', 'x': 'Dutch, English, German and Spanish, after the purchase too. Online, our AI assistant answers your questions about any property, day and night.'},
  ], 3),
  ('cta', LINKS['contact'], 'Fees and terms on request', 'Every situation is different. Tell us what you need and you\'ll receive a clear proposal with no surprises.'),
]},

{'kind': 'page', 'label': 'What clients say', 'band': 'town-torrevieja-2.jpg', 'band_h': 40, 'band_pos': 'center 60%', 'blocks': [
  ('html', '<div style="display:flex;align-items:flex-end;gap:6mm;margin-bottom:3mm"><div><div class="kicker">Google reviews</div><h2 style="margin:0">What clients <em>say</em></h2></div><div style="margin-left:auto;text-align:right"><div style="font-family:Fraunces;font-size:40pt;font-weight:700;line-height:1;color:#C63232">4.7<span style="font-size:20pt;color:#FBCC10"> ★★★★★</span></div><div class="small">average on Google, more than 45 reviews</div></div></div>'),
  ('cols', [[
    ('quote', 'Earlier this year we bought an apartment in Spain ourselves. From the very first moment we were well guided. They really listened to our wishes and thought along with us. Even applying for NIE numbers, the notary and banking matters is taken care of for you. That takes away an enormous amount of stress and worry.', 'Buyer, 2026'),
    ('quote', 'A very good experience. We bought a house through them twice. They take time for you, are transparent about defects and hidden costs and research everything thoroughly.', 'Buyer'),
    ('quote', 'Rick and the team were recommended by a relative. The process of selling our villa was carried out in a very professional manner. A trouble-free experience.', 'Seller'),
  ], [
    ('quote', 'A really pleasant and reliable estate agent who has helped us excellently several times with buying and selling.', 'Buyer and seller'),
    ('quote', 'Wonderfully and expertly helped by Rick and his team. They arrange everything! Lovely people!', 'Buyer, 2026'),
    ('quote', 'Very helpful and knowledgeable. Highly recommended. They speak Dutch too.', 'Client, 2026'),
    ('qr', LINKS['reviews'], 'Read all reviews on Google'),
  ]]),
  ('small', 'Quotes from Google reviews, shortened where indicated while keeping the essence; reviews originally in Dutch have been translated. Names omitted.'),
]},

{'kind': 'page', 'label': 'Checklist', 'band': 'ai-01-cover.jpg', 'band_h': 80, 'band_pos': 'center 75%', 'blocks': [
  ('h2', 'Ready to <em>buy</em>?'),
  ('lead', 'Tick them off. Once everything is ticked, you\'re ready to act when the right home comes along.'),
  ('cols', [[
    ('h3', 'Preparation'),
    ('check', ['I know why I\'m buying (Part 1)', 'My wish-list worksheet is filled in', 'I know which 2-3 places I want to search in',
               'I know my total budget, including all buying costs', 'My financing is agreed in principle', 'I have applied for my NIE']),
    ('h3', 'The trip'),
    ('check', ['Soltura Real Estate knows my travel dates', 'I have my passport, bank card and proof of income with me', 'I have seen my first selection of properties']),
  ], [
    ('h3', 'The purchase'),
    ('check', ['I have a Spanish bank account', 'The legal check has been done', 'I have read and understood the purchase contract',
               'The buying costs are set aside', 'My letting plans have been checked against the rules', 'I have an appointment for a Spanish will']),
    ('h3', 'Afterwards'),
    ('check', ['Utilities, IBI and insurance are in my name', 'Modelo 210 or my residencia is arranged', 'I\'m enjoying my first evening on the terrace']),
  ]]),
  ('cta', LINKS['contact'], 'Not everything ticked? That\'s what we\'re here for.', 'Book a no-obligation chat at the office, by phone or by video call. We\'ll go through the open points together.'),
]},

{'kind': 'back', 'html': f'''
<div style="position:absolute;inset:0;background:url(assets/img/ai-14-beach.jpg) center top/cover"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,59,66,.15) 0%,rgba(46,59,66,.55) 30%,rgba(46,59,66,.97) 52%)"></div>
<div style="position:absolute;left:16mm;right:16mm;top:20mm">
  <div style="background:#fff;display:inline-block;border-radius:5mm;padding:4mm 5mm"><img src="assets/img/logo-square.png" style="height:30mm;display:block"/></div>
  <h1 style="font-family:Fraunces;font-weight:600;font-size:38pt;line-height:1.05;margin:12mm 0 4mm">See you soon on the<br>Costa Blanca</h1>
  <p style="font-size:12pt;max-width:150mm;opacity:.92">Questions after reading? Call, send a WhatsApp or drop in. We\'re happy to think along with you, with no obligation and in your own language.</p>
</div>
<div style="position:absolute;left:16mm;right:16mm;top:132mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm">
  <div style="font-size:10.5pt;line-height:1.7">
    <div style="color:#FBCC10;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:8pt;margin-bottom:2mm">Soltura Real Estate</div>
    Avda. de la Constitución s/n<br>03179 Formentera del Segura (Alicante)<br><br>
    <b>T</b> +34 966 792 113<br><b>WhatsApp</b> +34 664 414 515<br><b>E</b> info@gruposoltura.com<br><br>
    <b>Office</b> Mon-Fri 10:00-14:00 · Sat-Sun by appointment
  </div>
  <div>
    <div class="qrrow" style="grid-template-columns:1fr 1fr;color:#2E3B42">
      <a class="qrbox v" href="{LINKS['home']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['home'])}</div><div class="qrl"><b>Our properties</b></div></a>
      <a class="qrbox v" href="{LINKS['contact']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['contact'])}</div><div class="qrl"><b>Contact</b></div></a>
    </div>
  </div>
</div>
<div style="position:absolute;left:16mm;right:16mm;bottom:12mm;font-size:7.4pt;opacity:.75;line-height:1.5">
  Grupo Soltura SL · RAICV 5781 · API 992 Alicante · GIPE 3.473 · AIPP member · gruposoltura.com<br>
  This guide contains general information (as of October 2026) and is not legal, tax or financial advice. No rights can be derived from its contents.
  Lifestyle images: partly created with AI; town photos via Wikimedia Commons under the licences stated.
</div>'''},
]
