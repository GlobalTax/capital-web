
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const ResultadosContent = () => {
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
            <BreadcrumbPage className="text-black">Resultados</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Resultados
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          Nuestros <strong>resultados hablan por sí solos</strong>: más de <strong>€2.5B</strong> en transacciones completadas y una <strong>tasa de éxito del 95%</strong> en operaciones iniciadas.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Track Record Comprobado</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          En <strong>Capittal</strong>, medimos nuestro éxito por los <strong>resultados excepcionales</strong> que conseguimos para nuestros clientes. Cada transacción es una oportunidad para demostrar nuestro compromiso con la <strong>excelencia</strong> y la <strong>creación de valor</strong>.
        </p>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center bg-gray-50/30 p-8 rounded-lg">
            <div className="text-4xl font-bold text-black mb-2">€2.5B+</div>
            <div className="text-black">Volumen de transacciones</div>
          </div>
          <div className="text-center bg-gray-50/30 p-8 rounded-lg">
            <div className="text-4xl font-bold text-black mb-2">95%</div>
            <div className="text-black">Tasa de éxito</div>
          </div>
          <div className="text-center bg-gray-50/30 p-8 rounded-lg">
            <div className="text-4xl font-bold text-black mb-2">150+</div>
            <div className="text-black">Operaciones completadas</div>
          </div>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Valor Añadido Demostrable</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Nuestro enfoque metodológico no solo garantiza el cierre exitoso de las operaciones, sino que además logra <strong>valoraciones superiores</strong> a las expectativas iniciales en el <strong>85% de los casos</strong>.
        </p>

        <ul className="list-disc list-inside mb-8 space-y-2 text-black ml-4">
          <li><strong>Valoraciones premium</strong>: 15-25% por encima de ofertas iniciales</li>
          <li><strong>Tiempo de cierre</strong>: 30% más rápido que la media del mercado</li>
          <li><strong>Satisfacción del cliente</strong>: 98% recomendarían nuestros servicios</li>
        </ul>

        <h3 className="text-2xl font-medium text-black mb-8">Casos de Éxito Destacados</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          A lo largo de nuestra trayectoria, hemos participado en <strong>operaciones emblemáticas</strong> que han marcado hitos en diferentes sectores, demostrando nuestra capacidad para gestionar transacciones de alta complejidad.
        </p>

        <div className="space-y-6 mb-12">
          <div className="border-l-4 border-black pl-6">
            <h4 className="text-lg font-medium text-black mb-2">Tecnología - Venta de SaaS €85M</h4>
            <p className="text-black mb-2">Asesoramiento integral en la venta de una plataforma SaaS líder en el sector logístico.</p>
            <div className="text-sm text-gray-600">Múltiplo conseguido: 12x EBITDA | Tiempo de proceso: 4 meses</div>
          </div>
          
          <div className="border-l-4 border-black pl-6">
            <h4 className="text-lg font-medium text-black mb-2">Industrial - Fusión €120M</h4>
            <p className="text-black mb-2">Estructuración y cierre de fusión entre dos líderes del sector manufacturero.</p>
            <div className="text-sm text-gray-600">Sinergias identificadas: €15M anuales | ROI post-integración: 18%</div>
          </div>
          
          <div className="border-l-4 border-black pl-6">
            <h4 className="text-lg font-medium text-black mb-2">Retail - Adquisición €65M</h4>
            <p className="text-black mb-2">Asesoramiento en la adquisición de cadena retail con fuerte expansión digital.</p>
            <div className="text-sm text-gray-600">Crecimiento post-adquisición: 35% anual | Nuevos mercados: 3 países</div>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "Los resultados que conseguimos no son casualidad. Son el fruto de un <strong>proceso riguroso</strong>, un <strong>equipo excepcional</strong> y un <strong>compromiso inquebrantable</strong> con el éxito de nuestros clientes."
        </blockquote>

        <h3 className="text-2xl font-medium text-black mb-8">Impacto a Largo Plazo</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Nuestro compromiso va más allá del cierre de la transacción. Realizamos <strong>seguimiento post-integración</strong> para asegurar que las sinergias identificadas se materialicen y que el valor creado perdure en el tiempo.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-12">
          <h4 className="text-lg font-medium text-black mb-4">Métricas de Seguimiento Post-Transacción</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-black">87%</div>
              <div className="text-black text-sm">Sinergias materializadas a 12 meses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black">23%</div>
              <div className="text-black text-sm">Crecimiento medio post-integración</div>
            </div>
          </div>
        </div>
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
          <a href="/documentacion-ma/conoce-equipo" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Conoce al equipo</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultadosContent;
