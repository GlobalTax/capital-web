
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar
} from 'lucide-react';
import { ApolloCompany } from '@/types/integrations';

interface ApolloCompanyCardProps {
  company: ApolloCompany;
}

const ApolloCompanyCard = ({ company }: ApolloCompanyCardProps) => {
  const getEmployeeRangeColor = (count?: number) => {
    if (!count) return 'bg-gray-100 text-gray-800';
    if (count < 50) return 'bg-blue-100 text-blue-800';
    if (count < 200) return 'bg-green-100 text-green-800';
    if (count < 1000) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{company.company_name}</h3>
            {company.is_target_account && (
              <Badge className="bg-green-100 text-green-800">Target Account</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{company.company_domain}</p>
        </div>
        <Badge variant="outline">
          {new Date(company.last_enriched).toLocaleDateString('es-ES')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {company.industry && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{company.industry}</span>
          </div>
        )}
        
        {company.employee_count && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge className={getEmployeeRangeColor(company.employee_count)}>
              {company.employee_count} empleados
            </Badge>
          </div>
        )}
        
        {company.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{company.location}</span>
          </div>
        )}
        
        {company.founded_year && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Fundada en {company.founded_year}</span>
          </div>
        )}
      </div>

      {company.technologies && company.technologies.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Tecnologías:</p>
          <div className="flex flex-wrap gap-1">
            {company.technologies.slice(0, 6).map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {company.technologies.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{company.technologies.length - 6} más
              </Badge>
            )}
          </div>
        </div>
      )}

      {company.revenue_range && (
        <div className="pt-2 border-t">
          <p className="text-sm">
            <span className="font-medium">Rango de ingresos:</span> {company.revenue_range}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApolloCompanyCard;
