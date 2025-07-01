
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calculator, UserCheck, TrendingUp } from 'lucide-react';

interface LeadTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  stats: {
    total: number;
    contact: number;
    valuation: number;
    collaborator: number;
  };
}

const LeadTypeSelector = ({ selectedType, onTypeChange, stats }: LeadTypeSelectorProps) => {
  const types = [
    {
      id: 'all',
      label: 'Todos los Leads',
      icon: TrendingUp,
      count: stats.total,
      color: 'bg-gray-500',
      description: 'Vista completa de todos los leads'
    },
    {
      id: 'contact',
      label: 'Contactos',
      icon: Users,
      count: stats.contact,
      color: 'bg-blue-500',
      description: 'Leads del formulario de contacto'
    },
    {
      id: 'valuation',
      label: 'Valoraciones',
      icon: Calculator,
      count: stats.valuation,
      color: 'bg-green-500',
      description: 'Leads de la calculadora de valoración'
    },
    {
      id: 'collaborator',
      label: 'Colaboradores',
      icon: UserCheck,
      count: stats.collaborator,
      color: 'bg-purple-500',
      description: 'Solicitudes del programa de colaboradores'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;
        
        return (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => onTypeChange(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${type.color} bg-opacity-10`}>
                  <Icon className={`h-5 w-5 text-white`} style={{ color: type.color.replace('bg-', '').replace('-500', '') }} />
                </div>
                <Badge variant={isSelected ? "default" : "outline"}>
                  {type.count}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">
                {type.label}
              </h3>
              
              <p className="text-sm text-gray-500">
                {type.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LeadTypeSelector;
