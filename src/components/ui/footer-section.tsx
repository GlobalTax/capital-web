
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"
import { Link } from 'react-router-dom'

function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t-0.5 border-black bg-white text-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <p className="mb-6 text-[14px] text-gray-600 font-bold">
              Tu socio estratégico en fusiones y adquisiciones. Únete a nuestro newsletter para las últimas actualizaciones.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Introduce tu email"
                className="pr-12 bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-black text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Suscribirse</span>
              </Button>
            </form>
          </div>
          
          <div>
            <h3 className="text-black font-bold mb-4">Servicios</h3>
            <nav className="space-y-2 text-[14px] text-gray-600 font-bold">
              <Link to="/venta-empresas" className="block hover:text-black transition-colors">
                Venta de Empresas
              </Link>
              <Link to="/compra-empresas" className="block hover:text-black transition-colors">
                Compra de Empresas
              </Link>
              <Link to="/calculadora-valoracion" className="block hover:text-black transition-colors">
                Valoración
              </Link>
              <Link to="/casos-exito" className="block hover:text-black transition-colors">
                Casos de Éxito
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="text-black font-bold mb-4">Empresa</h3>
            <nav className="space-y-2 text-[14px] text-gray-600 font-bold">
              <Link to="/nosotros" className="block hover:text-black transition-colors">
                Sobre Nosotros
              </Link>
              <Link to="/equipo" className="block hover:text-black transition-colors">
                Equipo
              </Link>
              <Link to="/contacto" className="block hover:text-black transition-colors">
                Contacto
              </Link>
              <Link to="/documentacion-ma" className="block hover:text-black transition-colors">
                Documentación M&A
              </Link>
            </nav>
          </div>
          
          <div className="relative">
            <h3 className="text-black font-bold mb-4">Contacto</h3>
            <address className="space-y-2 text-[14px] text-gray-600 font-bold not-italic mb-6">
              <p>P.º de la Castellana, 11, B - A</p>
              <p>Chamberí, 28046 Madrid</p>
              <p>Email: info@capittal.com</p>
            </address>
            
            <h4 className="text-black font-medium mb-4">Síguenos</h4>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white border-0.5 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white border-0.5 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white border-0.5 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Síguenos en Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white border-0.5 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conéctate con nosotros en LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
              <Moon className="h-4 w-4" />
              <Label htmlFor="dark-mode" className="sr-only">
                Cambiar modo oscuro
              </Label>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-0.5 border-black pt-8 text-center md:flex-row">
          <p className="text-[14px] text-gray-500 font-bold">
            © {new Date().getFullYear()} Capittal. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 text-[14px] text-gray-600 font-bold">
            <Link to="/politica-privacidad" className="hover:text-black transition-colors">
              Política de Privacidad
            </Link>
            <Link to="/terminos-uso" className="hover:text-black transition-colors">
              Términos de Uso
            </Link>
            <Link to="/cookies" className="hover:text-black transition-colors">
              Política de Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
