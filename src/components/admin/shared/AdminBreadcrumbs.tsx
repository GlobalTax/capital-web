import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
  currentTitle?: string;
}

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ 
  items, 
  currentTitle 
}) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center space-x-2 text-sm text-admin-text-secondary mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1 p-1 h-auto hover:text-admin-text-primary"
      >
        <Home className="h-4 w-4" />
        Admin
      </Button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.path ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path!)}
              className="p-1 h-auto hover:text-admin-text-primary"
            >
              {item.label}
            </Button>
          ) : (
            <span className="text-admin-text-primary font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}

      {currentTitle && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-admin-text-primary font-medium">
            {currentTitle}
          </span>
        </>
      )}
    </nav>
  );
};