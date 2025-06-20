
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const SpacingContent = () => {
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
            <BreadcrumbPage className="text-black">Spacing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Spacing
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          El <strong>espaciado consistente</strong> mejora la legibilidad y la experiencia de usuario en toda nuestra documentación técnica.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Sistema de Espaciado</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          Utilizamos un <strong>sistema de espaciado</strong> basado en múltiplos de 8px para mantener coherencia visual y facilitar la lectura de documentos complejos.
        </p>

        <div className="bg-gray-50/30 p-8 rounded-lg mb-12">
          <h4 className="text-lg font-medium text-black mb-6">Escala de Espaciado</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-2 h-2 bg-black mx-auto mb-2"></div>
              <span className="text-sm text-black">8px</span>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-black mx-auto mb-2"></div>
              <span className="text-sm text-black">16px</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 bg-black mx-auto mb-2"></div>
              <span className="text-sm text-black">24px</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-black mx-auto mb-2"></div>
              <span className="text-sm text-black">32px</span>
            </div>
          </div>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Aplicación en Documentos</h4>
        
        <ul className="list-disc list-inside mb-8 space-y-2 text-black ml-4">
          <li><strong>Párrafos</strong>: 24px de separación entre párrafos</li>
          <li><strong>Secciones</strong>: 48px de separación entre secciones principales</li>
          <li><strong>Títulos</strong>: 32px de margen superior, 16px inferior</li>
          <li><strong>Listas</strong>: 8px entre elementos de lista</li>
        </ul>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "El <strong>espaciado adecuado</strong> es invisible cuando está bien hecho, pero su ausencia se nota inmediatamente."
        </blockquote>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/typography" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Typography</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SpacingContent;
