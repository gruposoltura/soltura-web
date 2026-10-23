import graphics as G

BASE = 'https://gruposoltura.com'
# La web no tiene versión en español: enlazamos a las páginas en inglés.
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
    'guide_title': 'En casa en la Costa Blanca',
    'part': 'Parte',
    'saltlake': 'salinas', 'sea': 'Mar Mediterráneo', 'river': 'río Segura',
    'office': 'nuestra oficina', 'alc': 'Aeropuerto de Alicante · aprox. 30 min', 'rmu': 'Aeropuerto de Murcia · aprox. 45-60 min',
    'months': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    'layers': [('1 · El precio de compra', 'Lo que acuerdas con el vendedor', G.RED, 1.0),
               ('2 · Gastos de compra', 'Impuestos, notaría, registro: aprox. 10-13 % + asesoramiento', G.CORAL, .78),
               ('3 · Gastos anuales', 'IBI, comunidad, seguro, suministros, impuestos', G.LEMON, .56)],
    'proc': [('Orientación', 'semanas-meses'), ('Viaje de|visitas', '2-4 días'), ('Oferta', '1-3 días'),
             ('Reserva', 'inmediata'), ('Contrato|arras', '1-3 semanas'), ('Revisión|legal', '2-6 semanas'),
             ('Notaría', '1 día'), ('Llaves y|posventa', 'meses')],
    'dt_q': '¿Para qué quieres tu casa en España?',
    'dt_opts': [('Casa de|vacaciones', 'uso propio'), ('Pasar el|invierno', '3-6 meses'), ('Mudarte', 'con tu familia'),
                ('Jubilación', 'vivir aquí'), ('Alquilar', 'rentabilidad')],
}

def tc(name, slug, photo, txt, sea, apt, who):
    return {'t': name, 'img': photo, 'x': f'{txt}<div style="margin-top:1.6mm;font-size:7.6pt;color:#2E3B42"><b>Mar</b> {sea} · <b>Aeropuerto</b> {apt}</div>'
            f'<div style="margin-top:1mm;font-size:7.6pt;color:#C63232;font-weight:700">Ideal para: {who}</div>', 'tag': slug}

PAGES = [
# ------------------------------------------------------------------ PORTADA
{'kind': 'cover', 'img': 'ai-01-cover.jpg', 'kicker': 'Guía para vivir y comprar 2026',
 'title': 'En casa en la<br>Costa Blanca',
 'sub': 'Todo lo que quieres saber antes de comprar una vivienda en la Vega Baja y en la Costa Blanca Sur, y lo que implica venir a vivir aquí.',
 'edition': 'Soltura Real Estate · desde 2002'},

# ------------------------------------------------------------------ BIENVENIDA
{'kind': 'page', 'label': 'Bienvenida', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Unas palabras antes de empezar</div>'),
    ('h2', 'Bienvenido a tu <em>nuevo</em> rincón al sol'),
    ('lead', 'Gracias por pedir esta guía. Si la estás leyendo, seguramente tu sueño de una casa al sol empieza a tomar forma.'),
    ('p', 'Desde 2002 ayudamos a personas a encontrar su hogar en la Vega Baja: el interior verde de la Costa Blanca Sur, entre el río Segura, las salinas y el mar. En estos años hemos visto cambiar al comprador. Antes se compraban sobre todo casas de vacaciones; ahora llegan cada vez más familias que construyen aquí una nueva vida, personas que teletrabajan y jubilados que quieren cambiar el invierno por luz.'),
    ('p', 'Lo que no ha cambiado: comprar en España tiene sus propias reglas. Procedimientos, impuestos y trampas que conviene conocer. Esta guía lo ordena todo, con honestidad y sin discurso de venta. Verás lo que cuesta de verdad, qué preguntas debes hacerte antes, cómo es el proceso de compra y qué viene después de recibir las llaves.'),
    ('p', 'Hoy mucha gente llega con una lista que ha preparado con inteligencia artificial. Perfecto, nos encanta empezar por ahí. Pero las preguntas que marcan la diferencia rara vez están en esa lista. Esas las encontrarás aquí. Nosotros también usamos IA en todos nuestros canales online, para que llegues mejor y más completamente informado.'),
    ('p', '¿Te quedan dudas después de leerla? Llámanos, escríbenos por WhatsApp o pásate por Formentera del Segura. El café está listo.'),
    ('html', '<div class="sig">Rick van Hoeven</div><p class="small" style="margin-top:1mm">Cofundador de Soltura Real Estate</p>'),
  ], [
    ('img', 'office-crop.jpg', 60, 'Nuestra oficina en Formentera del Segura.'),
    ('quote', 'Lo que hace especial a Rick es que solo habla de lo que de verdad conoce a fondo.', 'Reseña en Google, octubre de 2026'),
    ('html', '<div class="panel lemon"><div class="kicker" style="margin-bottom:1mm">En esta guía</div><p style="margin:0">7 partes · listas para marcar · ejemplos con cifras · códigos QR a nuestra web</p></div>'),
  ]], '1.25fr 1fr'),
]},

# ------------------------------------------------------------------ QUIÉNES SOMOS
{'kind': 'page', 'label': 'Sobre Soltura Real Estate', 'hero': 'ai-09-aerial.jpg', 'hero_h': 78, 'hero_pos': 'center 60%', 'blocks': [
  ('sp', 72),
  ('h2', 'Expertos locales, <em>siempre un paso por delante</em>'),
  ('stats', [('2002', 'trabajando en la Vega Baja'), ('4,7★', 'valoración media en Google'), ('4', 'idiomas: NL · EN · DE · ES'), ('IA', 'en todos nuestros canales online')]),
  ('cols', [[
    ('h3', 'Quiénes somos'),
    ('p', 'Soltura Real Estate es una agencia inmobiliaria con oficina física en Formentera del Segura, en pleno corazón de nuestra zona. Conocemos Rojales, Ciudad Quesada, Benijófar, Guardamar, Torrevieja, Orihuela Costa y los pueblos de alrededor calle a calle.'),
    ('p', 'Estamos inscritos en el Registro de Agentes de Intermediación Inmobiliaria de la Comunitat Valenciana (RAICV 5781), somos el colegiado n.º 992 del Colegio de API de Alicante y miembros de GIPE y AIPP.'),
  ], [
    ('h3', 'Pioneros, ahora con IA'),
    ('p', 'Fuimos de los primeros con drones, app propia e información de viviendas por SMS, mucho antes de los smartphones. Hoy usamos IA en todo lo que publicamos online. En nuestra web buscas con tus propias palabras y preguntas lo que quieras sobre cada vivienda, de día y de noche, con respuestas basadas en los datos reales.'),
    ('p', 'El objetivo: que llegues mejor y más completamente informado, incluso antes de hablar con nosotros.'),
  ]]),
  ('callout', 'soltura', 'Lo que nos dicen los clientes', 'Nuestros clientes describen la web y el contacto por redes sociales como una experiencia agradable: clara, con respuesta rápida y toda la información en un solo sitio. Por eso seguimos innovando.'),
]},

# ------------------------------------------------------------------ ÍNDICE
{'kind': 'page', 'label': 'Índice', 'blocks': [
  ('h2', 'Índice'),
  ('html', '''<div class="toc">
<div class="tocp"><span class="tn">01</span><div><b>Primero piensa, luego mira</b><span>Las 10 preguntas previas · qué tipo de comprador eres · hoja de deseos</span></div><span class="tpg">5</span></div>
<div class="tocp"><span class="tn">02</span><div><b>¿Dónde quieres vivir?</b><span>Mapa de la Vega Baja · costa o pueblo · 12 localidades · clima · cómo llegar</span></div><span class="tpg">9</span></div>
<div class="tocp"><span class="tn">03</span><div><b>¿Cuánto cuesta de verdad?</b><span>Las tres capas de gastos · ejemplos con cifras · gastos anuales · hipoteca</span></div><span class="tpg">16</span></div>
<div class="tocp"><span class="tn">04</span><div><b>¿Qué vivienda te encaja?</b><span>Tipos de vivienda · obra nueva o segunda mano · alquilar · visitar con ojo</span></div><span class="tpg">21</span></div>
<div class="tocp"><span class="tn">05</span><div><b>El proceso de compra, paso a paso</b><span>Cronología · NIE y poder notarial · comprobaciones legales · los 12 errores más caros</span></div><span class="tpg">26</span></div>
<div class="tocp"><span class="tn">06</span><div><b>Tu viaje de visitas</b><span>Preparación y equipaje · así es un día con nosotros · nuestra oficina</span></div><span class="tpg">32</span></div>
<div class="tocp"><span class="tn">07</span><div><b>Después de las llaves: vivir aquí</b><span>Los primeros 30 días · impuestos · testamento · mudarse en familia · mascotas · la vida aquí</span></div><span class="tpg">36</span></div>
<div class="tocp end"><span class="tn">→</span><div><b>Para terminar</b><span>Nuestros servicios · lo que dicen los clientes · lista "¿Listo para comprar?" · contacto</span></div><span class="tpg">44</span></div>
</div>'''),
  ('h3', 'Cómo leer esta guía'),
  ('cards', [
    {'icon': 'check', 't': 'Listas', 'x': 'Marca lo que ya tienes resuelto. Imprime las páginas o rellénalas en digital.'},
    {'icon': 'euro', 't': 'Ejemplos', 'x': 'Importes reales calculados con los tipos impositivos de octubre de 2026.'},
    {'icon': 'sun', 't': 'Consejos', 'x': 'Lo que hemos aprendido en más de veinte años de práctica, en pocas líneas.'},
    {'icon': 'search', 't': 'Códigos QR', 'x': 'Escanéalos para ver la página actualizada de nuestra web, la oferta o pedir cita.'},
  ], 4),
  ('small', 'Esta guía contiene información general, no asesoramiento jurídico, fiscal ni financiero personalizado. Las normas y los tipos cambian; datos a octubre de 2026. Con gusto estudiamos tu caso concreto.'),
]},

# ================================================================== PARTE 1
{'kind': 'opener', 'num': '01', 'img': 'ai-05-planning.jpg', 'title': 'Primero piensa,<br>luego mira',
 'intro': 'Las mejores compras no empiezan en un portal inmobiliario, sino en la mesa de la cocina. Quien sabe lo que quiere antes de empezar, ve de un vistazo durante las visitas qué casa es la suya y cuál no.',
 'inside': ['Las 10 preguntas previas', '¿Qué tipo de comprador eres?', 'Hoja de trabajo: tus deseos']},

{'kind': 'page', 'label': 'Parte 1 · Primero piensa', 'blocks': [
  ('h2', 'Las 10 preguntas que debes <em>hacerte</em> primero'),
  ('lead', 'Respóndelas con sinceridad, mejor con tu pareja o tu familia. Determinan dónde buscas, cuánto puedes gastar y lo rápido que puedes decidir.'),
  ('cols', [[
    ('ol', [
      '<b>¿Para qué compro?</b> Vacaciones, pasar el invierno, mudarme, jubilarme o alquilar. El objetivo decide el lugar, el tipo de vivienda e incluso cómo financiarla.',
      '<b>¿Cuántos meses al año estaré aquí?</b> Unas semanas no es lo mismo que todo el año: piensa en mantenimiento, seguridad y si quieres alquilarla.',
      '<b>¿Cuál es mi presupuesto total?</b> No solo el precio: suma un 10 a 13 % de gastos de compra, el asesoramiento y un colchón. En la parte 3 hacemos las cuentas.',
      '<b>¿Compro con fondos propios o con hipoteca?</b> Como no residente sueles financiar un 60 a 70 %. Conoce tu margen antes de empezar a visitar.',
      '<b>¿Mar, golf o pueblo?</b> En la costa hay mucho ambiente en verano; el interior es más tranquilo, más económico y más auténtico.',
    ]),
  ], [
    ('html', '<ol class="num" start="6">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (6, '<b>¿Necesito servicios a pie?</b> Sin coche querrás vivir cerca de tiendas, médicos y transporte. En muchas urbanizaciones el coche es imprescindible.'),
      (7, '<b>¿Podré subir escaleras dentro de unos años?</b> Piensa a quince años vista: un dormitorio y un baño en planta baja valen oro.'),
      (8, '<b>¿Cuánta privacidad quiero?</b> Independiente, adosado o apartamento con piscina comunitaria: cambia el precio y también la forma de vivir.'),
      (9, '<b>¿Quién cuidará la casa cuando no esté?</b> Un jardín con piscina necesita atención semanal. Cuenta con el coste de un mantenimiento.'),
      (10, '<b>¿Y si cambian mis planes?</b> Compra una vivienda que también se venda bien después: una buena ubicación es el mejor seguro.'),
    ]) + '</ol>'),
    ('callout', 'tip', 'Consejo de nuestro equipo', '¿Venís en pareja? Responded primero cada uno por separado y luego comparad. Las diferencias son justo las conversaciones que es mejor tener en casa y no durante una visita.'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 1 · Primero piensa', 'blocks': [
  ('h2', '¿Qué tipo de <em>comprador</em> eres?'),
  ('lead', 'Cada comprador busca algo distinto. ¿Te reconoces? Así sabrás enseguida en qué fijarte.'),
  ('svg', G.decision_tree(L)),
  ('sp', 3),
  ('cards', [
    {'t': 'Casa de vacaciones', 'x': 'Vienes unas semanas al año. Elige poco mantenimiento: un apartamento o bungalow con piscina comunitaria, cerca del mar y del aeropuerto. Organiza quién gestiona la casa y las llaves.'},
    {'t': 'Pasar el invierno', 'x': 'De tres a seis meses al sol. Cuida el confort de invierno: bomba de calor, sol de tarde en la terraza, buen aislamiento. Una comunidad con vida en invierno marca la diferencia.'},
    {'t': 'Mudarte en familia', 'x': 'La casa es el motivo; la vida, el tema central. Colegios, sanidad, trabajo y un barrio de verdad pesan más que las vistas. Lee primero la parte 7.'},
    {'t': 'Jubilación', 'x': 'Vivir en una sola planta, hospital y farmacia a mano, vida social. Piensa a futuro: ¿y si conducir se vuelve difícil?'},
    {'t': 'Alquilar', 'x': 'La rentabilidad depende de la licencia, la ubicación y la ocupación fuera de temporada. Las normas son más estrictas; lee la página 24 antes de hacer números.'},
    {'t': 'Combinación', 'x': '¿Usarla tú y alquilarla cuando no estás? Es posible, pero las normas de alquiler turístico deciden qué es viable. Coméntalo antes con nosotros.'},
  ], 3),
]},

{'kind': 'page', 'label': 'Parte 1 · Hoja de trabajo', 'blocks': [
  ('h2', 'Hoja de trabajo: lo <em>imprescindible</em> y lo que suma'),
  ('lead', 'Rellénala antes de empezar a visitar y llévala en tu viaje. También nos ayuda a seleccionar de antemano las viviendas adecuadas para ti.'),
  ('cols', [[
    ('lines', 6, 'Imprescindible (sin esto, no hay trato)'),
    ('lines', 6, 'Sería un plus'),
    ('lines', 3, 'En ningún caso'),
  ], [
    ('h3', 'Marca lo que cuenta'),
    ('check', ['Tiendas y cafeterías a pie', 'Vistas al mar o despejadas', 'Piscina privada', 'Me basta con piscina comunitaria',
               'Dormitorio + baño en planta baja', 'Terraza en la azotea (solárium)', 'Jardín / espacio exterior para mascota',
               'Garaje o plaza de aparcamiento', 'Zona de invitados o dormitorio extra', 'Espacio de trabajo con buen internet',
               'Pueblo español, no urbanización', 'Vecinos internacionales', 'Campo de golf cerca', 'Colegio cerca',
               'Posibilidad de licencia de alquiler']),
    ('html', '<div class="panel lemon" style="margin-top:2mm"><b>Mi presupuesto, todo incluido:</b><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div><div style="margin-top:2mm"><b>Quiero comprar antes de:</b></div><div class="line" style="height:8mm;border-bottom:.3mm dashed #B9C2C6"></div></div>'),
  ]]),
]},

# ================================================================== PARTE 2
{'kind': 'opener', 'num': '02', 'img': 'town-rojales-1.jpg', 'title': '¿Dónde quieres<br>vivir?',
 'intro': 'La Vega Baja es el corazón verde de la Costa Blanca Sur: limoneros a orillas del Segura, salinas rosas, kilómetros de playa y pueblos donde la vida sigue igual cuando se van los turistas.',
 'inside': ['Mapa de nuestra zona', 'Costa, urbanización o pueblo', '12 localidades', 'Clima', 'Cómo llegar']},

{'kind': 'page', 'label': 'Parte 2 · Nuestra zona', 'blocks': [
  ('html', '<div class="kicker">Nuestra zona</div>'),
  ('h2', 'La Vega Baja de un <em>vistazo</em>'),
  ('lead', 'Desde nuestra oficina en Formentera del Segura llegas casi a todas partes en menos de media hora: a la playa de Guardamar, al centro de Torrevieja o al aeropuerto de Alicante.'),
  ('cols', [[
    ('svg', G.vega_map(L)),
    ('small', 'Mapa esquemático, no a escala. Foto de la página anterior: el puente de Carlos III en Rojales (Orniosviajero, CC BY-SA 4.0).'),
  ], [
    ('h3', 'Desde nuestra oficina'),
    ('table', ['Destino', 'En coche'], [
      ['Playa de Guardamar', 'aprox. 12 min'], ['Centro de Torrevieja', 'aprox. 20 min'], ['Orihuela Costa', 'aprox. 25 min'],
      ['Aeropuerto de Alicante', 'aprox. 30 min'], ['Aeropuerto de Murcia', 'aprox. 45-60 min'], ['Alicante ciudad', 'aprox. 40 min'],
      ['Hospital de Torrevieja', 'aprox. 20 min']], 'compact'),
    ('callout', 'soltura', '¿Por qué aquí?', 'Rojales es nuestro corazón desde 2002. Trabajamos a propósito en una zona que conocemos de verdad, para poder decirte en qué calle da el sol de tarde en la terraza y dónde hay jaleo en agosto.'),
  ]], '1.35fr 1fr'),
]},

{'kind': 'page', 'label': 'Parte 2 · Dónde vivir', 'blocks': [
  ('h2', '¿Costa, urbanización o <em>pueblo</em>?'),
  ('lead', 'La mayor diferencia no está en la vivienda, sino en el entorno. En la Vega Baja eliges, a grandes rasgos, entre tres mundos, a menudo a solo diez minutos unos de otros.'),
  ('cards', [
    {'img': 'town-torrevieja-3.jpg', 'tag': 'En la costa', 't': 'La playa a pie', 'x': 'Guardamar, Torrevieja, La Mata, Orihuela Costa.<br><br><b>+</b> mar, paseos marítimos, todo cerca, fácil de alquilar<br><b>−</b> mucha gente en julio y agosto, precios más altos, más apartamentos y edificios altos'},
    {'img': 'town-ciudad-quesada-1.jpg', 'tag': 'Urbanización', 't': 'Internacional y verde', 'x': 'Ciudad Quesada, La Marina, Los Montesinos, La Finca.<br><br><b>+</b> villas y bungalows amplios, golf, comunidad internacional, muchos residentes del norte de Europa<br><b>−</b> sueles necesitar coche, menos vida de pueblo'},
    {'img': 'town-rojales-2.jpg', 'tag': 'Casco urbano', 't': 'Vida de pueblo', 'x': 'Rojales, Formentera, Benijófar, Almoradí, Dolores, Catral.<br><br><b>+</b> auténtico, con vida todo el año, más económico, colegios y mercado en el pueblo<br><b>−</b> menos piscinas, calles más estrechas, menos servicios en otros idiomas'},
  ], 3),
  ('callout', 'tip', 'Consejo de nuestro equipo', 'Visita tu sitio favorito dos veces: una tarde entre semana en noviembre y un sábado de agosto. Solo entonces sabrás de verdad cómo es vivir allí.'),
  ('small', 'Fotos: La Mata (Ximonic, CC BY-SA 4.0), Ciudad Quesada (H. Helmlechner, CC BY-SA 4.0), Rojales (Ximonic, CC BY-SA 4.0), vía Wikimedia Commons.'),
]},

{'kind': 'page', 'label': 'Parte 2 · Localidades', 'blocks': [
  ('h2', 'Localidades <em>destacadas</em> (1/2)'),
  ('cards', [
    tc('Rojales', 'Nuestro corazón', 'town-rojales-1.jpg', 'Antiguo pueblo de huerta junto al Segura, con un centro tranquilo. Con Ciudad Quesada arriba tienes todos los servicios.', '9 km', '30 min', 'pueblo con todos los servicios'),
    tc('Ciudad Quesada', 'Rojales', 'town-ciudad-quesada-2.jpg', 'Zona residencial verde e internacional en las colinas, con el golf La Marquesa, restaurantes y parque acuático.', '8 km', '30 min', 'familias, golfistas, invernantes'),
    tc('Formentera del Segura', 'Nuestra oficina', 'town-formentera-del-segura-1.jpg', 'Pueblo compacto junto al Segura, con plaza de la iglesia y la zona nueva de Los Palacios. Pegado a Rojales y Benijófar.', '10 km', '30 min', 'calma con todo a mano'),
    tc('Benijófar', 'Pequeño y acogedor', 'town-benijofar-1.jpg', 'Uno de los municipios más pequeños de la comarca, en plena huerta. Cerca de la mitad de sus vecinos son extranjeros.', '11 km', '35 min', 'pueblo con vecinos internacionales'),
    tc('Guardamar del Segura', 'Junto al mar', 'town-guardamar-del-segura-3.jpg', 'Más de 11 km de playa con un gran pinar sobre las dunas y un casco urbano con vida todo el año.', '0,5-1 km', '25-30 min', 'amantes de la playa y del paseo'),
    tc('Torrevieja', 'Ciudad costera', 'town-torrevieja-2.jpg', 'Ciudad animada entre dos lagunas rosas y el mar, con vecinos de más de cien países. Todo al alcance de la mano.', 'junto al mar', '35 min', 'ciudad, mar y servicios'),
  ], 3),
  ('qr', LINKS['areas'], 'Las 16 guías de localidades: datos, colegios, sanidad y fiestas (en inglés)'),
]},

{'kind': 'page', 'label': 'Parte 2 · Localidades', 'blocks': [
  ('h2', 'Localidades <em>destacadas</em> (2/2)'),
  ('cards', [
    tc('Orihuela Costa', 'Costa', 'town-orihuela-costa-2.jpg', '16 km de costa con calas, campos de golf y el centro comercial La Zenia Boulevard. Lleno en verano.', 'junto al mar', '45 min', 'sol, mar y golf'),
    tc('San Miguel de Salinas', 'Pueblo en alto', 'town-san-miguel-de-salinas-1.jpg', 'Pueblo en lo alto con vistas a la laguna salada y la naturaleza de la Sierra Escalona a la puerta.', '12 km', '40 min', 'naturaleza y calma cerca de la costa'),
    tc('Almoradí', 'Ciudad de huerta', 'town-almoradi-2.jpg', 'Animada ciudad con una gran plaza bajo los ficus y su conocido mercado de los sábados.', '15 km', '35 min', 'quien quiere vivir la España real'),
    tc('Algorfa', 'Golf', 'town-algorfa-1.jpg', 'Pueblo pequeño con grandes urbanizaciones, entre ellas el resort de golf La Finca. Tranquilo y habitado todo el año.', '15 km', '35 min', 'golfistas y amantes de la calma'),
    tc('Los Montesinos', 'Junto a la laguna', 'town-los-montesinos-2.jpg', 'Pueblo compacto entre cítricos, a pocos kilómetros de la laguna rosa de Torrevieja.', '12 km', '40 min', 'calma cerca de Torrevieja'),
    tc('Dolores y Catral', 'Huerta', 'town-dolores-2.jpg', 'Pueblos agrícolas asequibles con colegios, centro de salud y mercado semanal. Muchas fincas y casas de campo.', '13-20 km', '30 min', 'espacio, fincas, familias'),
  ], 3),
  ('small', 'Fotos vía Wikimedia Commons: Orihuela Costa (Ximonic), San Miguel (Ximonic), Almoradí (Asdflkjh), Algorfa (19Tarrestnom65), Los Montesinos (Joanbanjo), Dolores (Wikimedia Commons), Rojales (Orniosviajero), Quesada (H. Helmlechner), Formentera y Benijófar (Galopax), Guardamar (Salu Heredia, CC BY 3.0), Torrevieja (Werner Wilmes, CC BY 2.0); resto CC BY-SA. Distancias orientativas.'),
]},

{'kind': 'page', 'label': 'Parte 2 · Clima', 'hero': 'ai-14-beach.jpg', 'hero_h': 62, 'blocks': [
  ('sp', 56),
  ('cols', [[
    ('h2', '320 días de sol <em>no</em> es un eslogan'),
    ('p', 'La Costa Blanca Sur es una de las zonas más secas y soleadas de Europa. La Organización Mundial de la Salud llegó a describir su clima como uno de los más saludables del mundo; el aire seco y las salinas son un alivio para quien sufre de articulaciones o de vías respiratorias.'),
  ], [
    ('stats', [('2.900', 'horas de sol al año (aprox.)'), ('300', 'mm de lluvia al año (aprox.)'), ('18°', 'de día en diciembre'), ('26°', 'el mar en agosto')], 2),
  ]], '1.1fr 1fr'),
  ('h3', 'Temperatura por mes (Alicante, media) — barra: mín/máx · línea discontinua: mar'),
  ('svg', G.climate_chart(L)),
  ('cols', [[('p', '<b>Invierno</b> (dic-feb): soleado y suave, fresco por la noche. De día estás en la terraza; por la noche, querrás calefacción.')],
            [('p', '<b>Primavera y otoño</b>: el mejor tiempo, ideal para visitas, golf y senderismo. De vez en cuando, algún chaparrón fuerte.')],
            [('p', '<b>Verano</b> (jun-sep): calor, 30 grados o más. Aire acondicionado y sombra no son un lujo. Agosto es el mes de más gente.')]]),
  ('small', 'Fuente: medias climatológicas de AEMET, redondeadas. Temperaturas del mar orientativas.'),
]},

{'kind': 'page', 'label': 'Parte 2 · Cómo llegar', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Cómo llegar</div>'),
    ('h2', 'Más cerca de lo que <em>crees</em>'),
    ('lead', 'Dos aeropuertos internacionales a menos de una hora, con vuelos directos todo el año a Madrid, Barcelona y gran parte de Europa.'),
    ('table', ['Desde', 'Vuelo a Alicante'], [
      ['Ámsterdam, Eindhoven, Róterdam', 'aprox. 2 h 30 - 2 h 45'], ['Bruselas, Charleroi', 'aprox. 2 h 20'],
      ['Düsseldorf, Colonia, Weeze', 'aprox. 2 h 30'], ['Londres, Mánchester', 'aprox. 2 h 15 - 2 h 30'],
      ['Estocolmo, Copenhague', 'aprox. 3 h 30 - 3 h 45']], 'compact'),
    ('small', 'Duraciones orientativas. Los horarios cambian según la temporada.'),
  ], [
    ('img', 'ai-11-plane.jpg', 70, 'Al aterrizar en Alicante ya se ven las salinas rosas.'),
  ]], '1.1fr 1fr'),
  ('cards', [
    {'icon': 'plane', 't': 'Alicante-Elche (ALC)', 'x': 'El aeropuerto más grande de la zona, a unos 30 minutos de Rojales. Muchos vuelos, también en invierno.'},
    {'icon': 'plane', 't': 'Murcia (RMU)', 'x': 'Más pequeño y tranquilo, a unos 45-60 minutos. Práctico para la parte sur de la costa.'},
    {'icon': 'car', 't': 'En coche', 'x': 'Desde Madrid, unos 450 km (aprox. 4 h 30). La AP-7 y la CV-91/CV-95 conectan todos los pueblos. Sin coche, vivir en una urbanización es complicado.'},
    {'icon': 'people', 't': 'Transporte público', 'x': 'Autobuses entre las localidades más grandes y al aeropuerto. Trenes desde Alicante y Elche a Madrid (aprox. 2 h 15).'},
  ], 2),
]},

# ================================================================== PARTE 3
{'kind': 'opener', 'num': '03', 'img': 'ai-15-bank.jpg', 'title': '¿Cuánto cuesta<br>de verdad?',
 'intro': 'El precio es solo el principio. Quien sabe de antemano lo que viene encima y lo que cuesta una vivienda al año compra con tranquilidad y le sobra para amueblarla.',
 'inside': ['Las tres capas de gastos', 'Ejemplos con cifras', 'Gastos anuales', 'Hipoteca']},

{'kind': 'page', 'label': 'Parte 3 · Gastos', 'blocks': [
  ('h2', 'Las tres <em>capas</em> de gastos'),
  ('lead', 'Piensa en tres capas. Quien solo mira la primera se lleva sorpresas en la notaría o tras el primer año.'),
  ('svg', G.cost_layers(L)),
  ('sp', 3),
  ('h3', 'La capa 2 en detalle: lo que pagas además del precio'),
  ('table', ['Concepto', 'Segunda mano', 'Obra nueva (de promotora)'], [
    ['Impuesto de transmisiones', '<b>ITP 9 %</b> del precio (11 % por encima de 1 millón €)', '—'],
    ['IVA', '—', '<b>IVA 10 %</b> del precio'],
    ['Actos jurídicos documentados', '—', '<b>AJD 1,4 %</b> del precio'],
    ['Notaría', 'aprox. 800 - 1.500&nbsp;€', 'aprox. 800 - 1.500&nbsp;€'],
    ['Registro de la Propiedad', 'aprox. 400 - 900&nbsp;€', 'aprox. 400 - 900&nbsp;€'],
    ['Gestoría (trámites, pago de impuestos)', 'aprox. 300 - 500&nbsp;€', 'aprox. 300 - 500&nbsp;€'],
    ['NIE, poder notarial, traducciones', 'según tu situación', 'según tu situación'],
    ['Revisión legal y acompañamiento', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">a consultar →</b></a>', '<a href="' + LINKS['contact'] + '"><b style="color:#C63232">a consultar →</b></a>'],
    ['!Regla general', '!aprox. 10 - 11 % + asesoramiento', '!aprox. 12 - 13 % + asesoramiento'],
  ], 'compact'),
  ('callout', 'info', 'Conviene saber', 'Tipos vigentes en la Comunitat Valenciana desde el 1 de junio de 2026 (ITP rebajado del 10 al 9 %, AJD del 1,5 al 1,4 %). Para menores de 35 años, familias numerosas y personas con discapacidad hay tipos reducidos para la vivienda habitual, con condiciones. Si pides hipoteca, desde 2019 el banco paga el impuesto y la notaría de la escritura de préstamo; tú pagas la tasación.'),
]},

{'kind': 'page', 'label': 'Parte 3 · Ejemplos', 'blocks': [
  ('h2', 'Ejemplos: <em>así</em> quedan las cuentas'),
  ('lead', 'Dos situaciones habituales, con los tipos de octubre de 2026. Los gastos adicionales son medias; tu cálculo personal lo hacemos a medida.'),
  ('cols', [[
    ('h4', 'Bungalow de segunda mano · 250.000&nbsp;€'),
    ('table', ['Concepto', 'Importe'], [
      ['Precio de compra', '250.000&nbsp;€'], ['ITP 9 %', '22.500&nbsp;€'], ['Notaría', 'aprox. 1.000&nbsp;€'], ['Registro', 'aprox. 600&nbsp;€'],
      ['Gestoría', 'aprox. 400&nbsp;€'], ['Asesoramiento', 'a consultar'], ['!Total sin asesoramiento', '!aprox. 274.500&nbsp;€']], 'num'),
    ('h4', 'Villa de segunda mano · 400.000&nbsp;€'),
    ('table', ['Concepto', 'Importe'], [
      ['Precio de compra', '400.000&nbsp;€'], ['ITP 9 %', '36.000&nbsp;€'], ['Notaría', 'aprox. 1.200&nbsp;€'], ['Registro', 'aprox. 800&nbsp;€'],
      ['Gestoría', 'aprox. 450&nbsp;€'], ['Asesoramiento', 'a consultar'], ['!Total sin asesoramiento', '!aprox. 438.450&nbsp;€']], 'num'),
  ], [
    ('h4', 'Apartamento de obra nueva · 250.000&nbsp;€'),
    ('table', ['Concepto', 'Importe'], [
      ['Precio de compra', '250.000&nbsp;€'], ['IVA 10 %', '25.000&nbsp;€'], ['AJD 1,4 %', '3.500&nbsp;€'], ['Notaría', 'aprox. 1.000&nbsp;€'],
      ['Registro', 'aprox. 600&nbsp;€'], ['Gestoría', 'aprox. 400&nbsp;€'], ['Asesoramiento', 'a consultar'], ['!Total sin asesoramiento', '!aprox. 280.500&nbsp;€']], 'num'),
    ('callout', 'warn', 'Ojo con la obra nueva', 'El IVA se paga en cada plazo: en la señal de la reserva, en los pagos durante la obra y en el resto a la entrega. Tenlo en cuenta en tu planificación.'),
    ('callout', 'tip', 'Consejo de nuestro equipo', 'Aparta los gastos de compra en cuanto reserves. En la notaría todo debe estar listo a la vez, incluido el cheque o la transferencia de los impuestos.'),
  ]]),
  ('cta', LINKS['contact'], 'Pide tu cálculo de gastos personalizado', 'Cuéntanos qué vivienda o qué presupuesto tienes en mente. Recibirás un desglose a medida con todos los conceptos de tu caso.'),
]},

{'kind': 'page', 'label': 'Parte 3 · Gastos anuales', 'blocks': [
  ('h2', '¿Cuánto cuesta una vivienda <em>al año</em>?'),
  ('lead', 'La capa 3 es la que más se olvida. Estos importes son ejemplos para la Vega Baja; varían según el municipio, la urbanización y la vivienda.'),
  ('table', ['Concepto', 'Apartamento', 'Bungalow / adosado', 'Villa con piscina'], [
    ['IBI (impuesto sobre bienes inmuebles)', '300&nbsp;€ / año', '400&nbsp;€ / año', '700&nbsp;€ / año'],
    ['Tasa de basura', '120&nbsp;€ / año', '120&nbsp;€ / año', '140&nbsp;€ / año'],
    ['Cuota de comunidad', '70&nbsp;€ / mes', '45&nbsp;€ / mes', 'normalmente no'],
    ['Seguro de hogar (continente y contenido)', '250&nbsp;€ / año', '350&nbsp;€ / año', '550&nbsp;€ / año'],
    ['Mantenimiento de jardín y piscina', '—', '—', '60+ € / mes'],
    ['Electricidad', '70&nbsp;€ / mes', '90&nbsp;€ / mes', '140&nbsp;€ / mes'],
    ['Agua', '25&nbsp;€ / mes', '35&nbsp;€ / mes', '60&nbsp;€ / mes'],
    ['Internet y móvil', '50&nbsp;€ / mes', '50&nbsp;€ / mes', '50&nbsp;€ / mes'],
  ], 'num compact'),
  ('cols', [[
    ('h3', 'Impuestos como no residente'),
    ('p', 'Si oficialmente no vives en España, pagas impuestos aunque no alquiles la vivienda: sobre una renta imputada del 1,1 % (a veces 2 %) del valor catastral. Para residentes de la UE, Noruega e Islandia el tipo es del 19 %.'),
    ('html', '<div class="panel"><b>Ejemplo:</b> valor catastral 100.000&nbsp;€ × 1,1 % = 1.100&nbsp;€ de renta imputada × 19 % = <b>aprox. 209&nbsp;€ al año</b>. Se declara con el Modelo 210, como tarde el 31 de diciembre del año siguiente.</div>'),
  ], [
    ('h3', 'Haz tus propias cuentas'),
    ('p', 'En nuestra web tienes una calculadora de gastos mensuales. Elige tipo de vivienda, situación familiar, sanidad y coche, y verás al instante lo que cuesta vivir aquí cada mes. Lo que introduces se queda en tu navegador.'),
    ('qr', LINKS['costs'], 'Calculadora de gastos mensuales'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 3 · Financiación', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Financiación</div>'),
    ('h2', 'Una hipoteca en España: <em>así</em> funciona'),
    ('lead', 'Quien resuelve su financiación a tiempo sabe qué viviendas están a su alcance y puede actuar rápido cuando aparece la adecuada.'),
    ('table', ['', 'No residente', 'Residente'], [
      ['Préstamo máximo', 'normalmente 60 - 70 %', 'hasta aprox. 80 %'], ['Plazo', 'a menudo hasta los 70-75 años', 'a menudo hasta los 75'],
      ['Aportación propia', '30 - 40 % + gastos', '20 % + gastos'], ['Interés', 'fijo, variable o mixto', 'fijo, variable o mixto']], 'compact'),
    ('h3', 'Lo que te pedirá el banco'),
    ('check', ['Pasaporte o DNI y NIE', 'Justificantes de ingresos (nóminas o cuentas anuales)', 'Últimas declaraciones de la renta', 'Extractos bancarios de los últimos meses', 'Relación de préstamos vigentes', 'Contrato de trabajo o certificado de pensión']),
  ], [
    ('img', 'ai-15-bank.jpg', 52),
    ('h3', 'El proceso en 4 pasos'),
    ('steps', [('Preaprobación', 'Con tus ingresos y ahorros, el banco fija tu margen. Hazlo antes de tu viaje de visitas.'),
               ('Tasación', 'Un tasador homologado fija el valor. El banco presta sobre el menor entre tasación y precio.'),
               ('Oferta vinculante (FEIN)', 'La recibes al menos diez días antes de la firma. En la notaría confirmas que la entiendes.'),
               ('Firma', 'La compraventa y la hipoteca se firman el mismo día en la notaría.')]),
    ('callout', 'soltura', 'Así lo hacemos', 'Te ponemos en contacto con bancos españoles y gestionamos la hipoteca desde la solicitud hasta la notaría. También nos encargamos de abrir tu cuenta bancaria.'),
  ]]),
]},

# ================================================================== PARTE 4
{'kind': 'opener', 'num': '04', 'img': 'ai-12-newbuild.jpg', 'title': '¿Qué vivienda<br>te encaja?',
 'intro': 'Apartamento o villa, obra nueva o casa con carácter, para ti o para alquilar: cada decisión afecta a tu presupuesto, al mantenimiento y a cómo vas a disfrutarla.',
 'inside': ['Tipos de vivienda', 'Obra nueva o segunda mano', 'Alquilar: las normas', 'Visitar con ojo']},

{'kind': 'page', 'label': 'Parte 4 · Tipos de vivienda', 'blocks': [
  ('h2', 'Tipos de vivienda, <em>comparados</em>'),
  ('lead', 'Son los nombres que verás en cualquier portal inmobiliario. Esto es lo que significan y en qué se diferencian.'),
  ('table', ['Tipo', '¿Qué es?', 'Ventajas', 'A tener en cuenta'], [
    ['<b>Apartamento</b>', 'Vivienda en un residencial, a menudo con piscina comunitaria', 'Poco mantenimiento, recinto cerrado, asequible', 'Cuota de comunidad, ruido de vecinos, ¿ascensor?'],
    ['<b>Ático</b>', 'Última planta con gran terraza o solárium', 'Luz, vistas, privacidad', 'Calor en verano, escaleras sin ascensor'],
    ['<b>Bungalow</b>', 'Vivienda en planta baja o primera en un conjunto bajo, con acceso propio', 'Una sola planta posible, terraza propia, muy demandado', 'Planta baja: privacidad; planta alta: escalera'],
    ['<b>Quad / adosado</b>', 'Una de cuatro o más viviendas unidas', 'Jardín propio, más barato que independiente', 'Paredes compartidas, normas de comunidad'],
    ['<b>Casa adosada / dúplex</b>', 'Vivienda en hilera de dos plantas', 'Espacio, a menudo con solárium', 'Escaleras, dormitorios arriba'],
    ['<b>Villa</b> (chalet independiente)', 'Vivienda aislada en parcela propia', 'Privacidad, piscina propia, ampliable', 'Mantenimiento, seguridad, más gastos'],
    ['<b>Finca</b> (casa de campo)', 'Casa rural con terreno, fuera del casco urbano', 'Calma, espacio, carácter', 'Licencias, agua, camino de acceso, legalización'],
  ], 'compact'),
  ('img', 'town-ciudad-quesada-1.jpg', 44, 'Ciudad Quesada: villas, bungalows y apartamentos en las colinas sobre Rojales (H. Helmlechner, CC BY-SA 4.0).'),
  ('callout', 'tip', 'Consejo de nuestro equipo', 'Pregunta siempre por la orientación. Una terraza al sur o al oeste da sol hasta tarde en invierno; en verano querrás sombra. Las mejores viviendas tienen las dos cosas.'),
]},

{'kind': 'page', 'label': 'Parte 4 · Obra nueva', 'blocks': [
  ('cols', [[
    ('h2', '¿Obra nueva o <em>segunda mano</em>?'),
    ('table', ['', 'Obra nueva', 'Segunda mano'], [
      ['Impuestos', '10 % IVA + 1,4 % AJD', '9 % ITP'], ['Lista para entrar', 'tras la entrega, a menudo 12-24 meses', 'de inmediato'],
      ['Garantía', 'garantías legales de construcción', 'ninguna, revisar bien'], ['Energía', 'moderna, eficiente', 'variable'],
      ['Ubicación', 'a menudo zonas nuevas', 'barrios consolidados, verdes'], ['Muebles', 'vacía', 'a menudo amueblada'],
      ['Lo que ves', 'plano y piso piloto', 'la casa real']], 'compact'),
    ('h3', 'Comprar a una promotora'),
    ('ul', ['Pagas por plazos: reserva, pagos durante la obra (a menudo 30-50 %) y el resto a la entrega.',
            'Todo pago antes de la entrega debe estar cubierto por ley con un <b>aval bancario o seguro</b>. Pídelo siempre.',
            'Comprueba la licencia de obra y el calendario, y acuerda qué pasa si hay retrasos.',
            'En la entrega revisamos la vivienda contigo. Los pequeños defectos van a una lista que la promotora debe resolver.']),
  ], [
    ('img', 'ai-12-newbuild.jpg', 58),
    ('callout', 'soltura', 'Así trabajamos la obra nueva', '<p>No enviamos montones de folletos y listas de precios. En obra nueva queremos hablar contigo primero en persona y, a ser posible, enseñarte el proyecto sobre el terreno. Un plano no dice cómo entra el sol, cómo se siente el barrio ni a qué distancia está de verdad el supermercado.</p><p>Para ello te pedimos nombre, móvil, correo electrónico y cuándo puedes venir.</p>'),
    ('qr', LINKS['contact'], 'Pide una primera reunión sobre obra nueva'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 4 · Alquilar', 'blocks': [
  ('h2', 'Alquilar: ¿qué se <em>puede</em> hacer hoy?'),
  ('lead', 'España y la Comunitat Valenciana han endurecido mucho las normas del alquiler vacacional desde 2024. Si quieres alquilar, compruébalo antes de comprar.'),
  ('cols', [[
    ('h3', 'Alquiler turístico (corta duración)'),
    ('check', [
      '<b>Inscripción en la Generalitat</b>, en el registro de viviendas turísticas, con un informe del ayuntamiento que confirme que el uso turístico está permitido allí.',
      '<b>Número de registro estatal</b>: desde el 1 de julio de 2025, sin este número la vivienda no puede anunciarse en Airbnb, Booking ni otras plataformas.',
      '<b>Aprobación de la comunidad</b>: desde abril de 2025, en un edificio de viviendas 3/5 de los propietarios deben aprobar el nuevo alquiler turístico.',
      '<b>Limitaciones municipales</b>: algunos ayuntamientos ya no conceden nuevas licencias en ciertas zonas.',
      '<b>Registro de huéspedes</b> ante la policía y un seguro de responsabilidad civil.',
    ]),
  ], [
    ('h3', 'Larga duración'),
    ('p', 'Si alquilas como vivienda por un año o más, se aplica la Ley de Arrendamientos Urbanos (LAU). Como arrendador particular, en principio quedas vinculado a contratos de hasta cinco años. Menos trámites de licencia, pero menos flexible.'),
    ('h3', 'Impuestos sobre las rentas'),
    ('p', 'Como no residente de la UE pagas un 19 % sobre el rendimiento neto, tras deducir gastos. Fuera de la UE, un 24 % sobre el bruto. Declaración trimestral con el Modelo 210.'),
    ('callout', 'warn', 'Atención', 'No des por hecho que una vivienda "se puede alquilar" porque el propietario actual lo haga. Pide el número de registro y comprueba si puede continuar a tu nombre.'),
  ]]),
  ('img', 'ai-10-remote.jpg', 46, 'Cada vez más compradores combinan uso propio y teletrabajo en lugar de alquilar.', 'center 40%'),
]},

{'kind': 'page', 'label': 'Parte 4 · Visitar con ojo', 'band': 'ai-03-viewing.jpg', 'band_h': 62, 'band_pos': 'center 40%', 'blocks': [
  ('h2', 'Visitar con ojo: <em>mira más allá</em> de la cocina'),
  ('lead', 'Una casa bonita seduce. Llévate esta lista y fíjate también en lo que no se ve a primera vista.'),
  ('cols', [[
    ('h3', 'En la casa y alrededor'),
    ('check', ['Manchas de humedad o moho, sobre todo en invierno y en plantas bajas', 'Grietas en paredes y terrazas',
               'Antigüedad del aire acondicionado, el termo y la depuradora', 'Presión del agua y agua caliente', 'Tejado y solárium: desagües, filtraciones',
               '¿Ampliaciones, porches y piscina legales e inscritos?', 'Orientación de la terraza y del salón',
               'Ruido: carretera, vecinos, bares, perros', 'Internet: ¿hay fibra?', 'Ventanas: doble cristal, persianas, mosquiteras']),
  ], [
    ('h3', 'En el entorno'),
    ('check', ['Da una vuelta: ¿cómo es la calle?', '¿Cuánta gente hay en temporada alta?', 'Distancia a supermercado, farmacia, médico',
               'Proyectos de obras en la zona', 'Estado de la piscina y los jardines comunitarios', 'Cuota de comunidad y pagos pendientes',
               'Riesgo de inundación en viviendas bajas junto al Segura']),
    ('callout', 'tip', 'De la práctica', 'Un cliente compraba una casa cuya piscina nunca se había legalizado. Lo vimos en los papeles y se regularizó antes de la notaría. Al vendedor le costó algo de esfuerzo; al comprador le ahorró una multa y un problema al revender.'),
  ]]),
]},

# ================================================================== PARTE 5
{'kind': 'opener', 'num': '05', 'img': 'ai-04-keys.jpg', 'title': 'El proceso de compra,<br>paso a paso',
 'intro': 'En España la compra se cierra en la notaría, pero los acuerdos importantes se toman antes. Quien conoce el orden sabe en todo momento en qué punto está.',
 'inside': ['Del primer contacto a las llaves', 'NIE y poder notarial', 'Comprobaciones legales', 'Los 12 errores más caros']},

{'kind': 'page', 'label': 'Parte 5 · El proceso', 'blocks': [
  ('h2', 'Del primer contacto a las <em>llaves</em>'),
  ('lead', 'Una compra media tarda de cuatro a ocho semanas desde la oferta hasta la notaría. La fase previa dura meses en la mayoría de los casos: de media pasan unos nueve meses entre tener la financiación lista y recibir las llaves.'),
  ('svg', G.process_bar(L)),
  ('sp', 2),
  ('steps', [
    ('Reserva', 'En cuanto acuerdas un precio con el vendedor, firmas un contrato de reserva y pagas una señal, normalmente de 3.000 a 5.000&nbsp;€. La vivienda sale del mercado y el precio queda fijado.', 'día 1'),
    ('Contrato de arras', 'Fija el precio, las condiciones y la fecha de la escritura. Completas la señal hasta, por lo general, el 10 % del precio.', 'en 1-3 semanas'),
    ('Comprobaciones y preparación', 'Catastro, registro, cargas, licencias, cuotas de comunidad: lo comprobamos y te contamos lo que encontramos. Coordinamos notaría, banco y, si hace falta, abogado.', 'en paralelo'),
    ('Escritura ante notario', 'Pagas el resto y firmas la escritura. Uno de nosotros está contigo ese día. Si no puedes venir, se hace con un poder notarial.', 'a las 4-8 semanas'),
    ('Inscripción y posventa', 'La escritura se inscribe en el Registro de la Propiedad. Ponemos a tu nombre los suministros, el IBI y la comunidad.', 'después'),
  ]),
  ('stats', [('4-8 sem.', 'de la oferta aceptada a la notaría'), ('10 %', 'señal habitual en el contrato de arras'), ('± 9 meses', 'de media, de "financiación lista" a las llaves'), ('1 día', 'en la notaría, con uno de nosotros a tu lado')]),
]},

{'kind': 'page', 'label': 'Parte 5 · Papeles', 'band': 'town-san-miguel-de-salinas-1.jpg', 'band_h': 38, 'band_pos': 'center 60%', 'blocks': [
  ('h2', 'NIE, cuenta bancaria y <em>poder notarial</em>'),
  ('cols', [[
    ('h3', 'El NIE'),
    ('p', 'Es tu número de identificación como extranjero en España. Lo necesitas para la notaría, la cuenta bancaria, los suministros y los impuestos. Sin NIE no hay compra. (Si tienes nacionalidad española, te basta con tu DNI.)'),
    ('ul', ['Se solicita en la policía en España, en un consulado español en tu país o a través de un representante con poder.',
            'Cuenta con unas semanas de plazo. Empieza mucho antes de reservar una vivienda.',
            '¿Compráis dos personas? Cada una necesita su propio NIE.']),
    ('h3', 'Una cuenta bancaria española'),
    ('p', 'Para el pago en la notaría y la domiciliación del IBI, la comunidad y los suministros. El banco te pedirá pasaporte, NIE y un justificante de ingresos o del origen de los fondos.'),
  ], [
    ('h3', 'Comprar a distancia con un poder'),
    ('p', 'No hace falta que vayas tú a la notaría. Con un poder notarial, otra persona puede firmar, pagar y dar de alta los suministros en tu nombre. El poder se firma ante un notario español o ante un notario de tu país, con apostilla.'),
    ('quote', 'Lo organizan todo de la A a la Z. Es increíble comprar un par de apartamentos a distancia sin haber estado allí ni una sola vez.', 'Reseña en Google, octubre de 2026'),
    ('callout', 'soltura', 'Así lo hacemos', 'Te ayudamos con los formularios y las citas del NIE, abrimos contigo la cuenta bancaria y, si quieres, lo resolvemos todo con un poder, para que solo tengas que venir a por las llaves.'),
  ]]),
  ('h3', '¿Qué necesitas para cada trámite?'),
  ('table', ['', 'NIE', 'Cuenta bancaria', 'Poder'], [
    ['Pasaporte o documento de identidad', '✓', '✓', '✓'], ['Formulario de solicitud (EX-15)', '✓', '', ''],
    ['Motivo de la solicitud (p. ej. reserva de vivienda)', '✓', '', ''], ['NIE', '', '✓', '✓'],
    ['Justificante de ingresos / origen de los fondos', '', '✓', ''], ['Apostilla (poder firmado fuera de España)', '', '', '✓']], 'compact'),
]},

{'kind': 'page', 'label': 'Parte 5 · Comprobaciones', 'blocks': [
  ('h2', 'La revisión legal: <em>qué</em> comprobamos'),
  ('lead', 'En España, las deudas de una vivienda pasan al nuevo propietario. Por eso la revisión previa es la parte más importante de la compra.'),
  ('cols', [[
    ('check', [
      '<b>Nota simple</b>: ¿quién es el titular según el Registro de la Propiedad? ¿Hay hipoteca o embargo sobre la vivienda?',
      '<b>Catastro</b>: ¿coinciden la superficie y la descripción con la realidad y con el registro?',
      '<b>Licencias</b>: ¿la vivienda, las ampliaciones, los porches y la piscina son legales y están inscritos?',
      '<b>Habitabilidad</b> (cédula / licencia de primera ocupación) cuando se exige para contratar suministros.',
      '<b>IBI</b>: ¿está pagado el impuesto de los últimos años?',
    ]),
  ], [
    ('check', [
      '<b>Comunidad</b>: certificado del administrador de que no hay deudas y de si hay derramas previstas.',
      '<b>Suministros</b>: sin facturas pendientes de agua y luz.',
      '<b>Certificado energético</b>: obligatorio en la venta.',
      '<b>Situación urbanística</b>: ¿está la vivienda en una zona con planes, limitaciones o riesgos?',
      '<b>Vendedor no residente</b>: el comprador retiene el 3 % del precio y lo ingresa en Hacienda. Lo gestionamos en la notaría.',
    ]),
  ]]),
  ('callout', 'soltura', 'Independientes y transparentes', 'Te contamos lo que encontramos, aunque retrase la venta. Un cliente escribió: "Son transparentes con los defectos o costes que no se ven y lo investigan todo a fondo." Así queremos trabajar.'),
  ('img', 'ai-04-keys.jpg', 50, '', 'center 60%'),
]},

{'kind': 'page', 'label': 'Parte 5 · Oferta y arras', 'blocks': [
  ('h2', 'Ofertar, reservar y qué significa <em>"reservada"</em>'),
  ('cols', [[
    ('h3', 'Hacer una oferta'),
    ('p', 'La oferta se hace a través de nosotros, mejor por escrito, con el precio, las condiciones (como una hipoteca o los muebles que se quedan) y la fecha de escritura que deseas. La presentamos al vendedor y negociamos por ti.'),
    ('h3', 'Reservada en Soltura Real Estate'),
    ('p', 'Cuando se acepta una oferta y se paga la reserva, la vivienda pasa a estar reservada. Dejamos de hacer visitas y damos por hecho que la venta sigue adelante. Si la operación se cae, la vivienda vuelve al mercado. En nuestra web puedes apuntarte para recibir un aviso en ese momento.'),
  ], [
    ('h3', 'El contrato de arras'),
    ('table', ['Qué pasa si...', 'Consecuencia'], [
      ['el comprador desiste', 'el comprador pierde la señal'],
      ['el vendedor desiste', 'el vendedor devuelve la señal por duplicado'],
      ['no se concede la hipoteca', 'solo está cubierto si figura como condición en el contrato']], 'compact'),
    ('p', 'Es la forma habitual (arras penitenciales, art. 1454 del Código Civil). Lee siempre bien el contrato: las condiciones deciden quién asume cada riesgo.'),
    ('callout', 'warn', 'Atención', 'Nunca pagues una señal directamente a un vendedor que no conoces, ni sin contrato por escrito. Con nosotros, la señal va a una cuenta controlada y con contrato firmado.'),
  ]]),
  ('cols', [[
    ('callout', 'tip', 'Consejo: ofertas realistas', 'Una oferta muy por debajo del precio puede funcionar si la vivienda lleva mucho tiempo en venta, pero las buenas casas de la Vega Baja vuelan. Te decimos con honestidad cómo está el precio frente a ventas comparables.'),
  ], [
    ('qr', LINKS['home'], '¿Vivienda reservada? Apúntate en su ficha a "Back on the market"'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 5 · Errores', 'blocks': [
  ('h2', 'Los 12 <em>errores</em> más caros (y cómo evitarlos)'),
  ('lead', 'En más de veinte años los hemos visto todos. Por suerte, todos se pueden evitar.'),
  ('cols', [[
    ('ol', [
      '<b>Mirar solo el precio.</b> Cuenta siempre con un 10 a 13 % de gastos, más el asesoramiento y un colchón.',
      '<b>Enamorarte en vacaciones y firmar esa misma semana.</b> Consúltalo con la almohada y vuelve a ver la zona en otro momento.',
      '<b>No hacer revisión legal.</b> Las deudas y las obras ilegales pasan al nuevo propietario.',
      '<b>Pagar una señal sin contrato</b> o a alguien que no conoces.',
      '<b>Pedir el NIE tarde.</b> La notaría se retrasa y pones en riesgo tu señal.',
      '<b>Contar con ingresos de alquiler</b> sin comprobar si está permitido alquilar.',
    ]),
  ], [
    ('html', '<ol class="num">' + ''.join(f'<li><span class="n">{i}</span><div>{x}</div></li>' for i, x in [
      (7, '<b>Subestimar el mantenimiento.</b> Piscina, jardín y aire acondicionado cuestan dinero, también cuando no estás.'),
      (8, '<b>No hacer testamento español.</b> Tus herederos perderán meses y dinero.'),
      (9, '<b>Olvidar el impuesto de no residentes.</b> Aunque no alquiles, declaras cada año.'),
      (10, '<b>Subestimar el sol del verano.</b> Una terraza al oeste sin sombra no se puede usar en agosto.'),
      (11, '<b>Comprar lejos de todo</b> sin coche o sin pensar en el futuro.'),
      (12, '<b>Querer hacerlo todo solo</b> en un sistema que no conoces. Un buen acompañamiento se amortiza.'),
    ]) + '</ol>'),
  ]]),
  ('img', 'ai-16-cycling.jpg', 56, 'Comprar bien preparado significa, sobre todo, disfrutar después.', 'center 45%'),
]},

# ================================================================== PARTE 6
{'kind': 'opener', 'num': '06', 'img': 'ai-03-viewing.jpg', 'title': 'Tu viaje<br>de visitas',
 'intro': 'Un viaje de visitas bien preparado es el camino más corto a la vivienda adecuada. Seleccionamos antes, planificamos con eficiencia y te llevamos en coche, para que tú solo te concentres en elegir.',
 'inside': ['Preparación', 'Equipaje', 'Un día con nosotros', 'Nuestra oficina']},

{'kind': 'page', 'label': 'Parte 6 · Preparación', 'band': 'ai-11-plane.jpg', 'band_h': 62, 'band_pos': 'center', 'blocks': [
  ('h2', 'Así preparas el <em>viaje</em>'),
  ('cols', [[
    ('h3', 'Lo que necesitamos antes'),
    ('check', ['Nombre y apellidos de todos los compradores', 'Móvil y correo electrónico', 'Fechas del viaje y cuántos días tienes',
               'Tu presupuesto, todo incluido', 'Fondos propios o hipoteca, ¿ya preaprobada?', 'Tu hoja de deseos (página 8)',
               'Viviendas que ya viste en internet, con su referencia']),
    ('callout', 'tip', 'Consejo de nuestro equipo', 'Si puedes elegir, no vengas en agosto. De octubre a junio es ideal: buen tiempo, carreteras tranquilas y más tiempo y atención de nuestro equipo.'),
    ('h3', '¿Cuántos días?'),
    ('p', 'Cuenta con dos a cuatro días. Día 1: conocernos y visitar. Día 2: seguir visitando y volver a las favoritas. Día 3: segunda visita, el entorno y, si hace falta, el banco o el NIE.'),
  ], [
    ('h3', 'Equipaje'),
    ('check', ['Pasaporte o documento de identidad (también para el NIE y el banco)', 'NIE, si ya lo tienes', 'Justificante de ingresos y extractos recientes',
               'Tu hoja de deseos y esta guía', 'Móvil con cámara, batería cargada y powerbank', 'Metro para los muebles', 'Gafas de sol, gorra y agua (también en invierno)',
               'Calzado cómodo: escaleras, solárium, jardines', 'Tarjeta bancaria para una posible reserva']),
    ('img', 'ai-05-planning.jpg', 60),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 6 · Un día con nosotros', 'band': 'town-rojales-2.jpg', 'band_h': 72, 'band_pos': 'center 65%', 'blocks': [
  ('h2', 'Así es un <em>día de visitas</em>'),
  ('cols', [[
    ('steps', [
      ('Bienvenida en la oficina', 'Café en Formentera del Segura. Repasamos tus deseos y te enseñamos la ruta.', '10:00'),
      ('Viviendas 1 a 3', 'Te llevamos en coche. Entre una y otra te contamos cómo es el barrio, los pueblos y los precios.', '10:45'),
      ('Comida', 'En uno de los pueblos: una pausa para ordenar impresiones y preguntar. A menudo aquí ya cae una vivienda.', '13:30'),
      ('Viviendas 4 a 6', 'Según lo que viste por la mañana, ajustamos el programa de la tarde.', '15:00'),
      ('Balance', '¿Qué te gustó, qué te decepcionó? ¿Qué vivienda quieres volver a ver, quizá a otra hora?', '18:00'),
    ]),
  ], [
    ('img', 'ai-06-market.jpg', 62, 'Dedica tiempo al propio pueblo: el mercado te dice más que un plano.'),
    ('callout', 'tip', 'Sin pasarse', 'Más de seis a ocho viviendas en un día se convierte en un borrón. Haz una foto del nombre de la calle antes de entrar y anota justo después tres pros y tres contras de cada casa.'),
    ('callout', 'soltura', 'Selección previa', 'Como conocemos tus deseos de antemano, solo ves viviendas que de verdad importan. A menudo también algunas que aún no están en internet.'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 6 · Nuestra oficina', 'hero': 'office-crop.jpg', 'hero_h': 72, 'hero_pos': 'center', 'blocks': [
  ('sp', 66),
  ('cols', [[
    ('html', '<div class="kicker">Ven a vernos</div>'),
    ('h2', 'Nuestra oficina en <em>Formentera del Segura</em>'),
    ('p', 'En pleno centro de nuestra zona, a pocos minutos de Rojales, Benijófar y Ciudad Quesada. Aparcamiento en la puerta.'),
    ('facts', [('Dirección', 'Avda. de la Constitución s/n<br>03179 Formentera del Segura'), ('Horario', 'lun-vie 10:00-14:00<br>sáb-dom con cita'),
               ('Teléfono', '+34 966 792 113'), ('WhatsApp', '+34 664 414 515'), ('Correo', 'info@gruposoltura.com'), ('Idiomas', 'neerlandés, inglés, alemán, español')]),
  ], [
    ('qr', LINKS['maps'], 'Cómo llegar en Google Maps'),
    ('qr', LINKS['wa'], 'Escríbenos por WhatsApp'),
    ('qr', LINKS['contact'], 'Pide cita'),
  ]], '1.25fr 1fr'),
  ('img', 'town-formentera-del-segura-1.jpg', 50, 'La plaza de Formentera del Segura, con la iglesia y el ayuntamiento, a pocos minutos de nuestra oficina (Galopax, CC BY-SA 4.0).'),
]},

# ================================================================== PARTE 7
{'kind': 'opener', 'num': '07', 'img': 'ai-02-family.jpg', 'title': 'Después de las llaves:<br>vivir aquí',
 'intro': 'Comprar la casa es un paso. Construir aquí una vida es todo lo demás. Después de la notaría seguimos siendo tu persona de contacto.',
 'inside': ['Los primeros 30 días', 'Impuestos', 'Testamento', 'Mudarse en familia', 'Mascotas', 'La vida aquí', 'Glosario']},

{'kind': 'page', 'label': 'Parte 7 · Los primeros 30 días', 'blocks': [
  ('h2', 'Los primeros <em>30 días</em> con las llaves'),
  ('lead', 'Ya eres propietario. Esto es lo que se resuelve en las primeras semanas; casi todo lo hacemos contigo o nos encargamos nosotros.'),
  ('cols', [[
    ('h3', 'Casa y suministros'),
    ('check', ['Luz a tu nombre (con domiciliación bancaria)', 'Agua y basura a tu nombre', 'Contratar internet y televisión (¿fibra?)',
               'Contratar el seguro de hogar', 'Cambiar las cerraduras', 'Valorar alarma o cámaras',
               'Organizar el mantenimiento de jardín y piscina', 'Organizar quién guarda las llaves cuando no estás']),
  ], [
    ('h3', 'Papeles'),
    ('check', ['IBI y basura a tu nombre y domiciliados', 'Comunidad: avisar al administrador y domiciliar la cuota', 'Comprobar la inscripción en el Registro de la Propiedad',
               'Hacer testamento español', 'Si te mudas: empadronarte en el ayuntamiento', 'Si te mudas: registrarte como residente',
               'Como no residente: apuntar el Modelo 210 en tu agenda', 'Guardar copia digital de todas las escrituras']),
  ]]),
  ('callout', 'soltura', 'Posventa en tu idioma', 'Después de la notaría ponemos a tu nombre los suministros, el IBI y la comunidad. Luego puedes seguir acudiendo a nosotros para dudas, profesionales de confianza y papeleo. Un cliente escribió: "También quedé contento con el servicio posventa. Podía seguir acudiendo a ellos con mis preguntas."'),
  ('img', 'ai-08-dog.jpg', 52, '', 'center 55%'),
]},

{'kind': 'page', 'label': 'Parte 7 · Impuestos', 'band': 'ai-10-remote.jpg', 'band_h': 68, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Impuestos como <em>propietario</em>'),
  ('lead', 'La gran diferencia es si eres residente fiscal. En principio lo eres si vives más de 183 días al año en España o si aquí está el centro de tus intereses.'),
  ('table', ['', 'No residente', 'Residente'], [
    ['Impuesto sobre la renta', 'Sobre la renta imputada de tu vivienda (1,1-2 % del valor catastral) y sobre los alquileres', 'Sobre tu renta mundial, tipo progresivo'],
    ['Tipo (ciudadano UE)', '19 %', 'progresivo por tramos'],
    ['Declaración', 'Modelo 210, anual (uso propio) o trimestral (alquiler)', 'Declaración anual del IRPF (la renta)'],
    ['IBI y basura', 'sí, cada año al ayuntamiento', 'sí, cada año al ayuntamiento'],
    ['Al vender', '19 % sobre la ganancia; el comprador retiene el 3 %', 'progresivo 19-30 % sobre la ganancia; posibles exenciones'],
    ['Plusvalía municipal', 'al vender, la paga el vendedor', 'al vender, la paga el vendedor'],
  ], 'compact'),
  ('cols', [[
    ('h3', 'Modelo 210: una vez al año'),
    ('p', 'Como no residente declaras cada año, aunque solo uses la vivienda tú. Presentamos esta declaración para muchos de nuestros clientes; además, es un buen momento para saludarnos cada año.'),
  ], [
    ('h3', 'Doble imposición'),
    ('p', 'España tiene convenios fiscales con, entre otros, Países Bajos, Bélgica, Alemania y Reino Unido. Si declaras en España y en tu país, busca buen asesoramiento.'),
  ]]),
  ('callout', 'info', 'Conviene saber', 'La fiscalidad es personal. Esta página es un resumen, no asesoramiento. Para tu caso trabajamos con asesores fiscales que conocen la parte neerlandesa, belga y española.'),
]},

{'kind': 'page', 'label': 'Parte 7 · Testamento', 'band': 'town-orihuela-costa-1.jpg', 'band_h': 66, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('html', '<div class="kicker">Herencias</div>'),
    ('h2', 'Un testamento español: <em>poco</em> esfuerzo, gran diferencia'),
    ('p', 'Una vivienda en España sigue los procedimientos españoles, aunque tengas el testamento bien hecho en tu país. Sin testamento español, tus herederos primero tienen que acreditar quién hereda. Eso cuesta meses, traducciones y dinero, y mientras tanto la vivienda no se puede vender ni poner a su nombre.'),
    ('h3', 'Por qué un testamento español'),
    ('ul', ['Tramitación más rápida y económica ante notario español.', 'Gracias al Reglamento Europeo de Sucesiones puedes elegir la ley de tu nacionalidad.',
            'El testamento español se limita a tus bienes en España y no sustituye al de tu país.', 'Es sencillo: una cita en la notaría.']),
    ('callout', 'tip', 'Sucesiones en la Comunitat Valenciana', 'Desde 2023, cónyuges, hijos y padres tienen aquí una bonificación del 99 % en el Impuesto sobre Sucesiones. Revisa tu caso: hay condiciones, y tu país también puede gravar la herencia.'),
  ], [
    ('img', 'ai-16-cycling.jpg', 96, '', 'center'),
    ('callout', 'soltura', 'Así lo hacemos', 'Te organizamos el testamento español en la notaría, explicado en tu idioma. Muchos clientes lo hacen el mismo día de la escritura.'),
  ]], '1.15fr 1fr'),
]},

{'kind': 'page', 'label': 'Parte 7 · Mudarse', 'band': 'ai-02-family.jpg', 'band_h': 78, 'band_pos': 'center 35%', 'blocks': [
  ('h2', 'Mudarte con tu <em>familia</em>'),
  ('lead', 'Cada vez más compradores son familias jóvenes que construyen aquí una nueva vida. La casa es el motivo; la vida, el tema central.'),
  ('cols', [[
    ('cards', [
      {'icon': 'doc', 't': 'Registrarse', 'x': '<b>Padrón</b>: inscripción en el ayuntamiento, necesaria para el colegio, la sanidad y muchos trámites locales. <b>Residencia</b>: los ciudadanos de la UE que se quedan más de tres meses se registran como residentes (con justificante de ingresos y seguro médico). Fuera de la UE se necesita visado o permiso de residencia.'},
      {'icon': 'health', 't': 'Sanidad', 'x': 'Si trabajas en España, estás cubierto por la Seguridad Social. Los jubilados de la UE suelen trasladar su cobertura con el formulario S1. Si no, seguro privado. Después, alta en el centro de salud y tarjeta SIP. Hospitales en Torrevieja y Orihuela. Emergencias: 112.'},
    ], 1),
  ], [
    ('cards', [
      {'icon': 'school', 't': 'Colegios', 'x': 'Colegios públicos, concertados e internacionales con currículo británico u otros. En los públicos se enseña en castellano y valenciano, con apoyo lingüístico para los recién llegados. La matrícula suele abrirse en primavera; los internacionales suelen tener lista de espera. Tu colegio puede decidir dónde compras.'},
      {'icon': 'laptop', 't': 'Teletrabajo', 'x': 'Con fibra en la mayoría de pueblos y urbanizaciones trabajas aquí igual que en casa. Para ciudadanos de fuera de la UE existe el visado de nómada digital. Ojo con tu situación fiscal en cuanto pasas a ser residente.'},
    ], 1),
  ]]),
  ('cta', LINKS['move'], 'Más sobre mudarte a España', 'En nuestra web (en inglés) encontrarás los pasos antes, durante y después de la compra, y puedes pedir un plan personal.'),
]},

{'kind': 'page', 'label': 'Parte 7 · Mascotas y día a día', 'band': 'town-guardamar-del-segura-3.jpg', 'band_h': 54, 'band_pos': 'center 60%', 'blocks': [
  ('cols', [[
    ('h2', 'Con tu <em>mascota</em>'),
    ('img', 'ai-08-dog.jpg', 60),
    ('h3', 'Viajar con perro o gato dentro de la UE'),
    ('check', ['Microchip (norma ISO)', 'Vacuna antirrábica válida, al menos 21 días antes de viajar', 'Pasaporte europeo para animales',
               'Alta en un veterinario en España e inscripción en el registro valenciano de animales de compañía']),
    ('callout', 'tip', 'Consejo de nuestro equipo', 'Cuidado con la procesionaria en los pinares en febrero y marzo, y con las baldosas calientes en verano. Un seguro de responsabilidad civil para tu perro es recomendable; la obligación estatal aún está pendiente de desarrollo.'),
  ], [
    ('h2', 'El día a <em>día</em>'),
    ('h3', 'Tu coche'),
    ('p', 'Si vienes a vivir aquí con un coche de matrícula extranjera, con el tiempo tendrás que matricularlo en España. Un carné de conducir de la UE sigue siendo válido.'),
    ('h3', 'Seguridad'),
    ('p', 'La Vega Baja es una comarca tranquila. El sentido común ayuda: persianas, una buena cerradura, quizá una alarma, y un vecino o administrador que eche un ojo cuando no estás.'),
    ('h3', 'Idioma'),
    ('p', 'El valenciano es cooficial: lo verás en carteles y documentos, y en los colegios se enseña junto al castellano. En el día a día el castellano basta de sobra; en las urbanizaciones oirás además mucho inglés.'),
    ('h3', 'Correo y paquetes'),
    ('p', 'En muchas urbanizaciones el correo no llega a la puerta. Un apartado de correos o una dirección en un punto de recogida es práctico.'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 7 · La vida aquí', 'band': 'ai-06-market.jpg', 'band_h': 46, 'band_pos': 'center 55%', 'blocks': [
  ('h2', 'La vida en la <em>Vega Baja</em>'),
  ('cols', [[
    ('img', 'ai-07-food.jpg', 52, 'Arroz, pescado y verdura de la huerta: aquí se cocina sencillo y fresco.'),
    ('h3', 'Comida y mercados'),
    ('p', 'La huerta da todo el año alcachofas, cítricos, tomates y granadas. Cada municipio tiene su mercado semanal; el de Almoradí, los sábados, es de los más grandes. Prueba el arroz con costra, el caldero y un vino del Vinalopó.'),
    ('h3', 'Naturaleza'),
    ('p', 'Las lagunas rosas de Torrevieja y La Mata, el parque natural de El Hondo con sus flamencos, los pinares sobre las dunas de Guardamar y la Sierra Escalona: aquí se camina y se pedalea todo el año.'),
  ], [
    ('img', 'ai-13-fiesta.jpg', 52, 'Cada municipio celebra sus propias fiestas, a menudo durante días.'),
    ('h3', 'Fiestas a lo largo del año'),
    ('table', ['Cuándo', 'Qué'], [
      ['enero', 'Reyes Magos, cabalgatas con caramelos para los niños'], ['febrero', 'Carnaval, muy grande en Torrevieja'],
      ['marzo/abril', 'Semana Santa: procesiones, impresionantes en Orihuela'], ['junio', 'San Juan: fuegos y hogueras en la playa'],
      ['julio/agosto', 'Fiestas en casi todos los pueblos, Moros y Cristianos'], ['octubre', 'Fiestas en Rojales y fiestas de la cosecha en muchos pueblos'],
      ['diciembre', 'Mercadillos navideños y Nochevieja con las doce uvas']], 'compact'),
    ('h3', 'Deporte'),
    ('p', 'Golf (La Marquesa, La Finca, Las Colinas, Villamartín y más), pádel, vela, ciclismo y senderismo.'),
  ]]),
]},

{'kind': 'page', 'label': 'Parte 7 · Glosario', 'blocks': [
  ('h2', 'Glosario: los <em>términos</em> que vas a oír'),
  ('cols', [[
    ('table', ['Término', 'Qué significa'], [
      ['arras', 'señal que se paga al firmar el contrato privado de compra'], ['catastro', 'registro fiscal de inmuebles (superficie, valor catastral)'], ['cédula de habitabilidad', 'documento que acredita que la vivienda es habitable'],
      ['comunidad de propietarios', 'conjunto de propietarios de un edificio o residencial'], ['escritura', 'documento de compraventa firmado ante notario'], ['gestoría', 'oficina que tramita papeles e impuestos'],
      ['hipoteca', 'préstamo con la vivienda como garantía'], ['IBI', 'impuesto municipal anual sobre la vivienda'], ['ITP', 'impuesto de compra en segunda mano'], ['IVA', 'impuesto de compra en obra nueva'],
      ['AJD', 'impuesto sobre la escritura en obra nueva'], ['nota simple', 'resumen del Registro: titular y cargas'], ['NIE', 'número de identidad de extranjero'],
    ], 'compact'),
  ], [
    ('table', ['Término', 'Qué significa'], [
      ['notaría', 'despacho del notario, donde se firma'], ['padrón', 'inscripción como vecino en el ayuntamiento'], ['plusvalía', 'impuesto municipal que paga el vendedor'],
      ['poder', 'autorización notarial para actuar en tu nombre'], ['Registro de la Propiedad', 'registro oficial de titulares y cargas'], ['residencia', 'registro como residente extranjero'], ['solárium', 'terraza en la azotea'],
      ['tasación', 'valoración oficial para el banco'], ['urbanización', 'zona residencial fuera del casco urbano'], ['huerta', 'tierra de regadío junto al río'], ['llave en mano', 'lista para entrar a vivir'],
      ['obra nueva', 'vivienda a estrenar, de promotora'], ['segunda mano', 'vivienda que ya ha tenido dueño'],
    ], 'compact'),
  ]]),
  ('html', '<div class="panel lemon" style="margin-top:3mm"><b>¡Bon dia!</b> En la Vega Baja también verás valenciano: <i>ajuntament</i> (ayuntamiento), <i>carrer</i> (calle), <i>platja</i> (playa), <i>bon dia</i> (buenos días) y <i>gràcies</i> (gracias). Un par de palabras y los vecinos te sonreirán aún más.</div>'),
]},

# ================================================================== PARA TERMINAR
{'kind': 'page', 'label': 'Nuestros servicios', 'band': 'ai-04-keys.jpg', 'band_h': 72, 'band_pos': 'center 45%', 'blocks': [
  ('h2', 'Lo que <em>hacemos</em> por ti'),
  ('lead', 'Un solo equipo desde el primer contacto hasta los meses después de las llaves, en tu idioma. Tú eliges lo que necesitas.'),
  ('cards', [
    {'icon': 'search', 't': 'Búsqueda a medida', 'x': 'Seleccionamos viviendas a tu medida, a menudo antes de que salgan online. O busca tú con tus palabras en nuestro buscador con IA.'},
    {'icon': 'shield', 't': 'Acompañamiento en la compra', 'x': 'Revisión legal, contratos, coordinación con notaría y banco, y alguien a tu lado el día de la escritura.'},
    {'icon': 'bank', 't': 'Hipoteca', 'x': 'Contacto con bancos españoles, solicitud, tasación y acompañamiento hasta la notaría.'},
    {'icon': 'doc', 't': 'NIE, banco y poder', 'x': 'Formularios, citas y, si quieres, todo resuelto a distancia con un poder.'},
    {'icon': 'euro', 't': 'Modelo 210', 'x': 'Tu declaración anual de no residente, para que no tengas que preocuparte.'},
    {'icon': 'key', 't': 'Testamento y posventa', 'x': 'Testamento español, suministros a tu nombre y una persona de contacto fija después.'},
    {'icon': 'home', 't': 'Vender', 'x': 'Valoración gratuita, fotos profesionales, dron y 3D, y cada semana un informe sobre tu vivienda.'},
    {'icon': 'people', 't': 'Red de contactos', 'x': 'Profesionales, administradores, asesores fiscales y abogados de confianza que conocemos desde hace años.'},
    {'icon': 'chat', 't': 'En tu idioma', 'x': 'Neerlandés, inglés, alemán y español. Online, nuestro asistente con IA responde sobre cada vivienda, día y noche.'},
  ], 3),
  ('cta', LINKS['contact'], 'Tarifas y condiciones bajo petición', 'Cada caso es distinto. Cuéntanos qué necesitas y recibirás una propuesta clara, sin sorpresas.'),
]},

{'kind': 'page', 'label': 'Lo que dicen los clientes', 'band': 'town-torrevieja-2.jpg', 'band_h': 44, 'band_pos': 'center 60%', 'blocks': [
  ('html', '<div style="display:flex;align-items:flex-end;gap:6mm;margin-bottom:3mm"><div><div class="kicker">Reseñas en Google</div><h2 style="margin:0">Lo que <em>dicen</em> los clientes</h2></div><div style="margin-left:auto;text-align:right"><div style="font-family:Fraunces;font-size:40pt;font-weight:700;line-height:1;color:#C63232">4,7<span style="font-size:20pt;color:#FBCC10"> ★★★★★</span></div><div class="small">media en Google, más de 45 reseñas</div></div></div>'),
  ('cols', [[
    ('quote', 'A principios de este año compramos un apartamento en España. Desde el primer momento nos acompañaron muy bien. Escucharon nuestros deseos y pensaron con nosotros. Incluso se encargan de los NIE, la notaría y los trámites bancarios. Eso quita muchísimo estrés y preocupaciones.', 'Comprador, 2026'),
    ('quote', 'Muy buena experiencia. Les he comprado una casa dos veces. Se toman su tiempo, son transparentes con los defectos o costes que no se ven y lo investigan todo a fondo.', 'Comprador'),
    ('quote', 'Nos recomendó a Rick y su equipo un familiar. La venta de nuestra villa se llevó con gran profesionalidad. Una experiencia sin complicaciones.', 'Vendedor'),
  ], [
    ('quote', 'Una inmobiliaria estupenda y de confianza, que nos ha ayudado de forma excelente en varias compras y ventas.', 'Comprador y vendedor'),
    ('quote', 'Rick y su equipo nos han ayudado de maravilla y con mucha profesionalidad. ¡Lo organizan todo! ¡Gente estupenda!', 'Comprador, 2026'),
    ('quote', 'Son muy serviciales y saben de lo que hablan. Muy recomendables. También hablan neerlandés.', 'Cliente, 2026'),
    ('qr', LINKS['reviews'], 'Lee todas las reseñas en Google'),
  ]]),
  ('small', 'Citas de reseñas de Google traducidas del neerlandés y del inglés; abreviadas donde se indica, manteniendo lo esencial. Sin nombres.'),
]},

{'kind': 'page', 'label': 'Lista', 'band': 'ai-01-cover.jpg', 'band_h': 80, 'band_pos': 'center 75%', 'blocks': [
  ('h2', '¿Listo para <em>comprar</em>?'),
  ('lead', 'Marca las casillas. Si están todas, estás preparado para decidir cuando aparezca la vivienda adecuada.'),
  ('cols', [[
    ('h3', 'Preparación'),
    ('check', ['Sé para qué compro (parte 1)', 'Mi hoja de deseos está rellena', 'Sé en qué 2-3 localidades quiero buscar',
               'Conozco mi presupuesto total, con todos los gastos de compra', 'Mi financiación está preaprobada', 'He solicitado el NIE']),
    ('h3', 'El viaje'),
    ('check', ['Soltura Real Estate conoce las fechas de mi viaje', 'Llevo pasaporte, tarjeta y justificante de ingresos', 'He visto mi primera selección de viviendas']),
  ], [
    ('h3', 'La compra'),
    ('check', ['Tengo cuenta bancaria española', 'Se ha hecho la revisión legal', 'He leído y entendido el contrato de arras',
               'Tengo apartados los gastos de compra', 'He comprobado mis planes de alquiler con la normativa', 'Tengo cita para el testamento español']),
    ('h3', 'Después'),
    ('check', ['Suministros, IBI y seguro están a mi nombre', 'Tengo resuelto el Modelo 210 o mi residencia', 'Disfruto de mi primera noche en la terraza']),
  ]]),
  ('cta', LINKS['contact'], '¿Te falta alguna casilla? Para eso estamos.', 'Pide una conversación sin compromiso en la oficina, por teléfono o por videollamada. Repasamos juntos lo que queda pendiente.'),
]},

{'kind': 'back', 'html': f'''
<div style="position:absolute;inset:0;background:url(assets/img/ai-14-beach.jpg) center top/cover"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(46,59,66,.15) 0%,rgba(46,59,66,.55) 30%,rgba(46,59,66,.97) 52%)"></div>
<div style="position:absolute;left:16mm;right:16mm;top:20mm">
  <div style="background:#fff;display:inline-block;border-radius:5mm;padding:4mm 5mm"><img src="assets/img/logo-square.png" style="height:30mm;display:block"/></div>
  <h1 style="font-family:Fraunces;font-weight:600;font-size:38pt;line-height:1.05;margin:12mm 0 4mm">Nos vemos pronto en<br>la Costa Blanca</h1>
  <p style="font-size:12pt;max-width:150mm;opacity:.92">¿Te han surgido preguntas? Llámanos, escríbenos por WhatsApp o pásate por la oficina. Te asesoramos sin compromiso y en tu idioma.</p>
</div>
<div style="position:absolute;left:16mm;right:16mm;top:132mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm">
  <div style="font-size:10.5pt;line-height:1.7">
    <div style="color:#FBCC10;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:8pt;margin-bottom:2mm">Soltura Real Estate</div>
    Avda. de la Constitución s/n<br>03179 Formentera del Segura (Alicante)<br><br>
    <b>T</b> +34 966 792 113<br><b>WhatsApp</b> +34 664 414 515<br><b>E</b> info@gruposoltura.com<br><br>
    <b>Oficina</b> lun-vie 10:00-14:00 · sáb-dom con cita
  </div>
  <div>
    <div class="qrrow" style="grid-template-columns:1fr 1fr;color:#2E3B42">
      <a class="qrbox v" href="{LINKS['home']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['home'])}</div><div class="qrl"><b>Nuestras viviendas</b></div></a>
      <a class="qrbox v" href="{LINKS['contact']}" style="background:#fff"><div class="qrc">{__import__('build').qr_svg(LINKS['contact'])}</div><div class="qrl"><b>Contacto</b></div></a>
    </div>
  </div>
</div>
<div style="position:absolute;left:16mm;right:16mm;bottom:12mm;font-size:7.4pt;opacity:.75;line-height:1.5">
  Grupo Soltura SL · RAICV 5781 · API 992 Alicante · GIPE 3.473 · miembro de AIPP · gruposoltura.com<br>
  Esta guía contiene información general (a octubre de 2026) y no constituye asesoramiento jurídico, fiscal ni financiero. Su contenido no genera derechos.
  Imágenes de ambiente: en parte creadas con IA; fotos de localidades vía Wikimedia Commons con la licencia indicada.
</div>'''},
]
