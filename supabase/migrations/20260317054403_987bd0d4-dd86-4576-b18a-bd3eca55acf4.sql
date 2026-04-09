
-- Disable trigger to prevent indexing errors during insert
ALTER TABLE blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO blog_posts (
  slug, title, content, excerpt, featured_image_url,
  author_name, author_avatar_url, category, tags, reading_time,
  is_published, is_featured, meta_title, meta_description,
  published_at, faq_data
) VALUES (
  'regimen-feac',
  'Régimen FEAC: neutralidad fiscal en fusiones, escisiones y aportaciones [2026]',
  '<!-- ARTICLE: Régimen FEAC -->
<p class="text-lg leading-relaxed mb-8">El <strong>régimen FEAC</strong> (Fusiones, Escisiones, Aportaciones de activos y Canje de valores) es el marco jurídico-fiscal previsto en los artículos 76 a 89 de la Ley 27/2014 del Impuesto sobre Sociedades (LIS) que permite realizar determinadas operaciones de <a href="/blog/reestructuracion-empresarial" class="text-primary hover:underline font-medium">reestructuración empresarial</a> sin tributación inmediata. La ganancia o pérdida fiscal se difiere hasta una transmisión posterior.</p>

<blockquote class="border-l-4 border-primary pl-6 py-4 my-8 bg-muted/30 rounded-r-lg">
<p class="italic text-lg">"El régimen FEAC no es un beneficio fiscal: es un mecanismo de diferimiento. La tributación no desaparece, se pospone. Esto es lo que muchos asesores no explican correctamente, y lo que la AEAT verifica en sus comprobaciones."</p>
<footer class="mt-3 text-sm font-semibold">— Samuel Navarro, fundador de Capittal Transacciones</footer>
</blockquote>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">200</p>
<p class="text-sm text-muted-foreground">Búsquedas mensuales en España para «régimen feac» (Ahrefs, marzo 2026). Una keyword técnica con alta intención comercial y dificultad 0.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Operaciones cubiertas por el régimen FEAC</h2>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Operación</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Descripción</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Base legal</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Fusión</td><td class="border border-border px-4 py-3">Dos o más sociedades se unen en una sola</td><td class="border border-border px-4 py-3">Art. 76.1 LIS</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Escisión</td><td class="border border-border px-4 py-3">Una sociedad divide su patrimonio en dos o más sociedades</td><td class="border border-border px-4 py-3">Art. 76.2 LIS</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Aportación de rama de actividad</td><td class="border border-border px-4 py-3">Transmisión de un conjunto patrimonial que constituye rama de actividad</td><td class="border border-border px-4 py-3">Art. 76.4 LIS</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Canje de valores</td><td class="border border-border px-4 py-3">Aportación de participaciones a cambio de participaciones de la sociedad adquirente</td><td class="border border-border px-4 py-3">Art. 76.5 LIS</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Aportación no dineraria especial</td><td class="border border-border px-4 py-3">Aportación de elementos patrimoniales distintos de rama de actividad</td><td class="border border-border px-4 py-3">Art. 87 LIS</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">El canje de valores: la operación clave para holdings</h2>
<p class="mb-4">El canje de valores (art. 76.5 LIS) es la operación más relevante en el contexto de <a href="/blog/holding-empresarial" class="text-primary hover:underline font-medium">holdings</a>. Consiste en que una persona física (o jurídica) aporta participaciones de una sociedad (la filial operativa) a otra sociedad (la <a href="/blog/sociedad-holding-como-crear" class="text-primary hover:underline font-medium">holding</a>), recibiendo a cambio participaciones de esta última.</p>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="font-semibold mb-2">Texto literal del artículo 76.5 LIS:</p>
<p class="italic text-muted-foreground">"Tendrá la consideración de canje de valores representativos del capital social la operación por la cual una entidad adquiere una participación en el capital social de otra que le permita obtener la mayoría de los derechos de voto en ella, o, si ya dispone de dicha mayoría, adquirir una mayor participación, mediante la atribución a los socios, a cambio de sus valores, de otros representativos del capital social de la primera entidad [...]"</p>
</div>

<h3 class="text-xl font-semibold mt-8 mb-4">Requisitos del canje de valores</h3>
<ol class="list-decimal pl-6 space-y-3 mb-6">
<li><strong>Mayoría de voto:</strong> La holding debe obtener una participación que le permita la mayoría de los derechos de voto (>50%) en la filial, o si ya la tiene, incrementarla.</li>
<li><strong>Contraprestación en participaciones:</strong> La contraprestación al socio aportante debe ser participaciones de la holding. Se permite un máximo del 10% en metálico.</li>
</ol>

<h3 class="text-xl font-semibold mt-8 mb-4">Régimen fiscal del canje (art. 80.1 LIS)</h3>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="font-semibold mb-2">Texto literal del artículo 80.1 LIS:</p>
<p class="italic text-muted-foreground">"No se integrarán en la base imponible del Impuesto sobre la Renta de las Personas Físicas o de este Impuesto las rentas que se pongan de manifiesto con ocasión de la atribución de valores de la entidad adquirente a los socios de la entidad adquirida, siempre que éstos sean residentes en territorio español [...]"</p>
</div>

<p class="mb-4">En términos prácticos: la persona física que aporta sus participaciones de la filial a la holding no paga IRPF en ese momento. El coste de adquisición de las participaciones de la holding será el mismo que tenían las participaciones aportadas (valor histórico).</p>

<h2 class="text-2xl font-bold mt-12 mb-6">La cláusula anti-abuso: art. 89.2 LIS</h2>
<p class="mb-4">La cláusula anti-abuso es el punto crítico del régimen FEAC. Establece que si la operación no se realiza por <strong>motivos económicos válidos</strong>, sino con el propósito principal de obtener una ventaja fiscal, la Administración puede inaplicar el régimen.</p>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="font-semibold mb-2">Texto literal del artículo 89.2 LIS:</p>
<p class="italic text-muted-foreground">"No se aplicará el régimen establecido en el presente capítulo cuando la operación realizada tenga como principal objetivo el fraude o la evasión fiscal. En particular, el régimen no se aplicará cuando la operación no se efectúe por motivos económicos válidos, tales como la reestructuración o la racionalización de las actividades de las entidades que participan en la operación, sino con la mera finalidad de conseguir una ventaja fiscal."</p>
</div>

<h3 class="text-xl font-semibold mt-8 mb-4">Diferencia clave con el antiguo art. 96.2 TRLIS</h3>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Aspecto</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Art. 89.2 LIS (desde 2015)</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Art. 96.2 TRLIS (hasta 2014)</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Inaplicación</td><td class="border border-border px-4 py-3">Total O PARCIAL</td><td class="border border-border px-4 py-3">Solo total</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Efecto</td><td class="border border-border px-4 py-3">Se regulariza solo la ventaja fiscal obtenida</td><td class="border border-border px-4 py-3">Se regulariza toda la operación</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Proporcionalidad</td><td class="border border-border px-4 py-3">Implícita en la norma</td><td class="border border-border px-4 py-3">No prevista expresamente</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Consecuencia práctica</td><td class="border border-border px-4 py-3">Regularización modulada y progresiva</td><td class="border border-border px-4 py-3">Todo o nada</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Doctrina del TEAC (resoluciones de abril-mayo 2024)</h2>
<p class="mb-4">Las resoluciones del TEAC de 2024 (RG 06448/2022, 06452/2022, 06513/2022, 06550/2022) han sentado doctrina clave sobre la aplicación de la cláusula anti-abuso:</p>

<ol class="list-decimal pl-6 space-y-4 mb-6">
<li><strong>Regularización proporcional y progresiva:</strong> Si la holding se constituye y posteriormente la empresa se vende, la regularización no es sobre toda la plusvalía, sino solo sobre los dividendos efectivamente distribuidos a la holding. Es decir, el efecto anti-abuso se materializa conforme se produce el beneficio real.</li>
<li><strong>Expectativa de rentabilidad no es abusiva:</strong> Crear una holding con la expectativa de obtener rentabilidad futura (dividendos, revalorización) no es, por sí solo, un motivo económico inválido.</li>
<li><strong>La inaplicación parcial es posible:</strong> El TEAC confirma que bajo la LIS (desde 2015), la inaplicación del régimen puede ser parcial, afectando solo a la ventaja fiscal concreta, no a toda la operación.</li>
</ol>

<h2 class="text-2xl font-bold mt-12 mb-6">Recurso de casación ante el Tribunal Supremo (Auto 12 marzo 2025)</h2>
<p class="mb-4">El TS ha admitido a trámite un recurso de casación (recurso 6518/2023, ECLI:ES:TS:2025:2692A) que plantea tres cuestiones de enorme trascendencia:</p>

<ol class="list-decimal pl-6 space-y-3 mb-6">
<li>Determinar si bajo el TRLIS existe una regla implícita de proporcionalidad.</li>
<li>En caso afirmativo, cómo debe aplicarse esa proporcionalidad.</li>
<li>Si la <a href="/blog/articulo-21-lis-exencion-participaciones" class="text-primary hover:underline font-medium">exención por doble imposición del artículo 21 LIS</a> puede considerarse una «ventaja fiscal» a efectos de la cláusula anti-abuso.</li>
</ol>

<p class="mb-4">La sentencia del TS podría cambiar radicalmente el panorama aplicativo del régimen FEAC en el contexto de holdings pre-venta.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Preguntas frecuentes sobre el régimen FEAC</h2>

<div class="space-y-4 my-6">
<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué es el régimen FEAC?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">El régimen FEAC (Fusiones, Escisiones, Aportaciones de activos y Canje de valores) es el marco fiscal previsto en los artículos 76 a 89 de la Ley del Impuesto sobre Sociedades que permite realizar reestructuraciones empresariales sin tributación inmediata. La ganancia fiscal se difiere hasta una transmisión posterior de los activos o participaciones.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Necesito autorización de Hacienda para aplicar el FEAC?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">No. El régimen FEAC se aplica automáticamente si se cumplen los requisitos legales. No requiere solicitud ni autorización previa. Sin embargo, la AEAT puede comprobar a posteriori que la operación tenía motivos económicos válidos y, si no los tenía, inaplicar total o parcialmente el régimen (art. 89.2 LIS).</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué son los motivos económicos válidos?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Son las razones empresariales, más allá de la ventaja fiscal, que justifican la operación de reestructuración. Ejemplos aceptados por la doctrina y la jurisprudencia: centralización de la gestión del grupo, protección patrimonial, planificación sucesoria, preparación para la entrada de inversores, profesionalización de la gestión, separación de ramas de actividad. La mera obtención de una ventaja fiscal no es un motivo económico válido por sí solo.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué pasa si la AEAT considera que no había motivos económicos válidos?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Desde 2015 (LIS), la AEAT puede inaplicar total o parcialmente el régimen FEAC. En la práctica, conforme a la doctrina del TEAC de 2024, la inaplicación es proporcional: se regulariza solo la ventaja fiscal concretamente obtenida, no toda la operación. Esto supone la tributación de la plusvalía que se pretendía diferir, más intereses de demora y, potencialmente, sanción (si se aprecia culpabilidad).</div>
</details>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Fuentes y referencias</h2>
<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
<li>Ley 27/2014, del Impuesto sobre Sociedades, arts. 76-89.</li>
<li>Real Decreto Legislativo 4/2004 (TRLIS), art. 96.2 (redacción hasta 2014).</li>
<li>TEAC, Resoluciones RG 06448/2022, 06452/2022, 06513/2022, 06550/2022 (abril-mayo 2024).</li>
<li>TS, Auto de 12 de marzo de 2025, recurso 6518/2023 (ECLI:ES:TS:2025:2692A).</li>
<li>STS de 9 de marzo de 2017, recurso 897/2016.</li>
<li>Cuatrecasas. <em>Holdings familiares y aportaciones: últimos pronunciamientos del TEAC</em>, 2024.</li>
</ul>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-8 my-12 text-center">
<h3 class="text-xl font-bold mb-3">¿Planificas una reestructuración societaria?</h3>
<p class="text-muted-foreground mb-6">En <strong>Capittal Transacciones</strong> y <strong>NRRO</strong> analizamos la viabilidad fiscal de la operación bajo el régimen FEAC, incluyendo el cumplimiento de los motivos económicos válidos.</p>
<a href="/servicios/reestructuracion-societaria" class="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">Solicitar consulta</a>
</div>

<p class="text-sm text-muted-foreground mt-8"><em>Última actualización: marzo 2026. Planificamos revisar este artículo cuando el Tribunal Supremo resuelva las cuestiones de casación del Auto de 12 de marzo de 2025.</em></p>',
  'El régimen FEAC permite realizar fusiones, escisiones, canjes de valores y aportaciones de activos sin tributación inmediata. Guía completa con los artículos 76-89 LIS, cláusula anti-abuso, doctrina del TEAC 2024 y ejemplos.',
  NULL,
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'Fiscal',
  ARRAY['régimen FEAC','neutralidad fiscal','canje de valores','aportación no dineraria','fusiones','escisiones','artículo 76 LIS','cláusula anti-abuso'],
  16,
  true,
  false,
  'Régimen FEAC: neutralidad fiscal en fusiones, escisiones y aportaciones [2026]',
  'El régimen FEAC permite realizar fusiones, escisiones, canjes de valores y aportaciones de activos sin tributación inmediata. Guía completa con los artículos 76-89 LIS, cláusula anti-abuso, doctrina del TEAC 2024 y ejemplos.',
  NOW(),
  '[{"question":"¿Qué es el régimen FEAC?","answer":"El régimen FEAC (Fusiones, Escisiones, Aportaciones de activos y Canje de valores) es el marco fiscal previsto en los artículos 76 a 89 de la Ley del Impuesto sobre Sociedades que permite realizar reestructuraciones empresariales sin tributación inmediata. La ganancia fiscal se difiere hasta una transmisión posterior de los activos o participaciones."},{"question":"¿Necesito autorización de Hacienda para aplicar el FEAC?","answer":"No. El régimen FEAC se aplica automáticamente si se cumplen los requisitos legales. No requiere solicitud ni autorización previa. Sin embargo, la AEAT puede comprobar a posteriori que la operación tenía motivos económicos válidos y, si no los tenía, inaplicar total o parcialmente el régimen (art. 89.2 LIS)."},{"question":"¿Qué son los motivos económicos válidos?","answer":"Son las razones empresariales, más allá de la ventaja fiscal, que justifican la operación de reestructuración. Ejemplos aceptados por la doctrina y la jurisprudencia: centralización de la gestión del grupo, protección patrimonial, planificación sucesoria, preparación para la entrada de inversores, profesionalización de la gestión, separación de ramas de actividad. La mera obtención de una ventaja fiscal no es un motivo económico válido por sí solo."},{"question":"¿Qué pasa si la AEAT considera que no había motivos económicos válidos?","answer":"Desde 2015 (LIS), la AEAT puede inaplicar total o parcialmente el régimen FEAC. En la práctica, conforme a la doctrina del TEAC de 2024, la inaplicación es proporcional: se regulariza solo la ventaja fiscal concretamente obtenida, no toda la operación. Esto supone la tributación de la plusvalía que se pretendía diferir, más intereses de demora y, potencialmente, sanción (si se aprecia culpabilidad)."}]'::jsonb
);

-- Re-enable trigger
ALTER TABLE blog_posts ENABLE TRIGGER trigger_google_indexing;
