
import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import MinimalMetricCard from './MinimalMetricCard';
import { 
  FileText, 
  Building2, 
  Calculator, 
  PenTool, 
  MessageSquare, 
  TrendingUp 
} from 'lucide-react';

const MinimalDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const metrics = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: FileText,
      description: 'Transacciones documentadas',
      href: '/admin/case-studies'
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      icon: Building2,
      description: 'Deal flow activo',
      href: '/admin/operations'
    },
    {
      title: 'Valoraciones',
      value: stats.valuations,
      icon: Calculator,
      description: 'Cálculos realizados',
      href: '/admin/valuation-leads'
    },
    {
      title: 'Blog Posts',
      value: stats.blogPosts,
      icon: PenTool,
      description: 'Contenido publicado',
      href: '/admin/blog-v2'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      description: 'Reseñas de clientes',
      href: '/admin/testimonials'
    },
    {
      title: 'Estadísticas',
      value: stats.statistics,
      icon: TrendingUp,
      description: 'KPIs del negocio',
      href: '/admin/statistics'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-gray-900">
          Panel de Control
        </h1>
        <p className="text-gray-600">
          Gestiona tu contenido y monitorea el rendimiento · {currentTime}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <MinimalMetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            description={metric.description}
            href={metric.href}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Acciones rápidas:</span>
          <a href="/admin/blog-v2" className="text-gray-900 hover:underline">
            Nuevo post
          </a>
          <a href="/admin/case-studies" className="text-gray-900 hover:underline">
            Añadir caso
          </a>
          <a href="/admin/operations" className="text-gray-900 hover:underline">
            Nueva operación
          </a>
        </div>
      </div>
    </div>
  );
};

export default MinimalDashboardHome;
