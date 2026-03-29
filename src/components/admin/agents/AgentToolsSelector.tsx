import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Database, Search, BarChart3, Mail, FileText, RefreshCw } from 'lucide-react';

const TOOLS = [
  {
    name: 'query_leads',
    label: 'Consultar Leads',
    description: 'Buscar y filtrar leads del sistema',
    icon: Search,
    category: 'lectura',
  },
  {
    name: 'query_valuations',
    label: 'Consultar Valoraciones',
    description: 'Acceder a datos de valoraciones de empresas',
    icon: Database,
    category: 'lectura',
  },
  {
    name: 'query_contacts',
    label: 'Consultar Contactos',
    description: 'Buscar contactos en el CRM',
    icon: Search,
    category: 'lectura',
  },
  {
    name: 'get_dashboard_stats',
    label: 'Métricas Dashboard',
    description: 'Obtener estadísticas y KPIs del sistema',
    icon: BarChart3,
    category: 'lectura',
  },
  {
    name: 'generate_content',
    label: 'Generar Contenido',
    description: 'Crear emails, blogs, propuestas',
    icon: FileText,
    category: 'accion',
  },
  {
    name: 'update_lead_status',
    label: 'Actualizar Estado Lead',
    description: 'Cambiar el estado de un lead (requiere confirmación)',
    icon: RefreshCw,
    category: 'escritura',
  },
];

interface AgentToolsSelectorProps {
  selected: string[];
  onChange: (tools: string[]) => void;
}

export const AgentToolsSelector: React.FC<AgentToolsSelectorProps> = ({ selected, onChange }) => {
  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter(t => t !== name)
        : [...selected, name]
    );
  };

  const categories = {
    lectura: 'Lectura de datos',
    accion: 'Acciones',
    escritura: 'Escritura (con confirmación)',
  };

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([cat, catLabel]) => {
        const catTools = TOOLS.filter(t => t.category === cat);
        if (catTools.length === 0) return null;
        return (
          <div key={cat} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{catLabel}</p>
            <div className="space-y-2">
              {catTools.map(tool => (
                <label
                  key={tool.name}
                  className="flex items-start gap-3 p-2.5 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(tool.name)}
                    onCheckedChange={() => toggle(tool.name)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <tool.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{tool.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgentToolsSelector;
