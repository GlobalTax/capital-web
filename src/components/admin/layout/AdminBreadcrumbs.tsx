
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  title: string;
  url?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const AdminBreadcrumbs = ({ items }: AdminBreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600">
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.url && index < items.length - 1 ? (
            <Link 
              to={item.url} 
              className="hover:text-gray-900 transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-gray-900 font-medium" : ""}>
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;
