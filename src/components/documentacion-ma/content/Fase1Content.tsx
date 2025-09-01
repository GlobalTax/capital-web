
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const Fase1Content = () => {
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
            <BreadcrumbPage className="text-black">Fase 1</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Fase 1: Análisis y Preparación
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          La <strong>primera fase</strong> de nuestro proceso es crucial para el éxito de toda la operación. Realizamos un <strong>análisis exhaustivo</strong> y preparamos meticulosamente todos los elementos necesarios.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Objetivos de la Fase 1</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          En esta fase inicial, nuestro objetivo es <strong>comprender profundamente</strong> la empresa, su posición competitiva, sus fortalezas y áreas de mejora, así como preparar todos los materiales necesarios para presentar la oportunidad de la manera más atractiva posible.
        </p>

        <h3 className="text-2xl font-medium text-black mb-8">1. Diagnóstico Empresarial Integral</h3>
        
        <h4 className="text-xl font-medium text-black mb-6">Análisis Financiero Profundo</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Realizamos un <strong>análisis exhaustivo</strong> de los estados financieros históricos, identificando tendencias, estacionalidades y factores clave que impactan en el rendimiento de la empresa.
        </p>

        <ul className="list-disc list-inside mb-8 space-y-2 text-black ml-4">
          <li><strong>Análisis de P&L</strong>: Evolución de ingresos, márgenes y estructura de costos</li>
          <li><strong>Balance y Cash Flow</strong>: Valoración de la solidez financiera y generación de caja</li>
          <li><strong>Ratios clave</strong>: Análisis de métricas de rentabilidad, eficiencia y solvencia</li>
          <li><strong>Proyecciones</strong>: Desarrollo de modelos financieros prospectivos</li>
        </ul>

        <h4 className="text-xl font-medium text-black mb-6">Análisis de Mercado y Competencia</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Evaluamos el <strong>posicionamiento competitivo</strong> de la empresa, analizando el mercado en el que opera, sus principales competidores y las tendencias del sector.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-8">
          <h5 className="text-lg font-medium text-black mb-4">Elementos del Análisis de Mercado</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-medium text-black mb-2">Tamaño y Crecimiento del Mercado</h6>
              <p className="text-black text-sm">Dimensionamiento del mercado total direccionable y tasas de crecimiento.</p>
            </div>
            <div>
              <h6 className="font-medium text-black mb-2">Análisis Competitivo</h6>
              <p className="text-black text-sm">Identificación y análisis de competidores directos e indirectos.</p>
            </div>
            <div>
              <h6 className="font-medium text-black mb-2">Tendencias Sectoriales</h6>
              <p className="text-black text-sm">Identificación de drivers de cambio y oportunidades emergentes.</p>
            </div>
            <div>
              <h6 className="font-medium text-black mb-2">Barreras de Entrada</h6>
              <p className="text-black text-sm">Valoración de la defendibilidad de la posición competitiva.</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-medium text-black mb-8">2. Valoración Preliminar</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Basándonos en el análisis realizado, desarrollamos una <strong>valoración preliminar</strong> utilizando múltiples metodologías para establecer un rango de valor realista y defendible.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Metodologías de Valoración</h4>
        
        <ol className="list-decimal list-inside mb-8 space-y-3 text-black ml-4">
          <li><strong>Descuento de Flujos de Caja (DCF)</strong>: Valoración intrínseca basada en la capacidad de generación de caja futura</li>
          <li><strong>Múltiplos Comparables</strong>: Análisis de múltiplos de empresas similares cotizadas</li>
          <li><strong>Transacciones Precedentes</strong>: Estudio de operaciones comparables recientes en el sector</li>
          <li><strong>Valoración por Activos</strong>: Cuando sea aplicable, valoración basada en activos netos</li>
        </ol>

        <h3 className="text-2xl font-medium text-black mb-8">3. Preparación de Materiales</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Una vez completado el análisis, procedemos a la <strong>preparación meticulosa</strong> de todos los materiales que serán utilizados en el proceso de venta o adquisición.
        </p>

        <h4 className="text-xl font-medium text-black mb-6">Documentación Clave</h4>
        
        <div className="space-y-4 mb-8">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Teaser Ejecutivo</h5>
            <p className="text-black text-sm">Documento conciso que presenta la oportunidad de inversión de manera atractiva y confidencial.</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Information Memorandum</h5>
            <p className="text-black text-sm">Documento detallado que proporciona información completa sobre la empresa y la oportunidad.</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Modelo Financiero</h5>
            <p className="text-black text-sm">Modelo detallado con proyecciones, análisis de sensibilidad y escenarios múltiples.</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h5 className="font-medium text-black mb-2">Management Presentation</h5>
            <p className="text-black text-sm">Presentación ejecutiva para meetings con potenciales compradores o inversores.</p>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "Una <strong>preparación meticulosa</strong> en la Fase 1 es la base del éxito de toda la operación. Cada detalle cuenta cuando se trata de maximizar el valor y generar interés genuino en la oportunidad."
        </blockquote>

        <h3 className="text-2xl font-medium text-black mb-8">Entregables de la Fase 1</h3>
        
        <p className="text-black mb-8 leading-relaxed">
          Al finalizar esta fase, nuestros clientes reciben un <strong>paquete completo</strong> de análisis y materiales que servirán como base para todo el proceso posterior.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-black mb-2">📊</div>
            <h4 className="font-medium text-black mb-2">Análisis Financiero</h4>
            <p className="text-black text-sm">Reporte completo con análisis histórico y proyecciones</p>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-black mb-2">💰</div>
            <h4 className="font-medium text-black mb-2">Valoración</h4>
            <p className="text-black text-sm">Rango de valoración fundamentado en múltiples metodologías</p>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-black mb-2">📋</div>
            <h4 className="font-medium text-black mb-2">Materiales de Marketing</h4>
            <p className="text-black text-sm">Documentación profesional para presentar la oportunidad</p>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/fase-2-lucha" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Fase II: La lucha</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
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

export default Fase1Content;
