// Grupo Soltura website — inhoud van de vaste pagina's (Kopen, Verkopen, Emigreren, Privacy), NL + EN + SV.
// Gebaseerd op de huidige gruposoltura.com, bijgewerkt: ITP 9%, één all-in tarief, geen losse kostenposten.
window.PAGES = {
  en: {
    buy: {
      h: 'Buying a home with us',
      lead: 'From the first viewing to the notary and the day you get the keys. One team, in your language, since 2002.',
      intro: 'Buying in Spain works differently from most other countries: other procedures, other taxes, other checks. We guide you through all of it, from a search matched to your wishes to the signing at the notary and the months after.',
      steps_h: 'How a purchase works',
      steps: [
        ['Reservation', 'Once we agree a price with the seller, you sign a reservation contract and pay a deposit, usually €3,000 to €5,000. The home comes off the market and the price is fixed.'],
        ['Private purchase contract', 'This contract sets the completion date. If completion is more than four weeks away, you top up the deposit to 10% of the purchase price.'],
        ['Checks and preparation', 'Land registry, debts, licences, community fees: we check it and tell you what we find. We prepare your paperwork and coordinate notary, lawyer and bank.'],
        ['Completion at the notary', 'One of us is with you on the day. You pay the remaining balance when the deed (escritura) is signed.'],
        ['The keys, and after', 'You are the owner. We transfer utilities, IBI and community fees to your name and stay your contact in the months after.'],
      ],
      costs_h: 'What you pay on top of the price',
      costs: ['<b>Resale home:</b> transfer tax (ITP) of 9% of the purchase price, Comunidad Valenciana.', '<b>New build:</b> 10% VAT (IVA) plus 1.5% stamp duty (AJD).', '<b>Our service:</b> one all-in fee, agreed up front. No separate bills for lawyer, notary support, NIE or power of attorney.'],
      costs_note: 'What you pay in total depends on your situation: do you still need an NIE / tax number, will you sign via a power of attorney, are you taking a Spanish mortgage? Ask us for your personal cost overview.',
      fin_h: 'Arrange your finances early',
      fin_p: 'Knowing your budget tells you which homes are within reach, and lets you act quickly when the right one appears. Non-residents can usually borrow 60 to 70% of the value. We arrange your mortgage with a Spanish bank.',
      services_h: 'What we do for you',
      services: ['A search matched to your wishes, often before homes go online', 'Viewings planned in one efficient trip', 'Legal checks and coordination with notary, lawyer and bank', 'A colleague with you on completion day', 'After-sales help in your own language'],
      cta: 'Ask for your personal cost overview',
    },
    sell: {
      h: 'Selling your home', lead: 'Everything your sale needs, under one roof. One team from the first photo to the notary, in your language.',
      feats: [
        ['Since 2002', 'More than 24 years selling homes in Rojales, Formentera del Segura and the Vega Baja.'],
        ['Multilingual team', 'English, Dutch, German, French and Spanish, so we reach buyers in their own language.'],
        ['Professional photos', 'Every home is photographed professionally before it goes online.'],
        ['Drone video & 3D tours', 'Aerial footage of the home and surroundings, and 3D tours buyers can walk through 24/7.'],
        ['Major portals', 'Idealista, Kyero and the leading international portals.'],
        ['Our buyers first', 'Before your home goes on the portals, we send it to buyers already searching for it.'],
        ['Weekly update', 'Every week you hear how many people saw your home, asked about it or came to view.'],
        ['Legal guidance', 'From reservation contract to notary, we guide every step. API, AIPP and GIPE registered.'],
      ],
      steps_h: 'How we sell your home',
      steps: [['Free valuation', 'We visit, look at the market and give you an honest asking price.'], ['Ready within a day', 'Photos, description and online listing, usually within 24 hours.'], ['Marketing and viewings', 'Portals, our own buyers, social media and the weekly update to you.'], ['Offer and reservation', 'We negotiate, check the buyer and arrange the reservation contract.'], ['Notary', 'We prepare the paperwork and are with you at the signing.']],
      form_h: 'Ask for a free valuation', form_p: 'No obligation. Tell us where the home is and what kind of home it is; we contact you within one working day.',
      legal: 'Already sold and need legal help with the transfer? We do that too.',
    },
    move: {
      h: 'Moving to Spain', lead: 'Buying the house is one step. Building a life here is the rest. We have helped families settle in the Vega Baja since 2002.',
      stages: [['Before you buy', 'Paperwork, finances and a realistic budget.'], ['While you buy', 'Reservation, independent legal checks, private contract and notary, all coordinated by us.'], ['After you buy', 'Utilities, town hall registration, residency, healthcare, schools and taxes, with us as your contact.']],
      topics: [
        ['NIE: your foreigner’s identification number', 'You need it for the notary, a Spanish bank account, utilities and property taxes. Apply early: at a police station in Spain, a Spanish consulate abroad, or through a representative with a power of attorney. EU citizens staying longer than three months a year register as residents; non-EU citizens need the right visa or residence permit. We help with the forms and appointments, or arrange it for you under power of attorney.'],
        ['Mortgage and finances', 'Non-residents can often finance 60 to 70% of the price or valuation, residents somewhat more. Open a Spanish bank account and gather proof of income, tax returns and bank statements. The bank values the home (tasación) and you receive the binding offer (FEIN) at least ten days before signing. We introduce you to banks and arrange the mortgage.'],
        ['Schools', 'Spanish state schools, semi-private (concertado) schools and international schools with British and other curricula. Your school choice can decide where you buy, and international schools often have waiting lists. State school enrolment needs town hall registration (padrón); applications usually open in spring. Lessons are in Spanish and Valencian, with language support for newcomers.'],
        ['Healthcare', 'A strong public system, plus private clinics and multilingual doctors. Working residents are covered through social security; EU pensioners can often transfer cover with an S1 form. After moving, register at your health centre (centro de salud) and apply for the SIP card. Emergency number: 112.'],
        ['Legal', 'Before: land registry (nota simple), debts, licences, habitation certificate, outstanding IBI or community fees. During: reservation, private contract, notary deed and registration in your name. After: utilities, IBI and community fees in your name, non-resident tax returns where needed, and a Spanish will.'],
        ['After the keys', 'Utilities, town hall registration, local tradespeople and questions about IBI. Our after-sales team supports you in your own language during the first months.'],
      ],
      disclaimer: 'This is general information, not personal legal, tax or financial advice. Rules and percentages change; we look at your situation individually.',
      form_h: 'Ready to make the move?', form_p: 'Tell us your timing, family situation, budget and the kind of home you are looking for. We send you a personal step-by-step plan.',
    },
    privacy: {
      h: 'Privacy & cookies', updated: 'Last updated: 18 October 2026',
      sections: [
        ['Who we are', 'Grupo Soltura SL (CIF B54286042), Avenida de la Constitución s/n, 03179 Formentera del Segura (Alicante), Spain. Phone +34 966 792 113, email info@gruposoltura.com. Registered in the Valencian register of real estate agents (RAICV 5781) and member no. 992 of the API college of Alicante. This policy covers this website and contact by phone, email, WhatsApp or in person.'],
        ['What we collect', '<b>What you give us:</b> name, email, phone, your message, your search wishes, newsletter choices and, for a purchase, sale or legal service, the documents the law requires (such as passport or NIE). <b>Questions to our online assistant:</b> the text of your question and the home it concerns. <b>On this website:</b> anonymous usage data, such as which pages and homes are viewed and for how long, without your name and without storing anything on your device for it. <b>Only with your consent</b> do we also store a random visitor code in your browser, so we can link visits together. We use Google Analytics (Google Ireland Ltd.) to measure visits. Without your consent it only receives cookieless signals, with no identifier stored on your device; with your consent it may set its statistics cookies (_ga). <b>Only with your consent for marketing</b> do we use the Meta Pixel (Meta Platforms Ireland Ltd.): it tells Meta which pages and homes you viewed and whether you sent an enquiry, so we can measure our ads on Facebook and Instagram and show you relevant homes there. Without that consent no data is sent to Meta.'],
        ['Why we use it', 'To answer your questions and arrange viewings and valuations; to guide a purchase, sale or legal service; to meet legal obligations (anti-money-laundering, tax); to send the newsletters you chose; and, with your consent, to improve the website and to measure and target our advertising on Facebook and Instagram.'],
        ['Legal basis', 'Performance of a contract or steps before one (GDPR art. 6.1.b) for questions, viewings and transactions; legal obligation (art. 6.1.c) for anti-money-laundering (Ley 10/2010) and tax; consent (art. 6.1.a) for newsletters, statistics cookies (visitor code, Google Analytics) and marketing cookies (Meta Pixel); legitimate interest (art. 6.1.f) for anonymous visit counts and the security of the website.'],
        ['Our online assistant (AI)', 'The assistant on this website is powered by Claude, a model from Anthropic. Your question and the details of the home are sent to Anthropic to generate the answer; Anthropic processes this as our service provider and does not use it to train its models. We store your question with a shortened, non-reversible code of your IP address to prevent abuse. Do not share sensitive personal information in the assistant. A colleague always remains responsible; no decisions with legal effect are made automatically.'],
        ['How long we keep it', 'Questions and search wishes without a transaction: up to two years after the last contact. Purchase, sale and legal files: ten years after closing (anti-money-laundering and tax rules). Newsletters: until you unsubscribe. Anonymous website statistics: up to 26 months.'],
        ['Who processes data for us', 'Supabase (database and storage, servers in Frankfurt, EU); Brevo (email, EU); Anthropic (online assistant, USA); GitHub (website hosting, USA); OpenStreetMap (map on the contact page, loaded only on that page, UK/EU); Google Ireland (Google Analytics, statistics); Meta Platforms Ireland (Meta Pixel, only with marketing consent; for this Meta is joint controller with us, art. 26 GDPR). Transfers outside the EEA are covered by the EU-US Data Privacy Framework or the European Commission’s standard contractual clauses. For a transaction we share what is needed with notaries, lawyers, banks and the other party. We never sell your data.'],
        ['Storage on your device', '<b>Necessary (no consent needed):</b> your language choice, your saved homes, homes you viewed (to show them again) and your cookie choice. These stay in your browser. <b>Statistics (only with consent):</b> a random visitor code of our own that links your visits, and the Google Analytics cookies (_ga, _ga_*), kept for up to 14 months. <b>Marketing (only with consent):</b> the Meta Pixel cookies (_fbp, _fbc), kept for up to 3 months. You can change your choice at any time via the link at the bottom of every page.'],
        ['Your rights', 'You can ask to access, correct or delete your data, restrict or object to its use, and receive it in a portable format. You can withdraw consent at any time. Email info@gruposoltura.com; we reply within one month and may ask you to confirm your identity. You can also complain to the Agencia Española de Protección de Datos (www.aepd.es).'],
      ],
      change: 'Change my cookie choice',
    },
  },
  nl: {
    buy: {
      h: 'Een woning kopen met ons',
      lead: 'Van de eerste bezichtiging tot de notaris en de dag dat je de sleutels krijgt. Eén team, in jouw taal, sinds 2002.',
      intro: 'Kopen in Spanje werkt anders dan in de meeste andere landen: andere procedures, andere belastingen, andere controles. Wij begeleiden je door alles heen, van een zoektocht op maat tot de handtekening bij de notaris en de maanden daarna.',
      steps_h: 'Zo verloopt een aankoop',
      steps: [
        ['Reservering', 'Zodra we met de verkoper een prijs hebben afgesproken, teken je een reserveringscontract en betaal je een aanbetaling, meestal € 3.000 tot € 5.000. De woning gaat van de markt en de prijs ligt vast.'],
        ['Koopcontract', 'Dit contract legt de datum van overdracht vast. Ligt die meer dan vier weken verder, dan vul je de aanbetaling aan tot 10% van de koopsom.'],
        ['Controles en voorbereiding', 'Kadaster, schulden, vergunningen, servicekosten: wij controleren het en vertellen je wat we vinden. We bereiden je papieren voor en stemmen notaris, advocaat en bank op elkaar af.'],
        ['Overdracht bij de notaris', 'Eén van ons is die dag bij je. Je betaalt het restant bij het tekenen van de akte (escritura).'],
        ['De sleutels, en daarna', 'Je bent eigenaar. Wij zetten nutsvoorzieningen, IBI en servicekosten op jouw naam en blijven je aanspreekpunt in de maanden erna.'],
      ],
      costs_h: 'Wat je bovenop de prijs betaalt',
      costs: ['<b>Bestaande woning:</b> overdrachtsbelasting (ITP) van 9% van de koopsom, Comunidad Valenciana.', '<b>Nieuwbouw:</b> 10% btw (IVA) plus 1,5% zegelrecht (AJD).', '<b>Onze dienst:</b> één all-in tarief, vooraf afgesproken. Geen losse rekeningen voor advocaat, notarisbegeleiding, NIE of volmacht.'],
      costs_note: 'Wat je in totaal betaalt, hangt af van jouw situatie: heb je nog een NIE / fiscaal nummer nodig, teken je via een volmacht, neem je een Spaanse hypotheek? Vraag ons om jouw persoonlijke kostenoverzicht.',
      fin_h: 'Regel je financiering op tijd',
      fin_p: 'Als je je budget kent, weet je welke woningen binnen bereik liggen en kun je snel handelen als de juiste langskomt. Niet-residenten lenen meestal 60 tot 70% van de waarde. Wij regelen je hypotheek bij een Spaanse bank.',
      services_h: 'Wat wij voor je doen',
      services: ['Een zoektocht op maat, vaak nog voordat woningen online staan', 'Bezichtigingen gebundeld in één efficiënte reis', 'Juridische controles en afstemming met notaris, advocaat en bank', 'Een collega naast je op de dag van overdracht', 'Nazorg in je eigen taal'],
      cta: 'Vraag je persoonlijke kostenoverzicht aan',
    },
    sell: {
      h: 'Je woning verkopen', lead: 'Alles wat je verkoop nodig heeft, onder één dak. Eén team van de eerste foto tot de notaris, in jouw taal.',
      feats: [
        ['Sinds 2002', 'Al meer dan 24 jaar verkopen we woningen in Rojales, Formentera del Segura en de Vega Baja.'],
        ['Meertalig team', 'Engels, Nederlands, Duits, Frans en Spaans, zodat we kopers in hun eigen taal bereiken.'],
        ["Professionele foto's", 'Elke woning wordt professioneel gefotografeerd voordat hij online gaat.'],
        ['Dronevideo & 3D-tours', 'Luchtbeelden van de woning en omgeving, en 3D-tours waar kopers 24/7 doorheen lopen.'],
        ['Grote portalen', 'Idealista, Kyero en de belangrijkste internationale portalen.'],
        ['Eerst onze kopers', 'Voordat je woning op de portalen staat, sturen we hem naar kopers die er al naar zoeken.'],
        ['Wekelijkse update', 'Elke week hoor je hoeveel mensen je woning zagen, ernaar vroegen of kwamen kijken.'],
        ['Juridische begeleiding', 'Van reserveringscontract tot notaris begeleiden we elke stap. Ingeschreven bij API, AIPP en GIPE.'],
      ],
      steps_h: 'Zo verkopen we je woning',
      steps: [['Gratis waardebepaling', 'We komen langs, kijken naar de markt en geven je een eerlijke vraagprijs.'], ['Binnen een dag klaar', "Foto's, omschrijving en online plaatsing, meestal binnen 24 uur."], ['Marketing en bezichtigingen', 'Portalen, onze eigen kopers, social media en de wekelijkse update aan jou.'], ['Bod en reservering', 'Wij onderhandelen, controleren de koper en regelen het reserveringscontract.'], ['Notaris', 'Wij bereiden de papieren voor en zijn bij de ondertekening.']],
      form_h: 'Vraag een gratis waardebepaling aan', form_p: 'Vrijblijvend. Vertel ons waar de woning staat en wat voor woning het is; we nemen binnen één werkdag contact op.',
      legal: 'Al verkocht en hulp nodig bij de overdracht? Dat doen we ook.',
    },
    move: {
      h: 'Emigreren naar Spanje', lead: 'Het huis kopen is één stap. Hier een leven opbouwen is de rest. Sinds 2002 helpen we gezinnen zich te vestigen in de Vega Baja.',
      stages: [['Voor de aankoop', 'Papieren, financiën en een realistisch budget.'], ['Tijdens de aankoop', 'Reservering, onafhankelijke juridische controles, koopcontract en notaris, allemaal door ons gecoördineerd.'], ['Na de aankoop', 'Nutsvoorzieningen, inschrijving bij de gemeente, residentie, zorg, scholen en belastingen, met ons als aanspreekpunt.']],
      topics: [
        ['NIE: je identificatienummer als buitenlander', 'Nodig voor de notaris, een Spaanse bankrekening, nutsvoorzieningen en belastingen. Vraag het op tijd aan: bij een politiebureau in Spanje, een Spaans consulaat in het buitenland, of via een vertegenwoordiger met volmacht. EU-burgers die langer dan drie maanden per jaar blijven, schrijven zich in als resident; niet-EU-burgers hebben het juiste visum of verblijfsrecht nodig. Wij helpen met formulieren en afspraken, of regelen het voor je met een volmacht.'],
        ['Hypotheek en financiën', 'Niet-residenten kunnen vaak 60 tot 70% van de prijs of taxatie financieren, residenten iets meer. Open een Spaanse bankrekening en verzamel inkomensbewijzen, belastingaangiftes en bankafschriften. De bank laat de woning taxeren (tasación) en je krijgt het bindende aanbod (FEIN) minstens tien dagen voor de ondertekening. Wij brengen je in contact met banken en regelen de hypotheek.'],
        ['Scholen', 'Spaanse openbare scholen, semi-particuliere (concertado) scholen en internationale scholen met een Brits of ander curriculum. Je schoolkeuze kan bepalen waar je koopt, en internationale scholen hebben vaak wachtlijsten. Inschrijving op een openbare school vraagt inschrijving bij de gemeente (padrón); aanmelden kan meestal in het voorjaar. Les is in het Spaans en Valenciaans, met taalondersteuning voor nieuwkomers.'],
        ['Zorg', 'Een sterk openbaar stelsel, aangevuld met privéklinieken en meertalige artsen. Werkende residenten zijn verzekerd via de sociale zekerheid; EU-gepensioneerden kunnen hun dekking vaak overzetten met een S1-formulier. Schrijf je na de verhuizing in bij je gezondheidscentrum (centro de salud) en vraag de SIP-kaart aan. Alarmnummer: 112.'],
        ['Juridisch', 'Vooraf: kadaster (nota simple), schulden, vergunningen, bewoonbaarheidsverklaring, openstaande IBI of servicekosten. Tijdens: reservering, koopcontract, notariële akte en inschrijving op jouw naam. Daarna: nutsvoorzieningen, IBI en servicekosten op jouw naam, belastingaangifte als niet-resident waar nodig, en een Spaans testament.'],
        ['Na de sleutels', 'Nutsvoorzieningen, inschrijving bij de gemeente, lokale vakmensen en vragen over IBI. Ons nazorgteam helpt je in de eerste maanden in je eigen taal.'],
      ],
      disclaimer: 'Dit is algemene informatie, geen persoonlijk juridisch, fiscaal of financieel advies. Regels en percentages veranderen; wij kijken naar jouw situatie.',
      form_h: 'Klaar voor de stap?', form_p: 'Vertel ons je planning, gezinssituatie, budget en wat voor woning je zoekt. Je krijgt van ons een persoonlijk stappenplan.',
    },
    privacy: {
      h: 'Privacy & cookies', updated: 'Laatst bijgewerkt: 18 oktober 2026',
      sections: [
        ['Wie we zijn', 'Grupo Soltura SL (CIF B54286042), Avenida de la Constitución s/n, 03179 Formentera del Segura (Alicante), Spanje. Telefoon +34 966 792 113, e-mail info@gruposoltura.com. Ingeschreven in het Valenciaanse register van makelaars (RAICV 5781) en lid nr. 992 van het API-college van Alicante. Dit beleid geldt voor deze website en voor contact per telefoon, e-mail, WhatsApp of persoonlijk.'],
        ['Wat we verzamelen', '<b>Wat je ons geeft:</b> naam, e-mail, telefoon, je bericht, je zoekwensen, je nieuwsbriefkeuzes en, bij een aankoop, verkoop of juridische dienst, de documenten die de wet vraagt (zoals paspoort of NIE). <b>Vragen aan onze online assistent:</b> de tekst van je vraag en de woning waar die over gaat. <b>Op deze website:</b> anonieme gebruiksgegevens, zoals welke pagina’s en woningen bekeken worden en hoe lang, zonder je naam en zonder daarvoor iets op je apparaat op te slaan. <b>Alleen met je toestemming</b> bewaren we ook een willekeurige bezoekerscode in je browser, zodat we bezoeken aan elkaar kunnen koppelen. We gebruiken Google Analytics (Google Ireland Ltd.) om bezoeken te meten. Zonder je toestemming ontvangt het alleen cookieloze signalen, zonder dat er een kenmerk op je apparaat wordt opgeslagen; met je toestemming mag het zijn statistiekcookies (_ga) plaatsen. <b>Alleen met je toestemming voor marketing</b> gebruiken we de Meta Pixel (Meta Platforms Ireland Ltd.): die laat Meta weten welke pagina’s en woningen je bekeek en of je een aanvraag deed, zodat we onze advertenties op Facebook en Instagram kunnen meten en je daar passende woningen kunnen tonen. Zonder die toestemming gaan er geen gegevens naar Meta.'],
        ['Waarvoor we het gebruiken', 'Om je vragen te beantwoorden en bezichtigingen en waardebepalingen te regelen; om een aankoop, verkoop of juridische dienst te begeleiden; om aan wettelijke plichten te voldoen (witwasbestrijding, belastingen); om de nieuwsbrieven te sturen die je koos; en, met je toestemming, om de website te verbeteren en onze advertenties op Facebook en Instagram te meten en gericht te tonen.'],
        ['Rechtsgrond', 'Uitvoering van een overeenkomst of stappen daarvoor (AVG art. 6.1.b) voor vragen, bezichtigingen en transacties; wettelijke plicht (art. 6.1.c) voor witwasbestrijding (Ley 10/2010) en belastingen; toestemming (art. 6.1.a) voor nieuwsbrieven, statistiekcookies (bezoekerscode, Google Analytics) en marketingcookies (Meta Pixel); gerechtvaardigd belang (art. 6.1.f) voor anonieme bezoektellingen en de beveiliging van de website.'],
        ['Onze online assistent (AI)', 'De assistent op deze website werkt met Claude, een model van Anthropic. Je vraag en de gegevens van de woning gaan naar Anthropic om het antwoord te maken; Anthropic verwerkt dit als onze dienstverlener en gebruikt het niet om zijn modellen te trainen. We bewaren je vraag met een verkorte, niet terug te rekenen code van je IP-adres om misbruik te voorkomen. Deel geen gevoelige persoonsgegevens in de assistent. Een collega blijft altijd verantwoordelijk; er worden geen beslissingen met rechtsgevolg automatisch genomen.'],
        ['Hoe lang we het bewaren', 'Vragen en zoekwensen zonder transactie: tot twee jaar na het laatste contact. Dossiers van aankoop, verkoop en juridische diensten: tien jaar na afronding (witwas- en belastingregels). Nieuwsbrieven: tot je je afmeldt. Anonieme websitestatistieken: tot 26 maanden.'],
        ['Wie gegevens voor ons verwerkt', 'Supabase (database en opslag, servers in Frankfurt, EU); Brevo (e-mail, EU); Anthropic (online assistent, VS); GitHub (hosting van de website, VS); OpenStreetMap (kaart op de contactpagina, alleen op die pagina geladen, VK/EU); Google Ireland (Google Analytics, statistiek); Meta Platforms Ireland (Meta Pixel, alleen met toestemming voor marketing; Meta is hiervoor samen met ons verwerkingsverantwoordelijke, art. 26 AVG). Doorgifte buiten de EER valt onder het EU-VS Data Privacy Framework of de standaardcontractbepalingen van de Europese Commissie. Bij een transactie delen we wat nodig is met notarissen, advocaten, banken en de andere partij. We verkopen nooit gegevens.'],
        ['Opslag op je apparaat', '<b>Noodzakelijk (geen toestemming nodig):</b> je taalkeuze, je bewaarde woningen, woningen die je bekeek (om ze terug te tonen) en je cookiekeuze. Dit blijft in je browser. <b>Statistieken (alleen met toestemming):</b> een eigen willekeurige bezoekerscode die je bezoeken aan elkaar koppelt, en de Google Analytics-cookies (_ga, _ga_*), maximaal 14 maanden bewaard. <b>Marketing (alleen met toestemming):</b> de Meta Pixel-cookies (_fbp, _fbc), maximaal 3 maanden bewaard. Je kunt je keuze altijd wijzigen via de link onderaan elke pagina.'],
        ['Je rechten', 'Je kunt vragen om inzage, correctie of verwijdering van je gegevens, om beperking of bezwaar, en om je gegevens in een overdraagbaar formaat. Je kunt toestemming altijd intrekken. Mail naar info@gruposoltura.com; we reageren binnen een maand en kunnen je vragen je identiteit te bevestigen. Je kunt ook een klacht indienen bij de Agencia Española de Protección de Datos (www.aepd.es).'],
      ],
      change: 'Mijn cookiekeuze wijzigen',
    },
  },
  sv: {
    buy: {
      h: 'Köp en bostad med oss',
      lead: 'Från första visningen till notarien och dagen du får nycklarna. Ett team, på ditt språk, sedan 2002.',
      intro: 'Att köpa bostad i Spanien fungerar annorlunda än i de flesta andra länder: andra rutiner, andra skatter, andra kontroller. Vi guidar dig genom allt, från ett sökande anpassat efter dina önskemål till underskriften hos notarien och månaderna efteråt.',
      steps_h: 'Så går ett köp till',
      steps: [
        ['Reservation', 'När vi har kommit överens om ett pris med säljaren skriver du under ett reservationsavtal och betalar en handpenning, oftast 3 000 till 5 000 €. Bostaden tas bort från marknaden och priset är låst.'],
        ['Privat köpekontrakt', 'Kontraktet fastställer datumet för tillträdet. Ligger det mer än fyra veckor fram i tiden fyller du på handpenningen till 10 % av köpesumman.'],
        ['Kontroller och förberedelser', 'Fastighetsregister, skulder, tillstånd, samfällighetsavgifter: vi kontrollerar allt och berättar vad vi hittar. Vi förbereder dina papper och samordnar notarie, advokat och bank.'],
        ['Tillträde hos notarien', 'En av oss är med dig på dagen. Du betalar resterande belopp när köpebrevet (escritura) skrivs under.'],
        ['Nycklarna, och sedan', 'Nu är du ägare. Vi för över el, vatten, IBI och samfällighetsavgifter till ditt namn och är fortsatt din kontakt under månaderna efteråt.'],
      ],
      costs_h: 'Vad du betalar utöver priset',
      costs: ['<b>Andrahandsbostad:</b> överlåtelseskatt (ITP) på 9 % av köpesumman, Comunidad Valenciana.', '<b>Nyproduktion:</b> 10 % moms (IVA) plus 1,5 % stämpelskatt (AJD).', '<b>Vår tjänst:</b> ett enda allt-i-ett-arvode som vi kommer överens om i förväg. Inga separata fakturor för advokat, notariestöd, NIE eller fullmakt.'],
      costs_note: 'Vad du betalar totalt beror på din situation: behöver du fortfarande ett NIE / skattenummer, skriver du under via fullmakt, tar du ett spanskt bolån? Be oss om din personliga kostnadsöversikt.',
      fin_h: 'Ordna finansieringen i god tid',
      fin_p: 'När du känner till din budget vet du vilka bostäder som ligger inom räckhåll, och du kan agera snabbt när rätt bostad dyker upp. Den som inte är bosatt i Spanien kan oftast låna 60 till 70 % av värdet. Vi ordnar ditt bolån hos en spansk bank.',
      services_h: 'Det här gör vi för dig',
      services: ['Ett sökande anpassat efter dina önskemål, ofta innan bostäderna läggs ut online', 'Visningar samlade under en effektiv resa', 'Juridiska kontroller och samordning med notarie, advokat och bank', 'En kollega vid din sida på tillträdesdagen', 'Hjälp efter köpet på ditt eget språk'],
      cta: 'Be om din personliga kostnadsöversikt',
    },
    sell: {
      h: 'Sälj din bostad', lead: 'Allt din försäljning behöver, under ett och samma tak. Ett team från första bilden till notarien, på ditt språk.',
      feats: [
        ['Sedan 2002', 'Mer än 24 år av bostadsförsäljning i Rojales, Formentera del Segura och Vega Baja.'],
        ['Flerspråkigt team', 'Engelska, nederländska, tyska, franska och spanska, så att vi når köpare på deras eget språk.'],
        ['Professionella bilder', 'Varje bostad fotograferas professionellt innan den läggs ut online.'],
        ['Drönarvideo och 3D-visningar', 'Flygbilder av bostaden och omgivningen, och 3D-visningar som köpare kan gå runt i dygnet runt.'],
        ['Stora portaler', 'Idealista, Kyero och de ledande internationella portalerna.'],
        ['Våra köpare först', 'Innan din bostad hamnar på portalerna skickar vi den till köpare som redan letar efter just en sådan.'],
        ['Veckouppdatering', 'Varje vecka får du veta hur många som sett din bostad, frågat om den eller kommit på visning.'],
        ['Juridisk vägledning', 'Från reservationsavtal till notarie guidar vi dig genom varje steg. Registrerade hos API, AIPP och GIPE.'],
      ],
      steps_h: 'Så säljer vi din bostad',
      steps: [['Kostnadsfri värdering', 'Vi kommer på besök, tittar på marknaden och ger dig ett ärligt utgångspris.'], ['Klart inom ett dygn', 'Bilder, beskrivning och annons online, oftast inom 24 timmar.'], ['Marknadsföring och visningar', 'Portaler, våra egna köpare, sociala medier och veckouppdateringen till dig.'], ['Bud och reservation', 'Vi förhandlar, kontrollerar köparen och ordnar reservationsavtalet.'], ['Notarie', 'Vi förbereder pappersarbetet och är med dig vid underskriften.']],
      form_h: 'Be om en kostnadsfri värdering', form_p: 'Helt utan förpliktelser. Berätta var bostaden ligger och vilken typ av bostad det är, så hör vi av oss inom en arbetsdag.',
      legal: 'Redan sålt och behöver juridisk hjälp med överlåtelsen? Det hjälper vi också till med.',
    },
    move: {
      h: 'Flytta till Spanien', lead: 'Att köpa huset är ett steg. Att bygga ett liv här är resten. Vi har hjälpt familjer att rota sig i Vega Baja sedan 2002.',
      stages: [['Innan du köper', 'Papper, ekonomi och en realistisk budget.'], ['Medan du köper', 'Reservation, oberoende juridiska kontroller, privat köpekontrakt och notarie, allt samordnat av oss.'], ['När du har köpt', 'El och vatten, registrering hos kommunen, uppehåll, vård, skolor och skatter, med oss som din kontakt.']],
      topics: [
        ['NIE: ditt identifikationsnummer som utlänning', 'Du behöver det hos notarien, för ett spanskt bankkonto, för el och vatten och för fastighetsskatter. Ansök i god tid: på en polisstation i Spanien, på ett spanskt konsulat utomlands eller genom ett ombud med fullmakt. EU-medborgare som stannar mer än tre månader per år registrerar sig som bosatta; medborgare utanför EU behöver rätt visum eller uppehållstillstånd. Vi hjälper dig med blanketter och tider, eller ordnar det åt dig med fullmakt.'],
        ['Bolån och ekonomi', 'Den som inte är bosatt i Spanien kan ofta finansiera 60 till 70 % av priset eller värderingen, bosatta något mer. Öppna ett spanskt bankkonto och samla ihop inkomstbevis, deklarationer och kontoutdrag. Banken värderar bostaden (tasación) och du får det bindande erbjudandet (FEIN) minst tio dagar före underskriften. Vi presenterar dig för banker och ordnar bolånet.'],
        ['Skolor', 'Spanska kommunala skolor, halvprivata (concertado) skolor och internationella skolor med brittisk eller annan läroplan. Ditt val av skola kan avgöra var du köper, och internationella skolor har ofta kö. För att börja i en kommunal skola krävs registrering hos kommunen (padrón); ansökan öppnar oftast på våren. Undervisningen sker på spanska och valencianska, med språkstöd för nyanlända.'],
        ['Vård', 'Ett starkt offentligt system, kompletterat med privata kliniker och flerspråkiga läkare. Bosatta som arbetar omfattas via socialförsäkringen; pensionärer från EU kan ofta föra över sitt skydd med en S1-blankett. Efter flytten registrerar du dig på din vårdcentral (centro de salud) och ansöker om SIP-kortet. Larmnummer: 112.'],
        ['Juridik', 'Före: fastighetsregister (nota simple), skulder, tillstånd, beboelseintyg, obetald IBI eller samfällighetsavgifter. Under: reservation, privat köpekontrakt, köpebrev hos notarie och inskrivning i ditt namn. Efter: el, vatten, IBI och samfällighetsavgifter i ditt namn, deklaration som icke-bosatt vid behov, och ett spanskt testamente.'],
        ['Efter nycklarna', 'El och vatten, registrering hos kommunen, lokala hantverkare och frågor om IBI. Vårt eftermarknadsteam stöttar dig på ditt eget språk under de första månaderna.'],
      ],
      disclaimer: 'Det här är allmän information, inte personlig juridisk, skattemässig eller ekonomisk rådgivning. Regler och procentsatser ändras; vi tittar på din situation individuellt.',
      form_h: 'Redo att ta steget?', form_p: 'Berätta om din tidsplan, familjesituation, budget och vilken typ av bostad du letar efter. Vi skickar dig en personlig steg-för-steg-plan.',
    },
    privacy: {
      h: 'Integritet och cookies', updated: 'Senast uppdaterad: 18 oktober 2026',
      sections: [
        ['Vilka vi är', 'Grupo Soltura SL (CIF B54286042), Avenida de la Constitución s/n, 03179 Formentera del Segura (Alicante), Spanien. Telefon +34 966 792 113, e-post info@gruposoltura.com. Registrerade i det valencianska registret över fastighetsmäklare (RAICV 5781) och medlem nr 992 i API-kollegiet i Alicante. Den här policyn gäller för den här webbplatsen och för kontakt via telefon, e-post, WhatsApp eller personligen.'],
        ['Vad vi samlar in', '<b>Det du ger oss:</b> namn, e-post, telefon, ditt meddelande, dina önskemål om bostad, dina val för nyhetsbrev och, vid köp, försäljning eller juridisk tjänst, de handlingar som lagen kräver (till exempel pass eller NIE). <b>Frågor till vår onlineassistent:</b> texten i din fråga och den bostad den gäller. <b>På den här webbplatsen:</b> anonyma användningsdata, till exempel vilka sidor och bostäder som visas och hur länge, utan ditt namn och utan att något lagras på din enhet för detta. <b>Endast med ditt samtycke</b> sparar vi också en slumpmässig besökarkod i din webbläsare, så att vi kan koppla ihop besök. Vi använder Google Analytics (Google Ireland Ltd.) för att mäta besök. Utan ditt samtycke tar det bara emot cookiefria signaler, utan att någon identifierare lagras på din enhet; med ditt samtycke får det sätta sina statistikcookies (_ga). <b>Endast med ditt samtycke till marknadsföring</b> använder vi Meta Pixel (Meta Platforms Ireland Ltd.): den talar om för Meta vilka sidor och bostäder du har tittat på och om du har skickat en förfrågan, så att vi kan mäta våra annonser på Facebook och Instagram och visa dig relevanta bostäder där. Utan det samtycket skickas inga uppgifter till Meta.'],
        ['Varför vi använder det', 'För att svara på dina frågor och ordna visningar och värderingar; för att guida ett köp, en försäljning eller en juridisk tjänst; för att uppfylla rättsliga skyldigheter (penningtvätt, skatt); för att skicka de nyhetsbrev du har valt; och, med ditt samtycke, för att förbättra webbplatsen och för att mäta och rikta vår annonsering på Facebook och Instagram.'],
        ['Rättslig grund', 'Fullgörande av avtal eller åtgärder före ett avtal (GDPR art. 6.1.b) för frågor, visningar och transaktioner; rättslig förpliktelse (art. 6.1.c) för åtgärder mot penningtvätt (Ley 10/2010) och skatt; samtycke (art. 6.1.a) för nyhetsbrev, statistikcookies (besökarkod, Google Analytics) och marknadsföringscookies (Meta Pixel); berättigat intresse (art. 6.1.f) för anonym besöksräkning och webbplatsens säkerhet.'],
        ['Vår onlineassistent (AI)', 'Assistenten på den här webbplatsen drivs av Claude, en modell från Anthropic. Din fråga och uppgifterna om bostaden skickas till Anthropic för att ta fram svaret; Anthropic behandlar detta som vår tjänsteleverantör och använder det inte för att träna sina modeller. Vi sparar din fråga tillsammans med en förkortad, icke-reversibel kod av din IP-adress för att förhindra missbruk. Dela inga känsliga personuppgifter i assistenten. En kollega är alltid ansvarig; inga beslut med rättslig verkan fattas automatiskt.'],
        ['Hur länge vi sparar det', 'Frågor och önskemål om bostad utan transaktion: upp till två år efter senaste kontakt. Ärenden om köp, försäljning och juridiska tjänster: tio år efter avslut (regler om penningtvätt och skatt). Nyhetsbrev: tills du avslutar prenumerationen. Anonym webbplatsstatistik: upp till 26 månader.'],
        ['Vem som behandlar uppgifter åt oss', 'Supabase (databas och lagring, servrar i Frankfurt, EU); Brevo (e-post, EU); Anthropic (onlineassistent, USA); GitHub (webbhotell, USA); OpenStreetMap (karta på kontaktsidan, laddas bara på den sidan, Storbritannien/EU); Google Ireland (Google Analytics, statistik); Meta Platforms Ireland (Meta Pixel, endast med samtycke till marknadsföring; för detta är Meta gemensamt personuppgiftsansvarig med oss, art. 26 GDPR). Överföringar utanför EES omfattas av EU–US Data Privacy Framework eller Europeiska kommissionens standardavtalsklausuler. Vid en transaktion delar vi det som behövs med notarier, advokater, banker och motparten. Vi säljer aldrig dina uppgifter.'],
        ['Lagring på din enhet', '<b>Nödvändigt (inget samtycke krävs):</b> ditt språkval, dina sparade bostäder, bostäder du har tittat på (för att visa dem igen) och ditt cookieval. Detta stannar i din webbläsare. <b>Statistik (endast med samtycke):</b> en egen slumpmässig besökarkod som kopplar ihop dina besök, och Google Analytics-cookies (_ga, _ga_*), som sparas i upp till 14 månader. <b>Marknadsföring (endast med samtycke):</b> Meta Pixel-cookies (_fbp, _fbc), som sparas i upp till 3 månader. Du kan när som helst ändra ditt val via länken längst ned på varje sida.'],
        ['Dina rättigheter', 'Du kan begära tillgång till, rättelse eller radering av dina uppgifter, begära begränsning av eller invända mot användningen, och få ut dem i ett portabelt format. Du kan när som helst återkalla ditt samtycke. Mejla info@gruposoltura.com; vi svarar inom en månad och kan be dig bekräfta din identitet. Du kan också lämna klagomål till Agencia Española de Protección de Datos (www.aepd.es).'],
      ],
      change: 'Ändra mitt cookieval',
    },
  },
};

// extra UI-teksten voor reviews, formulieren, contact, nieuws en cookiekeuze
Object.assign(I18N.en, {
  rv_h: 'What our clients say', rv_p: 'Real reviews from buyers and sellers, straight from Google.',
  rv_count: n => `${n} reviews`, rv_all: n => `Read all ${n} reviews`, rv_write: 'Write a review', rv_on_google: 'Google review', rv_answered: 'answered by us',
  cc_short: 'We measure visits and ads with cookies.', cc_info: 'Info', cc_ok: 'OK', cc_refuse: 'Decline', cc_h: 'Welcome to Grupo Soltura', cc_p: 'May we use cookies? They show us which homes interest you, remember them on your next visit, and let us show you relevant homes on Facebook and Instagram. You can always say no: the site works just the same.', cc_set: 'Choose per category', cc_yes: 'Yes, that’s fine', cc_no: 'Only necessary', cc_save: 'Save my choice', cc_all: 'Accept all', cc_nec: 'Necessary', cc_nec_d: 'language, saved homes and your cookie choice. Always on.', cc_stat: 'Statistics', cc_stat_d: 'our own visitor code and Google Analytics: which homes interest people over several visits.', cc_ads: 'Marketing', cc_ads_d: 'Meta Pixel (Facebook/Instagram): measures which ads lead to a visit or enquiry, and shows homes you viewed in our ads.', cookie_settings: 'Cookie settings',
  form_privacy: 'We only use your details to answer you.',
  f_budget: 'Budget', f_when: 'When', f_when_opts: ['Within 3 months', '3 to 6 months', '6 to 12 months', 'Later / just orienting'],
  f_buy_msg: 'I would like a personal cost overview. Do I still need an NIE, will I sign via a power of attorney, do I need a mortgage? Please contact me.',
  f_town: 'Town or area', f_type: 'Type of home', f_type_opts: ['Villa', 'Detached house', 'Quad house', 'Bungalow', 'Townhouse', 'Apartment', 'Penthouse', 'Plot / other'],
  f_household: 'Who is moving', f_household_ph: 'e.g. couple, family with 2 children', f_area: 'Preferred area', f_area_ph: 'e.g. near the coast, a village',
  f_topic: 'Subject', f_topic_opts: ['Buying a home', 'Selling my home', 'Moving to Spain', 'Legal services', 'Something else'], f_lang: 'Preferred language',
  news_all: 'All', news_market: 'Property market', news_region: 'Vega Baja', news_spain: 'Spain', news_none: 'No news in this category yet.', news_more: 'More news', c_find: 'Find our office', c_map: 'Map of our office in Formentera del Segura', c_office_alt: 'Our meeting room in Formentera del Segura', news_in: l => `article in ${l}`, move_plan_btn: 'Get my step-by-step plan',
  c_wa: 'Fastest: usually an answer within the hour', c_call: 'Monday to Friday, during office hours', c_mail: 'We reply within one working day', c_route: 'Plan your route', c_team: 'Talk to one of us directly', c_form_h: 'Send us a message',
});
Object.assign(I18N.nl, {
  rv_h: 'Wat onze klanten zeggen', rv_p: 'Echte reviews van kopers en verkopers, rechtstreeks van Google.',
  rv_count: n => `${n} reviews`, rv_all: n => `Lees alle ${n} reviews`, rv_write: 'Schrijf een review', rv_on_google: 'Google-review', rv_answered: 'door ons beantwoord',
  cc_short: 'We meten bezoek en advertenties met cookies.', cc_info: 'Info', cc_ok: 'Oké', cc_refuse: 'Weigeren', cc_h: 'Welkom bij Grupo Soltura', cc_p: 'Mogen we cookies gebruiken? Dan zien we welke woningen je interesseren, onthouden we die bij je volgende bezoek en kunnen we je passende woningen tonen op Facebook en Instagram. Weigeren mag altijd: de site werkt dan gewoon.', cc_set: 'Per categorie kiezen', cc_yes: 'Ja, prima', cc_no: 'Alleen noodzakelijk', cc_save: 'Keuze opslaan', cc_all: 'Alles accepteren', cc_nec: 'Noodzakelijk', cc_nec_d: 'taal, bewaarde woningen en je cookiekeuze. Altijd aan.', cc_stat: 'Statistiek', cc_stat_d: 'eigen bezoekerscode en Google Analytics: welke woningen mensen over meerdere bezoeken interesseren.', cc_ads: 'Marketing', cc_ads_d: 'Meta Pixel (Facebook/Instagram): meet welke advertenties tot een bezoek of aanvraag leiden en toont woningen die je bekeek in onze advertenties.', cookie_settings: 'Cookie-instellingen',
  form_privacy: 'We gebruiken je gegevens alleen om je te antwoorden.',
  f_budget: 'Budget', f_when: 'Wanneer', f_when_opts: ['Binnen 3 maanden', '3 tot 6 maanden', '6 tot 12 maanden', 'Later / nog oriënterend'],
  f_buy_msg: 'Ik wil graag een persoonlijk kostenoverzicht. Heb ik nog een NIE nodig, teken ik via een volmacht, heb ik een hypotheek nodig? Neem contact met me op.',
  f_town: 'Plaats of gebied', f_type: 'Soort woning', f_type_opts: ['Villa', 'Vrijstaand huis', 'Hoekwoning (quad)', 'Bungalow', 'Rijtjeshuis', 'Appartement', 'Penthouse', 'Bouwgrond / anders'],
  f_household: 'Wie verhuist er', f_household_ph: 'bijv. stel, gezin met 2 kinderen', f_area: 'Voorkeursgebied', f_area_ph: 'bijv. dicht bij de kust, een dorp',
  f_topic: 'Onderwerp', f_topic_opts: ['Een woning kopen', 'Mijn woning verkopen', 'Emigreren naar Spanje', 'Juridische diensten', 'Iets anders'], f_lang: 'Voorkeurstaal',
  news_all: 'Alles', news_market: 'Woningmarkt', news_region: 'Vega Baja', news_spain: 'Spanje', news_none: 'Nog geen nieuws in deze categorie.', news_more: 'Meer nieuws', c_find: 'Vind ons kantoor', c_map: 'Kaart van ons kantoor in Formentera del Segura', c_office_alt: 'Onze vergaderzaal in Formentera del Segura', news_in: l => `artikel in het ${l}`, move_plan_btn: 'Vraag mijn stappenplan aan',
  c_wa: 'Het snelst: meestal binnen het uur antwoord', c_call: 'Maandag t/m vrijdag, tijdens kantooruren', c_mail: 'We antwoorden binnen één werkdag', c_route: 'Plan je route', c_team: 'Spreek direct een van ons', c_form_h: 'Stuur ons een bericht',
});
Object.assign(I18N.en, {
  none_h: 'Nothing matches exactly.', none_applied: (l, n) => `So we widened one wish for you: <b>${l}</b> gives ${n} homes, shown below.`,
  none_try: 'Or adjust your question in another way:', none_bar: 'Change one wish and you will see homes again:',
  none_tip: 'Tip: give a price range, a town or area, and the type of home. For example “villa with pool near Rojales up to €400,000”.',
  none_contact: 'Prefer us to look for you? Many homes reach our own searchers first.',
  ai_fail_h: 'We could not read that question properly.', ai_fail_p: 'Try it again in a few words, or pick one of the examples above.',
  rx_budget: v => `Budget up to ${v}`, rx_pmin: 'Without minimum price', rx_towns: x => `Also outside ${x}`, rx_cat: x => `Other types than ${x.toLowerCase()}`,
  rx_beds: n => `${n}+ bedrooms`, rx_baths: 'Fewer bathrooms', rx_pool_any: 'Communal pool is fine too', rx_pool: 'Without pool', rx_newbuild: 'Resale and new build', rx_sea: km => `Up to ${km} km from the sea`, rx_reduced: 'Not only reduced',
});
Object.assign(I18N.nl, {
  none_h: 'Precies dit hebben we nu niet.', none_applied: (l, n) => `Daarom hebben we één wens verruimd: <b>${l}</b> geeft ${n} woningen, hieronder.`,
  none_try: 'Of pas je vraag op een andere manier aan:', none_bar: 'Pas één wens aan en je ziet weer woningen:',
  none_tip: 'Tip: noem een prijsrange, een plaats of gebied en het soort woning. Bijvoorbeeld “villa met zwembad bij Rojales tot € 400.000”.',
  none_contact: 'Liever dat wij voor je zoeken? Veel woningen komen eerst bij onze eigen zoekers.',
  ai_fail_h: 'We konden je vraag niet goed lezen.', ai_fail_p: 'Probeer het nog eens in een paar woorden, of kies een van de voorbeelden hierboven.',
  rx_budget: v => `Budget tot ${v}`, rx_pmin: 'Zonder minimumprijs', rx_towns: x => `Ook buiten ${x}`, rx_cat: x => `Ook andere types dan ${x.toLowerCase()}`,
  rx_beds: n => `${n}+ slaapkamers`, rx_baths: 'Minder badkamers', rx_pool_any: 'Gemeenschappelijk zwembad mag ook', rx_pool: 'Zonder zwembad', rx_newbuild: 'Bestaand én nieuwbouw', rx_sea: km => `Tot ${km} km van zee`, rx_reduced: 'Niet alleen afgeprijsd',
});

// koopgids op de woningpagina
Object.assign(I18N.en, {
  qa_guide: 'Buying guide', guide_h: 'Free buying guide', guide_p: 'Everything about buying a home in Spain, in plain language. We email it to you.',
  guide_items: ['Every step from reservation to the keys', 'Taxes and our one all-in fee', 'NIE, power of attorney and mortgage', 'Checks we do before you sign'],
  guide_btn: 'Send me the buying guide', guide_send: 'Request the guide',
  guide_err: 'Please fill in your first name, last name and a valid email address.', guide_ok: n => `Thank you, ${n}. The buying guide is on its way to your inbox.`,
  guide_msg: 'Buying guide requested from the property page.',
});
Object.assign(I18N.nl, {
  qa_guide: 'Koopgids', guide_h: 'Gratis koopgids', guide_p: 'Alles over een woning kopen in Spanje, in gewone taal. We mailen hem je toe.',
  guide_items: ['Elke stap van reservering tot sleutels', 'Belastingen en ons ene all-in tarief', 'NIE, volmacht en hypotheek', 'De controles die we doen voordat je tekent'],
  guide_btn: 'Stuur mij de koopgids', guide_send: 'Vraag de koopgids aan',
  guide_err: 'Vul je voornaam, achternaam en een geldig e-mailadres in.', guide_ok: n => `Dank je, ${n}. De koopgids komt naar je inbox.`,
  guide_msg: 'Koopgids aangevraagd via de woningpagina.',
});

// status van de woning
Object.assign(I18N.en, {
  st_available: 'Available', st_under_offer: 'Under offer', st_reserved: 'Reserved', st_sold: 'Sold',
  st_note_under_offer: 'This home is under offer. We have stopped viewings and expect the sale to complete. If it does not go through, the home will come back on the market.',
  st_note_reserved: 'This home is reserved. We have stopped viewings and expect the sale to complete. If it does not go through, the home will come back on the market.',
  st_note_sold: 'This home has been sold. We often have something similar, sometimes before it goes online.',
  st_similar: 'See similar homes',
});
Object.assign(I18N.nl, {
  st_available: 'Beschikbaar', st_under_offer: 'Onder bod', st_reserved: 'Gereserveerd', st_sold: 'Verkocht',
  st_note_under_offer: 'Op deze woning ligt een bod. We plannen geen bezichtigingen meer en verwachten dat de verkoop wordt afgerond. Gaat de verkoop niet door, dan komt de woning terug op de markt.',
  st_note_reserved: 'Deze woning is gereserveerd. We plannen geen bezichtigingen meer en verwachten dat de verkoop wordt afgerond. Gaat de verkoop niet door, dan komt de woning terug op de markt.',
  st_note_sold: 'Deze woning is verkocht. We hebben vaak iets vergelijkbaars, soms nog voordat het online staat.',
  st_similar: 'Bekijk vergelijkbare woningen',
});

// zoeken op referentienummer
Object.assign(I18N.en, {
  ref_open: r => `Opening ${r} for you.`, ref_many: 'Several homes have that number. Which one do you mean?',
  ref_missing_h: r => `${r} is not online at the moment.`, ref_missing_p: 'It may have been sold or reserved, or the number is slightly different. Send it to us and we will tell you straight away.',
});
Object.assign(I18N.nl, {
  ref_open: r => `We openen ${r} voor je.`, ref_many: 'Meerdere woningen hebben dat nummer. Welke bedoel je?',
  ref_missing_h: r => `${r} staat op dit moment niet online.`, ref_missing_p: 'Hij is misschien verkocht of gereserveerd, of het nummer wijkt iets af. Stuur het ons, dan laten we het je meteen weten.',
});

// zoeken op begin van een referentienummer
Object.assign(I18N.en, {
  ref_short: 'Ref.', ref_prefix_ok: (n, p) => `We found ${n} homes whose reference starts with ${p}. They are below.`,
  ref_prefix_none: p => `No home online has a reference starting with ${p}.`, ref_prefix_tip: 'Check the letters, or type the full reference number, for example RH500.',
});
Object.assign(I18N.nl, {
  ref_short: 'Ref.', ref_prefix_ok: (n, p) => `We vonden ${n} woningen waarvan de referentie begint met ${p}. Ze staan hieronder.`,
  ref_prefix_none: p => `Er staat geen woning online met een referentie die begint met ${p}.`, ref_prefix_tip: 'Controleer de letters, of typ het volledige referentienummer, bijvoorbeeld RH500.',
});

// svenska: extra UI-teksten (reviews, formulieren, cookiekeuze, zoeken, koopgids, status, referentie)
Object.assign(I18N.sv, {
  rv_h: 'Vad våra kunder säger', rv_p: 'Riktiga omdömen från köpare och säljare, direkt från Google.',
  rv_count: n => `${n} omdömen`, rv_all: n => `Läs alla ${n} omdömen`, rv_write: 'Skriv ett omdöme', rv_on_google: 'Google-omdöme', rv_answered: 'besvarat av oss',
  cc_short: 'Vi mäter besök och annonser med cookies.', cc_info: 'Info', cc_ok: 'Okej', cc_refuse: 'Neka', cc_h: 'Välkommen till Grupo Soltura', cc_p: 'Får vi använda cookies? Då ser vi vilka bostäder som intresserar dig, kommer ihåg dem till nästa besök och kan visa dig relevanta bostäder på Facebook och Instagram. Du kan alltid säga nej: sajten fungerar precis likadant ändå.', cc_set: 'Välj per kategori', cc_yes: 'Ja, det går bra', cc_no: 'Bara nödvändiga', cc_save: 'Spara mitt val', cc_all: 'Godkänn alla', cc_nec: 'Nödvändiga', cc_nec_d: 'språk, sparade bostäder och ditt cookieval. Alltid på.', cc_stat: 'Statistik', cc_stat_d: 'vår egen besökarkod och Google Analytics: vilka bostäder som intresserar besökare över flera besök.', cc_ads: 'Marknadsföring', cc_ads_d: 'Meta Pixel (Facebook/Instagram): mäter vilka annonser som leder till ett besök eller en förfrågan, och visar bostäder du har tittat på i våra annonser.', cookie_settings: 'Cookieinställningar',
  form_privacy: 'Vi använder bara dina uppgifter för att svara dig.',
  f_budget: 'Budget', f_when: 'När', f_when_opts: ['Inom 3 månader', '3 till 6 månader', '6 till 12 månader', 'Senare / orienterar mig bara'],
  f_buy_msg: 'I would like a personal cost overview. Do I still need an NIE, will I sign via a power of attorney, do I need a mortgage? Please contact me.',
  f_town: 'Ort eller område', f_type: 'Typ av bostad', f_type_opts: ['Villa', 'Fristående hus', 'Quad-hus', 'Bungalow', 'Radhus', 'Lägenhet', 'Takvåning', 'Tomt / annat'],
  f_household: 'Vem flyttar', f_household_ph: 't.ex. par, familj med 2 barn', f_area: 'Önskat område', f_area_ph: 't.ex. nära kusten, en by',
  f_topic: 'Ämne', f_topic_opts: ['Köpa en bostad', 'Sälja min bostad', 'Flytta till Spanien', 'Juridiska tjänster', 'Något annat'], f_lang: 'Önskat språk',
  news_all: 'Alla', news_market: 'Bostadsmarknaden', news_region: 'Vega Baja', news_spain: 'Spanien', news_none: 'Inga nyheter i den här kategorin än.', news_more: 'Fler nyheter', c_find: 'Hitta till vårt kontor', c_map: 'Karta över vårt kontor i Formentera del Segura', c_office_alt: 'Vårt mötesrum i Formentera del Segura', news_in: l => l ? `artikel på ${l}` : 'artikel på ett annat språk', move_plan_btn: 'Få min steg-för-steg-plan',
  c_wa: 'Snabbast: oftast svar inom en timme', c_call: 'Måndag till fredag, under kontorstid', c_mail: 'Vi svarar inom en arbetsdag', c_route: 'Planera din väg hit', c_team: 'Prata direkt med någon av oss', c_form_h: 'Skicka ett meddelande till oss',
  none_h: 'Inget matchar exakt.', none_applied: (l, n) => `Därför har vi vidgat en av dina önskningar: <b>${l}</b> ger ${n} bostäder, som du ser nedan.`,
  none_try: 'Eller ändra din fråga på ett annat sätt:', none_bar: 'Ändra en önskning så ser du bostäder igen:',
  none_tip: 'Tips: ange ett prisintervall, en ort eller ett område och typ av bostad. Till exempel ”villa med pool nära Rojales upp till 400 000 €”.',
  none_contact: 'Vill du hellre att vi letar åt dig? Många bostäder når våra egna sökande först.',
  ai_fail_h: 'Vi kunde inte riktigt tolka den frågan.', ai_fail_p: 'Försök igen med några få ord, eller välj ett av exemplen ovan.',
  rx_budget: v => `Budget upp till ${v}`, rx_pmin: 'Utan lägsta pris', rx_towns: x => `Även utanför ${x}`, rx_cat: x => `Även andra typer än ${x.toLowerCase()}`,
  rx_beds: n => `${n}+ sovrum`, rx_baths: 'Färre badrum', rx_pool_any: 'Gemensam pool går också bra', rx_pool: 'Utan pool', rx_newbuild: 'Andrahand och nyproduktion', rx_sea: km => `Upp till ${km} km från havet`, rx_reduced: 'Inte bara prissänkta',
  qa_guide: 'Köpguide', guide_h: 'Kostnadsfri köpguide', guide_p: 'Allt om att köpa bostad i Spanien, på klarspråk. Vi mejlar den till dig.',
  guide_items: ['Varje steg från reservation till nycklar', 'Skatter och vårt enda allt-i-ett-arvode', 'NIE, fullmakt och bolån', 'Kontrollerna vi gör innan du skriver under'],
  guide_btn: 'Skicka köpguiden till mig', guide_send: 'Beställ guiden',
  guide_err: 'Fyll i förnamn, efternamn och en giltig e-postadress.', guide_ok: n => `Tack, ${n}! Köpguiden är på väg till din inkorg.`,
  guide_msg: 'Buying guide requested from the property page.',
  st_available: 'Tillgänglig', st_under_offer: 'Bud lagt', st_reserved: 'Reserverad', st_sold: 'Såld',
  st_note_under_offer: 'Det finns ett bud på den här bostaden. Vi har slutat med visningar och räknar med att försäljningen slutförs. Om den inte går igenom kommer bostaden tillbaka ut på marknaden.',
  st_note_reserved: 'Den här bostaden är reserverad. Vi har slutat med visningar och räknar med att försäljningen slutförs. Om den inte går igenom kommer bostaden tillbaka ut på marknaden.',
  st_note_sold: 'Den här bostaden är såld. Vi har ofta något liknande, ibland innan det läggs ut online.',
  st_similar: 'Se liknande bostäder',
  ref_open: r => `Vi öppnar ${r} åt dig.`, ref_many: 'Flera bostäder har det numret. Vilken menar du?',
  ref_missing_h: r => `${r} ligger inte ute just nu.`, ref_missing_p: 'Den kan vara såld eller reserverad, eller så skiljer sig numret lite. Skicka det till oss så återkommer vi direkt.',
  ref_short: 'Ref.', ref_prefix_ok: (n, p) => `Vi hittade ${n} bostäder vars referens börjar med ${p}. De visas nedan.`,
  ref_prefix_none: p => `Det finns ingen bostad online med en referens som börjar med ${p}.`, ref_prefix_tip: 'Kontrollera bokstäverna, eller skriv hela referensnumret, till exempel RH500.',
});
