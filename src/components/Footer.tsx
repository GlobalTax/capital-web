
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Servicios',
      links: [
        'Fusiones y Adquisiciones',
        'Due Diligence',
        'Valoraciones',
        'Corporate Finance',
        'Reestructuraciones',
      ],
    },
    {
      title: 'Sectores',
      links: [
        'Tecnología',
        'Healthcare',
        'Industrial',
        'Retail & Consumer',
        'Financial Services',
      ],
    },
    {
      title: 'Recursos',
      links: [
        'Market Reports',
        'Webinars',
        'Case Studies',
        'Newsletter',
        'Blog',
      ],
    },
  ];

  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Capittal</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Especialistas en fusiones y adquisiciones con más de 15 años de experiencia 
              asesorando a empresas en sus transacciones más importantes.
            </p>
            <div className="space-y-2 text-gray-600">
              <p>Paseo de la Castellana 123</p>
              <p>28046 Madrid, España</p>
              <p>+34 91 234 5678</p>
              <p>info@capittal.com</p>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-gray-600 hover:text-black transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © {currentYear} Capittal. Todos los derechos reservados.
            </div>
            
            <div className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-black transition-colors duration-200">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-black transition-colors duration-200">
                Términos de Uso
              </a>
              <a href="#" className="hover:text-black transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
