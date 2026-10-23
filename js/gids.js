/* Grupo Soltura website — Woon/koopgids met live assistent Ava (23-10-2026).
   23-10-2026: na de gidstaalkeuze (NL/EN/ES/SV) loopt het hele gesprek in die taal verder; SV krijgt sinds 23-10-2026 de Zweedse PDF (mail Engels).
   /nl/woongids/ · /en/buying-guide/ · /sv/kopguide/
   Geen formulier maar een gesprek: Ava vraagt naam, e-mail, mobiel (en plannen + gidstaal), meldt enthousiast dat de gids
   onderweg is en praat daarna door over kopen, verkopen, kosten, gebieden en onze woningen (edge function web-assistant, mode=guide).
   Elke aanvraag is een lead zoals de andere formulieren: web-contact kind 'guide' -> WebFormIntake-v2 -> LeadProcessor-v2 -> PurchaseInfoV2.
   Gedeeld door de app (GIDS.html + GIDS.bind + GIDS.promo) en de statische build (GIDS.html + GIDS.promo). */
(function (root) {
  'use strict';
  var NAME = 'Ava'; // naam van de live assistent (vrouwelijk, sinds 23-10-2026; eerst 'Sol'): alleen hier, in i18n.js en in de edge function aanpassen
  // gezicht van Ava (icons/ava-*.webp|png); avatar(size) geeft een <img> voor ronde avatars en illustraties
  function avatar(size, cls) { var s = size > 96 ? 256 : size > 48 ? 128 : 64; return '<img class="ava-img' + (cls ? ' ' + cls : '') + '" src="/icons/ava-' + s + '.webp" width="' + size + '" height="' + size + '" alt="' + NAME + '" loading="lazy" decoding="async">'; }

  var TX = {
    nl: {
      after2: 'Ik ben er weer voor al je vragen. Over het koopproces, de kosten, de dorpen of onze woningen: vraag maar raak.', read: 'Lees verder:', cta_chat: 'Begin het gesprek met ' + NAME, kicker: 'Gratis woon- en koopgids', crumb: 'Woongids', title: 'Gratis woon- en koopgids Costa Blanca',
      desc: 'Thuis aan de Costa Blanca: onze gratis woon- en koopgids voor de Vega Baja. Vraag hem aan bij Ava, onze live assistent, en stel daarna al je vragen over kopen, kosten en wonen.',
      hi: 'Hoi, ik ben ' + NAME + ', jouw live assistent',
      lead: 'Ik stuur je onze exclusieve gids "Thuis aan de Costa Blanca" en daarna beantwoord ik al je vragen: over het koopproces, de kosten, de dorpen en onze woningen.',
      guideTitle: 'Thuis aan de Costa Blanca', guideSub: 'Woon- en koopgids Vega Baja',
      coverTag: 'Gratis · PDF · NL / EN / ES / SV',
      inside_h: 'Wat staat erin', inside_p: 'Zeven delen en een checklist, van de eerste vraag aan jezelf tot het leven na de sleutel. Met checklists, tijdlijnen en rekenvoorbeelden in plaats van lappen tekst.',
      parts: [
        ['Eerst nadenken, dan kijken', 'De 10 vragen vóór je koopt, vakantiehuis of emigratie, je moet-hebben-lijst'],
        ['Waar wil je wonen?', 'De Vega Baja plaats voor plaats, kust of binnenland, klimaat en vliegvelden'],
        ['Wat kost het echt?', 'De drie kostenlagen, belastingen in de Comunitat Valenciana, hypotheek als niet-resident'],
        ['Welk type woning?', 'Appartement, bungalow, quad of villa, nieuwbouw versus bestaand, verhuren: wat mag waar'],
        ['Het aankoopproces', 'NIE, volmacht, reservering, arras, notaris, de juridische controles en de 12 duurste fouten'],
        ['Je bezichtigingsreis', 'Wat wij vooraf nodig hebben, een bezichtigingsdag, paklijst en ons kantoor'],
        ['Na de sleutel', 'Nutsvoorzieningen, belastingen als eigenaar, Spaans testament, emigreren met je gezin, huisdieren'],
        ['Klaar om te kopen?', 'De checklist om af te vinken, onze diensten en hoe je ons bereikt'],
      ],
      why_h: 'Waarom deze gids anders is',
      why: [
        ['Lokaal, niet heel Spanje', 'Geschreven voor de Vega Baja en de Costa Blanca Zuid, waar wij sinds 2002 wonen en werken.'],
        ['Kopen én leven daarna', 'Niet alleen tot de notaris: ook belastingen als eigenaar, je testament, scholen en zorg.'],
        ['Actueel gecontroleerd', 'De regels van de Comunitat Valenciana van nu, zoals de overdrachtsbelasting van 9%.'],
      ],
      sol_h: 'En daarna? Praat verder met ' + NAME,
      sol_p: NAME + ' kent de hele gids, al onze woningen en de dorpen waar we verkopen. Vraag wat je wilt: hoe de arras werkt, wat een villa tot €400.000 je oplevert in Benijófar, of op welke dag de markt in Rojales is. Voor iets belangrijks neemt een collega het persoonlijk over.',
      more_h: 'Lees ook',
      links: [['buy', 'Kopen in Spanje'], ['move', 'Emigreren'], ['costs', 'Maandlastencalculator'], ['area', 'Woonplaatsen'], ['sell', 'Verkopen']],
      online: 'online', panelSub: 'Live assistent van Soltura Real Estate',
      privacy: 'Je gegevens gebruiken we om je de gids te sturen en je persoonlijk te helpen. Lees ons <a href="{p}">privacybeleid</a>.',
      noscript: 'Zet JavaScript aan om met ' + NAME + ' te praten, of app ons op +34 664 414 515.',
      // gesprek
      g1: 'Hoi! Ik ben ' + NAME + ', jouw live assistent bij Soltura Real Estate. Ik stuur je graag onze gratis woon- en koopgids.',
      g2: 'Hoe heet je? Je voor- en achternaam is genoeg.',
      ph_name: 'Voor- en achternaam', ph_last: 'Achternaam', ph_email: 'jouw@email.nl', ph_phone: '+31 6 12345678', ph_chat: 'Stel ' + NAME + ' een vraag…',
      ask_last: function (f) { return 'Leuk je te ontmoeten, ' + f + '. En je achternaam?'; },
      ask_email: function (f) { return 'Fijn je te ontmoeten, ' + f + '. Naar welk e-mailadres mag ik de gids sturen?'; },
      bad_email: 'Dat e-mailadres lijkt niet helemaal te kloppen. Kijk je het even na?',
      typo: function (e) { return 'Bedoel je ' + e + '?'; }, yes: 'Ja, klopt', no: 'Nee, aanpassen',
      ask_phone: 'Top. En je mobiele nummer? Dan kan een collega je ook even appen als je vragen hebt. Graag met landcode.',
      bad_phone: 'Dat nummer lijkt te kort. Wil je het met landcode invullen, bijvoorbeeld +31 6 12345678?',
      ask_plan: 'Laatste vraag: wat past het best bij je plannen?',
      plans: ['Vakantiewoning', 'Emigreren', 'Verhuren of beleggen', 'Ik oriënteer me nog'],
      ask_lang: 'In welke taal wil je de gids ontvangen?',
      sending: 'Even je gids klaarzetten…',
      done_h: 'Je gids is onderweg', done: function (f, e) { return 'Gelukt, ' + f + '! Je exclusieve gids "Thuis aan de Costa Blanca" is onderweg naar ' + e + '. Kijk over een paar minuten in je inbox, en voor de zekerheid ook even in je spam.'; },
      after: 'Ondertussen ben ik er voor al je vragen. Over het koopproces, de kosten, de dorpen of onze woningen: vraag maar raak.',
      fail: 'Hmm, dat lukte net niet. Probeer het nog eens, of app ons gerust op +34 664 414 515.', retry: 'Opnieuw versturen',
      welcome: function (f, e) { return 'Welkom terug, ' + f + '. Je gids is eerder naar ' + e + ' gestuurd.'; },
      resend: 'Stuur hem nog een keer', other: 'Andere gegevens gebruiken',
      starters: ['Hoe werkt het koopproces?', 'Wat kost kopen bovenop de prijs?', 'Laat villa\'s zien tot €400.000', 'Welke plaats past bij mij?'],
      edit: 'Wijzig', homes_n: function (n) { return n === 1 ? '1 woning past' : n + ' woningen passen'; }, homes_all: 'Bekijk ze allemaal',
      handoff_q: 'Zal ik een collega vragen om persoonlijk contact met je op te nemen?', handoff_yes: 'Ja, graag', handoff_ok: 'Geregeld. Een collega neemt zo snel mogelijk contact met je op, meestal binnen een werkdag.',
      sorry: 'Dat weet ik niet zeker. App ons gerust, dan helpen we je persoonlijk.',
      page: { buy: 'Kopen', sell: 'Verkopen', move: 'Emigreren', costs: 'Maandlastencalculator', area: 'Woonplaatsen', contact: 'Contact' },
      promo_h: 'Gratis woon- en koopgids', promo_p: 'Alles over kopen en wonen aan de Costa Blanca, in gewone taal. Ava stuurt hem je toe en beantwoordt daarna je vragen.',
      promo_items: ['Elke stap van reservering tot sleutel', 'Wat het echt kost, in drie lagen', 'De dorpen van de Vega Baja'], promo_btn: 'Vraag hem aan bij ' + NAME,
      p_plan: 'Plannen', p_lang: 'Taal gids', p_via: 'Aangevraagd via een gesprek met ' + NAME + ' op de gidspagina.', p_via_prop: 'Aangevraagd via ' + NAME + ' op de woningpagina',
      cmp_intro: 'Zal ik je de gratis koopgids sturen? Dan heb ik even je naam, e-mail en mobiel nodig.', cmp_start: 'Ja, stuur maar',
      cmp_done: function (f) { return 'Gelukt, ' + f + '! De gids is onderweg naar je inbox.'; }, cmp_more: 'Praat verder met ' + NAME + ' over kopen',
    },
    en: {
      after2: "I'm here again for all your questions. About the buying process, the costs, the towns or our homes: just ask.", read: 'Read more:', cta_chat: 'Start chatting with ' + NAME, kicker: 'Free living & buying guide', crumb: 'Buying guide', title: 'Free Costa Blanca buying guide',
      desc: 'At home on the Costa Blanca: our free living and buying guide for the Vega Baja. Ask Ava, our live assistant, for your copy and then ask anything about buying, costs and living here.',
      hi: 'Hi, I\'m ' + NAME + ', your live assistant',
      lead: 'I\'ll send you our exclusive guide "At home on the Costa Blanca", and then I\'ll answer all your questions: about the buying process, the costs, the towns and our homes.',
      guideTitle: 'At home on the Costa Blanca', guideSub: 'Living & buying guide Vega Baja',
      coverTag: 'Free · PDF · EN / NL / ES / SV',
      inside_h: 'What\'s inside', inside_p: 'Seven parts and a checklist, from the first question to ask yourself to life after the keys. With checklists, timelines and worked examples instead of walls of text.',
      parts: [
        ['Think first, then look', 'The 10 questions before you buy, holiday home or moving here, your must-have list'],
        ['Where do you want to live?', 'The Vega Baja town by town, coast or inland, climate and airports'],
        ['What does it really cost?', 'The three cost layers, taxes in the Valencian Community, mortgages for non-residents'],
        ['Which type of home?', 'Apartment, bungalow, quad or villa, new build versus resale, renting out: what is allowed where'],
        ['The purchase step by step', 'NIE, power of attorney, reservation, deposit contract, notary, legal checks and the 12 costliest mistakes'],
        ['Your viewing trip', 'What we need beforehand, a viewing day, packing list and our office'],
        ['After the keys', 'Utilities, taxes as an owner, a Spanish will, moving with your family, pets'],
        ['Ready to buy?', 'The checklist to tick off, our services and how to reach us'],
      ],
      why_h: 'Why this guide is different',
      why: [
        ['Local, not all of Spain', 'Written for the Vega Baja and the Costa Blanca South, where we have lived and worked since 2002.'],
        ['Buying and living after', 'Not just up to the notary: also taxes as an owner, your will, schools and healthcare.'],
        ['Checked and current', 'Today\'s rules in the Valencian Community, such as the 9% transfer tax.'],
      ],
      sol_h: 'And after that? Keep talking to ' + NAME,
      sol_p: NAME + ' knows the whole guide, all our homes and the towns where we sell. Ask anything: how the deposit contract works, what a villa up to €400,000 gets you in Benijófar, or which day the market is in Rojales. For anything important a colleague takes over personally.',
      more_h: 'Read more',
      links: [['buy', 'Buying in Spain'], ['move', 'Move to Spain'], ['costs', 'Monthly cost calculator'], ['area', 'Areas'], ['sell', 'Selling']],
      online: 'online', panelSub: 'Live assistant of Soltura Real Estate',
      privacy: 'We use your details to send you the guide and to help you personally. Read our <a href="{p}">privacy policy</a>.',
      noscript: 'Turn on JavaScript to chat with ' + NAME + ', or WhatsApp us on +34 664 414 515.',
      g1: 'Hi! I\'m ' + NAME + ', your live assistant at Soltura Real Estate. I\'d love to send you our free living and buying guide.',
      g2: 'What\'s your name? First and last name is fine.',
      ph_name: 'First and last name', ph_last: 'Last name', ph_email: 'you@email.com', ph_phone: '+44 7700 900123', ph_chat: 'Ask ' + NAME + ' a question…',
      ask_last: function (f) { return 'Nice to meet you, ' + f + '. And your last name?'; },
      ask_email: function (f) { return 'Nice to meet you, ' + f + '. Which email address shall I send the guide to?'; },
      bad_email: 'That email address doesn\'t look quite right. Could you check it?',
      typo: function (e) { return 'Did you mean ' + e + '?'; }, yes: 'Yes, that\'s it', no: 'No, let me fix it',
      ask_phone: 'Great. And your mobile number? Then a colleague can also message you if you have questions. Please include the country code.',
      bad_phone: 'That number looks too short. Could you add the country code, for example +44 7700 900123?',
      ask_plan: 'Last question: what fits your plans best?',
      plans: ['Holiday home', 'Moving here', 'Renting out or investing', 'Just exploring'],
      ask_lang: 'In which language would you like the guide?',
      sending: 'Getting your guide ready…',
      done_h: 'Your guide is on its way', done: function (f, e) { return 'Done, ' + f + '! Your exclusive guide "At home on the Costa Blanca" is on its way to ' + e + '. Check your inbox in a few minutes, and your spam folder just in case.'; },
      after: 'Meanwhile I\'m here for all your questions. About the buying process, the costs, the towns or our homes: just ask.',
      fail: 'Hmm, that didn\'t quite work. Try again, or WhatsApp us on +34 664 414 515.', retry: 'Send again',
      welcome: function (f, e) { return 'Welcome back, ' + f + '. Your guide was sent to ' + e + ' earlier.'; },
      resend: 'Send it again', other: 'Use other details',
      starters: ['How does buying work?', 'What does buying cost on top?', 'Show villas up to €400,000', 'Which town suits me?'],
      edit: 'Edit', homes_n: function (n) { return n === 1 ? '1 home fits' : n + ' homes fit'; }, homes_all: 'See them all',
      handoff_q: 'Shall I ask a colleague to contact you personally?', handoff_yes: 'Yes, please', handoff_ok: 'Done. A colleague will get in touch as soon as possible, usually within one working day.',
      sorry: 'I\'m not sure about that. Feel free to WhatsApp us and we\'ll help you personally.',
      page: { buy: 'Buying', sell: 'Selling', move: 'Move to Spain', costs: 'Monthly cost calculator', area: 'Areas', contact: 'Contact' },
      promo_h: 'Free living & buying guide', promo_p: 'Everything about buying and living on the Costa Blanca, in plain language. Ava sends it to you and then answers your questions.',
      promo_items: ['Every step from reservation to keys', 'What it really costs, in three layers', 'The towns of the Vega Baja'], promo_btn: 'Ask ' + NAME + ' for it',
      p_plan: 'Plans', p_lang: 'Guide language', p_via: 'Requested in a chat with ' + NAME + ' on the guide page.', p_via_prop: 'Requested via ' + NAME + ' on the property page',
      cmp_intro: 'Shall I send you the free buying guide? I just need your name, email and mobile.', cmp_start: 'Yes, send it',
      cmp_done: function (f) { return 'Done, ' + f + '! The guide is on its way to your inbox.'; }, cmp_more: 'Keep talking to ' + NAME + ' about buying',
    },
    sv: {
      after2: 'Jag finns här igen för alla dina frågor. Om köpprocessen, kostnaderna, orterna eller våra bostäder: fråga på.', read: 'Läs mer:', cta_chat: 'Börja chatta med ' + NAME, kicker: 'Kostnadsfri bo- och köpguide', crumb: 'Köpguide', title: 'Kostnadsfri köpguide Costa Blanca',
      desc: 'Hemma på Costa Blanca: vår kostnadsfria bo- och köpguide för Vega Baja. Be Ava, vår live-assistent, om ditt exemplar och fråga sedan om allt kring köp, kostnader och boende.',
      hi: 'Hej, jag är ' + NAME + ', din live-assistent',
      lead: 'Jag skickar vår exklusiva guide "Hemma på Costa Blanca" och svarar sedan på alla dina frågor: om köpprocessen, kostnaderna, orterna och våra bostäder.',
      guideTitle: 'Hemma på Costa Blanca', guideSub: 'Bo- och köpguide Vega Baja',
      coverTag: 'Gratis · PDF · SV / EN / NL / ES',
      inside_h: 'Det här står i den', inside_p: 'Sju delar och en checklista, från den första frågan till dig själv till livet efter nycklarna. Med checklistor, tidslinjer och räkneexempel i stället för textmassor.',
      parts: [
        ['Tänk först, titta sedan', 'De 10 frågorna innan du köper, semesterbostad eller flytt, din måste-ha-lista'],
        ['Var vill du bo?', 'Vega Baja ort för ort, kust eller inland, klimat och flygplatser'],
        ['Vad kostar det egentligen?', 'De tre kostnadslagren, skatter i Valenciaregionen, bolån för icke-residenter'],
        ['Vilken typ av bostad?', 'Lägenhet, bungalow, kedjehus eller villa, nyproduktion eller begagnat, uthyrning: vad gäller var'],
        ['Köpet steg för steg', 'NIE, fullmakt, reservation, handpenningsavtal, notarie, juridiska kontroller och de 12 dyraste misstagen'],
        ['Din visningsresa', 'Vad vi behöver i förväg, en visningsdag, packlista och vårt kontor'],
        ['Efter nycklarna', 'El och vatten, skatter som ägare, spanskt testamente, flytta med familjen, husdjur'],
        ['Redo att köpa?', 'Checklistan att bocka av, våra tjänster och hur du når oss'],
      ],
      why_h: 'Därför är guiden annorlunda',
      why: [
        ['Lokal, inte hela Spanien', 'Skriven för Vega Baja och södra Costa Blanca, där vi har bott och arbetat sedan 2002.'],
        ['Köpet och livet efteråt', 'Inte bara fram till notarien: också skatter som ägare, testamente, skolor och vård.'],
        ['Kontrollerad och aktuell', 'Dagens regler i Valenciaregionen, till exempel stämpelskatten på 9 %.'],
      ],
      sol_h: 'Och sedan? Fortsätt prata med ' + NAME,
      sol_p: NAME + ' kan hela guiden, alla våra bostäder och orterna där vi säljer. Fråga vad du vill: hur handpenningsavtalet fungerar, vad en villa upp till 400 000 € ger i Benijófar eller vilken dag det är marknad i Rojales. För viktiga saker tar en kollega över personligen.',
      more_h: 'Läs också',
      links: [['buy', 'Köpa i Spanien'], ['move', 'Flytta till Spanien'], ['costs', 'Månadskostnader'], ['area', 'Orter'], ['sell', 'Sälja']],
      online: 'online', panelSub: 'Live-assistent hos Soltura Real Estate',
      privacy: 'Vi använder dina uppgifter för att skicka guiden och hjälpa dig personligen. Läs vår <a href="{p}">integritetspolicy</a>.',
      noscript: 'Aktivera JavaScript för att chatta med ' + NAME + ', eller skicka ett WhatsApp till +34 664 414 515.',
      g1: 'Hej! Jag är ' + NAME + ', din live-assistent hos Soltura Real Estate. Jag skickar gärna vår kostnadsfria bo- och köpguide.',
      g2: 'Vad heter du? För- och efternamn räcker.',
      ph_name: 'För- och efternamn', ph_last: 'Efternamn', ph_email: 'du@epost.se', ph_phone: '+46 70 123 45 67', ph_chat: 'Ställ en fråga till ' + NAME + '…',
      ask_last: function (f) { return 'Trevligt att träffas, ' + f + '. Och ditt efternamn?'; },
      ask_email: function (f) { return 'Trevligt att träffas, ' + f + '. Vilken e-postadress ska jag skicka guiden till?'; },
      bad_email: 'Den e-postadressen ser inte riktigt rätt ut. Kan du kontrollera den?',
      typo: function (e) { return 'Menar du ' + e + '?'; }, yes: 'Ja, det stämmer', no: 'Nej, ändra',
      ask_phone: 'Toppen. Och ditt mobilnummer? Då kan en kollega också skriva till dig om du har frågor. Gärna med landsnummer.',
      bad_phone: 'Numret verkar för kort. Kan du skriva det med landsnummer, till exempel +46 70 123 45 67?',
      ask_plan: 'Sista frågan: vad passar bäst för dina planer?',
      plans: ['Semesterbostad', 'Flytta hit', 'Uthyrning eller investering', 'Jag orienterar mig'],
      ask_lang: 'På vilket språk vill du ha guiden?',
      sending: 'Gör i ordning din guide…',
      done_h: 'Din guide är på väg', done: function (f, e) { return 'Klart, ' + f + '! Din exklusiva guide "Hemma på Costa Blanca" är på väg till ' + e + '. Titta i inkorgen om några minuter, och i skräpposten för säkerhets skull.'; },
      after: 'Under tiden finns jag här för alla dina frågor. Om köpprocessen, kostnaderna, orterna eller våra bostäder: fråga på.',
      fail: 'Hmm, det gick inte riktigt. Försök igen, eller skicka ett WhatsApp till +34 664 414 515.', retry: 'Skicka igen',
      welcome: function (f, e) { return 'Välkommen tillbaka, ' + f + '. Din guide skickades tidigare till ' + e + '.'; },
      resend: 'Skicka den igen', other: 'Använd andra uppgifter',
      starters: ['Hur går ett köp till?', 'Vad kostar köpet utöver priset?', 'Visa villor upp till 400 000 €', 'Vilken ort passar mig?'],
      edit: 'Ändra', homes_n: function (n) { return n === 1 ? '1 bostad passar' : n + ' bostäder passar'; }, homes_all: 'Se alla',
      handoff_q: 'Ska jag be en kollega att kontakta dig personligen?', handoff_yes: 'Ja, gärna', handoff_ok: 'Klart. En kollega hör av sig så snart som möjligt, oftast inom en arbetsdag.',
      sorry: 'Det är jag inte säker på. Skicka gärna ett WhatsApp så hjälper vi dig personligen.',
      page: { buy: 'Köpa', sell: 'Sälja', move: 'Flytta till Spanien', costs: 'Månadskostnader', area: 'Orter', contact: 'Kontakt' },
      promo_h: 'Kostnadsfri bo- och köpguide', promo_p: 'Allt om att köpa och bo på Costa Blanca, på klarspråk. Ava skickar den till dig och svarar sedan på dina frågor.',
      promo_items: ['Varje steg från reservation till nycklar', 'Vad det verkligen kostar, i tre lager', 'Orterna i Vega Baja'], promo_btn: 'Be ' + NAME + ' om den',
      p_plan: 'Planer', p_lang: 'Guidens språk', p_via: 'Beställd i en chatt med ' + NAME + ' på guidesidan.', p_via_prop: 'Beställd via ' + NAME + ' på bostadssidan',
      cmp_intro: 'Ska jag skicka den kostnadsfria köpguiden? Jag behöver bara ditt namn, e-post och mobilnummer.', cmp_start: 'Ja, skicka den',
      cmp_done: function (f) { return 'Klart, ' + f + '! Guiden är på väg till din inkorg.'; }, cmp_more: 'Fortsätt prata med ' + NAME + ' om köp',
    },
  };

  // Spaans: alleen het gesprek NA de taalkeuze (de site zelf bestaat in en/nl/sv); de rest valt terug op Engels
  TX.es = Object.assign({}, TX.en, {
    after2: 'Aquí estoy de nuevo para todas tus preguntas. Sobre el proceso de compra, los costes, los pueblos o nuestras viviendas: pregunta lo que quieras.', read: 'Sigue leyendo:',
    guideTitle: 'En casa en la Costa Blanca',
    ph_chat: 'Hazle una pregunta a ' + NAME + '…',
    sending: 'Preparando tu guía…',
    done_h: 'Tu guía está en camino', done: function (f, e) { return '¡Listo, ' + f + '! Tu guía exclusiva "En casa en la Costa Blanca" va de camino a ' + e + '. Revisa tu bandeja de entrada en unos minutos, y la carpeta de spam por si acaso.'; },
    after: 'Mientras tanto, estoy aquí para todas tus preguntas. Sobre el proceso de compra, los costes, los pueblos o nuestras viviendas: pregunta lo que quieras.',
    fail: 'Vaya, algo no ha funcionado. Inténtalo de nuevo o escríbenos por WhatsApp al +34 664 414 515.', retry: 'Enviar de nuevo',
    welcome: function (f, e) { return 'Bienvenido de nuevo, ' + f + '. Ya te enviamos la guía a ' + e + '.'; },
    resend: 'Envíala de nuevo', other: 'Usar otros datos',
    starters: ['¿Cómo funciona la compra?', '¿Qué gastos hay además del precio?', 'Villas hasta 400.000 €', '¿Qué pueblo me conviene?'],
    edit: 'Cambiar', homes_n: function (n) { return n === 1 ? '1 vivienda encaja' : n + ' viviendas encajan'; }, homes_all: 'Ver todas',
    handoff_q: '¿Quieres que un compañero se ponga en contacto contigo personalmente?', handoff_yes: 'Sí, por favor', handoff_ok: 'Hecho. Un compañero se pondrá en contacto contigo lo antes posible, normalmente en un día laborable.',
    sorry: 'No estoy segura de eso. Escríbenos por WhatsApp y te ayudamos personalmente.',
    page: { buy: 'Comprar', sell: 'Vender', move: 'Vivir en España', costs: 'Calculadora de gastos mensuales', area: 'Pueblos', contact: 'Contacto' },
    cmp_done: function (f) { return '¡Listo, ' + f + '! La guía va de camino a tu bandeja de entrada.'; }, cmp_more: 'Sigue hablando con ' + NAME + ' sobre la compra',
  });
  // gidstalen. De PDF bestaat in NL, EN, ES en SV (Zweeds sinds 23-10-2026); de mail aan Zweedse kiezers blijft Engels, de knop gaat naar de Zweedse PDF.
  // Na de keuze gaat het hele gesprek (Ava's teksten, knoppen, antwoorden) verder in die taal (Rick, 23-10-2026).
  var GLANGS = [['nl', 'Nederlands'], ['en', 'English'], ['es', 'Español'], ['sv', 'Svenska']];
  function pdfLang(g) { return g === 'nl' || g === 'es' ? g : 'en'; }

  function L(lang) { return TX[lang] || TX.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ICO = {
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L21 3l-7.5 18-2.5-7.5z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="M3 6l9 7 9-7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  // echte pagina's uit de PDF-gids (img/gids/<taal>-<pagina>.webp; nl, en of es, sv valt terug op en)
  var FAN = [26, 14, 16, 5, 1]; // van achter naar voor; 1 = omslag
  function pg(lang, n) { return '/img/gids/' + (lang === 'nl' || lang === 'es' || lang === 'sv' ? lang : 'en') + '-' + n + '.webp'; }
  function fan(lang) {
    var t = L(lang);
    return '<div class="gd-fan" aria-label="' + esc(t.guideTitle) + '">' + FAN.map(function (n, i) {
      return '<img class="gd-fan-p p' + i + '" src="' + pg(lang, n) + '" width="440" height="622" alt="' + (n === 1 ? esc(t.guideTitle) : '') + '" loading="' + (n === 1 ? 'eager' : 'lazy') + '" decoding="async">';
    }).join('') + '<span class="gd-cover-tag">' + esc(t.coverTag) + '</span></div>';
  }
  function cover(lang, small) {
    if (small) return '<img class="gd-cover-img" src="' + pg(lang, 1) + '" width="86" height="122" alt="" loading="lazy" decoding="async">';
    var t = L(lang);
    return '<div class="gd-cover' + (small ? ' sm' : '') + '" aria-hidden="true"><div class="gd-cover-sun"></div><div class="gd-cover-sea"></div>' +
      '<div class="gd-cover-txt"><span class="gd-cover-brand">Soltura Real Estate</span><b>' + esc(t.guideTitle) + '</b><span>' + esc(t.guideSub) + '</span></div>' +
      (small ? '' : '<span class="gd-cover-tag">' + esc(t.coverTag) + '</span>') + '</div>';
  }
  function panel(lang, links) {
    var t = L(lang);
    return '<div class="sol-panel" id="solPanel"><div class="sol-head"><div class="chat-av">' + avatar(46) + '<i class="online"></i></div>' +
      '<div><h2>' + esc(NAME) + '</h2><p><span class="sol-dot"></span>' + esc(t.panelSub) + '</p></div></div>' +
      '<div class="sol-log" id="solLog" aria-live="polite"><div class="sol-msg a">' + esc(t.g1) + '</div><div class="sol-msg a">' + esc(t.g2) + '</div></div>' +
      '<div class="sol-chips" id="solChips"></div>' +
      '<form class="sol-form" id="solForm" autocomplete="on"><input id="solIn" name="name" autocomplete="name" placeholder="' + esc(t.ph_name) + '" aria-label="' + esc(t.ph_name) + '">' +
      '<button type="submit" aria-label="OK">' + ICO.send + '</button></form>' +
      '<noscript><p class="sol-note">' + esc(t.noscript) + '</p></noscript>' +
      '<p class="sol-note">' + t.privacy.replace('{p}', links.privacy) + '</p></div>';
  }
  // volledige pagina (app en statische build)
  function html(lang, links) {
    var t = L(lang);
    return '<section class="gd-hero"><div class="gd-hero-in">' +
      '<div class="gd-hero-txt"><div class="gd-ava">' + avatar(176, 'gd-ava-img') + '<span class="gd-ava-tag"><i></i>' + esc(t.online) + '</span></div><p class="kicker">' + esc(t.kicker) + '</p><h1>' + esc(t.hi) + '</h1><p class="gd-lead">' + esc(t.lead) + '</p>' + fan(lang) + '</div>' +
      panel(lang, links) + '</div></section>' +
      '<div class="pg gd-pg">' +
      '<h2 class="pg-h">' + esc(t.inside_h) + '</h2><p class="pg-intro">' + esc(t.inside_p) + '</p>' +
      '<ol class="gd-parts">' + t.parts.map(function (p, i) { return '<li><span class="gd-n">' + (i + 1) + '</span><div><h3>' + esc(p[0]) + '</h3><p>' + esc(p[1]) + '</p></div></li>'; }).join('') + '</ol>' +
      '<h2 class="pg-h">' + esc(t.why_h) + '</h2><div class="feats">' + t.why.map(function (w) { return '<div class="feat"><h3>' + esc(w[0]) + '</h3><p>' + esc(w[1]) + '</p></div>'; }).join('') + '</div>' +
      '<div class="gd-sol"><div class="chat-av lg">' + avatar(96) + '<i class="online"></i></div><div><h2>' + esc(t.sol_h) + '</h2><p>' + esc(t.sol_p) + '</p>' +
      '<a class="btn primary" href="#solPanel" data-sol-focus>' + esc(t.cta_chat) + '</a></div></div>' +
      '<h2 class="pg-h">' + esc(t.more_h) + '</h2><div class="gd-links">' + t.links.map(function (l) { return '<a href="' + links[l[0]] + '">' + esc(l[1]) + ICO.arrow + '</a>'; }).join('') + '</div>' +
      '</div>';
  }
  // promo-paneel voor andere pagina's (Kopen, Emigreren, woonplaatsgids, home)
  function promo(lang, href) {
    var t = L(lang);
    return '<a class="gd-promo" href="' + href + '">' + cover(lang, true) + '<span class="gd-promo-txt"><span class="gd-promo-sol"><span class="chat-av">' + avatar(46) + '<i class="online"></i></span>' + esc(t.hi) + '</span>' +
      '<b>' + esc(t.promo_h) + '</b><span>' + esc(t.promo_p) + '</span><span class="gd-promo-list">' + t.promo_items.map(function (x) { return '<span>' + ICO.check + esc(x) + '</span>'; }).join('') + '</span></span>' +
      '<span class="btn lemon">' + esc(t.promo_btn) + '</span></a>';
  }

  // ---------- het gesprek ----------
  var TYPO = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.nl': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com', 'icloud.co': 'icloud.com', 'iclod.com': 'icloud.com', 'ziggo.n': 'ziggo.nl', 'kpnmail.n': 'kpnmail.nl', 'live.n': 'live.nl' };
  var EMAIL = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
  function titleCase(s) { return s.replace(/\s+/g, ' ').trim().split(' ').map(function (w) { return /^(van|de|der|den|het|ten|ter|von|da|del|la|le)$/i.test(w) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1); }).join(' '); }
  function normPhone(v, lang) {
    var s = String(v || '').replace(/[^\d+]/g, '');
    if (s.indexOf('00') === 0) s = '+' + s.slice(2);
    if (s.charAt(0) !== '+') {
      if (lang === 'nl' && /^06\d{8}$/.test(s)) s = '+31' + s.slice(1);
      else if (lang === 'sv' && /^07\d{8}$/.test(s)) s = '+46' + s.slice(1);
      else if (/^[67]\d{8}$/.test(s)) s = '+34' + s;
    }
    return s;
  }

  // root: element met #solLog/#solChips/#solForm/#solIn (pagina) of de compacte variant (woningpagina).
  // d: { fn, meta(formName), track, href(key), ls: {get,set}, compact, formName, property }
  function bind(rootEl, lang, d) {
    var t = L(lang), tSite = t; // t = taal van het gesprek (wisselt bij de gidstaalkeuze), tSite = sitetaal (teamregels)
    var $ = function (s) { return rootEl.querySelector(s); };
    var log = $('#solLog'), chips = $('#solChips'), form = $('#solForm'), input = $('#solIn');
    if (!log || !form) return;
    var st = { step: 'name', first: '', last: '', email: '', phone: '', plan: '', glang: lang, clang: lang, sent: false, busy: false };
    function setChatLang(l) { st.clang = TX[l] ? l : lang; t = L(st.clang); input.placeholder = t.ph_chat; }
    var hist = [], answers = [];
    var saved = d.ls ? d.ls.get('guide', null) : null;

    function scroll() { log.scrollTop = log.scrollHeight; if (!d.compact) { var r = log.getBoundingClientRect(); if (r.bottom > innerHeight) log.scrollIntoView({ block: 'end', behavior: 'smooth' }); } }
    function say(text, cls) {
      return new Promise(function (res) {
        var ty = document.createElement('div'); ty.className = 'sol-msg a typing'; ty.innerHTML = '<span></span><span></span><span></span>';
        log.appendChild(ty); scroll();
        setTimeout(function () { ty.remove(); var m = document.createElement('div'); m.className = 'sol-msg a' + (cls ? ' ' + cls : ''); if (typeof text === 'string') m.textContent = text; else m.appendChild(text); log.appendChild(m); scroll(); res(m); }, Math.min(1100, 380 + String(text.textContent || text).length * 9));
      });
    }
    function me(text, step) {
      var m = document.createElement('div'); m.className = 'sol-msg u'; m.textContent = text;
      if (step && !st.sent) { var e = document.createElement('button'); e.type = 'button'; e.className = 'sol-edit'; e.textContent = t.edit; e.onclick = function () { rewind(step, m); }; m.appendChild(e); answers.push(m); }
      log.appendChild(m); scroll(); return m;
    }
    function setChips(list, onPick) {
      chips.innerHTML = '';
      (list || []).forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c[1]; b.onclick = function () { onPick(c[0], c[1]); }; chips.appendChild(b); });
    }
    function ask(step, ph, type, ac) {
      st.step = step; input.value = ''; input.type = type || 'text'; input.placeholder = ph; input.setAttribute('aria-label', ph);
      input.autocomplete = ac || 'off'; input.name = step; form.hidden = false; input.disabled = false;
      if (!d.compact || document.activeElement === input) setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
    }
    function rewind(step, fromEl) {
      if (st.sent || st.busy) return;
      var n = fromEl; while (n) { var nx = n.nextSibling; n.remove(); n = nx; } // alles vanaf dit antwoord weg
      chips.innerHTML = '';
      if (step === 'name') { ask('name', t.ph_name, 'text', 'name'); input.value = (st.first + ' ' + st.last).trim(); }
      else if (step === 'email') { ask('email', t.ph_email, 'email', 'email'); input.value = st.email; }
      else if (step === 'phone') { ask('phone', t.ph_phone, 'tel', 'tel'); input.value = st.phone; }
    }
    function askEmail() { return say(t.ask_email(st.first)).then(function () { ask('email', t.ph_email, 'email', 'email'); }); }
    function askPhone() { return say(t.ask_phone).then(function () { ask('phone', t.ph_phone, 'tel', 'tel'); }); }
    function askPlan() {
      form.hidden = true;
      return say(t.ask_plan).then(function () { setChips(t.plans.map(function (p) { return [p, p]; }), function (v, lbl) { st.plan = v; chips.innerHTML = ''; me(lbl); askLang(); }); });
    }
    function askLang() {
      form.hidden = true;
      var order = GLANGS.slice().sort(function (a, b) { return (a[0] === st.glang ? -1 : 0) - (b[0] === st.glang ? -1 : 0); });
      return say(t.ask_lang).then(function () { setChips(order, function (v, lbl) { st.glang = v; setChatLang(v); chips.innerHTML = ''; me(lbl); submit(); }); });
    }
    function submit() {
      if (st.busy) return; st.busy = true; form.hidden = true;
      var wait = document.createElement('div'); wait.className = 'sol-msg a sol-sending'; wait.innerHTML = '<span class="sol-env">' + ICO.mail + '</span>' + esc(t.sending); log.appendChild(wait); scroll();
      var gl = GLANGS.filter(function (g) { return g[0] === st.glang; })[0];
      var gLbl = (gl ? gl[1] : st.glang) + (st.glang === 'sv' ? ' (PDF: English)' : '');
      var lines = [d.compact ? tSite.p_via_prop + (d.property ? ' ' + d.property.reference : '') + '.' : tSite.p_via, (st.plan ? tSite.p_plan + ': ' + st.plan : ''), tSite.p_lang + ': ' + gLbl].filter(Boolean);
      var body = Object.assign({ kind: 'guide' }, d.meta(d.formName), {
        lang: pdfLang(st.glang), site_lang: lang, name: st.first + ' ' + st.last, first: st.first, last: st.last, first_name: st.first, last_name: st.last,
        email: st.email, phone: st.phone, message: lines.join('\n'), fields: { plan: st.plan || null, guide_lang: pdfLang(st.glang), chat_lang: st.clang, channel: 'sol' } });
      d.fn('web-contact', body).catch(function () { return { ok: false }; }).then(function (r) {
        st.busy = false; wait.remove();
        if (!r || !r.ok) {
          say(t.fail).then(function () { setChips([['retry', t.retry]], function () { chips.innerHTML = ''; submit(); }); });
          return;
        }
        st.sent = true;
        answers.forEach(function (a) { var b = a.querySelector('.sol-edit'); if (b) b.remove(); });
        if (d.ls) d.ls.set('guide', { first: st.first, last: st.last, email: st.email, phone: st.phone, glang: st.glang, clang: st.clang, at: Date.now() });
        if (d.track) d.track('guide_request', d.property ? d.property.id : null, null, { via: 'sol', plan: st.plan || null, glang: st.glang });
        celebrate().then(function () {
          if (d.compact) {
            var a = document.createElement('a'); a.className = 'sol-more'; a.href = d.href('gids'); a.innerHTML = esc(t.cmp_more) + ICO.arrow;
            return say(a);
          }
          return say(t.after).then(function () { chatMode(); });
        });
      });
    }
    function celebrate() {
      var card = document.createElement('div'); card.className = 'sol-done';
      card.innerHTML = '<div class="sol-done-fly">' + cover(pdfLang(st.glang), true) + '<span class="sol-done-env">' + ICO.mail + '</span></div><div><b>' + esc(t.done_h) + '</b><span>' + esc(st.email) + '</span></div>';
      log.appendChild(card); scroll();
      for (var i = 0; i < 14; i++) { var c = document.createElement('i'); c.className = 'sol-conf'; c.style.setProperty('--x', (Math.random() * 220 - 110) + 'px'); c.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg'); c.style.setProperty('--d', (Math.random() * .4) + 's'); c.style.background = ['#F03838', '#FF7068', '#FBCC10', '#384850'][i % 4]; card.appendChild(c); }
      return say(d.compact ? t.cmp_done(st.first) : t.done(st.first, st.email), 'big');
    }
    // vrij gesprek met Ava na de intake
    function chatMode() {
      st.step = 'chat'; ask('chat', t.ph_chat, 'text', 'off');
      setChips(t.starters.map(function (s) { return [s, s]; }), function (v) { chats(v); });
    }
    function homeCard(p) {
      var a = document.createElement('a'); a.className = 'sol-home'; a.href = d.homeHref(p);
      var cl = st.clang, price = p.price != null ? new Intl.NumberFormat(cl === 'sv' ? 'sv-SE' : cl === 'nl' ? 'nl-NL' : cl === 'es' ? 'es-ES' : 'en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.price) : '';
      a.innerHTML = (p.image ? '<img src="' + esc(d.img ? d.img(p.image) : p.image) + '" alt="" loading="lazy">' : '<span class="sol-home-ph"></span>') +
        '<span><b>' + esc(price) + '</b><small>' + esc([d.catName ? d.catName(p.category) : p.category, p.town].filter(Boolean).join(' · ')) + '</small><small>' + esc([p.bedrooms ? p.bedrooms + ' ' + (d.word ? d.word('beds') : 'bd') : '', p.reference].filter(Boolean).join(' · ')) + '</small></span>';
      return a;
    }
    function chats(q) {
      q = String(q || '').trim(); if (!q || st.busy) return;
      st.busy = true; chips.innerHTML = ''; me(q); input.value = '';
      var ty = document.createElement('div'); ty.className = 'sol-msg a typing'; ty.innerHTML = '<span></span><span></span><span></span>'; log.appendChild(ty); scroll();
      if (d.track) d.track('assistant', null, null, { via: 'guide' });
      d.fn('web-assistant', { mode: 'guide', lang: st.clang, query: q, name: st.first, history: hist }).catch(function () { return {}; }).then(function (r) {
        st.busy = false; ty.remove();
        var reply = (r && r.reply) || t.sorry;
        hist.push({ role: 'user', content: q }, { role: 'assistant', content: reply });
        var m = document.createElement('div'); m.className = 'sol-msg a'; m.textContent = reply; log.appendChild(m);
        if (r && r.homes && r.homes.length) {
          var box = document.createElement('div'); box.className = 'sol-homes';
          r.homes.forEach(function (p) { box.appendChild(homeCard(p)); });
          var hd = document.createElement('div'); hd.className = 'sol-homes-h'; hd.textContent = t.homes_n(r.total || r.homes.length);
          if (r.total > r.homes.length && d.showAll) { var all = document.createElement('button'); all.type = 'button'; all.textContent = t.homes_all; all.onclick = function () { d.showAll(r.search || {}); }; hd.appendChild(all); }
          log.appendChild(hd); log.appendChild(box);
        }
        if (r && r.link && t.page[r.link]) { var lk = document.createElement('a'); lk.className = 'sol-more'; lk.href = d.href(r.link); lk.innerHTML = esc(t.read + ' ' + t.page[r.link]) + ICO.arrow; log.appendChild(lk); }
        scroll();
        if (r && r.handoff && st.email) {
          say(t.handoff_q).then(function () {
            setChips([['yes', t.handoff_yes]].concat((r.suggestions || []).slice(0, 2).map(function (s) { return [s, s]; })), function (v, lbl) {
              if (v !== 'yes') return chats(v);
              chips.innerHTML = ''; me(lbl); handoff(q);
            });
          });
        } else setChips((r && r.suggestions || []).slice(0, 3).map(function (s) { return [s, s]; }), function (v) { chats(v); });
      });
    }
    function handoff(q) {
      var tr = hist.slice(-8).map(function (h) { return (h.role === 'user' ? st.first || 'Bezoeker' : NAME) + ': ' + h.content; }).join('\n');
      var body = Object.assign({ kind: 'contact' }, d.meta('web-guide-assistant-handoff'), { lang: pdfLang(st.glang), site_lang: lang, name: st.first + ' ' + st.last, first: st.first, last: st.last, first_name: st.first, last_name: st.last, email: st.email, phone: st.phone,
        message: 'Wil persoonlijk contact na gesprek met ' + NAME + ' (gidspagina).\nVraag: ' + q + '\n\nGesprek:\n' + tr, fields: { channel: 'sol', plan: st.plan || null } });
      d.fn('web-contact', body).catch(function () { return { ok: false }; }).then(function (r) {
        if (r && r.ok) { if (d.track) d.track('contact_sent', null, null, { kind: 'sol_handoff' }); say(t.handoff_ok); }
        else say(t.fail);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v) return;
      if (st.step === 'chat') return chats(v);
      if (st.step === 'name') {
        var parts = titleCase(v.replace(/[^\p{L}\p{M}' .-]/gu, ' ')).split(' ').filter(Boolean);
        if (!parts.length) return;
        me(parts.join(' '), 'name');
        st.first = parts[0]; st.last = parts.slice(1).join(' ');
        if (!st.last) return say(t.ask_last(st.first)).then(function () { ask('last', t.ph_last, 'text', 'family-name'); });
        return askEmail();
      }
      if (st.step === 'last') { st.last = titleCase(v.replace(/[^\p{L}\p{M}' .-]/gu, ' ')); if (!st.last) return; me(st.last, 'name'); return askEmail(); }
      if (st.step === 'email') {
        var em = v.toLowerCase().replace(/\s+/g, '');
        if (!EMAIL.test(em)) { me(v); return say(t.bad_email).then(function () { ask('email', t.ph_email, 'email', 'email'); input.value = em; }); }
        me(em, 'email');
        var dom = em.split('@')[1], fix = TYPO[dom];
        if (fix) {
          var sug = em.split('@')[0] + '@' + fix; form.hidden = true;
          return say(t.typo(sug)).then(function () { setChips([['y', t.yes], ['n', t.no]], function (c, lbl) { chips.innerHTML = ''; me(lbl); if (c === 'y') { st.email = sug; askPhone(); } else { ask('email', t.ph_email, 'email', 'email'); input.value = em; } }); });
        }
        st.email = em; return askPhone();
      }
      if (st.step === 'phone') {
        var ph = normPhone(v, lang);
        if (ph.replace(/\D/g, '').length < 9) { me(v); return say(t.bad_phone).then(function () { ask('phone', t.ph_phone, 'tel', 'tel'); input.value = v; }); }
        me(ph, 'phone'); st.phone = ph;
        return d.compact ? askLang() : askPlan();
      }
    });

    // start: terugkerende bezoeker of nieuw gesprek
    if (d.compact) {
      log.innerHTML = '';
      form.hidden = true;
      say(t.cmp_intro).then(function () { setChips([['go', t.cmp_start]], function (c, lbl) { chips.innerHTML = ''; me(lbl); say(t.g2).then(function () { ask('name', t.ph_name, 'text', 'name'); input.focus({ preventScroll: true }); }); }); });
      return;
    }
    if (saved && saved.email && saved.first) {
      log.innerHTML = '';
      Object.assign(st, { first: saved.first, last: saved.last || '', email: saved.email, phone: saved.phone || '', glang: saved.glang || st.glang });
      setChatLang(saved.clang || (saved.glang && TX[saved.glang] ? saved.glang : lang));
      form.hidden = true;
      say(t.welcome(saved.first, saved.email)).then(function () {
        say(t.after2).then(function () {
          st.sent = true; chatMode();
          var extra = [['resend', t.resend], ['other', t.other]];
          setChips(extra.concat(t.starters.slice(0, 2).map(function (s) { return [s, s]; })), function (v, lbl) {
            if (v === 'resend') { chips.innerHTML = ''; me(lbl); st.sent = false; submit(); }
            else if (v === 'other') { chips.innerHTML = ''; me(lbl); st.sent = false; if (d.ls) d.ls.set('guide', null); Object.assign(st, { first: '', last: '', email: '', phone: '', plan: '', glang: lang }); setChatLang(lang); say(t.g2).then(function () { ask('name', t.ph_name, 'text', 'name'); }); }
            else chats(v);
          });
        });
      });
    } else {
      ask('name', t.ph_name, 'text', 'name');
    }
    var f = document.querySelector('[data-sol-focus]');
    if (f) f.addEventListener('click', function (e) { e.preventDefault(); rootEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { input.focus({ preventScroll: true }); }, 450); });
  }

  // compacte variant (woningpagina): zelfde gesprek in een klein paneel
  function compact(lang) {
    var t = L(lang);
    return '<div class="box guide-box sol-compact" id="guideBox"><div class="gb-head"><span class="chat-av">' + avatar(46) + '<i class="online"></i></span><div><h3>' + esc(t.promo_h) + '</h3><p>' + esc(t.hi) + '</p></div></div>' +
      '<div class="sol-log" id="solLog" aria-live="polite"></div><div class="sol-chips" id="solChips"></div>' +
      '<form class="sol-form" id="solForm" hidden><input id="solIn" autocomplete="name"><button type="submit" aria-label="OK">' + ICO.send + '</button></form></div>';
  }

  root.GIDS = { NAME: NAME, avatar: avatar, html: html, bind: bind, promo: promo, compact: compact, text: L };
})(typeof window !== 'undefined' ? window : globalThis);
