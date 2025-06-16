import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-6">
              <img src="/capittal-logo.svg" alt="Capittal Logo" className="h-8 mr-3" />
              <span className="font-bold text-xl text-black">Capittal</span>
            </Link>
            <p className="text-gray-600">
              Tu socio estratégico en fusiones y adquisiciones.
            </p>
          </div>
          
          <div>
            <h3 className="text-black font-bold mb-4">Servicios</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/venta-empresas" className="hover:text-black transition-colors">Venta de Empresas</Link></li>
              <li><Link to="/compra-empresas" className="hover:text-black transition-colors">Compra de Empresas</Link></li>
              <li><Link to="/calculadora-valoracion" className="hover:text-black transition-colors">Valoración</Link></li>
              <li><Link to="/casos-exito" className="hover:text-black transition-colors">Casos de Éxito</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-black font-bold mb-4">Empresa</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/nosotros" className="hover:text-black transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/equipo" className="hover:text-black transition-colors">Equipo</Link></li>
              <li><Link to="/contacto" className="hover:text-black transition-colors">Contacto</Link></li>
              <li><Link to="/admin" className="hover:text-black transition-colors">Administración</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-black font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/politica-privacidad" className="hover:text-black transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/terminos-uso" className="hover:text-black transition-colors">Términos de Uso</Link></li>
              <li><Link to="/cookies" className="hover:text-black transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-300 pt-6 text-center text-gray-500">
          © {new Date().getFullYear()} Capittal. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
