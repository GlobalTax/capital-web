
-- Disable trigger to prevent indexing errors during insert
ALTER TABLE blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO blog_posts (
  slug, title, content, excerpt, featured_image_url,
  author_name, author_avatar_url, category, tags, reading_time,
  is_published, is_featured, meta_title, meta_description,
  published_at, faq_data
) VALUES (
  'sociedad-holding-como-crear',
  'Sociedad holding en España: cómo crearla, requisitos y pasos [2026]',
  '<!-- ARTICLE: Sociedad holding como crear -->
<p class="text-lg leading-relaxed mb-8">Una <strong>sociedad holding</strong> es una persona jurídica constituida en España cuyo objeto social es la tenencia, gestión y administración de participaciones en el capital de otras sociedades. Crear una <a href="/blog/holding-empresarial" class="text-primary hover:underline font-medium">holding</a> implica decisiones jurídicas, fiscales y estratégicas que deben planificarse con rigor para que la estructura cumpla sus objetivos y resista una eventual inspección de la AEAT.</p>

<blockquote class="border-l-4 border-primary pl-6 py-4 my-8 bg-muted/30 rounded-r-lg">
<p class="italic text-lg">"Crear una holding no es simplemente constituir una sociedad y aportar participaciones. Es un proceso que requiere planificación fiscal, sustancia económica real y motivos económicos válidos documentados. Los atajos son peligrosos: una holding mal planificada es peor que no tener holding."</p>
<footer class="mt-3 text-sm font-semibold">— Samuel Navarro, fundador de Capittal Transacciones</footer>
</blockquote>

<h2 class="text-2xl font-bold mt-12 mb-6">Paso 1: Análisis previo y decisión estratégica</h2>
<p class="mb-4">Antes de constituir la holding, es imprescindible un análisis que responda:</p>
<ul class="list-disc pl-6 space-y-3 mb-6">
<li><strong>¿Para qué necesitas la holding?</strong> Planificación sucesoria, centralización de grupo, preparación para <a href="/blog/vender-mi-empresa" class="text-primary hover:underline font-medium">venta de empresa</a>, protección patrimonial, o combinación de varias.</li>
<li><strong>¿Es el momento adecuado?</strong> Si el motivo es una venta de empresa, la AEAT aplica un horizonte de referencia de 24 meses entre la constitución de la holding y la venta. Constituirla semanas antes es un <em>red flag</em>.</li>
<li><strong>¿Tiene sentido económico?</strong> Los costes de constitución y mantenimiento deben justificarse frente al beneficio. Para patrimonios inferiores a 500.000-1.000.000 €, una holding puede no ser eficiente.</li>
</ul>

<h2 class="text-2xl font-bold mt-12 mb-6">Paso 2: Elección de la forma jurídica</h2>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Forma</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Capital mínimo</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Ventajas</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Inconvenientes</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">S.L. (Sociedad Limitada)</td><td class="border border-border px-4 py-3">1 € (desde reforma LSC)</td><td class="border border-border px-4 py-3">Coste reducido, flexibilidad estatutaria, régimen simplificado</td><td class="border border-border px-4 py-3">Limitaciones a la transmisión de participaciones</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">S.A. (Sociedad Anónima)</td><td class="border border-border px-4 py-3">60.000 €</td><td class="border border-border px-4 py-3">Mayor flexibilidad en la transmisión de acciones</td><td class="border border-border px-4 py-3">Mayor coste, más formalidades</td></tr>
</tbody>
</table>
</div>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p><strong>Recomendación:</strong> En el 90% de los casos en el mid-market español, la S.L. es la forma jurídica más adecuada para una holding: menor coste, flexibilidad estatutaria y régimen fiscal idéntico al de la S.A.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Paso 3: Constitución de la sociedad</h2>
<p class="mb-4">El proceso de constitución de una S.L. holding es:</p>
<ol class="list-decimal pl-6 space-y-3 mb-6">
<li><strong>Certificación negativa de denominación</strong> (Registro Mercantil Central): 1-2 días, coste ~15 €.</li>
<li><strong>Apertura de cuenta bancaria</strong> y depósito del capital social.</li>
<li><strong>Escritura pública de constitución</strong> (Notaría): incluye estatutos sociales, objeto social, órgano de administración. Coste: 300-600 €.</li>
<li><strong>Liquidación de ITP/OS</strong> (Impuesto sobre Transmisiones Patrimoniales, modalidad Operaciones Societarias): exento desde 2010 para la constitución de sociedades.</li>
<li><strong>Inscripción en el Registro Mercantil</strong>: 3-15 días, coste ~150-300 €.</li>
<li><strong>Obtención del NIF definitivo</strong> (Agencia Tributaria) y alta censal (modelo 036).</li>
</ol>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">2-4 sem.</p>
<p class="text-sm text-muted-foreground">Plazo habitual para la constitución completa de una S.L. holding en España, desde la certificación de denominación hasta la inscripción registral.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Paso 4: Aportación de participaciones a la holding</h2>
<p class="mb-4">Una vez constituida la holding, el siguiente paso es aportar las participaciones de las sociedades operativas. Esta aportación se puede realizar de dos formas:</p>

<h3 class="text-xl font-semibold mt-8 mb-4">Opción A: Aportación no dineraria al amparo del régimen FEAC</h3>
<p class="mb-4">Es la opción más habitual. La persona física aporta sus participaciones en la sociedad operativa a la holding, recibiendo a cambio participaciones de la holding. Si se cumplen los requisitos del artículo 76.5 LIS (canje de valores), la operación tiene <a href="/blog/regimen-feac" class="text-primary hover:underline font-medium">neutralidad fiscal</a>: no se genera tributación en IRPF en el momento de la aportación.</p>
<p class="mb-4"><strong>Requisito clave:</strong> La holding debe obtener una participación que le permita la mayoría de voto en la filial (>50%), o si ya la tenía, que se incremente.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">Opción B: Compraventa</h3>
<p class="mb-4">La persona física vende las participaciones a la holding. Genera tributación inmediata en IRPF (19-30% sobre la plusvalía). Solo tiene sentido si la plusvalía es baja o si hay minusvalías que compensar.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Paso 5: Dotación de sustancia económica</h2>
<p class="mb-4">La holding debe tener sustancia económica real, no ser una mera cáscara. Elementos mínimos recomendados:</p>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Elemento</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Qué implica</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Por qué importa</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Domicilio propio</td><td class="border border-border px-4 py-3">Oficina real, no solo domicilio en despacho de asesores</td><td class="border border-border px-4 py-3">La AEAT verifica la realidad del domicilio</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Objeto social amplio</td><td class="border border-border px-4 py-3">Gestión de participaciones + servicios al grupo + inversión</td><td class="border border-border px-4 py-3">Demuestra actividad más allá de la mera tenencia</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Contabilidad propia</td><td class="border border-border px-4 py-3">Libros contables, cuentas anuales, modelo 200</td><td class="border border-border px-4 py-3">Obligación legal + evidencia de actividad</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Operaciones reales</td><td class="border border-border px-4 py-3">Cash pooling, servicios intercompany, decisiones de inversión</td><td class="border border-border px-4 py-3">Demuestra gestión activa del grupo</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Actas de decisiones</td><td class="border border-border px-4 py-3">Juntas y actas donde se documenten decisiones estratégicas</td><td class="border border-border px-4 py-3">Evidencia de motivos económicos válidos</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Paso 6: Comunicación a la AEAT del régimen FEAC</h2>
<p class="mb-4">La aplicación del <a href="/blog/regimen-feac" class="text-primary hover:underline font-medium">régimen FEAC</a> no requiere autorización previa, pero sí comunicación a la AEAT mediante el modelo 200 del Impuesto sobre Sociedades. Asimismo, es recomendable conservar documentación que acredite los motivos económicos válidos de la operación (acta de junta, informe de <a href="/blog/valoracion-de-empresas" class="text-primary hover:underline font-medium">valoración</a>, memoria económica).</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Cronograma recomendado (si el objetivo incluye venta)</h2>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Mes</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Acción</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Detalle</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">0-1</td><td class="border border-border px-4 py-3">Análisis previo</td><td class="border border-border px-4 py-3">Valoración, análisis fiscal, decisión sobre estructura</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">1-2</td><td class="border border-border px-4 py-3">Constitución S.L.</td><td class="border border-border px-4 py-3">Escritura, registro, NIF, alta censal</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">2-3</td><td class="border border-border px-4 py-3">Aportación participaciones</td><td class="border border-border px-4 py-3">Escritura de aportación, régimen FEAC, comunicación</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">3-12</td><td class="border border-border px-4 py-3">Dotación de sustancia</td><td class="border border-border px-4 py-3">Operaciones reales, cash pooling, actas, contabilidad</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">12-24</td><td class="border border-border px-4 py-3">Consolidación</td><td class="border border-border px-4 py-3">Periodo mínimo recomendado antes de explorar una venta</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">24+</td><td class="border border-border px-4 py-3">Proceso de venta</td><td class="border border-border px-4 py-3">La holding vende las participaciones de la filial operativa</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Preguntas frecuentes sobre sociedad holding</h2>

<div class="space-y-4 my-6">
<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Cuáles son los requisitos para crear una sociedad holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Los requisitos son los mismos que para cualquier S.L.: certificación negativa de denominación, escritura pública ante notario, capital social mínimo de 1 € (desde la reforma de la LSC), inscripción en el Registro Mercantil, y alta censal en la AEAT. Lo específico de la holding es su objeto social (tenencia y gestión de participaciones) y, si se aportan participaciones existentes, el cumplimiento de los requisitos del régimen FEAC (arts. 76-89 LIS).</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Cuánto tarda en constituirse una sociedad holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">El proceso de constitución de la sociedad en sí dura 2-4 semanas. Sin embargo, si el objetivo es una venta de empresa, el periodo total recomendado es de al menos 24 meses entre la constitución y la venta, para cumplir con el horizonte de referencia que aplica la AEAT en sus comprobaciones.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Es obligatorio el régimen FEAC para aportar participaciones?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">No es obligatorio, pero sí muy recomendable. Sin el régimen FEAC, la aportación de participaciones genera tributación en IRPF como ganancia patrimonial (19-30%). Con el FEAC, la operación tiene neutralidad fiscal: no se paga en el momento de la aportación, sino que el coste fiscal se difiere hasta que la holding transmita las participaciones.</div>
</details>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Fuentes y referencias</h2>
<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
<li>Ley 27/2014, del Impuesto sobre Sociedades, arts. 21, 76-89.</li>
<li>Real Decreto Legislativo 1/2010, Ley de Sociedades de Capital.</li>
<li>TEAC, Resoluciones de abril-mayo 2024 (RG 06448/2022 y ss.).</li>
<li>Ley 11/2020, de Presupuestos Generales del Estado para 2021 (reforma art. 21 LIS).</li>
</ul>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-8 my-12 text-center">
<h3 class="text-xl font-bold mb-3">¿Quieres crear una sociedad holding?</h3>
<p class="text-muted-foreground mb-6">En <strong>Capittal Transacciones</strong> y <strong>NRRO</strong> te asesoramos en todo el proceso: análisis previo, constitución, aportación de participaciones y cumplimiento normativo.</p>
<a href="/servicios/reestructuracion-societaria" class="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">Solicitar consulta</a>
</div>

<p class="text-sm text-muted-foreground mt-8"><em>Última actualización: marzo 2026. Planificamos revisar este artículo cuando el Tribunal Supremo resuelva las cuestiones de casación del Auto de 12 de marzo de 2025.</em></p>',
  'Guía práctica para crear una sociedad holding en España. Requisitos legales, forma jurídica (S.L. vs S.A.), aportación de participaciones, régimen FEAC, costes y plazos. Con esquema paso a paso y normativa actualizada.',
  NULL,
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'Fiscal',
  ARRAY['sociedad holding','crear holding','holding SL','holding requisitos','FEAC','estructura societaria','holding España','constitución holding'],
  14,
  true,
  false,
  'Sociedad holding en España: cómo crearla, requisitos y pasos [2026]',
  'Guía práctica para crear una sociedad holding en España. Requisitos legales, forma jurídica (S.L. vs S.A.), aportación de participaciones, régimen FEAC, costes y plazos. Con esquema paso a paso y normativa actualizada.',
  NOW(),
  '[{"question":"¿Cuáles son los requisitos para crear una sociedad holding?","answer":"Los requisitos son los mismos que para cualquier S.L.: certificación negativa de denominación, escritura pública ante notario, capital social mínimo de 1 € (desde la reforma de la LSC), inscripción en el Registro Mercantil, y alta censal en la AEAT. Lo específico de la holding es su objeto social (tenencia y gestión de participaciones) y, si se aportan participaciones existentes, el cumplimiento de los requisitos del régimen FEAC (arts. 76-89 LIS)."},{"question":"¿Cuánto tarda en constituirse una sociedad holding?","answer":"El proceso de constitución de la sociedad en sí dura 2-4 semanas. Sin embargo, si el objetivo es una venta de empresa, el periodo total recomendado es de al menos 24 meses entre la constitución y la venta, para cumplir con el horizonte de referencia que aplica la AEAT en sus comprobaciones."},{"question":"¿Es obligatorio el régimen FEAC para aportar participaciones?","answer":"No es obligatorio, pero sí muy recomendable. Sin el régimen FEAC, la aportación de participaciones genera tributación en IRPF como ganancia patrimonial (19-30%). Con el FEAC, la operación tiene neutralidad fiscal: no se paga en el momento de la aportación, sino que el coste fiscal se difiere hasta que la holding transmita las participaciones."}]'::jsonb
);

-- Re-enable trigger
ALTER TABLE blog_posts ENABLE TRIGGER trigger_google_indexing;
