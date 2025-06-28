
import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  url?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const AdminBreadcrumbs = ({ items }: AdminBreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <span>Dashboard</span>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-gray-400">/</span>
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
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;
