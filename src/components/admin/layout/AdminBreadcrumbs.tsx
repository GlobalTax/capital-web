
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
        className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
      >
        Dashboard
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.url && index < items.length - 1 ? (
            <Link 
              to={item.url} 
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className={`${index === items.length - 1 ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
              {item.title}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;
