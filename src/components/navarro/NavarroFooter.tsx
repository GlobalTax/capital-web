import React from 'react';
import { Link } from 'react-router-dom';

const NavarroFooter: React.FC = () => {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-black mb-4">Navarro</h3>
            <p className="text-gray-600 mb-4">
              Asesoría legal, fiscal y laboral especializada para empresas. 
              Parte del Grupo Navarro junto con Capittal.
            </p>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Sede Central: Carrer Ausias March número 36, 08010. Barcelona.</p>
              <p>Otras oficinas: Madrid - Girona - Lleida - Tarragona - Palma de Mallorca - Zaragoza - Valencia</p>
              <p>Tel: <a href="tel:+34695717490" className="underline hover:text-black">+34 695 717 490</a></p>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-semibold text-black mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/navarro/legal" className="hover:text-black transition-colors">
                  Asesoría Legal
                </Link>
              </li>
              <li>
                <Link to="/navarro/fiscal" className="hover:text-black transition-colors">
                  Asesoría Fiscal
                </Link>
              </li>
              <li>
                <Link to="/navarro/laboral" className="hover:text-black transition-colors">
                  Asesoría Laboral
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="font-semibold text-black mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-black transition-colors">
                  Capittal
                </Link>
              </li>
              <li>
                <Link to="/navarro/contacto" className="hover:text-black transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidad" className="hover:text-black transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos-uso" className="hover:text-black transition-colors">
                  Términos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>© 2025 Navarro. Todos los derechos reservados. Parte del Grupo Navarro.</p>
        </div>
      </div>
    </footer>
  );
};

export default NavarroFooter;