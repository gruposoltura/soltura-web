/* Grupo Soltura website — Makelaarsportaal met live assistent Sola (24-10-2026).
   /en/agents/ · /nl/makelaars/ · /sv/maklare/  (agents.gruposoltura.com verwijst hierheen via een Cloudflare-regel; geen link op de site, noindex)
   1. Venster: e-mailadres. Alleen een bekende samenwerkende makelaar (contact met label agent in NEXUS) komt verder;
      een onbekend adres gaat terug naar de homepage.
   2. Gesprek met Sola, dezelfde stappen en verplichte velden als een mail aan viewing@gruposoltura.com
      (n8n JARVIS-AppointmentAgent-v2): woningreferentie -> voor- en achternaam klant -> dag -> tijd -> versturen.
      Tussendoor controleert Sola of de woning bestaat en beschikbaar is (onder bod = geen bezichtigingen) en of wij de sleutels hebben.
   3. Edge function agent-viewing verwerkt de aanvraag precies zoals de mailflow (suspect + aanvraag in NEXUS met de makelaar als aanbrenger,
      bevestigingsmail aan de makelaar, melding aan de verkoper, regel in menu Bezichtiging), alleen met bron 'agent-portal'.
   Testen: ?test=1 -> niets in NEXUS, mails alleen naar rick@.
   Gedeeld door de app (PARTNERS.html + PARTNERS.bind) en de statische build (PARTNERS.html). */
(function (root) {
  'use strict';
  var NAME = 'Sola';
  function avatar(size, cls) { var s = size > 96 ? 256 : size > 48 ? 128 : 64; return '<img class="ava-img' + (cls ? ' ' + cls : '') + '" src="/icons/ava-' + s + '.webp" width="' + size + '" height="' + size + '" alt="' + NAME + '" loading="lazy" decoding="async">'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ICO = {
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L21 3l-7.5 18-2.5-7.5z"/></svg>',
    key: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="M3 6l9 7 9-7"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  };
  var LOC = { nl: 'nl-NL', en: 'en-GB', es: 'es-ES', sv: 'sv-SE' };
  var CHAT_LANGS = [['en', 'EN'], ['nl', 'NL'], ['es', 'ES'], ['sv', 'SV']];

  var TX = {
    en: {
      title: 'Partner agents', uo: 'Under offer / not available', kicker: 'For our partner agents', h1: 'Book a viewing in real time', h1_hi: function (f) { return 'Welcome, ' + f; },
      lead: 'Book a viewing for your client in a two-minute chat with ' + NAME + '. Your request goes straight into our system and to the sales advisor responsible for the home.',
      f: [['bolt', 'Real time', 'No waiting for an email: ' + NAME + ' checks the property and processes your request on the spot.'],
        ['key', 'Keys', 'You immediately know whether we hold the keys to the home.'],
        ['user', 'Your contact', 'You get the name, email and mobile of the responsible sales advisor.']],
      email_alt: 'Prefer email? viewing@gruposoltura.com still works as before.',
      g_h: 'Partner agents only', g_p: 'Enter the email address you are registered with as a partner agent of Soltura Real Estate.', g_ph: 'your@agency.com', g_btn: 'Continue', g_bad: 'Please enter a valid email address.',
      g_busy: 'Checking…', g_rate: 'Too many attempts. Please try again in a few minutes.', g_err: 'Something went wrong. Please try again.',
      g_no: 'This address is not registered with us as a partner agent. We are taking you to our homepage.', g_no2: 'Want to work with us? Email viewing@gruposoltura.com.',
      sub: 'Live viewing assistant', logout: 'Not you? Log out', test: 'TEST MODE · nothing is saved, emails go to Rick only',
      hi: function (f, c) { return 'Hi ' + f + '! Great to have you here' + (c ? ' on behalf of ' + c : '') + '. I will book the viewing for your client right away.'; },
      ask_ref: 'Which home would your client like to see? Type our reference (for example RH550) or paste the link to the home.', ph_ref: 'Reference or link',
      looking: function (r) { return 'One moment, I am looking up ' + r + '…'; },
      nf: function (r) { return 'I cannot find ' + r + ' in our listings. Our references are two letters and three digits, for example RH550. Could you check it?'; },
      no_ref: 'I did not catch a reference there. Our references are two letters and three digits, for example RH550.',
      na: function (r) { return 'Sorry, ' + r + ' is under offer or no longer on the market, so we are not doing viewings for it right now. Shall we pick another home?'; },
      keys_yes: function (r) { return 'Good news: we hold the keys to this home. ' + r + ' will arrange the key handover with you.'; },
      keys_no: function (r) { return 'We do not hold the keys to this home; ' + r + ' will arrange the appointment with you.'; },
      is_it: 'Is this the right home?', yes_home: 'Yes, that one', other_home: 'Another home',
      ask_first: 'Lovely home! What is your client\'s first name?', ph_first: 'First name client', ask_last: function (f) { return 'And ' + f + '\'s last name?'; }, ph_last: 'Last name client',
      ask_day: function (f) { return 'Which day would ' + f + ' like to come?'; }, other_day: 'Another day', ph_day: 'e.g. Friday 7 November',
      ask_time: 'And at what time? Our office is open Monday to Friday from 10:00 to 14:00; other times by arrangement.', other_time: 'Another time', ph_time: 'e.g. 15:30',
      sum_h: 'Your viewing request', sum: 'All set? Then I will send it straight to our team.', r_home: 'Home', r_client: 'Client', r_day: 'Day', r_time: 'Time', r_keys: 'Keys',
      keys_y: 'with us', keys_n: 'not with us', send: 'Send request', change: 'Change something', which: 'What would you like to change?',
      sending: 'Processing your request…',
      done_h: 'Request processed!', done: function (f, r, rep) { return 'Fantastic, ' + f + '! Your viewing request for ' + r + ' has been processed and forwarded to ' + rep + ', the sales advisor for this home. ' + rep + ' will contact you shortly to confirm the appointment.'; },
      done_keys: function (rep) { return 'We hold the keys, so ' + rep + ' will also arrange the key handover with you.'; },
      done_mail: 'You will also receive a confirmation by email.', done_test: 'Test mode: the emails went to Rick only and nothing was saved in NEXUS.',
      rep_h: 'Your contact for this viewing', another: 'Book another viewing',
      dup: 'This request had already reached us. Our team is on it.',
      fail: 'Our system could not process the request just now. Our team has been alerted and will contact you personally.',
      neterr: 'I could not reach our system. Please try again.', retry: 'Try again', expired: 'Your session has expired. Please enter your email address again.',
      next_another: function (f) { return 'Shall I book another viewing for you, ' + f + '?'; },
    },
    nl: {
      title: 'Makelaarsportaal', uo: 'Onder bod / niet beschikbaar', kicker: 'Voor onze samenwerkende makelaars', h1: 'Vraag realtime een bezichtiging aan', h1_hi: function (f) { return 'Welkom, ' + f; },
      lead: 'Vraag in een gesprek van twee minuten met ' + NAME + ' een bezichtiging aan voor je klant. Je aanvraag gaat direct ons systeem in en naar de verkoper die verantwoordelijk is voor de woning.',
      f: [['bolt', 'Realtime', 'Geen wachten op een mail: ' + NAME + ' controleert de woning en verwerkt je aanvraag meteen.'],
        ['key', 'Sleutels', 'Je weet direct of wij de sleutels van de woning hebben.'],
        ['user', 'Je contactpersoon', 'Je krijgt de naam, het e-mailadres en mobiele nummer van de verantwoordelijke verkoper.']],
      email_alt: 'Liever per e-mail? viewing@gruposoltura.com werkt gewoon zoals altijd.',
      g_h: 'Alleen voor samenwerkende makelaars', g_p: 'Vul het e-mailadres in waarmee je bij Soltura Real Estate bent geregistreerd als samenwerkende makelaar.', g_ph: 'jij@makelaardij.nl', g_btn: 'Verder', g_bad: 'Vul een geldig e-mailadres in.',
      g_busy: 'Even controleren…', g_rate: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.', g_err: 'Er ging iets mis. Probeer het opnieuw.',
      g_no: 'Dit adres is bij ons niet bekend als samenwerkende makelaar. We brengen je naar onze homepage.', g_no2: 'Wil je met ons samenwerken? Mail naar viewing@gruposoltura.com.',
      sub: 'Live bezichtigingsassistent', logout: 'Niet u? Uitloggen', test: 'TESTMODUS · er wordt niets opgeslagen, mails gaan alleen naar Rick',
      hi: function (f, c) { return 'Hoi ' + f + '! Fijn dat je er bent' + (c ? ' namens ' + c : '') + '. Ik regel de bezichtiging voor je klant meteen.'; },
      ask_ref: 'Welke woning wil je klant zien? Typ onze referentie (bijvoorbeeld RH550) of plak de link naar de woning.', ph_ref: 'Referentie of link',
      looking: function (r) { return 'Moment, ik zoek ' + r + ' op…'; },
      nf: function (r) { return 'Ik kan ' + r + ' niet vinden in ons aanbod. Onze referenties zijn twee letters en drie cijfers, bijvoorbeeld RH550. Wil je hem even controleren?'; },
      no_ref: 'Daar zie ik geen referentie in. Onze referenties zijn twee letters en drie cijfers, bijvoorbeeld RH550.',
      na: function (r) { return 'Helaas, ' + r + ' staat onder bod of is niet meer in de verkoop, dus daar doen we nu geen bezichtigingen. Zullen we een andere woning kiezen?'; },
      keys_yes: function (r) { return 'Goed nieuws: wij hebben de sleutels van deze woning. ' + r + ' regelt de sleuteloverdracht met je.'; },
      keys_no: function (r) { return 'Wij hebben de sleutels van deze woning niet; ' + r + ' regelt de afspraak met je.'; },
      is_it: 'Is dit de juiste woning?', yes_home: 'Ja, deze', other_home: 'Andere woning',
      ask_first: 'Mooie woning! Wat is de voornaam van je klant?', ph_first: 'Voornaam klant', ask_last: function (f) { return 'En de achternaam van ' + f + '?'; }, ph_last: 'Achternaam klant',
      ask_day: function (f) { return 'Op welke dag wil ' + f + ' komen kijken?'; }, other_day: 'Andere dag', ph_day: 'bijv. vrijdag 7 november',
      ask_time: 'En hoe laat? Ons kantoor is open van maandag tot en met vrijdag van 10:00 tot 14:00; andere tijden in overleg.', other_time: 'Andere tijd', ph_time: 'bijv. 15:30',
      sum_h: 'Je bezichtigingsaanvraag', sum: 'Klopt alles? Dan stuur ik hem direct door naar ons team.', r_home: 'Woning', r_client: 'Klant', r_day: 'Dag', r_time: 'Tijd', r_keys: 'Sleutels',
      keys_y: 'bij ons', keys_n: 'niet bij ons', send: 'Aanvraag versturen', change: 'Iets wijzigen', which: 'Wat wil je wijzigen?',
      sending: 'Je aanvraag wordt verwerkt…',
      done_h: 'Aanvraag verwerkt!', done: function (f, r, rep) { return 'Top, ' + f + '! Je bezichtigingsaanvraag voor ' + r + ' is verwerkt en doorgestuurd naar ' + rep + ', de verkoper van deze woning. ' + rep + ' neemt snel contact met je op om de afspraak te bevestigen.'; },
      done_keys: function (rep) { return 'Wij hebben de sleutels, dus ' + rep + ' regelt ook de sleuteloverdracht met je.'; },
      done_mail: 'Je ontvangt ook een bevestiging per e-mail.', done_test: 'Testmodus: de mails gingen alleen naar Rick en er is niets opgeslagen in NEXUS.',
      rep_h: 'Jouw contactpersoon voor deze bezichtiging', another: 'Nog een bezichtiging aanvragen',
      dup: 'Deze aanvraag was al bij ons binnen. Ons team is ermee bezig.',
      fail: 'Ons systeem kon de aanvraag zojuist niet verwerken. Ons team is gewaarschuwd en neemt persoonlijk contact met je op.',
      neterr: 'Ik kon ons systeem niet bereiken. Probeer het nog eens.', retry: 'Opnieuw proberen', expired: 'Je sessie is verlopen. Vul je e-mailadres opnieuw in.',
      next_another: function (f) { return 'Zal ik nog een bezichtiging voor je regelen, ' + f + '?'; },
    },
    es: {
      title: 'Portal de agentes', uo: 'Reservada / no disponible', kicker: 'Para nuestros agentes colaboradores', h1: 'Solicite una visita en tiempo real', h1_hi: function (f) { return 'Bienvenido/a, ' + f; },
      lead: 'Solicite una visita para su cliente en una conversación de dos minutos con ' + NAME + '. Su solicitud entra directamente en nuestro sistema y llega al asesor responsable de la vivienda.',
      f: [['bolt', 'En tiempo real', 'Sin esperar un correo: ' + NAME + ' comprueba la vivienda y tramita su solicitud al momento.'],
        ['key', 'Llaves', 'Sabrá enseguida si tenemos las llaves de la vivienda.'],
        ['user', 'Su contacto', 'Recibe el nombre, correo y móvil del asesor responsable.']],
      email_alt: '¿Prefiere el correo? viewing@gruposoltura.com sigue funcionando como siempre.',
      g_h: 'Solo para agentes colaboradores', g_p: 'Introduzca el correo con el que está registrado como agente colaborador de Soltura Real Estate.', g_ph: 'su@agencia.es', g_btn: 'Continuar', g_bad: 'Introduzca un correo válido.',
      g_busy: 'Comprobando…', g_rate: 'Demasiados intentos. Inténtelo de nuevo en unos minutos.', g_err: 'Algo ha fallado. Inténtelo de nuevo.',
      g_no: 'Este correo no figura como agente colaborador. Le llevamos a nuestra página principal.', g_no2: '¿Quiere colaborar con nosotros? Escriba a viewing@gruposoltura.com.',
      sub: 'Asistente de visitas en directo', logout: '¿No es usted? Cerrar sesión', test: 'MODO PRUEBA · no se guarda nada, los correos van solo a Rick',
      hi: function (f, c) { return '¡Hola ' + f + '! Qué bien tenerte aquí' + (c ? ' en nombre de ' + c : '') + '. Organizo la visita para tu cliente ahora mismo.'; },
      ask_ref: '¿Qué vivienda quiere ver tu cliente? Escribe nuestra referencia (por ejemplo RH550) o pega el enlace de la vivienda.', ph_ref: 'Referencia o enlace',
      looking: function (r) { return 'Un momento, busco ' + r + '…'; },
      nf: function (r) { return 'No encuentro ' + r + ' en nuestra oferta. Nuestras referencias son dos letras y tres cifras, por ejemplo RH550. ¿Puedes comprobarla?'; },
      no_ref: 'No veo ninguna referencia. Nuestras referencias son dos letras y tres cifras, por ejemplo RH550.',
      na: function (r) { return 'Lo siento, ' + r + ' está reservada o ya no está a la venta, así que ahora no hacemos visitas. ¿Elegimos otra vivienda?'; },
      keys_yes: function (r) { return 'Buenas noticias: tenemos las llaves de esta vivienda. ' + r + ' organizará contigo la entrega de llaves.'; },
      keys_no: function (r) { return 'No tenemos las llaves de esta vivienda; ' + r + ' organizará la cita contigo.'; },
      is_it: '¿Es esta la vivienda correcta?', yes_home: 'Sí, esta', other_home: 'Otra vivienda',
      ask_first: '¡Bonita vivienda! ¿Cuál es el nombre de tu cliente?', ph_first: 'Nombre del cliente', ask_last: function (f) { return '¿Y los apellidos de ' + f + '?'; }, ph_last: 'Apellidos del cliente',
      ask_day: function (f) { return '¿Qué día quiere venir ' + f + '?'; }, other_day: 'Otro día', ph_day: 'p. ej. viernes 7 de noviembre',
      ask_time: '¿Y a qué hora? Nuestra oficina abre de lunes a viernes de 10:00 a 14:00; otros horarios con cita.', other_time: 'Otra hora', ph_time: 'p. ej. 15:30',
      sum_h: 'Tu solicitud de visita', sum: '¿Todo correcto? Entonces la envío directamente a nuestro equipo.', r_home: 'Vivienda', r_client: 'Cliente', r_day: 'Día', r_time: 'Hora', r_keys: 'Llaves',
      keys_y: 'las tenemos', keys_n: 'no las tenemos', send: 'Enviar solicitud', change: 'Cambiar algo', which: '¿Qué quieres cambiar?',
      sending: 'Tramitando tu solicitud…',
      done_h: '¡Solicitud tramitada!', done: function (f, r, rep) { return '¡Estupendo, ' + f + '! Tu solicitud de visita para ' + r + ' se ha tramitado y se ha enviado a ' + rep + ', el asesor de esta vivienda. ' + rep + ' se pondrá en contacto contigo en breve para confirmar la cita.'; },
      done_keys: function (rep) { return 'Tenemos las llaves, así que ' + rep + ' también organizará contigo la entrega de llaves.'; },
      done_mail: 'También recibirás una confirmación por correo.', done_test: 'Modo prueba: los correos han ido solo a Rick y no se ha guardado nada en NEXUS.',
      rep_h: 'Tu contacto para esta visita', another: 'Solicitar otra visita',
      dup: 'Esta solicitud ya nos había llegado. Nuestro equipo se está ocupando.',
      fail: 'Nuestro sistema no ha podido tramitar la solicitud ahora mismo. Hemos avisado al equipo y te contactarán personalmente.',
      neterr: 'No he podido conectar con nuestro sistema. Inténtalo de nuevo.', retry: 'Reintentar', expired: 'Tu sesión ha caducado. Vuelve a introducir tu correo.',
      next_another: function (f) { return '¿Organizo otra visita para ti, ' + f + '?'; },
    },
    sv: {
      title: 'Mäklarportal', uo: 'Reserverad / ej tillgänglig', kicker: 'För våra samarbetande mäklare', h1: 'Boka en visning i realtid', h1_hi: function (f) { return 'Välkommen, ' + f; },
      lead: 'Boka en visning för din kund i ett tvåminuterssamtal med ' + NAME + '. Förfrågan går direkt in i vårt system och till den säljare som ansvarar för bostaden.',
      f: [['bolt', 'Realtid', 'Ingen väntan på mejl: ' + NAME + ' kontrollerar bostaden och behandlar förfrågan direkt.'],
        ['key', 'Nycklar', 'Du ser direkt om vi har nycklarna till bostaden.'],
        ['user', 'Din kontakt', 'Du får namn, e-post och mobilnummer till den ansvariga säljaren.']],
      email_alt: 'Hellre e-post? viewing@gruposoltura.com fungerar som vanligt.',
      g_h: 'Endast för samarbetande mäklare', g_p: 'Ange e-postadressen du är registrerad med som samarbetande mäklare hos Soltura Real Estate.', g_ph: 'du@maklarbyra.se', g_btn: 'Fortsätt', g_bad: 'Ange en giltig e-postadress.',
      g_busy: 'Kontrollerar…', g_rate: 'För många försök. Försök igen om några minuter.', g_err: 'Något gick fel. Försök igen.',
      g_no: 'Den här adressen är inte registrerad hos oss som samarbetande mäklare. Vi tar dig till vår startsida.', g_no2: 'Vill du samarbeta med oss? Mejla viewing@gruposoltura.com.',
      sub: 'Live-visningsassistent', logout: 'Inte du? Logga ut', test: 'TESTLÄGE · inget sparas, mejlen går bara till Rick',
      hi: function (f, c) { return 'Hej ' + f + '! Kul att du är här' + (c ? ' för ' + c : '') + '. Jag bokar visningen för din kund direkt.'; },
      ask_ref: 'Vilken bostad vill din kund se? Skriv vår referens (till exempel RH550) eller klistra in länken till bostaden.', ph_ref: 'Referens eller länk',
      looking: function (r) { return 'Ett ögonblick, jag letar upp ' + r + '…'; },
      nf: function (r) { return 'Jag hittar inte ' + r + ' bland våra bostäder. Våra referenser är två bokstäver och tre siffror, till exempel RH550. Kan du kontrollera den?'; },
      no_ref: 'Jag ser ingen referens där. Våra referenser är två bokstäver och tre siffror, till exempel RH550.',
      na: function (r) { return 'Tyvärr, ' + r + ' är reserverad eller inte längre till salu, så vi gör inga visningar just nu. Ska vi välja en annan bostad?'; },
      keys_yes: function (r) { return 'Goda nyheter: vi har nycklarna till den här bostaden. ' + r + ' ordnar nyckelöverlämningen med dig.'; },
      keys_no: function (r) { return 'Vi har inte nycklarna till den här bostaden; ' + r + ' ordnar visningen med dig.'; },
      is_it: 'Är det rätt bostad?', yes_home: 'Ja, den', other_home: 'En annan bostad',
      ask_first: 'Fin bostad! Vad heter din kund i förnamn?', ph_first: 'Kundens förnamn', ask_last: function (f) { return 'Och ' + f + 's efternamn?'; }, ph_last: 'Kundens efternamn',
      ask_day: function (f) { return 'Vilken dag vill ' + f + ' komma?'; }, other_day: 'En annan dag', ph_day: 't.ex. fredag 7 november',
      ask_time: 'Och vilken tid? Vårt kontor är öppet måndag till fredag 10:00–14:00; andra tider efter överenskommelse.', other_time: 'En annan tid', ph_time: 't.ex. 15:30',
      sum_h: 'Din visningsförfrågan', sum: 'Stämmer allt? Då skickar jag den direkt till vårt team.', r_home: 'Bostad', r_client: 'Kund', r_day: 'Dag', r_time: 'Tid', r_keys: 'Nycklar',
      keys_y: 'hos oss', keys_n: 'inte hos oss', send: 'Skicka förfrågan', change: 'Ändra något', which: 'Vad vill du ändra?',
      sending: 'Din förfrågan behandlas…',
      done_h: 'Förfrågan behandlad!', done: function (f, r, rep) { return 'Toppen, ' + f + '! Din visningsförfrågan för ' + r + ' är behandlad och skickad till ' + rep + ', säljaren för den här bostaden. ' + rep + ' hör av sig snart för att bekräfta tiden.'; },
      done_keys: function (rep) { return 'Vi har nycklarna, så ' + rep + ' ordnar även nyckelöverlämningen med dig.'; },
      done_mail: 'Du får också en bekräftelse via e-post (på engelska).', done_test: 'Testläge: mejlen gick bara till Rick och inget sparades i NEXUS.',
      rep_h: 'Din kontakt för visningen', another: 'Boka en visning till',
      dup: 'Den här förfrågan hade redan kommit fram. Vårt team arbetar med den.',
      fail: 'Vårt system kunde inte behandla förfrågan just nu. Teamet har larmats och kontaktar dig personligen.',
      neterr: 'Jag nådde inte vårt system. Försök igen.', retry: 'Försök igen', expired: 'Din session har gått ut. Ange din e-postadress igen.',
      next_another: function (f) { return 'Ska jag boka en visning till åt dig, ' + f + '?'; },
    },
  };
  function L(l) { return TX[l] || TX.en; }

  // ---------- pagina (app en statische build) ----------
  function html(lang) {
    var t = L(lang);
    return '<section class="gd-hero ag-hero"><div class="gd-hero-in">' +
      '<div class="gd-hero-txt"><div class="gd-ava">' + avatar(176, 'gd-ava-img') + '<span class="gd-ava-tag"><i></i>online</span></div>' +
      '<p class="kicker">' + esc(t.kicker) + '</p><h1 id="agH1">' + esc(t.h1) + '</h1><p class="gd-lead">' + esc(t.lead) + '</p>' +
      '<ul class="ag-feats">' + t.f.map(function (f) { return '<li><span class="ag-fi">' + ICO[f[0]] + '</span><div><b>' + esc(f[1]) + '</b><span>' + esc(f[2]) + '</span></div></li>'; }).join('') + '</ul>' +
      '<p class="ag-alt">' + ICO.mail + esc(t.email_alt) + '</p></div>' +
      '<div class="sol-panel ag-panel" id="agPanel"><div class="sol-head"><div class="chat-av">' + avatar(46) + '<i class="online"></i></div>' +
      '<div><h2>' + esc(NAME) + '</h2><p>' + esc(t.sub) + '</p></div>' +
      '<div class="ag-langs" role="group" aria-label="Language">' + CHAT_LANGS.map(function (c) { return '<button type="button" data-cl="' + c[0] + '"' + (c[0] === lang ? ' aria-pressed="true"' : '') + '>' + c[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="ag-test" id="agTest" hidden></div>' +
      '<div class="sol-log" id="solLog" aria-live="polite"></div><div class="sol-chips" id="solChips"></div>' +
      '<form class="sol-form" id="solForm" autocomplete="off" hidden><input id="solIn" autocomplete="off"><button type="submit" aria-label="OK">' + ICO.send + '</button></form>' +
      '<p class="sol-note ag-note"><button type="button" class="ag-logout" id="agLogout" hidden></button></p></div>' +
      '</div></section>' +
      // e-mailvenster (wordt door de app geopend zolang er geen sessie is)
      '<div class="ag-gate" id="agGate" role="dialog" aria-modal="true" aria-labelledby="agGateH" hidden><form class="ag-gate-box" id="agGateForm" novalidate>' +
      '<div class="ag-gate-av">' + avatar(96) + '<span class="ag-gate-lock">' + ICO.lock + '</span></div>' +
      '<h2 id="agGateH">' + esc(t.g_h) + '</h2><p>' + esc(t.g_p) + '</p>' +
      '<input type="email" id="agGateIn" name="email" autocomplete="email" inputmode="email" placeholder="' + esc(t.g_ph) + '" aria-label="' + esc(t.g_ph) + '" required>' +
      '<button class="btn primary" type="submit" id="agGateBtn">' + esc(t.g_btn) + '</button><p class="ag-gate-msg" id="agGateMsg" aria-live="polite"></p></form></div>';
  }

  // ---------- gedrag ----------
  // d: { fn(name, body), go(path), home: '/en/', track, test: bool, ss: {get,set} (sessionStorage), meta: () => ({page_url}) }
  function bind(rootEl, lang, d) {
    var $ = function (s) { return rootEl.querySelector(s); };
    var log = $('#solLog'), chips = $('#solChips'), form = $('#solForm'), input = $('#solIn');
    var gate = $('#agGate'), gForm = $('#agGateForm'), gIn = $('#agGateIn'), gMsg = $('#agGateMsg'), gBtn = $('#agGateBtn');
    if (!log || !gate) return;
    var cl = lang, t = L(lang), tg = L(lang);
    var ses = d.ss.get('agent', null);
    if (ses && !(ses.token && ses.exp > Date.now())) ses = null;
    var st = {};
    function reset() { st = { step: '', prop: null, first: '', last: '', day: '', time: '', editing: false, busy: false, nonce: '' }; }
    reset();

    if (d.test) { var tb = $('#agTest'); tb.hidden = false; tb.textContent = t.test; }

    // ----- chat-helpers (zelfde ritme als de woongids) -----
    function scroll() { log.scrollTop = log.scrollHeight; }
    function say(text, cls) {
      return new Promise(function (res) {
        var ty = document.createElement('div'); ty.className = 'sol-msg a typing'; ty.innerHTML = '<span></span><span></span><span></span>';
        log.appendChild(ty); scroll();
        var len = typeof text === 'string' ? text.length : 60;
        setTimeout(function () { ty.remove(); var m = document.createElement('div'); m.className = 'sol-msg a' + (cls ? ' ' + cls : ''); if (typeof text === 'string') m.textContent = text; else m.appendChild(text); log.appendChild(m); scroll(); res(m); }, Math.min(1000, 360 + len * 8));
      });
    }
    function me(text) { var m = document.createElement('div'); m.className = 'sol-msg u'; m.textContent = text; log.appendChild(m); scroll(); return m; }
    function node(htmlStr, cls) { var el = document.createElement('div'); el.className = cls; el.innerHTML = htmlStr; log.appendChild(el); scroll(); return el; }
    function setChips(list, onPick) {
      chips.innerHTML = '';
      (list || []).forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c[1]; if (c[2]) b.className = c[2]; b.onclick = function () { chips.innerHTML = ''; onPick(c[0], c[1]); }; chips.appendChild(b); });
    }
    function ask(step, ph, type, ac) {
      st.step = step; input.value = ''; input.type = type || 'text'; input.placeholder = ph; input.setAttribute('aria-label', ph);
      input.autocomplete = ac || 'off'; form.hidden = false; input.disabled = false;
      setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
    }
    function hideInput() { form.hidden = true; }
    function titleCase(s) { return s.replace(/\s+/g, ' ').trim().split(' ').map(function (w) { return /^(van|de|der|den|het|ten|ter|von|da|del|la|le|y)$/i.test(w) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1); }).join(' '); }
    function cleanName(v) { return titleCase(String(v).replace(/[^\p{L}\p{M}' .-]/gu, ' ')); }
    function parseRef(v) {
      var s = String(v || ''), m = s.match(/\/(?:property|woning|bostad|home)\/([a-z]{1,4}\d{2,6})/i) || s.match(/\b([a-z]{1,4})\s?-?\s?(\d{2,6})\b/i);
      return m ? (m[2] ? m[1] + m[2] : m[1]).toUpperCase() : '';
    }
    function price(n) { return n == null ? '' : new Intl.NumberFormat(LOC[cl] || 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n); }
    function repName() { return (st.prop && st.prop.rep_first) || 'our team'; }
    function call(body) {
      return d.fn('agent-viewing', Object.assign({ token: ses && ses.token }, body)).catch(function () { return { ok: false, error: 'net' }; }).then(function (r) {
        if (r && r.error === 'session') { expire(); throw new Error('session'); }
        return r || { ok: false };
      });
    }
    function expire() { d.ss.set('agent', null); ses = null; log.innerHTML = ''; chips.innerHTML = ''; hideInput(); openGate(t.expired); }

    // ----- taalknoppen in het paneel -----
    rootEl.querySelectorAll('[data-cl]').forEach(function (b) {
      b.onclick = function () {
        cl = b.dataset.cl; t = L(cl);
        rootEl.querySelectorAll('[data-cl]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (d.test) $('#agTest').textContent = t.test;
        var lo = $('#agLogout'); if (lo && !lo.hidden) lo.textContent = t.logout;
        if (!st.step || st.step === 'ref') { input.placeholder = t.ph_ref; }
      };
    });

    // ----- 1. e-mailvenster -----
    function openGate(msg) {
      gate.hidden = false; document.body.classList.add('ag-locked');
      gMsg.textContent = msg || ''; gMsg.className = 'ag-gate-msg'; gBtn.disabled = false; gBtn.textContent = tg.g_btn;
      setTimeout(function () { gIn.focus(); }, 60);
    }
    function closeGate() { gate.hidden = true; document.body.classList.remove('ag-locked'); }
    gForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = gIn.value.trim().toLowerCase().replace(/\s+/g, '');
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em)) { gMsg.textContent = tg.g_bad; gMsg.className = 'ag-gate-msg err'; return; }
      gBtn.disabled = true; gBtn.textContent = tg.g_busy; gMsg.textContent = '';
      d.fn('agent-viewing', { action: 'check', email: em }).catch(function () { return { ok: false }; }).then(function (r) {
        if (r && r.known && r.token) {
          ses = { token: r.token, email: em, first: r.agent.first_name || '', last: r.agent.last_name || '', company: r.agent.company || '', lang: r.agent.language || null, exp: Date.now() + 5.5 * 3600000 };
          d.ss.set('agent', ses);
          if (d.track) d.track('agent_portal_login');
          closeGate(); start();
          return;
        }
        gBtn.disabled = false; gBtn.textContent = tg.g_btn;
        if (r && r.error === 'rate') { gMsg.textContent = tg.g_rate; gMsg.className = 'ag-gate-msg err'; return; }
        if (!r || r.ok === false) { gMsg.textContent = tg.g_err; gMsg.className = 'ag-gate-msg err'; return; }
        // onbekend: terug naar de homepage
        if (d.track) d.track('agent_portal_unknown');
        gBtn.disabled = true; gIn.disabled = true;
        gMsg.innerHTML = esc(tg.g_no) + '<small>' + esc(tg.g_no2) + '</small>'; gMsg.className = 'ag-gate-msg out';
        setTimeout(function () { closeGate(); d.go(d.home); }, 3200);
      });
    });

    // ----- 2. gesprek -----
    function start() {
      reset();
      var pref = ses.lang && TX[ses.lang] ? ses.lang : null;
      if (pref && pref !== cl) { var b = rootEl.querySelector('[data-cl="' + pref + '"]'); if (b) b.click(); }
      var h1 = $('#agH1'); if (h1 && ses.first) h1.textContent = L(lang).h1_hi(ses.first);
      var lo = $('#agLogout'); lo.hidden = false; lo.textContent = t.logout; lo.onclick = function () { d.ss.set('agent', null); location.reload(); };
      log.innerHTML = '';
      say(t.hi(ses.first || '', ses.company)).then(askRef);
    }
    function askRef() { return say(t.ask_ref).then(function () { ask('ref', t.ph_ref, 'text'); }); }
    function lookRef(v) {
      var ref = parseRef(v);
      if (!ref) return say(t.no_ref).then(function () { ask('ref', t.ph_ref, 'text'); });
      hideInput();
      var wait = node('<span>' + esc(t.looking(ref)) + '</span>', 'sol-msg a');
      call({ action: 'property', ref: ref }).then(function (r) {
        wait.remove();
        if (!r.ok) return say(t.neterr).then(function () { setChips([['retry', t.retry]], function () { lookRef(ref); }); });
        if (!r.found) return say(t.nf(ref)).then(function () { ask('ref', t.ph_ref, 'text'); });
        card(r);
        if (!r.available) return say(t.na(r.ref)).then(function () { ask('ref', t.ph_ref, 'text'); });
        st.prop = r;
        return say(r.has_keys ? t.keys_yes(r.rep_first || '') : t.keys_no(r.rep_first || ''), r.has_keys ? 'ag-keys' : '').then(function () {
          return say(t.is_it);
        }).then(function () {
          setChips([['y', t.yes_home], ['n', t.other_home]], function (c, lbl) {
            me(lbl);
            if (c === 'n') { st.prop = null; return askRef(); }
            if (st.editing) return summary();
            say(t.ask_first).then(function () { ask('first', t.ph_first, 'text'); });
          });
        });
      }).catch(function () {});
    }
    function card(p) {
      var a = document.createElement('a'); a.className = 'sol-home ag-home' + (p.available ? '' : ' off'); a.href = p.url || '#'; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : '<span class="sol-home-ph"></span>') +
        '<span><small class="ag-ref">' + esc(p.ref) + (p.available ? '' : ' · ' + esc(t.uo)) + '</small><b>' + esc(p.title || '') + '</b>' +
        '<small>' + esc([price(p.price), p.town, p.beds ? p.beds + ' 🛏' : ''].filter(Boolean).join(' · ')) + '</small></span>' +
        (p.available ? '<span class="ag-key' + (p.has_keys ? ' on' : '') + '" title="' + esc(t.r_keys) + '">' + ICO.key + '</span>' : '');
      log.appendChild(a); scroll();
    }
    // dagen: de komende 6 werkdagen (vandaag na 13:00 telt niet meer mee)
    function dayChips() {
      var out = [], dt = new Date(), now = new Date();
      if (now.getHours() >= 13) dt.setDate(dt.getDate() + 1);
      while (out.length < 6) {
        var wd = dt.getDay();
        if (wd !== 0 && wd !== 6) {
          var lbl = new Intl.DateTimeFormat(LOC[cl] || 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(dt);
          var full = new Intl.DateTimeFormat(LOC[cl] || 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
          out.push([full, lbl]);
        }
        dt.setDate(dt.getDate() + 1);
      }
      return out.concat([['other', t.other_day, 'ghost']]);
    }
    function askDay() {
      hideInput();
      return say(t.ask_day(st.first)).then(function () {
        setChips(dayChips(), function (v, lbl) {
          if (v === 'other') { me(lbl); return ask('day', t.ph_day, 'text'); }
          me(lbl); st.day = v; next('day');
        });
      });
    }
    function askTime() {
      hideInput();
      return say(t.ask_time).then(function () {
        setChips(['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'].map(function (x) { return [x, x]; }).concat([['other', t.other_time, 'ghost']]), function (v, lbl) {
          me(lbl);
          if (v === 'other') return ask('time', t.ph_time, 'text');
          st.time = v; next('time');
        });
      });
    }
    function next(after) {
      if (st.editing) return summary();
      if (after === 'last') return askDay();
      if (after === 'day') return askTime();
      if (after === 'time') return summary();
    }
    function summary() {
      st.editing = false; hideInput();
      var p = st.prop;
      var rows = [[t.r_home, p.ref + ' · ' + (p.title || '') + (p.town ? ' (' + p.town + ')' : '')], [t.r_client, st.first + ' ' + st.last], [t.r_day, st.day], [t.r_time, st.time], [t.r_keys, p.has_keys ? t.keys_y : t.keys_n]];
      node('<b class="ag-sum-h">' + ICO.cal + esc(t.sum_h) + '</b><dl>' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>', 'ag-sum');
      say(t.sum).then(function () {
        setChips([['send', t.send, 'go'], ['change', t.change, 'ghost']], function (c, lbl) {
          me(lbl);
          if (c === 'send') return submit();
          say(t.which).then(function () {
            setChips([['home', t.r_home], ['client', t.r_client], ['day', t.r_day], ['time', t.r_time]], function (k, l2) {
              me(l2); st.editing = true;
              if (k === 'home') return askRef();
              if (k === 'client') return say(t.ask_first).then(function () { ask('first', t.ph_first, 'text'); });
              if (k === 'day') return askDay();
              return askTime();
            });
          });
        });
      });
    }

    // ----- 3. versturen -----
    function submit() {
      if (st.busy) return; st.busy = true; hideInput();
      if (!st.nonce) st.nonce = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      var wait = node('<span class="sol-env">' + ICO.mail + '</span>' + esc(t.sending), 'sol-msg a sol-sending');
      call(Object.assign({ action: 'submit', ref: st.prop.ref, client_first: st.first, client_last: st.last, day: st.day, time: st.time, lang: cl, nonce: st.nonce, test: !!d.test }, d.meta ? d.meta() : {}))
        .then(function (r) {
          st.busy = false; wait.remove();
          if (!r.ok) return say(t.neterr).then(function () { setChips([['retry', t.retry]], function () { submit(); }); });
          if (r.duplicate) return say(t.dup).then(afterwards);
          if (r.outcome === 'processed') return celebrate(r);
          if (r.outcome === 'not_available') return say(t.na(st.prop.ref)).then(function () { st.prop = null; st.nonce = ''; askRef(); });
          if (r.outcome === 'ref_not_found') return say(t.nf(st.prop.ref)).then(function () { st.prop = null; st.nonce = ''; askRef(); });
          return say(t.fail).then(afterwards);
        }).catch(function () { st.busy = false; wait.remove(); });
    }
    function celebrate(r) {
      if (d.track) d.track('agent_viewing_request', null, null, { ref: st.prop.ref, test: !!d.test });
      var rep = r.rep || {}, rn = rep.name || repName();
      var c = node('<div class="ag-done-ic">🎉</div><div><b>' + esc(t.done_h) + '</b><span>' + esc(st.prop.ref + ' · ' + st.first + ' ' + st.last + ' · ' + st.day + ' · ' + st.time) + '</span></div>', 'sol-done ag-done');
      for (var i = 0; i < 18; i++) { var k = document.createElement('i'); k.className = 'sol-conf'; k.style.setProperty('--x', (Math.random() * 240 - 120) + 'px'); k.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg'); k.style.setProperty('--d', (Math.random() * .4) + 's'); k.style.background = ['#F03838', '#FF7068', '#FBCC10', '#384850'][i % 4]; c.appendChild(k); }
      say(t.done(ses.first || '', st.prop.ref, rn), 'big').then(function () {
        return r.has_keys ? say(t.done_keys(rn), 'ag-keys') : null;
      }).then(function () {
        if (rep.full_name || rep.email || rep.mobile) {
          node('<small>' + esc(t.rep_h) + '</small><b>' + esc(rep.full_name || rn) + '</b>' +
            (rep.email ? '<a href="mailto:' + esc(rep.email) + '">' + ICO.mail + esc(rep.email) + '</a>' : '') +
            (rep.mobile ? '<a href="tel:' + esc(String(rep.mobile).replace(/[^0-9+]/g, '')) + '">' + ICO.phone + esc(rep.mobile) + '</a>' : '') +
            (rep.mobile ? '<a class="ag-wa" href="https://wa.me/' + esc(String(rep.mobile).replace(/[^0-9]/g, '')) + '" target="_blank" rel="noopener">WhatsApp</a>' : ''), 'ag-rep');
        }
        return say(r.test ? t.done_test : t.done_mail);
      }).then(afterwards);
    }
    function afterwards() {
      return say(t.next_another(ses.first || '')).then(function () {
        setChips([['again', t.another, 'go']], function (c, lbl) { me(lbl); reset(); askRef(); });
      });
    }

    // ----- invoerveld -----
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v || st.busy) return;
      if (st.step === 'ref') { me(v); return lookRef(v); }
      if (st.step === 'first') {
        var parts = cleanName(v).split(' ').filter(Boolean); if (!parts.length) return;
        me(parts.join(' ')); st.first = parts[0];
        if (parts.length > 1) { st.last = parts.slice(1).join(' '); return next('last'); }
        st.last = ''; return say(t.ask_last(st.first)).then(function () { ask('last', t.ph_last, 'text'); });
      }
      if (st.step === 'last') { st.last = cleanName(v); if (!st.last) return; me(st.last); return next('last'); }
      if (st.step === 'day') { st.day = v.slice(0, 60); me(st.day); return next('day'); }
      if (st.step === 'time') { st.time = v.slice(0, 40); me(st.time); return next('time'); }
    });

    // ----- start -----
    if (ses) start(); else openGate();
  }

  root.PARTNERS = { html: html, bind: bind, text: L };
})(typeof window !== 'undefined' ? window : globalThis);
