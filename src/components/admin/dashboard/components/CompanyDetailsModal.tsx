
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CompanyVisit, formatTimeOnSite } from '../types/CompanyIntelligenceTypes';
import { 
  Building2, 
  BarChart3, 
  Eye, 
  Clock, 
  Users, 
  Mail, 
  Phone 
} from 'lucide-react';

interface CompanyDetailsModalProps {
  company: CompanyVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrichCompany: (domain: string) => void;
}

const CompanyDetailsModal = ({ 
  company, 
  isOpen, 
  onClose, 
  onEnrichCompany 
}: CompanyDetailsModalProps) => {
  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company.companyName}
          </DialogTitle>
          <DialogDescription>
            Información detallada de la empresa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-gray-600">Lead Score</div>
              <div className="text-lg font-bold">{company.leadScore}/100</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Eye className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">Páginas Vistas</div>
              <div className="text-lg font-bold">{company.pagesVisited.length}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm text-gray-600">Tiempo Total</div>
              <div className="text-lg font-bold">{formatTimeOnSite(company.timeOnSite)}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">Visitas</div>
              <div className="text-lg font-bold">{company.visitCount}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Información de la Empresa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sector:</span>
                <span className="ml-2 font-medium">{company.industry}</span>
              </div>
              <div>
                <span className="text-gray-600">Tamaño:</span>
                <span className="ml-2 font-medium">{company.size}</span>
              </div>
              <div>
                <span className="text-gray-600">Ubicación:</span>
                <span className="ml-2 font-medium">{company.location}</span>
              </div>
              <div>
                <span className="text-gray-600">Última visita:</span>
                <span className="ml-2 font-medium">
                  {company.lastVisit.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {company.pagesVisited.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Páginas Visitadas</h4>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <ul className="space-y-1 text-sm">
                  {company.pagesVisited.map((page, index) => (
                    <li key={index} className="text-gray-700">
                      • {page}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              className="flex-1"
              onClick={() => onEnrichCompany(company.domain)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contactar
            </Button>
            <Button 
              variant="outline"
              onClick={() => onEnrichCompany(company.domain)}
            >
              <Phone className="h-4 w-4 mr-2" />
              Llamar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsModal;
