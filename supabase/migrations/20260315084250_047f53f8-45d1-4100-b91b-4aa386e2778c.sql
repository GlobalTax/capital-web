-- Temporarily disable the google indexing trigger
ALTER TABLE public.blog_posts DISABLE TRIGGER trigger_google_indexing;

-- Insert the EBITDA article
INSERT INTO public.blog_posts (
  title, slug, excerpt, content, author_name, category, tags, reading_time,
  is_published, is_featured, meta_title, meta_description, published_at, faq_data
) VALUES (
  'Qué es el EBITDA: definición, fórmula y ejemplo práctico [2026]',
  'que-es-ebitda',
  'El EBITDA es el beneficio bruto de explotación. Guía completa con fórmula, ejemplo práctico, márgenes por sector y múltiplos EV/EBITDA en España.',
  '<p>El <strong>EBITDA</strong> (<em>Earnings Before Interest, Taxes, Depreciation and Amortization</em>) es el beneficio de una empresa antes de descontar los intereses de la deuda, los impuestos, las depreciaciones y las amortizaciones. En castellano se traduce como <strong>beneficio bruto de explotación</strong> y representa la capacidad de una empresa para generar dinero con su actividad ordinaria, independientemente de su estructura financiera o su régimen fiscal.</p>

<p>Para un empresario, el EBITDA responde a una pregunta esencial: <strong>¿cuánto dinero genera mi negocio por sí mismo?</strong> Al eliminar partidas que dependen de decisiones financieras (cómo te financias), fiscales (dónde tributas) y contables (cómo amortizas), el EBITDA permite comparar empresas de distintos tamaños, sectores y países en igualdad de condiciones.</p>

<div style="background:#f8fafc;border-left:4px solid #0f172a;padding:24px 28px;margin:32px 0;border-radius:0 8px 8px 0;">
<p style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:4px;">87%</p>
<p style="font-size:1rem;color:#475569;">de las operaciones M&amp;A en el mid-market europeo utilizan el EBITDA como métrica principal de valoración, según el informe <em>Argos Index</em> de Epsilon Research (T4 2024).</p>
</div>

<p>En el contexto de operaciones de <a href="/recursos/blog/fusiones-y-adquisiciones">fusiones y adquisiciones</a>, el EBITDA es probablemente la métrica más utilizada para valorar empresas. Cuando un comprador o un fondo de <a href="/recursos/blog/que-es-private-equity">private equity</a> analiza una empresa, lo primero que mira es su EBITDA, porque a partir de él se aplican los múltiplos de valoración que determinan el precio de compraventa.</p>

<blockquote>
<p>«El EBITDA es el punto de partida de cualquier conversación de precio en M&amp;A. Pero lo que realmente determina el valor es el EBITDA ajustado: ahí es donde se juega la negociación.»</p>
<p><strong>— Samuel Navarro</strong>, socio fundador de Capittal Transacciones</p>
</blockquote>

<h2>Para qué sirve el EBITDA: 3 usos fundamentales</h2>

<p>El EBITDA tiene tres utilidades fundamentales que todo empresario, director financiero o inversor debería conocer.</p>

<h3>1. Herramienta de valoración de empresas</h3>
<p>El método más común para valorar una empresa en el mid-market es aplicar un múltiplo sobre el EBITDA. Según datos de <strong>Dealsuite</strong> correspondientes al primer semestre de 2025, la mediana del múltiplo EV/EBITDA en España se situó en <strong>5,4x</strong> para operaciones entre 1 y 20 millones de euros de Enterprise Value. Si tu empresa genera un EBITDA de 2 millones de euros, el valor orientativo sería de aproximadamente <strong>10,8 millones de euros</strong>.</p>

<h3>2. Indicador de rentabilidad operativa</h3>
<p>Al aislar el resultado de la actividad del negocio, puedes comparar tu rentabilidad con la de competidores directos o con la media del sector, sin que distorsionen factores como el nivel de endeudamiento o las decisiones de amortización.</p>

<h3>3. Proxy de generación de caja</h3>
<p>Aunque el EBITDA no es exactamente el flujo de caja libre (no recoge las inversiones en capital ni las variaciones de circulante), sí da una primera aproximación de cuánto efectivo produce el negocio. Esto resulta crucial para evaluar la capacidad de repago de deuda en operaciones apalancadas (LBO).</p>

<h2>Fórmula del EBITDA: cómo se calcula paso a paso</h2>

<p>La fórmula del EBITDA se puede plantear de dos maneras equivalentes que deben dar siempre el mismo resultado.</p>

<table>
<thead><tr><th>Método</th><th>Fórmula</th><th>Punto de partida</th></tr></thead>
<tbody>
<tr><td>Directo (bottom-up)</td><td>Beneficio Neto + Impuestos + Intereses + Depreciaciones + Amortizaciones</td><td>Última línea P&amp;G</td></tr>
<tr><td>Indirecto (top-down)</td><td>Ingresos de explotación − Gastos operativos (sin D&amp;A)</td><td>Primera línea P&amp;G</td></tr>
</tbody>
</table>

<p>El método directo parte del beneficio neto (la última línea de la cuenta de resultados) y va sumando las partidas que queremos excluir. El método indirecto parte de los ingresos operativos y resta solo los gastos operativos en efectivo. Para calcularlo correctamente, necesitas la cuenta de pérdidas y ganancias de tu empresa, disponible en las cuentas anuales depositadas en el Registro Mercantil.</p>

<h2>Ejemplo práctico de cálculo del EBITDA</h2>

<p>Supongamos una empresa industrial española con los siguientes datos anuales:</p>

<table>
<thead><tr><th>Concepto</th><th>Importe</th></tr></thead>
<tbody>
<tr><td>Ingresos de explotación</td><td>8.000.000 €</td></tr>
<tr><td>Coste de ventas</td><td>−4.800.000 €</td></tr>
<tr><td>Gastos de personal</td><td>−1.200.000 €</td></tr>
<tr><td>Otros gastos de explotación</td><td>−600.000 €</td></tr>
<tr><td>Depreciaciones y amortizaciones</td><td>−400.000 €</td></tr>
<tr><td>Gastos financieros (intereses)</td><td>−150.000 €</td></tr>
<tr><td>Impuesto sobre sociedades</td><td>−212.500 €</td></tr>
<tr><td><strong>BENEFICIO NETO</strong></td><td><strong>637.500 €</strong></td></tr>
</tbody>
</table>

<p><strong>Cálculo top-down:</strong> EBITDA = 8.000.000 − 4.800.000 − 1.200.000 − 600.000 = <strong>1.400.000 €</strong></p>
<p><strong>Verificación bottom-up:</strong> EBITDA = 637.500 + 212.500 + 150.000 + 400.000 = <strong>1.400.000 €</strong></p>

<p>Con un múltiplo medio del sector industrial en España de entre 5x y 7x (según el informe <em>Argos Index</em> Epsilon Research, T4 2024), esta empresa tendría un <strong>Enterprise Value orientativo de entre 7 y 9,8 millones de euros</strong>.</p>

<h2>Diferencia entre EBITDA, EBIT y beneficio neto</h2>

<p>El EBITDA, el EBIT y el beneficio neto miden la rentabilidad a tres niveles distintos de la cuenta de resultados. Entender la diferencia es fundamental para interpretar correctamente la <a href="/servicios/valoracion-empresas">valoración de una empresa</a>.</p>

<table>
<thead><tr><th>Métrica</th><th>Qué incluye</th><th>Qué excluye</th><th>Uso principal</th></tr></thead>
<tbody>
<tr><td>Beneficio neto</td><td>Todos los gastos</td><td>Nada</td><td>Resultado final para accionistas</td></tr>
<tr><td>EBIT</td><td>Gastos operativos + D&amp;A</td><td>Intereses + Impuestos</td><td>Comparar empresas con distinta deuda</td></tr>
<tr><td>EBITDA</td><td>Solo gastos operativos cash</td><td>Intereses + Impuestos + D&amp;A</td><td>Valoración M&amp;A, comparación sectorial</td></tr>
</tbody>
</table>

<p>En la práctica, los compradores sofisticados no se quedan en el EBITDA reportado. Calculan el <strong>EBITDA ajustado o normalizado</strong>, eliminando partidas extraordinarias (litigios, indemnizaciones, gastos no recurrentes) y añadiendo los ahorros que el comprador espera obtener (sinergias). Este EBITDA ajustado es el que realmente se multiplica para fijar el precio.</p>

<blockquote>
<p>«Dos empresas con el mismo EBITDA reportado pueden tener valoraciones muy distintas. La clave está en los ajustes: el salario de mercado del propietario, los gastos personales imputados a la empresa, los alquileres a partes vinculadas... Ahí se gana o se pierde un 20% del precio.»</p>
<p><strong>— Samuel Navarro</strong>, Capittal Transacciones</p>
</blockquote>

<h2>Qué es un buen EBITDA: márgenes por sector en España</h2>

<p>No existe un EBITDA «bueno» en términos absolutos: depende del sector, el tamaño de la empresa y su fase de crecimiento. Lo que sí se puede medir es el <strong>margen EBITDA</strong>, que expresa el EBITDA como porcentaje de los ingresos.</p>

<table>
<thead><tr><th>Sector</th><th>Margen EBITDA típico</th><th>Fuente</th></tr></thead>
<tbody>
<tr><td>Software / SaaS</td><td>20% − 40%</td><td>Dealsuite Mid-Market Monitor 2025</td></tr>
<tr><td>Industria manufacturera</td><td>8% − 15%</td><td>Banco de España, Central de Balances 2024</td></tr>
<tr><td>Distribución y retail</td><td>3% − 8%</td><td>Banco de España, Central de Balances 2024</td></tr>
<tr><td>Servicios profesionales</td><td>15% − 25%</td><td>Dealsuite Mid-Market Monitor 2025</td></tr>
<tr><td>Seguridad privada</td><td>10% − 18%</td><td>Análisis interno Capittal Transacciones</td></tr>
<tr><td>Alimentación y bebidas</td><td>8% − 14%</td><td>FIAB / Informe sectorial 2024</td></tr>
</tbody>
</table>

<p>Para una operación de <a href="/servicios/venta-de-empresas">compraventa de empresas</a>, lo que importa no es solo el margen actual sino su tendencia. Un EBITDA creciente durante los últimos tres a cinco años envía una señal muy positiva al comprador. Un EBITDA estancado o decreciente, aunque sea elevado en términos absolutos, genera preocupación y reduce los múltiplos que el mercado está dispuesto a pagar.</p>

<div style="background:#f8fafc;border-left:4px solid #0f172a;padding:24px 28px;margin:32px 0;border-radius:0 8px 8px 0;">
<p style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:4px;">5,4x</p>
<p style="font-size:1rem;color:#475569;">Mediana del múltiplo EV/EBITDA en España para operaciones mid-market (1-20M € EV), según Dealsuite H1 2025.</p>
</div>

<h2>Múltiplos EV/EBITDA por sector: cómo valorar tu empresa</h2>

<p>El múltiplo EV/EBITDA es la ratio más utilizada en el mid-market para valorar empresas. Se calcula dividiendo el Enterprise Value (valor de empresa) entre el EBITDA. Cuanto mayor es el múltiplo, mayor es la valoración relativa.</p>

<h3>Factores que incrementan el múltiplo</h3>
<p>Los factores que incrementan el múltiplo incluyen: ingresos recurrentes (modelo SaaS o contratos de largo plazo), posición de liderazgo en nicho, equipo directivo autónomo que no depende del fundador, márgenes superiores a la media sectorial, y potencial de crecimiento demostrable con datos históricos.</p>

<h3>Factores que reducen el múltiplo</h3>
<p>Los factores que reducen el múltiplo incluyen: dependencia excesiva del propietario (key-man risk), concentración de clientes (un cliente supone más del 20% de la facturación), sector en declive estructural, contingencias legales o fiscales pendientes, y falta de sistemas de gestión (ERP, CRM) implantados.</p>

<table>
<thead><tr><th>Sector (España, mid-market)</th><th>Rango múltiplo EV/EBITDA</th><th>Fuente</th></tr></thead>
<tbody>
<tr><td>Tecnología / SaaS</td><td>8x − 15x</td><td>TTR Data 2024-2025</td></tr>
<tr><td>Industria manufacturera</td><td>4x − 7x</td><td>Argos Index T4 2024</td></tr>
<tr><td>Servicios empresariales</td><td>5x − 8x</td><td>Dealsuite H1 2025</td></tr>
<tr><td>Salud y farmacia</td><td>7x − 12x</td><td>TTR Data 2024-2025</td></tr>
<tr><td>Seguridad privada</td><td>5x − 9x</td><td>Análisis Capittal Transacciones</td></tr>
<tr><td>Alimentación</td><td>5x − 8x</td><td>Argos Index T4 2024</td></tr>
</tbody>
</table>

<h2>Limitaciones del EBITDA: lo que esta métrica no te dice</h2>

<p>Pese a su utilidad, el EBITDA tiene limitaciones importantes que todo empresario debe conocer antes de tomar decisiones basadas exclusivamente en esta métrica.</p>

<h3>No refleja las necesidades de inversión (CAPEX)</h3>
<p>Una empresa que necesita reinvertir constantemente en maquinaria tendrá menos caja disponible de lo que su EBITDA sugiere. Según un análisis de <strong>McKinsey &amp; Company</strong> (2023), las empresas industriales con CAPEX de mantenimiento superior al 30% del EBITDA generan un flujo de caja libre significativamente inferior al que su EBITDA sugiere, lo que puede reducir su valoración efectiva entre un 15% y un 25%.</p>

<h3>No captura las variaciones de circulante</h3>
<p>Si tu empresa crece rápidamente y necesita financiar más inventario o conceder más plazo de cobro a clientes, el efectivo real será inferior al EBITDA.</p>

<h3>Puede ser manipulado</h3>
<p>Decisiones contables como capitalizar gastos que deberían ser corrientes, o clasificar gastos recurrentes como extraordinarios, pueden inflar artificialmente el EBITDA. Un buen asesor de M&amp;A identificará estos ajustes durante la <a href="/recursos/blog/que-es-due-diligence">due diligence</a>.</p>

<blockquote>
<p>«En Capittal siempre recomendamos analizar el EBITDA junto con el flujo de caja libre, la deuda neta, la ratio de conversión de caja y el CAPEX de mantenimiento. El EBITDA solo cuenta parte de la historia.»</p>
<p><strong>— Samuel Navarro</strong>, Capittal Transacciones</p>
</blockquote>

<h2>EBITDA ajustado: qué es y cómo se calcula</h2>

<p>El <strong>EBITDA ajustado</strong> (o normalizado) es el EBITDA contable corregido para reflejar la capacidad de generación de beneficio recurrente y sostenible de la empresa. Es la cifra que realmente se usa en las negociaciones de precio en operaciones de M&amp;A.</p>

<p>Los ajustes más habituales en el mid-market español son:</p>

<table>
<thead><tr><th>Tipo de ajuste</th><th>Ejemplo</th><th>Efecto en EBITDA</th></tr></thead>
<tbody>
<tr><td>Salario de mercado del propietario</td><td>Propietario cobra 40K pero el mercado pagaría 120K</td><td>Reduce EBITDA en 80K</td></tr>
<tr><td>Gastos personales en la empresa</td><td>Vehículo, viajes y seguros del socio</td><td>Incrementa EBITDA</td></tr>
<tr><td>Alquiler a partes vinculadas</td><td>Nave propiedad del socio alquilada por debajo de mercado</td><td>Reduce EBITDA al ajustar a mercado</td></tr>
<tr><td>Gastos no recurrentes</td><td>Indemnización por despido puntual, litigio</td><td>Incrementa EBITDA</td></tr>
<tr><td>Ingresos no recurrentes</td><td>Subvención extraordinaria, venta de activo</td><td>Reduce EBITDA</td></tr>
</tbody>
</table>

<h2>Preguntas frecuentes sobre el EBITDA</h2>

<h3>¿El EBITDA es lo mismo que el beneficio?</h3>
<p>No. El beneficio neto es el resultado final tras todos los gastos (intereses, impuestos, depreciaciones y amortizaciones). El EBITDA excluye estas cuatro partidas para mostrar la rentabilidad puramente operativa. Son métricas complementarias: el beneficio neto refleja lo que queda para los accionistas, mientras que el EBITDA refleja la capacidad de generación de caja del negocio.</p>

<h3>¿Un EBITDA negativo significa que la empresa va mal?</h3>
<p>No necesariamente. Startups en fase de crecimiento acelerado pueden tener EBITDA negativo mientras invierten en captar mercado (ej. empresas SaaS quemando caja para adquirir usuarios). Sin embargo, para empresas maduras con más de 5 años de actividad, un EBITDA negativo sostenido durante más de 2 ejercicios es una señal preocupante que indica que el modelo de negocio no genera valor operativo.</p>

<h3>¿Cómo se calcula el EBITDA ajustado?</h3>
<p>Se parte del EBITDA contable y se eliminan partidas no recurrentes o no representativas: indemnizaciones por despido, gastos de litigios, el salario de mercado del propietario (si cobra por encima o por debajo del mercado), alquileres a partes vinculadas a precio no de mercado, y gastos personales imputados a la sociedad. En España, los ajustes más comunes en pymes afectan al salario del propietario y a los gastos de vehículos y viajes personales.</p>

<h3>¿El EBITDA aparece en las cuentas anuales?</h3>
<p>No directamente. El EBITDA no es una magnitud contable oficial bajo el Plan General Contable español ni bajo las NIIF (IFRS). Es una magnitud calculada a partir de los datos de la cuenta de pérdidas y ganancias. Sin embargo, muchas empresas lo reportan voluntariamente en sus informes de gestión, y la CNMV exige su <em>disclosure</em> en determinados supuestos para empresas cotizadas.</p>

<h3>¿Qué múltiplo de EBITDA se paga por una empresa en España?</h3>
<p>Depende del sector, tamaño y momento de mercado. Según datos de Dealsuite del primer semestre de 2025, la mediana en el mid-market español (operaciones de 1 a 20 millones de euros de Enterprise Value) se sitúa en <strong>5,4x EBITDA</strong>. Empresas tecnológicas y de salud pueden alcanzar 8-15x, mientras que sectores maduros como la manufactura se mueven entre 4x y 7x.</p>

<h2>Fuentes y referencias</h2>

<ul>
<li>Argos Index, Epsilon Research. <em>Mid-Market Valuation Multiples</em>, T4 2024.</li>
<li>Dealsuite. <em>Mid-Market Monitor España</em>, H1 2025.</li>
<li>Banco de España. <em>Central de Balances</em>, datos anuales 2024.</li>
<li>TTR Data. <em>Transacciones M&amp;A en España</em>, informe anual 2024-2025.</li>
<li>McKinsey &amp; Company. <em>Valuation: Measuring and Managing the Value of Companies</em>, 7ª ed.</li>
<li>CNMV. <em>Guía sobre información financiera alternativa (APMs)</em>, actualizada 2024.</li>
</ul>

<div style="background:#f0f9ff;border:2px solid #0f172a;border-radius:12px;padding:32px;margin:40px 0;text-align:center;">
<h3 style="margin-bottom:12px;">¿Quieres saber cuánto vale tu empresa?</h3>
<p style="margin-bottom:20px;">Solicita una valoración confidencial basada en tu EBITDA. Nuestro equipo de expertos en M&amp;A te ayudará a entender el valor real de tu negocio.</p>
<a href="/#contacto" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Contacta con nuestro equipo</a>
</div>

<p style="color:#64748b;font-size:0.875rem;margin-top:32px;"><em>Última actualización: marzo 2026</em></p>',
  'Samuel Navarro',
  'Valoración',
  ARRAY['ebitda', 'ebitda que es', 'ebitda formula', 'ebitda ajustado', 'multiplo ebitda', 'margen ebitda', 'valoracion empresas', 'm&a'],
  12,
  true,
  false,
  'Qué es el EBITDA: definición, fórmula y ejemplo práctico [2026]',
  'El EBITDA es el beneficio antes de intereses, impuestos, depreciaciones y amortizaciones. Descubre cómo se calcula, para qué sirve en M&A y qué múltiplos aplica tu sector. Con ejemplo, tabla comparativa y calculadora.',
  NOW(),
  '[{"question":"¿El EBITDA es lo mismo que el beneficio?","answer":"No. El beneficio neto es el resultado final tras todos los gastos (intereses, impuestos, depreciaciones y amortizaciones). El EBITDA excluye estas cuatro partidas para mostrar la rentabilidad puramente operativa. Son métricas complementarias: el beneficio neto refleja lo que queda para los accionistas, mientras que el EBITDA refleja la capacidad de generación de caja del negocio."},{"question":"¿Un EBITDA negativo significa que la empresa va mal?","answer":"No necesariamente. Startups en fase de crecimiento acelerado pueden tener EBITDA negativo mientras invierten en captar mercado. Sin embargo, para empresas maduras con más de 5 años de actividad, un EBITDA negativo sostenido durante más de 2 ejercicios es una señal preocupante que indica que el modelo de negocio no genera valor operativo."},{"question":"¿Cómo se calcula el EBITDA ajustado?","answer":"Se parte del EBITDA contable y se eliminan partidas no recurrentes o no representativas: indemnizaciones por despido, gastos de litigios, el salario de mercado del propietario (si cobra por encima o por debajo del mercado), alquileres a partes vinculadas a precio no de mercado, y gastos personales imputados a la sociedad. En España, los ajustes más comunes en pymes afectan al salario del propietario y a los gastos de vehículos y viajes personales."},{"question":"¿El EBITDA aparece en las cuentas anuales?","answer":"No directamente. El EBITDA no es una magnitud contable oficial bajo el Plan General Contable español ni bajo las NIIF (IFRS). Es una magnitud calculada a partir de los datos de la cuenta de pérdidas y ganancias. Sin embargo, muchas empresas lo reportan voluntariamente en sus informes de gestión, y la CNMV exige su disclosure en determinados supuestos para empresas cotizadas."},{"question":"¿Qué múltiplo de EBITDA se paga por una empresa en España?","answer":"Depende del sector, tamaño y momento de mercado. Según datos de Dealsuite del primer semestre de 2025, la mediana en el mid-market español (operaciones de 1 a 20 millones de euros de Enterprise Value) se sitúa en 5,4x EBITDA. Empresas tecnológicas y de salud pueden alcanzar 8-15x, mientras que sectores maduros como la manufactura se mueven entre 4x y 7x."}]'::jsonb
);

-- Re-enable the trigger
ALTER TABLE public.blog_posts ENABLE TRIGGER trigger_google_indexing;