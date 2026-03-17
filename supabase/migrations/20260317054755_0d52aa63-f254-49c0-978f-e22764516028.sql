
ALTER TABLE blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO blog_posts (
  slug, title, content, excerpt, featured_image_url,
  author_name, author_avatar_url, category, tags, reading_time,
  is_published, is_featured, meta_title, meta_description,
  published_at, faq_data
) VALUES (
  'sociedad-patrimonial-vs-holding',
  'Sociedad patrimonial vs holding: diferencias, fiscalidad y cuándo conviene cada una [2026]',
  '<!-- ARTICLE: Sociedad patrimonial vs holding -->
<p class="text-lg leading-relaxed mb-8">En el ámbito de la planificación fiscal y patrimonial en España, dos estructuras aparecen de forma recurrente: la <strong>sociedad patrimonial</strong> y la <strong><a href="/blog/holding-empresarial" class="text-primary hover:underline font-medium">sociedad holding</a></strong>. Aunque a menudo se confunden o se usan indistintamente, son conceptos jurídica y fiscalmente muy distintos, con implicaciones prácticas diferentes para el empresario o inversor.</p>

<blockquote class="border-l-4 border-primary pl-6 py-4 my-8 bg-muted/30 rounded-r-lg">
<p class="italic text-lg">"La distinción entre sociedad patrimonial y holding no es un tema meramente académico: tiene consecuencias fiscales directas. Una sociedad patrimonial NO puede aplicar la exención del artículo 21 LIS. Una holding con filiales operativas, sí. Confundir ambas puede costar cientos de miles de euros."</p>
<footer class="mt-3 text-sm font-semibold">— Samuel Navarro, fundador de Capittal Transacciones</footer>
</blockquote>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">1.600</p>
<p class="text-sm text-muted-foreground">Búsquedas mensuales en España para «sociedad patrimonial» (Ahrefs, marzo 2026). Es una de las keywords con mayor volumen en el ámbito de planificación fiscal empresarial.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Qué es una sociedad patrimonial</h2>
<p class="mb-4">Una sociedad patrimonial es aquella en la que más de la mitad de su activo está constituido por valores o por elementos patrimoniales no afectos a una actividad económica. Esta definición viene establecida en el <strong>artículo 5.2 de la Ley del Impuesto sobre Sociedades (LIS)</strong> y es una condición que se evalúa en cada periodo impositivo.</p>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p><strong>Criterio legal:</strong> Si más del 50% del activo de la sociedad son valores, bienes inmuebles no afectos a actividad económica, u otros elementos patrimoniales sin vinculación con una actividad empresarial, la sociedad se califica como patrimonial a efectos fiscales.</p>
</div>

<p class="mb-4"><strong>Ejemplos típicos de sociedad patrimonial:</strong> una S.L. que posee inmuebles de alquiler gestionados sin estructura empresarial, una sociedad que solo tiene cuentas bancarias e inversiones financieras, una sociedad sin empleados ni actividad real que posee bienes de uso personal del socio.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Qué es una sociedad holding</h2>
<p class="mb-4">Una <a href="/blog/holding-empresarial" class="text-primary hover:underline font-medium">sociedad holding</a> es una entidad cuyo objeto principal es la tenencia y gestión de participaciones en otras sociedades. A diferencia de la patrimonial, la holding ejerce una función activa: dirige estratégicamente las filiales, centraliza la gestión del grupo y participa en la toma de decisiones empresariales.</p>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p><strong>Punto clave:</strong> Una holding puede ser formalmente «patrimonial» si sus activos son solo participaciones (que son «valores»). Sin embargo, si esas participaciones lo son en entidades que SÍ realizan actividad económica, y la holding ejerce funciones de dirección, la calificación fiscal puede ser diferente. Esta es la fuente de la confusión más habitual.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Diferencias clave: tabla comparativa</h2>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Criterio</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Sociedad patrimonial</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Sociedad holding (operativa)</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Definición</td><td class="border border-border px-4 py-3">Más del 50% del activo en valores o no afectos</td><td class="border border-border px-4 py-3">Tenencia y gestión activa de participaciones</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Actividad</td><td class="border border-border px-4 py-3">Mera tenencia pasiva de bienes</td><td class="border border-border px-4 py-3">Dirección y gestión estratégica del grupo</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Empleados</td><td class="border border-border px-4 py-3">Normalmente ninguno o mínimos</td><td class="border border-border px-4 py-3">Puede tener empleados dedicados a gestión</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium"><a href="/blog/articulo-21-lis-exencion-participaciones" class="text-primary hover:underline font-medium">Exención art. 21 LIS</a></td><td class="border border-border px-4 py-3 text-red-600 font-semibold">NO aplicable</td><td class="border border-border px-4 py-3 text-green-600 font-semibold">SÍ aplicable</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium"><a href="/blog/regimen-feac" class="text-primary hover:underline font-medium">Régimen FEAC</a></td><td class="border border-border px-4 py-3">Aplicable con limitaciones</td><td class="border border-border px-4 py-3">Plenamente aplicable</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Tipo IS</td><td class="border border-border px-4 py-3">25% (sin beneficios empresa reducida dimensión)</td><td class="border border-border px-4 py-3">25% (con acceso a exención art. 21)</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Transparencia fiscal (art. 4 LIP)</td><td class="border border-border px-4 py-3">Puede ser transparente en Patrimonio</td><td class="border border-border px-4 py-3">No transparente si hay gestión activa</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Uso típico</td><td class="border border-border px-4 py-3">Gestión inmobiliaria pasiva, inversiones financieras</td><td class="border border-border px-4 py-3">Grupos empresariales, familias con negocios operativos</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">La consecuencia fiscal decisiva: el artículo 21 LIS</h2>
<p class="mb-4">La diferencia más importante entre ambas estructuras es la aplicación del <a href="/blog/articulo-21-lis-exencion-participaciones" class="text-primary hover:underline font-medium">artículo 21 LIS</a>:</p>

<ul class="space-y-4 mb-6">
<li><strong>Sociedad patrimonial:</strong> Si la filial participada es una sociedad patrimonial (o la propia holding es patrimonial sin actividad real), los dividendos y plusvalías procedentes de esas participaciones NO gozan de la exención del artículo 21. La tributación es al tipo general del 25% del IS.</li>
<li><strong>Sociedad holding operativa:</strong> Si la holding posee participaciones en filiales que realizan actividad económica real, y cumple los requisitos del artículo 21 (5% mínimo, 1 año tenencia), los dividendos y plusvalías quedan exentos al 95%. Tipo efectivo: 1,25%.</li>
</ul>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">1,25%</p>
<p class="text-sm text-muted-foreground">Tipo efectivo sobre plusvalías a través de holding operativa (art. 21 LIS al 95% de exención), frente al 25% del IS sin exención o al 19-30% del IRPF si vende persona física.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Cuándo conviene una sociedad patrimonial</h2>
<ol class="list-decimal pl-6 space-y-3 mb-6">
<li><strong>Gestión inmobiliaria:</strong> Si el objetivo es gestionar inmuebles de alquiler. Permite diferir la tributación de plusvalías y aplicar la amortización del inmueble como gasto deducible (no disponible para personas físicas desde 2022 para inmuebles de alquiler).</li>
<li><strong>Holding de inversiones financieras:</strong> Si se gestionan activamente carteras de valores, fondos o instrumentos financieros.</li>
<li><strong>Patrimonio familiar sin empresa operativa:</strong> Si la familia tiene patrimonio (inmuebles, inversiones) pero no tiene una empresa operativa que genere dividendos o plusvalías de participaciones.</li>
</ol>

<h2 class="text-2xl font-bold mt-12 mb-6">Cuándo conviene una sociedad holding</h2>
<ol class="list-decimal pl-6 space-y-3 mb-6">
<li><strong>Grupo empresarial con filiales operativas:</strong> Es la estructura idónea cuando se poseen participaciones en una o más empresas con actividad económica real.</li>
<li><strong>Preparación para la venta de empresa:</strong> La holding permite aplicar la exención del artículo 21 LIS sobre la plusvalía de la venta, reduciendo la tributación del 19-30% (IRPF) al 1,25% (IS con exención).</li>
<li><strong>Planificación sucesoria de empresa familiar:</strong> Centraliza la propiedad de las participaciones y facilita la transmisión generacional sin fragmentar las operativas.</li>
<li><strong>Centralización de tesorería y gestión:</strong> Cash pooling, servicios compartidos, negociación bancaria a nivel de grupo.</li>
</ol>

<h2 class="text-2xl font-bold mt-12 mb-6">Preguntas frecuentes</h2>

<div class="space-y-4 my-6">
<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué diferencia hay entre sociedad patrimonial y holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">La diferencia fundamental es la actividad que realizan. Una sociedad patrimonial es una entidad que posee bienes de forma pasiva (inmuebles no afectos, inversiones financieras) sin desarrollar actividad económica real. Una holding es una sociedad que posee participaciones en otras empresas y ejerce funciones activas de dirección y gestión del grupo. La consecuencia fiscal principal es que la holding puede aplicar la exención del artículo 21 LIS sobre dividendos y plusvalías, mientras que la patrimonial no.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Puedo tener una holding que sea patrimonial?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Técnicamente sí: si la holding solo posee participaciones (que son «valores») y no tiene estructura propia, podría calificarse como patrimonial a efectos del art. 5.2 LIS. Sin embargo, si las participaciones son en entidades con actividad económica y la holding ejerce funciones de dirección, la doctrina y la jurisprudencia permiten considerar que la holding tiene actividad económica indirecta. Es una zona gris que requiere análisis caso por caso.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué es mejor, patrimonial o holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Depende del objetivo. Si tienes patrimonio inmobiliario o financiero sin empresas operativas, una patrimonial puede ser adecuada. Si tienes participaciones en empresas con actividad económica y quieres beneficiarte de la exención del artículo 21 LIS (ahorro fiscal muy significativo en dividendos y ventas), necesitas una holding con sustancia económica real. La elección debe basarse en un análisis fiscal individualizado.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Tributa igual una patrimonial que una holding?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Ambas tributan al 25% del Impuesto sobre Sociedades. La diferencia está en la exención del artículo 21 LIS: la holding operativa puede eximir el 95% de los dividendos y plusvalías de participaciones cualificadas (tipo efectivo 1,25%), mientras que la patrimonial no puede aplicar esta exención y tributa al tipo general del 25% sobre esas rentas.</div>
</details>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Fuentes y referencias</h2>
<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
<li>Ley 27/2014, del Impuesto sobre Sociedades, arts. 5.2 (sociedad patrimonial) y 21 (exención).</li>
<li>Ley 19/1991, del Impuesto sobre el Patrimonio, art. 4 (transparencia fiscal).</li>
<li>DGT, Consultas vinculantes sobre calificación de sociedades patrimoniales (V0923-22, V1732-24).</li>
<li>TEAC, Resoluciones de 2024 sobre holding y cláusula anti-abuso.</li>
<li>Garrigues. <em>Sociedades holding y patrimoniales: régimen fiscal comparado</em>, 2024.</li>
</ul>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-8 my-12 text-center">
<h3 class="text-xl font-bold mb-3">¿No tienes claro si necesitas una patrimonial o una holding?</h3>
<p class="text-muted-foreground mb-6">En <strong>NRRO</strong> y <strong>Capittal Transacciones</strong> analizamos tu situación y te recomendamos la estructura óptima.</p>
<a href="/servicios/reestructuracion-societaria" class="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">Solicitar consulta</a>
</div>

<p class="text-sm text-muted-foreground mt-8"><em>Última actualización: marzo 2026. Planificamos revisar este artículo cuando el Tribunal Supremo resuelva las cuestiones de casación del Auto de 12 de marzo de 2025.</em></p>',
  'Diferencias entre sociedad patrimonial y holding empresarial. Fiscalidad, requisitos legales, ventajas de cada estructura, y cómo afecta al artículo 21 LIS. Guía completa para elegir la mejor opción para tu patrimonio.',
  NULL,
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'Fiscal',
  ARRAY['sociedad patrimonial','holding vs patrimonial','holding empresarial','artículo 21 LIS','fiscalidad holding','sociedad patrimonial requisitos','holding familiar'],
  14,
  true,
  true,
  'Sociedad patrimonial vs holding: diferencias, fiscalidad y cuándo conviene cada una [2026]',
  'Diferencias entre sociedad patrimonial y holding empresarial. Fiscalidad, requisitos legales, ventajas de cada estructura, y cómo afecta al artículo 21 LIS. Guía completa para elegir la mejor opción para tu patrimonio.',
  NOW(),
  '[{"question":"¿Qué diferencia hay entre sociedad patrimonial y holding?","answer":"La diferencia fundamental es la actividad que realizan. Una sociedad patrimonial es una entidad que posee bienes de forma pasiva (inmuebles no afectos, inversiones financieras) sin desarrollar actividad económica real. Una holding es una sociedad que posee participaciones en otras empresas y ejerce funciones activas de dirección y gestión del grupo. La consecuencia fiscal principal es que la holding puede aplicar la exención del artículo 21 LIS sobre dividendos y plusvalías, mientras que la patrimonial no."},{"question":"¿Puedo tener una holding que sea patrimonial?","answer":"Técnicamente sí: si la holding solo posee participaciones (que son «valores») y no tiene estructura propia, podría calificarse como patrimonial a efectos del art. 5.2 LIS. Sin embargo, si las participaciones son en entidades con actividad económica y la holding ejerce funciones de dirección, la doctrina y la jurisprudencia permiten considerar que la holding tiene actividad económica indirecta. Es una zona gris que requiere análisis caso por caso."},{"question":"¿Qué es mejor, patrimonial o holding?","answer":"Depende del objetivo. Si tienes patrimonio inmobiliario o financiero sin empresas operativas, una patrimonial puede ser adecuada. Si tienes participaciones en empresas con actividad económica y quieres beneficiarte de la exención del artículo 21 LIS (ahorro fiscal muy significativo en dividendos y ventas), necesitas una holding con sustancia económica real. La elección debe basarse en un análisis fiscal individualizado."},{"question":"¿Tributa igual una patrimonial que una holding?","answer":"Ambas tributan al 25% del Impuesto sobre Sociedades. La diferencia está en la exención del artículo 21 LIS: la holding operativa puede eximir el 95% de los dividendos y plusvalías de participaciones cualificadas (tipo efectivo 1,25%), mientras que la patrimonial no puede aplicar esta exención y tributa al tipo general del 25% sobre esas rentas."}]'::jsonb
);

ALTER TABLE blog_posts ENABLE TRIGGER trigger_google_indexing;
