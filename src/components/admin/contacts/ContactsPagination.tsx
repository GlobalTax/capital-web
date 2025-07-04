import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ContactsPaginationProps {
  currentPage: number;
  totalContacts: number;
  contactsPerPage: number;
  hasMore: boolean;
  isLoading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
}

export const ContactsPagination: React.FC<ContactsPaginationProps> = ({
  currentPage,
  totalContacts,
  contactsPerPage,
  hasMore,
  isLoading,
  onPrevPage,
  onNextPage,
  onGoToPage
}) => {
  const totalPages = Math.ceil(totalContacts / contactsPerPage);
  const startItem = (currentPage - 1) * contactsPerPage + 1;
  const endItem = Math.min(currentPage * contactsPerPage, totalContacts);

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: number[] = [];
    
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);
    
    // Add first page if not in range
    if (rangeStart > 1) {
      pages.push(1);
      if (rangeStart > 2) {
        pages.push(-1); // Placeholder for ellipsis
      }
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add last page if not in range
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        pages.push(-1); // Placeholder for ellipsis
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-background">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>
          Mostrando {startItem} - {endItem} de {totalContacts} contactos
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToPage(1)}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Previous page */}
        <Button
          variant="outline" 
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            page === -1 ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onGoToPage(page)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            )
          ))}
        </div>
        
        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasMore || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToPage(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};