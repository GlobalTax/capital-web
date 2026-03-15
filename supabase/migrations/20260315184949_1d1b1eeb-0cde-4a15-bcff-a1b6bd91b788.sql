
-- Disable indexing trigger to avoid edge function error
ALTER TABLE public.blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO public.blog_posts (
  slug, title, excerpt, content, 
  meta_title, meta_description,
  author_name, author_avatar_url,
  category, tags, reading_time,
  is_published, is_featured,
  featured_image_url,
  published_at,
  faq_data
) VALUES (
  'compraventa-de-empresas',
  'Compraventa de empresas en España: proceso, contrato y claves legales [2026]',
  'Guía sobre la compraventa de empresas: diferencia entre share deal y asset deal, qué incluye el contrato SPA, cláusulas clave, due diligence obligatoria, y pasos del proceso. Con ejemplos y datos de mercado.',
  E'<article class="blog-post-content">

<p class="text-lg text-gray-700 leading-relaxed mb-8">La <strong>compraventa de empresas</strong> es la operación jurídica mediante la cual se transmite la propiedad y el control de un negocio de un vendedor a un comprador. En el mercado español de M&A, las operaciones se estructuran mayoritariamente como compraventas de participaciones sociales o acciones (<em>share deals</em>), aunque en determinados supuestos se opta por la compra de activos (<em>asset deals</em>).</p>

<blockquote class="border-l-4 border-black pl-6 my-8 italic text-gray-700">
<p>«Cada operación de compraventa de empresa es única. No existen dos SPA iguales porque no existen dos empresas iguales. Sin embargo, hay una estructura y unas cláusulas que se repiten en todas las operaciones profesionales. Conocerlas y entenderlas es lo que marca la diferencia entre cerrar una buena operación y asumir riesgos innecesarios.»</p>
<p class="not-italic font-semibold mt-2">— Samuel Navarro, fundador de Capittal Transacciones</p>
</blockquote>

<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-black mb-2">85%</p>
<p class="text-gray-600">Porcentaje de operaciones mid-market en España que se estructuran como <em>share deals</em> (compraventa de participaciones), según análisis de Capittal Transacciones sobre su track record y datos de mercado TTR Data 2024.</p>
</div>

<h2 class="text-2xl font-bold text-black mt-12 mb-6">Share deal vs. asset deal: cómo se estructura la operación</h2>

<p class="mb-6">La primera decisión estratégica en una compraventa de empresa es si se compran las participaciones/acciones de la sociedad (<em>share deal</em>) o los activos del negocio (<em>asset deal</em>):</p>

<div class="overflow-x-auto my-8">
<table class="min-w-full border border-gray-200 rounded-lg text-sm">
<thead>
<tr class="bg-gray-100">
<th class="border border-gray-200 px-4 py-3 text-left font-semibold">Criterio</th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold">Share deal</th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold">Asset deal</th>
</tr>
</thead>
<tbody>
<tr><td class="border border-gray-200 px-4 py-3 font-medium">Qué se transmite</td><td class="border border-gray-200 px-4 py-3">Participaciones/acciones de la sociedad</td><td class="border border-gray-200 px-4 py-3">Activos y pasivos seleccionados</td></tr>
<tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-3 font-medium">Subrogación contratos</td><td class="border border-gray-200 px-4 py-3">Automática (la sociedad sigue igual)</td><td class="border border-gray-200 px-4 py-3">Requiere consentimiento de terceros</td></tr>
<tr><td class="border border-gray-200 px-4 py-3 font-medium">Empleados</td><td class="border border-gray-200 px-4 py-3">Se mantienen (misma sociedad)</td><td class="border border-gray-200 px-4 py-3">Subrogación laboral (art. 44 ET)</td></tr>
<tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-3 font-medium">Pasivos ocultos</td><td class="border border-gray-200 px-4 py-3">Riesgo para comprador (hereda todo)</td><td class="border border-gray-200 px-4 py-3">Menor riesgo (selecciona activos)</td></tr>
<tr><td class="border border-gray-200 px-4 py-3 font-medium">Fiscalidad vendedor</td><td class="border border-gray-200 px-4 py-3">Plusvalía por transmisión participaciones</td><td class="border border-gray-200 px-4 py-3">Plusvalía por venta de activos + liquidación</td></tr>
<tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-3 font-medium">Fiscalidad comprador</td><td class="border border-gray-200 px-4 py-3">No genera amortización fiscal extra</td><td class="border border-gray-200 px-4 py-3">Permite amortizar a valor de adquisición</td></tr>
<tr><td class="border border-gray-200 px-4 py-3 font-medium">Complejidad</td><td class="border border-gray-200 px-4 py-3">Menor (un acto jurídico)</td><td class="border border-gray-200 px-4 py-3">Mayor (múltiples transmisiones)</td></tr>
<tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-3 font-medium">Uso en mid-market</td><td class="border border-gray-200 px-4 py-3">85% de las operaciones</td><td class="border border-gray-200 px-4 py-3">15% (hostelería, retail, activos específicos)</td></tr>
</tbody>
</table>
</div>

<p class="mb-6"><strong>Regla general:</strong> En el mid-market español, el <em>share deal</em> es la estructura por defecto salvo que haya razones específicas para un <em>asset deal</em> (pasivos contingentes significativos, interés solo en una línea de negocio, estructura societaria compleja).</p>

<h2 class="text-2xl font-bold text-black mt-12 mb-6">El contrato de compraventa (SPA): cláusulas esenciales</h2>

<p class="mb-6">El <strong>Share Purchase Agreement (SPA)</strong> es el contrato central de la operación. En el mid-market español, un SPA típico tiene entre 30 y 80 páginas más anexos. Sus cláusulas principales son:</p>

<h3 class="text-xl font-semibold text-black mt-8 mb-4">1. Precio y mecanismo de ajuste</h3>

<p class="mb-4">El precio puede ser fijo (<em>locked box</em>) o variable (<em>completion accounts</em>):</p>

<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Locked box:</strong> Precio fijo calculado sobre cuentas a una fecha anterior al cierre. El vendedor asume que no habrá filtraciones de valor (<em>no leakage</em>). Es más rápido y sencillo, preferido por vendedores.</li>
<li><strong>Completion accounts:</strong> Precio provisional que se ajusta tras el cierre según las cuentas a fecha de cierre. Más protector para el comprador, pero genera incertidumbre sobre el precio final.</li>
</ul>

<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 my-8 text-center">
<p class="text-4xl font-bold text-black mb-2">55%</p>
<p class="text-gray-600">Porcentaje de operaciones mid-market en Europa que utilizan mecanismo <em>locked box</em>, tendencia creciente frente al <em>completion accounts</em>, según CMS European M&A Study 2024.</p>
</div>

<h3 class="text-xl font-semibold text-black mt-8 mb-4">2. Representaciones y garantías (Reps &amp; Warranties)</h3>

<p class="mb-6">Son declaraciones del vendedor sobre el estado de la empresa en múltiples materias: cuentas anuales, situación fiscal, laboral, contractual, propiedad intelectual, cumplimiento normativo, litigios, medioambiental, etc. Si alguna representación resulta ser falsa o inexacta, el vendedor debe indemnizar al comprador.</p>

<h3 class="text-xl font-semibold text-black mt-8 mb-4">3. Indemnización y limitaciones</h3>

<p class="mb-4">El régimen de indemnización establece los límites de responsabilidad del vendedor:</p>

<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Cap (límite máximo):</strong> Típicamente 15-30% del precio en <em>general reps</em>, 100% para <em>reps fundamentales</em> (título de propiedad, capacidad legal).</li>
<li><strong>Basket (mínimo acumulado):</strong> El comprador solo puede reclamar si los daños superan un umbral (típicamente 0,5-1% del precio). Puede ser <em>de minimis</em> (individual) y <em>basket</em> (acumulado).</li>
<li><strong>Plazo de reclamación:</strong> 18-24 meses para reps generales, 4-5 años para reps fiscales y laborales, sin límite para reps fundamentales.</li>
</ul>

<h3 class="text-xl font-semibold text-black mt-8 mb-4">4. Condiciones de cierre (Conditions Precedent)</h3>

<p class="mb-6">Condiciones que deben cumplirse entre la firma y el cierre: autorizaciones regulatorias (competencia), consentimientos de terceros, <em>waiver</em> de socios, entrega de documentación. Si no se cumplen, la operación no cierra.</p>

<h3 class="text-xl font-semibold text-black mt-8 mb-4">5. Cláusulas habituales complementarias</h3>

<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Non-compete:</strong> El vendedor se compromete a no competir durante 2-3 años, en un ámbito geográfico y sectorial definido.</li>
<li><strong>Non-solicitation:</strong> El vendedor no puede captar empleados ni clientes de la empresa vendida.</li>
<li><strong>Earn-out:</strong> Pago variable vinculado a resultados futuros (consulta nuestro artículo detallado sobre <a href="/recursos/blog/que-es-earn-out" class="text-blue-700 underline hover:text-blue-900">qué es un earn-out en M&amp;A</a>).</li>
<li><strong>Escrow:</strong> Depósito de una parte del precio (típicamente 10-15%) en una cuenta controlada por un agente neutral, como garantía de las indemnizaciones.</li>
</ul>

<h2 class="text-2xl font-bold text-black mt-12 mb-6">La carta de intenciones (LOI / Term Sheet)</h2>

<p class="mb-6">Antes del SPA, las partes suelen firmar una <strong>carta de intenciones</strong> (<em>Letter of Intent</em>, LOI) o un <em>term sheet</em> que recoge los términos principales de la operación. Este documento es habitualmente no vinculante en cuanto al precio, pero sí vinculante en cuanto a <a href="/recursos/blog/que-es-un-nda" class="text-blue-700 underline hover:text-blue-900">confidencialidad (NDA)</a> y exclusividad.</p>

<p class="mb-4"><strong>Contenido típico de una LOI:</strong></p>

<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Precio indicativo y estructura (cash, <a href="/recursos/blog/que-es-earn-out" class="text-blue-700 underline hover:text-blue-900">earn-out</a>, participación en nueva sociedad)</li>
<li>Perímetro de la operación (qué se compra y qué se excluye)</li>
<li>Condiciones principales (<a href="/recursos/blog/que-es-due-diligence" class="text-blue-700 underline hover:text-blue-900">due diligence</a>, financiación, autorizaciones)</li>
<li>Calendario estimado</li>
<li>Exclusividad (típicamente 60-120 días)</li>
<li>Confidencialidad</li>
</ul>

<h2 class="text-2xl font-bold text-black mt-12 mb-6">El papel del asesor M&amp;A en la compraventa</h2>

<p class="mb-4">El asesor M&amp;A actúa como director de orquesta de la operación, coordinando a abogados, auditores, fiscalistas y asegurando que el proceso avanza según el calendario. Sus funciones principales:</p>

<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Vendor side (asesor del vendedor):</strong> Preparación de la empresa para la <a href="/recursos/blog/vender-mi-empresa" class="text-blue-700 underline hover:text-blue-900">venta</a>, <a href="/recursos/blog/como-se-valora-una-empresa-claves-para-entenderlo-incluye-ejemplo-practico" class="text-blue-700 underline hover:text-blue-900">valoración</a>, identificación de compradores, gestión del proceso competitivo, negociación del precio y condiciones, coordinación del cierre.</li>
<li><strong>Buy side (asesor del comprador):</strong> Búsqueda de targets, análisis preliminar, valoración basada en <a href="/recursos/blog/que-es-ebitda" class="text-blue-700 underline hover:text-blue-900">EBITDA</a> y otros múltiplos, coordinación de <a href="/recursos/blog/que-es-due-diligence" class="text-blue-700 underline hover:text-blue-900">due diligence</a>, negociación del SPA, estructuración de la financiación.</li>
</ul>

<h2 class="text-2xl font-bold text-black mt-12 mb-6">Preguntas frecuentes sobre compraventa de empresas</h2>

<div class="space-y-6 my-8">

<div class="border border-gray-200 rounded-lg p-6">
<h3 class="text-lg font-semibold text-black mb-3">¿Qué es un SPA (Share Purchase Agreement)?</h3>
<p class="text-gray-700">El SPA es el contrato de compraventa de participaciones o acciones mediante el cual se formaliza la transmisión de la propiedad de una empresa. Es el documento legal central de cualquier operación de M&amp;A. Incluye el precio, las representaciones y garantías del vendedor, el régimen de indemnización, las condiciones de cierre y las cláusulas accesorias (non-compete, earn-out, escrow). En el mid-market español, la negociación del SPA suele durar entre 4 y 8 semanas.</p>
</div>

<div class="border border-gray-200 rounded-lg p-6">
<h3 class="text-lg font-semibold text-black mb-3">¿Cuál es la diferencia entre share deal y asset deal?</h3>
<p class="text-gray-700">En un <em>share deal</em> se compran las participaciones sociales o acciones de la empresa, con lo que el comprador adquiere la sociedad completa (con todos sus activos, pasivos, contratos y empleados). En un <em>asset deal</em>, el comprador selecciona los activos que quiere adquirir (y eventualmente los pasivos que quiere asumir), dejando fuera el resto. El share deal es la estructura estándar en el 85% de las operaciones mid-market en España.</p>
</div>

<div class="border border-gray-200 rounded-lg p-6">
<h3 class="text-lg font-semibold text-black mb-3">¿Cuánto dura una operación de compraventa de empresa?</h3>
<p class="text-gray-700">El proceso completo, desde el primer contacto hasta el cierre, dura típicamente 6-12 meses. Las fases son: preparación (1-2 meses), contacto con compradores (1-2 meses), ofertas indicativas (1 mes), management presentations y selección de finalista (1 mes), due diligence (2-3 meses), negociación del SPA y cierre (1-2 meses). Factores como autorizaciones regulatorias, financiación compleja o earn-outs pueden alargar el proceso.</p>
</div>

<div class="border border-gray-200 rounded-lg p-6">
<h3 class="text-lg font-semibold text-black mb-3">¿Necesito abogado para comprar o vender una empresa?</h3>
<p class="text-gray-700">Sí, es absolutamente imprescindible. La compraventa de una empresa implica cuestiones jurídicas complejas en materia mercantil, fiscal, laboral, contractual y regulatoria. Tanto comprador como vendedor necesitan abogados especializados en M&amp;A que revisen y negocien el SPA, además de un asesor M&amp;A que coordine todo el proceso. Los costes legales típicos en una operación mid-market oscilan entre 30.000 y 100.000 EUR por parte.</p>
</div>

</div>

<h2 class="text-2xl font-bold text-black mt-12 mb-6">Fuentes y referencias</h2>

<ul class="list-disc pl-6 mb-8 space-y-2 text-sm text-gray-600">
<li>TTR Data. <em>Informe anual de M&amp;A en España</em>, 2024.</li>
<li>CMS. <em>European M&amp;A Study 2024</em> (mecanismos de precio, limitaciones de responsabilidad).</li>
<li>Real Decreto Legislativo 1/2010, Ley de Sociedades de Capital, arts. 106-112.</li>
<li>Ley 3/2009, de modificaciones estructurales de las sociedades mercantiles.</li>
<li>Código Civil, arts. 1445-1537 (compraventa).</li>
<li>Estatuto de los Trabajadores, art. 44 (subrogación laboral).</li>
</ul>

<div class="bg-black text-white rounded-xl p-8 my-12 text-center">
<p class="text-xl font-semibold mb-4">¿Necesitas asesoramiento en una compraventa de empresa?</p>
<p class="text-gray-300 mb-6">En Capittal Transacciones asesoramos tanto a compradores como a vendedores en operaciones mid-market.</p>
<a href="/contacto" class="inline-block bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">Contacta con nuestro equipo</a>
</div>

<p class="text-sm text-gray-500 mt-8">Última actualización: marzo 2026</p>

</article>',
  'Compraventa de empresas en España: proceso, contrato y claves legales [2026]',
  'Guía sobre la compraventa de empresas: diferencia entre share deal y asset deal, qué incluye el contrato SPA, cláusulas clave, due diligence obligatoria, y pasos del proceso. Con ejemplos y datos de mercado.',
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'M&A',
  ARRAY['compraventa de empresas', 'contrato compraventa empresa', 'compraventa de participaciones', 'SPA contrato', 'share purchase agreement', 'comprar una empresa', 'proceso de compraventa empresarial', 'adquisicion de empresa'],
  10,
  true,
  false,
  'proceso-compraventa-empresas.webp',
  NOW(),
  '[
    {
      "question": "¿Qué es un SPA (Share Purchase Agreement)?",
      "answer": "El SPA es el contrato de compraventa de participaciones o acciones mediante el cual se formaliza la transmisión de la propiedad de una empresa. Es el documento legal central de cualquier operación de M&A. Incluye el precio, las representaciones y garantías del vendedor, el régimen de indemnización, las condiciones de cierre y las cláusulas accesorias (non-compete, earn-out, escrow). En el mid-market español, la negociación del SPA suele durar entre 4 y 8 semanas."
    },
    {
      "question": "¿Cuál es la diferencia entre share deal y asset deal?",
      "answer": "En un share deal se compran las participaciones sociales o acciones de la empresa, con lo que el comprador adquiere la sociedad completa (con todos sus activos, pasivos, contratos y empleados). En un asset deal, el comprador selecciona los activos que quiere adquirir (y eventualmente los pasivos que quiere asumir), dejando fuera el resto. El share deal es la estructura estándar en el 85% de las operaciones mid-market en España."
    },
    {
      "question": "¿Cuánto dura una operación de compraventa de empresa?",
      "answer": "El proceso completo, desde el primer contacto hasta el cierre, dura típicamente 6-12 meses. Las fases son: preparación (1-2 meses), contacto con compradores (1-2 meses), ofertas indicativas (1 mes), management presentations y selección de finalista (1 mes), due diligence (2-3 meses), negociación del SPA y cierre (1-2 meses). Factores como autorizaciones regulatorias, financiación compleja o earn-outs pueden alargar el proceso."
    },
    {
      "question": "¿Necesito abogado para comprar o vender una empresa?",
      "answer": "Sí, es absolutamente imprescindible. La compraventa de una empresa implica cuestiones jurídicas complejas en materia mercantil, fiscal, laboral, contractual y regulatoria. Tanto comprador como vendedor necesitan abogados especializados en M&A que revisen y negocien el SPA, además de un asesor M&A que coordine todo el proceso. Los costes legales típicos en una operación mid-market oscilan entre 30.000 y 100.000 EUR por parte."
    }
  ]'::jsonb
);

-- Re-enable trigger
ALTER TABLE public.blog_posts ENABLE TRIGGER trigger_google_indexing;
