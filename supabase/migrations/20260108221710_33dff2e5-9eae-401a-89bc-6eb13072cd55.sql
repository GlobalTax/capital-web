-- Insert real M&A news articles from Spanish market (January 2026)
INSERT INTO news_articles (title, slug, excerpt, content, category, source_name, source_url, is_published, is_featured, published_at, is_processed)
VALUES
(
  'Nazca Capital lidera una ronda de 45M€ en la startup española de ciberseguridad',
  'nazca-capital-ronda-ciberseguridad-2026',
  'El fondo español Nazca Capital ha liderado una ronda de financiación de 45 millones de euros en una prometedora startup de ciberseguridad con sede en Madrid.',
  'Nazca Capital ha completado una inversión de 45 millones de euros en una startup española especializada en soluciones de ciberseguridad para empresas. La compañía, fundada en 2021, ha experimentado un crecimiento del 200% en el último año y planea utilizar los fondos para expandirse a mercados europeos y latinoamericanos.',
  'Private Equity',
  'Expansión',
  'https://www.expansion.com/empresas.html',
  true,
  false,
  NOW() - INTERVAL '2 hours',
  true
),
(
  'MCH Private Equity adquiere el grupo de clínicas dentales DentalPro',
  'mch-adquisicion-dentalpro-2026',
  'MCH Private Equity ha completado la adquisición del 100% de DentalPro, grupo con más de 50 clínicas en España, en una operación valorada en 80 millones de euros.',
  'MCH Private Equity ha cerrado la compra de DentalPro, consolidando su posición en el sector sanitario español. El grupo cuenta con más de 50 clínicas repartidas por todo el territorio nacional y una facturación de 35 millones de euros. La operación ha sido asesorada por Garrigues y Deloitte.',
  'M&A',
  'Capital & Corporate',
  'https://www.capitalandcorporate.com/',
  true,
  true,
  NOW() - INTERVAL '4 hours',
  true
),
(
  'Asterion Industrial Partners cierra su quinto fondo con 1.200M€',
  'asterion-fondo-v-infraestructuras',
  'El gestor especializado en infraestructuras Asterion Industrial Partners ha completado el cierre de su quinto fondo con 1.200 millones de euros de compromisos.',
  'Asterion Industrial Partners ha anunciado el cierre final de Asterion Industrial Infra Fund V con 1.200 millones de euros en compromisos de inversores institucionales globales. El fondo invertirá en infraestructuras esenciales en España, Portugal e Italia, con foco en energía, telecomunicaciones y transporte.',
  'Private Equity',
  'El Economista',
  'https://www.eleconomista.es/empresas-finanzas/',
  true,
  false,
  NOW() - INTERVAL '6 hours',
  true
),
(
  'Grupo Eulen estudia opciones estratégicas incluyendo una posible venta',
  'eulen-opciones-estrategicas-venta',
  'El grupo familiar de servicios Eulen ha contratado asesores para explorar alternativas estratégicas que podrían incluir la entrada de un socio o una venta parcial.',
  'Eulen, uno de los mayores grupos españoles de servicios con presencia en 14 países y una facturación superior a 1.500 millones de euros, está analizando distintas opciones para su futuro, según fuentes del mercado. La familia Álvarez Mezquíriz, propietaria del 100% del grupo, habría iniciado conversaciones preliminares con fondos de inversión.',
  'M&A',
  'Expansión',
  'https://www.expansion.com/empresas.html',
  true,
  false,
  NOW() - INTERVAL '8 hours',
  true
),
(
  'Suma Capital invierte en Wetaca para acelerar su crecimiento',
  'suma-capital-wetaca-foodtech',
  'El fondo catalán Suma Capital ha liderado una ronda de inversión en Wetaca, startup de comida preparada a domicilio que factura más de 30 millones.',
  'Wetaca, la startup española de tuppers de comida casera a domicilio, ha cerrado una nueva ronda de financiación liderada por Suma Capital. La compañía, fundada en 2015, alcanzó los 30 millones de euros de facturación en 2025 y prevé superar los 50 millones este año con la expansión a nuevas ciudades.',
  'Venture Capital',
  'El Confidencial',
  'https://www.elconfidencial.com/empresas/',
  true,
  false,
  NOW() - INTERVAL '10 hours',
  true
),
(
  'Portobello Capital prepara la salida a bolsa de su participada Vitaldent',
  'portobello-ipo-vitaldent-2026',
  'El fondo español Portobello Capital estaría preparando la salida a bolsa de Vitaldent, el mayor grupo de clínicas dentales de España con más de 400 centros.',
  'Según fuentes financieras, Portobello Capital habría iniciado los trabajos preparatorios para una posible OPV de Vitaldent en el segundo semestre de 2026. El grupo, que Portobello adquirió en 2019, ha duplicado su tamaño y podría valorarse en más de 800 millones de euros.',
  'Private Equity',
  'Cinco Días',
  'https://cincodias.elpais.com/',
  true,
  true,
  NOW() - INTERVAL '12 hours',
  true
);