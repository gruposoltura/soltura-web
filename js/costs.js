/* Grupo Soltura website — Maandlastencalculator (22-10-2026), onder Emigreren:
   /nl/emigreren/maandlasten/ · /en/move-to-spain/monthly-costs/ · /sv/flytta-till-spanien/manadskostnader/ · /es/vivir-en-espana/gastos-mensuales/ (26-10-2026)
   Gedeeld door de app (js/app.js: COSTS.html + COSTS.bind) en de statische build (scripts/build.mjs: COSTS.html).
   Bedragen = voorbeeldbedragen, gelijk aan de calculator op SpanjeKompas (spanjekompas/js/maandlasten.js); de bezoeker past ze aan.
   Wat de bezoeker invult blijft in de eigen browser (localStorage 'gs_ml'); er gaat niets naar een server. */
(function (root) {
  'use strict';
  // woningtype -> kostenprofiel (0 = appartement, 1 = geschakeld/bungalow, 2 = vrijstaand met zwembad)
  var TYPES = [['apartment', 0], ['penthouse', 0], ['bungalow', 1], ['quadrant', 1], ['semi', 1], ['townhouse', 1], ['duplex', 1], ['villa', 2], ['finca', 2]];
  var PROFILE = {}; TYPES.forEach(function (x) { PROFILE[x[0]] = x[1]; });

  /* per: 'm' = per maand, 'j' = per jaar. maal: waarmee het bedrag wordt vermenigvuldigd. g = groep (index in GROUPS). */
  var ITEMS = [
    { id: 'ibi', g: 0, per: 'j', w: [300, 400, 700] },
    { id: 'basura', g: 0, per: 'j', w: [120, 120, 140] },
    { id: 'comunidad', g: 0, per: 'm', w: [70, 45, 0] },
    { id: 'verz', g: 0, per: 'j', w: [250, 350, 550] },
    { id: 'onderhoud', g: 0, per: 'm', w: [0, 0, 60] },
    { id: 'stroom', g: 1, per: 'm', w: [70, 90, 140] },
    { id: 'water', g: 1, per: 'm', w: [25, 35, 60] },
    { id: 'gas', g: 1, per: 'm', w: [10, 15, 20] },
    { id: 'internet', g: 1, per: 'm', v: 50 },
    { id: 'zorgV', g: 2, per: 'm', zorg: { particulier: 130, s1: 0, werk: 0 }, maal: 'volw' },
    { id: 'zorgK', g: 2, per: 'm', zorg: { particulier: 55, s1: 0, werk: 0 }, maal: 'kind' },
    { id: 'school', g: 3, per: 'j', school: { openbaar: 500, internationaal: 7000 }, maal: 'kind' },
    { id: 'autoVerz', g: 4, per: 'j', v: 450, maal: 'auto' },
    { id: 'autoBel', g: 4, per: 'j', v: 120, maal: 'auto' },
    { id: 'brandstof', g: 4, per: 'm', v: 110, maal: 'auto' },
    { id: 'bood', g: 5, per: 'm', v: 300, maal: 'volw' },
    { id: 'boodK', g: 5, per: 'm', v: 175, maal: 'kind' },
    { id: 'vrij', g: 5, per: 'm', v: 150, maal: 'volw' },
  ];
  var DEF = { woning: 'bungalow', volw: 2, kind: 0, school: 'openbaar', zorg: 'particulier', auto: 1, nu: '', custom: {} };
  var LOCALE = { en: 'en-IE', nl: 'nl-NL', sv: 'sv-SE', es: 'es-ES' };

  var TX = {
    nl: {
      kicker: 'Emigreren', crumb: 'Maandlasten',
      h: 'Maandlastencalculator', lead: 'Niet de koopprijs, maar de maandlasten bepalen hoe ontspannen je hier leeft. Kies je woning en huishouden, pas de bedragen aan en vergelijk het met wat je nu kwijt bent.',
      sit: 'Jouw situatie', woning: 'Type woning',
      types: { apartment: 'Appartement', penthouse: 'Penthouse', bungalow: 'Bungalow', quadrant: 'Hoekwoning (quad)', semi: 'Twee-onder-een-kap', townhouse: 'Rijtjeshuis', duplex: 'Duplex', villa: 'Vrijstaande villa met zwembad', finca: 'Finca' },
      volw: 'Volwassenen', kind: 'Kinderen', school: 'School', schools: { openbaar: 'Openbare Spaanse school', internationaal: 'Internationale school' },
      zorg: 'Zorg voor volwassenen', zorgs: { s1: 'Via je pensioen (S1-formulier)', werk: 'Via werk in Spanje', particulier: 'Particuliere verzekering' },
      auto: "Auto's",
      hint: 'De bedragen hieronder zijn <b>voorbeeldbedragen</b> om mee te beginnen, geen gemiddelden. Vervang ze door echte bedragen, bijvoorbeeld uit de rekeningen van een woning die je overweegt.',
      items: 'De posten', groups: ['Wonen', 'Energie en water', 'Zorg', 'School', 'Auto', 'Dagelijks leven'],
      labels: { ibi: 'IBI (gemeentelijke onroerendgoedbelasting)', basura: 'Afvalheffing (basura)', comunidad: 'Comunidad (vereniging van eigenaren)', verz: 'Opstal- en inboedelverzekering', onderhoud: 'Onderhoud tuin en zwembad', stroom: 'Stroom (airco en verwarming)', water: 'Water', gas: 'Gas (butaan)', internet: 'Internet en telefoon', zorgV: 'Zorgverzekering per volwassene', zorgK: 'Zorgverzekering per kind', school: 'Schoolkosten per kind', autoVerz: 'Autoverzekering per auto', autoBel: 'Wegenbelasting en keuring (ITV) per auto', brandstof: 'Brandstof per auto', bood: 'Boodschappen per volwassene', boodK: 'Boodschappen per kind', vrij: 'Uit eten en vrije tijd per volwassene' },
      pm: 'per maand', pj: 'per jaar', maal: { volw: ['volwassene', 'volwassenen'], kind: ['kind', 'kinderen'], auto: ['auto', "auto's"] },
      nuH: 'Vergelijk met nu', nu: 'Wat ben je nu per maand kwijt aan deze posten?', nuPh: 'Bijvoorbeeld 2400',
      nuHelp: 'Tel dezelfde posten op: woonlasten zonder hypotheek of huur, energie, zorg, school, auto en dagelijks leven.',
      reset: 'Terug naar de voorbeeldbedragen',
      outK: 'Jouw schatting', outM: 'Per maand', year: function (v) { return 'Dat is ongeveer ' + v + ' per jaar.'; },
      same: 'Ongeveer hetzelfde als nu.', diff: function (v, less) { return 'Dat is <b>' + v + ' per maand ' + (less ? 'minder' : 'meer') + '</b> dan je nu kwijt bent.'; },
      excl: 'Exclusief hypotheek of huur, en exclusief inkomstenbelasting. Wat je invult blijft alleen in deze browser.',
      ctaPlan: 'Bespreek je plannen met ons', ctaHomes: 'Bekijk woningen', ctaMort: 'Reken ook je hypotheek uit',
      expH: 'Wat zit er in deze posten?',
      exp: ['<b>IBI</b> is de jaarlijkse gemeentelijke onroerendgoedbelasting, gebaseerd op de kadastrale waarde. <b>Basura</b> is de afvalheffing van de gemeente. De <b>comunidad</b> is de bijdrage aan de vereniging van eigenaren, bij appartementen en in urbanisaties met gedeeld zwembad of groen.',
        'Bij zorg via je pensioen betaal je in Spanje meestal niets extra; met het S1-formulier loopt je dekking via je land van herkomst. Werk je in Spanje, dan betaal je premies via je loon of als zelfstandige.',
        'Kosten verschillen per gemeente, per woning en per jaar. Overweeg je een specifieke woning? Vraag ons naar de echte IBI-, basura- en comunidadbedragen, die hebben we meestal.'],
      disc: 'Deze calculator geeft een eerste indruk en is geen financieel advies. Bedragen verschillen per woning, gemeente en jaar.',
      title: 'Maandlastencalculator: wat kost wonen in Spanje per maand?',
      desc: 'Reken uit wat wonen aan de Costa Blanca Zuid per maand kost: woning, energie, zorg, school, auto en dagelijks leven, en vergelijk het met wat je nu kwijt bent.',
      teaserH: 'Wat kost wonen hier per maand?', teaserP: 'Kies je woning, huishouden, school, zorg en auto\'s en zie meteen je maandlasten, uitgesplitst per groep en vergeleken met nu.', teaserBtn: 'Open de maandlastencalculator',
    },
    en: {
      kicker: 'Move to Spain', crumb: 'Monthly costs',
      h: 'Monthly cost calculator', lead: "It's not the purchase price but the monthly costs that decide how relaxed life here feels. Choose your home and household, adjust the amounts and compare with what you spend now.",
      sit: 'Your situation', woning: 'Type of home',
      types: { apartment: 'Apartment', penthouse: 'Penthouse', bungalow: 'Bungalow', quadrant: 'Quad house', semi: 'Semi-detached', townhouse: 'Townhouse', duplex: 'Duplex', villa: 'Detached villa with pool', finca: 'Finca' },
      volw: 'Adults', kind: 'Children', school: 'School', schools: { openbaar: 'Spanish state school', internationaal: 'International school' },
      zorg: 'Healthcare for adults', zorgs: { s1: 'Through your pension (S1 form)', werk: 'Through work in Spain', particulier: 'Private insurance' },
      auto: 'Cars',
      hint: 'The amounts below are <b>example amounts</b> to start from, not averages. Replace them with real figures, for example from the bills of a home you are considering.',
      items: 'The items', groups: ['Housing', 'Energy and water', 'Healthcare', 'School', 'Car', 'Daily life'],
      labels: { ibi: 'IBI (municipal property tax)', basura: 'Rubbish collection (basura)', comunidad: 'Community fees (comunidad)', verz: 'Buildings and contents insurance', onderhoud: 'Garden and pool maintenance', stroom: 'Electricity (air con and heating)', water: 'Water', gas: 'Gas (butane)', internet: 'Internet and phone', zorgV: 'Health insurance per adult', zorgK: 'Health insurance per child', school: 'School costs per child', autoVerz: 'Car insurance per car', autoBel: 'Road tax and MOT (ITV) per car', brandstof: 'Fuel per car', bood: 'Groceries per adult', boodK: 'Groceries per child', vrij: 'Eating out and leisure per adult' },
      pm: 'per month', pj: 'per year', maal: { volw: ['adult', 'adults'], kind: ['child', 'children'], auto: ['car', 'cars'] },
      nuH: 'Compare with now', nu: 'What do you spend on these items per month now?', nuPh: 'For example 2400',
      nuHelp: 'Add up the same items: housing costs without mortgage or rent, energy, healthcare, school, car and daily life.',
      reset: 'Back to the example amounts',
      outK: 'Your estimate', outM: 'Per month', year: function (v) { return "That's about " + v + ' a year.'; },
      same: 'About the same as now.', diff: function (v, less) { return "That's <b>" + v + ' a month ' + (less ? 'less' : 'more') + '</b> than you spend now.'; },
      excl: 'Excluding mortgage or rent, and excluding income tax. What you enter stays in this browser only.',
      ctaPlan: 'Talk your plans through with us', ctaHomes: 'See homes', ctaMort: 'Work out your mortgage too',
      expH: 'What is in these items?',
      exp: ['<b>IBI</b> is the annual municipal property tax, based on the cadastral value. <b>Basura</b> is the town\'s rubbish collection charge. The <b>comunidad</b> is the owners\' community fee, for apartments and for urbanisations with a shared pool or gardens.',
        'With healthcare through your pension you usually pay nothing extra in Spain; with the S1 form your cover runs through your home country. If you work in Spain, you pay contributions through your salary or as self-employed.',
        'Costs differ per town, per home and per year. Considering a specific home? Ask us for the real IBI, basura and comunidad amounts; we usually have them.'],
      disc: 'This calculator gives a first impression and is not financial advice. Amounts differ per home, town and year.',
      title: 'Monthly cost calculator: what does living in Spain cost?',
      desc: 'Work out what living on the southern Costa Blanca costs per month: home, energy, healthcare, school, car and daily life, and compare it with what you spend now.',
      teaserH: 'What does living here cost per month?', teaserP: 'Choose your home, household, school, healthcare and cars and see your monthly costs straight away, split by group and compared with now.', teaserBtn: 'Open the monthly cost calculator',
    },
    sv: {
      kicker: 'Flytta till Spanien', crumb: 'Månadskostnader',
      h: 'Månadskostnadskalkylator', lead: 'Det är inte köpesumman utan månadskostnaderna som avgör hur avslappnat livet här blir. Välj bostad och hushåll, justera beloppen och jämför med vad du betalar i dag.',
      sit: 'Din situation', woning: 'Typ av bostad',
      types: { apartment: 'Lägenhet', penthouse: 'Takvåning', bungalow: 'Bungalow', quadrant: 'Kedjehus (quad)', semi: 'Parhus', townhouse: 'Radhus', duplex: 'Duplex', villa: 'Fristående villa med pool', finca: 'Finca' },
      volw: 'Vuxna', kind: 'Barn', school: 'Skola', schools: { openbaar: 'Spansk kommunal skola', internationaal: 'Internationell skola' },
      zorg: 'Vård för vuxna', zorgs: { s1: 'Via din pension (S1-intyg)', werk: 'Via arbete i Spanien', particulier: 'Privat försäkring' },
      auto: 'Bilar',
      hint: 'Beloppen nedan är <b>exempelbelopp</b> att utgå från, inte genomsnitt. Byt ut dem mot verkliga belopp, till exempel från räkningarna för en bostad du funderar på.',
      items: 'Posterna', groups: ['Boende', 'Energi och vatten', 'Vård', 'Skola', 'Bil', 'Vardag'],
      labels: { ibi: 'IBI (kommunal fastighetsskatt)', basura: 'Sophämtning (basura)', comunidad: 'Comunidad (samfällighetsavgift)', verz: 'Hem- och byggnadsförsäkring', onderhoud: 'Underhåll av trädgård och pool', stroom: 'El (luftkonditionering och värme)', water: 'Vatten', gas: 'Gasol (butan)', internet: 'Internet och telefon', zorgV: 'Sjukförsäkring per vuxen', zorgK: 'Sjukförsäkring per barn', school: 'Skolkostnader per barn', autoVerz: 'Bilförsäkring per bil', autoBel: 'Fordonsskatt och besiktning (ITV) per bil', brandstof: 'Bränsle per bil', bood: 'Mat per vuxen', boodK: 'Mat per barn', vrij: 'Restaurang och fritid per vuxen' },
      pm: 'per månad', pj: 'per år', maal: { volw: ['vuxen', 'vuxna'], kind: ['barn', 'barn'], auto: ['bil', 'bilar'] },
      nuH: 'Jämför med i dag', nu: 'Vad betalar du för dessa poster per månad i dag?', nuPh: 'Till exempel 2400',
      nuHelp: 'Räkna ihop samma poster: boendekostnader utan bolån eller hyra, energi, vård, skola, bil och vardag.',
      reset: 'Tillbaka till exempelbeloppen',
      outK: 'Din uppskattning', outM: 'Per månad', year: function (v) { return 'Det är ungefär ' + v + ' per år.'; },
      same: 'Ungefär samma som i dag.', diff: function (v, less) { return 'Det är <b>' + v + ' per månad ' + (less ? 'mindre' : 'mer') + '</b> än du betalar i dag.'; },
      excl: 'Exklusive bolån eller hyra, och exklusive inkomstskatt. Det du fyller i stannar bara i den här webbläsaren.',
      ctaPlan: 'Prata igenom dina planer med oss', ctaHomes: 'Se bostäder', ctaMort: 'Räkna även på ditt bolån',
      expH: 'Vad ingår i posterna?',
      exp: ['<b>IBI</b> är den årliga kommunala fastighetsskatten, baserad på taxeringsvärdet. <b>Basura</b> är kommunens avgift för sophämtning. <b>Comunidad</b> är avgiften till ägarföreningen, för lägenheter och i urbanisationer med gemensam pool eller grönytor.',
        'Med vård via din pension betalar du oftast inget extra i Spanien; med S1-intyget går ditt skydd via ditt hemland. Arbetar du i Spanien betalar du avgifter via lönen eller som egenföretagare.',
        'Kostnaderna skiljer sig per kommun, bostad och år. Funderar du på en viss bostad? Fråga oss om de verkliga beloppen för IBI, basura och comunidad; dem har vi oftast.'],
      disc: 'Kalkylatorn ger ett första intryck och är ingen ekonomisk rådgivning. Beloppen skiljer sig per bostad, kommun och år.',
      title: 'Månadskostnadskalkylator: vad kostar det att bo i Spanien?',
      desc: 'Räkna ut vad det kostar att bo på södra Costa Blanca per månad: bostad, energi, vård, skola, bil och vardag, och jämför med vad du betalar i dag.',
      teaserH: 'Vad kostar det att bo här per månad?', teaserP: 'Välj bostad, hushåll, skola, vård och bilar och se dina månadskostnader direkt, uppdelade per grupp och jämförda med i dag.', teaserBtn: 'Öppna månadskostnadskalkylatorn',
    },
    es: {
      kicker: 'Vivir en España', crumb: 'Gastos mensuales',
      h: 'Calculadora de gastos mensuales', lead: 'No es el precio de compra, sino los gastos mensuales lo que decide lo tranquila que es la vida aquí. Elige tu vivienda y tu hogar, ajusta los importes y compáralos con lo que gastas ahora.',
      sit: 'Tu situación', woning: 'Tipo de vivienda',
      types: { apartment: 'Apartamento', penthouse: 'Ático', bungalow: 'Bungalow', quadrant: 'Quad (casa de cuatro)', semi: 'Pareado', townhouse: 'Adosado', duplex: 'Dúplex', villa: 'Villa independiente con piscina', finca: 'Finca' },
      volw: 'Adultos', kind: 'Niños', school: 'Colegio', schools: { openbaar: 'Colegio público español', internationaal: 'Colegio internacional' },
      zorg: 'Sanidad para adultos', zorgs: { s1: 'A través de tu pensión (formulario S1)', werk: 'A través de un trabajo en España', particulier: 'Seguro privado' },
      auto: 'Coches',
      hint: 'Los importes de abajo son <b>importes de ejemplo</b> para empezar, no medias. Sustitúyelos por cifras reales, por ejemplo de los recibos de una vivienda que estés valorando.',
      items: 'Las partidas', groups: ['Vivienda', 'Energía y agua', 'Sanidad', 'Colegio', 'Coche', 'Día a día'],
      labels: { ibi: 'IBI (impuesto municipal sobre bienes inmuebles)', basura: 'Tasa de basura', comunidad: 'Comunidad de propietarios', verz: 'Seguro de hogar (continente y contenido)', onderhoud: 'Mantenimiento de jardín y piscina', stroom: 'Electricidad (aire acondicionado y calefacción)', water: 'Agua', gas: 'Gas (butano)', internet: 'Internet y teléfono', zorgV: 'Seguro médico por adulto', zorgK: 'Seguro médico por niño', school: 'Gastos de colegio por niño', autoVerz: 'Seguro del coche por coche', autoBel: 'Impuesto de circulación e ITV por coche', brandstof: 'Combustible por coche', bood: 'Compra por adulto', boodK: 'Compra por niño', vrij: 'Comer fuera y ocio por adulto' },
      pm: 'al mes', pj: 'al año', maal: { volw: ['adulto', 'adultos'], kind: ['niño', 'niños'], auto: ['coche', 'coches'] },
      nuH: 'Compara con ahora', nu: '¿Cuánto gastas ahora al mes en estas partidas?', nuPh: 'Por ejemplo 2400',
      nuHelp: 'Suma las mismas partidas: gastos de vivienda sin hipoteca ni alquiler, energía, sanidad, colegio, coche y día a día.',
      reset: 'Volver a los importes de ejemplo',
      outK: 'Tu estimación', outM: 'Al mes', year: function (v) { return 'Eso son unos ' + v + ' al año.'; },
      same: 'Más o menos lo mismo que ahora.', diff: function (v, less) { return 'Son <b>' + v + ' al mes ' + (less ? 'menos' : 'más') + '</b> de lo que gastas ahora.'; },
      excl: 'Sin incluir hipoteca ni alquiler, ni el impuesto sobre la renta. Lo que introduces se queda solo en este navegador.',
      ctaPlan: 'Cuéntanos tus planes', ctaHomes: 'Ver viviendas', ctaMort: 'Calcula también tu hipoteca',
      expH: '¿Qué incluyen estas partidas?',
      exp: ['El <b>IBI</b> es el impuesto municipal anual sobre bienes inmuebles, calculado sobre el valor catastral. La <b>basura</b> es la tasa municipal de recogida de residuos. La <b>comunidad</b> es la cuota de la comunidad de propietarios, en apartamentos y en urbanizaciones con piscina o zonas verdes comunes.',
        'Con la sanidad a través de tu pensión normalmente no pagas nada extra en España; con el formulario S1 tu cobertura corre a cargo de tu país de origen. Si trabajas en España, cotizas a través de tu nómina o como autónomo.',
        'Los gastos varían según el municipio, la vivienda y el año. ¿Estás valorando una vivienda concreta? Pídenos los importes reales de IBI, basura y comunidad; normalmente los tenemos.'],
      disc: 'Esta calculadora da una primera impresión y no es asesoramiento financiero. Los importes varían según la vivienda, el municipio y el año.',
      title: 'Calculadora de gastos mensuales: ¿cuánto cuesta vivir en España?',
      desc: 'Calcula cuánto cuesta al mes vivir en la Costa Blanca Sur: vivienda, energía, sanidad, colegio, coche y día a día, y compáralo con lo que gastas ahora.',
      teaserH: '¿Cuánto cuesta vivir aquí al mes?', teaserP: 'Elige tu vivienda, tu hogar, colegio, sanidad y coches y ve al instante tus gastos mensuales, desglosados por grupo y comparados con ahora.', teaserBtn: 'Abre la calculadora de gastos mensuales',
    },
  };
  function L(lang) { return TX[lang] || TX.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(lang) { var f = new Intl.NumberFormat(LOCALE[lang] || 'en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }); return function (v) { return f.format(Math.round(v)); }; }

  function norm(st) {
    var s = {}; st = st || {};
    for (var k in DEF) s[k] = st[k] != null ? st[k] : DEF[k];
    if (PROFILE[s.woning] == null) s.woning = DEF.woning;
    if (['openbaar', 'internationaal'].indexOf(s.school) < 0) s.school = DEF.school;
    if (['s1', 'werk', 'particulier'].indexOf(s.zorg) < 0) s.zorg = DEF.zorg;
    s.volw = Math.min(8, Math.max(1, parseInt(s.volw, 10) || 1));
    s.kind = Math.min(8, Math.max(0, parseInt(s.kind, 10) || 0));
    s.auto = Math.min(4, Math.max(0, parseInt(s.auto, 10) || 0));
    s.custom = s.custom && typeof s.custom === 'object' ? s.custom : {};
    return s;
  }
  function standard(p, s) {
    if (p.w) return p.w[PROFILE[s.woning]];
    if (p.zorg) return p.zorg[s.zorg];
    if (p.school) return p.school[s.school];
    return p.v;
  }
  function amount(p, s) { var c = s.custom[p.id]; return c != null && isFinite(c) ? Math.max(0, +c) : standard(p, s); }
  // -> { total, groups: [per groep per maand], rows: {id: {amount, n, visible, monthly}} }
  function calc(st) {
    var s = norm(st), groups = [0, 0, 0, 0, 0, 0], total = 0, rows = {};
    ITEMS.forEach(function (p) {
      var n = p.maal ? s[p.maal] : 1, b = amount(p, s), vis = n > 0, m = vis ? (p.per === 'j' ? b / 12 : b) * n : 0;
      rows[p.id] = { amount: b, n: n, visible: vis, monthly: m };
      groups[p.g] += m; total += m;
    });
    return { s: s, total: total, groups: groups, rows: rows };
  }

  function opt(v, label, sel) { return '<option value="' + v + '"' + (v === sel ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function maalTxt(t, p, n) { return p.maal ? ' × ' + n + ' ' + t.maal[p.maal][n === 1 ? 0 : 1] : ''; }
  function barsHtml(t, r, f) {
    var max = Math.max.apply(null, r.groups.concat([1]));
    return r.groups.map(function (v, i) {
      return v > 0 ? '<li><span class="ml-bl">' + esc(t.groups[i]) + '</span><span class="ml-bv">' + f(v) + '</span><span class="ml-bar" aria-hidden="true"><i style="width:' + Math.max(3, Math.round(v / max * 100)) + '%"></i></span></li>' : '';
    }).join('');
  }

  // h = { move, home, buy, contact } (paden in de taal van de pagina). st = opgeslagen invoer (of leeg = voorbeeld).
  function html(lang, h, st) {
    var t = L(lang), r = calc(st), s = r.s, f = fmt(lang);
    var groups = t.groups.map(function (g, gi) {
      var rows = ITEMS.filter(function (p) { return p.g === gi; }).map(function (p) {
        var row = r.rows[p.id];
        return '<div class="ml-row ml-post" data-post="' + p.id + '"' + (row.visible ? '' : ' hidden') + '><label for="ml_' + p.id + '">' + esc(t.labels[p.id]) +
          '<small class="ml-maal" id="ml_' + p.id + '_m">' + esc(maalTxt(t, p, row.n)) + '</small></label>' +
          '<span class="ml-eur"><span aria-hidden="true">€</span><input id="ml_' + p.id + '" data-id="' + p.id + '" type="number" min="0" step="5" inputmode="numeric" value="' + row.amount + '" aria-describedby="ml_' + p.id + '_m"' + (s.custom[p.id] != null ? ' class="eigen"' : '') + '><span class="ml-per">' + (p.per === 'j' ? t.pj : t.pm) + '</span></span></div>';
      }).join('');
      var any = ITEMS.some(function (p) { return p.g === gi && r.rows[p.id].visible; });
      return '<div class="ml-groep" data-groep="' + gi + '"' + (any ? '' : ' hidden') + '><p class="ml-gt">' + esc(g) + '</p>' + rows + '</div>';
    }).join('');
    var nu = parseFloat(s.nu), d = nu > 0 ? Math.round(nu - r.total) : null;
    return '<section class="page-hero short ml-hero"><div><p class="kicker"><a href="' + h.move + '">' + esc(t.kicker) + '</a> › ' + esc(t.crumb) + '</p><h1>' + esc(t.h) + '</h1><p>' + esc(t.lead) + '</p></div></section>' +
      '<div class="pg"><div class="ml" id="ml">' +
      '<form class="ml-in" id="mlForm" novalidate>' +
      '<fieldset class="box"><legend>' + esc(t.sit) + '</legend>' +
      '<div class="ml-row"><label for="mlWoning">' + esc(t.woning) + '</label><select id="mlWoning" name="woning">' + TYPES.map(function (x) { return opt(x[0], t.types[x[0]], s.woning); }).join('') + '</select></div>' +
      '<div class="ml-row"><label for="mlVolw">' + esc(t.volw) + '</label><input id="mlVolw" name="volw" type="number" min="1" max="8" step="1" value="' + s.volw + '" inputmode="numeric"></div>' +
      '<div class="ml-row"><label for="mlKind">' + esc(t.kind) + '</label><input id="mlKind" name="kind" type="number" min="0" max="8" step="1" value="' + s.kind + '" inputmode="numeric"></div>' +
      '<div class="ml-row" data-als-kind' + (s.kind ? '' : ' hidden') + '><label for="mlSchool">' + esc(t.school) + '</label><select id="mlSchool" name="school">' + opt('openbaar', t.schools.openbaar, s.school) + opt('internationaal', t.schools.internationaal, s.school) + '</select></div>' +
      '<div class="ml-row"><label for="mlZorg">' + esc(t.zorg) + '</label><select id="mlZorg" name="zorg">' + opt('s1', t.zorgs.s1, s.zorg) + opt('werk', t.zorgs.werk, s.zorg) + opt('particulier', t.zorgs.particulier, s.zorg) + '</select></div>' +
      '<div class="ml-row"><label for="mlAuto">' + esc(t.auto) + '</label><input id="mlAuto" name="auto" type="number" min="0" max="4" step="1" value="' + s.auto + '" inputmode="numeric"></div>' +
      '</fieldset>' +
      '<p class="ml-hint">' + t.hint + '</p>' +
      '<fieldset class="box" id="mlPosten"><legend>' + esc(t.items) + '</legend>' + groups + '</fieldset>' +
      '<fieldset class="box"><legend>' + esc(t.nuH) + '</legend>' +
      '<div class="ml-row"><label for="mlNu">' + esc(t.nu) + '</label><span class="ml-eur"><span aria-hidden="true">€</span><input id="mlNu" name="nu" type="number" min="0" step="10" placeholder="' + esc(t.nuPh) + '" value="' + esc(s.nu) + '" inputmode="numeric"><span class="ml-per">' + t.pm + '</span></span></div>' +
      '<p class="ml-help">' + esc(t.nuHelp) + '</p></fieldset>' +
      '<button type="button" class="btn ghost ml-reset" id="mlReset">' + esc(t.reset) + '</button>' +
      '</form>' +
      '<aside class="ml-uit" aria-live="polite" aria-labelledby="mlTotT">' +
      '<p class="kicker">' + esc(t.outK) + '</p>' +
      '<p class="ml-tot"><span id="mlTotT">' + esc(t.outM) + '</span><b id="mlTot">' + f(r.total) + '</b></p>' +
      '<p class="ml-jaar" id="mlJaar">' + esc(t.year(f(r.total * 12))) + '</p>' +
      '<ul class="ml-bars" id="mlBars">' + barsHtml(t, r, f) + '</ul>' +
      '<p class="ml-verg" id="mlVerg"' + (d == null ? ' hidden' : '') + '>' + (d == null ? '' : d === 0 ? esc(t.same) : t.diff(f(Math.abs(d)), d > 0)) + '</p>' +
      '<p class="ml-excl">' + esc(t.excl) + '</p>' +
      '<a class="btn lemon" href="' + h.move + '#moveForm">' + esc(t.ctaPlan) + '</a>' +
      '<a class="btn ghost" href="' + h.home + '">' + esc(t.ctaHomes) + '</a>' +
      '<a class="ml-link" href="' + h.buy + '">' + esc(t.ctaMort) + ' →</a>' +
      '</aside></div>' +
      '<section class="ml-exp"><h2 class="pg-h">' + esc(t.expH) + '</h2>' + t.exp.map(function (x) { return '<p>' + x + '</p>'; }).join('') +
      '<p class="disclaimer">' + esc(t.disc) + '</p></section></div>';
  }

  // blokje op de Emigreren-pagina dat naar de calculator verwijst
  function teaser(lang, href) {
    var t = L(lang);
    return '<a class="ml-teaser" href="' + href + '"><span class="ml-teaser-ico" aria-hidden="true">€</span><span><b>' + esc(t.teaserH) + '</b><span>' + esc(t.teaserP) + '</span></span><span class="btn lemon">' + esc(t.teaserBtn) + '</span></a>';
  }

  // root = element met de calculator (main). store = { get(), set(state) } (localStorage in de app). onChange(state) optioneel.
  function bind(root, lang, store, onChange) {
    var form = root.querySelector('#mlForm'), box = root.querySelector('#mlPosten');
    if (!form || !box) return;
    var t = L(lang), f = fmt(lang);
    var S = norm(store && store.get ? store.get() : null);
    var $ = function (sel) { return root.querySelector(sel); };
    function read() {
      ['woning', 'school', 'zorg', 'volw', 'kind', 'auto'].forEach(function (n) { S[n] = form.elements[n].value; });
      S.nu = form.elements.nu.value;
    }
    function render() {
      var r = calc(S);
      S.volw = r.s.volw; S.kind = r.s.kind; S.auto = r.s.auto; // grenzen bewaken, maar het veld niet overschrijven tijdens typen
      root.querySelectorAll('[data-als-kind]').forEach(function (el) { el.hidden = r.s.kind === 0; });
      ITEMS.forEach(function (p) {
        var row = r.rows[p.id], el = box.querySelector('[data-post="' + p.id + '"]'), inp = el.querySelector('input');
        el.hidden = !row.visible;
        if (document.activeElement !== inp) inp.value = row.amount;
        inp.classList.toggle('eigen', S.custom[p.id] != null);
        el.querySelector('.ml-maal').textContent = maalTxt(t, p, row.n);
      });
      box.querySelectorAll('.ml-groep').forEach(function (g) { g.hidden = !g.querySelector('.ml-post:not([hidden])'); });
      $('#mlTot').textContent = f(r.total);
      $('#mlJaar').textContent = t.year(f(r.total * 12));
      $('#mlBars').innerHTML = barsHtml(t, r, f);
      var nu = parseFloat(S.nu), v = $('#mlVerg');
      if (nu > 0) { var d = Math.round(nu - r.total); v.hidden = false; v.innerHTML = d === 0 ? esc(t.same) : t.diff(f(Math.abs(d)), d > 0); }
      else v.hidden = true;
      if (store && store.set) store.set(S);
    }
    form.addEventListener('input', function (e) {
      var id = e.target.getAttribute('data-id');
      if (id) { var v = parseFloat(e.target.value); if (isNaN(v)) delete S.custom[id]; else S.custom[id] = Math.max(0, v); }
      else read();
      render();
    });
    form.addEventListener('change', function (e) { if (!e.target.getAttribute('data-id')) read(); render(); if (onChange) onChange(e.target.name || 'post'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $('#mlReset').addEventListener('click', function () { S.custom = {}; render(); if (onChange) onChange('reset'); });
    // de opgeslagen situatie in de velden zetten (de statische pagina toont het voorbeeld)
    ['woning', 'school', 'zorg', 'volw', 'kind', 'auto', 'nu'].forEach(function (n) { if (form.elements[n]) form.elements[n].value = S[n]; });
    render();
  }

  root.COSTS = { html: html, teaser: teaser, bind: bind, calc: calc, text: L };
})(typeof self !== 'undefined' ? self : this);
