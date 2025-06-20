
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const DocumentacionMAContent = () => {
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
            <BreadcrumbLink href="#" className="text-black hover:text-black">Get Started</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-black">Nuestro método</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Nuestro método
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          En <strong>Capittal</strong>, aplicamos una metodología integral que combina <strong>análisis riguroso</strong>, <strong>experiencia sectorial</strong> y <strong>enfoque personalizado</strong> para maximizar el valor en cada transacción de M&A.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 10, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Nuestro Enfoque Metodológico</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          Nuestro método se fundamenta en <strong>tres pilares esenciales</strong>: el <strong>análisis exhaustivo</strong> de cada oportunidad, la <strong>estructuración óptima</strong> de las operaciones y la <strong>ejecución impecable</strong> de cada fase del proceso.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Fase de Análisis y Diagnóstico</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Iniciamos cada proyecto con un <strong>diagnóstico profundo</strong> que nos permite identificar las <strong>oportunidades de valor</strong> y los <strong>riesgos potenciales</strong>. Esta fase incluye el análisis financiero, comercial y estratégico de la empresa.
        </p>

        <ol className="list-decimal list-inside mb-8 space-y-2 text-black ml-4">
          <li><strong>Análisis financiero</strong>: Evaluación exhaustiva de estados financieros y proyecciones</li>
          <li><strong>Due diligence comercial</strong>: Análisis del mercado, competencia y posicionamiento</li>
        </ol>

        <h4 className="text-xl font-medium text-black mb-6">Estructuración de la Operación</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Una vez completado el análisis, diseñamos la <strong>estructura óptima</strong> para la transacción, considerando aspectos <strong>fiscales</strong>, <strong>legales</strong> y <strong>financieros</strong> que maximicen el valor para todas las partes involucradas.
        </p>

        <ol className="list-decimal list-inside mb-12 space-y-2 text-black ml-4">
          <li><strong>Optimización fiscal</strong>: Estructuras que minimizan la carga tributaria</li>
          <li><strong>Negociación estratégica</strong>: Términos que protegen y maximizan valor</li>
        </ol>

        <h3 className="text-2xl font-medium text-black mb-8">Metodología de Valoración</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Aplicamos <strong>múltiples metodologías de valoración</strong> para obtener un rango de valor preciso y fundamentado. Utilizamos el <strong>método DCF</strong>, <strong>múltiplos comparables</strong> y <strong>transacciones precedentes</strong> para asegurar la objetividad del proceso.
        </p>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "La precisión en la <strong>valoración</strong> es fundamental para el éxito de cualquier operación de M&A. Nuestro enfoque multi-metodológico garantiza resultados <strong>objetivos y defendibles</strong>."
        </blockquote>

        <h3 className="text-2xl font-medium text-black mb-8">Proceso de Ejecución</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          La <strong>ejecución impecable</strong> distingue las operaciones exitosas. Coordinamos todos los aspectos del proceso, desde la <strong>preparación de documentación</strong> hasta el <strong>cierre de la transacción</strong>, asegurando que cada detalle esté perfectamente alineado.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Gestión del Proceso</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Nuestro equipo gestiona <strong>cada fase del proceso</strong> con precisión milimétrica, manteniendo la <strong>confidencialidad</strong> y asegurando el <strong>cumplimiento regulatorio</strong> en todo momento.
        </p>

        <ol className="list-decimal list-inside mb-8 space-y-2 text-black ml-4">
          <li><strong>Preparación de data room</strong>: Organización exhaustiva de información</li>
          <li><strong>Coordinación con asesores</strong>: Gestión integral del equipo profesional</li>
        </ol>

        <h5 className="text-lg font-medium text-black mb-6">Seguimiento Post-Transacción</h5>
        
        <p className="text-black mb-12 leading-relaxed">
          Nuestro compromiso se extiende más allá del cierre. Proporcionamos <strong>seguimiento continuo</strong> para asegurar la <strong>integración exitosa</strong> y la <strong>materialización de sinergias</strong> identificadas durante el proceso.
        </p>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="#" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Nuestro método</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
          <a href="#" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Conoce al equipo</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
          <a href="#" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Export</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentacionMAContent;
