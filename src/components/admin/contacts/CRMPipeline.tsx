import React, { useState, useMemo } from 'react';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreVertical,
  Phone, 
  Mail, 
  Building, 
  Calendar,
  Star,
  User,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  Euro,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CRMPipelineProps {
  contacts: UnifiedContact[];
  onStatusUpdate: (contactId: string, status: string, source: string) => void;
  onContactSelect: (contactId: string) => void;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<any>;
  description: string;
}

const pipelineStages: PipelineStage[] = [
  {
    id: 'new',
    name: 'Nuevos Leads',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: User,
    description: 'Leads recién generados'
  },
  {
    id: 'contacted',
    name: 'Contactados',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Phone,
    description: 'Primer contacto realizado'
  },
  {
    id: 'qualified',
    name: 'Calificados',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Star,
    description: 'Leads calificados como oportunidades'
  },
  {
    id: 'opportunity',
    name: 'Oportunidades',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Target,
    description: 'Oportunidades activas'
  },
  {
    id: 'customer',
    name: 'Clientes',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: TrendingUp,
    description: 'Conversión exitosa'
  }
];

export const CRMPipeline: React.FC<CRMPipelineProps> = ({
  contacts,
  onStatusUpdate,
  onContactSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [draggedContact, setDraggedContact] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = searchTerm === '' || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = selectedStage === null || contact.status === selectedStage;
      
      return matchesSearch && matchesStage;
    });
  }, [contacts, searchTerm, selectedStage]);

  const contactsByStage = useMemo(() => {
    const grouped = pipelineStages.reduce((acc, stage) => {
      acc[stage.id] = filteredContacts.filter(contact => contact.status === stage.id);
      return acc;
    }, {} as Record<string, UnifiedContact[]>);
    return grouped;
  }, [filteredContacts]);

  const stageMetrics = useMemo(() => {
    return pipelineStages.map(stage => {
      const stageContacts = contactsByStage[stage.id] || [];
      const hotLeads = stageContacts.filter(c => c.is_hot_lead || (c.score || 0) >= 80).length;
      const avgScore = stageContacts.length > 0 
        ? stageContacts.reduce((sum, c) => sum + (c.score || 0), 0) / stageContacts.length 
        : 0;
      
      return {
        stage: stage.id,
        count: stageContacts.length,
        hotLeads,
        avgScore
      };
    });
  }, [contactsByStage]);

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    setDraggedContact(contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedContact) {
      const contact = contacts.find(c => c.id === draggedContact);
      if (contact && contact.status !== targetStage) {
        onStatusUpdate(draggedContact, targetStage, contact.source);
      }
      setDraggedContact(null);
    }
  };

  const ContactCard: React.FC<{ contact: UnifiedContact }> = ({ contact }) => {
    const isHotLead = contact.is_hot_lead || (contact.score || 0) >= 80;
    
    return (
      <Card 
        className={cn(
          "mb-3 cursor-pointer transition-all duration-200 hover:shadow-md",
          draggedContact === contact.id && "opacity-50",
          isHotLead && "ring-2 ring-orange-200 bg-orange-50/50"
        )}
        draggable
        onDragStart={(e) => handleDragStart(e, contact.id)}
        onClick={() => onContactSelect(contact.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                  {contact.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-admin-text-primary truncate">
                  {contact.name}
                </h4>
                <p className="text-xs text-admin-text-secondary truncate">
                  {contact.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isHotLead && (
                <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Llamar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar Email
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Programar Cita
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => onContactSelect(contact.id)}
                  >
                    <User className="h-4 w-4" />
                    Ver Perfil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {contact.company && (
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-3 w-3 text-admin-text-secondary" />
              <span className="text-xs text-admin-text-secondary truncate">
                {contact.company}
              </span>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-3 w-3 text-admin-text-secondary" />
              <span className="text-xs text-admin-text-secondary">
                {contact.phone}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {contact.score && (
                <Badge variant="secondary" className="text-xs">
                  Score: {contact.score}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {contact.source === 'contact_lead' ? 'Web' : 
                 contact.source === 'apollo' ? 'Apollo' : 'Tracking'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-admin-text-secondary">
              <Clock className="h-3 w-3" />
              {new Date(contact.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-admin-text-primary">Pipeline CRM</h2>
          <p className="text-admin-text-secondary">Gestión visual de leads y oportunidades</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Métricas del pipeline */}
      <div className="grid grid-cols-5 gap-4">
        {pipelineStages.map((stage, index) => {
          const metrics = stageMetrics.find(m => m.stage === stage.id);
          const conversionRate = index > 0 && stageMetrics[index - 1]?.count > 0
            ? ((metrics?.count || 0) / stageMetrics[index - 1].count) * 100
            : 100;

          return (
            <Card key={stage.id} className={cn("border-l-4", stage.borderColor)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stage.icon className={cn("h-5 w-5", stage.color)} />
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.count || 0}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm text-admin-text-primary mb-1">
                  {stage.name}
                </h3>
                <div className="space-y-1">
                  {metrics?.hotLeads ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-admin-text-secondary">
                        {metrics.hotLeads} hot
                      </span>
                    </div>
                  ) : null}
                  {index > 0 && (
                    <div className="text-xs text-admin-text-secondary">
                      {conversionRate.toFixed(1)}% conversión
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-5 gap-4 min-h-[600px]">
        {pipelineStages.map((stage) => (
          <div
            key={stage.id}
            className={cn(
              "rounded-lg border-2 border-dashed p-4 transition-colors",
              stage.borderColor,
              stage.bgColor,
              draggedContact && "border-solid opacity-80"
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <stage.icon className={cn("h-5 w-5", stage.color)} />
                <h3 className={cn("font-semibold", stage.color)}>
                  {stage.name}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  {contactsByStage[stage.id]?.length || 0}
                </Badge>
              </div>
              <p className="text-xs text-admin-text-secondary">
                {stage.description}
              </p>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {(contactsByStage[stage.id] || []).map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}

              {(contactsByStage[stage.id]?.length || 0) === 0 && (
                <div className="text-center py-8 text-admin-text-secondary">
                  <stage.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay contactos en esta etapa</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de conversión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Conversión del Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-admin-text-primary">
                {stageMetrics[0]?.count || 0}
              </div>
              <div className="text-sm text-admin-text-secondary">Leads Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stageMetrics.slice(1, 3).reduce((sum, m) => sum + (m?.count || 0), 0)}
              </div>
              <div className="text-sm text-admin-text-secondary">En Proceso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stageMetrics[3]?.count || 0}
              </div>
              <div className="text-sm text-admin-text-secondary">Oportunidades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stageMetrics[4]?.count || 0}
              </div>
              <div className="text-sm text-admin-text-secondary">Convertidos</div>
              <div className="text-xs text-admin-text-secondary mt-1">
                {contacts.length > 0 
                  ? ((stageMetrics[4]?.count || 0) / contacts.length * 100).toFixed(1)
                  : 0}% tasa
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMPipeline;