
ALTER TABLE blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO blog_posts (
  slug, title, content, excerpt, featured_image_url,
  author_name, author_avatar_url, category, tags, reading_time,
  is_published, is_featured, meta_title, meta_description,
  published_at, faq_data
) VALUES (
  'articulo-21-lis-exencion-participaciones',
  'Artículo 21 LIS: exención sobre dividendos y plusvalías de participaciones [2026]',
  '<!-- ARTICLE: Artículo 21 LIS -->
<p class="text-lg leading-relaxed mb-8">El <strong>artículo 21</strong> de la Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades (LIS), establece el régimen de exención sobre las rentas obtenidas por una entidad residente en España derivadas de dividendos y participaciones en beneficios, así como de las rentas derivadas de la transmisión de participaciones en el capital de otras entidades. Es la piedra angular de la fiscalidad de las <a href="/blog/holding-empresarial" class="text-primary hover:underline font-medium">sociedades holding</a> en España.</p>

<blockquote class="border-l-4 border-primary pl-6 py-4 my-8 bg-muted/30 rounded-r-lg">
<p class="italic text-lg">"El artículo 21 LIS es probablemente el precepto fiscal más relevante para cualquier empresario que tenga participaciones en varias sociedades. Entenderlo bien —con sus requisitos, límites y excepciones— es imprescindible antes de tomar cualquier decisión sobre estructura societaria."</p>
<footer class="mt-3 text-sm font-semibold">— Samuel Navarro, fundador de Capittal Transacciones</footer>
</blockquote>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-primary mb-2">95%</p>
<p class="text-sm text-muted-foreground">Exención sobre dividendos y plusvalías de participaciones cualificadas. Desde la reforma de 2021 (Ley 11/2020), la exención se redujo del 100% al 95%, generando un tipo efectivo del 1,25%.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Texto literal del artículo 21 LIS (extracto de los apartados clave)</h2>

<h3 class="text-xl font-semibold mt-8 mb-4">Art. 21.1.a) LIS: Requisitos de participación</h3>
<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="italic text-muted-foreground">"Estarán exentos los dividendos o participaciones en beneficios de entidades, cuando se cumplan los siguientes requisitos: a) Que el porcentaje de participación, directa o indirecta, en el capital o en los fondos propios de la entidad sea, al menos, del 5 por ciento, o bien que el valor de adquisición de la participación sea superior a 20 millones de euros."</p>
</div>

<h3 class="text-xl font-semibold mt-8 mb-4">Art. 21.3 LIS: Exención en transmisión</h3>
<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="italic text-muted-foreground">"Estará exenta la renta positiva obtenida en la transmisión de la participación en una entidad, cuando se cumplan los requisitos establecidos en el apartado 1 de este artículo. [...] El requisito previsto en el párrafo a) del apartado 1 deberá cumplirse el día en que se produzca la transmisión. [...] El requisito de participación mínima de un año deberá cumplirse igualmente el día de la transmisión."</p>
</div>

<h3 class="text-xl font-semibold mt-8 mb-4">Art. 21.10 LIS: Exención del 95%</h3>
<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="italic text-muted-foreground">"La exención prevista en este artículo será del 95 por ciento."</p>
</div>
<p class="mb-4">Esto significa que el 5% restante tributa al tipo general del IS (25%), resultando un <strong>tipo efectivo del 1,25%</strong> sobre la renta total.</p>

<h3 class="text-xl font-semibold mt-8 mb-4">Art. 21.11 LIS: Excepción para entidades de reducida dimensión</h3>
<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p class="italic text-muted-foreground">"Lo dispuesto en el apartado anterior no resultará de aplicación a aquellas entidades cuyo importe neto de la cifra de negocios del periodo impositivo inmediato anterior sea inferior a 40 millones de euros, siempre que no se trate de entidades que formen parte de un grupo [...]"</p>
</div>
<p class="mb-4">Es decir, las empresas con facturación inferior a 40M € que no formen parte de un grupo pueden seguir aplicando la exención del 100%.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Requisitos detallados</h2>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Requisito</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Detalle</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Observaciones</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Participación mínima</td><td class="border border-border px-4 py-3">5% del capital (directo o indirecto) o 20M € valor adquisición</td><td class="border border-border px-4 py-3">Se computa tanto participación directa como indirecta</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Periodo de tenencia</td><td class="border border-border px-4 py-3">Mínimo 1 año (se puede completar después del devengo)</td><td class="border border-border px-4 py-3">El plazo de 1 año es independiente del horizonte de 24 meses FEAC</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Actividad económica</td><td class="border border-border px-4 py-3">La filial debe realizar actividad económica (no patrimonial >50%)</td><td class="border border-border px-4 py-3">Se evalúa en cada ejercicio</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Tributación mínima</td><td class="border border-border px-4 py-3">La filial tributa IS al 10% mínimo (presunción si residente en España)</td><td class="border border-border px-4 py-3">Relevante para filiales extranjeras</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">No ser sociedad patrimonial</td><td class="border border-border px-4 py-3">Más del 50% del activo no puede ser valores/no afectos</td><td class="border border-border px-4 py-3">Excepción: holding con filiales que SÍ son operativas</td></tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Ejemplo práctico: efecto numérico de la exención</h2>
<p class="mb-4">Supongamos una persona física que posee el 100% de una empresa operativa con coste de adquisición de 500.000 € y la empresa se vende por 5.000.000 € de Equity Value. Plusvalía: 4.500.000 €.</p>

<div class="overflow-x-auto my-6">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="bg-muted">
<th class="border border-border px-4 py-3 text-left font-semibold">Escenario</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Tributación</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Tipo efectivo</th>
<th class="border border-border px-4 py-3 text-left font-semibold">Neto para el vendedor</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-border px-4 py-3 font-medium">Venta directa (persona física)</td><td class="border border-border px-4 py-3">1.302.720 € (IRPF 19-30%)</td><td class="border border-border px-4 py-3">28,9%</td><td class="border border-border px-4 py-3">3.697.280 €</td></tr>
<tr class="bg-muted/30"><td class="border border-border px-4 py-3 font-medium">Venta a través de <a href="/blog/sociedad-holding-como-crear" class="text-primary hover:underline font-medium">holding</a></td><td class="border border-border px-4 py-3">56.250 € (IS 1,25%)</td><td class="border border-border px-4 py-3">1,25%</td><td class="border border-border px-4 py-3">4.443.750 €*</td></tr>
<tr><td class="border border-border px-4 py-3 font-medium">Diferencia</td><td class="border border-border px-4 py-3 font-bold text-primary">1.246.470 € de ahorro</td><td class="border border-border px-4 py-3"></td><td class="border border-border px-4 py-3">* Si distribuye, tributa en IRPF</td></tr>
</tbody>
</table>
</div>

<div class="bg-muted/30 border border-border rounded-lg p-6 my-6">
<p><strong>Nota importante:</strong> El ahorro fiscal de 1.246.470 € es real si los fondos se mantienen en la holding para reinvertir. Si el socio quiere disponer del dinero a título personal, deberá distribuir dividendos que tributan al 19-28% en IRPF. El ahorro definitivo depende de la estrategia posterior.</p>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">La reforma de 2021: del 100% al 95%</h2>
<p class="mb-4">La Ley 11/2020 (Presupuestos Generales del Estado para 2021) modificó el artículo 21 LIS, reduciendo la exención del 100% al 95%. Esto afectó a todas las entidades, salvo las de reducida dimensión (facturación &lt; 40M € y no grupo), que conservan la exención plena hasta 2026.</p>

<h2 class="text-2xl font-bold mt-12 mb-6">Preguntas frecuentes sobre el artículo 21 LIS</h2>

<div class="space-y-4 my-6">
<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué exención establece el artículo 21 de la Ley del Impuesto sobre Sociedades?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">El artículo 21 LIS establece la exención del 95% (o 100% para entidades de reducida dimensión que no formen grupo) sobre los dividendos recibidos de filiales y sobre las plusvalías obtenidas en la transmisión de participaciones, siempre que se cumplan los requisitos de participación mínima (5% o 20M €), periodo de tenencia (1 año), actividad económica de la filial, y tributación mínima.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Cuál es la participación mínima para aplicar la exención?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">El artículo 21.1.a) LIS exige una participación directa o indirecta de al menos el 5% del capital de la entidad participada, o alternativamente que el valor de adquisición de la participación sea superior a 20 millones de euros. Este requisito debe cumplirse el día de la transmisión para plusvalías.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Se aplica la exención a personas físicas?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">No. El artículo 21 LIS es un beneficio exclusivo del Impuesto sobre Sociedades, aplicable a entidades residentes en España. Las personas físicas tributan por IRPF, donde no existe esta exención. Por eso la constitución de una <a href="/blog/sociedad-holding-como-crear" class="text-primary hover:underline font-medium">sociedad holding</a> (sujeta al IS) es el vehículo necesario para poder aplicar la exención del artículo 21.</div>
</details>

<details class="group border border-border rounded-lg">
<summary class="flex items-center justify-between cursor-pointer p-4 font-semibold hover:bg-muted/30 transition-colors">
<span>¿Qué pasa con las sociedades patrimoniales?</span>
<svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</summary>
<div class="px-4 pb-4 text-muted-foreground">Si la entidad participada es una sociedad patrimonial (más del 50% de su activo son valores o elementos no afectos a actividad económica), los dividendos y plusvalías procedentes de esa participación NO se benefician de la exención del artículo 21. La filial debe realizar actividad económica real.</div>
</details>
</div>

<h2 class="text-2xl font-bold mt-12 mb-6">Fuentes y referencias</h2>
<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
<li>Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades, art. 21.</li>
<li>Ley 11/2020, de 30 de diciembre, de Presupuestos Generales del Estado para 2021 (modificación art. 21.10 LIS).</li>
<li>DGT, Consultas vinculantes sobre exención de participaciones (V0089-22, V1456-23, V2341-24).</li>
<li>TEAC, Resoluciones de abril-mayo 2024 sobre exención y cláusula anti-abuso.</li>
</ul>

<div class="bg-primary/5 border border-primary/20 rounded-xl p-8 my-12 text-center">
<h3 class="text-xl font-bold mb-3">¿Tu estructura cumple los requisitos del artículo 21 LIS?</h3>
<p class="text-muted-foreground mb-6">En <strong>NRRO</strong> y <strong>Capittal Transacciones</strong> analizamos tu caso particular y te ayudamos a optimizar la fiscalidad de tus participaciones.</p>
<a href="/servicios/reestructuracion-societaria" class="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">Solicitar consulta</a>
</div>

<p class="text-sm text-muted-foreground mt-8"><em>Última actualización: marzo 2026. Planificamos revisar este artículo cuando el Tribunal Supremo resuelva las cuestiones de casación del Auto de 12 de marzo de 2025.</em></p>',
  'El artículo 21 de la Ley del Impuesto sobre Sociedades establece la exención del 95% sobre dividendos y plusvalías de participaciones cualificadas. Requisitos, límites, texto legal y ejemplos prácticos.',
  NULL,
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'Fiscal',
  ARRAY['artículo 21 LIS','exención participaciones','exención dividendos','impuesto sociedades','holding exención','participación significativa','doble imposición'],
  15,
  true,
  false,
  'Artículo 21 LIS: exención sobre dividendos y plusvalías de participaciones [2026]',
  'El artículo 21 de la Ley del Impuesto sobre Sociedades establece la exención del 95% sobre dividendos y plusvalías de participaciones cualificadas. Requisitos, límites, texto legal y ejemplos prácticos.',
  NOW(),
  '[{"question":"¿Qué exención establece el artículo 21 de la Ley del Impuesto sobre Sociedades?","answer":"El artículo 21 LIS establece la exención del 95% (o 100% para entidades de reducida dimensión que no formen grupo) sobre los dividendos recibidos de filiales y sobre las plusvalías obtenidas en la transmisión de participaciones, siempre que se cumplan los requisitos de participación mínima (5% o 20M €), periodo de tenencia (1 año), actividad económica de la filial, y tributación mínima."},{"question":"¿Cuál es la participación mínima para aplicar la exención?","answer":"El artículo 21.1.a) LIS exige una participación directa o indirecta de al menos el 5% del capital de la entidad participada, o alternativamente que el valor de adquisición de la participación sea superior a 20 millones de euros. Este requisito debe cumplirse el día de la transmisión para plusvalías."},{"question":"¿Se aplica la exención a personas físicas?","answer":"No. El artículo 21 LIS es un beneficio exclusivo del Impuesto sobre Sociedades, aplicable a entidades residentes en España. Las personas físicas tributan por IRPF, donde no existe esta exención. Por eso la constitución de una sociedad holding (sujeta al IS) es el vehículo necesario para poder aplicar la exención del artículo 21."},{"question":"¿Qué pasa con las sociedades patrimoniales?","answer":"Si la entidad participada es una sociedad patrimonial (más del 50% de su activo son valores o elementos no afectos a actividad económica), los dividendos y plusvalías procedentes de esa participación NO se benefician de la exención del artículo 21. La filial debe realizar actividad económica real."}]'::jsonb
);

ALTER TABLE blog_posts ENABLE TRIGGER trigger_google_indexing;
