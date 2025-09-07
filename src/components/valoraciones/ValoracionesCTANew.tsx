import React from 'react';
import { Link } from 'react-router-dom';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Calculator, Phone, Mail, Calendar, Download, CheckCircle, Shield, Clock, Award } from 'lucide-react';

const ValoracionesCTANew = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Valora tu Empresa Hoy Mismo
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre el valor real de tu empresa con nuestras metodologías profesionales. 
            Obtén una valoración orientativa gratuita o solicita un análisis completo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calculadora Gratuita */}
          <div className="bg-gray-900 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Calculadora Gratuita</h3>
                <p className="text-gray-400">Valoración orientativa inmediata</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-300">Resultado en 5 minutos o menos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-300">100% confidencial y gratuito</span>
              </div>
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-300">Informe PDF descargable</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-300">Sin registros ni compromisos</span>
              </div>
            </div>

            <Link to="/lp/calculadora" className="block">
              <InteractiveHoverButton 
                text="Calcular Valoración Gratuita"
                variant="primary"
                size="lg"
                className="w-full mb-4"
              />
            </Link>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">500+ Empresas</div>
              <div className="text-sm text-gray-400">ya han calculado su valoración</div>
            </div>
          </div>

          {/* Valoración Profesional */}
          <div className="bg-white text-black rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Valoración Profesional</h3>
                <p className="text-gray-600">Análisis completo certificado</p>
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Consulta Inicial Gratuita</h4>
                  <p className="text-gray-600 text-sm">Valoración preliminar sin compromiso</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Análisis Multimetodológico</h4>
                  <p className="text-gray-600 text-sm">DCF, múltiplos, patrimonial y síntesis</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Informe Certificado</h4>
                  <p className="text-gray-600 text-sm">Válido para operaciones legales y corporativas</p>
                </div>
              </div>
            </div>

            <form className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  className="capittal-input w-full"
                  placeholder="Nombre"
                />
                <input
                  type="email"
                  className="capittal-input w-full"
                  placeholder="Email"
                />
              </div>
              
              <input
                type="text"
                className="capittal-input w-full"
                placeholder="Empresa"
              />
              
              <select className="capittal-input w-full">
                <option>Selecciona facturación anual</option>
                <option>Menos de 1M€</option>
                <option>1M€ - 5M€</option>
                <option>5M€ - 10M€</option>
                <option>10M€ - 25M€</option>
                <option>25M€ - 50M€</option>
                <option>Más de 50M€</option>
              </select>
              
              <textarea
                className="capittal-input w-full h-20 resize-none"
                placeholder="Cuéntanos el propósito de la valoración..."
              ></textarea>
              
              <InteractiveHoverButton 
                text="Solicitar Presupuesto"
                variant="primary"
                size="lg"
                className="w-full"
                type="submit"
              />
            </form>
            
            <p className="text-xs text-gray-500 text-center">
              Presupuesto personalizado • Primera consulta gratuita • Respuesta en 24h
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-slate-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-center mb-6">Comparación de Servicios</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 text-slate-300">Característica</th>
                  <th className="text-center py-3">Calculadora Gratuita</th>
                  <th className="text-center py-3">Valoración Profesional</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-slate-300 text-sm">Tiempo de entrega</td>
                  <td className="text-center py-2 text-sm">5 minutos</td>
                  <td className="text-center py-2 text-sm">4-6 semanas</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-slate-300 text-sm">Metodologías aplicadas</td>
                  <td className="text-center py-2 text-sm">Múltiplos sectoriales</td>
                  <td className="text-center py-2 text-sm">DCF + Múltiplos + Patrimonial</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-slate-300 text-sm">Precisión estimada</td>
                  <td className="text-center py-2 text-sm">±20-30%</td>
                  <td className="text-center py-2 text-sm">±5-10%</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-slate-300 text-sm">Informe detallado</td>
                  <td className="text-center py-2 text-sm">PDF básico</td>
                  <td className="text-center py-2 text-sm">Completo + Certificado</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-slate-300 text-sm">Válido legalmente</td>
                  <td className="text-center py-2 text-sm">No</td>
                  <td className="text-center py-2 text-sm">Sí</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300 text-sm">Precio</td>
                  <td className="text-center py-2 text-primary font-medium text-sm">Gratuito</td>
                  <td className="text-center py-2 text-sm">Desde €3,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Direct */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-4">¿Prefieres hablar directamente?</h3>
          <div className="flex justify-center">
            <a 
              href="tel:+34695717490" 
              className="inline-flex items-center justify-center px-4 py-2 bg-white text-black rounded-lg hover:bg-slate-100 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              +34 695 717 490
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesCTANew;