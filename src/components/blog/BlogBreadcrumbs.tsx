import { Link } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Home, BookOpen } from 'lucide-react';

interface BlogBreadcrumbsProps {
  currentPage?: {
    title: string;
    category?: string;
  };
}

const BlogBreadcrumbs = ({ currentPage }: BlogBreadcrumbsProps) => {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/recursos/blog" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Blog
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {currentPage && (
          <>
            <BreadcrumbSeparator />
            {currentPage.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/recursos/blog?category=${encodeURIComponent(currentPage.category)}`}>
                      {currentPage.category}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate" title={currentPage.title}>
                {currentPage.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BlogBreadcrumbs;