
-- Disable only the google indexing trigger
ALTER TABLE public.blog_posts DISABLE TRIGGER trigger_google_indexing;

INSERT INTO public.blog_posts (
  slug, title, excerpt, content, featured_image_url, author_name, author_avatar_url,
  category, tags, reading_time, is_published, is_featured, meta_title, meta_description,
  published_at, faq_data
) VALUES (
  'vender-mi-empresa',
  'Cómo vender mi empresa: guía completa paso a paso [2026]',
  'Guía práctica para vender tu empresa en España. Descubre las 7 fases del proceso de venta, cómo prepararte, qué errores evitar, cuánto cuesta y cuánto se tarda.',
  '<!-- Última actualización: marzo 2026 -->
<p class="text-sm text-muted-foreground mb-8">Última actualización: marzo 2026</p>

<p class="text-lg leading-relaxed"><strong>Vender una empresa</strong> es una de las decisiones más trascendentes en la vida profesional de un empresario. El <strong>proceso de venta de una empresa</strong> en España dura típicamente entre 6 y 12 meses, implica a múltiples asesores (financiero, legal, fiscal) y requiere una preparación cuidadosa para maximizar el precio y minimizar los riesgos.</p>

<blockquote class="border-l-4 border-primary pl-6 italic text-slate-600 my-8">
"Vender tu empresa no es simplemente encontrar un comprador y firmar un contrato. Es un proceso estructurado que, bien gestionado, puede suponer una diferencia del 20% al 40% en el precio final respecto a una venta directa sin asesoramiento. Hemos visto empresarios que, por no prepararse, dejaron millones de euros sobre la mesa."
<br><strong>— Samuel Navarro, fundador de Capittal Transacciones</strong>
</blockquote>

<div class="not-prose my-10 rounded-lg border-l-4 border-primary bg-muted/50 p-6">
  <p class="text-4xl font-bold text-primary mb-1">2.800+</p>
  <p class="text-base text-muted-foreground">Operaciones de M&amp;A registradas en España en 2024, según TTR Data. El mid-market (operaciones de 2-50M EUR) representa la mayoría del volumen.</p>
</div>

<h2 id="cuando-vender">Cuándo es el momento adecuado para vender</h2>

<p>No existe un momento universalmente perfecto, pero hay indicadores que señalan ventanas favorables de venta:</p>

<ul>
<li><strong>Ciclo económico favorable.</strong> Los múltiplos de valoración suben en ciclos expansivos y se comprimen en recesiones. Según el Argos Index, los múltiplos mid-market en Europa han oscilado entre 5x y 8x <a href="/recursos/blog/que-es-ebitda">EBITDA</a> en la última década.</li>
<li><strong>Crecimiento y resultados sólidos.</strong> Los compradores valoran la tendencia: una empresa con 3 años consecutivos de crecimiento de EBITDA obtiene múltiplos significativamente superiores a una con resultados planos o decrecientes.</li>
<li><strong>Interés de compradores en el sector.</strong> Cuando hay actividad de consolidación en tu sector (fondos de PE haciendo build-ups, compradores estratégicos buscando adquisiciones), el momento es favorable.</li>
<li><strong>Situación personal del empresario.</strong> Edad, energía, motivación, salud, diversificación patrimonial. Vender cuando todavía tienes energía para gestionar un proceso de 9-12 meses es muy diferente a vender forzado por circunstancias.</li>
</ul>

<h2 id="fases-proceso-venta">Las 7 fases del proceso de venta de una empresa</h2>

<h3 id="fase-1">Fase 1: Preparación y análisis previo (1-2 meses)</h3>

<p>La fase de preparación es crítica y es donde más valor puede añadir un asesor M&amp;A. Incluye:</p>

<ul>
<li><strong><a href="/recursos/blog/valoracion-de-empresas">Valoración indicativa</a>:</strong> Análisis de múltiplos sectoriales, benchmarking con transacciones comparables, y estimación de un rango de precio realista.</li>
<li><strong>Vendor Due Diligence (VDD):</strong> Revisión interna anticipada de la empresa para detectar y resolver problemas antes de que los encuentre el comprador. Esto evita sorpresas que puedan tumbar la operación.</li>
<li><strong>Cuaderno de venta (Information Memorandum):</strong> Documento confidencial de 30-50 páginas que presenta la empresa al mercado: historia, sector, financieros, equipo, oportunidades de crecimiento.</li>
<li><strong>Identificación de compradores:</strong> Longlist de 30-80 compradores potenciales (estratégicos + financieros), filtrados por capacidad, encaje estratégico e historial de adquisiciones.</li>
</ul>

<h3 id="fase-2">Fase 2: Contacto con compradores y NDA (1-2 meses)</h3>

<p>El asesor contacta a los compradores potenciales de forma confidencial (sin revelar el nombre de la empresa) mediante un blind profile o teaser. Los interesados firman un <a href="/recursos/blog/que-es-un-nda">NDA (acuerdo de confidencialidad)</a> antes de recibir el Information Memorandum.</p>

<div class="not-prose my-10 rounded-lg border-l-4 border-primary bg-muted/50 p-6">
  <p class="text-4xl font-bold text-primary mb-1">25-40%</p>
  <p class="text-base text-muted-foreground">Porcentaje medio de compradores contactados que firman NDA y solicitan información, en procesos competitivos mid-market bien gestionados (dato basado en la experiencia de Capittal Transacciones).</p>
</div>

<h3 id="fase-3">Fase 3: Recepción y análisis de ofertas indicativas (1 mes)</h3>

<p>Los compradores que han revisado el Information Memorandum presentan ofertas indicativas (non-binding offers o IOIs). Estas incluyen un rango de precio, estructura propuesta (pago al cierre, earn-out, etc.), y condiciones principales. El vendedor, con su asesor, analiza y compara las ofertas.</p>

<h3 id="fase-4">Fase 4: Selección de candidatos y management presentations (1 mes)</h3>

<p>Se seleccionan 2-4 compradores finalistas que visitan la empresa, conocen al equipo directivo y profundizan en el negocio. Estas reuniones son cruciales: el comprador evalúa no solo los números sino las personas, la cultura y las sinergias.</p>

<h3 id="fase-5">Fase 5: Due diligence del comprador (2-3 meses)</h3>

<p>El comprador (o compradores en paralelo, dependiendo de la estrategia) realiza una <a href="/recursos/blog/que-es-due-diligence"><strong>due diligence</strong></a> completa: financiera, fiscal, legal, laboral, medioambiental, tecnológica. Se habilita un data room virtual con cientos de documentos. Es la fase más intensa del proceso.</p>

<h3 id="fase-6">Fase 6: Negociación del SPA y cierre (1-2 meses)</h3>

<p>Se negocia el contrato de compraventa de participaciones (Share Purchase Agreement o SPA), que incluye: precio y mecanismo de ajuste, representaciones y garantías (reps &amp; warranties), cláusulas de indemnización, condiciones suspensivas, pacto de no competencia, y régimen de permanencia si aplica.</p>

<h3 id="fase-7">Fase 7: Transición post-cierre (3-12 meses)</h3>

<p>Periodo de transición donde el vendedor acompaña al comprador para garantizar la continuidad del negocio. Puede ser remunerado (como directivo o consultor) o no, y su duración depende de la dependencia del empresario respecto al negocio.</p>

<h2 id="cuanto-cuesta-vender">Cuánto cuesta vender una empresa</h2>

<div class="not-prose my-10 overflow-x-auto">
<table class="w-full text-sm border-collapse">
  <thead>
    <tr class="bg-muted">
      <th class="text-left p-3 font-semibold border-b">Concepto</th>
      <th class="text-left p-3 font-semibold border-b">Coste típico</th>
      <th class="text-left p-3 font-semibold border-b">Observaciones</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-3 border-b">Asesor M&amp;A (retainer)</td>
      <td class="p-3 border-b">3.000-8.000 €/mes</td>
      <td class="p-3 border-b">Honorarios mensuales durante 8-12 meses</td>
    </tr>
    <tr class="bg-muted/30">
      <td class="p-3 border-b">Asesor M&amp;A (success fee)</td>
      <td class="p-3 border-b">1,5% - 5% del precio</td>
      <td class="p-3 border-b">Cobrado al cierre, se descuenta el retainer</td>
    </tr>
    <tr>
      <td class="p-3 border-b">Abogados (vendedor)</td>
      <td class="p-3 border-b">30.000-80.000 €</td>
      <td class="p-3 border-b">Negociación SPA, fiscalidad, estructura</td>
    </tr>
    <tr class="bg-muted/30">
      <td class="p-3 border-b">Vendor Due Diligence</td>
      <td class="p-3 border-b">15.000-40.000 €</td>
      <td class="p-3 border-b">Opcional pero muy recomendable</td>
    </tr>
    <tr>
      <td class="p-3 border-b">Fiscalidad (IRPF/IS)</td>
      <td class="p-3 border-b">19-30% sobre plusvalía</td>
      <td class="p-3 border-b">Depende de si vende persona física o holding</td>
    </tr>
    <tr class="bg-muted/30 font-semibold">
      <td class="p-3 border-b">Total estimado</td>
      <td class="p-3 border-b">5-8% del precio de venta</td>
      <td class="p-3 border-b">Incluyendo todos los costes transaccionales</td>
    </tr>
  </tbody>
</table>
</div>

<h2 id="errores-comunes">Errores más comunes al vender una empresa</h2>

<ol>
<li><strong>Vender sin asesor M&amp;A.</strong> Según datos de la IBBA (International Business Brokers Association), las empresas vendidas con asesor profesional obtienen entre un 10% y un 25% más de precio. El coste del asesor se paga solo con creces.</li>
<li><strong>No preparar la empresa para la venta.</strong> Problemas contables, litigios pendientes, dependencia del fundador, clientes concentrados: todo lo que no se resuelve antes aparece en <a href="/recursos/blog/que-es-due-diligence">due diligence</a> y reduce el precio o tumba la operación.</li>
<li><strong>Negociar con un solo comprador.</strong> La competencia entre compradores es la mejor palanca de precio. Un proceso competitivo bien gestionado con 3-5 ofertas genera tensión competitiva que beneficia al vendedor.</li>
<li><strong>Confundir Enterprise Value con lo que vas a cobrar.</strong> Si tu empresa vale 10M EUR de EV pero tiene 3M de deuda, tu Equity Value es 7M. Muchos empresarios se decepcionan por no entender esta distinción.</li>
<li><strong>No gestionar la confidencialidad.</strong> Si empleados, clientes o proveedores se enteran prematuramente de que la empresa está en venta, puede desestabilizar el negocio y destruir valor.</li>
</ol>

<h2 id="preguntas-frecuentes">Preguntas frecuentes sobre la venta de empresas</h2>

<h3>¿Cuánto tiempo se tarda en vender una empresa?</h3>
<p>El proceso completo, desde la preparación hasta el cierre, dura típicamente entre 6 y 12 meses en el mid-market español. Un proceso competitivo bien gestionado suele cerrar en 8-10 meses. Factores que alargan el proceso: sector regulado, autorizaciones de competencia, earn-out complejo, o comprador institucional con comités de inversión lentos.</p>

<h3>¿Puedo vender mi empresa sin que se enteren mis empleados?</h3>
<p>Sí, y es lo recomendable en las fases iniciales. El proceso se gestiona con estricta confidencialidad: los compradores firman <a href="/recursos/blog/que-es-un-nda">NDA</a>, las presentaciones se hacen fuera de las instalaciones de la empresa, y el personal solo se informa en fases avanzadas (normalmente tras la firma del SPA o poco antes del cierre). Un buen asesor M&amp;A gestiona la confidencialidad como una prioridad absoluta.</p>

<h3>¿Qué impuestos pago al vender mi empresa?</h3>
<p>Depende de la estructura. Si vendes como persona física, la plusvalía tributa en la base del ahorro del IRPF a tipos del 19% al 30% (para plusvalías superiores a 300.000 EUR, tipo del 30%). Si vendes a través de una sociedad holding que cumpla los requisitos del artículo 21 de la Ley del Impuesto sobre Sociedades, la plusvalía puede quedar exenta en un 95%. La planificación fiscal previa es fundamental y debe hacerse con suficiente antelación.</p>

<h3>¿Qué es un earn-out?</h3>
<p>Un earn-out es un componente variable del precio de venta que se paga al vendedor si la empresa alcanza determinados objetivos financieros después del cierre (típicamente vinculados a <a href="/recursos/blog/que-es-ebitda">EBITDA</a> o facturación). Es un mecanismo habitual para cerrar la brecha entre las expectativas de precio del vendedor y la valoración del comprador. En el mid-market español, los earn-outs representan típicamente entre el 10% y el 30% del precio total.</p>

<h2 id="fuentes">Fuentes y referencias</h2>

<ul>
<li>TTR Data. <em>Informe anual de M&amp;A en España</em>, 2024.</li>
<li>Argos Index, Epsilon Research. <em>Mid-Market Valuation Multiples</em>, Q4 2024.</li>
<li>IBBA (International Business Brokers Association). <em>Market Pulse Survey</em>, 2024.</li>
<li>ASCRI. <em>Informe anual de Capital Privado en España</em>, 2024.</li>
<li>Ley 27/2014, del Impuesto sobre Sociedades, arts. 21 y 76-89.</li>
<li>Ley 35/2006, del IRPF, art. 46 y 66.2.</li>
</ul>

<div class="not-prose my-12 rounded-xl border-2 border-primary bg-primary/5 p-8 text-center">
  <h3 class="text-2xl font-bold mb-3">¿Estás pensando en vender tu empresa?</h3>
  <p class="text-muted-foreground mb-6 max-w-2xl mx-auto">En Capittal Transacciones asesoramos a empresarios en todo el proceso de venta, desde la valoración hasta el cierre. Solicita una consulta confidencial sin compromiso.</p>
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <a href="/#contacto" class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors">Solicitar consulta gratuita</a>
    <a href="/servicios/venta-de-empresas" class="inline-flex items-center justify-center rounded-md border border-primary text-primary px-6 py-3 font-medium hover:bg-primary/10 transition-colors">Ver servicio de venta</a>
  </div>
</div>',
  NULL,
  'Samuel Navarro',
  'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
  'M&A',
  ARRAY['vender mi empresa', 'como vender mi empresa', 'vender empresa', 'venta de empresas', 'proceso de venta de empresa', 'vender mi negocio', 'pasos para vender una empresa', 'cuanto vale mi empresa para vender', 'quiero vender mi empresa'],
  15,
  true,
  true,
  'Cómo vender mi empresa: guía completa paso a paso [2026]',
  'Guía práctica para vender tu empresa en España. Descubre las 7 fases del proceso de venta, cómo prepararte, qué errores evitar, cuánto cuesta y cuánto se tarda. Con datos de mercado y consejos de asesores M&A.',
  NOW(),
  '[
    {
      "question": "¿Cuánto tiempo se tarda en vender una empresa?",
      "answer": "El proceso completo, desde la preparación hasta el cierre, dura típicamente entre 6 y 12 meses en el mid-market español. Un proceso competitivo bien gestionado suele cerrar en 8-10 meses. Factores que alargan el proceso: sector regulado, autorizaciones de competencia, earn-out complejo, o comprador institucional con comités de inversión lentos."
    },
    {
      "question": "¿Puedo vender mi empresa sin que se enteren mis empleados?",
      "answer": "Sí, y es lo recomendable en las fases iniciales. El proceso se gestiona con estricta confidencialidad: los compradores firman NDA, las presentaciones se hacen fuera de las instalaciones de la empresa, y el personal solo se informa en fases avanzadas (normalmente tras la firma del SPA o poco antes del cierre)."
    },
    {
      "question": "¿Qué impuestos pago al vender mi empresa?",
      "answer": "Depende de la estructura. Si vendes como persona física, la plusvalía tributa en la base del ahorro del IRPF a tipos del 19% al 30%. Si vendes a través de una sociedad holding que cumpla los requisitos del artículo 21 de la Ley del Impuesto sobre Sociedades, la plusvalía puede quedar exenta en un 95%. La planificación fiscal previa es fundamental."
    },
    {
      "question": "¿Qué es un earn-out?",
      "answer": "Un earn-out es un componente variable del precio de venta que se paga al vendedor si la empresa alcanza determinados objetivos financieros después del cierre (típicamente vinculados a EBITDA o facturación). En el mid-market español, los earn-outs representan típicamente entre el 10% y el 30% del precio total."
    }
  ]'::jsonb
);

-- Re-enable trigger
ALTER TABLE public.blog_posts ENABLE TRIGGER trigger_google_indexing;
