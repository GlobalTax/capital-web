
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  PenTool, 
  Users, 
  BarChart3,
  MessageSquare,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

interface ModernDashboardStatsProps {
  stats: {
    caseStudies: number;
    operations: number;
    blogPosts: number;
    testimonials: number;
    teamMembers: number;
    statistics: number;
  };
}

const ModernDashboardStats = ({ stats }: ModernDashboardStatsProps) => {
  const statCards = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      link: '/admin/case-studies',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      icon: Building2,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      link: '/admin/operations',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      icon: PenTool,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      link: '/admin/blog',
      change: '+24%',
      changeType: 'positive' as const
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      link: '/admin/testimonials',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Miembros del Equipo',
      value: stats.teamMembers,
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      link: '/admin/team',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Estadísticas Clave',
      value: stats.statistics,
      icon: BarChart3,
      gradient: 'from-rose-500 to-rose-600',
      bgGradient: 'from-rose-50 to-rose-100',
      link: '/admin/statistics',
      change: '+18%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Link key={stat.title} to={stat.link} className="group">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                    <span className="text-xs text-gray-500">vs mes anterior</span>
                  </div>
                </div>
                <div className="relative">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="absolute -top-1 -right-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ModernDashboardStats;
