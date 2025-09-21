import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Linkedin, Twitter } from 'lucide-react';

const NavarroFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">N</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">NAVARRO</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Global Services</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              La firma española líder para empresas internacionales y emprendedores 
              que buscan crecer globalmente. Ofrecemos servicios legales, fiscales 
              y laborales especializados.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Sede Central</p>
                  <p className="text-gray-300">Carrer Ausias March, 36</p>
                  <p className="text-gray-300">08010 Barcelona, España</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href="tel:+34695717490" className="text-gray-300 hover:text-white transition-colors">
                  +34 695 717 490
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href="mailto:info@nrro.es" className="text-gray-300 hover:text-white transition-colors">
                  info@nrro.es
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Servicios</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/navarro/legal" className="text-gray-300 hover:text-white transition-colors">
                  Asesoría Legal
                </Link>
              </li>
              <li>
                <Link to="/navarro/fiscal" className="text-gray-300 hover:text-white transition-colors">
                  Asesoría Fiscal
                </Link>
              </li>
              <li>
                <Link to="/navarro/laboral" className="text-gray-300 hover:text-white transition-colors">
                  Asesoría Laboral
                </Link>
              </li>
              <li>
                <Link to="/navarro/constitucion" className="text-gray-300 hover:text-white transition-colors">
                  Constitución de Sociedades
                </Link>
              </li>
              <li>
                <Link to="/navarro/gestion" className="text-gray-300 hover:text-white transition-colors">
                  Gestión Empresarial
                </Link>
              </li>
              <li>
                <Link to="/navarro/internacional" className="text-gray-300 hover:text-white transition-colors">
                  Servicios Internacionales
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/navarro/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/navarro/equipo" className="text-gray-300 hover:text-white transition-colors">
                  Nuestro Equipo
                </Link>
              </li>
              <li>
                <Link to="/navarro/oficinas" className="text-gray-300 hover:text-white transition-colors">
                  Nuestras Oficinas
                </Link>
              </li>
              <li>
                <Link to="/navarro/casos-exito" className="text-gray-300 hover:text-white transition-colors">
                  Casos de Éxito
                </Link>
              </li>
              <li>
                <Link to="/navarro/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contactar
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Ir a Capittal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Offices */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <h5 className="font-medium text-white mb-4">Nuestras Oficinas</h5>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>Barcelona</span>
            <span>•</span>
            <span>Madrid</span>
            <span>•</span>
            <span>Girona</span>
            <span>•</span>
            <span>Lleida</span>
            <span>•</span>
            <span>Tarragona</span>
            <span>•</span>
            <span>Palma de Mallorca</span>
            <span>•</span>
            <span>Zaragoza</span>
            <span>•</span>
            <span>Valencia</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            <p>© 2025 Navarro & Asociados. Todos los derechos reservados.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/politica-privacidad" className="text-sm text-gray-400 hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            <Link to="/terminos-uso" className="text-sm text-gray-400 hover:text-white transition-colors">
              Términos de Uso
            </Link>
            <div className="flex items-center space-x-4 ml-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NavarroFooter;