
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const Fase2LuchaContent = () => {
  return (
    <div className="max-w-none">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-black hover:text-black">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/documentacion-ma" className="text-black hover:text-black">Documentación M&A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-black">Fase II: La lucha</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Fase II: La lucha
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          La <strong>Fase II</strong> es donde se libra la verdadera batalla por conseguir la mejor valoración y condiciones. Aquí es donde nuestra experiencia en <strong>negociación estratégica</strong> marca la diferencia.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">El Arte de la Negociación</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          En esta fase crítica, ponemos en práctica todas nuestras habilidades de <strong>negociación estratégica</strong>. No se trata solo de conseguir el mejor precio, sino de estructurar una operación que <strong>maximice el valor total</strong> y minimice los riesgos para nuestro cliente.
        </p>

        <h3 className="text-2xl font-medium text-black mb-8">1. Gestión del Proceso de Ofertas</h3>
        
        <h4 className="text-xl font-medium text-black mb-6">Creación de Tensión Competitiva</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Nuestro enfoque se basa en generar una <strong>tensión competitiva real</strong> entre múltiples interesados, lo que naturalmente eleva las valoraciones y mejora las condiciones de la transacción.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-8">
          <h5 className="text-lg font-medium text-black mb-4">Estrategias de Tensión Competitiva</h5>
          <ul className="list-disc list-inside space-y-2 text-black">
            <li><strong>Proceso estructurado</strong>: Rondas de ofertas bien definidas con plazos claros</li>
            <li><strong>Comunicación estratégica</strong>: Gestión cuidadosa de la información entre partes</li>
            <li><strong>Timing perfecto</strong>: Sincronización de reuniones y deadlines</li>
            <li><strong>Leverage psicológico</strong>: Uso del FOMO (Fear of Missing Out) de manera ética</li>
          </ul>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Gestión de Múltiples Ofertas</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Cuando tenemos múltiples ofertas sobre la mesa, aplicamos una <strong>metodología sistemática</strong> para evaluar no solo el precio, sino también la calidad del comprador, la certeza de cierre y las condiciones estructurales.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Valoración Económica</h5>
            <ul className="text-black text-sm space-y-1">
              <li>• Precio base</li>
              <li>• Estructura de pago</li>
              <li>• Earn-outs potenciales</li>
              <li>• Ajustes de precio</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Calidad del Comprador</h5>
            <ul className="text-black text-sm space-y-1">
              <li>• Solidez financiera</li>
              <li>• Experiencia en M&A</li>
              <li>• Velocidad de ejecución</li>
              <li>• Referencias verificables</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Condiciones Estratégicas</h5>
            <ul className="text-black text-sm space-y-1">
              <li>• Flexibilidad contractual</li>
              <li>• Protección del equipo</li>
              <li>• Visión de futuro</li>
              <li>• Sinergias potenciales</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-medium text-black mb-8">2. Negociación de Términos Clave</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Una vez seleccionada la mejor oferta, comenzamos la <strong>negociación detallada</strong> de todos los términos contractuales. Esta es una fase crítica donde cada cláusula puede tener un impacto significativo en el valor final de la transacción.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Áreas Clave de Negociación</h4>
        
        <div className="space-y-6 mb-8">
          <div className="border-l-4 border-black pl-6">
            <h5 className="font-medium text-black mb-2">Estructura de Precio y Pago</h5>
            <p className="text-black mb-2">Negociación de la estructura óptima de pago, incluyendo cash al cierre, diferidos y earn-outs.</p>
            <ul className="text-black text-sm list-disc list-inside ml-4">
              <li>Maximización del cash al cierre</li>
              <li>Estructuración inteligente de earn-outs</li>
              <li>Protección contra ajustes de precio</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-black pl-6">
            <h5 className="font-medium text-black mb-2">Representaciones y Garantías</h5>
            <p className="text-black mb-2">Equilibrio entre la protección del comprador y la limitación de responsabilidades del vendedor.</p>
            <ul className="text-black text-sm list-disc list-inside ml-4">
              <li>Limitación temporal y cuantitativa</li>
              <li>Carve-outs específicos</li>
              <li>Umbrales de materialidad</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-black pl-6">
            <h5 className="font-medium text-black mb-2">Condiciones de Cierre</h5>
            <p className="text-black mb-2">Minimización de condiciones suspensivas y maximización de la certeza de cierre.</p>
            <ul className="text-black text-sm list-disc list-inside ml-4">
              <li>Due diligence scope limitado</li>
              <li>Condiciones regulatorias claras</li>
              <li>Plazos de cierre definidos</li>
            </ul>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "En la Fase II no solo negociamos precios, <strong>negociamos valor</strong>. Cada término contractual es una oportunidad para proteger y maximizar el resultado final para nuestro cliente."
        </blockquote>

        <h3 className="text-2xl font-medium text-black mb-8">3. Gestión de la Due Diligence</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Durante esta fase, también coordinamos el proceso de <strong>due diligence del comprador</strong>, asegurándonos de que se realice de manera eficiente y que no comprometa la operación ni revele información sensible innecesariamente.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Coordinación del Data Room</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Gestionamos un <strong>data room virtual seguro</strong> donde organizamos toda la información de manera lógica y controlamos el acceso según el progreso de cada potencial comprador en el proceso.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-8">
          <h5 className="text-lg font-medium text-black mb-4">Organización del Data Room</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-medium text-black mb-2">Información Corporativa</h6>
              <p className="text-black text-sm">Estatutos, actas, estructura societaria, governance.</p>
            </div>
            <div>
              <h6 className="font-medium text-black mb-2">Información Financiera</h6>
              <p className="text-black text-sm">Estados financieros, auditorías, proyecciones, KPIs.</p>
            </div>
            <div>
              <h6 className="font-medium text-black mb-2">Información Comercial</h6>
              <p className="text-black text-sm">Contratos clave, clientes, proveedores, pipeline.</p>
            </div>
            <div>
              <h6 className="font-medium text-black mb-2">Información Legal</h6>
              <p className="text-black text-sm">Contratos, litigios, compliance, propiedad intelectual.</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-medium text-black mb-8">4. Tácticas Avanzadas de Negociación</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          En <strong>Capittal</strong>, aplicamos tácticas de negociación sofisticadas desarrolladas a lo largo de años de experiencia en transacciones complejas.
        </p>

        <div className="space-y-4 mb-12">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">🎯 Anclaje Estratégico</h5>
            <p className="text-black text-sm">Establecemos expectativas de valoración desde el primer contacto, creando un marco de referencia favorable.</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">⏰ Gestión del Timing</h5>
            <p className="text-black text-sm">Controlamos el ritmo de la negociación para maximizar nuestra posición y crear urgencia cuando es necesario.</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">🔄 Bundling Inteligente</h5>
            <p className="text-black text-sm">Agrupamos concesiones de manera estratégica para maximizar el valor percibido de nuestras contrapartidas.</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">🛡️ BATNA Development</h5>
            <p className="text-black text-sm">Mantenemos siempre alternativas sólidas que fortalecen nuestra posición negociadora.</p>
          </div>
        </div>

        <h3 className="text-2xl font-medium text-black mb-8">Resultados de la Fase II</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Al completar exitosamente la Fase II, habremos conseguido no solo la <strong>mejor valoración posible</strong>, sino también las <strong>condiciones más favorables</strong> para nuestro cliente, minimizando riesgos y maximizando la certeza de cierre.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Valor Conseguido</h4>
            <ul className="space-y-2 text-black">
              <li>• <strong>Premium sobre valoración inicial</strong>: Típicamente 15-25%</li>
              <li>• <strong>Estructura de pago optimizada</strong>: Maximización de cash al cierre</li>
              <li>• <strong>Condiciones protectoras</strong>: Limitación de responsabilidades</li>
            </ul>
          </div>
          
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Certeza de Cierre</h4>
            <ul className="space-y-2 text-black">
              <li>• <strong>Comprador de calidad</strong>: Solvente y experimentado</li>
              <li>• <strong>Condiciones minimizadas</strong>: Riesgo de ejecución reducido</li>
              <li>• <strong>Plazos definidos</strong>: Cronograma de cierre claro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/fase-1" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Fase 1</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
          <a href="/documentacion-ma/nuestro-metodo" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Nuestro método</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Fase2LuchaContent;
