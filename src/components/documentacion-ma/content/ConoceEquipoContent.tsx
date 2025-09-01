
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
        <h1 className="text-4xl font-semibold text-slate-900 mb-6 leading-tight">
          El Equipo Capittal
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl font-light">
          Nuestro equipo está formado por <strong>profesionales senior</strong> con experiencia combinada superior a <strong>100 años en M&A</strong>, procedentes de las mejores firmas de banca de inversión y consultoría estratégica.
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Actualizado</span>
          <span>Diciembre 29, 2024</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-semibold text-slate-900 mb-12">Nuestro Enfoque de Equipo</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16 not-prose">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-slate-900">100+</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Años de Experiencia</h3>
            <p className="text-slate-600 text-sm">Combinada del equipo senior</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-slate-900">€2.5B+</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Volumen Gestionado</h3>
            <p className="text-slate-600 text-sm">En operaciones M&A completadas</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-slate-900">15+</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sectores</h3>
            <p className="text-slate-600 text-sm">Experiencia especializada</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Estructura del Equipo</h3>
        
        <div className="space-y-6 mb-12 not-prose">
          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-slate-600 font-semibold">MD</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Managing Directors</h4>
                <p className="text-slate-600 text-sm mb-3">Partners senior con más de 20 años de experiencia. Lideran las relaciones cliente y supervisan la estrategia de cada transacción.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Goldman Sachs</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">McKinsey</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">JP Morgan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-slate-600 font-semibold">D</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Directors</h4>
                <p className="text-slate-600 text-sm mb-3">Profesionales con 10-15 años de experiencia. Gestionan el día a día de las operaciones y lideran workstreams específicos.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">BCG</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Deutsche Bank</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Lazard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-slate-600 font-semibold">VP</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Vice Presidents</h4>
                <p className="text-slate-600 text-sm mb-3">Ejecutivos con 6-10 años de experiencia. Coordinan análisis, modelización y preparación de materiales.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">IESE</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">EY</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">PwC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-slate-900 mb-8">Especialización Sectorial</h3>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Nuestro enfoque se basa en el <strong>conocimiento sectorial profundo</strong>. Cada miembro del equipo tiene experiencia específica en determinados sectores, lo que nos permite aportar insights únicos y maximizar el valor en cada transacción.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12 not-prose">
          <div className="p-6 border border-slate-200 rounded-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Tecnología y Software</h4>
            <p className="text-slate-600 text-sm mb-4">45+ operaciones en SaaS, fintech, e-commerce y plataformas digitales</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div>• Valoración de métricas SaaS (ARR, LTV, CAC)</div>
              <div>• Due diligence técnico y de producto</div>
              <div>• Análisis de escalabilidad y defensibilidad</div>
            </div>
          </div>
          
          <div className="p-6 border border-slate-200 rounded-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Servicios Financieros</h4>
            <p className="text-slate-600 text-sm mb-4">30+ operaciones en banca, seguros, gestión de activos y pagos</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div>• Regulación y compliance especializado</div>
              <div>• Modelos de riesgo y capital</div>
              <div>• Valoración de carteras de activos</div>
            </div>
          </div>
          
          <div className="p-6 border border-slate-200 rounded-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Industrial y Manufacturing</h4>
            <p className="text-slate-600 text-sm mb-4">25+ operaciones en manufacturing, logística y supply chain</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div>• Análisis de procesos productivos</div>
              <div>• Valoración de activos industriales</div>
              <div>• Optimización de cadenas de suministro</div>
            </div>
          </div>
          
          <div className="p-6 border border-slate-200 rounded-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Retail y Consumo</h4>
            <p className="text-slate-600 text-sm mb-4">20+ operaciones en marcas de consumo, retail y distribución</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div>• Valoración de marcas y customer base</div>
              <div>• Análisis de canales de distribución</div>
              <div>• Tendencias de consumo y demografía</div>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-slate-200 pl-6 py-4 mb-12 italic text-slate-600 bg-slate-50/30">
          "La <strong>especialización sectorial</strong> nos permite no solo valorar correctamente cada oportunidad, sino también identificar los compradores más estratégicos y estructurar las operaciones de manera óptima."
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
