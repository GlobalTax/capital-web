
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const TerminosUso = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SEO title="Términos de Uso" description="Condiciones que regulan el uso del sitio y los servicios de Capittal." />
      
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-8">
            Términos de Uso
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Estos términos de uso rigen el acceso y uso del sitio web de Capittal. 
              Al utilizar nuestros servicios, acepta estar sujeto a estos términos.
            </p>

            <div className="space-y-8">
              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">1. Aceptación de los Términos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Al acceder y utilizar este sitio web, usted acepta cumplir con estos términos de uso 
                  y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, 
                  se le prohíbe usar o acceder a este sitio.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">2. Uso del Sitio Web</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Este sitio web puede ser utilizado únicamente para fines legítimos. Está prohibido:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Usar el sitio de manera que pueda dañar, deshabilitar o comprometer el sitio</li>
                  <li>• Transmitir material que sea difamatorio, ofensivo o ilegal</li>
                  <li>• Intentar obtener acceso no autorizado a cualquier parte del sitio</li>
                  <li>• Interferir con la seguridad del sitio</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">3. Propiedad Intelectual</h2>
                <p className="text-gray-600 leading-relaxed">
                  Todo el contenido de este sitio web, incluyendo texto, gráficos, logotipos, íconos, 
                  imágenes y software, es propiedad de Capittal y está protegido por las leyes de derechos de autor 
                  y otras leyes de propiedad intelectual.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">4. Servicios Profesionales</h2>
                <p className="text-gray-600 leading-relaxed">
                  La información proporcionada en este sitio web tiene fines informativos generales únicamente. 
                  No constituye asesoramiento profesional específico. Para obtener asesoramiento personalizado, 
                  debe consultar directamente con nuestros profesionales.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">5. Limitación de Responsabilidad</h2>
                <p className="text-gray-600 leading-relaxed">
                  Capittal no será responsable de ningún daño directo, indirecto, incidental, 
                  especial o consecuente que resulte del uso o la imposibilidad de usar este sitio web, 
                  incluso si hemos sido advertidos de la posibilidad de tales daños.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">6. Modificaciones</h2>
                <p className="text-gray-600 leading-relaxed">
                  Capittal se reserva el derecho de revisar estos términos de uso en cualquier momento 
                  sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual 
                  de estos términos de uso.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">7. Ley Aplicable</h2>
                <p className="text-gray-600 leading-relaxed">
                  Estos términos de uso se rigen por las leyes de España. Cualquier disputa relacionada 
                  con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales españoles.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Última actualización: Enero 2024
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TerminosUso;
