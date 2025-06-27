
"use client"

import * as React from "react"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { Link } from 'react-router-dom'

const sections = [
  {
    title: "Servicios",
    links: [
      { name: "Venta de Empresas", href: "/venta-empresas" },
      { name: "Compra de Empresas", href: "/compra-empresas" },
      { name: "Valoración", href: "/calculadora-valoracion" },
      { name: "Casos de Éxito", href: "/casos-exito" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { name: "Sobre Nosotros", href: "/nosotros" },
      { name: "Equipo", href: "/equipo" },
      { name: "Contacto", href: "/contacto" },
      { name: "Documentación M&A", href: "/documentacion-ma" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "Programa Colaboradores", href: "/programa-colaboradores" },
    ],
  },
];

const socialLinks = [
  { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
  { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
  { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
  { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
];

const legalLinks = [
  { name: "Política de Privacidad", href: "/politica-privacidad" },
  { name: "Términos de Uso", href: "/terminos-uso" },
  { name: "Política de Cookies", href: "/cookies" },
];

function Footerdemo() {
  return (
    <footer className="relative border-t-0.5 border-black bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-black">Capittal</h2>
              </Link>
            </div>
            <p className="max-w-[70%] text-sm text-gray-600">
              Tu socio estratégico en fusiones y adquisiciones. Expertos en M&A con más de una década de experiencia en el mercado español.
            </p>
            <div className="mb-6">
              <address className="space-y-1 text-sm text-gray-600 not-italic">
                <p>P.º de la Castellana, 11, B - A</p>
                <p>Chamberí, 28046 Madrid</p>
                <p>Email: info@capittal.com</p>
              </address>
            </div>
            <ul className="flex items-center space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    className="text-gray-600 hover:text-black transition-colors duration-300"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-black">{section.title}</h3>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        to={link.href}
                        className="text-gray-600 hover:text-black transition-colors duration-300 font-medium"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-12 flex flex-col justify-between gap-4 border-t-0.5 border-black pt-8 text-sm font-medium md:flex-row md:items-center">
          <p className="order-2 text-gray-600 lg:order-1">
            © {new Date().getFullYear()} Capittal. Todos los derechos reservados.
          </p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx}>
                <Link 
                  to={link.href}
                  className="text-gray-600 hover:text-black transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
