
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const TypographyContent = () => {
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
            <BreadcrumbPage className="text-black">Typography</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Typography
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          La <strong>comunicación clara</strong> es fundamental en M&A. Cada palabra cuenta.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Comunicación Efectiva</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          En el mundo M&A, la <strong>precisión en la comunicación</strong> puede determinar el éxito de una transacción. Cada documento, presentación y conversación debe ser clara y persuasiva.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Documentos Clave</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Memorandos de inversión</li>
              <li>Cartas de intención</li>
              <li>Presentaciones ejecutivas</li>
              <li>Informes de valoración</li>
            </ul>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Estilo de Comunicación</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Conciso y directo</li>
              <li>Datos respaldados</li>
              <li>Narrativa convincente</li>
              <li>Terminología precisa</li>
            </ul>
          </div>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Jerarquía Visual</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Utilizamos <strong>jerarquía visual</strong> para guiar la atención hacia los puntos más importantes de cada comunicación.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-12">
          <h4 className="text-lg font-medium text-black mb-4">Elementos Visuales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-black font-medium">Títulos:</span>
              <span className="text-sm text-black ml-2">Manrope Bold</span>
            </div>
            <div>
              <span className="text-sm text-black font-medium">Cuerpo:</span>
              <span className="text-sm text-black ml-2">Manrope Regular</span>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-300 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "En M&A, la <strong>claridad</strong> en la comunicación es tan importante como los números en el balance."
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

export default TypographyContent;
