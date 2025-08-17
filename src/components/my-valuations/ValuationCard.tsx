import React from 'react';
import { CompanyValuation } from '@/core/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Copy, 
  Download, 
  Trash2, 
  Building2, 
  Calendar, 
  Euro,
  User,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValuationCardProps {
  valuation: CompanyValuation;
  onResume: (valuation: CompanyValuation) => void;
  onDuplicate: (valuation: CompanyValuation) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

const ValuationCard: React.FC<ValuationCardProps> = ({
  valuation,
  onResume,
  onDuplicate,
  onDelete,
  getStatusColor,
  getStatusLabel
}) => {
  const canResume = valuation.valuation_status !== 'completed' && valuation.unique_token;
  const isCompleted = valuation.valuation_status === 'completed';

  const handleDownloadPDF = async () => {
    // TODO: Implementar descarga de PDF
    console.log('Download PDF for valuation:', valuation.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {valuation.company_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {valuation.contact_name}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canResume && (
                <DropdownMenuItem onClick={() => onResume(valuation)} className="gap-2">
                  <Play className="w-4 h-4" />
                  Reanudar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(valuation)} className="gap-2">
                <Copy className="w-4 h-4" />
                Duplicar
              </DropdownMenuItem>
              {isCompleted && (
                <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2">
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(valuation.id)} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-3">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(valuation.valuation_status || 'started')} border-current`}
          >
            {getStatusLabel(valuation.valuation_status || 'started')}
          </Badge>
          
          {valuation.completion_percentage !== undefined && (
            <div className="text-sm text-muted-foreground">
              {valuation.completion_percentage}% completado
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Industry and Employee Range */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{valuation.industry}</span>
            </div>
            <div>
              {valuation.employee_range} empleados
            </div>
          </div>

          {/* Financial Data */}
          {(valuation.revenue || valuation.final_valuation) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {valuation.revenue && (
                <div>
                  <div className="text-muted-foreground">Facturación</div>
                  <div className="font-medium">
                    {valuation.revenue.toLocaleString('es-ES', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0
                    })}
                  </div>
                </div>
              )}
              
              {valuation.final_valuation && (
                <div>
                  <div className="text-muted-foreground">Valoración</div>
                  <div className="font-bold text-primary">
                    {valuation.final_valuation.toLocaleString('es-ES', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(valuation.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {canResume && (
              <Button 
                size="sm" 
                onClick={() => onResume(valuation)}
                className="flex-1 gap-2"
              >
                <Play className="w-4 h-4" />
                Reanudar
              </Button>
            )}
            
            {isCompleted && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDuplicate(valuation)}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValuationCard;