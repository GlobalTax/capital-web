
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, BarChart3 } from 'lucide-react';

const MarketReports = () => {
  const reports = [
    {
      title: "M&A España 2024: Análisis Sectorial",
      description: "Informe completo sobre tendencias M&A en España por sectores, múltiplos de valoración y previsiones 2025.",
      pages: "45 páginas",
      updated: "Dic 2024",
      category: "Tendencias",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Múltiplos de Valoración por Sector",
      description: "Base de datos actualizada con múltiplos EV/EBITDA, EV/Revenue y P/E por sector en mercado español.",
      pages: "28 páginas", 
      updated: "Nov 2024",
      category: "Valoración",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Private Equity en España 2024",
      description: "Análisis del ecosistema de PE español: fondos activos, deal flow y estrategias de inversión.",
      pages: "35 páginas",
      updated: "Oct 2024",
      category: "Financiación",
      icon: <FileText className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Market Reports
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Informes de mercado actualizados con análisis de tendencias, 
              múltiplos de valoración y datos de transacciones M&A.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reports.map((report, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    {report.icon}
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {report.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-black mb-3">
                  {report.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{report.pages}</span>
                  <span>Actualizado {report.updated}</span>
                </div>
                
                <Button className="w-full flex items-center justify-center gap-2 capittal-button">
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-black mb-4">
                Reportes Personalizados
              </h2>
              <p className="text-gray-600 mb-6">
                ¿Necesitas un análisis específico para tu sector o región? 
                Nuestros expertos pueden crear reportes personalizados según tus necesidades.
              </p>
              <Button className="capittal-button text-lg px-8 py-4">
                Solicitar Reporte Personalizado
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MarketReports;
