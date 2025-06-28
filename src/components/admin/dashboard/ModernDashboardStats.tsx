
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
  ExternalLink
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
      link: '/admin/case-studies',
      change: '+12%'
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      icon: Building2,
      link: '/admin/operations',
      change: '+8%'
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      icon: PenTool,
      link: '/admin/blog',
      change: '+24%'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      link: '/admin/testimonials',
      change: '+15%'
    },
    {
      title: 'Miembros del Equipo',
      value: stats.teamMembers,
      icon: Users,
      link: '/admin/team',
      change: '+5%'
    },
    {
      title: 'Estadísticas Clave',
      value: stats.statistics,
      icon: BarChart3,
      link: '/admin/statistics',
      change: '+18%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Link key={stat.title} to={stat.link} className="group">
          <Card className="border border-gray-200 hover:border-gray-300 transition-colors bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">{stat.change}</span>
                    <span className="text-xs text-gray-400">vs mes anterior</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <stat.icon className="h-6 w-6 text-gray-500" />
                  <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
