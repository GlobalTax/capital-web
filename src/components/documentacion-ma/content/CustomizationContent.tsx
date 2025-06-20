
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const CustomizationContent = () => {
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
            <BreadcrumbPage className="text-black">Customization</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Customization
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          Personalizamos cada <strong>transacción</strong> según las necesidades específicas de nuestros clientes, adaptando nuestra metodología a cada situación única.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Enfoque Personalizado</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          No existe una solución única para todas las operaciones de M&A. Cada empresa, cada sector y cada situación requiere un <strong>enfoque específico</strong> que tenga en cuenta sus particularidades y objetivos únicos.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Adaptación Sectorial</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Nuestro equipo adapta las metodologías y herramientas según las <strong>características específicas</strong> de cada sector, considerando factores como ciclos de negocio, regulaciones y métricas de valoración particulares.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Tecnología</h4>
            <p className="text-black">Enfoque en métricas de crecimiento, valoraciones por múltiplos de ingresos y análisis de escalabilidad.</p>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Industrial</h4>
            <p className="text-black">Análisis de activos, valoración de plantas y equipos, consideración de ciclos económicos.</p>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "La <strong>personalización</strong> no es un lujo, es una necesidad. Cada operación tiene sus propias complejidades que requieren soluciones a medida."
        </blockquote>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
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

export default CustomizationContent;
