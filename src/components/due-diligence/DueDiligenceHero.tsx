
import React from 'react';
import PremiumSectorHero from '@/components/sector/PremiumSectorHero';
import { Search, FileText, BarChart3, Shield, TrendingUp, Users } from 'lucide-react';

const DueDiligenceHero = () => {
  const metrics = [
    {
      value: "150+",
      label: "Due Diligence Realizados",
      icon: Search,
      change: "+18%"
    },
    {
      value: "€1.8B",
      label: "Valor Total Analizado",
      icon: TrendingUp,
      change: "+24%"
    },
    {
      value: "98%",
      label: "Precisión en Identificación",
      icon: Shield,
      change: "+2%"
    },
    {
      value: "6-8",
      label: "Semanas Promedio",
      icon: FileText
    }
  ];

  return (
    <PremiumSectorHero
      sector="Due Diligence"
      title="**Análisis Exhaustivo para Decisiones Seguras**"
      description="**Identificamos riesgos ocultos y oportunidades reales con metodología probada. Buy-side o Vendor Due Diligence adaptado a tus necesidades específicas.**"
      primaryButtonText="**Solicitar Due Diligence**"
      secondaryButtonText="**Ver Metodología**"
      metrics={metrics}
      gradientFrom="from-slate-50"
      gradientTo="to-blue-50"
    />
  );
};

export default DueDiligenceHero;
