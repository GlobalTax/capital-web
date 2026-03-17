
-- Disable trigger to prevent indexing errors during insert
ALTER TABLE blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO blog_posts (
  slug, title, content, excerpt, featured_image_url,
  author_name, author_avatar_url, category, tags, reading_time,
  is_published, is_featured, meta_title, meta_description,
  published_at, faq_data
) VALUES (
  'holding-empresarial',
  'Holding empresarial: qué es, tipos, ventajas y cómo funciona [2026]',
  '<!-- ARTICLE: Holding empresarial -->
<p class="text-lg leading-relaxed mb-8">Una <strong>holding empresarial</strong> es una sociedad mercantil cuyo objeto principal es la tenencia, gestión y administración de participaciones en el capital de otras sociedades. No desarrolla una actividad productiva propia, sino que ejerce el control y la dirección estratégica de las empresas participadas, centralizando la gestión patrimonial, financiera y fiscal del grupo.</p>

<blockquote class="border-l-4 border-primary pl-6 py-4 my-8 bg-muted/30 rounded-r-lg">
<p class="italic text-lg">"La holding no es un truco fiscal ni una estructura agresiva. Es un instrumento jurídico previsto por la ley que permite organizar un grupo empresarial de forma eficiente. Lo importante es que se constituya con sustancia económica real y motivos económicos válidos, no como una mera pantalla para diferir impuestos."</p>
<footer class="mt-3 text-sm font-semibold">— Samuel Navarro, fundador de Capittal Transacciones</footer>
</blockquote>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">1.500</p>
<p class="text-sm text-muted-foreground">Búsquedas mensuales en España para «holding empresarial» (Ahrefs, marzo 2026). Es uno de los conceptos jurídico-fiscales más buscados en el ámbito mercantil español.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Tipos de holding empresarial</h2>
<p class="mb-4">Existen varios tipos de holding en función de su finalidad y estructura:</p>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Tipo</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Descripción</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Uso típico</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Holding pura</td><td class="border border-border px-4 py-3">Solo posee participaciones, sin actividad operativa</td><td class="border border-border px-4 py-3">Grupos empresariales, familias con múltiples negocios</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Holding mixta</td><td class="border border-border px-4 py-3">Posee participaciones y también desarrolla actividad propia</td><td class="border border-border px-4 py-3">Empresa matriz que opera y a la vez controla filiales</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Holding familiar</td><td class="border border-border px-4 py-3">Propiedad de una familia empresaria, centraliza patrimonio</td><td class="border border-border px-4 py-3">Planificación sucesoria, protección patrimonial</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Holding de inversión</td><td class="border border-border px-4 py-3">Vehículo para gestionar inversiones diversificadas</td><td class="border border-border px-4 py-3">Family offices, inversores profesionales</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Holding pre-venta</td><td class="border border-border px-4 py-3">Constituida antes de la venta de una empresa</td><td class="border border-border px-4 py-3">Optimización fiscal en operaciones M&A</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Ventajas de la holding empresarial</h2>

<h3 class="text-xl font-semibold mt-8 mb-4">1. Eficiencia fiscal: exención del artículo 21 LIS</h3>
<p class="mb-4">La ventaja fiscal principal de una holding es la <strong>exención sobre dividendos y plusvalías</strong> prevista en el <a href="/blog/articulo-21-lis-exencion-participaciones" class="text-primary hover:underline font-medium">artículo 21 de la Ley 27/2014 del Impuesto sobre Sociedades (LIS)</a>. Si la holding posee al menos un 5% del capital de la filial durante un mínimo de 1 año, los dividendos y las plusvalías por la transmisión de esas participaciones quedan exentos en un 95% (desde la reforma de la Ley 11/2020, que eliminó la exención total e introdujo un gravamen efectivo del 1,25% sobre el 5% no exento al tipo del 25%).</p>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">95%</p>
<p class="text-sm text-muted-foreground">Porcentaje de exención sobre dividendos y plusvalías de participaciones cualificadas conforme al artículo 21 LIS. El tipo efectivo resultante es del 1,25% frente al 19-30% del IRPF.</p>
</div>

<h3 class="text-xl font-semibold mt-8 mb-4">2. Protección patrimonial</h3>
<p class="mb-4">La holding separa el patrimonio empresarial del patrimonio personal del empresario. En caso de insolvencia de una filial operativa, los activos de la holding (participaciones en otras filiales, inmuebles, tesorería) quedan protegidos por el principio de personalidad jurídica independiente.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">3. Centralización de la gestión</h3>
<p class="mb-4">La holding permite centralizar servicios como: tesorería del grupo (<em>cash pooling</em>), facturación intercompany, política de recursos humanos, contabilidad y administración, y negociación con entidades financieras con mayor poder de negociación.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">4. Planificación sucesoria</h3>
<p class="mb-4">En empresas familiares, la holding facilita la planificación de la sucesión: permite repartir participaciones entre herederos sin fragmentar las sociedades operativas, y posibilita protocolos familiares con cláusulas de arrastre (<em>drag-along</em>) y acompañamiento (<em>tag-along</em>).</p>

<h3 class="text-xl font-semibold mt-8 mb-4">5. Neutralidad fiscal en reorganizaciones</h3>
<p class="mb-4">Las aportaciones de participaciones a una holding se pueden realizar al amparo del <a href="/blog/regimen-feac" class="text-primary hover:underline font-medium">régimen de neutralidad fiscal FEAC</a> (artículos 76 a 89 LIS), sin tributación en el momento de la aportación. Esto permite reorganizar la estructura societaria sin coste fiscal inmediato.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Esquema de funcionamiento de una holding</h2>
<p class="mb-4">El esquema básico de una holding empresarial es el siguiente:</p>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Nivel</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Entidad</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Función</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3">1. Persona física</td><td class="border border-border px-4 py-3 font-medium">Empresario / Familia</td><td class="border border-border px-4 py-3">Socio de la holding</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3">2. Sociedad holding (S.L.)</td><td class="border border-border px-4 py-3 font-medium">Holding del grupo</td><td class="border border-border px-4 py-3">Posee participaciones, centraliza gestión</td></tr>
<tr><td class="border border-border px-4 py-3">3a. Filial operativa A</td><td class="border border-border px-4 py-3 font-medium">Empresa A (actividad industrial)</td><td class="border border-border px-4 py-3">Genera ingresos operativos</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3">3b. Filial operativa B</td><td class="border border-border px-4 py-3 font-medium">Empresa B (actividad comercial)</td><td class="border border-border px-4 py-3">Genera ingresos operativos</td></tr>
<tr><td class="border border-border px-4 py-3">3c. Sociedad patrimonial</td><td class="border border-border px-4 py-3 font-medium">Inmuebles del grupo</td><td class="border border-border px-4 py-3">Gestiona activos inmobiliarios</td></tr>
</tbody>
</table>
</div>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6 space-y-3">
<p><strong>Flujo de dividendos:</strong> Las filiales distribuyen dividendos a la holding, que están exentos al 95% (art. 21 LIS). La holding reinvierte, distribuye a los socios personas físicas (tributación en IRPF al 19-28%) o retiene como reservas.</p>
<p><strong>Flujo en caso de venta:</strong> La holding <a href="/blog/vender-mi-empresa" class="text-primary hover:underline font-medium">vende las participaciones de una filial</a>. La plusvalía queda exenta al 95% (art. 21 LIS). Los fondos quedan en la holding para reinvertir o distribuir.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Requisitos legales para que funcione la exención</h2>
<p class="mb-4">Para que la holding pueda aplicar la exención del artículo 21 LIS, deben cumplirse estos requisitos:</p>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Requisito</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Detalle</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Base legal</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Participación mínima</td><td class="border border-border px-4 py-3">5% del capital de la filial (o 20M EUR de valor de adquisición)</td><td class="border border-border px-4 py-3">Art. 21.1.a) LIS</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Periodo de tenencia</td><td class="border border-border px-4 py-3">Al menos 1 año (se puede completar después del devengo)</td><td class="border border-border px-4 py-3">Art. 21.1.a) LIS</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Actividad económica filial</td><td class="border border-border px-4 py-3">La filial debe realizar actividad económica (no ser patrimonial >50% activos)</td><td class="border border-border px-4 py-3">Art. 21.1.b) LIS</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Tributación mínima filial</td><td class="border border-border px-4 py-3">La filial tributa IS o impuesto análogo al 10% mínimo (presunción si residente en España)</td><td class="border border-border px-4 py-3">Art. 21.1.b) LIS</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Riesgos y limitaciones</h2>

<h3 class="text-xl font-semibold mt-8 mb-4">1. Cláusula anti-abuso (art. 89.2 LIS)</h3>
<p class="mb-4">Si la constitución de la holding no tiene <strong>motivos económicos válidos</strong> más allá de la ventaja fiscal, la AEAT puede inaplicar total o parcialmente el <a href="/blog/regimen-feac" class="text-primary hover:underline font-medium">régimen FEAC</a>. Las resoluciones del TEAC de 2024 (RG 06448/2022 y ss.) han precisado que la inaplicación debe ser proporcional y progresiva.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">2. Inspección de la AEAT</h3>
<p class="mb-4">Las holdings constituidas poco antes de una venta (menos de 24 meses) son un <em>red flag</em> prioritario para la AEAT. Es fundamental acreditar sustancia económica: domicilio propio, actividad real, empleados, decisiones documentadas.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">3. No es una exención total</h3>
<p class="mb-4">Desde 2021, la exención es del 95%, no del 100%. El tipo efectivo es del 1,25% sobre la plusvalía, que aunque bajo, no es cero.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">4. Costes de estructura</h3>
<p class="mb-4">Mantener una holding implica costes: contabilidad, impuesto de sociedades, cuentas anuales, administración. Para patrimonios pequeños, puede no ser rentable.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Preguntas frecuentes sobre holding empresarial</h2>

<div class="space-y-4 my-6">
<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué es una holding empresarial?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Una holding empresarial es una sociedad mercantil (típicamente una S.L.) cuyo objeto principal es poseer participaciones en otras sociedades, ejercer la dirección estratégica del grupo y centralizar la gestión patrimonial y fiscal. No desarrolla una actividad productiva directa, sino que controla y coordina las empresas del grupo.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Cuáles son las ventajas de crear una holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Las principales ventajas son: (1) eficiencia fiscal, con exención del 95% sobre dividendos y plusvalías de participaciones cualificadas (art. 21 LIS); (2) protección patrimonial, separando activos operativos de patrimoniales; (3) centralización de la gestión del grupo; (4) planificación sucesoria en empresas familiares; y (5) neutralidad fiscal en reorganizaciones societarias bajo el régimen FEAC.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Cuánto cuesta crear una holding en España?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">El coste de constitución de una S.L. holding es de aproximadamente 600-1.500 € (notaría + registro), con un capital social mínimo de 1 € (desde la reforma de la Ley de Sociedades de Capital). Sin embargo, si la holding se constituye mediante aportación no dineraria de participaciones, los costes incluyen valoración (3.000-10.000 €), asesoría fiscal y legal (5.000-15.000 €), y costes registrales y notariales (2.000-5.000 €).</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué riesgos tiene una holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">El principal riesgo es que la AEAT considere que la holding carece de motivos económicos válidos y aplique la cláusula anti-abuso del artículo 89.2 LIS, inaplicando el régimen de neutralidad fiscal. Otros riesgos: costes de mantenimiento de la estructura, mayor complejidad administrativa, y posible regularización fiscal si no se cumplen los requisitos del artículo 21 LIS (participación mínima del 5%, tenencia de 1 año, actividad económica de la filial).</div>
</details>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Fuentes y referencias</h2>
<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
<li>Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades, arts. 21, 76-89.</li>
<li>Real Decreto Legislativo 1/2010, Ley de Sociedades de Capital.</li>
<li>TEAC, Resoluciones RG 06448/2022, 06452/2022, 06513/2022, 06550/2022 (abril-mayo 2024).</li>
<li>TS, Auto de 12 de marzo de 2025, recurso 6518/2023 (ECLI:ES:TS:2025:2692A).</li>
<li>Garrigues. <em>Nota técnica: Holding de empresas y fiscalidad</em>, 2024.</li>
</ul>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-8 my-12 text-center">
<h3 class="text-xl font-bold mb-3">¿Necesitas asesoramiento sobre la constitución de una holding?</h3>
<p class="text-muted-foreground mb-6">En <strong>Capittal Transacciones</strong> y <strong>NRRO</strong> analizamos tu estructura societaria y te ayudamos a determinar si una holding es la solución adecuada para tu caso.</p>
<a href="/servicios/reestructuracion-societaria" class="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">Solicitar consulta</a>
</div>

<p class="text-sm text-muted-foreground mt-8"><em>Última actualización: marzo 2026. Planificamos revisar este artículo cuando el Tribunal Supremo resuelva las cuestiones de casación del Auto de 12 de marzo de 2025.</em></p>',
  'Una holding empresarial es una sociedad que posee participaciones en otras empresas para centralizar la gestión y optimizar la fiscalidad. Descubre los tipos, ventajas, requisitos legales y riesgos con normativa actualizada.',
  NULL,
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'Fiscal',
  ARRAY['holding empresarial','holding familiar','holding ventajas','holding fiscal','LIS','artículo 21','FEAC','estructura societaria'],
  18,
  true,
  true,
  'Holding empresarial: qué es, tipos, ventajas y cómo funciona [2026]',
  'Una holding empresarial es una sociedad que posee participaciones en otras empresas para centralizar la gestión y optimizar la fiscalidad. Descubre los tipos, ventajas, requisitos legales y riesgos. Con esquemas y normativa actualizada.',
  NOW(),
  '[{"question":"¿Qué es una holding empresarial?","answer":"Una holding empresarial es una sociedad mercantil (típicamente una S.L.) cuyo objeto principal es poseer participaciones en otras sociedades, ejercer la dirección estratégica del grupo y centralizar la gestión patrimonial y fiscal. No desarrolla una actividad productiva directa, sino que controla y coordina las empresas del grupo."},{"question":"¿Cuáles son las ventajas de crear una holding?","answer":"Las principales ventajas son: (1) eficiencia fiscal, con exención del 95% sobre dividendos y plusvalías de participaciones cualificadas (art. 21 LIS); (2) protección patrimonial, separando activos operativos de patrimoniales; (3) centralización de la gestión del grupo; (4) planificación sucesoria en empresas familiares; y (5) neutralidad fiscal en reorganizaciones societarias bajo el régimen FEAC."},{"question":"¿Cuánto cuesta crear una holding en España?","answer":"El coste de constitución de una S.L. holding es de aproximadamente 600-1.500 € (notaría + registro), con un capital social mínimo de 1 € (desde la reforma de la Ley de Sociedades de Capital). Sin embargo, si la holding se constituye mediante aportación no dineraria de participaciones, los costes incluyen valoración (3.000-10.000 €), asesoría fiscal y legal (5.000-15.000 €), y costes registrales y notariales (2.000-5.000 €)."},{"question":"¿Qué riesgos tiene una holding?","answer":"El principal riesgo es que la AEAT considere que la holding carece de motivos económicos válidos y aplique la cláusula anti-abuso del artículo 89.2 LIS, inaplicando el régimen de neutralidad fiscal. Otros riesgos: costes de mantenimiento de la estructura, mayor complejidad administrativa, y posible regularización fiscal si no se cumplen los requisitos del artículo 21 LIS (participación mínima del 5%, tenencia de 1 año, actividad económica de la filial)."}]'::jsonb
);

-- Re-enable trigger
ALTER TABLE blog_posts ENABLE TRIGGER trigger_google_indexing;
