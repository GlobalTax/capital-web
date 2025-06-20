
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const VariablesContent = () => {
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
            <BreadcrumbPage className="text-black">Variables</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Variables
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          Variables clave que definen el <strong>éxito</strong> de cada operación M&A.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Variables Críticas</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          En M&A, identificamos y monitoreamos <strong>variables críticas</strong> que determinan el éxito de cada transacción desde la fase inicial hasta el cierre.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Variables Financieras</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>EBITDA y márgenes</li>
              <li>Flujo de caja libre</li>
              <li>Múltiplos de valoración</li>
              <li>Estructura de capital</li>
            </ul>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Variables Estratégicas</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Posición competitiva</li>
              <li>Sinergias esperadas</li>
              <li>Riesgos regulatorios</li>
              <li>Integración cultural</li>
            </ul>
          </div>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Métricas de Control</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Establecemos <strong>métricas de control</strong> para monitorear el progreso y ajustar la estrategia según sea necesario.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-12">
          <h4 className="text-lg font-medium text-black mb-4">KPIs Principales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-black font-medium">ROI Esperado:</span>
              <span className="text-sm text-black ml-2">15-25% anual</span>
            </div>
            <div>
              <span className="text-sm text-black font-medium">Tiempo Cierre:</span>
              <span className="text-sm text-black ml-2">4-8 meses</span>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-300 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "El control de <strong>variables críticas</strong> es fundamental para maximizar el valor en cada transacción M&A."
        </blockquote>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/spacing" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Spacing</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VariablesContent;
