
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const DynamicComponentsContent = () => {
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
            <BreadcrumbPage className="text-black">Dynamic Components</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Dynamic Components
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          Componentes <strong>dinámicos</strong> que se adaptan a las necesidades específicas de cada operación M&A.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Adaptabilidad en M&A</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          Desarrollamos <strong>componentes dinámicos</strong> que se ajustan automáticamente según el tipo de operación, sector y características específicas de cada transacción.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Análisis Sectorial</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Métricas específicas por industria</li>
              <li>Múltiplos comparables</li>
              <li>Riesgos sectoriales</li>
              <li>Tendencias del mercado</li>
            </ul>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Personalización</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Reportes adaptativos</li>
              <li>Flujos de trabajo flexibles</li>
              <li>Interfaces configurables</li>
              <li>Métricas personalizadas</li>
            </ul>
          </div>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Inteligencia Adaptativa</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Nuestros <strong>componentes inteligentes</strong> aprenden de cada operación para ofrecer recomendaciones y análisis cada vez más precisos.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-12">
          <h4 className="text-lg font-medium text-black mb-4">Beneficios Clave</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-black font-medium">Eficiencia:</span>
              <span className="text-sm text-black ml-2">+40% reducción en tiempo</span>
            </div>
            <div>
              <span className="text-sm text-black font-medium">Precisión:</span>
              <span className="text-sm text-black ml-2">+35% mejora en análisis</span>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "La <strong>adaptabilidad</strong> es clave en M&A. Cada operación es única y requiere un enfoque personalizado."
        </blockquote>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/customization" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Customization</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DynamicComponentsContent;
