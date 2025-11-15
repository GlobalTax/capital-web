import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { getBreadcrumbSchema } from '@/utils/seo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <>
      <SEOHead 
        structuredData={getBreadcrumbSchema(items)}
      />
      <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground">/</span>
              )}
              {index === items.length - 1 ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.url} 
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
