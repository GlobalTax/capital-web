import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Linkedin, 
  Check,
  Loader2,
  ExternalLink 
} from 'lucide-react';
import type { ApolloCandidate } from '@/types/apollo';

interface ApolloMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: ApolloCandidate[];
  leadName: string;
  companyName: string;
  isConfirming: boolean;
  onConfirm: (apolloOrgId: string) => void;
}

export const ApolloMatchModal: React.FC<ApolloMatchModalProps> = ({
  isOpen,
  onClose,
  candidates,
  leadName,
  companyName,
  isConfirming,
  onConfirm,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedId) {
      onConfirm(selectedId);
    }
  };

  const formatEmployees = (num?: number) => {
    if (!num) return null;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Seleccionar empresa correcta
          </DialogTitle>
          <DialogDescription>
            Se encontraron varias empresas para <strong>{companyName || leadName}</strong>. 
            Por favor, selecciona la correcta para enriquecer los datos.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 py-2">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedId(candidate.id)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedId === candidate.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                {/* Selection indicator */}
                {selectedId === candidate.id && (
                  <div className="absolute top-3 right-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {candidate.logo_url ? (
                      <img 
                        src={candidate.logo_url} 
                        alt={candidate.name}
                        className="h-12 w-12 rounded-lg object-contain bg-white border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h4 className="font-semibold text-foreground truncate pr-8">
                        {candidate.name}
                      </h4>
                      {candidate.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {candidate.short_description}
                        </p>
                      )}
                    </div>

                    {/* Metadata badges */}
                    <div className="flex flex-wrap gap-2">
                      {candidate.primary_domain && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Globe className="h-3 w-3" />
                          {candidate.primary_domain}
                        </Badge>
                      )}
                      
                      {(candidate.city || candidate.country) && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {[candidate.city, candidate.country].filter(Boolean).join(', ')}
                        </Badge>
                      )}
                      
                      {candidate.estimated_num_employees && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Users className="h-3 w-3" />
                          {formatEmployees(candidate.estimated_num_employees)} empleados
                        </Badge>
                      )}
                      
                      {candidate.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {candidate.industry}
                        </Badge>
                      )}
                    </div>

                    {/* Links */}
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="h-3 w-3" />
                        Ver en LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedId || isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirmar selección
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
