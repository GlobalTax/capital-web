
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  title: string;
  url?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const AdminBreadcrumbs = ({ items }: AdminBreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link 
        to="/admin" 
        className="text-gray-500 hover:text-gray-900 font-light"
      >
        Inicio
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.url && index < items.length - 1 ? (
            <Link 
              to={item.url} 
              className="text-gray-500 hover:text-gray-900 font-light"
            >
              {item.title}
            </Link>
          ) : (
            <span className={`${index === items.length - 1 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              {item.title}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;
