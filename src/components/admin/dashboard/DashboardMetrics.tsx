
import React from 'react';
import { FileText, Building2, Users, MessageSquare, Calculator, TrendingUp, PenTool, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
  valuations: number;
}

interface DashboardMetricsProps {
  stats: DashboardStats;
}

const DashboardMetrics = ({ stats }: DashboardMetricsProps) => {
  const metrics = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true,
      description: 'Transacciones exitosas documentadas'
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      icon: Building2,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: '+8%',
      trendUp: true,
      description: 'Deal flow y transacciones activas'
    },
    {
      title: 'Valoraciones',
      value: stats.valuations,
      icon: Calculator,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: '+25%',
      trendUp: true,
      description: 'Cálculos de valoración realizados'
    },
    {
      title: 'Blog Posts',
      value: stats.blogPosts,
      icon: PenTool,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: '+15%',
      trendUp: true,
      description: 'Contenido de marketing publicado'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      trend: '+5%',
      trendUp: true,
      description: 'Reseñas y testimonios de clientes'
    },
    {
      title: 'Estadísticas',
      value: stats.statistics,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      trend: '-2%',
      trendUp: false,
      description: 'KPIs y métricas del negocio'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.title}
          className={`bg-gradient-to-br ${metric.bgGradient} rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 ${metric.iconBg} rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              metric.trendUp 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {metric.trendUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {metric.trend}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-slate-600 text-sm font-medium">{metric.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-slate-900">{metric.value}</span>
              <span className="text-slate-500 text-sm">recursos</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{metric.description}</p>
          </div>
          
          {/* Mini sparkline placeholder */}
          <div className="mt-4 h-8 bg-white/30 rounded-lg flex items-end justify-between px-2 py-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t ${metric.gradient} rounded-full opacity-60`}
                style={{ height: `${Math.random() * 20 + 10}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
