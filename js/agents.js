/* Grupo Soltura website — Makelaarsportaal met live assistent Sola (24-10-2026; registratie en e-mailcode 28-10-2026, BD-169).
   /en/agents/ · /nl/makelaars/ · /sv/maklare/ · /es/agentes/  (agents.gruposoltura.com verwijst hierheen via een Cloudflare-regel; geen link op de site, noindex)
   Het portaal is sinds 28-10-2026 de enige route voor bezichtigingen door makelaars (de mailflow viewing@ is uit).
   1. Venster: e-mailadres. Bekende samenwerkende makelaar (label agent in NEXUS): op een vertrouwd apparaat (localStorage gs_agent_dev, 180 dagen)
      direct verder, anders eerst een code van 6 cijfers per mail. Onder het venster staat altijd "Registreer je hier als makelaar".
   2. Registratie in gesprek met Sola: makelaardij, voor- en achternaam, e-mail (= login), mobiel. Edge function controleert of e-mail of mobiel
      al bekend is; zo ja vraagt Sola wat er veranderd is (ander kantoor, andere naam, nieuw nummer, oud e-mailadres) en wordt het bestaande
      contact bijgewerkt in plaats van een dubbel contact. Altijd bevestigen met een code naar het opgegeven e-mailadres; daarna meteen door naar 3.
   3. Gesprek met Sola: woningreferentie -> voor- en achternaam klant -> laatste 4 telefooncijfers -> dag -> tijd -> versturen.
      Tussendoor controleert Sola of de woning bestaat en beschikbaar is (onder bod = geen bezichtigingen) en of wij de sleutels hebben.
   4. Edge function agent-viewing verwerkt de aanvraag (suspect + aanvraag in NEXUS met de makelaar als aanbrenger, bevestigingsmail aan de
      makelaar, melding aan de verkoper, regel in menu Bezichtiging), bron 'agent-portal'.
   Taal: bij binnenkomst de taal van de browser (eenmaal per sessie), daarna de taalknoppen in het paneel.
   Testen: ?test=1 -> niets in NEXUS, mails alleen naar rick@ (geldt voor aanvragen, niet voor registratie en inlogcode).
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
      email_alt: "Not registered yet? Register as a partner agent in one minute.",
      g_h: 'Partner agents only', g_p: 'Enter the email address you are registered with as a partner agent of Soltura Real Estate.', g_ph: 'your@agency.com', g_btn: 'Continue', g_bad: 'Please enter a valid email address.',
      g_busy: 'Checking…', g_rate: 'Too many attempts. Please try again in a few minutes.', g_err: 'Something went wrong. Please try again.',
      g_no: "We do not know this address as a partner agent yet.", g_no2: "New here or did your details change? Register here as an agent.",
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
      ask_phone4: function (f) { return 'Last thing: the last 4 digits of ' + f + '\'s mobile number. Just those four, so we can check them against the number we may already have.'; },
      ph_phone4: '1234', bad_phone4: 'I just need the last 4 digits of the phone number - four numbers, for example 1234.', bad_day: 'I need a specific date for the viewing, for example Friday 7 November or 7/11. Is the day not fixed yet? Then pick the most likely day; our salesrep will confirm it with you.', bad_time: 'I need a specific time for the viewing, for example 11:30. Is the time not fixed yet? Then pick the most likely time; our salesrep will confirm it with you.',
      known_client: 'Thank you - but I cannot accept this request. This client is already registered with us, so the viewing goes through our own team. Call us on +34 966 792 113 and we will sort it out with you.',
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
      g_reg: "Register here as an agent",
      g_or: "Not registered yet?",
      c_h: "Check your email",
      c_p: "We sent a 6-digit code to {m}. Enter it to sign in on this device; you only need to do this once per device.",
      c_ph: "6-digit code",
      c_btn: "Sign in",
      c_wrong: "That code is not correct. Please try again.",
      c_expired: "This code has expired. Request a new one.",
      c_attempts: "Too many attempts. Request a new code.",
      c_resend: "Send a new code",
      c_back: "Use another email address",
      c_sent: "A new code is on its way.",
      c_mail: "We could not send the code just now. Please try again in a moment.",
      r_hi: "Welcome! I will register you as a partner agent of Soltura Real Estate. It takes about a minute.",
      r_company: "Which agency do you work for?",
      ph_company: "Agency name",
      r_first: "And your first name?",
      ph_rfirst: "Your first name",
      r_last: "Thanks, {f}. And your last name?",
      ph_rlast: "Your last name",
      r_email: "Which email address do you work with? It will also be your login for this portal.",
      ph_email: "you@agency.com",
      r_mobile: "And your mobile number, with country code?",
      ph_mobile: "+34 600 123 456",
      r_bad_name: "Please type just the name.",
      r_bad_email: "That email address does not look right. Could you check it?",
      r_bad_mobile: "That does not look like a mobile number. Please include the country code, for example +34 600 123 456.",
      r_sum_h: "Your registration",
      r_sum: "Is everything correct?",
      r_ok: "Yes, register me",
      r_fix: "Change something",
      r_which: "What would you like to change?",
      f_company: "Agency",
      f_name: "Name",
      f_email: "Email",
      f_mobile: "Mobile",
      r_checking: "One moment, I am checking our records…",
      k_same: "You are already registered with us with this email address and mobile number.",
      k_same_ok: "I will send you a code so you can sign in.",
      k_diff: "Your agency or name is different from what we have. What has changed?",
      k_email: "We already know this email address.",
      k_email_q: "What has changed?",
      k_mobile: "This mobile number is already known to us, together with the email address {m}.",
      k_mobile_q: "What is the situation?",
      o_moved: "I moved to another agency",
      o_name: "My name is different",
      o_mobile: "I have a new mobile number",
      o_email: "That was my old email address",
      o_notmine: "That is not my number",
      o_other: "Something else",
      o_login: "Nothing changed, sign me in",
      r_note: "Briefly, what has changed?",
      ph_note: "e.g. I now work for Casa Sol",
      r_notmine: "Then please give me your own mobile number.",
      r_code: "To confirm, I have sent a 6-digit code to {m}. Please enter it here.",
      ph_code: "6-digit code",
      r_done_new: "Welcome aboard, {f}! You are now registered as a partner agent.",
      r_done_upd: "Thank you, {f}. Your details are up to date.",
      r_done_in: "Welcome back, {f}!",
      r_err: "Something went wrong on our side. Please try again.",
      r_rate: "Too many attempts. Please try again in a few minutes.",
    },
    nl: {
      title: 'Makelaarsportaal', uo: 'Onder bod / niet beschikbaar', kicker: 'Voor onze samenwerkende makelaars', h1: 'Vraag realtime een bezichtiging aan', h1_hi: function (f) { return 'Welkom, ' + f; },
      lead: 'Vraag in een gesprek van twee minuten met ' + NAME + ' een bezichtiging aan voor je klant. Je aanvraag gaat direct ons systeem in en naar de verkoper die verantwoordelijk is voor de woning.',
      f: [['bolt', 'Realtime', 'Geen wachten op een mail: ' + NAME + ' controleert de woning en verwerkt je aanvraag meteen.'],
        ['key', 'Sleutels', 'Je weet direct of wij de sleutels van de woning hebben.'],
        ['user', 'Je contactpersoon', 'Je krijgt de naam, het e-mailadres en mobiele nummer van de verantwoordelijke verkoper.']],
      email_alt: "Nog niet geregistreerd? Registreer je in een minuut als samenwerkende makelaar.",
      g_h: 'Alleen voor samenwerkende makelaars', g_p: 'Vul het e-mailadres in waarmee je bij Soltura Real Estate bent geregistreerd als samenwerkende makelaar.', g_ph: 'jij@makelaardij.nl', g_btn: 'Verder', g_bad: 'Vul een geldig e-mailadres in.',
      g_busy: 'Even controleren…', g_rate: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.', g_err: 'Er ging iets mis. Probeer het opnieuw.',
      g_no: "Dit adres kennen we nog niet als samenwerkende makelaar.", g_no2: "Nieuw hier of zijn je gegevens veranderd? Registreer je hier als makelaar.",
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
      ask_phone4: function (f) { return 'Nog een ding: de laatste 4 cijfers van het mobiele nummer van ' + f + '. Alleen die laatste vier, dan leggen we ze naast het nummer dat wij misschien al van de klant hebben.'; },
      ph_phone4: '1234', bad_phone4: 'Ik heb alleen de laatste 4 cijfers van het telefoonnummer nodig - vier cijfers, bijvoorbeeld 1234.', bad_day: 'Ik heb een concrete datum nodig, bijvoorbeeld vrijdag 7 november of 7/11. Staat de dag nog niet vast? Kies dan de meest waarschijnlijke dag; onze salesrep bevestigt hem met je.', bad_time: 'Ik heb een concrete tijd nodig, bijvoorbeeld 11:30. Staat de tijd nog niet vast? Kies dan de meest waarschijnlijke tijd; onze salesrep bevestigt hem met je.',
      known_client: 'Dank je - deze aanvraag kan ik niet aannemen. Deze klant is al bij ons bekend, dus de bezichtiging loopt via ons eigen team. Bel ons op +34 966 792 113, dan zoeken we het samen met je uit.',
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
      g_reg: "Registreer je hier als makelaar",
      g_or: "Nog niet geregistreerd?",
      c_h: "Kijk in je mail",
      c_p: "We hebben een code van 6 cijfers gestuurd naar {m}. Vul hem in om op dit apparaat in te loggen; dat hoeft maar één keer per apparaat.",
      c_ph: "Code van 6 cijfers",
      c_btn: "Inloggen",
      c_wrong: "Die code klopt niet. Probeer het nog eens.",
      c_expired: "Deze code is verlopen. Vraag een nieuwe aan.",
      c_attempts: "Te veel pogingen. Vraag een nieuwe code aan.",
      c_resend: "Stuur een nieuwe code",
      c_back: "Ander e-mailadres gebruiken",
      c_sent: "Er is een nieuwe code onderweg.",
      c_mail: "De code kon zojuist niet worden verstuurd. Probeer het zo nog eens.",
      r_hi: "Welkom! Ik registreer je als samenwerkende makelaar van Soltura Real Estate. Het kost ongeveer een minuut.",
      r_company: "Voor welke makelaardij werk je?",
      ph_company: "Naam makelaardij",
      r_first: "En je voornaam?",
      ph_rfirst: "Je voornaam",
      r_last: "Dank je, {f}. En je achternaam?",
      ph_rlast: "Je achternaam",
      r_email: "Met welk e-mailadres werk je? Dat is meteen je login voor dit portaal.",
      ph_email: "jij@makelaardij.nl",
      r_mobile: "En je mobiele nummer, met landcode?",
      ph_mobile: "+34 600 123 456",
      r_bad_name: "Typ alleen de naam.",
      r_bad_email: "Dat e-mailadres lijkt niet te kloppen. Wil je het even controleren?",
      r_bad_mobile: "Dat lijkt geen mobiel nummer. Zet de landcode erbij, bijvoorbeeld +34 600 123 456.",
      r_sum_h: "Je registratie",
      r_sum: "Klopt alles?",
      r_ok: "Ja, registreer me",
      r_fix: "Iets wijzigen",
      r_which: "Wat wil je wijzigen?",
      f_company: "Makelaardij",
      f_name: "Naam",
      f_email: "E-mail",
      f_mobile: "Mobiel",
      r_checking: "Moment, ik kijk even in ons systeem…",
      k_same: "Je staat al bij ons geregistreerd met dit e-mailadres en mobiele nummer.",
      k_same_ok: "Ik stuur je een code waarmee je inlogt.",
      k_diff: "Je makelaardij of naam wijkt af van wat wij hebben. Wat is er veranderd?",
      k_email: "Dit e-mailadres kennen we al.",
      k_email_q: "Wat is er veranderd?",
      k_mobile: "Dit mobiele nummer kennen we al, samen met het e-mailadres {m}.",
      k_mobile_q: "Hoe zit het?",
      o_moved: "Ik werk bij een ander kantoor",
      o_name: "Mijn naam is anders",
      o_mobile: "Ik heb een nieuw mobiel nummer",
      o_email: "Dat was mijn oude e-mailadres",
      o_notmine: "Dat is niet mijn nummer",
      o_other: "Iets anders",
      o_login: "Niets veranderd, log me in",
      r_note: "Wat is er in het kort veranderd?",
      ph_note: "bijv. ik werk nu bij Casa Sol",
      r_notmine: "Geef me dan je eigen mobiele nummer.",
      r_code: "Ter bevestiging heb ik een code van 6 cijfers gestuurd naar {m}. Vul hem hier in.",
      ph_code: "Code van 6 cijfers",
      r_done_new: "Welkom, {f}! Je bent nu geregistreerd als samenwerkende makelaar.",
      r_done_upd: "Dank je, {f}. Je gegevens zijn bijgewerkt.",
      r_done_in: "Welkom terug, {f}!",
      r_err: "Er ging bij ons iets mis. Probeer het nog eens.",
      r_rate: "Te veel pogingen. Probeer het over een paar minuten opnieuw.",
    },
    es: {
      title: 'Portal de agentes', uo: 'Reservada / no disponible', kicker: 'Para nuestros agentes colaboradores', h1: 'Solicite una visita en tiempo real', h1_hi: function (f) { return 'Bienvenido/a, ' + f; },
      lead: 'Solicite una visita para su cliente en una conversación de dos minutos con ' + NAME + '. Su solicitud entra directamente en nuestro sistema y llega al asesor responsable de la vivienda.',
      f: [['bolt', 'En tiempo real', 'Sin esperar un correo: ' + NAME + ' comprueba la vivienda y tramita su solicitud al momento.'],
        ['key', 'Llaves', 'Sabrá enseguida si tenemos las llaves de la vivienda.'],
        ['user', 'Su contacto', 'Recibe el nombre, correo y móvil del asesor responsable.']],
      email_alt: "¿Aún no estás registrado/a? Regístrate como agente colaborador en un minuto.",
      g_h: 'Solo para agentes colaboradores', g_p: 'Introduzca el correo con el que está registrado como agente colaborador de Soltura Real Estate.', g_ph: 'su@agencia.es', g_btn: 'Continuar', g_bad: 'Introduzca un correo válido.',
      g_busy: 'Comprobando…', g_rate: 'Demasiados intentos. Inténtelo de nuevo en unos minutos.', g_err: 'Algo ha fallado. Inténtelo de nuevo.',
      g_no: "Todavía no conocemos este correo como agente colaborador.", g_no2: "¿Eres nuevo/a o han cambiado tus datos? Regístrate aquí como agente.",
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
      ask_phone4: function (f) { return 'Una \u00faltima cosa: los 4 \u00faltimos d\u00edgitos del m\u00f3vil de ' + f + '. Solo esos cuatro, para cotejarlos con el n\u00famero que quiz\u00e1 ya tengamos.'; },
      ph_phone4: '1234', bad_phone4: 'Solo necesito los 4 \u00faltimos d\u00edgitos del tel\u00e9fono: cuatro cifras, por ejemplo 1234.', bad_day: 'Necesito una fecha concreta, por ejemplo viernes 7 de noviembre o 7/11. \u00bfA\u00fan no est\u00e1 fijado el d\u00eda? Elige el m\u00e1s probable; nuestro asesor lo confirmar\u00e1 contigo.', bad_time: 'Necesito una hora concreta, por ejemplo 11:30. \u00bfA\u00fan no est\u00e1 fijada? Elige la m\u00e1s probable; nuestro asesor la confirmar\u00e1 contigo.',
      known_client: 'Gracias, pero no puedo aceptar esta solicitud: este cliente ya est\u00e1 registrado con nosotros, as\u00ed que la visita va a trav\u00e9s de nuestro propio equipo. Ll\u00e1manos al +34 966 792 113 y lo vemos contigo.',
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
      g_reg: "Regístrate aquí como agente",
      g_or: "¿Aún no estás registrado/a?",
      c_h: "Revisa tu correo",
      c_p: "Hemos enviado un código de 6 cifras a {m}. Introdúcelo para entrar en este dispositivo; solo hace falta una vez por dispositivo.",
      c_ph: "Código de 6 cifras",
      c_btn: "Entrar",
      c_wrong: "El código no es correcto. Inténtalo de nuevo.",
      c_expired: "El código ha caducado. Pide uno nuevo.",
      c_attempts: "Demasiados intentos. Pide un código nuevo.",
      c_resend: "Enviar un código nuevo",
      c_back: "Usar otro correo",
      c_sent: "Te hemos enviado un código nuevo.",
      c_mail: "No hemos podido enviar el código. Inténtalo de nuevo en un momento.",
      r_hi: "¡Bienvenido/a! Te registro como agente colaborador de Soltura Real Estate. Es cuestión de un minuto.",
      r_company: "¿Para qué agencia trabajas?",
      ph_company: "Nombre de la agencia",
      r_first: "¿Y tu nombre?",
      ph_rfirst: "Tu nombre",
      r_last: "Gracias, {f}. ¿Y tus apellidos?",
      ph_rlast: "Tus apellidos",
      r_email: "¿Con qué correo trabajas? Será también tu acceso a este portal.",
      ph_email: "tu@agencia.es",
      r_mobile: "¿Y tu móvil, con prefijo internacional?",
      ph_mobile: "+34 600 123 456",
      r_bad_name: "Escribe solo el nombre.",
      r_bad_email: "Ese correo no parece correcto. ¿Puedes revisarlo?",
      r_bad_mobile: "Eso no parece un móvil. Incluye el prefijo, por ejemplo +34 600 123 456.",
      r_sum_h: "Tu registro",
      r_sum: "¿Está todo correcto?",
      r_ok: "Sí, regístrame",
      r_fix: "Cambiar algo",
      r_which: "¿Qué quieres cambiar?",
      f_company: "Agencia",
      f_name: "Nombre",
      f_email: "Correo",
      f_mobile: "Móvil",
      r_checking: "Un momento, compruebo nuestros datos…",
      k_same: "Ya estás registrado/a con este correo y este móvil.",
      k_same_ok: "Te envío un código para entrar.",
      k_diff: "Tu agencia o tu nombre no coinciden con lo que tenemos. ¿Qué ha cambiado?",
      k_email: "Ya conocemos este correo.",
      k_email_q: "¿Qué ha cambiado?",
      k_mobile: "Ya conocemos este móvil, junto con el correo {m}.",
      k_mobile_q: "¿Cuál es la situación?",
      o_moved: "Trabajo en otra agencia",
      o_name: "Mi nombre es distinto",
      o_mobile: "Tengo un móvil nuevo",
      o_email: "Era mi correo anterior",
      o_notmine: "Ese no es mi número",
      o_other: "Otra cosa",
      o_login: "Nada ha cambiado, déjame entrar",
      r_note: "En pocas palabras, ¿qué ha cambiado?",
      ph_note: "p. ej. ahora trabajo en Casa Sol",
      r_notmine: "Entonces dame tu propio móvil, por favor.",
      r_code: "Para confirmar, he enviado un código de 6 cifras a {m}. Introdúcelo aquí.",
      ph_code: "Código de 6 cifras",
      r_done_new: "¡Bienvenido/a, {f}! Ya estás registrado/a como agente colaborador.",
      r_done_upd: "Gracias, {f}. Tus datos están actualizados.",
      r_done_in: "¡Hola de nuevo, {f}!",
      r_err: "Algo ha fallado por nuestra parte. Inténtalo de nuevo.",
      r_rate: "Demasiados intentos. Inténtalo dentro de unos minutos.",
    },
    sv: {
      title: 'Mäklarportal', uo: 'Reserverad / ej tillgänglig', kicker: 'För våra samarbetande mäklare', h1: 'Boka en visning i realtid', h1_hi: function (f) { return 'Välkommen, ' + f; },
      lead: 'Boka en visning för din kund i ett tvåminuterssamtal med ' + NAME + '. Förfrågan går direkt in i vårt system och till den säljare som ansvarar för bostaden.',
      f: [['bolt', 'Realtid', 'Ingen väntan på mejl: ' + NAME + ' kontrollerar bostaden och behandlar förfrågan direkt.'],
        ['key', 'Nycklar', 'Du ser direkt om vi har nycklarna till bostaden.'],
        ['user', 'Din kontakt', 'Du får namn, e-post och mobilnummer till den ansvariga säljaren.']],
      email_alt: "Inte registrerad än? Registrera dig som samarbetande mäklare på en minut.",
      g_h: 'Endast för samarbetande mäklare', g_p: 'Ange e-postadressen du är registrerad med som samarbetande mäklare hos Soltura Real Estate.', g_ph: 'du@maklarbyra.se', g_btn: 'Fortsätt', g_bad: 'Ange en giltig e-postadress.',
      g_busy: 'Kontrollerar…', g_rate: 'För många försök. Försök igen om några minuter.', g_err: 'Något gick fel. Försök igen.',
      g_no: "Vi känner inte den här adressen som samarbetande mäklare än.", g_no2: "Ny här eller har dina uppgifter ändrats? Registrera dig här som mäklare.",
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
      ask_phone4: function (f) { return 'En sista sak: de 4 sista siffrorna i ' + f + 's mobilnummer. Bara de fyra sista, s\u00e5 kan vi st\u00e4mma av dem mot numret vi kanske redan har.'; },
      ph_phone4: '1234', bad_phone4: 'Jag beh\u00f6ver bara de 4 sista siffrorna i telefonnumret - fyra siffror, till exempel 1234.', bad_day: 'Jag beh\u00f6ver ett best\u00e4mt datum, till exempel fredag 7 november eller 7/11. \u00c4r dagen inte best\u00e4md \u00e4n? V\u00e4lj den mest troliga dagen; v\u00e5r s\u00e4ljare bekr\u00e4ftar den med dig.', bad_time: 'Jag beh\u00f6ver en best\u00e4md tid, till exempel 11:30. \u00c4r tiden inte best\u00e4md \u00e4n? V\u00e4lj den mest troliga tiden; v\u00e5r s\u00e4ljare bekr\u00e4ftar den med dig.',
      known_client: 'Tack - den h\u00e4r f\u00f6rfr\u00e5gan kan jag inte ta emot. Kunden \u00e4r redan k\u00e4nd hos oss, s\u00e5 visningen g\u00e5r via v\u00e5rt eget team. Ring oss p\u00e5 +34 966 792 113 s\u00e5 l\u00f6ser vi det tillsammans.',
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
      g_reg: "Registrera dig här som mäklare",
      g_or: "Inte registrerad än?",
      c_h: "Kolla din e-post",
      c_p: "Vi har skickat en sexsiffrig kod till {m}. Ange den för att logga in på den här enheten; det behövs bara en gång per enhet.",
      c_ph: "Sexsiffrig kod",
      c_btn: "Logga in",
      c_wrong: "Koden stämmer inte. Försök igen.",
      c_expired: "Koden har gått ut. Begär en ny.",
      c_attempts: "För många försök. Begär en ny kod.",
      c_resend: "Skicka en ny kod",
      c_back: "Använd en annan e-postadress",
      c_sent: "En ny kod är på väg.",
      c_mail: "Koden kunde inte skickas just nu. Försök igen om en stund.",
      r_hi: "Välkommen! Jag registrerar dig som samarbetande mäklare hos Soltura Real Estate. Det tar ungefär en minut.",
      r_company: "Vilken byrå arbetar du för?",
      ph_company: "Byråns namn",
      r_first: "Och ditt förnamn?",
      ph_rfirst: "Ditt förnamn",
      r_last: "Tack, {f}. Och ditt efternamn?",
      ph_rlast: "Ditt efternamn",
      r_email: "Vilken e-postadress arbetar du med? Den blir också din inloggning här.",
      ph_email: "du@maklarbyra.se",
      r_mobile: "Och ditt mobilnummer, med landsnummer?",
      ph_mobile: "+34 600 123 456",
      r_bad_name: "Skriv bara namnet.",
      r_bad_email: "E-postadressen ser inte rätt ut. Kan du kontrollera den?",
      r_bad_mobile: "Det ser inte ut som ett mobilnummer. Ta med landsnumret, till exempel +34 600 123 456.",
      r_sum_h: "Din registrering",
      r_sum: "Stämmer allt?",
      r_ok: "Ja, registrera mig",
      r_fix: "Ändra något",
      r_which: "Vad vill du ändra?",
      f_company: "Byrå",
      f_name: "Namn",
      f_email: "E-post",
      f_mobile: "Mobil",
      r_checking: "Ett ögonblick, jag kontrollerar våra uppgifter…",
      k_same: "Du är redan registrerad hos oss med den här e-postadressen och det här mobilnumret.",
      k_same_ok: "Jag skickar en kod så att du kan logga in.",
      k_diff: "Din byrå eller ditt namn skiljer sig från det vi har. Vad har ändrats?",
      k_email: "Vi känner redan till den här e-postadressen.",
      k_email_q: "Vad har ändrats?",
      k_mobile: "Vi känner redan till det här mobilnumret, tillsammans med e-postadressen {m}.",
      k_mobile_q: "Hur ligger det till?",
      o_moved: "Jag har bytt byrå",
      o_name: "Mitt namn är annorlunda",
      o_mobile: "Jag har ett nytt mobilnummer",
      o_email: "Det var min gamla e-postadress",
      o_notmine: "Det är inte mitt nummer",
      o_other: "Något annat",
      o_login: "Inget har ändrats, logga in mig",
      r_note: "Vad har ändrats, kortfattat?",
      ph_note: "t.ex. jag arbetar nu på Casa Sol",
      r_notmine: "Ge mig då ditt eget mobilnummer.",
      r_code: "För att bekräfta har jag skickat en sexsiffrig kod till {m}. Ange den här.",
      ph_code: "Sexsiffrig kod",
      r_done_new: "Välkommen, {f}! Du är nu registrerad som samarbetande mäklare.",
      r_done_upd: "Tack, {f}. Dina uppgifter är uppdaterade.",
      r_done_in: "Välkommen tillbaka, {f}!",
      r_err: "Något gick fel hos oss. Försök igen.",
      r_rate: "För många försök. Försök igen om några minuter.",
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
      '<p class="ag-alt"><button type="button" class="ag-reg-alt" data-reg>' + ICO.user + '<span>' + esc(t.email_alt) + '</span></button></p></div>' +
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
      '<div id="agStepMail"><h2 id="agGateH">' + esc(t.g_h) + '</h2><p id="agGateP">' + esc(t.g_p) + '</p>' +
      '<input type="email" id="agGateIn" name="email" autocomplete="email" inputmode="email" placeholder="' + esc(t.g_ph) + '" aria-label="' + esc(t.g_ph) + '" required>' +
      '<button class="btn primary" type="submit" id="agGateBtn">' + esc(t.g_btn) + '</button></div>' +
      '<div id="agStepCode" hidden><h2 id="agCodeH">' + esc(t.c_h) + '</h2><p id="agCodeP"></p>' +
      '<input type="text" id="agCodeIn" name="code" autocomplete="one-time-code" inputmode="numeric" maxlength="7" placeholder="' + esc(t.c_ph) + '" aria-label="' + esc(t.c_ph) + '">' +
      '<button class="btn primary" type="submit" id="agCodeBtn">' + esc(t.c_btn) + '</button>' +
      '<p class="ag-gate-links"><button type="button" id="agResend">' + esc(t.c_resend) + '</button><button type="button" id="agBack">' + esc(t.c_back) + '</button></p></div>' +
      '<p class="ag-gate-msg" id="agGateMsg" aria-live="polite"></p>' +
      '<p class="ag-gate-reg"><span id="agGateOr">' + esc(t.g_or) + '</span> <button type="button" data-reg id="agRegLink">' + esc(t.g_reg) + '</button></p></form></div>';
  }

  // ---------- gedrag ----------
  // d: { fn(name, body), go(path), home: '/en/', track, test: bool, ss: {get,set} (sessionStorage), meta: () => ({page_url}) }
  function bind(rootEl, lang, d) {
    var $ = function (s) { return rootEl.querySelector(s); };
    var log = $('#solLog'), chips = $('#solChips'), form = $('#solForm'), input = $('#solIn');
    var gate = $('#agGate'), gForm = $('#agGateForm'), gIn = $('#agGateIn'), gMsg = $('#agGateMsg'), gBtn = $('#agGateBtn');
    if (!log || !gate) return;
    // taal van de browser bij binnenkomst (eenmaal per sessie; agents.gruposoltura.com landt op /en/agents/)
    var SLUG = { en: 'agents', nl: 'makelaars', sv: 'maklare', es: 'agentes' };
    try {
      if (!d.ss.get('agent_lang_auto', null)) {
        d.ss.set('agent_lang_auto', 1);
        var bl = (navigator.languages || [navigator.language || '']).map(function (x) { return String(x || '').slice(0, 2).toLowerCase(); }).filter(function (x) { return SLUG[x]; })[0];
        if (bl && bl !== lang) { d.go('/' + bl + '/' + SLUG[bl] + '/' + location.search, { replace: true }); return; }
      }
    } catch (e) { /* geen sessionStorage: paginataal houden */ }
    var cl = lang, t = L(lang), tg = L(lang);
    // vertrouwd apparaat (180 dagen): na een geslaagde code hoeft deze browser geen code meer
    var DEV_KEY = 'gs_agent_dev';
    function devGet() { try { return JSON.parse(localStorage.getItem(DEV_KEY) || 'null'); } catch (e) { return null; } }
    function devSet(v) { try { if (v) localStorage.setItem(DEV_KEY, JSON.stringify(v)); else localStorage.removeItem(DEV_KEY); } catch (e) { /* privévenster */ } }
    function fmt(s, o) { return String(s).replace(/\{(\w)\}/g, function (m, k) { return o[k] == null ? '' : o[k]; }); }
    var ses = d.ss.get('agent', null);
    if (ses && !(ses.token && ses.exp > Date.now())) ses = null;
    var st = {};
    function reset() { st = { step: '', prop: null, first: '', last: '', phone4: '', day: '', time: '', editing: false, busy: false, nonce: '' }; }
    var rg = null; // registratie: { company, first_name, last_name, email, mobile, choice, note, cid, masked, fixing }
    reset();

    if (d.test) { var tb = $('#agTest'); tb.hidden = false; tb.textContent = t.test; }

    // ----- chat-helpers (zelfde ritme als de woongids) -----
    function scroll() { log.scrollTop = log.scrollHeight; }
    function say(text, cls) {
      return new Promise(function (res) {
        var ty = document.createElement('div'); ty.className = 'sol-msg a ai-think'; ty.innerHTML = '<span class="ab-av">' + avatar(34) + '</span><div class="typing-dots"><span></span><span></span><span></span></div>';
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

    // ----- 1. e-mailvenster: e-mail -> (vertrouwd apparaat of code) -> gesprek; altijd een registratielink -----
    var stepMail = $('#agStepMail'), stepCode = $('#agStepCode'), cIn = $('#agCodeIn'), cBtn = $('#agCodeBtn'), cP = $('#agCodeP');
    var login = null; // { email, cid, masked }
    function gateMsg(txt, cls) { gMsg.textContent = txt || ''; gMsg.className = 'ag-gate-msg' + (cls ? ' ' + cls : ''); }
    function showMail() { login = null; stepCode.hidden = true; stepMail.hidden = false; gBtn.disabled = false; gBtn.textContent = tg.g_btn; gIn.disabled = false; setTimeout(function () { gIn.focus(); }, 60); }
    function showCode(r) {
      login.cid = r.cid; login.masked = r.masked;
      stepMail.hidden = true; stepCode.hidden = false; cP.textContent = fmt(tg.c_p, { m: r.masked }); cIn.value = ''; cBtn.disabled = false; cBtn.textContent = tg.c_btn;
      setTimeout(function () { cIn.focus(); }, 60);
    }
    function openGate(msg) {
      gate.hidden = false; document.body.classList.add('ag-locked');
      showMail(); gateMsg(msg || '');
      var dv = devGet(); if (dv && dv.e && !gIn.value) gIn.value = dv.e;
    }
    function closeGate() { gate.hidden = true; document.body.classList.remove('ag-locked'); }
    function signedIn(r, em) {
      ses = { token: r.token, email: em, first: r.agent.first_name || '', last: r.agent.last_name || '', company: r.agent.company || '', lang: r.agent.language || null, exp: Date.now() + 5.5 * 3600000 };
      d.ss.set('agent', ses);
      if (r.device) devSet({ e: em, t: r.device });
    }
    function sendLogin(em) {
      var dv = devGet();
      return d.fn('agent-viewing', { action: 'check', email: em, lang: cl, device: dv && dv.e === em ? dv.t : undefined }).catch(function () { return { ok: false }; });
    }
    gForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (login && login.cid) return verifyLogin();
      var em = gIn.value.trim().toLowerCase().replace(/\s+/g, '');
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em)) { gateMsg(tg.g_bad, 'err'); return; }
      gBtn.disabled = true; gBtn.textContent = tg.g_busy; gateMsg('');
      sendLogin(em).then(function (r) {
        gBtn.disabled = false; gBtn.textContent = tg.g_btn;
        if (r && r.known && r.token) { signedIn(r, em); if (d.track) d.track('agent_portal_login'); closeGate(); start(); return; }
        if (r && r.known && r.code) { login = { email: em }; showCode(r); return; }
        if (r && r.error === 'rate') { gateMsg(tg.g_rate, 'err'); return; }
        if (r && r.known && r.error === 'mail') { gateMsg(tg.c_mail, 'err'); return; }
        if (!r || r.ok === false) { gateMsg(tg.g_err, 'err'); return; }
        // onbekend adres: registratie aanbieden (geen doorverwijzing meer naar de homepage)
        if (d.track) d.track('agent_portal_unknown');
        gMsg.innerHTML = esc(tg.g_no) + '<button type="button" class="btn primary ag-gate-regbtn" id="agRegNow">' + esc(tg.g_reg) + '</button>'; gMsg.className = 'ag-gate-msg out';
        $('#agRegNow').onclick = function () { startReg(em); };
      });
    });
    function verifyLogin() {
      var code = cIn.value.replace(/\D/g, '');
      if (code.length !== 6) { gateMsg(tg.c_wrong, 'err'); return; }
      cBtn.disabled = true; cBtn.textContent = tg.g_busy; gateMsg('');
      d.fn('agent-viewing', { action: 'verify', cid: login.cid, code: code, ua: navigator.userAgent }).catch(function () { return { ok: false }; }).then(function (r) {
        cBtn.disabled = false; cBtn.textContent = tg.c_btn;
        if (r && r.valid && r.token) { signedIn(r, login.email); if (d.track) d.track('agent_portal_login'); closeGate(); start(); return; }
        if (r && r.reason === 'expired') return gateMsg(tg.c_expired, 'err');
        if (r && (r.reason === 'attempts' || r.reason === 'used')) return gateMsg(tg.c_attempts, 'err');
        if (r && r.ok === false) return gateMsg(r.error === 'rate' ? tg.g_rate : tg.g_err, 'err');
        gateMsg(tg.c_wrong, 'err'); cIn.select();
      });
    }
    $('#agResend').onclick = function () {
      if (!login) return showMail();
      gateMsg('');
      sendLogin(login.email).then(function (r) {
        if (r && r.code) { showCode(r); gateMsg(tg.c_sent); return; }
        if (r && r.token) { signedIn(r, login.email); closeGate(); start(); return; }
        gateMsg(r && r.error === 'rate' ? tg.g_rate : tg.c_mail, 'err');
      });
    };
    $('#agBack').onclick = function () { gateMsg(''); showMail(); };
    rootEl.querySelectorAll('[data-reg]').forEach(function (b) { b.onclick = function () { startReg(gIn.value.trim().toLowerCase().replace(/\s+/g, '')); }; });

    // ----- 1b. registratie als makelaar, in gesprek met Sola -----
    var REG_FIELDS = [['company', 'f_company'], ['first_name', 'f_name'], ['email', 'f_email'], ['mobile', 'f_mobile']];
    function startReg(em) {
      closeGate(); reset(); hideInput(); chips.innerHTML = ''; log.innerHTML = '';
      rg = { company: '', first_name: '', last_name: '', email: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em || '') ? em : '', mobile: '', choice: 'new', note: '', fixing: false };
      if (d.track) d.track('agent_portal_register_start');
      say(t.r_hi).then(askCompany);
    }
    function askCompany() { return say(t.r_company).then(function () { ask('r_company', t.ph_company, 'text', 'organization'); }); }
    function askRFirst() { return say(t.r_first).then(function () { ask('r_first', t.ph_rfirst, 'text', 'given-name'); }); }
    function askREmail() { return say(t.r_email).then(function () { ask('r_email', t.ph_email, 'email', 'email'); if (rg.email) input.value = rg.email; }); }
    function askRMobile() { return say(t.r_mobile).then(function () { ask('r_mobile', t.ph_mobile, 'tel', 'tel'); }); }
    function regNext(after) {
      if (rg.fixing) return regSummary();
      if (after === 'company') return askRFirst();
      if (after === 'last') return askREmail();
      if (after === 'email') return askRMobile();
      if (after === 'mobile') return regSummary();
    }
    function regSummary() {
      rg.fixing = false; hideInput();
      var rows = [[t.f_company, rg.company], [t.f_name, rg.first_name + ' ' + rg.last_name], [t.f_email, rg.email], [t.f_mobile, rg.mobile]];
      node('<b class="ag-sum-h">' + ICO.user + esc(t.r_sum_h) + '</b><dl>' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>', 'ag-sum');
      say(t.r_sum).then(function () {
        setChips([['ok', t.r_ok, 'go'], ['fix', t.r_fix, 'ghost']], function (c, lbl) {
          me(lbl);
          if (c === 'ok') return regCheck();
          say(t.r_which).then(function () {
            setChips(REG_FIELDS.map(function (f) { return [f[0], t[f[1]]]; }), function (k, l2) {
              me(l2); rg.fixing = true;
              if (k === 'company') return askCompany();
              if (k === 'first_name') return askRFirst();
              if (k === 'email') return askREmail();
              return askRMobile();
            });
          });
        });
      });
    }
    function regBody(extra) {
      return Object.assign({ company: rg.company, first_name: rg.first_name, last_name: rg.last_name, email: rg.email, mobile: rg.mobile, lang: cl }, extra || {});
    }
    function regFail(r) {
      if (r && r.field === 'email') return say(t.r_bad_email).then(askREmail);
      if (r && r.field === 'mobile') return say(t.r_bad_mobile).then(askRMobile);
      return say(r && r.error === 'rate' ? t.r_rate : t.r_err).then(function () { setChips([['retry', t.retry]], function () { regCheck(); }); });
    }
    function regCheck() {
      hideInput();
      var wait = node('<span>' + esc(t.r_checking) + '</span>', 'sol-msg a');
      d.fn('agent-viewing', regBody({ action: 'reg_check' })).catch(function () { return { ok: false }; }).then(function (r) {
        wait.remove();
        if (!r || r.ok === false || r.valid === false) return regFail(r);
        if (r.status === 'new') { rg.choice = 'new'; return regSend(); }
        var opts;
        if (r.email_known) {
          if (r.same_contact && r.email_is_agent && !(r.diff && (r.diff.company || r.diff.name))) {
            rg.choice = 'login';
            return say(t.k_same).then(function () { return say(t.k_same_ok); }).then(regSend);
          }
          opts = [['moved', t.o_moved], ['name', t.o_name]];
          if (r.diff && r.diff.mobile) opts.push(['mobile', t.o_mobile]);
          opts.push(['other', t.o_other, 'ghost']);
          if (r.email_is_agent) opts.push(['login', t.o_login, 'ghost']);
          return say(r.same_contact && r.email_is_agent ? t.k_diff : t.k_email).then(function () { return r.same_contact && r.email_is_agent ? null : say(t.k_email_q); })
            .then(function () { setChips(opts, regChoice); });
        }
        // alleen het mobiele nummer is bekend, bij een ander e-mailadres
        opts = [['email', t.o_email], ['moved', t.o_moved], ['notmine', t.o_notmine], ['other', t.o_other, 'ghost']];
        return say(fmt(t.k_mobile, { m: r.masked_other || '' })).then(function () { return say(t.k_mobile_q); }).then(function () { setChips(opts, regChoice); });
      });
    }
    function regChoice(c, lbl) {
      me(lbl);
      if (c === 'notmine') { rg.mobile = ''; return say(t.r_notmine).then(function () { rg.fixing = true; ask('r_mobile', t.ph_mobile, 'tel', 'tel'); }); }
      rg.choice = c;
      if (c === 'other') return say(t.r_note).then(function () { ask('r_note', t.ph_note, 'text'); });
      regSend();
    }
    function regSend() {
      hideInput();
      var wait = node('<span class="sol-env">' + ICO.mail + '</span>' + esc(t.r_checking), 'sol-msg a sol-sending');
      d.fn('agent-viewing', regBody({ action: 'reg_send', choice: rg.choice, note: rg.note })).catch(function () { return { ok: false }; }).then(function (r) {
        wait.remove();
        if (!r || !r.cid) return regFail(r && r.error === 'mail' ? { error: 'x' } : r);
        rg.cid = r.cid; rg.masked = r.masked;
        say(fmt(t.r_code, { m: r.masked })).then(function () {
          ask('r_code', t.ph_code, 'text', 'one-time-code'); input.setAttribute('inputmode', 'numeric');
          setChips([['resend', t.c_resend, 'ghost']], function (c2, l3) { me(l3); regSend(); });
        });
      });
    }
    function regVerify(code) {
      hideInput(); chips.innerHTML = '';
      d.fn('agent-viewing', { action: 'verify', cid: rg.cid, code: code, ua: navigator.userAgent }).catch(function () { return { ok: false }; }).then(function (r) {
        if (r && r.valid && r.token) {
          signedIn(r, r.email || rg.email);
          if (d.track) d.track(r.created ? 'agent_portal_registered' : 'agent_portal_login');
          var f = (r.agent && r.agent.first_name) || rg.first_name;
          var msg = r.created ? t.r_done_new : (r.changed ? t.r_done_upd : t.r_done_in);
          input.removeAttribute('inputmode'); rg = null;
          return say(fmt(msg, { f: f }), 'big').then(function () { start(true); });
        }
        var why = r && r.reason === 'expired' ? t.c_expired : (r && (r.reason === 'attempts' || r.reason === 'used')) ? t.c_attempts : (r && r.ok === false) ? t.r_err : t.c_wrong;
        say(why).then(function () {
          if (r && (r.reason === 'expired' || r.reason === 'attempts' || r.reason === 'used')) return setChips([['resend', t.c_resend, 'go']], function (c2, l3) { me(l3); regSend(); });
          ask('r_code', t.ph_code, 'text', 'one-time-code'); input.setAttribute('inputmode', 'numeric');
          setChips([['resend', t.c_resend, 'ghost']], function (c2, l3) { me(l3); regSend(); });
        });
      });
    }

    // ----- 2. gesprek -----
    function start(keepLog) {
      reset();
      var pref = ses.lang && TX[ses.lang] ? ses.lang : null;
      if (pref && pref !== cl) { var b = rootEl.querySelector('[data-cl="' + pref + '"]'); if (b) b.click(); }
      var h1 = $('#agH1'); if (h1 && ses.first) h1.textContent = L(lang).h1_hi(ses.first);
      var lo = $('#agLogout'); lo.hidden = false; lo.textContent = t.logout;
      lo.onclick = function () { var dv = devGet(); if (dv) d.fn('agent-viewing', { action: 'forget', device: dv.t }).catch(function () {}); devSet(null); d.ss.set('agent', null); location.reload(); };
      if (!keepLog) log.innerHTML = '';
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
    // 30-10-2026: 'Andere dag' / 'Andere tijd' alleen met een echte datum en tijd. Aanvraag RO500 kwam door met tijd
    // 'Time to be confirmed' omdat het vrije veld alles accepteerde. Vrije dag wordt een datum in dezelfde vorm als de knoppen.
    var MON = { jan: 1, january: 1, januari: 1, enero: 1, ene: 1, feb: 2, february: 2, februari: 2, febrero: 2, mar: 3, march: 3, maart: 3, marzo: 3, mars: 3,
      apr: 4, april: 4, abril: 4, abr: 4, may: 5, mei: 5, mayo: 5, maj: 5, jun: 6, june: 6, juni: 6, junio: 6, jul: 7, july: 7, juli: 7, julio: 7,
      aug: 8, august: 8, augustus: 8, agosto: 8, ago: 8, augusti: 8, sep: 9, sept: 9, september: 9, septiembre: 9, setiembre: 9,
      oct: 10, october: 10, oktober: 10, okt: 10, octubre: 10, nov: 11, november: 11, noviembre: 11, dec: 12, december: 12, diciembre: 12, dic: 12 };
    var WDN = { sunday: 0, zondag: 0, domingo: 0, 's\u00f6ndag': 0, monday: 1, maandag: 1, lunes: 1, 'm\u00e5ndag': 1, tuesday: 2, dinsdag: 2, martes: 2, tisdag: 2,
      wednesday: 3, woensdag: 3, 'mi\u00e9rcoles': 3, miercoles: 3, onsdag: 3, thursday: 4, donderdag: 4, jueves: 4, torsdag: 4,
      friday: 5, vrijdag: 5, viernes: 5, fredag: 5, saturday: 6, zaterdag: 6, 's\u00e1bado': 6, sabado: 6, 'l\u00f6rdag': 6 };
    function parseDayIn(v) {
      var s = String(v || '').toLowerCase(), words = s.split(/[^a-z\u00e0-\u00ff]+/).filter(Boolean);
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var dt = null, m, d = 0, mo = 0, y = 0, wd = -1;
      words.forEach(function (w) { if (!mo && MON[w]) mo = MON[w]; if (wd < 0 && WDN[w] != null) wd = WDN[w]; });
      if (words.some(function (w) { return w === 'today' || w === 'vandaag' || w === 'hoy' || w === 'idag'; })) dt = new Date(today);
      else if (words.some(function (w) { return w === 'tomorrow' || w === 'morgen' || w === 'manana' || w === 'ma\u00f1ana' || w === 'imorgon'; })) { dt = new Date(today); dt.setDate(dt.getDate() + 1); }
      else if ((m = s.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})(?:\s*[\/.-]\s*(\d{2,4}))?/))) { d = +m[1]; mo = +m[2]; y = m[3] ? +m[3] : 0; }
      else if (mo && (m = s.match(/(?:^|\D)(\d{1,2})(?!\d)/))) { d = +m[1]; m = s.match(/\b(20\d{2})\b/); y = m ? +m[1] : 0; }
      else if (wd >= 0) { dt = new Date(today); while (dt.getDay() !== wd) dt.setDate(dt.getDate() + 1); }
      if (!dt) {
        if (!d || !mo || mo > 12 || d > 31) return null;
        if (y && y < 100) y += 2000;
        dt = new Date(y || today.getFullYear(), mo - 1, d);
        if (dt.getMonth() !== mo - 1) return null;
        if (!y && dt < today && (today - dt) > 60 * 864e5) dt.setFullYear(dt.getFullYear() + 1);
        if (wd >= 0 && dt.getDay() !== wd) return null; // weekdag en datum spreken elkaar tegen
      }
      var max = new Date(today); max.setDate(max.getDate() + 365);
      if (dt < today || dt > max) return null;
      return new Intl.DateTimeFormat(LOC[cl] || 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
    }
    function parseTimeIn(v) {
      var s = String(v || '').toLowerCase(), m, h, mi = 0;
      if ((m = s.match(/(?:^|\D)(\d{1,2})\s*[:.h]\s*(\d{2})(?!\d)/))) { h = +m[1]; mi = +m[2]; }
      else if ((m = s.match(/(?:^|\D)(\d{1,2})\s*(am|pm|h|u|uur)\b/))) h = +m[1];
      else if ((m = s.match(/^\s*(\d{1,2})\s*$/))) h = +m[1];
      else return null;
      if (/pm/.test(s) && h < 12) h += 12;
      if (/am/.test(s) && h === 12) h = 0;
      if (h > 23 || mi > 59) return null;
      return (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi;
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
    // Client Claim System (BD-171, herzien 29-10): achternaam + de laatste 4 cijfers van het telefoonnummer. Daarmee checkt Sola of de klant al bij ons bekend is;
    // zo ja, dan weigert Sola de aanvraag (Rick krijgt een Telegram-alarm met de gegevens van makelaar en klant).
    function askPhone4() {
      return say(t.ask_phone4(st.first)).then(function () { ask('phone4', t.ph_phone4, 'tel'); });
    }
    function checkClient() {
      hideInput();
      var wait = node('<span>\u2026</span>', 'sol-msg a');
      return call({ action: 'client_check', ref: st.prop ? st.prop.ref : '', client_first: st.first, client_last: st.last, client_phone4: st.phone4 })
        .then(function (r) {
          wait.remove();
          if (!r || !r.ok) return say(t.neterr).then(function () { setChips([['retry', t.retry]], function () { checkClient(); }); });
          if (r.status === 'known') { st.phone4 = ''; return say(t.known_client, 'ag-keys').then(afterwards); }
          return next('phone4');
        }).catch(function () { wait.remove(); });
    }
    function next(after) {
      if (st.editing) return summary();
      if (after === 'last') return askPhone4();
      if (after === 'phone4') return askDay();
      if (after === 'day') return askTime();
      if (after === 'time') return summary();
    }
    function summary() {
      st.editing = false; hideInput();
      var p = st.prop;
      var rows = [[t.r_home, p.ref + ' · ' + (p.title || '') + (p.town ? ' (' + p.town + ')' : '')], [t.r_client, st.first + ' ' + st.last + (st.phone4 ? ' \u00b7 ****' + st.phone4 : '')], [t.r_day, st.day], [t.r_time, st.time], [t.r_keys, p.has_keys ? t.keys_y : t.keys_n]];
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
      call(Object.assign({ action: 'submit', ref: st.prop.ref, client_first: st.first, client_last: st.last, client_phone4: st.phone4, day: st.day, time: st.time, lang: cl, nonce: st.nonce, test: !!d.test }, d.meta ? d.meta() : {}))
        .then(function (r) {
          st.busy = false; wait.remove();
          if (!r.ok) return say(t.neterr).then(function () { setChips([['retry', t.retry]], function () { submit(); }); });
          if (r.duplicate) return say(t.dup).then(afterwards);
          if (r.outcome === 'processed') return celebrate(r);
          if (r.outcome === 'client_known') { st.phone4 = ''; return say(t.known_client, 'ag-keys').then(afterwards); }
          if (r.outcome === 'not_available') return say(t.na(st.prop.ref)).then(function () { st.prop = null; st.nonce = ''; askRef(); });
          if (r.outcome === 'ref_not_found') return say(t.nf(st.prop.ref)).then(function () { st.prop = null; st.nonce = ''; askRef(); });
          // 30-10-2026: de server weigert een dag of tijd die geen echte datum/kloktijd is; dan opnieuw vragen en terug naar de samenvatting
          if (r.outcome === 'incomplete' && r.missing && (r.missing.indexOf('day') >= 0 || r.missing.indexOf('time') >= 0)) { st.editing = true; st.nonce = ''; return r.missing.indexOf('day') >= 0 ? say(t.bad_day).then(askDay) : say(t.bad_time).then(askTime); }
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
      if (st.step === 'r_company') { rg.company = v.replace(/\s+/g, ' ').slice(0, 120); me(rg.company); return regNext('company'); }
      if (st.step === 'r_first') {
        var np = cleanName(v).split(' ').filter(Boolean); if (!np.length || /\d|@/.test(v)) return say(t.r_bad_name).then(function () { ask('r_first', t.ph_rfirst, 'text', 'given-name'); });
        me(np.join(' ')); rg.first_name = np[0];
        if (np.length > 1) { rg.last_name = np.slice(1).join(' '); return regNext('last'); }
        return say(fmt(t.r_last, { f: rg.first_name })).then(function () { ask('r_last', t.ph_rlast, 'text', 'family-name'); });
      }
      if (st.step === 'r_last') { var ln = cleanName(v); if (!ln || /\d|@/.test(v)) return say(t.r_bad_name).then(function () { ask('r_last', t.ph_rlast, 'text', 'family-name'); }); rg.last_name = ln; me(ln); return regNext('last'); }
      if (st.step === 'r_email') {
        var em2 = v.toLowerCase().replace(/\s+/g, ''); me(em2);
        if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em2)) return say(t.r_bad_email).then(function () { ask('r_email', t.ph_email, 'email', 'email'); });
        rg.email = em2; return regNext('email');
      }
      if (st.step === 'r_mobile') {
        me(v); var dg = v.replace(/[^0-9]/g, '');
        if (/[a-z@]/i.test(v) || dg.length < 9 || dg.length > 15 || /^(\d)\1+$/.test(dg)) return say(t.r_bad_mobile).then(function () { ask('r_mobile', t.ph_mobile, 'tel', 'tel'); });
        rg.mobile = v.replace(/\s+/g, ' ').slice(0, 30); return regNext('mobile');
      }
      if (st.step === 'r_note') { rg.note = v.slice(0, 300); me(rg.note); return regSend(); }
      if (st.step === 'r_code') { var cd = v.replace(/\D/g, ''); me(cd || v); if (cd.length !== 6) return say(t.c_wrong).then(function () { ask('r_code', t.ph_code, 'text', 'one-time-code'); }); return regVerify(cd); }
      if (st.step === 'ref') { me(v); return lookRef(v); }
      if (st.step === 'first') {
        var parts = cleanName(v).split(' ').filter(Boolean); if (!parts.length) return;
        me(parts.join(' ')); st.first = parts[0];
        if (parts.length > 1) { st.last = parts.slice(1).join(' '); return next('last'); }
        st.last = ''; return say(t.ask_last(st.first)).then(function () { ask('last', t.ph_last, 'text'); });
      }
      if (st.step === 'last') { st.last = cleanName(v); if (!st.last) return; me(st.last); return next('last'); }
      if (st.step === 'phone4') {
        var d4 = v.replace(/\D/g, '').slice(-4);
        if (d4.length !== 4) return say(t.bad_phone4).then(function () { ask('phone4', t.ph_phone4, 'tel'); });
        st.phone4 = d4; me(d4); return checkClient();
      }
      if (st.step === 'day') { me(v.slice(0, 60)); var pd = parseDayIn(v); if (!pd) return say(t.bad_day).then(askDay); st.day = pd; return next('day'); }
      if (st.step === 'time') { me(v.slice(0, 40)); var pt = parseTimeIn(v); if (!pt) return say(t.bad_time).then(askTime); st.time = pt; return next('time'); }
    });

    // ----- start -----
    if (ses) start(); else openGate();
  }

  root.PARTNERS = { html: html, bind: bind, text: L };
})(typeof window !== 'undefined' ? window : globalThis);
