
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
          La <strong>comunicación clara</strong> es fundamental en M&A. Utilizamos una tipografía consistente y profesional en toda nuestra documentación.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Estándares Tipográficos</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          Mantenemos <strong>estándares tipográficos</strong> consistentes en toda nuestra documentación para asegurar claridad y profesionalidad en cada presentación.
        </p>

        <div className="space-y-8 mb-12">
          <div>
            <h3 className="text-2xl font-medium text-black mb-4">Jerarquía Tipográfica</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-black pl-6">
                <h1 className="text-4xl font-light text-black mb-2">Título Principal</h1>
                <p className="text-sm text-gray-600">48px - Font Weight: Light</p>
              </div>
              <div className="border-l-4 border-gray-300 pl-6">
                <h2 className="text-3xl font-medium text-black mb-2">Título Secundario</h2>
                <p className="text-sm text-gray-600">36px - Font Weight: Medium</p>
              </div>
              <div className="border-l-4 border-gray-300 pl-6">
                <h3 className="text-xl font-medium text-black mb-2">Subtítulo</h3>
                <p className="text-sm text-gray-600">24px - Font Weight: Medium</p>
              </div>
              <div className="border-l-4 border-gray-300 pl-6">
                <p className="text-base text-black mb-2">Texto de cuerpo</p>
                <p className="text-sm text-gray-600">16px - Font Weight: Regular</p>
              </div>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "La tipografía es la <strong>voz silenciosa</strong> de nuestros documentos. Cada detalle cuenta para transmitir profesionalidad y confianza."
        </blockquote>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
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
