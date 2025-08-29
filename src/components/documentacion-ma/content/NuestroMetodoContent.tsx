
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const NuestroMetodoContent = () => {
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
            <BreadcrumbPage className="text-black">Nuestro método</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-4xl font-semibold text-slate-900 mb-6 leading-tight">
          Metodología Integral M&A
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl font-light">
          En <strong>Capittal</strong>, aplicamos una metodología integral que combina <strong>análisis riguroso</strong>, <strong>experiencia sectorial</strong> y <strong>enfoque personalizado</strong> para maximizar el valor en cada transacción de M&A.
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Actualizado</span>
          <span>Diciembre 29, 2024</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-semibold text-slate-900 mb-8">Los 4 Pilares de Nuestra Metodología</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12 not-prose">
          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-slate-600 font-semibold">01</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Análisis Estratégico</h3>
            <p className="text-slate-600 text-sm">Diagnóstico profundo del negocio, mercado y oportunidades de valor</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-slate-600 font-semibold">02</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Valoración Rigurosa</h3>
            <p className="text-slate-600 text-sm">Múltiples metodologías para establecer valor objetivo y defendible</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-slate-600 font-semibold">03</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Ejecución Impecable</h3>
            <p className="text-slate-600 text-sm">Gestión integral del proceso con foco en maximización de valor</p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-slate-600 font-semibold">04</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Seguimiento Continuo</h3>
            <p className="text-slate-600 text-sm">Apoyo post-transacción para asegurar materialización de sinergias</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Fase 1: Análisis y Valoración</h3>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          Iniciamos cada proyecto con un <strong>análisis exhaustivo</strong> que abarca todos los aspectos críticos del negocio. Esta fase es fundamental para identificar oportunidades de valor y establecer una estrategia de transacción óptima.
        </p>

        <div className="bg-slate-50 p-6 rounded-xl mb-8 not-prose">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Componentes del Análisis</h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <strong className="text-slate-900">Due Diligence Financiero</strong>
                <p className="text-slate-600 text-sm">Análisis profundo de estados financieros, cash flow y proyecciones</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <strong className="text-slate-900">Análisis de Mercado</strong>
                <p className="text-slate-600 text-sm">Evaluación del posicionamiento competitivo y tendencias sectoriales</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <strong className="text-slate-900">Identificación de Sinergias</strong>
                <p className="text-slate-600 text-sm">Oportunidades de optimización y creación de valor</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Metodologías de Valoración</h3>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Aplicamos un enfoque multi-metodológico para asegurar valoraciones <strong>precisas y defendibles</strong>. Cada metodología aporta una perspectiva única del valor, permitiendo un análisis integral.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
          <div className="text-center p-6">
            <div className="text-3xl font-semibold text-slate-900 mb-2">DCF</div>
            <div className="text-sm text-slate-600 mb-3">Descuento de Flujos</div>
            <p className="text-slate-600 text-sm">Valoración intrínseca basada en capacidad de generación de caja futura</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl font-semibold text-slate-900 mb-2">Múltiplos</div>
            <div className="text-sm text-slate-600 mb-3">Comparables</div>
            <p className="text-slate-600 text-sm">Análisis de empresas similares cotizadas y transacciones precedentes</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl font-semibold text-slate-900 mb-2">LBO</div>
            <div className="text-sm text-slate-600 mb-3">Leveraged Buyout</div>
            <p className="text-slate-600 text-sm">Análisis desde perspectiva de fondo de private equity</p>
          </div>
        </div>

        <blockquote className="border-l-4 border-slate-200 pl-6 py-4 mb-12 italic text-slate-600 bg-slate-50/30">
          "Nuestro enfoque multi-metodológico nos permite capturar <strong>diferentes perspectivas de valor</strong> y proporcionar a nuestros clientes una visión completa y objetiva del potencial de su empresa."
        </blockquote>

        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Gestión del Proceso</h3>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          La <strong>ejecución impecable</strong> es lo que distingue las operaciones exitosas. Coordinamos todos los aspectos del proceso manteniendo los más altos estándares de confidencialidad y profesionalidad.
        </p>

        <div className="space-y-6 mb-12 not-prose">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-slate-600 text-sm font-semibold">1</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Preparación de Materiales</h4>
              <p className="text-slate-600 text-sm">Teaser, Information Memorandum, modelo financiero y presentaciones</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-slate-600 text-sm font-semibold">2</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Identificación de Compradores</h4>
              <p className="text-slate-600 text-sm">Mapeo exhaustivo de compradores estratégicos y financieros relevantes</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-slate-600 text-sm font-semibold">3</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Proceso Competitivo</h4>
              <p className="text-slate-600 text-sm">Gestión de proceso de subasta para maximizar valor y términos</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-slate-600 text-sm font-semibold">4</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Negociación y Cierre</h4>
              <p className="text-slate-600 text-sm">Estructuración óptima y coordinación hasta cierre exitoso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/conoce-equipo" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Conoce al equipo</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
          <a href="/documentacion-ma/resultados" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Resultados</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
          <a href="/documentacion-ma/fase-1" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Fase 1</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NuestroMetodoContent;
