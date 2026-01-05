import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
}

const tocItems: TOCItem[] = [
  { id: 'que-es', title: '¿Qué es un Search Fund?' },
  { id: 'modelos', title: 'Modelos de Search Funds' },
  { id: 'objetivo-ideal', title: 'Objetivo Ideal' },
  { id: 'proceso', title: 'Proceso de Adquisición' },
  { id: 'estructura', title: 'Estructura de la Oferta' },
  { id: 'financiacion', title: 'Financiación' },
  { id: 'comparativa', title: 'SF vs Private Equity' },
  { id: 'espana', title: 'España como Hub' },
  { id: 'recursos', title: 'Recursos' },
  { id: 'faq', title: 'Preguntas Frecuentes' },
];

export const TableOfContents: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -80% 0%' }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-24 hidden lg:block">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <List className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Contenido</span>
        </div>
        <ul className="space-y-1">
          {tocItems.map(({ id, title }) => (
            <li key={id}>
              <button
                onClick={() => scrollToSection(id)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                  activeId === id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
