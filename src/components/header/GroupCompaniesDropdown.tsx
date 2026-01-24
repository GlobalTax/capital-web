import React from 'react';
import { ChevronDown, ExternalLink, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupCompany } from '@/hooks/useTopBarConfig';

interface GroupCompaniesDropdownProps {
  companies: GroupCompany[];
}

export const GroupCompaniesDropdown: React.FC<GroupCompaniesDropdownProps> = ({ companies }) => {
  if (companies.length === 0) return null;

  const currentCompany = companies.find(c => c.is_current);
  const otherCompanies = companies.filter(c => !c.is_current);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none">
        <Building2 className="h-3.5 w-3.5" />
        <span>{currentCompany?.name || 'Grupo'}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {/* Current company (highlighted, no link) */}
        {currentCompany && (
          <DropdownMenuItem disabled className="font-medium text-primary">
            <span className="mr-2">★</span>
            {currentCompany.name}
          </DropdownMenuItem>
        )}
        
        {/* Other companies (with external links) */}
        {otherCompanies.map((company) => (
          <DropdownMenuItem key={company.id} asChild>
            <a
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full cursor-pointer"
            >
              <span>{company.name}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
