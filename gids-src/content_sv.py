import graphics as G

BASE = 'https://gruposoltura.com'
LINKS = {
    'home': BASE + '/sv/', 'buy': BASE + '/sv/kopa/', 'move': BASE + '/sv/flytta-till-spanien/',
    'costs': BASE + '/sv/flytta-till-spanien/manadskostnader/', 'areas': BASE + '/sv/orter/',
    'contact': BASE + '/sv/kontakt/', 'sell': BASE + '/sv/salja/',
    'town': BASE + '/sv/bo-i/{}/',
    'reviews': 'https://search.google.com/local/reviews?placeid=ChIJWa-hMmmvYw0R4qKf5TapVp4',
    'maps': 'https://www.google.com/maps/search/?api=1&query=Grupo%20Soltura&query_place_id=ChIJWa-hMmmvYw0R4qKf5TapVp4',
    'wa': 'https://wa.me/34664414515',
}
T = lambda s: LINKS['town'].format(s)

L = {
    'guide_title': 'Hemma på Costa Blanca',
    'part': 'Del',
    'saltlake': 'saltsjöar', 'sea': 'Medelhavet', 'river': 'Floden Segura',
    'office': 'vårt kontor', 'alc': 'Alicantes flygplats · ca 30 min', 'rmu': 'Murcias flygplats · ca 45-60 min',
    'months': ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    'layers': [('1 · Köpeskillingen', 'Det du kommer överens om med säljaren', G.RED, 1.0),
               ('2 · Köpkostnader', 'Skatt, notarie, fastighetsregister: ca 10-13 % + rådgivning', G.CORAL, .78),
               ('3 · Årliga kostnader', 'IBI, samfällighetsavgift, försäkring, el och vatten, skatt', G.LEMON, .56)],
    'proc': [('Orientering', 'veckor-månader'), ('Visnings-|resa', '2-4 dagar'), ('Bud', '1-3 dagar'),
             ('Reservation', 'direkt'), ('Köpe-|kontrakt', '1-3 veckor'), ('Kontroller', '2-6 veckor'),
             ('Notarie', '1 dag'), ('Nycklar &|eftervård', 'månader')],
    'dt_q': 'Vad vill du med ditt hem i Spanien?',
    'dt_opts': [('Semester-|bostad', 'eget bruk'), ('Vinter', '3-6 månader'), ('Flytta', 'med familjen'),
                ('Pension', 'bo här'), ('Uthyrning', 'avkastning')],
}

def tc(name, slug, photo, txt, sea, apt, who):
    return {'t': name, 'img': photo, 'x': f'{txt}<div style="margin-top:1.6mm;font-size:7.6pt;color:#2E3B42"><b>Havet</b> {sea} · <b>Flygplats</b> {apt}</div>'
            f'<div style="margin-top:1mm;font-size:7.6pt;color:#C63232;font-weight:700">Passar för: {who}</div>', 'tag': slug}

PAGES = [
# ------------------------------------------------------------------ COVER
{'kind': 'cover', 'img': 'ai-01-cover.jpg', 'kicker': 'Bo- och köpguide 2026',
 'title': 'Hemma på<br>Costa Blanca',
 'sub': 'Allt du vill veta innan du köper bostad i Vega Baja och på södra Costa Blanca, och vad du kan vänta dig när du flyttar hit.',
 'edition': 'Soltura Real Estate · sedan 2002'},

# ------------------------------------------------------------------ WELCOME
{'kind': 'page', 'label': 'Välkommen', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Några ord innan du börjar</div>'),
    ('h2', 'Välkommen till din <em>nya</em> trädgård'),
    ('lead', 'Tack för att du har beställt den här guiden. Läser du den, börjar drömmen om ett hem i solen förmodligen ta form.'),
    ('p', 'Sedan 2002 hjälper vi människor att hitta ett hem i Vega Baja: det gröna inlandet på södra Costa Blanca, mellan floden Segura, saltsjöarna och havet. Under åren har vi sett våra köpare förändras. Förr köpte man mest semesterbostäder, i dag möter vi allt oftare familjer som bygger ett nytt liv här, folk som jobbar på distans och pensionärer som vill byta vintern mot ljus.'),
    ('p', 'Det som inte har ändrats: att köpa i Spanien fungerar annorlunda än hemma. Andra rutiner, andra skatter, andra fallgropar. Den här guiden går igenom allt, ärligt och utan säljsnack. Du får läsa vad det verkligen kostar, vilka frågor du ska ställa dig först, hur köpet går till och vad som händer när du har fått nycklarna.'),
    ('p', 'Numera kommer många hit med en lista som de har tagit fram med AI. Det är bra och en fin start. Men de frågor som verkligen gör skillnad står sällan på den listan. Dem hittar du här. Vi använder också AI i allt vi gör online, så att du är bättre och mer fullständigt informerad redan innan vi träffas.'),
    ('p', 'Har du frågor efter läsningen? Ring, skicka ett WhatsApp eller titta in på vårt kontor i Formentera del Segura. Kaffet bjuder vi på.'),
    ('html', '<div class="sig">Rick van Hoeven</div><p class="small" style="margin-top:1mm">Medgrundare, Soltura Real Estate</p>'),
  ], [
    ('img', 'office-crop.jpg', 60, 'Vårt kontor i Formentera del Segura.'),
    ('quote', 'Det som gör Rick speciell är att han bara pratar om saker han verkligen kan.', 'Google-recension, oktober 2026 (översatt från nederländska)'),
    ('html', '<div class="panel lemon"><div class="kicker" style="margin-bottom:1mm">I den här guiden</div><p style="margin:0">7 delar · checklistor att bocka av · räkneexempel · QR-koder till vår webbplats</p></div>'),
  ]], '1.25fr 1fr'),
]},

# ------------------------------------------------------------------ ABOUT US
{'kind': 'page', 'label': 'Om Soltura Real Estate', 'band': 'town-torrevieja-3.jpg', 'band_h': 32, 'band_pos': 'center 60%', 'hero': 'ai-09-aerial.jpg', 'hero_h': 78, 'hero_pos': 'center 60%', 'blocks': [
  ('sp', 72),
  ('h2', 'Lokala experter, <em>alltid ett steg före</em>'),
  ('stats', [('2002', 'aktiva i Vega Baja'), ('4.7★', 'i snitt på Google'), ('4', 'språk: NL · EN · DE · ES'), ('AI', 'i alla våra onlinekanaler')]),
  ('cols', [[
    ('h3', 'Vilka vi är'),
    ('p', 'Soltura Real Estate är en fastighetsbyrå med ett fysiskt kontor i Formentera del Segura, mitt i området vi arbetar i. Vi känner Rojales, Ciudad Quesada, Benijófar, Guardamar, Torrevieja, Orihuela Costa och byarna däremellan gata för gata.'),
    ('p', 'Vi finns i det valencianska registret över fastighetsmäklare (RAICV 5781), är medlem nr 992 i API-föreningen i Alicante och anslutna till GIPE och AIPP.'),
  ], [
    ('h3', 'Banbrytande, nu med AI'),
    ('p', 'Vi var bland de första med drönarbilder, en egen app och bostadsinfo via sms, långt innan alla hade en smartphone. I dag använder vi AI i allt vi publicerar online. På vår webbplats söker du med egna ord och ställer frågor om varje bostad, dygnet runt, med svar som bygger på de faktiska bostadsuppgifterna.'),
    ('p', 'Målet: att du som köpare är bättre och mer fullständigt informerad, redan före ditt första samtal med oss.'),
  ]]),
  ('callout', 'soltura', 'Vad våra kunder säger', 'Kunderna beskriver vår webbplats och kontakten via sociala medier som en trevlig upplevelse: tydligt, snabba svar och all information på ett ställe. Just därför fortsätter vi att förnya oss.'),
]},

# ------------------------------------------------------------------ CONTENTS
{'kind': 'page', 'label': 'Innehåll', 'blocks': [
  ('h2', 'Innehåll'),
  ('html', '''<div class="toc">
<div class="tocp"><span class="tn">01</span><div><b>Tänk först, titta sen</b><span>De 10 frågorna att ställa först · vilken typ av köpare är du · arbetsblad för önskelistan</span></div><span class="tpg">5</span></div>
<div class="tocp"><span class="tn">02</span><div><b>Var vill du bo?</b><span>Karta över Vega Baja · kust eller by · 12 orter · klimat · att ta sig hit</span></div><span class="tpg">9</span></div>
<div class="tocp"><span class="tn">03</span><div><b>Vad kostar det egentligen?</b><span>De tre kostnadslagren · räkneexempel · årliga kostnader · bolån</span></div><span class="tpg">16</span></div>
<div class="tocp"><span class="tn">04</span><div><b>Vilken bostad passar dig?</b><span>Bostadstyper jämförda · nybygge eller begagnat · uthyrning · visa smart</span></div><span class="tpg">21</span></div>
<div class="tocp"><span class="tn">05</span><div><b>Köpprocessen steg för steg</b><span>Tidslinje · NIE och fullmakt · juridiska kontroller · de 12 dyraste misstagen</span></div><span class="tpg">26</span></div>
<div class="tocp"><span class="tn">06</span><div><b>Din visningsresa</b><span>Förberedelser och packlista · så ser en dag ut · vårt kontor</span></div><span class="tpg">32</span></div>
<div class="tocp"><span class="tn">07</span><div><b>Efter nycklarna: att bo här</b><span>De första 30 dagarna · skatter · testamente · flytta med familjen · husdjur · livet här</span></div><span class="tpg">36</span></div>
<div class="tocp end"><span class="tn">→</span><div><b>Till sist</b><span>Våra tjänster · vad kunderna säger · checklista "Redo att köpa?" · kontakt</span></div><span class="tpg">44</span></div>
</div>'''),
  ('h3', 'Så använder du guiden'),
  ('cards', [
    {'icon': 'check', 't': 'Checklistor', 'x': 'Bocka av det du redan har ordnat. Skriv ut sidorna eller fyll i dem digitalt.'},
    {'icon': 'euro', 't': 'Räkneexempel', 'x': 'Verkliga siffror baserade på skattesatserna som gäller i oktober 2026.'},
    {'icon': 'sun', 't': 'Tips från vårt team', 'x': 'Vad över tjugo år i branschen har lärt oss, i korthet.'},
    {'icon': 'search', 't': 'QR-koder', 'x': 'Skanna för den senaste sidan på vår webbplats, våra objekt eller för att boka ett möte.'},
  ], 4),
  ('small', 'Den här guiden innehåller allmän information, inte personlig juridisk, skattemässig eller ekonomisk rådgivning. Regler och satser ändras; uppgifterna gäller oktober 2026. Vi tittar gärna på just din situation.'),
]},

# ================================================================== PART 1
{'kind': 'opener', 'num': '01', 'img': 'ai-05-planning.jpg', 'title': 'Tänk först,<br>titta sen',
 'intro': 'De bästa köpen börjar inte på en bostadssajt, utan vid köksbordet. Vet du i förväg vad du vill, ser du direkt under visningsresan vilket hus det blir, och vilket det inte blir.',
 'inside': ['De 10 frågorna att ställa först', 'Vilken typ av köpare är du?', 'Arbetsblad: dina önskemål']},

{'kind': 'page', 'label': 'Del 1 · Tänk först', 'blocks': [
  ('h2', 'De 10 frågorna att först ställa <em>dig själv</em>'),
  ('lead', 'Svara ärligt, gärna tillsammans med din partner eller familj. De avgör var du letar, vad du kan lägga och hur snabbt du kan agera.'),
  ('cols', [[
    ('ol', [
      '<b>Varför köper jag?</b> Semester, övervintring, flytt, pension eller uthyrning. Syftet avgör läget, bostadstypen och till och med hur du finansierar köpet.',
      '<b>Hur många månader om året är jag här?</b> Några veckor kräver något annat än hela året: tänk på underhåll, säkerhet och om du vill hyra ut bostaden.',
      '<b>Vad är min totala budget?</b> Inte bara köpeskillingen: lägg till 10–13 % i köpkostnader, rådgivning och en buffert. Vi räknar på det i del 3.',
      '<b>Köper jag med egna pengar eller med bolån?</b> Som icke-resident kan du oftast låna 60–70 %. Känn till dina gränser innan du börjar gå på visningar.',
      '<b>Hav, golf eller spansk by?</b> Kusten är livlig på sommaren; inlandet är lugnare, prisvärdare och mer genuint.',
    ]),
  ], [
    ('html', '<ol class="num" start="6">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (6, '<b>Hur viktigt är service på gångavstånd?</b> Utan bil vill du bo nära affärer, läkare och kollektivtrafik. I många urbanisationer behöver du bil.'),
      (7, '<b>Klarar jag trapporna även längre fram?</b> Tänk femton år framåt: sovrum och badrum på bottenvåningen är värda sin vikt i guld.'),
      (8, '<b>Hur viktigt är privatlivet?</b> Fristående, parhus eller lägenhet med gemensam pool: det gör skillnad både i pris och i hur du bor.'),
      (9, '<b>Vem tar hand om huset när jag är borta?</b> En trädgård med pool behöver skötas varje vecka. Räkna med förvaltning i budgeten.'),
      (10, '<b>Vad händer om mina planer ändras?</b> Köp en bostad som går lätt att sälja senare: ett bra läge är den bästa försäkringen.'),
    ]) + '</ol>'),
    ('callout', 'tip', 'Tips från vårt team', 'Köper ni som par? Svara först var för sig och jämför sedan. Skillnaderna är just de samtal du hellre tar hemma än under en visning.'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 1 · Tänk först', 'blocks': [
  ('h2', 'Vilken typ av <em>köpare</em> är du?'),
  ('lead', 'Alla köpare letar efter något olika. Känner du igen dig? Då vet du direkt var du ska lägga tyngdpunkten.'),
  ('svg', G.decision_tree(L)),
  ('sp', 3),
  ('cards', [
    {'t': 'Semesterbostad', 'x': 'Du är här några veckor om året. Välj lättskött: en lägenhet eller bungalow med gemensam pool, nära havet och flygplatsen. Ordna förvaltning och nyckelhantering.'},
    {'t': 'Övervintring', 'x': 'Tre till sex månader i solen. Satsa på vinterkomfort: värmepump, eftermiddagssol på terrassen, isolering. Ett livligt sammanhang på vintern gör stor skillnad.'},
    {'t': 'Flytt med familjen', 'x': 'Huset är anledningen, livet är det som räknas. Skolor, vård, jobb och ett riktigt grannskap betyder mer än utsikten. Läs del 7 först.'},
    {'t': 'Pension', 'x': 'Allt på ett plan, sjukhus och apotek nära, ett socialt liv. Tänk framåt: vad händer om det blir svårare att köra bil?'},
    {'t': 'Uthyrning', 'x': 'Avkastningen beror på licensen, läget och beläggningen utanför säsong. Reglerna har blivit strängare; läs sidan 24 innan du räknar.'},
    {'t': 'En kombination', 'x': 'Använda den själv och hyra ut när du är borta? Det går, men reglerna för semesteruthyrning avgör vad som är möjligt. Prata med oss först.'},
  ], 3),
]},

{'kind': 'page', 'label': 'Del 1 · Arbetsblad', 'blocks': [
  ('h2', 'Arbetsblad: <em>måste</em> ha, trevligt att ha'),
  ('lead', 'Fyll i det här innan du börjar gå på visningar och ta med det på visningsresan. Det hjälper oss också att välja ut rätt bostäder åt dig i förväg.'),
  ('cols', [[
    ('lines', 6, 'Måste ha (annars inget köp)'),
    ('lines', 6, 'Trevligt att ha'),
    ('lines', 3, 'Absolut inte'),
  ], [
    ('h3', 'Bocka för det som är viktigt'),
    ('check', ['Gångavstånd till affärer och kaféer', 'Havsutsikt eller fri utsikt', 'Egen pool', 'Gemensam pool räcker',
               'Sovrum + badrum på bottenvåningen', 'Takterrass (solarium)', 'Trädgård / uteplats för husdjur',
               'Garage eller egen parkeringsplats', 'Gästboende eller extra sovrum', 'Arbetsplats med bra internet',
               'Spansk by, inte urbanisation', 'Internationella grannar', 'Golfbana i närheten', 'Skola nära',
               'Möjlighet till licens för semesteruthyrning']),
    ('html', '<div class="panel lemon" style="margin-top:2mm"><b>Min budget, allt inräknat:</b><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div><div style="margin-top:2mm"><b>Jag vill köpa före:</b></div><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div></div>'),
  ]]),
]},

# ================================================================== PART 2
{'kind': 'opener', 'num': '02', 'img': 'town-rojales-1.jpg', 'title': 'Var vill du<br>bo?',
 'intro': 'Vega Baja är det gröna hjärtat på södra Costa Blanca: citronlundar längs floden Segura, rosa saltsjöar, milslånga sandstränder och spanska byar där livet bara fortsätter när turisterna har åkt hem.',
 'inside': ['Karta över vårt område', 'Kust, urbanisation eller by', '12 orter', 'Klimat', 'Att ta sig hit']},

{'kind': 'page', 'label': 'Del 2 · Vårt område', 'blocks': [
  ('html', '<div class="kicker">Vårt område</div>'),
  ('h2', 'Vega Baja i en <em>överblick</em>'),
  ('lead', 'Från vårt kontor i Formentera del Segura når du nästan allt inom en halvtimme: stranden i Guardamar, centrala Torrevieja eller flygplatsen i Alicante.'),
  ('cols', [[
    ('svg', G.vega_map(L)),
    ('small', 'Schematisk karta, inte skalenlig. Foto på föregående sida: Carlos III-bron i Rojales (Orniosviajero, CC BY-SA 4.0).'),
  ], [
    ('h3', 'Från vårt kontor'),
    ('table', ['Mål', 'Med bil'], [
      ['Stranden i Guardamar', 'ca 12 min'], ['Torrevieja centrum', 'ca 20 min'], ['Orihuela Costa', 'ca 25 min'],
      ['Flygplatsen i Alicante', 'ca 30 min'], ['Flygplatsen i Murcia', 'ca 45–60 min'], ['Alicante stad', 'ca 40 min'],
      ['Sjukhuset i Torrevieja', 'ca 20 min']], 'compact'),
    ('callout', 'soltura', 'Varför här?', 'Rojales har varit vårt hjärta sedan 2002. Vi arbetar medvetet i ett område vi verkligen känner, så att vi kan berätta vilken gata som har eftermiddagssol på terrassen och var det blir trångt i augusti.'),
  ]], '1.35fr 1fr'),
]},

{'kind': 'page', 'label': 'Del 2 · Var du ska bo', 'blocks': [
  ('h2', 'Kust, urbanisation eller <em>spansk by</em>?'),
  ('lead', 'Den största skillnaden är inte huset, utan omgivningen. I Vega Baja väljer du i stora drag mellan tre världar, ofta bara tio minuter från varandra.'),
  ('cards', [
    {'img': 'town-torrevieja-3.jpg', 'tag': 'Vid kusten', 't': 'Stranden på gångavstånd', 'x': 'Guardamar, Torrevieja, La Mata, Orihuela Costa.<br><br><b>+</b> hav, strandpromenader, allt nära, lätt att hyra ut<br><b>−</b> livligt i juli och augusti, högre priser, fler lägenheter och höghus'},
    {'img': 'town-ciudad-quesada-1.jpg', 'tag': 'Urbanisation', 't': 'Internationellt och grönt', 'x': 'Ciudad Quesada, La Marina, Los Montesinos, La Finca.<br><br><b>+</b> rymliga villor och bungalower, golf, internationell gemenskap, många nederländsk- och engelsktalande<br><b>−</b> du behöver ofta bil, mindre spanskt byliv'},
    {'img': 'town-rojales-2.jpg', 'tag': 'Bykärna', 't': 'Riktigt spanskt liv', 'x': 'Rojales, Formentera, Benijófar, Almoradí, Dolores, Catral.<br><br><b>+</b> genuint, livligt året runt, prisvärdare, skolor och marknad i byn<br><b>−</b> spanska är en fördel, färre pooler, smalare gator'},
  ], 3),
  ('callout', 'tip', 'Tips från vårt team', 'Besök din favoritplats två gånger: en vardagskväll i november och en lördag i augusti. Först då vet du hur det verkligen är att bo där.'),
  ('small', 'Foton: La Mata (Ximonic, CC BY-SA 4.0), Ciudad Quesada (H. Helmlechner, CC BY-SA 4.0), Rojales (Ximonic, CC BY-SA 4.0), via Wikimedia Commons.'),
]},

{'kind': 'page', 'label': 'Del 2 · Orter', 'blocks': [
  ('h2', 'Orter i <em>fokus</em> (1/2)'),
  ('cards', [
    tc('Rojales', 'Vårt hjärta', 'town-rojales-1.jpg', 'Gammal huerta-by vid Segura med en lugn spansk kärna. Med Ciudad Quesada ovanför har du all service.', '9 km', '30 min', 'spanskt byliv plus service'),
    tc('Ciudad Quesada', 'Rojales', 'town-ciudad-quesada-2.jpg', 'Grönt, internationellt bostadsområde på kullarna, med golfbanan La Marquesa, restauranger och ett vattenland.', '8 km', '30 min', 'familjer, golfare, vintergäster'),
    tc('Formentera del Segura', 'Vårt kontor', 'town-formentera-del-segura-1.jpg', 'Kompakt by vid Segura med kyrktorg och det nyare området Los Palacios. Rojales och Benijófar ligger alldeles intill.', '10 km', '30 min', 'lugn med allt nära'),
    tc('Benijófar', 'Liten & vänlig', 'town-benijofar-1.jpg', 'En av de minsta kommunerna i området, omgiven av huerta. Ungefär hälften av invånarna kommer från utlandet.', '11 km', '35 min', 'en by med internationella grannar'),
    tc('Guardamar del Segura', 'Vid havet', 'town-guardamar-del-segura-3.jpg', 'Mer än 11 km sandstrand med en stor tallskog på dynerna och en stadskärna som lever året runt.', '0,5–1 km', '25–30 min', 'strandälskare, vandrare'),
    tc('Torrevieja', 'Kuststad', 'town-torrevieja-2.jpg', 'Livlig stad mellan två rosa saltsjöar och havet, med invånare från mer än hundra länder. Allt inom räckhåll.', 'vid havet', '35 min', 'stad, hav och service'),
  ], 3),
  ('qr', LINKS['areas'], 'Alla 16 ortsguider med fakta, skolor, vård och fiestor'),
]},

{'kind': 'page', 'label': 'Del 2 · Orter', 'blocks': [
  ('h2', 'Orter i <em>fokus</em> (2/2)'),
  ('cards', [
    tc('Orihuela Costa', 'Kust', 'town-orihuela-costa-2.jpg', '16 km kust med vikar, golfbanor och köpcentret La Zenia Boulevard. Fullt på sommaren.', 'vid havet', '45 min', 'sol, hav och golf'),
    tc('San Miguel de Salinas', 'Bergsby', 'town-san-miguel-de-salinas-1.jpg', 'Bergsby med utsikt över saltsjön och naturen i Sierra Escalona precis utanför dörren.', '12 km', '40 min', 'natur och lugn, nära kusten'),
    tc('Almoradí', 'Marknadsstad', 'town-almoradi-2.jpg', 'Livlig spansk stad med ett stort torg i skuggan av fikonträd och den kända lördagsmarknaden.', '15 km', '35 min', 'dig som vill bo i det riktiga Spanien'),
    tc('Algorfa', 'Golf', 'town-algorfa-1.jpg', 'Liten by med stora urbanisationer, bland annat golfresorten La Finca. Lugnt och bebott året runt.', '15 km', '35 min', 'golfare och dig som söker lugn'),
    tc('Los Montesinos', 'Vid saltsjön', 'town-los-montesinos-2.jpg', 'Kompakt by bland citrusodlingar, några kilometer från Torreviejas rosa sjö.', '12 km', '40 min', 'lugn, nära Torrevieja'),
    tc('Dolores &amp; Catral', 'Huerta', 'town-dolores-2.jpg', 'Prisvärda jordbruksbyar med skolor, vårdcentral och veckomarknad. Många fincas och hus på landet.', '13-20 km', '30 min', 'utrymme, fincas, familjer'),
  ], 3),
  ('small', 'Foton via Wikimedia Commons: Orihuela Costa (Ximonic), San Miguel (Ximonic), Almoradí (Asdflkjh), Algorfa (19Tarrestnom65), Los Montesinos (Joanbanjo), Dolores (Wikimedia Commons), Rojales (Orniosviajero), Quesada (H. Helmlechner), Formentera &amp; Benijófar (Galopax), Guardamar (Salu Heredia, CC BY 3.0), Torrevieja (Werner Wilmes, CC BY 2.0); övriga CC BY-SA. Avstånden är ungefärliga.'),
]},

{'kind': 'page', 'label': 'Del 2 · Klimat', 'hero': 'ai-14-beach.jpg', 'hero_h': 62, 'blocks': [
  ('sp', 56),
  ('cols', [[
    ('h2', '320 soldagar är <em>inget</em> säljsnack'),
    ('p', 'Södra Costa Blanca är en av de torraste och soligaste regionerna i Europa. Världshälsoorganisationen har en gång kallat klimatet här ett av de hälsosammaste i världen; den torra luften och saltsjöarna är en lättnad för dig med led- eller luftvägsbesvär.'),
  ], [
    ('stats', [('2 900', 'soltimmar per år (ca)'), ('300', 'mm regn per år (ca)'), ('18°', 'dagtid i december'), ('26°', 'havstemperatur i augusti')], 2),
  ]], '1.1fr 1fr'),
  ('h3', 'Temperatur per månad (Alicante, genomsnitt) — stapel: min/max · prickad linje: havet'),
  ('svg', G.climate_chart(L)),
  ('cols', [[('p', '<b>Vinter</b> (dec-feb): soligt och milt, kyligt på natten. På dagen sitter du på terrassen; på kvällen vill du ha värme.')],
            [('p', '<b>Vår &amp; höst</b>: det bästa vädret, perfekt för visningar, golf och promenader. Då och då en kraftig skur.')],
            [('p', '<b>Sommar</b> (jun-sep): varmt, 30 grader och mer. Luftkonditionering och skugga är ingen lyx. Augusti är mest hektisk.')]]),
  ('small', 'Källa: AEMET, långtidsmedelvärden, avrundade. Havstemperaturerna är ungefärliga.'),
]},

{'kind': 'page', 'label': 'Del 2 · Hit kommer du', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Hit kommer du</div>'),
    ('h2', 'Närmare hemma än du <em>tror</em>'),
    ('lead', 'Två internationella flygplatser inom en timme, med direktflyg året runt till Nederländerna, Belgien, Tyskland, Skandinavien och Storbritannien.'),
    ('table', ['Från', 'Flygtid (ca)'], [
      ['Amsterdam, Eindhoven, Rotterdam', '2 h 30 - 2 h 45'], ['Bryssel, Charleroi', '2 h 20'],
      ['Düsseldorf, Köln, Weeze', '2 h 30'], ['London, Manchester', '2 h 15 - 2 h 30'],
      ['Stockholm, Köpenhamn', '3 h 30 - 3 h 45']], 'compact'),
    ('small', 'Flygtiderna är ungefärliga. Tidtabellerna varierar med säsongen.'),
  ], [
    ('img', 'ai-11-plane.jpg', 70, 'Redan vid inflygningen mot Alicante ser du de rosa saltsjöarna.'),
  ]], '1.1fr 1fr'),
  ('cards', [
    {'icon': 'plane', 't': 'Alicante-Elche (ALC)', 'x': 'Regionens största flygplats, ca 30 minuter från Rojales. Många avgångar, även på vintern.'},
    {'icon': 'plane', 't': 'Murcia (RMU)', 'x': 'Mindre och lugnare, ca 45 till 60 minuter bort. Ofta smidig för kustens södra del.'},
    {'icon': 'car', 't': 'Med bil', 'x': 'Ca 1 900 km från Nederländerna. AP-7 och CV-91/CV-95 binder ihop alla byar. Utan bil är det svårt att bo i urbanisationerna.'},
    {'icon': 'people', 't': 'Kollektivtrafik', 'x': 'Busslinjer mellan de större orterna och till flygplatsen. Tåg från Alicante och Elche till Madrid (ca 2 h 15).'},
  ], 2),
]},

# ================================================================== PART 3
{'kind': 'opener', 'num': '03', 'img': 'ai-15-bank.jpg', 'title': 'Vad kostar det<br>egentligen?',
 'intro': 'Utgångspriset är bara början. Vet du i förväg vad som tillkommer och vad en bostad kostar per år, köper du med lugn i magen och har ändå pengar kvar till möblerna.',
 'inside': ['De tre kostnadslagren', 'Räkneexempel', 'Årliga kostnader', 'Bolån']},

{'kind': 'page', 'label': 'Del 3 · Kostnader', 'blocks': [
  ('h2', 'De tre <em>kostnadslagren</em>'),
  ('lead', 'Tänk i tre lager. Tittar du bara på det första får du överraskningar hos notarien eller efter första året.'),
  ('svg', G.cost_layers(L)),
  ('sp', 3),
  ('h3', 'Lager 2 i detalj: det du betalar utöver priset'),
  ('table', ['Kostnadspost', 'Begagnad bostad', 'Nyproduktion (från byggherre)'], [
    ['Överlåtelseskatt', '<b>ITP 9 %</b> av priset (11 % över 1 miljon €)', '—'],
    ['Moms', '—', '<b>IVA 10 %</b> av priset'],
    ['Stämpelskatt', '—', '<b>AJD 1,4 %</b> av priset'],
    ['Notarie', 'ca 800 - 1 500 €', 'ca 800 - 1 500 €'],
    ['Fastighetsregister', 'ca 400 - 900 €', 'ca 400 - 900 €'],
    ['Gestoría (handläggning, betala skatter)', 'ca 300 - 500 €', 'ca 300 - 500 €'],
    ['NIE, fullmakt, översättningar', 'beror på din situation', 'beror på din situation'],
    ['Juridisk granskning och vägledning', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">på förfrågan →</b></a>', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">på förfrågan →</b></a>'],
    ['!Tumregel, totalt', '!ca 10 - 11 % + vägledning', '!ca 12 - 13 % + vägledning'],
  ], 'compact'),
  ('callout', 'info', 'Bra att veta', 'Dessa satser gäller i Comunitat Valenciana sedan 1 juni 2026 (ITP sänkt från 10 till 9 %, AJD från 1,5 till 1,4 %). Lägre satser gäller, under vissa villkor, för permanentbostad som köps av personer under 35, storfamiljer och personer med funktionsnedsättning. Tar du ett bolån betalar banken sedan 2019 skatten och notarien för pantbrevet; du betalar värderingen.'),
]},

{'kind': 'page', 'label': 'Del 3 · Räkneexempel', 'blocks': [
  ('h2', 'Räkneexempel: <em>så</em> ser det ut'),
  ('lead', 'Två vanliga situationer, med satserna i oktober 2026. Tilläggskostnaderna är genomsnitt; vi tar gärna fram din personliga sammanställning.'),
  ('cols', [[
    ('h4', 'Begagnad bungalow · 250 000 €'),
    ('table', ['Post', 'Belopp'], [
      ['Köpeskilling', '250 000 €'], ['ITP 9 %', '22 500 €'], ['Notarie', 'ca 1 000 €'], ['Register', 'ca 600 €'],
      ['Gestoría', 'ca 400 €'], ['Vägledning', 'på förfrågan'], ['!Totalt exkl. vägledning', '!ca 274 500 €']], 'num'),
    ('h4', 'Begagnad villa · 400 000 €'),
    ('table', ['Post', 'Belopp'], [
      ['Köpeskilling', '400 000 €'], ['ITP 9 %', '36 000 €'], ['Notarie', 'ca 1 200 €'], ['Register', 'ca 800 €'],
      ['Gestoría', 'ca 450 €'], ['Vägledning', 'på förfrågan'], ['!Totalt exkl. vägledning', '!ca 438 450 €']], 'num'),
  ], [
    ('h4', 'Nyproducerad lägenhet · 250 000 €'),
    ('table', ['Post', 'Belopp'], [
      ['Köpeskilling', '250 000 €'], ['IVA 10 %', '25 000 €'], ['AJD 1,4 %', '3 500 €'], ['Notarie', 'ca 1 000 €'],
      ['Register', 'ca 600 €'], ['Gestoría', 'ca 400 €'], ['Vägledning', 'på förfrågan'], ['!Totalt exkl. vägledning', '!ca 280 500 €']], 'num'),
    ('callout', 'warn', 'Nyproduktion: se upp', 'Du betalar moms på varje delbetalning: på reservationsavgiften, på delbetalningarna under bygget och på slutbetalningen vid tillträdet. Räkna med det i din planering.'),
    ('callout', 'tip', 'Tips från vårt team', 'Sätt undan köpkostnaderna så fort du reserverar en bostad. Hos notarien måste allt vara klart på en gång, inklusive en check eller överföring för skatten.'),
  ]]),
  ('cta', LINKS['contact'], 'Begär din personliga kostnadssammanställning', 'Berätta vilken bostad eller budget du har i tankarna. Du får en skräddarsydd sammanställning med varje post som gäller för din situation.'),
]},

{'kind': 'page', 'label': 'Del 3 · Årliga kostnader', 'blocks': [
  ('h2', 'Vad kostar en bostad <em>per år</em>?'),
  ('lead', 'Lager 3 är det som oftast glöms bort. Beloppen är exempel för Vega Baja; de varierar mellan kommun, urbanisation och bostad.'),
  ('table', ['Post', 'Lägenhet', 'Bungalow / parhus', 'Villa med pool'], [
    ['IBI (fastighetsskatt)', '300 € / år', '400 € / år', '700 € / år'],
    ['Sophämtning (basura)', '120 € / år', '120 € / år', '140 € / år'],
    ['Samfällighetsavgift (comunidad)', '70 € / mån', '45 € / mån', 'oftast ingen'],
    ['Hem- och byggnadsförsäkring', '250 € / år', '350 € / år', '550 € / år'],
    ['Skötsel av trädgård och pool', '—', '—', '60+ € / mån'],
    ['El', '70 € / mån', '90 € / mån', '140 € / mån'],
    ['Vatten', '25 € / mån', '35 € / mån', '60 € / mån'],
    ['Internet och mobil', '50 € / mån', '50 € / mån', '50 € / mån'],
  ], 'num compact'),
  ('cols', [[
    ('h3', 'Skatt som icke-resident'),
    ('p', 'Är du inte officiellt bosatt i Spanien betalar du skatt även om du inte hyr ut bostaden: på en schablonintäkt på 1,1 % (ibland 2 %) av taxeringsvärdet. För invånare i EU, Norge och Island är skattesatsen 19 %.'),
    ('html', '<div class="panel"><b>Exempel:</b> taxeringsvärde 100 000 € × 1,1 % = 1 100 € schablonintäkt × 19 % = <b>ca 209 € per år</b>. Deklareras på Modelo 210, senast 31 december året därpå.</div>'),
  ], [
    ('h3', 'Räkna själv'),
    ('p', 'På vår webbplats finns en kalkylator för månadskostnader. Välj bostadstyp, hushåll, sjukvård och bil, så ser du direkt vad det kostar att bo här per månad. Det du fyller i stannar i din egen webbläsare.'),
    ('qr', LINKS['costs'], 'Kalkylator för månadskostnader'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 3 · Finansiering', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Finansiering</div>'),
    ('h2', 'Spanskt bolån: <em>så</em> funkar det'),
    ('lead', 'Ordnar du finansieringen i god tid vet du vilka bostäder som ligger inom räckhåll, och kan agera snabbt när rätt bostad dyker upp.'),
    ('table', ['', 'Icke-resident', 'Resident'], [
      ['Maximalt lån', 'oftast 60 - 70 %', 'upp till ca 80 %'], ['Löptid', 'ofta till 70-75 års ålder', 'ofta till 75 års ålder'],
      ['Egen insats', '30 - 40 % + kostnader', '20 % + kostnader'], ['Ränta', 'fast, rörlig eller blandad', 'fast, rörlig eller blandad']], 'compact'),
    ('h3', 'Det här vill banken se'),
    ('check', ['Pass och NIE', 'Inkomstbevis (lönespecifikationer eller årsbokslut)', 'Senaste deklarationerna', 'Kontoutdrag för de senaste månaderna', 'Översikt över befintliga lån', 'Anställningsavtal eller pensionsbesked']),
  ], [
    ('img', 'ai-15-bank.jpg', 52),
    ('h3', 'Processen i 4 steg'),
    ('steps', [('Lånelöfte', 'Utifrån din inkomst och egna insats bestämmer banken hur mycket du kan låna. Gör det före din visningsresa.'),
               ('Värdering (tasación)', 'En auktoriserad värderare fastställer värdet. Banken lånar ut på det lägsta av värderingen och köpeskillingen.'),
               ('Bindande erbjudande (FEIN)', 'Du får det minst tio dagar före notariebesöket. Hos notarien bekräftar du att du förstår det.'),
               ('Undertecknande', 'Du skriver under köpebrevet och pantbrevet hos notarien samma dag.')]),
    ('callout', 'soltura', 'Så gör vi', 'Vi kopplar ihop dig med spanska banker och sköter bolånet från ansökan till notarien. Vi hjälper dig också att öppna ett spanskt bankkonto.'),
  ]]),
]},

# ================================================================== PART 4
{'kind': 'opener', 'num': '04', 'img': 'ai-12-newbuild.jpg', 'title': 'Vilken bostad<br>passar dig?',
 'intro': 'Lägenhet eller villa, nyproduktion eller ett hus med karaktär, för eget bruk eller uthyrning: varje val påverkar din budget, ditt underhåll och hur mycket du njuter.',
 'inside': ['Bostadstyper jämförda', 'Nyproduktion eller begagnat', 'Uthyrning: reglerna', 'Smarta visningar']},

{'kind': 'page', 'label': 'Del 4 · Bostadstyper', 'blocks': [
  ('h2', 'Bostadstyper <em>jämförda</em>'),
  ('lead', 'De spanska termerna stöter du på på varje bostadssajt. Här är vad de betyder och var skillnaderna finns.'),
  ('table', ['Typ', 'Vad är det?', 'Fördelar', 'Tänk på'], [
    ['<b>Lägenhet</b> (apartamento)', 'Bostad i ett komplex, ofta med gemensam pool', 'Lite underhåll, tryggt, prisvärt', 'Samfällighetsavgift, ljud från grannar, hiss?'],
    ['<b>Takvåning</b> (ático)', 'Översta våningen med stor terrass eller solarium', 'Ljust, utsikt, avskilt', 'Varmt på sommaren, trappor om hiss saknas'],
    ['<b>Bungalow</b>', 'Lägenhet på bottenplan eller första våningen i ett lågt komplex, egen entré', 'Allt på ett plan, egen terrass, populär', 'Bottenplan: insyn; övervåning: trappor'],
    ['<b>Quad / parhus</b> (quad, adosado)', 'Ett av fyra eller fler sammanbyggda hus', 'Egen trädgård, billigare än fristående', 'Gemensamma väggar, samfällighetens regler'],
    ['<b>Radhus</b> (casa adosada, dúplex)', 'Radhus i två plan', 'Utrymme, ofta takterrass', 'Trappor, sovrum på övervåningen'],
    ['<b>Villa</b> (chalet independiente)', 'Fristående hus på egen tomt', 'Avskilt, egen pool, möjlighet att bygga ut', 'Underhåll, säkerhet, högre kostnader'],
    ['<b>Finca</b> (casa de campo)', 'Hus på landet med mark, utanför orten', 'Lugn, utrymme, karaktär', 'Tillstånd, vatten, tillfartsväg, legalisering'],
  ], 'compact'),
  ('img', 'town-ciudad-quesada-1.jpg', 44, 'Ciudad Quesada: villor, bungalows och lägenheter på kullarna ovanför Rojales (H. Helmlechner, CC BY-SA 4.0).'),
  ('callout', 'tip', 'Tips från vårt team', 'Fråga om väderstrecket för varje bostad. En terrass mot söder eller väster ger dig sol till sen eftermiddag på vintern; på sommaren vill du hellre ha skugga. De bästa bostäderna har båda.'),
]},

{'kind': 'page', 'label': 'Del 4 · Nyproduktion', 'blocks': [
  ('cols', [[
    ('h2', 'Nyproduktion eller <em>begagnat</em>?'),
    ('table', ['', 'Nyproduktion', 'Begagnat'], [
      ['Skatt', '10 % IVA + 1,4 % AJD', '9 % ITP'], ['Inflyttning', 'efter färdigställande, ofta 12-24 månader', 'direkt'],
      ['Garanti', 'lagstadgade byggarantier', 'ingen, kontrollera noga'], ['Energi', 'modern, effektiv', 'varierar'],
      ['Läge', 'ofta nya områden', 'etablerade, gröna områden'], ['Möbler', 'tomt', 'ofta möblerat'],
      ['Det du ser', 'planritning och visningsbostad', 'det riktiga huset']], 'compact'),
    ('h3', 'Köpa av en byggherre'),
    ('ul', ['Du betalar i omgångar: reservation, handpenning (ofta 30-50 % under bygget), resten vid färdigställandet.',
            'Enligt lag måste varje betalning före färdigställandet täckas av en <b>bankgaranti eller försäkring</b>. Be alltid om den.',
            'Kontrollera bygglovet och tidsplanen, och kom överens om vad som händer vid förseningar.',
            'Vid färdigställandet besiktar du bostaden tillsammans med oss. Mindre fel hamnar på en lista som byggherren måste åtgärda.']),
  ], [
    ('img', 'ai-12-newbuild.jpg', 58),
    ('callout', 'soltura', 'Så hanterar vi nyproduktion', '<p>Vi skickar inte travar av broschyrer och prislistor. Vid nyproduktion vill vi först prata med dig personligen, och helst visa projektet på plats. En planritning berättar inte hur solen faller, hur området känns eller hur långt det egentligen är till mataffären.</p><p>Därför ber vi om ditt namn, mobilnummer, e-postadress och när du kan vara i Spanien.</p>'),
    ('qr', LINKS['contact'], 'Boka ett introduktionsmöte om nyproduktion'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 4 · Uthyrning', 'blocks': [
  ('h2', 'Uthyrning: vad är fortfarande <em>tillåtet</em>?'),
  ('lead', 'Sedan 2024 har Spanien och Comunitat Valenciana skärpt reglerna för semesteruthyrning rejält. Vill du hyra ut, låt det kontrolleras innan du köper.'),
  ('cols', [[
    ('h3', 'Semesteruthyrning (kort tid)'),
    ('check', [
      '<b>Registrering hos Generalitat</b> i registret över turistboenden, med ett intyg från kommunen om att uthyrning är tillåten på platsen.',
      '<b>Nationellt registreringsnummer</b>: sedan 1 juli 2025 får en bostad utan detta nummer inte längre annonseras på Airbnb, Booking och andra plattformar.',
      '<b>Samfällighetens godkännande</b>: sedan april 2025 måste 3/5 av ägarna i ett lägenhetskomplex godkänna ny semesteruthyrning.',
      '<b>Kommunala begränsningar</b>: vissa kommuner beviljar inte längre nya licenser i vissa områden.',
      '<b>Gästregistrering</b> hos polisen och ansvarsförsäkring.',
    ]),
  ], [
    ('h3', 'Lång tid'),
    ('p', 'Hyr du ut bostaden som boende i ett år eller längre gäller hyreslagen (LAU). Som privat hyresvärd är du i princip bunden till avtal på upp till fem år. Enklare tillstånd, men mindre flexibelt.'),
    ('h3', 'Skatt på hyresintäkter'),
    ('p', 'Som icke-resident från EU betalar du 19 % på nettohyresintäkten, efter avdrag för kostnader. Utanför EU är det 24 % på bruttobeloppet. Deklareras kvartalsvis på Modelo 210.'),
    ('callout', 'warn', 'Se upp', 'Utgå aldrig från att en bostad "kan hyras ut" bara för att nuvarande ägare gör det. Be om registreringsnumret och låt kontrollera om det kan föras över i ditt namn.'),
  ]]),
  ('img', 'ai-10-remote.jpg', 46, 'Allt fler köpare kombinerar eget bruk med distansarbete i stället för uthyrning.', 'center 40%'),
]},

{'kind': 'page', 'label': 'Del 4 · Visa smart', 'band': 'ai-03-viewing.jpg', 'band_h': 62, 'band_pos': 'center 40%', 'blocks': [
  ('h2', 'Gå på visning smart: <em>se bortom</em> köket'),
  ('lead', 'Ett vackert hem är förföriskt. Ta med dig den här listan och titta på det du inte ser direkt.'),
  ('cols', [[
    ('h3', 'I och runt huset'),
    ('check', ['Fukt eller mögel, särskilt på vintern och i bottenvåningar', 'Sprickor i väggar och terrasser',
               'Ålder på luftkonditionering, varmvattenberedare och poolpump', 'Vattentryck och varmvatten', 'Tak och takterrass: avrinning, läckor',
               'Är tillbyggnader, inglasade terrasser och poolen lagliga och registrerade?', 'Väderstreck för terrass och vardagsrum',
               'Buller: väg, grannar, barer, hundar', 'Internet: finns fiber?', 'Fönster: dubbelglas, persienner, myggnät']),
  ], [
    ('h3', 'I området'),
    ('check', ['Ta en promenad: hur ser gatan ut?', 'Hur livligt är det under högsäsong?', 'Avstånd till mataffär, apotek, läkare',
               'Byggplaner i området', 'Skick på gemensam pool och trädgård', 'Nivå på samfällighetsavgifter och eventuella skulder',
               'Översvämningsrisk för lågt belägna hus längs Segura']),
    ('callout', 'tip', 'Från verkligheten', 'En kund skulle köpa ett hus med en pool som aldrig hade legaliserats. Vi upptäckte det i papperen och fick det ordnat före notarien. Lite jobb för säljaren, men köparen slipper böter och problem vid en framtida försäljning.'),
  ]]),
]},

# ================================================================== PART 5
{'kind': 'opener', 'num': '05', 'img': 'ai-04-keys.jpg', 'title': 'Köpprocessen<br>steg för steg',
 'intro': 'I Spanien blir ett köp slutgiltigt först hos notarien, men de viktigaste överenskommelserna görs innan dess. Känner du till ordningen vet du alltid var du står.',
 'inside': ['Från första mötet till nycklarna', 'NIE och fullmakt', 'Juridisk kontroll', 'De 12 dyraste misstagen']},

{'kind': 'page', 'label': 'Del 5 · Processen', 'blocks': [
  ('h2', 'Från första mötet till <em>nycklarna</em>'),
  ('lead', 'I genomsnitt tar ett köp fyra till åtta veckor från bud till notarie. Orienteringen innan dess tar månader för de flesta: i snitt går det ungefär nio månader mellan "ekonomiskt redo" och nycklarna.'),
  ('svg', G.process_bar(L)),
  ('sp', 2),
  ('steps', [
    ('Reservation', 'När du och säljaren har kommit överens om priset skriver du på ett reservationsavtal och betalar en handpenning, oftast 3 000 till 5 000 €. Bostaden tas av marknaden och priset ligger fast.', 'dag 1'),
    ('Köpekontrakt (contrato de arras)', 'Kontraktet fastställer pris, villkor och tillträdesdag. Du fyller på handpenningen, oftast till 10 % av priset.', 'inom 1-3 veckor'),
    ('Kontroller och förberedelser', 'Fastighetsregister, kataster, skulder, tillstånd, samfällighetsavgifter: vi kontrollerar allt och berättar vad vi hittar. Vi samordnar notarie, bank och vid behov advokat.', 'parallellt'),
    ('Tillträde hos notarien', 'Du betalar resten och skriver under köpebrevet (escritura). En av oss är med dig den dagen. Kan du inte vara där går det att lösa med fullmakt.', 'efter 4-8 veckor'),
    ('Registrering och eftervård', 'Köpebrevet förs in i fastighetsregistret. Vi för över el, vatten, IBI och samfällighetsavgifter till ditt namn.', 'efteråt'),
  ]),
  ('stats', [('4-8 v.', 'från accepterat bud till notarie'), ('10 %', 'handpenning vid köpekontraktet (vanligt)'), ('± 9 mån.', 'i snitt från "ekonomiskt redo" till nycklarna'), ('1 dag', 'hos notarien, med en av oss vid din sida')]),
]},

{'kind': 'page', 'label': 'Del 5 · Papper', 'band': 'town-san-miguel-de-salinas-1.jpg', 'band_h': 34, 'band_pos': 'center 60%', 'blocks': [
  ('h2', 'NIE, bankkonto och <em>fullmakt</em>'),
  ('cols', [[
    ('h3', 'NIE-numret'),
    ('p', 'Ditt identifikationsnummer som utlänning i Spanien. Du behöver det för notarien, ett bankkonto, el och vatten och skatter. Inget NIE, inget köp.'),
    ('ul', ['Du kan ansöka på en polisstation i Spanien, på ett spanskt konsulat i ditt hemland eller via ett ombud med fullmakt.',
            'Räkna med några veckor. Börja alltså i god tid innan du reserverar en bostad.',
            'Köper ni som par? Ni behöver var sitt NIE.']),
    ('h3', 'Ett spanskt bankkonto'),
    ('p', 'För betalningen hos notarien och autogirot för IBI, samfällighetsavgifter, el och vatten. Banken vill se ditt pass, ditt NIE och bevis på inkomst eller pengarnas ursprung.'),
  ], [
    ('h3', 'Köpa på distans med fullmakt'),
    ('p', 'Du behöver inte själv gå till notarien. Med en notariebestyrkt fullmakt (poder) kan någon skriva under, betala och ordna el och vatten åt dig. Du skriver under den hos en spansk notarie eller hos en notarie i ditt eget land, med apostille.'),
    ('quote', 'Allt ordnas från A till Ö. Rätt otroligt att köpa ett par lägenheter på distans utan att någonsin ha varit där.', 'Google-recension, oktober 2026 (översatt)'),
    ('callout', 'soltura', 'Så gör vi', 'Vi hjälper till med blanketter och tider för ditt NIE, öppnar ett bankkonto tillsammans med dig och ordnar, om du vill, allt med fullmakt, så att du bara behöver komma för nycklarna.'),
  ]]),
  ('h3', 'Vad behöver du till vad?'),
  ('table', ['', 'NIE', 'Bankkonto', 'Fullmakt'], [
    ['Pass eller id-kort', '✓', '✓', '✓'], ['Ifylld ansökningsblankett (EX-15)', '✓', '', ''],
    ['Skäl för ansökan (t.ex. reservation av bostad)', '✓', '', ''], ['NIE', '', '✓', '✓'],
    ['Bevis på inkomst / pengarnas ursprung', '', '✓', ''], ['Apostille (om undertecknad utanför Spanien)', '', '', '✓']], 'compact'),
]},

{'kind': 'page', 'label': 'Del 5 · Kontroller', 'blocks': [
  ('h2', 'Den juridiska kontrollen: <em>vad</em> vi tittar på'),
  ('lead', 'I Spanien följer skulder på en bostad med till den nya ägaren. Därför är kontrollerna i förväg den viktigaste delen av köpet.'),
  ('cols', [[
    ('check', [
      '<b>Nota simple</b>: vem är ägare enligt fastighetsregistret, och finns det ett lån eller en belastning på bostaden?',
      '<b>Kataster</b>: stämmer storlek och beskrivning med verkligheten och fastighetsregistret?',
      '<b>Tillstånd</b>: byggdes huset, tillbyggnader, inglasade terrasser och pool lagligt och är de registrerade?',
      '<b>Beboelighet</b> (cédula / licencia de primera ocupación) där det krävs för avtal om el och vatten.',
      '<b>IBI</b>: är fastighetsskatten för de senaste åren betald?',
    ]),
  ], [
    ('check', [
      '<b>Samfälligheten</b>: ett intyg från förvaltaren om att det inte finns skulder, och om större utgifter är planerade.',
      '<b>El och vatten</b>: inga obetalda vatten- eller elräkningar.',
      '<b>Energicertifikat</b>: obligatoriskt vid försäljning.',
      '<b>Planläge</b>: ligger bostaden i ett område med planer, begränsningar eller risker?',
      '<b>Säljare som inte är bosatt i Spanien</b>: köparen håller inne 3 % av priset och betalar in det till skattemyndigheten. Vi ordnar det hos notarien.',
    ]),
  ]]),
  ('callout', 'soltura', 'Oberoende och öppna', 'Vi berättar vad vi hittar, även om det försenar försäljningen. En kund skrev: "De är öppna med brister och dolda kostnader och undersöker allt grundligt." Det är precis så vi vill arbeta.'),
  ('img', 'ai-04-keys.jpg', 50, '', 'center 60%'),
]},

{'kind': 'page', 'label': 'Del 5 · Bud och arras', 'blocks': [
  ('h2', 'Lägga bud, reservera och vad <em>"under bud"</em> betyder'),
  ('cols', [[
    ('h3', 'Lägga ett bud'),
    ('p', 'Du lägger ditt bud via oss, helst skriftligt, med pris, eventuella villkor (som ett bolån eller vilka möbler som ingår) och önskad tillträdesdag. Vi presenterar det för säljaren och förhandlar för din räkning.'),
    ('h3', 'Under bud hos Soltura Real Estate'),
    ('p', 'Så snart ett bud har accepterats och reservationen är betald är bostaden under bud hos oss. Då stoppar vi visningarna och utgår från att köpet blir av. Går köpet ändå i stöpet kommer bostaden tillbaka på marknaden. På vår webbplats kan du anmäla dig för att få besked direkt.'),
  ], [
    ('h3', 'Köpekontraktet med handpenning (arras)'),
    ('table', ['Vad händer om...', 'Följd'], [
      ['köparen hoppar av', 'köparen förlorar handpenningen'],
      ['säljaren hoppar av', 'säljaren betalar tillbaka dubbla handpenningen'],
      ['bolånet inte går igenom', 'skyddat bara om det är ett villkor i kontraktet']], 'compact'),
    ('p', 'Detta är den vanliga formen (arras penitenciales, art. 1454 i spanska civillagen). Läs alltid kontraktet noga: villkoren avgör vem som bär vilken risk.'),
    ('callout', 'warn', 'Se upp', 'Betala aldrig handpenning direkt till en säljare du inte känner, och aldrig utan skriftligt kontrakt. Hos oss går handpenningen via ett kontrollerat konto med ett undertecknat kontrakt.'),
  ]]),
  ('cols', [[
    ('callout', 'tip', 'Tips från vårt team: bjud realistiskt', 'Ett bud långt under utgångspriset kan fungera för en bostad som legat ute länge, men bra hus i Vega Baja går ofta snabbt. Vi berättar ärligt hur utgångspriset står sig mot liknande försäljningar.'),
  ], [
    ('qr', LINKS['home'], 'Bostad under bud? Anmäl dig på dess sida för "Tillbaka på marknaden"'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 5 · Fallgropar', 'blocks': [
  ('h2', 'De 12 dyraste <em>misstagen</em> (och hur du undviker dem)'),
  ('lead', 'På mer än tjugo år har vi sett dem alla. Som tur är går vartenda ett att undvika.'),
  ('cols', [[
    ('ol', [
      '<b>Bara titta på priset.</b> Räkna alltid med 10 till 13 % i köpkostnader, plus rådgivning och en buffert.',
      '<b>Bli förälskad på semestern och skriva på samma vecka.</b> Sov på saken och se området vid en annan tid.',
      '<b>Ingen juridisk kontroll.</b> Skulder och olagliga byggen följer med till den nya ägaren.',
      '<b>Betala handpenning utan kontrakt</b> eller till någon du inte känner.',
      '<b>Söka NIE för sent.</b> Notariedatumet skjuts upp och din handpenning står på spel.',
      '<b>Räkna med hyresintäkter</b> utan att kolla om uthyrning är tillåten.',
    ]),
  ], [
    ('html', '<ol class="num">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (7, '<b>Underskatta underhållet.</b> Pool, trädgård och luftkonditionering kostar pengar, även när du inte är där.'),
      (8, '<b>Inget spanskt testamente.</b> Dina arvingar förlorar månader och pengar.'),
      (9, '<b>Glömma skatten för icke-bosatta.</b> Även utan uthyrning lämnar du en deklaration varje år.'),
      (10, '<b>Underskatta sommarsolen.</b> En terrass mot väster utan skugga går inte att använda i augusti.'),
      (11, '<b>Köpa för långt från service</b> utan bil, eller utan att tänka på framtiden.'),
      (12, '<b>Försöka göra allt själv</b> på ett språk och i ett system du inte känner. Bra rådgivning betalar sig själv.'),
    ]) + '</ol>'),
  ]]),
  ('img', 'ai-16-cycling.jpg', 56, 'Köper du väl förberedd kan du bara njuta efteråt.', 'center 45%'),
]},

# ================================================================== PART 6
{'kind': 'opener', 'num': '06', 'img': 'ai-03-viewing.jpg', 'title': 'Din visnings-<br>resa',
 'intro': 'En väl förberedd visningsresa är den snabbaste vägen till rätt hem. Vi gör ett förurval, planerar effektivt och kör dig runt, så att du kan fokusera på att välja.',
 'inside': ['Förberedelser', 'Packlista', 'En dag med oss', 'Vårt kontor']},

{'kind': 'page', 'label': 'Del 6 · Förberedelser', 'band': 'ai-11-plane.jpg', 'band_h': 62, 'band_pos': 'center', 'blocks': [
  ('h2', 'Så förbereder du din <em>resa</em>'),
  ('cols', [[
    ('h3', 'Det här behöver vi från dig i förväg'),
    ('check', ['För- och efternamn på alla köpare', 'Mobilnummer och e-postadress', 'Dina resdatum och hur många dagar du har',
               'Din budget, allt inräknat', 'Egna pengar eller bolån, och är det förhandsbeviljat?', 'Ditt arbetsblad med önskemål (sidan 8)',
               'Bostäder du redan sett på nätet, med referens']),
    ('callout', 'tip', 'Tips från vårt team', 'Undvik augusti om du kan välja. Oktober till juni är perfekt: behagligt väder, lugna vägar och mer tid och uppmärksamhet från vårt team.'),
    ('h3', 'Hur många dagar?'),
    ('p', 'Räkna med två till fyra dagar. Dag 1 att lära känna varandra och visningar, dag 2 fler visningar och återbesök hos favoriterna, dag 3 tid för en andra visning, omgivningarna och kanske banken eller NIE.'),
  ], [
    ('h3', 'Packlista'),
    ('check', ['Pass eller id-kort (behövs även för NIE och banken)', 'NIE, om du redan har ett', 'Bevis på inkomst och färska kontoutdrag',
               'Ditt arbetsblad och den här guiden', 'Mobil med kamera och fullt batteri, powerbank', 'Måttband för möbler', 'Solglasögon, keps och vatten (även på vintern)',
               'Bekväma skor: trappor, takterrasser, trädgårdar', 'Bankkort för en eventuell reservation']),
    ('img', 'ai-05-planning.jpg', 60),
  ]]),
]},

{'kind': 'page', 'label': 'Del 6 · En dag med oss', 'band': 'town-rojales-2.jpg', 'band_h': 72, 'band_pos': 'center 65%', 'blocks': [
  ('h2', 'Så ser en <em>visningsdag</em> ut'),
  ('cols', [[
    ('steps', [
      ('Möte på kontoret', 'Kaffe i Formentera del Segura. Vi går igenom dina önskemål en gång till och visar dig rutten.', '10:00'),
      ('Bostad 1 till 3', 'Vi kör dig runt. Mellan visningarna berättar vi om området, byarna och priserna.', '10:45'),
      ('Lunch', 'I en av byarna: en paus, tid att sortera intrycken och ställa frågor. Ofta faller en bostad bort här.', '13:30'),
      ('Bostad 4 till 6', 'Utifrån det du såg på förmiddagen justerar vi eftermiddagens program.', '15:00'),
      ('Summering', 'Vad stack ut, vad gjorde dig besviken? Vilken bostad vill du se igen, kanske vid en annan tid på dagen?', '18:00'),
    ]),
  ], [
    ('img', 'ai-06-market.jpg', 62, 'Ta dig tid för själva byn: marknaden säger mer än en planritning.'),
    ('callout', 'tip', 'Inte för många', 'Fler än sex till åtta bostäder på en dag flyter ihop. Fotografera gatunamnet innan du går in och skriv ner tre plus och tre minus direkt efter varje visning.'),
    ('callout', 'soltura', 'Förurval', 'Eftersom vi känner till dina önskemål i förväg ser du bara bostäder som verkligen är aktuella. Ofta även hus som inte finns på nätet än.'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 6 · Vårt kontor', 'hero': 'office-crop.jpg', 'hero_h': 72, 'hero_pos': 'center', 'blocks': [
  ('sp', 66),
  ('cols', [[
    ('html', '<div class="kicker">Kom och hälsa på</div>'),
    ('h2', 'Vårt kontor i <em>Formentera del Segura</em>'),
    ('p', 'Mitt i vårt område, några minuter från Rojales, Benijófar och Ciudad Quesada. Parkering utanför dörren.'),
    ('facts', [('Adress', 'Avda. de la Constitución s/n<br>03179 Formentera del Segura'), ('Öppettider', 'mån-fre 10:00-14:00<br>lör-sön enligt överenskommelse'),
               ('Telefon', '+34 966 792 113'), ('WhatsApp', '+34 664 414 515'), ('E-post', 'info@gruposoltura.com'), ('Språk', 'nederländska, engelska, tyska, spanska')]),
  ], [
    ('qr', LINKS['maps'], 'Vägbeskrivning i Google Maps'),
    ('qr', LINKS['wa'], 'Skicka ett WhatsApp till oss'),
    ('qr', LINKS['contact'], 'Boka ett möte'),
  ]], '1.25fr 1fr'),
  ('img', 'town-formentera-del-segura-1.jpg', 50, 'Byns torg i Formentera del Segura med kyrka och rådhus, några minuter från vårt kontor (Galopax, CC BY-SA 4.0).'),
]},

# ================================================================== PART 7
{'kind': 'opener', 'num': '07', 'img': 'ai-02-family.jpg', 'title': 'Efter nycklarna:<br>att bo här',
 'intro': 'Att köpa huset är ett steg. Att bygga ett liv här är resten. Vi är din kontakt även efter notarien, på ett språk du förstår.',
 'inside': ['De första 30 dagarna', 'Skatter', 'Testamente', 'Flytta med familjen', 'Husdjur', 'Livet här', 'Ordlista']},

{'kind': 'page', 'label': 'Del 7 · De första 30 dagarna', 'blocks': [
  ('h2', 'De första <em>30 dagarna</em> efter nycklarna'),
  ('lead', 'Nu är du ägare. Det här ordnar du de första veckorna; det mesta gör vi tillsammans med dig eller tar hand om åt dig.'),
  ('cols', [[
    ('h3', 'Hus, el och vatten'),
    ('check', ['El i ditt namn (med autogiro)', 'Vatten och sophämtning i ditt namn', 'Beställ internet och tv (fiber?)',
               'Teckna hem- och villaförsäkring', 'Byt lås', 'Fundera på larm eller kameror',
               'Ordna skötsel av trädgård och pool', 'Ordna nyckelhantering när du är borta']),
  ], [
    ('h3', 'Papper'),
    ('check', ['IBI och basura i ditt namn och betalt via autogiro', 'Samfälligheten: meddela förvaltaren, ordna autogiro', 'Kontrollera inskrivningen i fastighetsregistret',
               'Låt upprätta ett spanskt testamente', 'Om du flyttar hit: skriv dig i kommunen (padrón)', 'Om du flyttar hit: ansök om residencia',
               'Som icke-bosatt: skriv in Modelo 210 i kalendern', 'Spara digitala kopior av alla handlingar']),
  ]]),
  ('callout', 'soltura', 'Eftervård på ett språk du förstår', 'Efter notarien för vi över el, vatten, IBI och samfällighetsavgifter till ditt namn. Sedan kan du alltid vända dig till oss med frågor, för lokala hantverkare och för pappersarbete. En kund skrev: "Jag var också nöjd med servicen efter köpet. Jag kunde fortfarande komma till dem med frågor efteråt."'),
  ('img', 'ai-08-dog.jpg', 52, '', 'center 55%'),
]},

{'kind': 'page', 'label': 'Del 7 · Skatter', 'band': 'ai-10-remote.jpg', 'band_h': 68, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Skatter som <em>ägare</em>'),
  ('lead', 'Det viktigaste är om du är skattemässigt bosatt (resident) eller inte. Det är du om du bor här mer än 183 dagar om året eller har dina huvudsakliga intressen här.'),
  ('table', ['', 'Ej bosatt', 'Bosatt'], [
    ['Inkomstskatt', 'På en schablonintäkt från bostaden (1,1–2 % av taxeringsvärdet) och på hyresintäkter', 'På hela din globala inkomst, progressiv skattesats'],
    ['Skattesats (EU-medborgare)', '19 %', 'stiger stegvis'],
    ['Deklaration', 'Modelo 210, årligen (eget bruk) eller kvartalsvis (uthyrning)', 'Årlig IRPF-deklaration (renta)'],
    ['IBI och basura', 'ja, årligen till kommunen', 'ja, årligen till kommunen'],
    ['Vid försäljning', '19 % på vinsten; köparen håller inne 3 %', 'progressivt 19–30 % på vinsten; undantag möjliga'],
    ['Kommunal värdestegringsskatt (plusvalía)', 'vid försäljning, betalas av säljaren', 'vid försäljning, betalas av säljaren'],
  ], 'compact'),
  ('cols', [[
    ('h3', 'Modelo 210: en gång om året'),
    ('p', 'Som ej bosatt lämnar du en deklaration varje år, även om du bara använder bostaden själv. Vi sköter deklarationen åt många av våra kunder – och det blir ett trevligt årligt tillfälle att höras av.'),
  ], [
    ('h3', 'Dubbelbeskattning'),
    ('p', 'Spanien har skatteavtal med bland annat Nederländerna, Belgien, Tyskland och Storbritannien. Deklarerar du både i Spanien och i ditt hemland, se till att få bra rådgivning.'),
  ]]),
  ('callout', 'info', 'Bra att veta', 'Skatteregler är personliga. Detta är en överblick, inte rådgivning. För din situation samarbetar vi med skatterådgivare som kan både Spanien och ditt hemland.'),
]},

{'kind': 'page', 'label': 'Del 7 · Testamente', 'band': 'town-orihuela-costa-1.jpg', 'band_h': 66, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Arv</div>'),
    ('h2', 'Ett spanskt testamente: <em>liten</em> insats, stor skillnad'),
    ('p', 'En bostad i Spanien omfattas av spanska förfaranden, även om ditt testamente hemma är väl ordnat. Utan spanskt testamente måste dina arvingar först fastställa vem som ärver. Det tar månader, översättningar och pengar, och under tiden kan bostaden inte säljas eller överlåtas.'),
    ('h3', 'Varför ett spanskt testamente'),
    ('ul', ['Snabbare och billigare arvskifte hos den spanska notarien.', 'Enligt EU:s arvsförordning kan du välja arvsrätten i ditt medborgarskapsland.',
            'Det spanska testamentet gäller bara dina tillgångar i Spanien och behöver inte ersätta ditt testamente hemma.', 'Enkelt att ordna: ett besök hos notarien.']),
    ('callout', 'tip', 'Arvsskatt i Comunitat Valenciana', 'Sedan 2023 får partner, barn och föräldrar här 99 % reduktion på den spanska arvsskatten. Låt ändå kontrollera din personliga situation: villkor gäller, och ditt hemland kan också ta ut skatt.'),
  ], [
    ('img', 'ai-16-cycling.jpg', 96, '', 'center'),
    ('callout', 'soltura', 'Så gör vi', 'Vi ordnar ett spanskt testamente åt dig hos notarien, förklarat på ett språk du förstår. Många kunder gör det samma dag som tillträdet.'),
  ]], '1.15fr 1fr'),
]},

{'kind': 'page', 'label': 'Del 7 · Flytta hit', 'band': 'ai-02-family.jpg', 'band_h': 78, 'band_pos': 'center 35%', 'blocks': [
  ('h2', 'Flytta hit med din <em>familj</em>'),
  ('lead', 'Allt fler av våra köpare är unga familjer som bygger ett nytt liv här. Då är huset anledningen och livet själva ämnet.'),
  ('cols', [[
    ('cards', [
      {'icon': 'doc', 't': 'Registrering', 'x': '<b>Padrón</b>: folkbokföring hos kommunen, behövs för skola, vård och många lokala förmåner. <b>Residencia</b>: EU-medborgare som stannar längre än tre månader registrerar sig som bosatta (intyg om inkomst och sjukförsäkring). Medborgare utanför EU behöver visum eller uppehållstillstånd.'},
      {'icon': 'health', 't': 'Vård', 'x': 'Arbetar du i Spanien omfattas du via socialförsäkringen. EU-pensionärer flyttar ofta över sitt skydd med blankett S1. Annars gäller privat sjukförsäkring. Skriv sedan in dig på din vårdcentral och ansök om SIP-kortet. Sjukhus finns i Torrevieja och Orihuela. Larmnummer 112.'},
    ], 1),
  ], [
    ('cards', [
      {'icon': 'school', 't': 'Skolor', 'x': 'Kommunala skolor, offentligt finansierade friskolor (concertado) och internationella skolor med brittisk eller annan läroplan. Undervisningen i kommunala skolor sker på spanska och valencianska, med språkstöd för nyanlända. Ansökan sker oftast på våren; internationella skolor har ofta kö. Ditt skolval kan avgöra var du köper.'},
      {'icon': 'laptop', 't': 'Distansarbete', 'x': 'Med fiber i de flesta byar och urbanisationer kan du jobba lika bra här som hemma. För medborgare utanför EU finns ett visum för digitala nomader. Tänk på din skattesituation när du blir bosatt.'},
    ], 1),
  ]]),
  ('cta', LINKS['move'], 'Läs mer om att flytta till Spanien', 'På vår webbplats hittar du stegen före, under och efter köpet, och du kan beställa en personlig steg-för-steg-plan.'),
]},

{'kind': 'page', 'label': 'Del 7 · Husdjur &amp; praktiskt', 'band': 'town-guardamar-del-segura-3.jpg', 'band_h': 72, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('h2', 'Med <em>husdjur</em>'),
    ('img', 'ai-08-dog.jpg', 60),
    ('h3', 'Resa med hund eller katt inom EU'),
    ('check', ['Mikrochip (ISO-standard)', 'Giltig rabiesvaccination, minst 21 dagar före avresa', 'EU-pass för sällskapsdjur',
               'Registrering hos en veterinär i Spanien och i det valencianska djurregistret']),
    ('callout', 'tip', 'Tips från vårt team', 'Se upp för tallprocessionsfjärilens larver i tallskogarna i februari och mars, och för heta klinkers på sommaren. En ansvarsförsäkring för hunden är klokt; det nationella kravet väntar fortfarande på att genomföras.'),
  ], [
    ('h2', 'Praktiska <em>frågor</em>'),
    ('h3', 'Din bil'),
    ('p', 'Flyttar du hit behöver en bil med utländska skyltar så småningom registreras i Spanien. Ditt EU-körkort fortsätter att gälla.'),
    ('h3', 'Säkerhet'),
    ('p', 'Vega Baja är en lugn region. Sunt förnuft hjälper: fönsterluckor, ett bra lås, kanske ett larm och en granne eller förvaltare som håller ett öga på huset när du är borta.'),
    ('h3', 'Språk'),
    ('p', 'I urbanisationerna kommer du långt med engelska. Bor du i en spansk by eller har barn i skolan hjälper spanska mycket. De flesta kommuner erbjuder billiga språkkurser för nyanlända.'),
    ('h3', 'Post och paket'),
    ('p', 'I många urbanisationer delas posten inte ut till dörren. En postbox eller en adress vid ett serviceombud är smidigt.'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 7 · Livet här', 'band': 'ai-06-market.jpg', 'band_h': 46, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'Livet i <em>Vega Baja</em>'),
  ('cols', [[
    ('img', 'ai-07-food.jpg', 52, 'Ris, fisk och grönsaker från huertan: maten här är enkel och färsk.'),
    ('h3', 'Mat och marknader'),
    ('p', 'Huertan ger kronärtskockor, citrusfrukter, tomater och granatäpplen året runt. Varje kommun har en veckomarknad; lördagsmarknaden i Almoradí är en av de största. Prova arroz con costra, caldero och ett glas vin från Vinalopó.'),
    ('h3', 'Natur'),
    ('p', 'De rosa saltsjöarna i Torrevieja och La Mata, naturreservatet El Hondo med sina flamingor, tallskogarna på dynerna vid Guardamar och Sierra Escalona: här kan du vandra och cykla hela året.'),
  ], [
    ('img', 'ai-13-fiesta.jpg', 52, 'Varje kommun firar sina egna fiestor, ofta i flera dagar.'),
    ('h3', 'Fester under året'),
    ('table', ['När', 'Vad'], [
      ['Januari', 'Trettondagen, parader med godis till barnen'], ['Februari', 'Karneval, stort i Torrevieja'],
      ['Mars/april', 'Semana Santa: processioner, imponerande i Orihuela'], ['Juni', 'San Juan: fyrverkerier och brasor på stranden'],
      ['Juli/augusti', 'Fiestor i nästan varje by, Moros y Cristianos'], ['Oktober', 'Fiestor i Rojales och skördefester i många byar'],
      ['December', 'Julmarknader och Nochevieja med tolv vindruvor']], 'compact'),
    ('h3', 'Sport'),
    ('p', 'Golf (La Marquesa, La Finca, Las Colinas, Villamartín med flera), padel, segling, cykling och vandring.'),
  ]]),
]},

{'kind': 'page', 'label': 'Del 7 · Ordlista', 'band': 'town-almoradi-2.jpg', 'band_h': 66, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'Bra <em>spanska</em> ord för köpare'),
  ('cols', [[
    ('table', ['Spanska', 'Betydelse'], [
      ['arras', 'handpenning / köpeavtal med handpenning'], ['catastro', 'fastighetsregister (lantmäteri)'], ['cédula de habitabilidad', 'beboelseintyg'],
      ['comunidad de propietarios', 'ägarförening'], ['escritura', 'notariell köpehandling'], ['gestoría', 'administrativ byrå'],
      ['hipoteca', 'bolån'], ['IBI', 'fastighetsskatt'], ['ITP', 'överlåtelseskatt'], ['IVA', 'moms'],
      ['AJD', 'stämpelskatt'], ['nota simple', 'utdrag ur fastighetsregistret'], ['NIE', 'identifikationsnummer för utlänningar'],
    ], 'compact'),
  ], [
    ('table', ['Spanska', 'Betydelse'], [
      ['notaría', 'notariekontor'], ['padrón', 'folkbokföring i kommunen'], ['plusvalía', 'kommunal värdestegringsskatt'],
      ['poder', 'fullmakt'], ['Registro de la Propiedad', 'fastighetsregistret'], ['residencia', 'registrering som bosatt'], ['solarium', 'takterrass'],
      ['tasación', 'värdering'], ['urbanización', 'bostadsområde / urbanisation'], ['huerta', 'odlingsmark'], ['llave en mano', 'nyckelfärdig'],
      ['obra nueva', 'nyproduktion'], ['segunda mano', 'begagnad bostad'],
    ], 'compact'),
  ]]),
  ('html', '<div class="panel lemon" style="margin-top:3mm"><b>¡Bienvenidos!</b> Några ord spanska öppnar dörrar. <i>Buenos días</i> på bageriet, <i>gracias</i> vid kassan och <i>¿qué tal?</i> till grannarna: du blir en del av byn fortare än du tror.</div>'),
]},

# ================================================================== FINALLY
{'kind': 'page', 'label': 'Våra tjänster', 'band': 'ai-04-keys.jpg', 'band_h': 72, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Vad <em>vi</em> gör för dig'),
  ('lead', 'Ett team från första mötet till månaderna efter att du fått nycklarna. Du väljer själv vad du behöver.'),
  ('cards', [
    {'icon': 'search', 't': 'Skräddarsydd sökning', 'x': 'Vi väljer ut bostäder efter dina önskemål, ofta innan de hamnar på nätet. Online söker du med egna ord i vår AI-sökning.'},
    {'icon': 'shield', 't': 'Stöd vid köpet', 'x': 'Juridisk granskning, avtal, samordning med notarie och bank, och en kollega vid din sida på tillträdesdagen.'},
    {'icon': 'bank', 't': 'Bolån', 'x': 'Kontakt med spanska banker, ansökan, värdering och stöd hela vägen till notarien.'},
    {'icon': 'doc', 't': 'NIE, bank och fullmakt', 'x': 'Blanketter, bokade tider och, om du vill, allt ordnat på distans med fullmakt.'},
    {'icon': 'euro', 't': 'Modelo 210', 'x': 'Din årliga deklaration som ej bosatt, så att du slipper tänka på den.'},
    {'icon': 'key', 't': 'Testamente och efterservice', 'x': 'Ett spanskt testamente, el och vatten i ditt namn och en fast kontaktperson efteråt.'},
    {'icon': 'home', 't': 'Försäljning', 'x': 'Kostnadsfri värdering, proffsiga foton, drönare och 3D, och en veckorapport om din bostad.'},
    {'icon': 'people', 't': 'Nätverk', 'x': 'Pålitliga hantverkare, förvaltare, skatterådgivare och advokater som vi känt i många år.'},
    {'icon': 'chat', 't': 'Flera språk', 'x': 'Nederländska, engelska, tyska och spanska, även efter köpet. Online svarar vår AI-assistent på dina frågor om alla bostäder, dygnet runt.'},
  ], 3),
  ('cta', LINKS['contact'], 'Arvoden och villkor på begäran', 'Varje situation är olika. Berätta vad du behöver så får du ett tydligt förslag utan överraskningar.'),
]},

{'kind': 'page', 'label': 'Vad kunderna säger', 'band': 'town-torrevieja-2.jpg', 'band_h': 40, 'band_pos': 'center 60%', 'blocks': [
  ('html', '<div style="display:flex;align-items:flex-end;gap:6mm;margin-bottom:3mm"><div><div class="kicker">Google-omdömen</div><h2 style="margin:0">Vad kunderna <em>säger</em></h2></div><div style="margin-left:auto;text-align:right"><div style="font-family:Fraunces;font-size:40pt;font-weight:700;line-height:1;color:#C63232">4,7<span style="font-size:20pt;color:#FBCC10"> ★★★★★</span></div><div class="small">snitt på Google, fler än 45 omdömen</div></div></div>'),
  ('cols', [[
    ('quote', 'Tidigare i år köpte vi själva en lägenhet i Spanien. Från första stund fick vi bra vägledning. De lyssnade verkligen på våra önskemål och tänkte med oss. Även ansökan om NIE-nummer, notarien och bankärenden sköts åt dig. Det tar bort enormt mycket stress och oro.', 'Köpare, 2026'),
    ('quote', 'En mycket bra upplevelse. Vi har köpt hus genom dem två gånger. De tar sig tid, är öppna med brister och dolda kostnader och undersöker allt noggrant.', 'Köpare'),
    ('quote', 'Rick och teamet rekommenderades av en släkting. Försäljningen av vår villa sköttes mycket professionellt. En problemfri upplevelse.', 'Säljare'),
  ], [
    ('quote', 'En riktigt trevlig och pålitlig mäklare som flera gånger har hjälpt oss utmärkt med både köp och försäljning.', 'Köpare och säljare'),
    ('quote', 'Underbart och kunnigt hjälpta av Rick och hans team. De ordnar allt! Härliga människor!', 'Köpare, 2026'),
    ('quote', 'Mycket hjälpsamma och kunniga. Varmt rekommenderade. De talar nederländska också.', 'Kund, 2026'),
    ('qr', LINKS['reviews'], 'Läs alla omdömen på Google'),
  ]]),
  ('small', 'Citat från Google-omdömen, förkortade där det anges men med kärnan bevarad; omdömen som ursprungligen var på nederländska har översatts. Namn utelämnade.'),
]},

{'kind': 'page', 'label': 'Checklista', 'band': 'ai-01-cover.jpg', 'band_h': 80, 'band_pos': 'center 75%', 'blocks': [
  ('h2', 'Redo att <em>köpa</em>?'),
  ('lead', 'Bocka av. När allt är avbockat är du redo att slå till när rätt bostad dyker upp.'),
  ('cols', [[
    ('h3', 'Förberedelser'),
    ('check', ['Jag vet varför jag köper (del 1)', 'Mitt arbetsblad med önskemål är ifyllt', 'Jag vet vilka 2–3 orter jag vill söka i',
               'Jag känner till min totala budget, inklusive alla köpkostnader', 'Min finansiering är klar i princip', 'Jag har ansökt om mitt NIE']),
    ('h3', 'Resan'),
    ('check', ['Soltura Real Estate känner till mina resdatum', 'Jag har med pass, bankkort och inkomstintyg', 'Jag har sett mitt första urval av bostäder']),
  ], [
    ('h3', 'Köpet'),
    ('check', ['Jag har ett spanskt bankkonto', 'Den juridiska granskningen är gjord', 'Jag har läst och förstått köpeavtalet',
               'Köpkostnaderna är avsatta', 'Mina uthyrningsplaner är kontrollerade mot reglerna', 'Jag har bokat tid för ett spanskt testamente']),
    ('h3', 'Efteråt'),
    ('check', ['El, vatten, IBI och försäkring står i mitt namn', 'Modelo 210 eller min residencia är ordnad', 'Jag njuter av min första kväll på terrassen']),
  ]]),
  ('cta', LINKS['contact'], 'Inte allt avbockat? Det är därför vi finns.', 'Boka ett förutsättningslöst samtal på kontoret, per telefon eller via videosamtal. Vi går igenom de öppna punkterna tillsammans.'),
]},

{'kind': 'back', 'html': f'''
<div style="position:absolute;inset:0;background:url(assets/img/ai-14-beach.jpg) center top/cover"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,59,66,.15) 0%,rgba(46,59,66,.55) 30%,rgba(46,59,66,.97) 52%)"></div>
<div style="position:absolute;left:16mm;right:16mm;top:20mm">
  <div style="background:#fff;display:inline-block;border-radius:5mm;padding:4mm 5mm"><img src="assets/img/logo-square.png" style="height:30mm;display:block"/></div>
  <h1 style="font-family:Fraunces;font-weight:600;font-size:38pt;line-height:1.05;margin:12mm 0 4mm">Vi ses snart på<br>Costa Blanca</h1>
  <p style="font-size:12pt;max-width:150mm;opacity:.92">Frågor efter läsningen? Ring, skicka ett WhatsApp eller titta in. Vi tänker gärna med dig, helt utan förpliktelser.</p>
</div>
<div style="position:absolute;left:16mm;right:16mm;top:132mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm">
  <div style="font-size:10.5pt;line-height:1.7">
    <div style="color:#FBCC10;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:8pt;margin-bottom:2mm">Soltura Real Estate</div>
    Avda. de la Constitución s/n<br>03179 Formentera del Segura (Alicante)<br><br>
    <b>T</b> +34 966 792 113<br><b>WhatsApp</b> +34 664 414 515<br><b>E</b> info@gruposoltura.com<br><br>
    <b>Kontor</b> mån–fre 10:00–14:00 · lör–sön efter överenskommelse
  </div>
  <div>
    <div class="qrrow" style="grid-template-columns:1fr 1fr;color:#2E3B42">
      <a class="qrbox v" href="{LINKS['home']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['home'])}</div><div class="qrl"><b>Våra bostäder</b></div></a>
      <a class="qrbox v" href="{LINKS['contact']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['contact'])}</div><div class="qrl"><b>Kontakt</b></div></a>
    </div>
  </div>
</div>
<div style="position:absolute;left:16mm;right:16mm;bottom:12mm;font-size:7.4pt;opacity:.75;line-height:1.5">
  Grupo Soltura SL · RAICV 5781 · API 992 Alicante · GIPE 3.473 · AIPP-medlem · gruposoltura.com<br>
  Den här guiden innehåller allmän information (per oktober 2026) och är inte juridisk, skattemässig eller finansiell rådgivning. Inga rättigheter kan härledas ur innehållet.
  Livsstilsbilder: delvis skapade med AI; ortsfoton via Wikimedia Commons under angivna licenser.
</div>'''},
]
