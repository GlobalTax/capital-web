
import React from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Users, Target, TrendingUp, Briefcase, Award } from 'lucide-react';
import { Icons } from '@/components/ui/icons';

const DocumentacionMASidebar = () => {
  const location = useLocation();
  
  const navigationItems = [{
    title: "¿Por qué nosotros?",
    icon: Award,
    items: [{
      label: 'Nuestro método',
      href: '/documentacion-ma/nuestro-metodo'
    }, {
      label: 'Conoce al equipo',
      href: '/documentacion-ma/conoce-equipo'
    }, {
      label: 'Resultados',
      href: '/documentacion-ma/resultados'
    }]
  }, {
    title: "Nuestro proceso",
    icon: Briefcase,
    items: [{
      label: 'Fase 1',
      href: '/documentacion-ma/fase-1'
    }, {
      label: 'Fase II: La lucha',
      href: '/documentacion-ma/fase-2-lucha'
    }, {
      label: 'Dynamic Components',
      href: '/documentacion-ma/dynamic-components'
    }, {
      label: 'Customization',
      href: '/documentacion-ma/customization'
    }]
  }, {
    title: "Style",
    icon: Target,
    items: [{
      label: 'Typography',
      href: '/documentacion-ma/typography'
    }, {
      label: 'Spacing',
      href: '/documentacion-ma/spacing'
    }, {
      label: 'Variables',
      href: '/documentacion-ma/variables'
    }]
  }];

  return (
    <div className="w-80 border-r border-gray-200 bg-white h-screen sticky top-20 overflow-y-auto">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            
          </div>
          
        </div>
        
        <nav className="space-y-8">
          {navigationItems.map((section, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 text-black">
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-black">{section.title}</div>
              </div>
              <div className="space-y-1 ml-8">
                {section.items.map((item, itemIndex) => (
                  <a 
                    key={itemIndex} 
                    href={item.href} 
                    className={`block py-2 text-sm transition-colors ${
                      location.pathname === item.href 
                        ? 'text-black font-medium' 
                        : 'text-black hover:text-black'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-sm text-black hover:text-black">
              <div className="w-5 h-5">
                <Icons.github className="w-5 h-5" />
              </div>
              <span className="text-black">Github</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-sm text-black hover:text-black">
              <div className="w-5 h-5">
                <Icons.twitter className="w-5 h-5" />
              </div>
              <span className="text-black">Twitter</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentacionMASidebar;
