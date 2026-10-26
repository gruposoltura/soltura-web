// Soltura woningbrochure (A4, 2 pagina's) in de huisstijl van de woon- en koopgids.
// buildBrochure(data, lang, A, opt) -> HTML. opt.variant 'window' = een A4 voor NEXUS (print), anders de klantbrochure (2 pagina's). data = brochure_data(ref) (p, geo, reviews). A = asset-basis (logo's, fonts).
function buildBrochure(data, lang, A, opt) {
  const p = (data && data.p) || {}, geo = (data && data.geo) || {}, rev = (data && data.reviews) || {};
  const L = ['nl', 'en', 'es', 'sv'].includes(lang) ? lang : 'en';
  const T = {
    nl: { kicker: 'Woningbrochure', forSale: 'Te koop', reserved: 'Gereserveerd', sold: 'Verkocht', price: 'Vraagprijs', from: 'vanaf', onReq: 'Prijs op aanvraag',
      beds: 'slaapkamers', bed1: 'slaapkamer', baths: 'badkamers', bath1: 'badkamer', built: 'woonoppervlak', plot: 'perceel', poolU: 'zwembad', poolP: 'privézwembad', poolC: 'gem. zwembad', year: 'bouwjaar', solarium: 'solarium',
      about: 'Over deze <em>woning</em>', features: 'Kenmerken', location: 'Ligging', beach: 'Strand', airport: 'Luchthaven', shops: 'Winkels', drive: 'min rijden', approx: 'ca.',
      energy: 'Energielabel', energyR: 'aangevraagd', energyX: 'vrijgesteld', orient: 'Oriëntatie', view: 'Uitzicht', aircon: 'Airconditioning', newb: 'Nieuwbouw', resale: 'Bestaande bouw',
      visitH: 'Zelf komen kijken?', visitP: (n, t) => `Plan een bezichtiging met ${n}: bel of app ${t}. We laten je graag ook vergelijkbare woningen in de buurt zien.`, contactH: 'Jouw contactpersoon', contactP: 'Kent deze woning en vertelt je er graag meer over. Bel, app of mail, of plan direct een bezichtiging.',
      scan: 'Bekijk alle foto\'s', guideH: 'Gratis woon- & koopgids', guideP: 'Alles over kopen aan de Costa Blanca Zuid: kosten, stappen, wonen en de dorpen.',
      costH: 'Bijkomende kosten', costP: 'Welke kosten komen er bij de prijs? Je contactpersoon neemt ze voor deze woning persoonlijk met je door, met één vaste all-in fee.', costCta: 'Bel of app ons',
      since: 'actief sinds', reviews: 'Google-reviews', api: 'API-lid nr.', allin: 'all-in fee, vooraf afgesproken', oneFee: '1',
      find: 'Hier vind je ons', office: 'Kantoor', officeHours: 'ma–vr 10:00–14:00, en op afspraak',
      disc: 'Deze gegevens zijn met zorg samengesteld, zijn bedoeld als leidraad en maken geen deel uit van een contract. Maten en afstanden zijn indicatief.',
      roleP: 'Partner, verkoop', roleS: '(After) sales', roleO: 'Grupo Soltura Real Estate', photos: 'foto\'s',
      orients: { north: 'noord', south: 'zuid', east: 'oost', west: 'west', northeast: 'noordoost', northwest: 'noordwest', southeast: 'zuidoost', southwest: 'zuidwest', 'south-west': 'zuidwest', 'south-east': 'zuidoost' },
      views: { sea: 'zee', mountain: 'bergen', country: 'landelijk', golf: 'golfbaan', green: 'groen', lake: 'zoutmeer', panoramic: 'panorama', residential: 'woonwijk', valley: 'vallei' },
      feat: { furnished: 'Gemeubileerd', 'semi furnished': 'Deels gemeubileerd', fireplace: 'Open haard', 'secure parking': 'Afgesloten parkeerplaats', 'security system': 'Beveiligingssysteem', 'central heating': 'Centrale verwarming', basement: 'Kelder', 'air conditioning preinstalled': 'Airco voorbereid', intercom: 'Intercom', 'fully fenced': 'Volledig omheind', 'split heating': 'Verwarming via split-units', 'underfloor heating': 'Vloerverwarming', 'remote garage': 'Garage met afstandsbediening', 'ducted heating': 'Verwarming via kanalen', 'ducted cooling': 'Koeling via kanalen', 'outdoor entertaining': 'Buitenkeuken / loungeplek' } },
    en: { kicker: 'Property brochure', forSale: 'For sale', reserved: 'Reserved', sold: 'Sold', price: 'Asking price', from: 'from', onReq: 'Price on request',
      beds: 'bedrooms', bed1: 'bedroom', baths: 'bathrooms', bath1: 'bathroom', built: 'living area', plot: 'plot', poolU: 'pool', poolP: 'private pool', poolC: 'communal pool', year: 'year built', solarium: 'solarium',
      about: 'About this <em>home</em>', features: 'Features', location: 'Location', beach: 'Beach', airport: 'Airport', shops: 'Shops', drive: 'min drive', approx: 'approx.',
      energy: 'Energy rating', energyR: 'requested', energyX: 'exempt', orient: 'Orientation', view: 'Views', aircon: 'Air conditioning', newb: 'New build', resale: 'Resale',
      visitH: 'Want to see it?', visitP: (n, t) => `Book a viewing with ${n}: call or WhatsApp ${t}. We are happy to show you similar homes nearby too.`, contactH: 'Your contact', contactP: 'Knows this home inside out and is happy to tell you more. Call, message or email, or book a viewing straight away.',
      scan: 'See all photos', guideH: 'Free buying guide', guideP: 'Everything about buying on the southern Costa Blanca: costs, steps, living here and the towns.',
      costH: 'Purchase costs', costP: 'What comes on top of the price? Your contact goes through the costs of this home with you personally, with one fixed all-in fee.', costCta: 'Call or WhatsApp us',
      since: 'active since', reviews: 'Google reviews', api: 'API member no.', allin: 'all-in fee, agreed up front', oneFee: '1',
      find: 'Where to find us', office: 'Office', officeHours: 'Mon–Fri 10:00–14:00, and by appointment',
      disc: 'These details have been prepared with care, are intended as a guide and do not form part of any contract. Measurements and distances are indicative.',
      roleP: 'Partner, sales', roleS: '(After) sales', roleO: 'Grupo Soltura Real Estate', photos: 'photos',
      orients: { 'south-west': 'south-west', southwest: 'south-west', 'south-east': 'south-east', southeast: 'south-east', northwest: 'north-west', northeast: 'north-east' },
      views: { country: 'countryside', lake: 'salt lake', panoramic: 'panoramic' },
      feat: { 'semi furnished': 'Part furnished', 'air conditioning preinstalled': 'Air conditioning pre-installed', 'remote garage': 'Garage with remote door', 'outdoor entertaining': 'Outdoor entertaining area' } },
    es: { kicker: 'Folleto de la vivienda', forSale: 'En venta', reserved: 'Reservada', sold: 'Vendida', price: 'Precio', from: 'desde', onReq: 'Precio a consultar',
      beds: 'dormitorios', bed1: 'dormitorio', baths: 'baños', bath1: 'baño', built: 'superficie', plot: 'parcela', poolU: 'piscina', poolP: 'piscina privada', poolC: 'piscina comunitaria', year: 'año', solarium: 'solárium',
      about: 'Sobre esta <em>vivienda</em>', features: 'Características', location: 'Ubicación', beach: 'Playa', airport: 'Aeropuerto', shops: 'Tiendas', drive: 'min en coche', approx: 'aprox.',
      energy: 'Certificado energético', energyR: 'en trámite', energyX: 'exento', orient: 'Orientación', view: 'Vistas', aircon: 'Aire acondicionado', newb: 'Obra nueva', resale: 'Segunda mano',
      visitH: '¿Quieres verla?', visitP: (n, t) => `Reserva una visita con ${n}: llama o escribe al ${t}. También te enseñamos viviendas parecidas en la zona.`, contactH: 'Tu persona de contacto', contactP: 'Conoce bien esta vivienda y te cuenta con gusto más detalles. Llama, escribe o reserva una visita.',
      scan: 'Ver todas las fotos', guideH: 'Guía de compra gratuita', guideP: 'Todo sobre comprar en la Costa Blanca Sur: gastos, pasos, vivir aquí y los pueblos.',
      costH: 'Gastos de compra', costP: '¿Qué se suma al precio? Tu persona de contacto repasa contigo los gastos de esta vivienda, con una tarifa única todo incluido.', costCta: 'Llámanos o escríbenos por WhatsApp',
      since: 'activos desde', reviews: 'reseñas en Google', api: 'API nº', allin: 'tarifa todo incluido, acordada de antemano', oneFee: '1',
      find: 'Dónde encontrarnos', office: 'Oficina', officeHours: 'lun–vie 10:00–14:00, y con cita previa',
      disc: 'Estos datos se han preparado con cuidado, son orientativos y no forman parte de ningún contrato. Medidas y distancias aproximadas.',
      roleP: 'Socio, ventas', roleS: 'Posventa', roleO: 'Grupo Soltura Real Estate', photos: 'fotos',
      orients: { north: 'norte', south: 'sur', east: 'este', west: 'oeste', northeast: 'noreste', northwest: 'noroeste', southeast: 'sureste', southwest: 'suroeste', 'south-west': 'suroeste', 'south-east': 'sureste' },
      views: { sea: 'mar', mountain: 'montaña', country: 'campo', golf: 'golf', green: 'zonas verdes', lake: 'laguna salada', panoramic: 'panorámicas', residential: 'urbanización', valley: 'valle' },
      feat: { furnished: 'Amueblada', 'semi furnished': 'Semiamueblada', fireplace: 'Chimenea', 'secure parking': 'Aparcamiento cerrado', 'security system': 'Sistema de seguridad', 'central heating': 'Calefacción central', basement: 'Sótano', 'air conditioning preinstalled': 'Preinstalación de aire acondicionado', intercom: 'Portero automático', 'fully fenced': 'Totalmente vallada', 'split heating': 'Calefacción por splits', 'underfloor heating': 'Suelo radiante', 'remote garage': 'Garaje con mando', 'ducted heating': 'Calefacción por conductos', 'ducted cooling': 'Aire por conductos', 'outdoor entertaining': 'Zona exterior de ocio' } },
    sv: { kicker: 'Bostadsbroschyr', forSale: 'Till salu', reserved: 'Reserverad', sold: 'Såld', price: 'Utgångspris', from: 'från', onReq: 'Pris på förfrågan',
      beds: 'sovrum', bed1: 'sovrum', baths: 'badrum', bath1: 'badrum', built: 'boyta', plot: 'tomt', poolU: 'pool', poolP: 'egen pool', poolC: 'gemensam pool', year: 'byggår', solarium: 'solarium',
      about: 'Om den här <em>bostaden</em>', features: 'Egenskaper', location: 'Läge', beach: 'Strand', airport: 'Flygplats', shops: 'Butiker', drive: 'min med bil', approx: 'ca',
      energy: 'Energiklass', energyR: 'begärd', energyX: 'undantagen', orient: 'Väderstreck', view: 'Utsikt', aircon: 'Luftkonditionering', newb: 'Nyproduktion', resale: 'Befintlig bostad',
      visitH: 'Vill du se den?', visitP: (n, t) => `Boka en visning med ${n}: ring eller skicka WhatsApp till ${t}. Vi visar gärna liknande bostäder i närheten också.`, contactH: 'Din kontaktperson', contactP: 'Känner bostaden väl och berättar gärna mer. Ring, skriv eller boka en visning direkt.',
      scan: 'Se alla bilder', guideH: 'Gratis köpguide', guideP: 'Allt om att köpa på södra Costa Blanca: kostnader, steg, livet här och orterna.',
      costH: 'Köpkostnader', costP: 'Vad tillkommer utöver priset? Din kontaktperson går igenom kostnaderna för bostaden med dig, med ett fast allt-i-ett-arvode.', costCta: 'Ring eller skriv på WhatsApp',
      since: 'aktiva sedan', reviews: 'Google-omdömen', api: 'API-medlem nr', allin: 'allt-i-ett-arvode, avtalat i förväg', oneFee: '1',
      find: 'Här hittar du oss', office: 'Kontor', officeHours: 'mån–fre 10:00–14:00, och efter överenskommelse',
      disc: 'Uppgifterna är sammanställda med omsorg, är vägledande och ingår inte i något avtal. Mått och avstånd är ungefärliga.',
      roleP: 'Partner, försäljning', roleS: '(After) sales', roleO: 'Grupo Soltura Real Estate', photos: 'bilder',
      orients: { north: 'norr', south: 'söder', east: 'öster', west: 'väster', northeast: 'nordost', northwest: 'nordväst', southeast: 'sydost', southwest: 'sydväst', 'south-west': 'sydväst', 'south-east': 'sydost' },
      views: { sea: 'hav', mountain: 'berg', country: 'landsbygd', golf: 'golfbana', green: 'grönområden', lake: 'saltsjö', panoramic: 'panorama', residential: 'bostadsområde', valley: 'dal' },
      feat: { furnished: 'Möblerad', 'semi furnished': 'Delvis möblerad', fireplace: 'Öppen spis', 'secure parking': 'Inhägnad parkering', 'security system': 'Larmsystem', 'central heating': 'Centralvärme', basement: 'Källare', 'air conditioning preinstalled': 'Förberett för AC', intercom: 'Porttelefon', 'fully fenced': 'Helt inhägnad', 'split heating': 'Värme via splitaggregat', 'underfloor heating': 'Golvvärme', 'remote garage': 'Garage med fjärrstyrd port', 'ducted heating': 'Kanaliserad värme', 'ducted cooling': 'Kanaliserad kyla', 'outdoor entertaining': 'Uteplats för umgänge' } },
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
  const ag = AG[p.agent_wp_id] || { name: 'Grupo Soltura', tel: '+34664414515', mail: 'info@gruposoltura.com', role: T.roleO };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const has = v => v !== null && v !== undefined && v !== '' && Number(v) !== 0;
  const n0 = v => Math.round(Number(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, L === 'en' ? ',' : L === 'sv' ? '\u00a0' : '.');
  const dec = v => String(Math.round(Number(v) * 10) / 10).replace('.', L === 'en' ? '.' : ',');
  const telFmt = t => t.replace(/^\+34(\d{3})(\d{3})(\d{3})$/, '+34 $1 $2 $3');
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const ref = String(p.reference || '').toUpperCase();
  const cat = CAT[p.category] || cap(p.category || '') || (L === 'nl' ? 'Woning' : L === 'es' ? 'Vivienda' : L === 'sv' ? 'Bostad' : 'Home');
  const place = [p.suburb, p.town].filter(Boolean).join(', ');
  const st = p.status === 'sold' ? T.sold : (p.status === 'reserved' || p.status === 'under_offer' || p.under_offer) ? T.reserved : T.forSale;
  const price = has(p.price) ? (p.price_from ? T.from + ' ' : '') + '€ ' + n0(p.price) : T.onReq;
  const photos = (Array.isArray(p.photos) ? p.photos : []).filter(Boolean);
  const ph = i => photos[i] || photos[i % Math.max(photos.length, 1)] || '';
  const homeUrl = L === 'nl' ? String(p.url_new || '').replace('/en/property/', '/nl/woning/') : L === 'sv' ? String(p.url_new || '').replace('/en/property/', '/sv/bostad/') : String(p.url_new || 'https://gruposoltura.com/');
  const guideUrl = L === 'nl' ? 'https://gruposoltura.com/nl/woongids/' : L === 'sv' ? 'https://gruposoltura.com/sv/kopguide/' : 'https://gruposoltura.com/en/buying-guide/';
  const qr = u => 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&color=2E3B42&data=' + encodeURIComponent(u);
  const wa = 'https://wa.me/' + ag.tel.replace('+', '');

  // ---------- iconen (lijn, rood) ----------
  const I = {
    bed: '<path d="M3 18v-6.5A2.5 2.5 0 0 1 5.5 9h13a2.5 2.5 0 0 1 2.5 2.5V18M3 15h18M3 18v2M21 18v2M6 9V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V9M8 9V7.5h3V9M13 9V7.5h3V9"/>',
    bath: '<path d="M4 12h16v2.5A4.5 4.5 0 0 1 15.5 19h-7A4.5 4.5 0 0 1 4 14.5zM6 12V5.5A2.5 2.5 0 0 1 10.5 4M7 19l-1 2M17 19l1 2"/><circle cx="11" cy="6" r="1"/>',
    area: '<path d="M4 4h16v16H4zM4 9h4M4 14h2M9 4v3M14 4v2M20 9h-3"/>',
    plot: '<path d="M3 20l5-14 5 6 3-4 5 12zM3 20h18"/>',
    pool: '<path d="M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M3 21c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 8h8M8 11h8"/>',
    year: '<path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    beach: '<path d="M3 20h18M12 20V9M12 9C9 4 4 5 3 8M12 9c3-5 8-4 9-1M12 9c-1-4-4-6-7-6M12 9c1-4 4-6 7-6"/>',
    plane: '<path d="M10.5 13.5L3 11l1.5-1.5 7.5.5L16 6c1-1 3-1.5 3.5-1S19 7.5 18 8.5l-4 4 .5 7.5L13 21.5l-2.5-7.5L7 17v3l-1.5 1L4 17l-4-1.5 1-1.5h3z"/>',
    cart: '<path d="M3 4h2l2.4 11h11L21 7H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
    pin: '<path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
    insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9"/>',
    fb: '<path d="M14 21v-7.5h2.7l.4-3.2H14V8.4c0-.9.3-1.6 1.6-1.6h1.6V4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.3H8.1v3.2h2.7V21"/>',
    yt: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.2v5.6l5-2.8z"/>',
    wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8.4 19z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a4 4 0 0 1-2.4-2.4l1-1-1-2z"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/>',
    euro: '<path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5M4.5 10.5h9M4.5 13.5h9"/>',
    bolt: '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  };
  const ic = (k, cls) => `<svg class="${cls || 'ic'}" viewBox="0 0 24 24">${I[k]}</svg>`;

  // ---------- kerngetallen ----------
  const stats = [];
  if (has(p.bedrooms)) stats.push(['bed', p.bedrooms, Number(p.bedrooms) === 1 ? T.bed1 : T.beds]);
  if (has(p.bathrooms)) stats.push(['bath', p.bathrooms, Number(p.bathrooms) === 1 ? T.bath1 : T.baths]);
  if (has(p.build_area)) stats.push(['area', n0(p.build_area) + '<small> m²</small>', T.built]);
  if (has(p.plot_area)) stats.push(['plot', n0(p.plot_area) + '<small> m²</small>', T.plot]);
  if (p.pool_private) stats.push(['pool', '✓', T.poolP]); else if (p.pool_communal) stats.push(['pool', '✓', T.poolC]); else if (p.pool_unspecified) stats.push(['pool', '✓', T.poolU]);
  if (stats.length < 6 && has(p.year_built)) stats.push(['year', esc(p.year_built), T.year]);
  if (stats.length < 6 && p.solarium) stats.push(['sun', '✓', T.solarium]);

  // ---------- kenmerken ----------
  const feats = [];
  feats.push(p.is_newbuild ? T.newb : T.resale);
  if (p.aircon) feats.push(T.aircon);
  if (p.solarium) feats.push(cap(T.solarium));
  if (p.pool_private) feats.push(cap(T.poolP)); else if (p.pool_communal) feats.push(cap(T.poolC)); else if (p.pool_unspecified) feats.push(cap(T.poolU));
  String(p.features || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean).forEach(f => { const v = (T.feat && T.feat[f]) || cap(f); if (!feats.includes(v)) feats.push(v); });
  if (has(p.terraces)) feats.push((L === 'nl' ? 'Terras ' : L === 'es' ? 'Terraza ' : L === 'sv' ? 'Terrass ' : 'Terrace ') + n0(p.terraces) + ' m²');
  const rows = [];
  if (p.orientation) { const o = String(p.orientation).toLowerCase(); rows.push([T.orient, cap((T.orients && T.orients[o]) || o)]); }
  if (p.view_type) rows.push([T.view, cap(String(p.view_type).split(',').map(v => (T.views && T.views[v.trim()]) || v.trim()).join(', '))]);
  if (has(p.year_built)) rows.push([cap(T.year), esc(p.year_built)]);
  const el = String(p.energy_label || '').toUpperCase();
  if (el) rows.push([T.energy, /^[A-G]$/.test(el) ? `<span class="elab e${el}">${el}</span>` : el === 'R' ? T.energyR : el === 'X' ? T.energyX : esc(el)]);

  // ---------- ligging ----------
  const loc = [];
  if (geo && has(geo.beach_km)) loc.push(['beach', T.beach, esc(String(geo.beach_name || '').replace(/\s*\(.*\)\s*$/, '')), `${dec(geo.beach_road_km || geo.beach_km)} km`, geo.beach_drive_min ? `${geo.beach_drive_min} ${T.drive}` : '']);
  else if (has(p.dist_sea_m) && Number(p.dist_sea_m) !== 7000) loc.push(['beach', T.beach, '', `${T.approx} ${dec(p.dist_sea_m / 1000)} km`, '']);
  if (geo && has(geo.alc_km)) loc.push(['plane', T.airport, 'Alicante (ALC)', `${dec(geo.alc_km * 1.25)} km`, geo.alc_drive_min ? `${geo.alc_drive_min} ${T.drive}` : '']);
  if (geo && has(geo.rmu_km)) loc.push(['plane', T.airport, 'Murcia (RMU)', `${dec(geo.rmu_km * 1.25)} km`, geo.rmu_drive_min ? `${geo.rmu_drive_min} ${T.drive}` : '']);
  if (has(p.dist_shops_m)) loc.push(['cart', T.shops, '', `${T.approx} ${p.dist_shops_m >= 1000 ? dec(p.dist_shops_m / 1000) + ' km' : n0(p.dist_shops_m) + ' m'}`, '']);

  // ---------- omschrijving: platte tekst, zonder slot-oproep, ingekort op alinea ----------
  const raw = String((L === 'nl' ? p.body_nl : L === 'sv' ? p.body_sv : p.body_en) || p.body_en || p.body_nl || '');
  let paras = raw.split(/<\/p>\s*/i).map(s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()).filter(Boolean);
  paras = paras.filter(s => !/(contact|neem .*contact|ponte en contacto|bezichtiging te plannen|arrange a viewing)/i.test(s) || paras.length < 3);
  paras = paras.map(s => s.replace(/\s*(Meer over [^.]*|You can (read|learn) more [^.]*|Puedes leer [^.]*)\.\s*$/i, '').trim());
  const MAX = loc.length > 2 ? 720 : 1000;
  const desc = []; let len = 0;
  for (const s of paras) {
    if (len + s.length <= MAX) { desc.push(s); len += s.length; continue; }
    const sent = s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s]; let part = '';
    for (const x of sent) { if (len + part.length + x.length > MAX) break; part += x; }
    if (part.trim().length > 60) desc.push(part.trim());
    break;
  }
  if (!desc.length) desc.push(String((L === 'nl' ? p.summary_nl : L === 'sv' ? (p.summary_sv || p.summary_en) : p.summary_en) || ''));

  const year = new Date().getFullYear();
  const score = rev && rev.score ? dec(rev.score) : '4,7';
  const rcount = rev && rev.count ? rev.count : '';

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Manrope:wght@400;500;600;700;800&display=block');
${A.fontCss || ''}
:root{--ink:#2E3B42;--ink2:#4A5960;--muted:#77858C;--red:#C63232;--deep:#384850;--bright:#F03838;--coral:#FF7068;--lemon:#FBCC10;--lemonsoft:#FFF3C4;--salsoft:#FDE3E1;--salt:#F7F7F5;--mist:#E3E6E7;--sun:linear-gradient(90deg,#F03838 0%,#FF7068 55%,#FBCC10 100%);--serif:"Fraunces",Georgia,serif;--sans:"Manrope",system-ui,sans-serif}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff;width:210mm}
body{font-family:var(--sans);color:var(--ink);font-size:9.6pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"lnum"}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;break-after:page;background:#fff}
.page:last-child{page-break-after:auto;break-after:auto}
.sunbar{position:absolute;left:0;right:0;bottom:0;height:3mm;background:var(--sun)}
.ic{width:5.2mm;height:5.2mm;fill:none;stroke:var(--red);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
em{font-style:italic;color:var(--red)}
/* pagina 1 */
.hero{position:absolute;top:12mm;left:12mm;right:12mm;height:136mm;border-radius:7mm;background:#ddd center/cover no-repeat;overflow:hidden}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,59,66,.18) 0%,rgba(46,59,66,0) 30%,rgba(46,59,66,0) 62%,rgba(46,59,66,.55) 100%)}
.hlogo{position:absolute;top:6mm;left:6mm;z-index:2;background:#fff;border-radius:5mm;padding:3.6mm 4mm;box-shadow:0 1.5mm 6mm rgba(0,0,0,.18)}
.hlogo img{height:25mm;display:block}
.hpills{position:absolute;top:7mm;right:7mm;z-index:2;display:flex;gap:2mm}
.pill{display:inline-flex;align-items:center;gap:1.5mm;border-radius:99px;padding:1.6mm 3.8mm;font-weight:800;font-size:8.2pt;letter-spacing:.12em;text-transform:uppercase}
.pill.ref{background:#fff;color:var(--ink);border:.5mm solid var(--red)}
.pill.st{background:var(--lemon);color:var(--ink)}
.hcount{position:absolute;right:7mm;bottom:6mm;z-index:2;color:#fff;font-weight:700;font-size:8pt;letter-spacing:.06em;background:rgba(46,59,66,.55);border-radius:99px;padding:1.2mm 3.2mm}
.intro{position:absolute;top:154mm;left:16mm;right:16mm;display:flex;gap:8mm;align-items:flex-start;justify-content:space-between}
.kick{font-weight:800;font-size:8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--red);margin-bottom:1.6mm;display:flex;align-items:center;gap:1.6mm}
.kick .ic{width:4mm;height:4mm}
h1{font-family:var(--serif);font-weight:600;font-size:27pt;line-height:1.04;letter-spacing:-.015em;color:var(--ink)}
.sub{margin-top:2mm;font-size:10pt;line-height:1.45;color:var(--ink2);max-width:112mm}
.pricebox{flex:none;border:.6mm solid var(--red);border-radius:5mm;padding:3.4mm 5mm 3.6mm;text-align:right;min-width:52mm}
.pricebox .pl{font-weight:800;font-size:7.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin-bottom:.6mm}
.pricebox .pv{font-family:var(--serif);font-weight:700;font-size:23pt;line-height:1;color:var(--ink);white-space:nowrap}
.stats{position:absolute;top:196mm;left:16mm;right:16mm;display:grid;grid-template-columns:repeat(${Math.max(stats.length, 1)},1fr);gap:3mm}
.stat{border:.45mm solid var(--red);border-radius:4.5mm;padding:3mm 2mm 2.8mm;text-align:center;background:#fff}
.stat .ic{width:7mm;height:7mm;margin:0 auto 1.4mm;display:block}
.stat .sv{font-family:var(--serif);font-weight:700;font-size:15pt;line-height:1;color:var(--ink)}
.stat .sv small{font-family:var(--sans);font-size:8pt;font-weight:700;color:var(--ink2)}
.stat .sl{margin-top:1.2mm;font-size:7.3pt;font-weight:700;color:var(--ink2);letter-spacing:.02em;text-transform:lowercase}
.trio{position:absolute;top:228mm;left:16mm;right:16mm;height:46mm;display:grid;grid-template-columns:1fr 1fr 1fr;gap:3mm}
.trio div{border-radius:4.5mm;background:#ddd center/cover no-repeat}
.p1foot{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;align-items:center;font-size:7.6pt;font-weight:700;color:var(--muted);letter-spacing:.06em}
.p1foot b{color:var(--red)}
/* pagina 2 */
.ph-head{position:absolute;top:0;left:0;right:0;height:17mm;padding:0 16mm;display:flex;align-items:center;justify-content:space-between;border-bottom:.4mm solid var(--mist)}
.ph-head img{height:9mm}
.ph-head .hl{font-size:7.6pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
.body2{position:absolute;top:23mm;left:16mm;right:16mm;height:104mm;overflow:hidden;display:grid;grid-template-columns:1fr 62mm;gap:7mm}
h2{font-family:var(--serif);font-weight:600;font-size:20pt;line-height:1.08;letter-spacing:-.01em;color:var(--ink);margin:0 0 3mm}
.desc p{margin:0 0 2.4mm;font-size:9.1pt;line-height:1.55;color:var(--ink2)}
.desc p:first-child{font-size:9.9pt;color:var(--ink)}
.box{border:.45mm solid var(--red);border-radius:5mm;padding:4mm 4.2mm;background:#fff}
.visit{margin-top:3mm;background:var(--lemonsoft);border-radius:5mm;padding:3.6mm 4.2mm}
.visit b{display:flex;align-items:center;gap:1.8mm;font-family:var(--serif);font-weight:600;font-size:11pt;margin-bottom:1mm}
.visit b .ic{width:5mm;height:5mm}
.visit p{font-size:8pt;line-height:1.45;color:var(--ink2)}
.locs{margin-top:3mm}.locs h3,.box h3{font-size:7.8pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin:0 0 2.2mm}
.lgrid{display:grid;grid-template-columns:1fr 1fr;gap:2.4mm}
.lc{display:flex;gap:2.2mm;align-items:center;border:.45mm solid var(--red);border-radius:4mm;padding:2mm 2.6mm}
.lc .ic{width:5.4mm;height:5.4mm}
.lc b{display:block;font-size:8pt;line-height:1.25}.lc b span{font-weight:600;color:var(--muted)}
.lc i{display:block;font-style:normal;font-size:7.6pt;font-weight:700;color:var(--ink2);line-height:1.3}
.box h3{font-size:7.8pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin:0 0 2.2mm}
.ticks{list-style:none}
.ticks li{display:flex;gap:2mm;align-items:flex-start;font-size:8.6pt;line-height:1.35;margin-bottom:1.3mm;font-weight:600}
.ticks .ic{width:4mm;height:4mm;stroke-width:2.4;margin-top:.2mm}
.kv{display:flex;justify-content:space-between;gap:2mm;font-size:8.4pt;padding:1.1mm 0;border-top:.3mm solid var(--mist)}
.kv:first-of-type{border-top:0}
.kv span{color:var(--muted);font-weight:600}.kv b{font-weight:800;text-align:right}
.elab{display:inline-block;min-width:5.4mm;text-align:center;border-radius:1.4mm;color:#fff;font-weight:800;padding:0 1.2mm}
.eA{background:#1a9641}.eB{background:#52b151}.eC{background:#a6d96a;color:#2E3B42}.eD{background:#fbcc10;color:#2E3B42}.eE{background:#fdae61}.eF{background:#f46d43}.eG{background:#d7191c}
.loc{display:flex;gap:2.4mm;align-items:center;padding:1.3mm 0;border-top:.3mm solid var(--mist)}
.loc:first-of-type{border-top:0}
.loc .ic{width:5mm;height:5mm}
.loc .lt{flex:1;font-size:8.2pt;line-height:1.25}.loc .lt b{display:block;font-size:8.4pt}.loc .lt span{font-size:7.4pt}.loc .lt span{color:var(--muted);font-weight:600}
.loc .lv{text-align:right;font-size:8.4pt;font-weight:800;line-height:1.25;white-space:nowrap}.loc .lv span{display:block;font-weight:600;color:var(--muted);font-size:7.4pt}
.strip{position:absolute;top:132mm;left:16mm;right:16mm;height:44mm;display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:3mm}
.strip div{border-radius:4.5mm;background:#ddd center/cover no-repeat}
.contact{position:absolute;top:181mm;left:16mm;right:16mm;height:45mm;display:grid;grid-template-columns:74mm minmax(0,1fr) minmax(0,1fr);gap:3.5mm}
.contact>*{min-width:0}
.agent{background:var(--deep);color:#fff;border-radius:5.5mm;padding:4.4mm 4.6mm;display:flex;gap:3.6mm;position:relative;overflow:hidden}
.agent::before{content:"";position:absolute;left:0;top:0;right:0;height:1.6mm;background:var(--sun)}
.agent .at{flex:1;min-width:0}
.agent .ak{white-space:nowrap;font-weight:800;font-size:7.2pt;letter-spacing:.14em;text-transform:uppercase;color:var(--lemon);margin-bottom:1mm}
.agent .an{font-family:var(--serif);font-weight:600;font-size:13.5pt;line-height:1.1;white-space:nowrap}
.agent .ar{font-size:7.8pt;opacity:.8;margin:.6mm 0 2.4mm}
.agent .at{display:flex;flex-direction:column;justify-content:center}
.agent .ap{font-size:7.6pt;line-height:1.4;opacity:.92;margin-bottom:2mm}
.agent .al{display:flex;align-items:center;gap:1.8mm;font-size:8.6pt;font-weight:700;margin-top:1.2mm;white-space:nowrap}
.agent .al .ic{width:4.2mm;height:4.2mm;stroke:var(--lemon)}
.qr{flex:none;width:22mm;text-align:center;align-self:center}
.qr div{background:#fff;border-radius:3mm;padding:1.4mm;width:22mm;height:22mm}
.qr img{width:100%;height:100%;display:block}
.qr span{display:block;font-size:6.6pt;font-weight:700;margin-top:1.2mm;opacity:.85;line-height:1.25}
.extra{border:.45mm solid var(--red);border-radius:5.5mm;padding:3.6mm 3.8mm;position:relative;overflow:hidden}
.extra .eh{display:flex;align-items:center;gap:2mm;font-family:var(--serif);font-weight:600;font-size:10.6pt;line-height:1.12;margin-bottom:1.4mm}
.extra .eh .ic{width:6mm;height:6mm}
.extra p{font-size:7.5pt;line-height:1.4;color:var(--ink2);margin-bottom:1.8mm}
.extra .eqr{display:flex;align-items:center;gap:2.4mm}
.extra .eqr img{width:13mm;height:13mm;border-radius:1.5mm;flex:none}
.extra .cta{display:inline-block;background:var(--lemonsoft);border-radius:99px;padding:1.2mm 3mm;font-size:7.4pt;font-weight:800;color:var(--ink);line-height:1.3}
.extra .eqr span{font-size:6.9pt;font-weight:700;color:var(--red);line-height:1.3}
.trust{position:absolute;top:231mm;left:16mm;right:16mm;display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.tr{background:var(--salt);border-radius:4.5mm;padding:2.6mm 3mm;border-top:1.3mm solid var(--red)}
.tr:nth-child(2){border-top-color:var(--coral)}.tr:nth-child(3){border-top-color:var(--lemon)}.tr:nth-child(4){border-top-color:var(--deep)}
.tr .tv{font-family:var(--serif);font-weight:700;font-size:15pt;line-height:1;display:flex;align-items:center;gap:1mm}
.tr .tv .ic{width:4.4mm;height:4.4mm;fill:var(--lemon);stroke:var(--lemon)}
.tr .tl{font-size:7pt;font-weight:700;color:var(--ink2);margin-top:1mm;line-height:1.25}
.chan{position:absolute;top:252mm;left:16mm;right:16mm;border:.45mm solid var(--red);border-radius:99px;padding:2.2mm 5mm;display:flex;align-items:center;justify-content:space-between;gap:2mm}
.chan .ck{font-weight:800;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:var(--red);white-space:nowrap}
.chan a{display:flex;align-items:center;gap:1.2mm;font-size:7.8pt;font-weight:700;color:var(--ink);text-decoration:none;white-space:nowrap}
.chan .ic{width:4.2mm;height:4.2mm}
.disc{position:absolute;left:16mm;right:16mm;top:269mm;font-size:6.8pt;line-height:1.45;color:var(--muted);text-align:center}
.disc b{display:block;color:var(--ink2);font-size:7.4pt;margin-bottom:.8mm}
`;

  const bg = u => u ? `style="background-image:url('${esc(u)}')"` : '';
  const page1 = `<section class="page">
  <div class="hero" ${bg(ph(0))}>
    <div class="hlogo"><img src="${A.logoSquare}" alt="Soltura Real Estate"></div>
    <div class="hpills"><span class="pill st">${esc(st)}</span><span class="pill ref">Ref. ${esc(ref)}</span></div>
    ${photos.length > 4 ? `<div class="hcount">${photos.length} ${T.photos} · gruposoltura.com</div>` : ''}
  </div>
  <div class="intro">
    <div>
      <div class="kick">${ic('pin')}${esc(place || p.town || '')}</div>
      <h1>${esc(cat)} ${L === 'nl' ? 'in' : L === 'es' ? 'en' : L === 'sv' ? 'i' : 'in'} <em>${esc(p.suburb || p.town || '')}</em></h1>
      <p class="sub">${esc((L === 'nl' ? p.summary_nl : L === 'sv' ? (p.summary_sv || p.summary_en) : p.summary_en) || '').replace(/\s*(Neem contact op|Contact Grupo Soltura|Enquire today|Vraag nu info aan)[^.]*\.?\s*$/i, '')}</p>
    </div>
    <div class="pricebox"><div class="pl">${T.price}</div><div class="pv">${price}</div></div>
  </div>
  <div class="stats">${stats.map(s => `<div class="stat">${ic(s[0])}<div class="sv">${s[1]}</div><div class="sl">${esc(s[2])}</div></div>`).join('')}</div>
  <div class="trio"><div ${bg(ph(1))}></div><div ${bg(ph(2))}></div><div ${bg(ph(3))}></div></div>
  <div class="p1foot"><span>${T.kicker.toUpperCase()} · <b>${esc(ref)}</b></span><span>GRUPOSOLTURA.COM · +34 664 414 515</span></div>
  <div class="sunbar"></div>
</section>`;

  const page2 = `<section class="page">
  <header class="ph-head"><img src="${A.logoWide}" alt="Soltura Real Estate"><span class="hl">${esc(cat)} · ${esc(p.town || '')} · Ref. ${esc(ref)}</span></header>
  <div class="body2">
    <div><div class="desc"><h2>${T.about}</h2>${desc.map(s => `<p>${esc(s)}</p>`).join('')}</div>
      ${loc.length ? `<div class="locs"><h3>${T.location}</h3><div class="lgrid">${loc.map(l => `<div class="lc">${ic(l[0])}<div><b>${l[1]}${l[2] ? ` <span>· ${l[2]}</span>` : ''}</b><i>${l[3]}${l[4] ? ` · ${l[4]}` : ''}</i></div></div>`).join('')}</div></div>` : ''}</div>
    <div>
      <div class="box"><h3>${T.features}</h3><ul class="ticks">${feats.slice(0, 10).map(f => `<li>${ic('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
        ${rows.length ? `<div style="margin-top:2.2mm">${rows.map(r => `<div class="kv"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>` : ''}</div>
      <div class="visit"><b>${ic('key')}${T.visitH}</b><p>${T.visitP(ag.name.split(' ')[0], telFmt(ag.tel))}</p></div>
    </div>
  </div>
  <div class="strip"><div ${bg(ph(4))}></div><div ${bg(ph(5))}></div><div ${bg(ph(6))}></div><div ${bg(ph(7))}></div></div>
  <div class="contact">
    <div class="agent">
      <div class="at"><div class="ak">${T.contactH}</div><div class="an">${esc(ag.name)}</div><div class="ar">${esc(ag.role)}</div>
        <div class="al">${ic('wa')}${telFmt(ag.tel)}</div><div class="al">${ic('mail')}${esc(ag.mail)}</div></div>
      <div class="qr"><div><img src="${qr(homeUrl)}" alt=""></div><span>${T.scan}</span></div>
    </div>
    <div class="extra"><div class="eh">${ic('book')}${T.guideH}</div><p>${T.guideP}</p><div class="eqr"><img src="${qr(guideUrl)}" alt=""><span>${guideUrl.replace('https://', '').replace(/\/$/, '').replace('.com/', '.com/<wbr>')}</span></div></div>
    <div class="extra"><div class="eh">${ic('euro')}${T.costH}</div><p>${T.costP}</p><span class="cta">${T.costCta}</span></div>
  </div>
  <div class="trust">
    <div class="tr"><div class="tv">2002</div><div class="tl">${T.since}</div></div>
    <div class="tr"><div class="tv">${score}${ic('star')}</div><div class="tl">${rcount ? rcount + ' ' : ''}${T.reviews}</div></div>
    <div class="tr"><div class="tv">992</div><div class="tl">${T.api} · COAPI Alicante</div></div>
    <div class="tr"><div class="tv">${T.oneFee}</div><div class="tl">${T.allin}</div></div>
  </div>
  <div class="chan"><span class="ck">${T.find}</span>
    <a>${ic('globe')}gruposoltura.com</a><a>${ic('insta')}@gruposoltura</a><a>${ic('fb')}/gruposoltura</a><a>${ic('yt')}Grupo Soltura</a><a>${ic('wa')}+34 664 414 515</a>
  </div>
  <div class="disc"><b>${T.office}: Avda. de la Constitución s/n, 03179 Formentera del Segura · ${T.officeHours}</b>${T.disc}</div>
  <div class="sunbar"></div>
</section>`;

  // ---------- variant 'window': een A4 voor intern gebruik (NEXUS-knop Brochure, etalage), Rick 26-10-2026 ----------
  // Zelfde data en huisstijl; kantoornummer en info@ i.p.v. de makelaar. Gereserveerd/verkocht: die tekst op de plek van de prijs, geen prijs.
  if (opt && opt.variant === 'window') {
    const W = { nl: { disc: 'Deze gegevens zijn een leidraad en maken geen deel uit van een contract.', scan: 'Scan voor alle foto\'s', api: 'Grupo Soltura SL is ingeschreven lid (nr. 992) van het Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)' },
      en: { disc: 'These details are intended as a guide and do not form part of a contract.', scan: 'Scan for all photos', api: 'Grupo Soltura SL is a registered member (No. 992) of the Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)' },
      es: { disc: 'Estos datos son orientativos y no forman parte de ningún contrato.', scan: 'Escanea para ver las fotos', api: 'Grupo Soltura SL es miembro colegiado (nº 992) del Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)' },
      sv: { disc: 'Uppgifterna är vägledande och ingår inte i något avtal.', scan: 'Skanna för alla bilder', api: 'Grupo Soltura SL är registrerad medlem (nr 992) i Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)' } }[L];
    const wstats = stats.filter(s => s[0] !== 'year' && s[0] !== 'sun').slice(0, 5);
    const elTxt = /^[A-G]$/.test(el) ? `<span class="welab e${el}">${el}</span>` : el === 'R' ? T.energyR : el === 'X' ? T.energyX : '';
    if (elTxt) wstats.push(['bolt', elTxt, T.energy]);
    const town = esc(p.town || ''), sub = esc(p.suburb || '');
    const wcss = css + `
.w-top{position:absolute;top:8mm;left:12mm;right:12mm;height:30mm;display:flex;align-items:center;justify-content:space-between}
.w-top .lg{height:17mm;display:block}
.w-mid{flex:1;text-align:center;padding:0 6mm}
.w-disc{font-size:7.2pt;color:var(--muted);margin-bottom:2.4mm}
.w-ref{display:inline-block;border:.5mm solid var(--red);border-radius:99px;padding:1.4mm 4.4mm;font-weight:800;font-size:10pt;letter-spacing:.14em;color:var(--ink)}
.w-ref b{color:var(--red)}
.w-qr{text-align:center;width:28mm}
.w-qr img{width:24mm;height:24mm;display:block;margin:0 auto}
.w-qr span{display:block;font-size:6.6pt;font-weight:700;color:var(--ink2);margin-top:1mm;line-height:1.2}
.w-hero{position:absolute;top:42mm;left:12mm;right:12mm;height:118mm;border-radius:6mm;background:#ddd center/cover no-repeat}
.w-thumbs{position:absolute;top:164mm;left:12mm;right:12mm;height:42mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.w-thumbs div{border-radius:4mm;background:#ddd center/cover no-repeat}
.w-low{position:absolute;top:209mm;bottom:22mm;left:12mm;right:12mm;display:flex;flex-direction:column}
.w-title{text-align:center}
.w-title h1{font-family:var(--serif);font-weight:600;font-size:23pt;line-height:1.1;color:var(--ink)}
.w-title h1 em{font-weight:700}
.w-title .cat{font-size:11.5pt;font-weight:600;color:var(--ink2);margin-top:.8mm}
.w-title .pr{font-family:var(--serif);font-weight:700;font-size:40pt;line-height:1.05;color:var(--red);margin-top:1.6mm}
.w-title .pr.pst{display:inline-block;font-size:30pt;color:var(--ink);background:var(--lemon);border-radius:99px;padding:1mm 9mm 2mm;margin-top:3mm}
.w-stats{margin:auto 0;display:grid;grid-template-columns:repeat(${Math.max(wstats.length, 1)},1fr);gap:3mm}
.w-stat{background:var(--salt);border-radius:3.5mm;padding:2.2mm 2mm;text-align:center}
.w-stat .ic{width:6.4mm;height:6.4mm;display:block;margin:0 auto 1mm}
.w-stat .v{font-weight:800;font-size:12pt;line-height:1.15}
.w-stat .v small{font-size:8.5pt;font-weight:700}
.w-stat .l{font-size:7.4pt;color:var(--muted);font-weight:600;margin-top:.4mm}
.welab{display:inline-block;min-width:8mm;border-radius:1.6mm;color:#fff;font-weight:800;padding:0 1.6mm;line-height:1.3}
.w-stat .v .welab{font-size:11pt}
.w-bar{position:absolute;left:0;right:0;bottom:7mm;height:15mm;background:var(--sun);display:grid;grid-template-columns:repeat(3,1fr);align-items:center;padding:0 12mm}
.w-bar a{color:#fff;font-weight:800;font-size:11pt;display:flex;align-items:center;gap:2.4mm;text-decoration:none}
.w-bar a:nth-child(2){justify-content:center}.w-bar a:nth-child(3){justify-content:flex-end}
.w-bar .ic{stroke:#fff;width:5.6mm;height:5.6mm}
.w-api{position:absolute;left:12mm;right:12mm;bottom:1.8mm;text-align:center;font-size:6.6pt;color:var(--muted)}`;
    const wpage = `<section class="page">
  <div class="w-top"><img class="lg" src="${A.logoWide}" alt="Soltura Real Estate">
    <div class="w-mid"><div class="w-disc">${W.disc}</div><span class="w-ref">REF <b>${esc(ref)}</b></span></div>
    <div class="w-qr"><img src="${qr(homeUrl)}" alt=""><span>${W.scan}</span></div></div>
  <div class="w-hero" ${bg(ph(0))}></div>
  <div class="w-thumbs"><div ${bg(ph(1))}></div><div ${bg(ph(2))}></div><div ${bg(ph(3))}></div></div>
  <div class="w-low"><div class="w-title"><h1>${sub && sub !== town ? sub + ' ' : ''}<em>${town}</em></h1><div class="cat">${esc(cat)}</div>${st !== T.forSale ? `<div class="pr pst">${st}</div>` : `<div class="pr">${price}</div>`}</div>
  <div class="w-stats">${wstats.map(s => `<div class="w-stat">${s[0] ? ic(s[0]) : ''}<div class="v">${s[1]}</div><div class="l">${esc(s[2])}</div></div>`).join('')}</div></div>
  <div class="w-bar"><a>${ic('phone')}+34 966 792 113</a><a>${ic('globe')}www.gruposoltura.com</a><a>${ic('mail')}info@gruposoltura.com</a></div>
  <div class="w-api">${W.api}</div>
</section>`;
    return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${esc(T.kicker)} ${esc(ref)}</title><style>${wcss}</style></head><body>${wpage}</body></html>`;
  }

  return `<!DOCTYPE html><html lang="${L}"><head><meta charset="utf-8"><title>${esc(T.kicker)} ${esc(ref)}</title><style>${css}</style></head><body>${page1}${page2}</body></html>`;
}
if (typeof module !== 'undefined') module.exports = { buildBrochure };
