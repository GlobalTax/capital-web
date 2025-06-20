
import React from 'react';
import { 
  Building2, 
  Calculator, 
  FileText, 
  Users, 
  Clock,
  Shield,
  Target,
  TrendingUp,
  Scale
} from 'lucide-react';

const DocumentacionMASidebar = () => {
  const navigationItems = [
    {
      title: "¿Por qué nosotros?",
      icon: Building2,
      items: [
        { label: 'Nuestro método', href: '#introduccion' },
        { label: 'Conoce al equipo', href: '#tipos-operaciones' },
        { label: 'Resultados', href: '#proceso-ma' }
      ]
    },
    {
      title: "Nuestro proceso",
      icon: Clock,
      items: [
        { label: 'Fase 1', href: '#valoracion' },
        { label: 'Fase II: La lucha', href: '#due-diligence' },
        { label: 'Dynamic Components', href: '#financiacion' },
        { label: 'Customization', href: '#aspectos-legales' }
      ]
    },
    {
      title: "Style",
      icon: Target,
      items: [
        { label: 'Typography', href: '#integracion' },
        { label: 'Spacing', href: '#integracion' },
        { label: 'Variables', href: '#integracion' }
      ]
    }
  ];

  return (
    <div className="w-80 border-r border-gray-100 bg-white h-screen sticky top-20 overflow-y-auto">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src="/lovable-uploads/dfc75c41-289d-4bfd-963f-7838a1a06225.png" alt="Capittal" className="w-8 h-8" />
          </div>
          <div className="text-sm text-gray-500">Menu</div>
        </div>
        
        <nav className="space-y-8">
          {navigationItems.map((section, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 text-gray-400">
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-gray-700">{section.title}</div>
              </div>
              <div className="space-y-1 ml-8">
                {section.items.map((item, itemIndex) => (
                  <a 
                    key={itemIndex}
                    href={item.href}
                    className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900">
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <span>Github</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900">
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              <span>Twitter</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentacionMASidebar;
