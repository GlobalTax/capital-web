
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-slate-900 mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              En Capittal, nos comprometemos a proteger y respetar su privacidad. Esta política explica cómo recopilamos, 
              utilizamos y protegemos su información personal.
            </p>

            <div className="space-y-8">
              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-normal text-slate-900 mb-4">1. Información que Recopilamos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Recopilamos información cuando usted:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Completa formularios en nuestro sitio web</li>
                  <li>• Se registra para recibir información o servicios</li>
                  <li>• Participa en encuestas o promociones</li>
                  <li>• Se comunica con nosotros por cualquier medio</li>
                  <li>• Navega por nuestro sitio web (datos técnicos)</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-normal text-slate-900 mb-4">2. Cómo Utilizamos su Información</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Utilizamos la información recopilada para:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Proporcionar y mejorar nuestros servicios</li>
                  <li>• Comunicarnos con usted sobre nuestros servicios</li>
                  <li>• Enviar información comercial relevante</li>
                  <li>• Cumplir con obligaciones legales</li>
                  <li>• Mejorar la experiencia del usuario en nuestro sitio web</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-normal text-slate-900 mb-4">3. Protección de Datos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
                  su información personal contra el acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-normal text-slate-900 mb-4">4. Sus Derechos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conforme al RGPD, usted tiene derecho a:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Acceder a sus datos personales</li>
                  <li>• Rectificar datos inexactos</li>
                  <li>• Suprimir sus datos</li>
                  <li>• Limitar el tratamiento</li>
                  <li>• Portabilidad de datos</li>
                  <li>• Oponerse al tratamiento</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-normal text-slate-900 mb-4">5. Contacto</h2>
                <p className="text-gray-600 leading-relaxed">
                  Para ejercer sus derechos o realizar consultas sobre esta política, puede contactarnos en:
                </p>
                <div className="mt-4 text-gray-600">
                  <p>Email: privacy@capittal.com</p>
                  <p>Sede Central: Carrer Ausias March número 36, 08010. Barcelona</p>
                  <p>Otras oficinas: Madrid - Girona - Lleida - Tarragona - Palma de Mallorca - Zaragoza - Valencia</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Última actualización: Enero 2025
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidad;
