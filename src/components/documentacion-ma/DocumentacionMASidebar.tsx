
import React from 'react';
import { FileText, Users, Target, TrendingUp, Briefcase, Award } from 'lucide-react';
import { Icons } from '@/components/ui/icons';

const DocumentacionMASidebar = () => {
  const navigationItems = [{
    title: "¿Por qué nosotros?",
    icon: Award,
    items: [{
      label: 'Nuestro método',
      href: '#introduccion'
    }, {
      label: 'Conoce al equipo',
      href: '#tipos-operaciones'
    }, {
      label: 'Resultados',
      href: '#proceso-ma'
    }]
  }, {
    title: "Nuestro proceso",
    icon: Briefcase,
    items: [{
      label: 'Fase 1',
      href: '#valoracion'
    }, {
      label: 'Fase II: La lucha',
      href: '#due-diligence'
    }, {
      label: 'Dynamic Components',
      href: '#financiacion'
    }, {
      label: 'Customization',
      href: '#aspectos-legales'
    }]
  }, {
    title: "Style",
    icon: Target,
    items: [{
      label: 'Typography',
      href: '#integracion'
    }, {
      label: 'Spacing',
      href: '#integracion'
    }, {
      label: 'Variables',
      href: '#integracion'
    }]
  }];

  return (
    <div className="w-80 border-r border-gray-100 bg-white h-screen sticky top-20 overflow-y-auto">
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
                  <a key={itemIndex} href={item.href} className="block py-2 text-sm text-black hover:text-black transition-colors">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="mt-12 pt-8 border-t border-gray-100">
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
