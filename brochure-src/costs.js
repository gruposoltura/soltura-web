// Soltura kosten-infotorial (A4, 2 pagina's) in de huisstijl van de woningbrochure en de woon- en koopgids.
// Een uiteenzetting van de bijkomende kosten bij een aankoop en waarom ze betaald worden. GEEN eigen bedragen of tarieven
// (concurrentie, Rick 24-10-2026); alleen de wettelijke belastingpercentages uit web_config (data.cfg).
// De makelaar van de woning bespreekt de specifieke kosten persoonlijk (leadcard).
// buildCosts(data, lang, A) -> HTML. data = brochure_data(ref) (p, geo, reviews, cfg). A = asset-basis (logo's).
// Zonder woning (data.p leeg) ontstaat de ALGEMENE versie: het statische document in /downloads (Rick 24-10-2026: net als de
// koopgids één vast PDF per taal, als downloadlink in de mail). Beide belastingvarianten en een algemeen contactblok.
// A.qr (optioneel) vervangt de QR-dienst, voor een render zonder netwerk.
function buildCosts(data, lang, A) {
  const p = (data && data.p) || {}, rev = (data && data.reviews) || {}, cfg = (data && data.cfg) || {};
  const L = ['nl', 'en', 'es', 'sv'].includes(lang) ? lang : 'en';
  const pct = v => String(Number(v)).replace('.', L === 'en' ? '.' : ',') + (L === 'sv' ? '\u00a0%' : '%');
  const ITP = cfg.itp_resale_pct != null ? pct(cfg.itp_resale_pct) : null;
  const IVA = cfg.iva_newbuild_pct != null ? pct(cfg.iva_newbuild_pct) : null;
  const AJD = cfg.ajd_newbuild_pct != null ? pct(cfg.ajd_newbuild_pct) : null;
  const isNew = p.is_newbuild === true;
  const generic = !p.reference;
  const T = {
    nl: {
      genH: 'Bestaande bouw of nieuwbouw?', genP: 'Welke belasting je betaalt, hangt af van de woning: bij bestaande bouw overdrachtsbelasting (ITP), bij nieuwbouw btw (IVA) en zegelrecht (AJD).', agKg: 'De bedragen voor jouw woning', agPg: 'Je makelaar neemt de specifieke kosten van jouw woning persoonlijk met je door: welke belasting geldt, wat er in jouw situatie bijkomt en wat onze all-in fee is.', office2: 'Kantoor Formentera del Segura',
      kicker: 'Kostenoverzicht', title: 'Wat komt er bij de <em>prijs</em>?',
      lead: 'Naast de koopprijs betaal je in Spanje belastingen en een aantal kosten voor de juridische afhandeling. Hier lees je welke kosten dat zijn, waarom ze er zijn en wat wij voor je regelen. De precieze bedragen hangen af van de woning en van jouw situatie: die neemt je makelaar persoonlijk met je door.',
      thisHome: 'Deze woning', resale: 'Bestaande bouw', newb: 'Nieuwbouw',
      homeTax: isNew ? 'Bij nieuwbouw betaal je btw (IVA) en zegelrecht (AJD).' : 'Bij bestaande bouw betaal je overdrachtsbelasting (ITP).',
      taxH: 'Belastingen bij de aankoop', tagTax: 'Belasting', ofPrice: 'van de koopprijs',
      itpH: 'Overdrachtsbelasting (ITP)', itpWhy: 'Belasting van de regio Valencia op de aankoop van een bestaande woning. Je betaalt hem na het tekenen bij de notaris via de aangifte Modelo 600; die aangifte verzorgen wij.',
      ivaH: 'Btw (IVA)', ivaWhy: 'Bij de eerste verkoop van een nieuwe woning door een ontwikkelaar betaal je btw in plaats van overdrachtsbelasting. Je betaalt hem mee met de termijnen aan de ontwikkelaar.',
      ajdH: 'Zegelrecht (AJD)', ajdWhy: 'Belasting van de regio Valencia op de notariële akte bij nieuwbouw. Ook deze aangifte verzorgen wij.',
      taxNote: 'In bijzondere situaties kan een ander tarief gelden. Je makelaar controleert welk tarief voor jouw aankoop geldt.',
      allinK: 'Onze werkwijze', allinH: 'Eén vaste <em>all-in fee</em>', allinP: 'Veel kantoren rekenen advocaat, notaris, eigendomsregister, NIE en volmacht los af, en dan weet je pas achteraf wat het kost. Bij ons valt de juridische afhandeling onder één vast tarief dat je vooraf kent.',
      tagIn: 'In onze all-in fee',
      inH: 'Juridische afhandeling', inItems: [
        ['scale', 'Advocaat en juridische controles', 'We controleren of er schulden, hypotheken of beslagen op de woning rusten, of hij legaal gebouwd en ingeschreven is, en we stellen de contracten op en controleren ze. Zo koop je vrij van lasten.'],
        ['stamp', 'Notaris', 'In Spanje gaat een woning over via een notariële akte (escritura). De notaris controleert identiteit, betalingen en de akte en leest die met je door.'],
        ['book', 'Eigendomsregister', 'Pas als je naam in het Registro de la Propiedad staat, ben je ook tegenover derden beschermd als eigenaar.'],
        ['id', 'NIE / fiscaal nummer', 'Zonder NIE geen akte, geen belastingaangifte, geen bankrekening en geen nutsvoorzieningen op je naam.'],
        ['pen', 'Volmacht, als je dat wilt', 'Kun je niet zelf tekenen, dan regelen we de aankoop met een volmacht, zodat je er op de tekendatum niet bij hoeft te zijn.'],
        ['chat', 'Vertaling en begeleiding bij de notaris', 'We vertalen de stukken en zijn erbij als je tekent, zodat je alleen tekent wat je begrijpt.'],
        ['doc', 'Aangiften na de aankoop', 'De verplichte aangiften na de aankoop (Modelo 600, en indien nodig Modelo 211) dienen wij voor je in.'],
      ],
      sitH: 'Afhankelijk van jouw situatie', tagThird: 'Derden',
      sitItems: [
        ['euro', 'Hypotheek', 'Financier je in Spanje, dan laat de bank de woning taxeren (tasación) en kan zij afsluitkosten rekenen. De notaris- en registerkosten en de belasting op de hypotheekakte betaalt sinds 2019 de bank.'],
        ['globe', 'Volmacht in je eigen land', 'Teken je de volmacht bij een notaris in je eigen land, dan komen daar diens kosten, een apostille en een beëdigde vertaling bij.'],
        ['bank', 'Bank en geldoverboeking', 'Een Spaanse bankrekening is nodig voor de aankoop en de vaste lasten. Je bank kan kosten rekenen voor de rekening, een internationale overboeking of het wisselen van valuta.'],
        ['plug', 'Nutsvoorzieningen', 'Water, stroom en eventueel gas zetten wij op je naam. De leverancier kan daarvoor eenmalige kosten of een borg vragen.'],
        ['shield', 'Woonhuisverzekering', 'Verstandig vanaf de eerste dag, voor opstal en inboedel. Met een hypotheek is een opstalverzekering verplicht.'],
        ['split', '3% inhouding bij een verkoper uit het buitenland', 'Woont de verkoper niet in Spanje, dan houd je 3% van de koopprijs in en betaal je die namens hem aan de Spaanse fiscus (Modelo 211). Dat zijn geen extra kosten: het is een deel van de koopprijs.'],
      ],
      afterH: 'Na de aankoop: vaste lasten', after: ['IBI (gemeentelijke onroerendgoedbelasting)', 'Afvalheffing (basura)', 'Bijdrage vereniging van eigenaren (comunidad), indien van toepassing', 'Verzekering, water en stroom', 'Inkomstenbelasting voor niet-residenten (Modelo 210), als je niet in Spanje woont'],
      afterP: 'Reken je maandlasten uit met onze calculator.',
      whenH: 'Wanneer betaal je wat?', when: isNew
        ? [['Reservering', 'Een aanbetaling haalt de woning uit de verkoop.'], ['Koopcontract', 'Met de ontwikkelaar spreek je betalingen in termijnen af tijdens de bouw.'], ['Notaris', 'Bij oplevering teken je de akte en betaal je het restant.'], ['Na de akte', 'Daarna volgen het zegelrecht en de inschrijving in het register.']]
        : [['Reservering', 'Een aanbetaling haalt de woning uit de verkoop.'], ['Koopcontract (arras)', 'Bij het voorlopige koopcontract betaal je een deel van de koopprijs, meestal 10%.'], ['Notaris', 'Bij de akte betaal je het restant van de koopprijs.'], ['Na de akte', 'Daarna volgen de overdrachtsbelasting en de inschrijving in het register.']],
      agK: 'De bedragen voor deze woning', agP: n => `${n} neemt de specifieke kosten van deze woning persoonlijk met je door: welke belasting geldt, wat er in jouw situatie bijkomt en wat onze all-in fee is.`,
      since: 'actief sinds', reviews: 'Google-reviews', api: 'API-lid nr.', allin: 'all-in fee, vooraf afgesproken',
      disc: 'Deze uiteenzetting is algemeen en indicatief, gebaseerd op de regels in de regio Valencia op het moment van opmaak. Er kunnen geen rechten aan worden ontleend. Je makelaar bevestigt de kosten voor jouw aankoop.',
      office: 'Kantoor', officeHours: 'ma–vr 10:00–14:00, en op afspraak', roleP: 'Partner, verkoop', roleS: '(After) sales', roleO: 'Grupo Soltura Real Estate', calc: 'Maandlastencalculator',
    },
    en: {
      genH: 'Resale or new build?', genP: 'Which tax you pay depends on the home: transfer tax (ITP) for a resale home, VAT (IVA) and stamp duty (AJD) for a new build.', agKg: 'The amounts for your home', agPg: 'Your agent will go through the specific costs of your home with you personally: which tax applies, what comes on top in your situation and what our all-in fee is.', office2: 'Office Formentera del Segura',
      kicker: 'Cost overview', title: 'What comes on top of the <em>price</em>?',
      lead: 'Besides the purchase price, buying a home in Spain involves taxes and a number of costs for the legal side of the purchase. Here you can read which costs these are, why they exist and what we take care of for you. The exact amounts depend on the home and on your situation: your agent will go through them with you personally.',
      thisHome: 'This home', resale: 'Resale', newb: 'New build',
      homeTax: isNew ? 'For a new build you pay VAT (IVA) and stamp duty (AJD).' : 'For a resale home you pay transfer tax (ITP).',
      taxH: 'Taxes on the purchase', tagTax: 'Tax', ofPrice: 'of the purchase price',
      itpH: 'Transfer tax (ITP)', itpWhy: 'A tax of the Valencia region on buying an existing home. You pay it after signing at the notary through the Modelo 600 return; we file that return for you.',
      ivaH: 'VAT (IVA)', ivaWhy: 'On the first sale of a new home by a developer you pay VAT instead of transfer tax. It is paid together with the instalments to the developer.',
      ajdH: 'Stamp duty (AJD)', ajdWhy: 'A tax of the Valencia region on the notarial deed of a new build. We file this return for you too.',
      taxNote: 'A different rate can apply in special situations. Your agent checks which rate applies to your purchase.',
      allinK: 'How we work', allinH: 'One fixed <em>all-in fee</em>', allinP: 'Many agencies charge the lawyer, notary, land registry, NIE and power of attorney separately, so you only find out the total afterwards. With us, the legal side of the purchase falls under one fixed fee that you know up front.',
      tagIn: 'In our all-in fee',
      inH: 'The legal side', inItems: [
        ['scale', 'Lawyer and legal checks', 'We check for debts, mortgages or charges on the home, whether it was built and registered legally, and we draw up and check the contracts. So you buy free of burdens.'],
        ['stamp', 'Notary', 'In Spain a home changes hands through a notarial deed (escritura). The notary checks identities, payments and the deed and reads it through with you.'],
        ['book', 'Land registry', 'Only once your name is in the Registro de la Propiedad are you protected as the owner against third parties too.'],
        ['id', 'NIE / tax number', 'Without an NIE there is no deed, no tax return, no bank account and no utilities in your name.'],
        ['pen', 'Power of attorney, if you wish', 'If you cannot sign in person, we complete the purchase with a power of attorney, so you do not need to be here on the signing date.'],
        ['chat', 'Translation and support at the notary', 'We translate the documents and are with you when you sign, so you only sign what you understand.'],
        ['doc', 'Tax returns after the purchase', 'We file the required returns after the purchase (Modelo 600, and Modelo 211 where needed) for you.'],
      ],
      sitH: 'Depending on your situation', tagThird: 'Third parties',
      sitItems: [
        ['euro', 'Mortgage', 'If you finance in Spain, the bank has the home valued (tasación) and may charge an arrangement fee. Since 2019 the bank pays the notary and registry costs and the tax on the mortgage deed.'],
        ['globe', 'Power of attorney in your own country', 'If you sign the power of attorney at a notary in your own country, add that notary\'s fees, an apostille and a sworn translation.'],
        ['bank', 'Bank and money transfer', 'You need a Spanish bank account for the purchase and the running costs. Your bank may charge for the account, an international transfer or currency exchange.'],
        ['plug', 'Utilities', 'We put water, electricity and gas, if any, in your name. The supplier may ask a one-off fee or a deposit for this.'],
        ['shield', 'Home insurance', 'Wise from day one, for buildings and contents. With a mortgage, buildings insurance is compulsory.'],
        ['split', '3% retention if the seller lives abroad', 'If the seller is not resident in Spain, you withhold 3% of the price and pay it to the Spanish tax office on their behalf (Modelo 211). This is not an extra cost: it is part of the price.'],
      ],
      afterH: 'After the purchase: running costs', after: ['IBI (municipal property tax)', 'Rubbish collection tax (basura)', 'Community of owners fee (comunidad), if applicable', 'Insurance, water and electricity', 'Non-resident income tax (Modelo 210), if you do not live in Spain'],
      afterP: 'Work out your monthly costs with our calculator.',
      whenH: 'When do you pay what?', when: isNew
        ? [['Reservation', 'A deposit takes the home off the market.'], ['Purchase contract', 'You agree stage payments with the developer during construction.'], ['Notary', 'On completion you sign the deed and pay the balance.'], ['After the deed', 'Then the stamp duty and the land registry follow.']]
        : [['Reservation', 'A deposit takes the home off the market.'], ['Purchase contract (arras)', 'With the private purchase contract you pay part of the price, usually 10%.'], ['Notary', 'At the deed you pay the balance of the price.'], ['After the deed', 'Then the transfer tax and the land registry follow.']],
      agK: 'The amounts for this home', agP: n => `${n} will go through the specific costs of this home with you personally: which tax applies, what comes on top in your situation and what our all-in fee is.`,
      since: 'active since', reviews: 'Google reviews', api: 'API member no.', allin: 'all-in fee, agreed up front',
      disc: 'This overview is general and indicative, based on the rules in the Valencia region at the time of writing. No rights can be derived from it. Your agent confirms the costs for your purchase.',
      office: 'Office', officeHours: 'Mon–Fri 10:00–14:00, and by appointment', roleP: 'Partner, sales', roleS: '(After) sales', roleO: 'Grupo Soltura Real Estate', calc: 'Monthly cost calculator',
    },
    es: {
      genH: '¿Segunda mano u obra nueva?', genP: 'El impuesto depende de la vivienda: ITP en segunda mano, IVA y AJD en obra nueva.', agKg: 'Los importes de tu vivienda', agPg: 'Tu agente repasa contigo personalmente los gastos concretos de tu vivienda: qué impuesto se aplica, qué se suma en tu situación y cuál es nuestra tarifa todo incluido.', office2: 'Oficina Formentera del Segura',
      kicker: 'Resumen de gastos', title: '¿Qué se suma al <em>precio</em>?',
      lead: 'Además del precio de compra, al comprar una vivienda en España pagas impuestos y algunos gastos por la parte jurídica de la compra. Aquí lees qué gastos son, por qué existen y de qué nos encargamos nosotros. Los importes exactos dependen de la vivienda y de tu situación: tu agente los repasa contigo personalmente.',
      thisHome: 'Esta vivienda', resale: 'Segunda mano', newb: 'Obra nueva',
      homeTax: isNew ? 'En obra nueva pagas IVA y Actos Jurídicos Documentados (AJD).' : 'En segunda mano pagas el Impuesto de Transmisiones Patrimoniales (ITP).',
      taxH: 'Impuestos de la compra', tagTax: 'Impuesto', ofPrice: 'del precio de compra',
      itpH: 'Transmisiones Patrimoniales (ITP)', itpWhy: 'Impuesto de la Comunitat Valenciana sobre la compra de una vivienda de segunda mano. Se paga después de firmar en la notaría mediante el Modelo 600; nosotros presentamos la declaración.',
      ivaH: 'IVA', ivaWhy: 'En la primera venta de una vivienda nueva por un promotor pagas IVA en lugar de ITP. Se paga junto con los pagos al promotor.',
      ajdH: 'Actos Jurídicos Documentados (AJD)', ajdWhy: 'Impuesto de la Comunitat Valenciana sobre la escritura notarial de una obra nueva. También presentamos esta declaración.',
      taxNote: 'En situaciones especiales puede aplicarse otro tipo. Tu agente comprueba qué tipo se aplica a tu compra.',
      allinK: 'Cómo trabajamos', allinH: 'Una <em>tarifa única</em> todo incluido', allinP: 'Muchas agencias cobran por separado abogado, notaría, registro, NIE y poder, y el total solo lo sabes al final. Con nosotros, la parte jurídica de la compra va en una tarifa fija que conoces de antemano.',
      tagIn: 'En nuestra tarifa',
      inH: 'La parte jurídica', inItems: [
        ['scale', 'Abogado y comprobaciones legales', 'Comprobamos si la vivienda tiene deudas, hipotecas o cargas, si está construida e inscrita legalmente, y redactamos y revisamos los contratos. Así compras libre de cargas.'],
        ['stamp', 'Notaría', 'En España la vivienda se transmite mediante escritura notarial. El notario comprueba identidades, pagos y la escritura y la lee contigo.'],
        ['book', 'Registro de la Propiedad', 'Solo cuando tu nombre consta en el Registro de la Propiedad estás protegido como propietario también frente a terceros.'],
        ['id', 'NIE', 'Sin NIE no hay escritura, ni declaración de impuestos, ni cuenta bancaria, ni suministros a tu nombre.'],
        ['pen', 'Poder notarial, si lo deseas', 'Si no puedes firmar en persona, completamos la compra con un poder, para que no tengas que estar aquí el día de la firma.'],
        ['chat', 'Traducción y acompañamiento en la notaría', 'Traducimos los documentos y te acompañamos en la firma, para que solo firmes lo que entiendes.'],
        ['doc', 'Declaraciones tras la compra', 'Presentamos por ti las declaraciones obligatorias tras la compra (Modelo 600 y, si procede, Modelo 211).'],
      ],
      sitH: 'Según tu situación', tagThird: 'Terceros',
      sitItems: [
        ['euro', 'Hipoteca', 'Si financias en España, el banco tasa la vivienda (tasación) y puede cobrar una comisión de apertura. Desde 2019 el banco paga la notaría, el registro y el impuesto de la escritura de hipoteca.'],
        ['globe', 'Poder en tu país', 'Si firmas el poder ante un notario de tu país, se suman sus honorarios, la apostilla y una traducción jurada.'],
        ['bank', 'Banco y transferencias', 'Necesitas una cuenta en España para la compra y los gastos fijos. Tu banco puede cobrar por la cuenta, una transferencia internacional o el cambio de divisa.'],
        ['plug', 'Suministros', 'Ponemos agua, luz y, si hay, gas a tu nombre. La compañía puede pedir un pago único o una fianza.'],
        ['shield', 'Seguro de hogar', 'Recomendable desde el primer día, para continente y contenido. Con hipoteca, el seguro de continente es obligatorio.'],
        ['split', 'Retención del 3% si el vendedor no es residente', 'Si el vendedor no reside en España, retienes el 3% del precio y lo ingresas en Hacienda en su nombre (Modelo 211). No es un gasto adicional: forma parte del precio.'],
      ],
      afterH: 'Después de la compra: gastos fijos', after: ['IBI (impuesto municipal)', 'Tasa de basura', 'Cuota de la comunidad de propietarios, si procede', 'Seguro, agua y luz', 'IRNR para no residentes (Modelo 210), si no vives en España'],
      afterP: 'Calcula tus gastos mensuales con nuestra calculadora.',
      whenH: '¿Cuándo pagas qué?', when: isNew
        ? [['Reserva', 'Una señal retira la vivienda del mercado.'], ['Contrato de compra', 'Con el promotor acuerdas pagos por fases durante la obra.'], ['Notaría', 'A la entrega firmas la escritura y pagas el resto.'], ['Tras la escritura', 'Después llegan el AJD y la inscripción en el Registro.']]
        : [['Reserva', 'Una señal retira la vivienda del mercado.'], ['Contrato de arras', 'Con el contrato privado pagas una parte del precio, normalmente el 10%.'], ['Notaría', 'En la escritura pagas el resto del precio.'], ['Tras la escritura', 'Después llegan el ITP y la inscripción en el Registro.']],
      agK: 'Los importes de esta vivienda', agP: n => `${n} repasa contigo personalmente los gastos concretos de esta vivienda: qué impuesto se aplica, qué se suma en tu situación y cuál es nuestra tarifa todo incluido.`,
      since: 'activos desde', reviews: 'reseñas en Google', api: 'API nº', allin: 'tarifa todo incluido, acordada de antemano',
      disc: 'Este resumen es general y orientativo, basado en las normas de la Comunitat Valenciana en el momento de su redacción. No genera derechos. Tu agente confirma los gastos de tu compra.',
      office: 'Oficina', officeHours: 'lun–vie 10:00–14:00, y con cita previa', roleP: 'Socio, ventas', roleS: 'Posventa', roleO: 'Grupo Soltura Real Estate', calc: 'Calculadora de gastos',
    },
    sv: {
      genH: 'Befintlig bostad eller nyproduktion?', genP: 'Vilken skatt du betalar beror på bostaden: överlåtelseskatt (ITP) för en befintlig bostad, moms (IVA) och stämpelskatt (AJD) för nyproduktion.', agKg: 'Beloppen för din bostad', agPg: 'Din mäklare går personligen igenom de specifika kostnaderna för din bostad med dig: vilken skatt som gäller, vad som tillkommer i din situation och vad vårt allt-i-ett-arvode är.', office2: 'Kontor Formentera del Segura',
      kicker: 'Kostnadsöversikt', title: 'Vad tillkommer utöver <em>priset</em>?',
      lead: 'Utöver köpeskillingen betalar du i Spanien skatter och en del kostnader för den juridiska delen av köpet. Här kan du läsa vilka kostnader det är, varför de finns och vad vi tar hand om åt dig. De exakta beloppen beror på bostaden och din situation: din mäklare går igenom dem med dig personligen.',
      thisHome: 'Den här bostaden', resale: 'Befintlig bostad', newb: 'Nyproduktion',
      homeTax: isNew ? 'För nyproduktion betalar du moms (IVA) och stämpelskatt (AJD).' : 'För en befintlig bostad betalar du överlåtelseskatt (ITP).',
      taxH: 'Skatter vid köpet', tagTax: 'Skatt', ofPrice: 'av köpeskillingen',
      itpH: 'Överlåtelseskatt (ITP)', itpWhy: 'En skatt i regionen Valencia vid köp av en befintlig bostad. Du betalar den efter undertecknandet hos notarien via blanketten Modelo 600; den deklarationen sköter vi.',
      ivaH: 'Moms (IVA)', ivaWhy: 'Vid den första försäljningen av en ny bostad från en byggherre betalar du moms i stället för överlåtelseskatt. Den betalas tillsammans med delbetalningarna till byggherren.',
      ajdH: 'Stämpelskatt (AJD)', ajdWhy: 'En skatt i regionen Valencia på det notariella köpebrevet vid nyproduktion. Även den deklarationen sköter vi.',
      taxNote: 'I särskilda situationer kan en annan skattesats gälla. Din mäklare kontrollerar vilken som gäller för ditt köp.',
      allinK: 'Så arbetar vi', allinH: 'Ett fast <em>allt-i-ett-arvode</em>', allinP: 'Många byråer tar betalt separat för advokat, notarie, fastighetsregister, NIE och fullmakt, och först efteråt vet du vad det kostade. Hos oss ingår den juridiska delen av köpet i ett fast arvode som du känner till i förväg.',
      tagIn: 'Ingår i vårt arvode',
      inH: 'Den juridiska delen', inItems: [
        ['scale', 'Advokat och juridiska kontroller', 'Vi kontrollerar om det finns skulder, lån eller belastningar på bostaden, om den är lagligt byggd och registrerad, och vi upprättar och granskar avtalen. Så köper du fritt från belastningar.'],
        ['stamp', 'Notarie', 'I Spanien övergår en bostad genom ett notariellt köpebrev (escritura). Notarien kontrollerar identitet, betalningar och köpebrevet och läser igenom det med dig.'],
        ['book', 'Fastighetsregistret', 'Först när ditt namn står i Registro de la Propiedad är du skyddad som ägare även gentemot tredje part.'],
        ['id', 'NIE / skattenummer', 'Utan NIE inget köpebrev, ingen skattedeklaration, inget bankkonto och inga abonnemang i ditt namn.'],
        ['pen', 'Fullmakt, om du vill', 'Kan du inte skriva under själv genomför vi köpet med en fullmakt, så att du inte behöver vara på plats på tillträdesdagen.'],
        ['chat', 'Översättning och stöd hos notarien', 'Vi översätter handlingarna och är med när du skriver under, så att du bara skriver under det du förstår.'],
        ['doc', 'Deklarationer efter köpet', 'Vi lämnar in de obligatoriska deklarationerna efter köpet (Modelo 600 och vid behov Modelo 211) åt dig.'],
      ],
      sitH: 'Beroende på din situation', tagThird: 'Tredje part',
      sitItems: [
        ['euro', 'Bolån', 'Finansierar du i Spanien låter banken värdera bostaden (tasación) och kan ta ut en uppläggningsavgift. Sedan 2019 betalar banken notarie- och registerkostnaderna och skatten på pantbrevet.'],
        ['globe', 'Fullmakt i ditt hemland', 'Skriver du under fullmakten hos en notarie i ditt hemland tillkommer dennes avgift, en apostille och en auktoriserad översättning.'],
        ['bank', 'Bank och överföring', 'Du behöver ett spanskt bankkonto för köpet och de löpande kostnaderna. Din bank kan ta betalt för kontot, en internationell överföring eller valutaväxling.'],
        ['plug', 'Abonnemang', 'Vi för över vatten, el och eventuellt gas till ditt namn. Leverantören kan ta ut en engångsavgift eller en deposition.'],
        ['shield', 'Hemförsäkring', 'Klokt från första dagen, för byggnad och lösöre. Med bolån är byggnadsförsäkring obligatorisk.'],
        ['split', '3 % innehållande om säljaren bor utomlands', 'Bor säljaren inte i Spanien håller du inne 3 % av köpeskillingen och betalar den till spanska skatteverket för säljarens räkning (Modelo 211). Det är ingen extra kostnad: det är en del av priset.'],
      ],
      afterH: 'Efter köpet: löpande kostnader', after: ['IBI (kommunal fastighetsskatt)', 'Sophämtningsavgift (basura)', 'Avgift till samfälligheten (comunidad), i förekommande fall', 'Försäkring, vatten och el', 'Inkomstskatt för icke-residenter (Modelo 210), om du inte bor i Spanien'],
      afterP: 'Räkna ut dina månadskostnader med vår kalkylator.',
      whenH: 'När betalar du vad?', when: isNew
        ? [['Reservation', 'En handpenning tar bostaden från marknaden.'], ['Köpeavtal', 'Med byggherren avtalar du delbetalningar under byggtiden.'], ['Notarie', 'Vid färdigställandet skriver du under köpebrevet och betalar resten.'], ['Efter köpebrevet', 'Därefter följer stämpelskatten och inskrivningen i registret.']]
        : [['Reservation', 'En handpenning tar bostaden från marknaden.'], ['Köpeavtal (arras)', 'Med det privata köpeavtalet betalar du en del av priset, oftast 10 %.'], ['Notarie', 'Vid köpebrevet betalar du resten av köpeskillingen.'], ['Efter köpebrevet', 'Därefter följer överlåtelseskatten och inskrivningen i registret.']],
      agK: 'Beloppen för den här bostaden', agP: n => `${n} går personligen igenom de specifika kostnaderna för bostaden med dig: vilken skatt som gäller, vad som tillkommer i din situation och vad vårt allt-i-ett-arvode är.`,
      since: 'aktiva sedan', reviews: 'Google-omdömen', api: 'API-medlem nr', allin: 'allt-i-ett-arvode, avtalat i förväg',
      disc: 'Översikten är allmän och vägledande, baserad på reglerna i regionen Valencia vid tidpunkten för upprättandet. Inga rättigheter kan härledas ur den. Din mäklare bekräftar kostnaderna för ditt köp.',
      office: 'Kontor', officeHours: 'mån–fre 10:00–14:00, och efter överenskommelse', roleP: 'Partner, försäljning', roleS: '(After) sales', roleO: 'Grupo Soltura Real Estate', calc: 'Månadskostnadskalkylator',
    },
  }[L];
  const CAT = {
    nl: { villa: 'Villa', apartment: 'Appartement', bungalow: 'Bungalow', detached: 'Vrijstaand huis', townhouse: 'Rijtjeshuis', penthouse: 'Penthouse', quadrant: 'Hoekwoning', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Twee-onder-een-kap', commercial: 'Bedrijfspand', plot: 'Bouwgrond', attic: 'Penthouse' },
    en: { villa: 'Villa', apartment: 'Apartment', bungalow: 'Bungalow', detached: 'Detached house', townhouse: 'Townhouse', penthouse: 'Penthouse', quadrant: 'Quad house', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Semi-detached house', commercial: 'Commercial property', plot: 'Building plot', attic: 'Penthouse' },
    es: { villa: 'Villa', apartment: 'Apartamento', bungalow: 'Bungalow', detached: 'Chalet independiente', townhouse: 'Adosado', penthouse: 'Ático', quadrant: 'Quad', duplex: 'Dúplex', finca: 'Finca', 'semi-detached': 'Pareado', commercial: 'Local comercial', plot: 'Parcela', attic: 'Ático' },
    sv: { villa: 'Villa', apartment: 'Lägenhet', bungalow: 'Bungalow', detached: 'Fristående hus', townhouse: 'Radhus', penthouse: 'Takvåning', quadrant: 'Fyrfamiljshus', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Parhus', commercial: 'Lokal', plot: 'Tomt', attic: 'Takvåning' },
  }[L];
  const AG = {
    2: { name: 'Rick van Hoeven', tel: '+34664414515', mail: 'rick@gruposoltura.com', role: T.roleP },
    3: { name: 'Marco Verschoor', tel: '+34670687341', mail: 'marco@gruposoltura.com', role: T.roleP },
    4: { name: 'Ingrid van Hoeven', tel: '+34664414668', mail: 'ingrid@gruposoltura.com', role: T.roleS },
    6: { name: 'Lisette Don', tel: '+34662226338', mail: 'lisette@gruposoltura.com', role: T.roleS },
  };
  const ag = generic ? { name: 'Grupo Soltura Real Estate', tel: '+34966792113', mail: 'info@gruposoltura.com', role: T.office2 } : (AG[p.agent_wp_id] || { name: 'Grupo Soltura', tel: '+34664414515', mail: 'info@gruposoltura.com', role: T.roleO });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dec = v => String(Math.round(Number(v) * 10) / 10).replace('.', L === 'en' ? '.' : ',');
  const telFmt = t => t.replace(/^\+34(\d{3})(\d{3})(\d{3})$/, '+34 $1 $2 $3');
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const ref = String(p.reference || '').toUpperCase();
  const cat = CAT[p.category] || cap(p.category || '') || (L === 'nl' ? 'Woning' : L === 'es' ? 'Vivienda' : L === 'sv' ? 'Bostad' : 'Home');
  const place = [p.suburb, p.town].filter(Boolean).join(', ');
  const photo = (Array.isArray(p.photos) ? p.photos : []).filter(Boolean)[0] || '';
  const calcUrl = L === 'nl' ? 'https://gruposoltura.com/nl/emigreren/maandlasten/' : L === 'sv' ? 'https://gruposoltura.com/sv/flytta-till-spanien/manadskostnader/' : 'https://gruposoltura.com/en/move-to-spain/monthly-costs/';
  const qr = A.qr || (u => 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&color=2E3B42&data=' + encodeURIComponent(u));
  const score = rev && rev.score ? dec(rev.score) : '4,7';
  const rcount = rev && rev.count ? rev.count : '';

  const I = {
    euro: '<path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5M4.5 10.5h9M4.5 13.5h9"/>',
    pct: '<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
    stamp: '<path d="M9 13V9a3 3 0 1 1 6 0v4M5 13h14v4H5zM4 20h16"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.3"/><path d="M5.5 16.5c.6-1.6 1.9-2.4 3.5-2.4s2.9.8 3.5 2.4M14.5 10h4M14.5 13.5h3"/>',
    pen: '<path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18zM14 7l3 3M4 20h7"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 16.5h4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
    bank: '<path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
    split: '<path d="M4 12h16M12 4v16"/><circle cx="12" cy="12" r="9"/>',
    pin: '<path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    home: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
    wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8.4 19z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a4 4 0 0 1-2.4-2.4l1-1-1-2z"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  };
  const ic = (k, cls) => `<svg class="${cls || 'ic'}" viewBox="0 0 24 24">${I[k] || ''}</svg>`;

  const taxes = generic
    ? [[T.itpH, ITP, T.itpWhy, T.resale], [T.ivaH, IVA, T.ivaWhy, T.newb], [T.ajdH, AJD, T.ajdWhy, T.newb]]
    : isNew ? [[T.ivaH, IVA, T.ivaWhy], [T.ajdH, AJD, T.ajdWhy]] : [[T.itpH, ITP, T.itpWhy]];

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Manrope:wght@400;500;600;700;800&display=block');
${A.fontCss || ''}
:root{--ink:#2E3B42;--ink2:#4A5960;--muted:#77858C;--red:#C63232;--deep:#384850;--bright:#F03838;--coral:#FF7068;--lemon:#FBCC10;--lemonsoft:#FFF3C4;--salsoft:#FDE3E1;--salt:#F7F7F5;--mist:#E3E6E7;--sun:linear-gradient(90deg,#F03838 0%,#FF7068 55%,#FBCC10 100%);--serif:"Fraunces",Georgia,serif;--sans:"Manrope",system-ui,sans-serif}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff;width:210mm}
body{font-family:var(--sans);color:var(--ink);font-size:9.4pt;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"lnum"}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;break-after:page;background:#fff}
.page:last-child{page-break-after:auto;break-after:auto}
.sunbar{position:absolute;left:0;right:0;bottom:0;height:3mm;background:var(--sun)}
.ic{width:5.2mm;height:5.2mm;fill:none;stroke:var(--red);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
em{font-style:italic;color:var(--red)}
.ph-head{position:absolute;top:0;left:0;right:0;height:17mm;padding:0 16mm;display:flex;align-items:center;justify-content:space-between;border-bottom:.4mm solid var(--mist)}
.ph-head img{height:9mm}
.ph-head .hl{font-size:7.6pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
.wrap{position:absolute;top:23mm;left:16mm;right:16mm;bottom:12mm}
.kick{font-weight:800;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--red);margin-bottom:1.6mm;display:flex;align-items:center;gap:1.6mm}
.kick .ic{width:4mm;height:4mm}
h1{font-family:var(--serif);font-weight:600;font-size:28pt;line-height:1.04;letter-spacing:-.015em}
h2{font-family:var(--serif);font-weight:600;font-size:15pt;line-height:1.1;letter-spacing:-.01em;margin:0 0 2.6mm;display:flex;align-items:center;gap:2.4mm}
h2 .tag{font-family:var(--sans);font-size:6.8pt;font-weight:800;letter-spacing:.12em;text-transform:uppercase;border-radius:99px;padding:.9mm 2.6mm;line-height:1.2}
.tag.tax{background:var(--deep);color:#fff}.tag.in{background:var(--red);color:#fff}.tag.third{background:var(--lemon);color:var(--ink)}
.top{display:grid;grid-template-columns:minmax(0,1fr) 58mm;gap:7mm;align-items:start}
.lead{margin-top:2.6mm;font-size:9.6pt;line-height:1.48;color:var(--ink2)}
.home{border:.6mm solid var(--red);border-radius:5mm;overflow:hidden;background:#fff}
.home .hp{height:30mm;background:#ddd center/cover no-repeat}
.home .hb{padding:3mm 3.6mm 3.4mm}
.home .hk{font-weight:800;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:var(--red)}
.home .hn{font-family:var(--serif);font-weight:600;font-size:11.5pt;line-height:1.15;margin:.8mm 0 1.4mm}
.home .hr{display:flex;flex-wrap:wrap;gap:1.4mm;margin-bottom:1.6mm}
.pill{display:inline-flex;align-items:center;border-radius:99px;padding:.8mm 2.6mm;font-weight:800;font-size:6.8pt;letter-spacing:.1em;text-transform:uppercase}
.pill.ref{border:.4mm solid var(--red);color:var(--ink)}.pill.kind{background:var(--lemon);color:var(--ink)}
.home .ht{font-size:8pt;line-height:1.4;font-weight:600;color:var(--ink2)}
.sec{margin-top:5mm}
.taxes{display:grid;grid-template-columns:repeat(${taxes.length},minmax(0,1fr));gap:3.4mm}
.tx{border:.45mm solid var(--red);border-radius:5mm;padding:3.6mm 4mm;display:grid;grid-template-columns:auto minmax(0,1fr);gap:1mm 3.4mm;align-items:start}
.tx .tv{grid-row:span 2;background:var(--deep);color:#fff;border-radius:4mm;min-width:20mm;padding:2.4mm 2mm;text-align:center}
.tx .tv b{display:block;font-family:var(--serif);font-weight:700;font-size:17pt;line-height:1}
.tx .tv span{display:block;font-size:6.2pt;font-weight:700;opacity:.85;margin-top:.8mm;line-height:1.2}
.tx h3{font-size:9.4pt;font-weight:800;line-height:1.25}
.tx p{font-size:8.2pt;line-height:1.42;color:var(--ink2)}
.note{margin-top:2mm;font-size:7.4pt;color:var(--muted);font-weight:600}
.allin{margin-top:4.5mm;background:var(--deep);color:#fff;border-radius:6mm;padding:4mm 5.5mm;position:relative;overflow:hidden;display:grid;grid-template-columns:30mm minmax(0,1fr);gap:5mm;align-items:center}
.allin::before{content:"";position:absolute;left:0;top:0;right:0;height:1.6mm;background:var(--sun)}
.allin .one{font-family:var(--serif);font-weight:700;font-size:44pt;line-height:.9;color:var(--lemon);text-align:center}
.allin .one span{display:block;font-family:var(--sans);font-size:6.6pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#fff;opacity:.85;margin-top:1.4mm}
.allin .ak{font-weight:800;font-size:7.2pt;letter-spacing:.14em;text-transform:uppercase;color:var(--lemon);margin-bottom:1mm}
.allin h2{color:#fff;margin:0 0 1.4mm}.allin h2 em{color:var(--lemon)}
.allin p{font-size:8.6pt;line-height:1.48;opacity:.92}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:2.8mm}
.it{border:.45mm solid var(--red);border-radius:4.5mm;padding:2.3mm 3mm;display:flex;gap:2.6mm;align-items:flex-start;background:#fff}
.it .ic{width:6.2mm;height:6.2mm;margin-top:.2mm}
.it h3{font-size:8.8pt;font-weight:800;line-height:1.25;margin-bottom:.6mm}
.it p{font-size:7.7pt;line-height:1.4;color:var(--ink2)}
.it.third{border-color:#EAD37A;background:#FFFCF0}
.it.third .ic{stroke:var(--ink)}
.it.wide{grid-column:span 2}
.bottom{display:grid;grid-template-columns:minmax(0,1fr) 74mm;gap:4mm;margin-top:6mm}
.after{background:var(--salt);border-radius:5mm;padding:3.8mm 4.4mm;border-top:1.3mm solid var(--coral)}
.after h3{font-family:var(--serif);font-weight:600;font-size:11.5pt;margin-bottom:1.6mm}
.after ul{list-style:none}
.after li{display:flex;gap:1.8mm;align-items:flex-start;font-size:8pt;line-height:1.35;font-weight:600;margin-bottom:1mm}
.after li .ic{width:3.8mm;height:3.8mm;stroke-width:2.4;margin-top:.2mm}
.after .calc{display:flex;align-items:center;gap:2.6mm;margin-top:2.2mm;padding-top:2.2mm;border-top:.3mm solid var(--mist)}
.after .calc img{width:14mm;height:14mm;border-radius:1.5mm;flex:none}
.after .calc b{display:block;font-size:8pt}.after .calc span{font-size:7pt;font-weight:700;color:var(--red)}
.agent{background:var(--deep);color:#fff;border-radius:5.5mm;padding:4.4mm 4.6mm;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
.agent::before{content:"";position:absolute;left:0;top:0;right:0;height:1.6mm;background:var(--sun)}
.agent .ak{font-weight:800;font-size:7.2pt;letter-spacing:.14em;text-transform:uppercase;color:var(--lemon);margin-bottom:1.2mm}
.agent .an{font-family:var(--serif);font-weight:600;font-size:13.5pt;line-height:1.1}
.agent .ar{font-size:7.8pt;opacity:.8;margin:.6mm 0 2mm}
.agent .ap{font-size:7.9pt;line-height:1.42;opacity:.95;margin-bottom:2.2mm}
.agent .al{display:flex;align-items:center;gap:1.8mm;font-size:8.6pt;font-weight:700;margin-top:1mm;white-space:nowrap}
.agent .al .ic{width:4.2mm;height:4.2mm;stroke:var(--lemon)}
.trust{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-top:5mm}
.tr{background:var(--salt);border-radius:4.5mm;padding:2.6mm 3mm;border-top:1.3mm solid var(--red)}
.tr:nth-child(2){border-top-color:var(--coral)}.tr:nth-child(3){border-top-color:var(--lemon)}.tr:nth-child(4){border-top-color:var(--deep)}
.tr .tv{font-family:var(--serif);font-weight:700;font-size:15pt;line-height:1;display:flex;align-items:center;gap:1mm}
.tr .tv .ic{width:4.4mm;height:4.4mm;fill:var(--lemon);stroke:var(--lemon)}
.tr .tl{font-size:7pt;font-weight:700;color:var(--ink2);margin-top:1mm;line-height:1.25}
.disc{position:absolute;left:16mm;right:16mm;bottom:8mm;font-size:6.8pt;line-height:1.45;color:var(--muted);text-align:center}
.disc b{display:block;color:var(--ink2);font-size:7.4pt;margin-bottom:.8mm}
.p1foot{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;align-items:center;font-size:7.6pt;font-weight:700;color:var(--muted);letter-spacing:.06em}
.p1foot b{color:var(--red)}
.when{margin-top:6mm}
.tx .tk{grid-column:2;font-size:6.6pt;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--red)}
.taxes.g3 .tx{grid-template-columns:1fr;gap:1.2mm;align-content:start;padding:3mm 3.2mm}.taxes.g3 .tx p{font-size:7.7pt;line-height:1.38}.taxes.g3 .tx .tv{grid-row:auto;display:flex;align-items:baseline;gap:1.6mm;min-width:0;padding:1.8mm 2.6mm;text-align:left}.taxes.g3 .tx .tv span{margin:0}.taxes.g3 .tx .tk{grid-column:1}
.home.gen .hb{padding:4mm 4mm 4.2mm}.home.gen .hn{font-size:12.5pt}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;counter-reset:st}
.step{position:relative;border:.45mm solid var(--red);border-radius:4.5mm;padding:3.2mm 3.2mm 3mm;background:#fff}
.step .sn{width:7mm;height:7mm;border-radius:50%;background:var(--sun);color:#fff;font-weight:800;font-size:9pt;display:grid;place-items:center;margin-bottom:1.6mm}
.step h3{font-size:8.6pt;font-weight:800;line-height:1.25;margin-bottom:.6mm}
.step p{font-size:7.5pt;line-height:1.4;color:var(--ink2)}
.step:not(:last-child)::after{content:"";position:absolute;right:-3mm;top:6.5mm;width:3mm;height:.45mm;background:var(--red)}
`;
  const head = `<header class="ph-head"><img src="${A.logoWide}" alt="Soltura Real Estate"><span class="hl">${T.kicker} · ${generic ? 'gruposoltura.com' : 'Ref. ' + esc(ref)}</span></header>`;
  const item = (x, cls) => `<div class="it${cls ? ' ' + cls : ''}">${ic(x[0])}<div><h3>${esc(x[1])}</h3><p>${esc(x[2])}</p></div></div>`;

  const page1 = `<section class="page">${head}
  <div class="wrap">
    <div class="top">
      <div>
        <div class="kick">${ic('euro')}${T.kicker}</div>
        <h1>${T.title}</h1>
        <p class="lead">${esc(T.lead)}</p>
      </div>
      ${generic ? `<div class="home gen"><div class="hb"><div class="hk">${T.kicker}</div><div class="hn">${esc(T.genH)}</div>
          <div class="hr"><span class="pill kind">${T.resale}</span><span class="pill ref">${T.newb}</span></div><div class="ht">${esc(T.genP)}</div></div></div>`
      : `<div class="home">
        ${photo ? `<div class="hp" style="background-image:url('${esc(photo)}')"></div>` : ''}
        <div class="hb"><div class="hk">${T.thisHome}</div>
          <div class="hn">${esc(cat)} · ${esc(place || p.town || '')}</div>
          <div class="hr"><span class="pill ref">Ref. ${esc(ref)}</span><span class="pill kind">${isNew ? T.newb : T.resale}</span></div>
          <div class="ht">${esc(T.homeTax)}</div></div>
      </div>`}
    </div>
    <div class="sec">
      <h2>${T.taxH} <span class="tag tax">${T.tagTax}</span></h2>
      <div class="taxes${generic ? ' g3' : ''}">${taxes.map(x => `<div class="tx"><div class="tv"><b>${x[1] || '–'}</b><span>${T.ofPrice}</span></div>${x[3] ? `<div class="tk">${esc(x[3])}</div>` : ''}<h3>${esc(x[0])}</h3><p>${esc(x[2])}</p></div>`).join('')}</div>
      <p class="note">${esc(T.taxNote)}</p>
    </div>
    <div class="allin"><div class="one">1<span>${T.allin.split(',')[0]}</span></div>
      <div><div class="ak">${T.allinK}</div><h2>${T.allinH}</h2><p>${esc(T.allinP)}</p></div></div>
    <div class="sec">
      <h2>${T.inH} <span class="tag in">${T.tagIn}</span></h2>
      <div class="grid">${T.inItems.map((x, i) => item(x, i === T.inItems.length - 1 && T.inItems.length % 2 ? 'wide' : '')).join('')}</div>
    </div>
  </div>
  ${generic ? '' : `<div class="p1foot"><span>${T.kicker.toUpperCase()} · <b>${esc(ref)}</b></span><span>GRUPOSOLTURA.COM · +34 664 414 515</span></div>`}
  <div class="sunbar"></div>
</section>`;

  const page2 = `<section class="page">${head}
  <div class="wrap">
    <h2>${T.sitH} <span class="tag third">${T.tagThird}</span></h2>
    <div class="grid">${T.sitItems.map(x => item(x, 'third')).join('')}</div>
    <div class="bottom">
      <div class="after"><h3>${T.afterH}</h3><ul>${T.after.map(a => `<li>${ic('check')}<span>${esc(a)}</span></li>`).join('')}</ul>
        <div class="calc"><img src="${qr(calcUrl)}" alt=""><div><b>${T.calc}</b><span>${esc(T.afterP)}</span></div></div></div>
      <div class="agent"><div class="ak">${generic ? T.agKg : T.agK}</div><div class="an">${esc(ag.name)}</div><div class="ar">${esc(ag.role)}</div>
        <div class="ap">${esc(generic ? T.agPg : T.agP(ag.name.split(' ')[0]))}</div>
        <div class="al">${ic('wa')}${telFmt(ag.tel)}</div><div class="al">${ic('mail')}${esc(ag.mail)}</div></div>
    </div>
    <div class="when"><h2>${T.whenH}</h2><div class="steps">${T.when.map((w, i) => `<div class="step"><div class="sn">${i + 1}</div><h3>${esc(w[0])}</h3><p>${esc(w[1])}</p></div>`).join('')}</div></div>
    <div class="trust">
      <div class="tr"><div class="tv">2002</div><div class="tl">${T.since}</div></div>
      <div class="tr"><div class="tv">${score}${ic('star')}</div><div class="tl">${rcount ? rcount + ' ' : ''}${T.reviews}</div></div>
      <div class="tr"><div class="tv">992</div><div class="tl">${T.api} · COAPI Alicante</div></div>
      <div class="tr"><div class="tv">1</div><div class="tl">${T.allin}</div></div>
    </div>
  </div>
  <div class="disc"><b>${T.office}: Avda. de la Constitución s/n, 03179 Formentera del Segura · ${T.officeHours}</b>${esc(T.disc)}</div>
  <div class="sunbar"></div>
</section>`;

  return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${esc(T.kicker)} ${esc(ref)}</title><style>${css}</style></head><body>${page1}${page2}</body></html>`;
}
if (typeof module !== 'undefined') module.exports = { buildCosts };
