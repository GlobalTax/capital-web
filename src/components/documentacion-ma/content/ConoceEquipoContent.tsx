
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const ConoceEquipoContent = () => {
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
            <BreadcrumbPage className="text-black">Conoce al equipo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Conoce al equipo
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          Nuestro equipo está formado por <strong>profesionales altamente especializados</strong> en M&A con amplia experiencia en diferentes sectores y tipos de transacciones.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Experiencia y Especialización</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          En <strong>Capittal</strong>, contamos con un equipo multidisciplinar que combina experiencia en <strong>banca de inversión</strong>, <strong>consultoría estratégica</strong> y <strong>asesoramiento financiero</strong> para ofrecer un servicio integral en cada transacción.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Nuestro Enfoque de Equipo</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Cada operación es gestionada por un <strong>equipo dedicado</strong> que incluye especialistas en valoración, due diligence, aspectos legales y fiscales, garantizando una perspectiva integral de cada transacción.
        </p>

        <ul className="list-disc list-inside mb-8 space-y-2 text-black ml-4">
          <li><strong>Partners Senior</strong>: Con más de 15 años de experiencia en M&A</li>
          <li><strong>Directors</strong>: Especialistas sectoriales y funcionales</li>
          <li><strong>Associates</strong>: Analistas especializados en modelización financiera</li>
        </ul>

        <h3 className="text-2xl font-medium text-black mb-8">Sectores de Especialización</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Nuestro equipo tiene <strong>experiencia profunda</strong> en múltiples sectores, lo que nos permite aportar <strong>conocimiento específico</strong> y <strong>insights únicos</strong> en cada industria.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Tecnología y Software</h4>
            <p className="text-black">Experiencia en SaaS, fintech, e-commerce y plataformas digitales.</p>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Servicios Financieros</h4>
            <p className="text-black">Especialización en banca, seguros, gestión de activos y pagos.</p>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Industrial y Manufacturing</h4>
            <p className="text-black">Conocimiento profundo en procesos industriales y cadenas de suministro.</p>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Retail y Consumo</h4>
            <p className="text-black">Experiencia en marcas de consumo, retail y distribución.</p>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "Nuestro equipo no solo aporta <strong>expertise técnico</strong>, sino también la capacidad de entender las particularidades de cada sector y las necesidades específicas de nuestros clientes."
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
          <a href="/documentacion-ma/resultados" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Resultados</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConoceEquipoContent;
