
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-8">
            Política de Cookies
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Esta política explica cómo Capittal utiliza cookies y tecnologías similares 
              en nuestro sitio web para mejorar su experiencia de navegación.
            </p>

            <div className="space-y-8">
              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">¿Qué son las Cookies?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. 
                  Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, 
                  así como para proporcionar información a los propietarios del sitio.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Tipos de Cookies que Utilizamos</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Cookies Esenciales</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estas cookies son necesarias para que el sitio web funcione correctamente. 
                      No se pueden desactivar en nuestros sistemas.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Cookies de Rendimiento</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estas cookies nos permiten contar las visitas y fuentes de tráfico para poder medir 
                      y mejorar el rendimiento de nuestro sitio.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Cookies de Funcionalidad</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estas cookies permiten que el sitio web proporcione una funcionalidad mejorada 
                      y personalización, como recordar sus preferencias.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Cookies de Marketing</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estas cookies pueden ser establecidas a través de nuestro sitio por nuestros socios publicitarios 
                      para crear un perfil de sus intereses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Cookies de Terceros</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Utilizamos servicios de terceros que pueden establecer cookies en su dispositivo:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Google Analytics: Para análisis de tráfico web</li>
                  <li>• Google Maps: Para mostrar mapas interactivos</li>
                  <li>• Formularios de contacto: Para mejorar la funcionalidad</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Control de Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies 
                  que ya están en su dispositivo y configurar la mayoría de los navegadores para evitar que se coloquen.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias 
                  cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Configuración del Navegador</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Puede configurar su navegador para rechazar cookies:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Chrome: Configuración > Privacidad y seguridad > Cookies</li>
                  <li>• Firefox: Opciones > Privacidad y seguridad</li>
                  <li>• Safari: Preferencias > Privacidad</li>
                  <li>• Edge: Configuración > Cookies y permisos del sitio</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Contacto</h2>
                <p className="text-gray-600 leading-relaxed">
                  Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en:
                </p>
                <div className="mt-4 text-gray-600">
                  <p>Email: cookies@capittal.com</p>
                  <p>Dirección: Paseo de la Castellana 123, 28046 Madrid, España</p>
                </div>
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

export default Cookies;
