import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  FileText, 
  Calculator, 
  Shield,
  Target,
  BarChart3,
  Briefcase,
  CheckCircle,
  Download,
  PlayCircle
} from "lucide-react";

const DocumentacionMAContent = () => {
  const heroStats = [
    { value: "€2.5B+", label: "Volumen Transaccionado" },
    { value: "150+", label: "Operaciones Completadas" },
    { value: "95%", label: "Tasa de Éxito" },
    { value: "15+", label: "Años de Experiencia" }
  ];

  const processSteps = [
    { icon: Target, title: "Análisis y Preparación", description: "Due diligence exhaustivo y preparación de materiales" },
    { icon: Users, title: "Búsqueda de Compradores", description: "Identificación y contacto con potenciales inversores" },
    { icon: TrendingUp, title: "Proceso de Subasta", description: "Gestión del proceso competitivo de ofertas" },
    { icon: CheckCircle, title: "Negociación y Cierre", description: "Estructuración final y cierre de la transacción" }
  ];

  const resources = [
    { title: "Guía Completa de M&A", description: "Todo lo que necesitas saber sobre fusiones y adquisiciones", icon: BookOpen, downloadable: true },
    { title: "Template Due Diligence", description: "Checklist completo para procesos de due diligence", icon: FileText, downloadable: true },
    { title: "Calculadora de Valoración", description: "Herramienta interactiva para valorar tu empresa", icon: Calculator, interactive: true },
    { title: "Casos de Estudio", description: "Ejemplos reales de operaciones exitosas", icon: BarChart3, downloadable: false }
  ];

  const sectors = [
    { name: "Tecnología y Software", deals: "45+", focus: "SaaS, Fintech, E-commerce" },
    { name: "Servicios Financieros", deals: "30+", focus: "Banca, Seguros, Pagos" },
    { name: "Industrial", deals: "25+", focus: "Manufacturing, Logística" },
    { name: "Retail y Consumo", deals: "20+", focus: "Marcas, Distribución" }
  ];

  return (
    <div className="max-w-none">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-slate-600 hover:text-slate-900">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-slate-900">Documentación M&A</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="mb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-slate-900 mb-6 leading-tight">
            Guía Completa de Fusiones y Adquisiciones
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-4xl mx-auto font-light">
            Todo lo que necesitas saber sobre procesos M&A, desde la preparación inicial hasta el cierre exitoso. 
            Metodología probada, casos reales y herramientas prácticas para maximizar el valor de tu transacción.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {heroStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-semibold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-slate-900 mb-12 text-center">Explora Nuestra Metodología</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/documentacion-ma/nuestro-metodo" className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                <Briefcase className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Nuestro Método</h3>
            </div>
            <p className="text-slate-600 text-sm">Metodología integral que combina análisis riguroso y experiencia sectorial</p>
          </a>

          <a href="/documentacion-ma/conoce-equipo" className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Conoce al Equipo</h3>
            </div>
            <p className="text-slate-600 text-sm">Profesionales especializados con experiencia en diferentes sectores</p>
          </a>

          <a href="/documentacion-ma/resultados" className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                <BarChart3 className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Resultados</h3>
            </div>
            <p className="text-slate-600 text-sm">Casos de éxito y métricas de performance de nuestras operaciones</p>
          </a>

          <a href="/documentacion-ma/fase-1" className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                <Target className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Fase 1: Preparación</h3>
            </div>
            <p className="text-slate-600 text-sm">Análisis exhaustivo y preparación de materiales para la transacción</p>
          </a>

          <a href="/documentacion-ma/fase-2-lucha" className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Fase 2: Ejecución</h3>
            </div>
            <p className="text-slate-600 text-sm">Proceso de subasta, negociación y estructuración de la operación</p>
          </a>

          <a href="/valoraciones" className="group p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                <Calculator className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Valoración</h3>
            </div>
            <p className="text-slate-600 text-sm">Metodologías de valoración y herramientas interactivas</p>
          </a>
        </div>
      </div>

      {/* Process Overview */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-slate-900 mb-12 text-center">Nuestro Proceso M&A</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sectors */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-slate-900 mb-12 text-center">Sectores de Especialización</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {sectors.map((sector, index) => (
            <div key={index} className="p-6 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-slate-900">{sector.name}</h3>
                <span className="text-sm font-semibold text-slate-600">{sector.deals} operaciones</span>
              </div>
              <p className="text-slate-600 text-sm">{sector.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-slate-900 mb-12 text-center">Recursos y Herramientas</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="p-6 border border-slate-200 rounded-xl">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <resource.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{resource.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{resource.description}</p>
                  <div className="flex items-center gap-3">
                    {resource.downloadable && (
                      <InteractiveHoverButton 
                        text="Descargar"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                      </InteractiveHoverButton>
                    )}
                    {resource.interactive && (
                      <InteractiveHoverButton 
                        text="Probar"
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </InteractiveHoverButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-slate-50 rounded-2xl p-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">¿Listo para tu próxima operación M&A?</h2>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Nuestro equipo está preparado para acompañarte en cada paso del proceso, desde la valoración inicial hasta el cierre exitoso.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <InteractiveHoverButton 
            text="Solicitar Valoración"
            variant="primary"
            size="lg"
          />
          <InteractiveHoverButton 
            text="Agendar Consulta"
            variant="outline"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentacionMAContent;