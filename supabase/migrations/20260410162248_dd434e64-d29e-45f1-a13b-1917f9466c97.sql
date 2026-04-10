
-- Temporarily disable the Google indexing trigger
ALTER TABLE blog_posts DISABLE TRIGGER trigger_google_indexing;

-- ARTÍCULO 1
UPDATE blog_posts SET content = '<h2>La ola de consolidación de asesorías en España: quién está comprando y por qué</h2>

<p>El sector de asesorías en España está viviendo su mayor transformación en décadas. En los últimos 18 meses, al menos seis plataformas respaldadas por capital privado internacional han entrado a competir por adquirir despachos profesionales en todo el territorio nacional. <strong>BlackRock ha financiado a Afianza con 110 millones de euros</strong>. Waterland ha invertido en Auren. New Mountain Capital ha comprado Grant Thornton España. Ufenau Capital ha lanzado Asenza uniendo a Sagardoy y Carrillo Asesores. Artá Capital ha rebautizado Gesdocument como Adlanter y planea 30 adquisiciones. Y ETL Global, respaldada por KKR, supera ya las 140 oficinas en el país.</p>

<p>No es casualidad. Los fondos de private equity llevan años consolidando asesorías en Reino Unido (donde Azets, Xeinadin y Sumer han absorbido centenares de firmas), en los países nórdicos y en Estados Unidos (donde más de un tercio de las 750 mayores firmas CPA ya tienen respaldo de PE). España, con más de <strong>60.000 asesorías — el 93% con menos de 5 empleados</strong> — representa uno de los mercados más fragmentados de Europa. Y eso, para un fondo de inversión, es una oportunidad.</p>

<h2>¿Por qué ahora? Tres fuerzas convergen al mismo tiempo</h2>

<p><strong>Primera: la demografía.</strong> El 45% de los titulares de asesorías tiene entre 41 y 50 años, y muchos se acercan a la jubilación sin un plan de sucesión claro. Entre 2021 y 2023 cerraron más de 11.000 despachos en España, un 7% del total. Cada año hay más propietarios dispuestos a vender.</p>

<p><strong>Segunda: la tecnología.</strong> La facturación electrónica obligatoria (Ley Crea y Crece), TicketBAI en el País Vasco, y la irrupción de herramientas de IA están forzando inversiones que una asesoría de 3-5 personas no puede asumir sola. El 66% de los despachos españoles todavía no dispone de plataformas telemáticas para compartir datos con sus clientes.</p>

<p><strong>Tercera: el arbitraje de múltiplos.</strong> Los fondos adquieren asesorías a 3-5 veces EBITDA y construyen plataformas que, con escala, se valoran a 8-12 veces. En el caso más extremo — Citrin Cooperman en EE.UU. — una firma pasó de 11x a 15x EBITDA en tres años, generando una rentabilidad del 4x para el inversor.</p>

<h2>¿Qué significa esto para el dueño de una asesoría?</h2>

<p>Que por primera vez hay compradores serios con capital disponible. Pero también que la ventana tiene fecha de caducidad: a medida que los consolidadores vayan cerrando territorios y segmentos, las condiciones para los vendedores que lleguen tarde serán peores.</p>

<h2>¿Y para el que quiere crecer?</h2>

<p>Que es el momento de definir si quieres ser comprador o ser comprado. Las plataformas que se construyan ahora — con la tecnología, el equipo y la estrategia adecuados — serán las que capturen el valor de esta consolidación.</p>

<p>En Capittal trabajamos con ambos perfiles. Si quieres entender cuánto vale tu asesoría en el contexto actual, empieza por aquí:</p>

<p><strong><a href="/lp/calculadora-asesorias">→ Calcula el valor de tu asesoría con nuestra herramienta gratuita</a></strong></p>'
WHERE slug = 'consolidacion-asesorias-espana-2026';

-- ARTÍCULO 2
UPDATE blog_posts SET content = '<h2>¿Cuánto vale tu asesoría? Los múltiplos reales en 2026</h2>

<p>Es la pregunta que más nos hacen los propietarios de asesorías. Y la respuesta corta es: depende. Pero hoy hay más datos que nunca para dar una respuesta informada.</p>

<h2>Las tres métricas que determinan el precio</h2>

<p>En la compraventa de asesorías en España se usan tres métricas principales de valoración, dependiendo del tamaño y formato de la operación:</p>

<p><strong>Múltiplo sobre ingresos recurrentes.</strong> Es la métrica más común para carteras de clientes y asesorías pequeñas. El rango habitual es de <strong>0,7x a 1,5x</strong> los ingresos anuales recurrentes. Una cartera de clientes pura (sin equipo, sin oficina, solo contratos) se mueve en la parte baja. Una asesoría con equipo estable, buena retención y servicios diversificados se acerca a la parte alta.</p>

<p><strong>Múltiplo sobre EBITDA.</strong> Es la referencia estándar para operaciones más estructuradas. En España, las asesorías cambian de manos a <strong>3-5x EBITDA</strong> en operaciones entre particulares o con consolidadores locales. Las plataformas más grandes, con múltiples oficinas y servicios integrados, aspiran a valoraciones de <strong>6-8x</strong>. En el mercado más maduro de EE.UU. y UK, las plataformas PE-backed se valoran a <strong>10-15x EBITDA</strong>.</p>

<p><strong>Múltiplo sobre SDE (beneficio del propietario).</strong> Relevante para asesorías donde el dueño cobra un salario significativo que hay que sumar al beneficio operativo. Los rangos están en <strong>1,8-3,3x SDE</strong>.</p>

<h2>¿Qué sube y qué baja el precio?</h2>

<p>Los factores que más mueven la aguja son:</p>

<p><strong>La retención de clientes.</strong> Una cartera con retención superior al 92% vale sustancialmente más. Los compradores descuentan agresivamente el riesgo de pérdida de clientes tras la transición.</p>

<p><strong>El mix de servicios.</strong> Las asesorías que solo hacen cumplimiento fiscal básico (modelos trimestrales, renta) cotizan en la parte baja del rango. Las que combinan fiscal, laboral, legal y consultoría — el modelo multidisciplinar — valen más. Y las que tienen componente de advisory (valoraciones, operaciones corporativas, planificación patrimonial) están en la parte alta.</p>

<p><strong>La dependencia del fundador.</strong> Si toda la relación con los clientes pasa por ti, el comprador necesita un periodo de transición largo y descuenta el riesgo de que se vayan cuando tú te vayas. A menor dependencia, mayor precio.</p>

<p><strong>La concentración de cartera.</strong> Si tus 10 mayores clientes suponen más del 35% de la facturación, hay un riesgo concentración que penaliza.</p>

<p><strong>La digitalización.</strong> Una asesoría que trabaja con herramientas cloud, que tiene los procesos documentados, y que puede integrarse rápidamente en los sistemas de un comprador, vale más que una que opera con hojas de cálculo y papel.</p>

<h2>Lo que ha cambiado en 2025-2026</h2>

<p>La entrada de los fondos internacionales ha cambiado el panorama de dos formas. Primero, ha elevado los precios en la parte alta del mercado: Afianza, Adlanter, ETL Global y los demás compiten entre sí por las mejores firmas, y eso favorece al vendedor bien posicionado. Segundo, ha creado una demanda real y constante: antes había que buscar un comprador; ahora hay seis plataformas activamente buscando targets.</p>

<p>Pero ojo: los múltiplos que pagan los fondos son para firmas que cumplen ciertos criterios mínimos. Si tu asesoría factura menos de 500.000 euros, con alta dependencia del fundador y sin equipo profesionalizado, el mercado te ofrece menos opciones.</p>

<h2>Haz tus propios números</h2>

<p>Hemos desarrollado una calculadora que te permite estimar el valor de tu asesoría en función de tu facturación, EBITDA, mix de servicios y otros factores clave. Es orientativa, pero te dará un punto de partida realista antes de hablar con asesores o compradores.</p>

<p><strong><a href="/lp/calculadora-asesorias">→ Calcula el valor de tu asesoría</a></strong></p>

<p>Si los números te resultan interesantes — o si quieres entender tus opciones — hablemos. En Capittal asesoramos tanto a vendedores como a compradores en operaciones del sector de servicios profesionales.</p>'
WHERE slug = 'cuanto-vale-asesoria-multiplos-2026';

-- ARTÍCULO 3
UPDATE blog_posts SET content = '<h2>Vender tu asesoría: guía para preparar la operación y maximizar el precio</h2>

<p>Si llevas años al frente de tu asesoría y estás empezando a pensar en la sucesión — o simplemente en capitalizar lo que has construido — este artículo es para ti. No es un proceso que se improvise: la diferencia entre una venta bien ejecutada y una mal preparada puede suponer un <strong>30-50% en el precio final</strong>.</p>

<h2>Paso 1: Entiende tu posición antes de salir al mercado</h2>

<p>Antes de hablar con compradores, necesitas una valoración realista. No la que tú crees que vale tu asesoría, sino la que el mercado pagaría hoy. Esto requiere analizar tu facturación recurrente, márgenes, retención de clientes, dependencia del fundador, equipo, y grado de digitalización.</p>

<p>Los vendedores que llegan mejor posicionados son los que han hecho este ejercicio con antelación, idealmente <strong>12-18 meses antes de la venta</strong>. Si esperas a tener prisa por vender — por edad, salud o cansancio — negociarás desde una posición débil.</p>

<p><strong><a href="/lp/calculadora-asesorias">→ Empieza por valorar tu asesoría con nuestra calculadora</a></strong></p>

<h2>Paso 2: Prepara la asesoría para la venta</h2>

<p>Los compradores profesionales — especialmente los fondos y las plataformas de consolidación — hacen una due diligence exhaustiva. Estos son los puntos que más miran y donde más vendedores fallan:</p>

<p><strong>Contratos con clientes.</strong> ¿Tienes contratos formales o son relaciones verbales? Las carteras con contratos escritos, con cláusulas de renovación automática y con tarifas documentadas se valoran significativamente mejor. Si no los tienes, empieza a formalizarlos ahora.</p>

<p><strong>Cuentas limpias.</strong> Tus propias cuentas deben ser impecables. Parece obvio para una asesoría, pero es sorprendente la cantidad de despachos cuya contabilidad interna es mejorable. Tres años de P&amp;L auditables, con gastos personales segregados, son el mínimo.</p>

<p><strong>Equipo.</strong> El comprador compra el negocio, no solo la cartera. Si tu equipo es estable, competente y con contratos regularizados, sube el valor. Si tienes rotación alta o todo depende de ti, baja.</p>

<p><strong>Tecnología.</strong> Si ya trabajas con A3, Sage Despachos, Holded u otras plataformas cloud, la integración post-venta será más sencilla y el comprador pagará más. Si todavía operas con sistemas legacy, el coste de migración lo descontará del precio.</p>

<p><strong>Concentración de cartera.</strong> Si tu top-10 de clientes representa más del 35% de tus ingresos, diversifica antes de vender.</p>

<h2>Paso 3: Elige la estructura adecuada</h2>

<p>No todas las ventas son iguales. Las opciones principales son:</p>

<p><strong>Venta total (100%).</strong> Vendes, cobras, te vas (tras un periodo de transición). Es la opción más limpia. El comprador paga la totalidad, normalmente con un 60-80% al cierre y un 20-40% como earn-out vinculado a retención de clientes durante 12-24 meses.</p>

<p><strong>Venta parcial con permanencia.</strong> Vendes una mayoría (60-80%) pero te quedas como socio minoritario y continúas en la gestión durante 2-3 años. Es habitual cuando el comprador es un fondo que quiere la continuidad. Puedes beneficiarte de la segunda venta (el "segundo cheque") cuando el fondo venda la plataforma.</p>

<p><strong>Integración en red/plataforma.</strong> No vendes directamente, sino que tu asesoría se integra en una red (ETL Global, Afianza) manteniendo cierta operatividad local pero bajo marca y sistemas del grupo. La compensación puede ser en efectivo, en equity de la plataforma, o una combinación.</p>

<h2>Paso 4: No vendas solo — busca un asesor</h2>

<p>Este es el punto donde más valor aportamos como boutique de M&amp;A. Un asesor especializado hace tres cosas que tú no puedes hacer solo: crea competencia entre compradores (si solo hablas con uno, estás en desventaja), gestiona la negociación sin que la relación personal se deteriore, y estructura la operación para maximizar tu precio neto fiscal.</p>

<p>En el mercado actual, con seis plataformas compitiendo activamente, tener a tres o cuatro en la mesa de negociación puede marcar una diferencia de <strong>1-2x EBITDA</strong> en el precio final.</p>

<h2>Paso 5: Fiscalidad de la venta</h2>

<p>La planificación fiscal de la salida es tan importante como el precio bruto. Exención por reinversión, reducción por transmisión de empresa familiar, tributación como ganancia patrimonial vs. rendimiento, el rol de una sociedad holding... cada caso es distinto y debe planificarse con antelación. NRRO, nuestra firma de Tax &amp; Legal, trabaja conjuntamente con Capittal en la estructuración fiscal de estas operaciones.</p>

<h2>El momento es ahora</h2>

<p>Con 11.000 asesorías cerradas en tres años, una generación de propietarios acercándose a la jubilación, y seis plataformas PE-backed compitiendo por targets, la ventana de máxima demanda está abierta. Pero no durará indefinidamente: a medida que las plataformas completen su cobertura territorial, la presión compradora se moderará.</p>

<p>Si estás pensando en explorar opciones, el primer paso es conocer tu punto de partida.</p>

<p><strong><a href="/lp/calculadora-asesorias">→ Calcula el valor de tu asesoría</a></strong></p>'
WHERE slug = 'vender-asesoria-guia-maximizar-precio';

-- ARTÍCULO 4
UPDATE blog_posts SET content = '<h2>Crecer comprando: cómo construir una plataforma de asesorías en España</h2>

<p>Si diriges una asesoría de cierto tamaño y llevas tiempo pensando en crecer — incorporar nuevos servicios, abrir en nuevas ciudades, ganar masa crítica — la consolidación del sector te ofrece una oportunidad que no existía hace cinco años.</p>

<h2>El modelo que funciona en el mundo</h2>

<p>El "buy-and-build" en servicios profesionales es una de las estrategias de creación de valor más probadas en private equity a nivel global. La lógica es sencilla:</p>

<p>Adquieres una plataforma base — tu propia asesoría — con escala suficiente para tener equipo de gestión, tecnología y procesos. Después, ejecutas adquisiciones de firmas más pequeñas (bolt-ons) a múltiplos de <strong>3-5x EBITDA</strong>. Les integras en tu tecnología, les ofreces servicios cruzados (cross-selling de laboral a clientes fiscales y viceversa), eliminas duplicidades operativas, y el resultado es una plataforma que vale <strong>8-12x EBITDA</strong> — entre dos y tres veces lo que pagaste por las partes.</p>

<p>En España, este playbook lo están ejecutando simultáneamente <strong>Afianza</strong> (59 integraciones, €50M de facturación, financiación de €110M de BlackRock), <strong>Adlanter</strong> (5 add-ons, plan de 30 adquisiciones para llegar a €100M) y <strong>Asenza</strong> (unión de Sagardoy + Carrillo bajo capital de Ufenau). ETL Global lleva años haciéndolo con más de 140 oficinas. Baker Tilly y Grant Thornton lo hacen desde redes internacionales.</p>

<h2>Los tres modelos de consolidación</h2>

<p><strong>Integración total (modelo Afianza).</strong> Marca única, sistemas únicos, equipo integrado. Máxima sinergias pero más difícil de ejecutar. Requiere inversión en tecnología y un equipo de integración dedicado. El resultado es una firma verdaderamente unificada.</p>

<p><strong>Red federada (modelo ETL Global).</strong> Las firmas integradas mantienen cierta autonomía e incluso su nombre local, pero comparten servicios centrales, tecnología, conocimiento y marca paraguas. Más fácil de escalar rápidamente, menos sinergias pero menor riesgo cultural.</p>

<p><strong>Plataforma holding (modelo Asenza/Ufenau).</strong> Las firmas son propiedad de un vehículo común pero operan de forma relativamente autónoma, conectadas por capital compartido y objetivos comunes. Los socios fundadores mantienen participación significativa. Equilibrio entre autonomía y escala.</p>

<h2>Lo que necesitas para empezar</h2>

<p>Si quieres posicionarte como comprador en este mercado, necesitas cuatro cosas:</p>

<p><strong>Escala mínima.</strong> Para ser una plataforma creíble ante inversores y targets, necesitas al menos <strong>€3-5M de facturación</strong> y un equipo que pueda funcionar sin que tú hagas todo. Si facturas menos, tu primera prioridad es crecer orgánicamente o buscar una primera fusión con un igual.</p>

<p><strong>Capital.</strong> Las adquisiciones requieren financiación. Las opciones van desde deuda bancaria (CaixaBank ha financiado a Afianza), deuda privada (Oquendo Capital, BlackRock), equity de un fondo de PE (Artá, Ufenau, Waterland) o reinversión de beneficios propios. El modelo típico es <strong>50-60% deuda + 40-50% equity</strong>.</p>

<p><strong>Tesis de inversión clara.</strong> ¿Compras por territorio (consolidar una región)? ¿Por servicio (añadir laboral a tu base fiscal)? ¿Por segmento de cliente (especializarte en pymes industriales, startups, profesionales sanitarios)? Las plataformas que funcionan tienen una tesis definida, no compran oportunistamente.</p>

<p><strong>Equipo de integración.</strong> El mayor riesgo de un buy-and-build no es comprar mal — es integrar mal. Necesitas un COO o director de operaciones que lidere la integración de sistemas, personas y procesos. Afianza fichó a Guillermo Pérez-Montero específicamente para esto. Adlanter nombró CEO a José Luis Rivas. No es un detalle: es el factor que diferencia las plataformas que crean valor de las que destruyen.</p>

<h2>El papel de un asesor de M&amp;A</h2>

<p>En el lado comprador, un asesor especializado aporta acceso a deal flow (asesorías en venta que no se publican), valoración objetiva de targets, estructuración de la operación, y coordinación de la due diligence. Para un comprador en serie, tener un pipeline constante de oportunidades cualificadas es más valioso que cualquier operación individual.</p>

<p>En Capittal asesoramos a compradores estratégicos y a fondos de inversión en la construcción de plataformas de servicios profesionales. Conocemos el mercado de asesorías español en profundidad, tenemos relaciones con propietarios que están considerando opciones, y sabemos lo que funciona — y lo que no — en la integración post-adquisición.</p>

<h2>Empieza por entender el valor de lo que hay en el mercado</h2>

<p>Nuestra calculadora de valoración de asesorías te da una primera aproximación al valor de los targets que podrías adquirir. Es el mismo marco que usamos con nuestros clientes compradores para filtrar oportunidades.</p>

<p><strong><a href="/lp/calculadora-asesorias">→ Accede a la calculadora de valoración de asesorías</a></strong></p>

<p>Si tienes una asesoría con ambición de escala y quieres explorar cómo crecer mediante adquisiciones, hablemos. Podemos ayudarte a definir la estrategia, identificar targets, y ejecutar las operaciones.</p>

<p><strong>Capittal Transacciones — M&amp;A · Consulting</strong><br/>samuel@capittal.es | <a href="https://capittal.es">www.capittal.es</a></p>'
WHERE slug = 'crecer-comprando-plataforma-asesorias';

-- Re-enable the Google indexing trigger
ALTER TABLE blog_posts ENABLE TRIGGER trigger_google_indexing;
