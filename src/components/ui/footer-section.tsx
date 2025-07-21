
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footerdemo = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Link to="/" className="text-2xl font-bold text-white">
                Capittal
              </Link>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Expertos en M&A y valoración de empresas. Ayudamos a empresarios a maximizar el valor de sus compañías en operaciones de compra-venta.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Carrer Ausias March, 36 Principal - P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>+34 912 345 678</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@capittal.es</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/servicios/valoraciones" className="text-gray-300 hover:text-white transition-colors">
                  Valoraciones
                </Link>
              </li>
              <li>
                <Link to="/servicios/venta-empresas" className="text-gray-300 hover:text-white transition-colors">
                  Venta de Empresas
                </Link>
              </li>
              <li>
                <Link to="/servicios/due-diligence" className="text-gray-300 hover:text-white transition-colors">
                  Due Diligence
                </Link>
              </li>
              <li>
                <Link to="/servicios/asesoramiento-legal" className="text-gray-300 hover:text-white transition-colors">
                  Asesoramiento Legal
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/equipo" className="text-gray-300 hover:text-white transition-colors">
                  Equipo
                </Link>
              </li>
              <li>
                <Link to="/casos-exito" className="text-gray-300 hover:text-white transition-colors">
                  Casos de Éxito
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Capittal. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6">
              <Link to="/politica-privacidad" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terminos-uso" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Uso
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
