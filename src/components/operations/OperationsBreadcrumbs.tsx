import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OperationsBreadcrumbs = () => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <Link to="/admin" className="hover:text-gray-900 transition-colors">
        Inicio
      </Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      <Link to="/admin" className="hover:text-gray-900 transition-colors">
        Inicio
      </Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      <span className="text-gray-900 font-medium">Operaciones</span>
    </nav>
  );
};
