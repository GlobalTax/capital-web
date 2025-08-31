
import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';

const TerminosUso = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Términos y Condiciones de Uso | Herramienta Valoración | Capittal';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Términos y condiciones completos para el uso de Capittal y su herramienta de valoración de empresas. Marco legal robusto y protección integral.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Términos y condiciones completos para el uso de Capittal y su herramienta de valoración de empresas. Marco legal robusto y protección integral.';
      document.head.appendChild(meta);
    }

    // Canonical URL
    const canonicalUrl = 'https://capittal.es/terminos-uso';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, []);

  return (
    <HomeLayout>
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-8">
            Términos y Condiciones de Uso
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Al acceder y utilizar este sitio web o cualquiera de los servicios y herramientas que Capittal ofrece, 
              usted declara que ha leído, entendido y acepta quedar obligado por estos Términos y Condiciones 
              y por todas las leyes y regulaciones aplicables.
            </p>

            <div className="space-y-8">
              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">1. Aceptación de los Términos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Al acceder y utilizar este sitio web o cualquiera de los servicios y herramientas que Capittal ofrece, 
                  usted declara que ha leído, entendido y acepta quedar obligado por estos Términos y Condiciones 
                  y por todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, 
                  no debe utilizar este sitio web ni nuestros servicios.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">2. Definiciones</h2>
                <div className="text-gray-600 leading-relaxed space-y-3">
                  <p><strong>"Sitio" o "Plataforma":</strong> el portal web capittal.es y todas las páginas y funcionalidades asociadas.</p>
                  <p><strong>"Herramienta de Valoración":</strong> software y formularios que permiten obtener una estimación del valor de una empresa en función de la información aportada por el Usuario.</p>
                  <p><strong>"Usuario" o "Usted":</strong> cualquier persona física o jurídica que accede al Sitio, consulta contenidos o utiliza la Herramienta de Valoración.</p>
                </div>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">3. Uso del Sitio y Servicios</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  El Sitio puede ser utilizado únicamente para fines legítimos. Usted se compromete a no:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Utilizar el Sitio de forma que pueda dañarlo, deshabilitarlo o comprometer su seguridad</li>
                  <li>• Transmitir material difamatorio, ofensivo o ilegal a través del Sitio</li>
                  <li>• Intentar obtener acceso no autorizado a cualquier parte o servicio de la Plataforma</li>
                  <li>• Interferir con la disponibilidad o funcionamiento del Sitio</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Capittal se reserva el derecho a denegar o retirar el acceso al Sitio sin necesidad de previo aviso 
                  a aquellos usuarios que incumplan estos términos.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">4. Uso de la Herramienta de Valoración</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">4.1 Finalidad Informativa</h3>
                    <p className="text-gray-600 leading-relaxed">
                      La Herramienta de Valoración se ofrece exclusivamente con fines informativos y orientativos. 
                      Los resultados que genere no constituyen asesoramiento profesional ni financiero ni una oferta 
                      vinculante de compra o venta. Usted reconoce que deberán ser complementados con un análisis 
                      profesional específico y que Capittal no garantiza la exactitud, integridad o idoneidad 
                      de las valoraciones obtenidas.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">4.2 Dependencia de la Información Aportada</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Las estimaciones se basan en los datos que usted proporciona. Usted garantiza que la información 
                      facilitada es veraz, completa y actualizada. Capittal no asume responsabilidad por errores 
                      o inexactitudes derivadas de datos incompletos o incorrectos.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">4.3 Propiedad y Licencia</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Capittal es titular de todos los derechos de propiedad intelectual sobre la Herramienta de 
                      Valoración y sus algoritmos. Usted obtiene una licencia limitada, revocable e intransferible 
                      para utilizarla exclusivamente para sus fines internos.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">4.4 Limitaciones y Exclusiones</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Capittal no será responsable de ninguna decisión de inversión, desinversión o negociación 
                      basada en los resultados de la Herramienta. Se recomienda en todo caso consultar con asesores 
                      financieros, legales y fiscales independientes antes de actuar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">5. Propiedad Intelectual</h2>
                <p className="text-gray-600 leading-relaxed">
                  Todos los contenidos del Sitio, incluidas marcas, textos, gráficos, logotipos, iconos, imágenes, 
                  vídeos y software, son propiedad de Capittal o se usan con licencia y están protegidos por las 
                  leyes de propiedad intelectual y otras leyes aplicables. Queda prohibido copiar, reproducir 
                  o distribuir cualquier contenido sin autorización previa.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">6. Obligaciones del Usuario</h2>
                <p className="text-gray-600 leading-relaxed mb-4">El Usuario se compromete a:</p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• Facilitar información veraz y actualizada cuando se le solicite</li>
                  <li>• Mantener la confidencialidad de cualquier credencial (usuario/contraseña) y no compartir su cuenta</li>
                  <li>• No utilizar el Sitio o la Herramienta de Valoración con fines ilícitos o que puedan perjudicar a terceros</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">7. Exención de Responsabilidad</h2>
                <p className="text-gray-600 leading-relaxed">
                  La información publicada en el Sitio tiene fines exclusivamente informativos y no constituye 
                  asesoramiento profesional específico. Capittal no garantiza que el contenido sea preciso, 
                  completo o actual, y no asume responsabilidad por cualquier pérdida o daño derivados del uso 
                  de la información o de la imposibilidad de utilizar el Sitio.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">8. Limitación de Responsabilidad</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  En la medida permitida por la ley, Capittal y sus proveedores no serán responsables de daños 
                  directos, indirectos, incidentales, especiales o consecuentes derivados de:
                </p>
                <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
                  <li>• El uso o imposibilidad de uso del Sitio o de la Herramienta de Valoración</li>
                  <li>• Cualquier decisión basada en información obtenida a través del Sitio</li>
                  <li>• Cualquier acceso o uso no autorizado de nuestros servidores o de la información almacenada en ellos</li>
                </ul>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">9. Indemnización</h2>
                <p className="text-gray-600 leading-relaxed">
                  Usted se compromete a indemnizar y mantener indemne a Capittal, sus directivos, empleados 
                  y colaboradores frente a cualquier reclamación, daño, pérdida, responsabilidad, costes 
                  u honorarios (incluidos honorarios de abogados) derivados de su uso del Sitio o de la 
                  Herramienta de Valoración en incumplimiento de estos términos.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">10. Modificaciones</h2>
                <p className="text-gray-600 leading-relaxed">
                  Capittal podrá modificar estos Términos y Condiciones en cualquier momento, publicando una versión 
                  actualizada en el Sitio. Las modificaciones entrarán en vigor desde su publicación, por lo que se 
                  recomienda revisar periódicamente esta página. El uso continuado del Sitio tras la publicación 
                  de cambios constituirá su aceptación de los mismos.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">11. Ley Aplicable y Jurisdicción</h2>
                <p className="text-gray-600 leading-relaxed">
                  Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de España. 
                  Para cualquier controversia que pudiera derivarse del acceso o uso del Sitio, usted se somete 
                  a la jurisdicción exclusiva de los tribunales españoles.
                </p>
              </div>

              <div className="bg-white border-0.5 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">12. Contacto</h2>
                <p className="text-gray-600 leading-relaxed">
                  Para cualquier duda sobre estos Términos y Condiciones, puede contactar con Capittal en 
                  <a href="mailto:info@capittal.es" className="text-blue-600 hover:text-blue-800 underline ml-1">info@capittal.es</a> 
                  o en la dirección postal indicada en el pie de página del Sitio.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Última actualización: Diciembre 2024
            </p>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
};

export default TerminosUso;
