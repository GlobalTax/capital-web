import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Briefcase } from 'lucide-react';

const searcherProfiles = [
  {
    title: "MBA + Experiencia operativa",
    sectors: "Industrial",
    range: "€2-5M",
    status: "Activo",
    statusColor: "bg-emerald-100 text-emerald-700"
  },
  {
    title: "Ex-consultor Big 4",
    sectors: "Servicios B2B",
    range: "€3-8M",
    status: "Buscando",
    statusColor: "bg-blue-100 text-blue-700"
  },
  {
    title: "Emprendedor serial",
    sectors: "Tecnología",
    range: "€5-12M",
    status: "En proceso",
    statusColor: "bg-slate-100 text-slate-700"
  }
];

const metrics = [
  { value: "21+", label: "Searchers activos", icon: Users },
  { value: "€85M", label: "Capacidad total", icon: TrendingUp }
];

export const SearchFundsDataVisual: React.FC = () => {
  return (
    <motion.div 
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Perfiles Activos</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Red de searchers cualificados</p>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <motion.div 
              key={index}
              className="text-center p-4 bg-muted/50 border border-border rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <metric.icon className="h-4 w-4 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Lista de perfiles */}
        <div className="space-y-2">
          {searcherProfiles.map((profile, index) => (
            <motion.div 
              key={index}
              className="flex justify-between items-center p-3 bg-background border border-border rounded-lg hover:bg-muted/30 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground text-sm truncate">{profile.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {profile.sectors} • {profile.range}
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-3 ${profile.statusColor}`}>
                {profile.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
