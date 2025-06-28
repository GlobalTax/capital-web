
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedDashboardStatsProps {
  stats: {
    caseStudies: number;
    operations: number;
    blogPosts: number;
    testimonials: number;
    teamMembers: number;
    statistics: number;
  };
}

const EnhancedDashboardStats = ({ stats }: EnhancedDashboardStatsProps) => {
  const statCards = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      link: '/admin/case-studies',
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      link: '/admin/operations',
      change: '+8%',
      trend: 'up',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      link: '/admin/blog',
      change: '+24%',
      trend: 'up',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      link: '/admin/testimonials',
      change: '+15%',
      trend: 'up',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Miembros del Equipo',
      value: stats.teamMembers,
      link: '/admin/team',
      change: '+5%',
      trend: 'up',
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Estadísticas Clave',
      value: stats.statistics,
      link: '/admin/statistics',
      change: '+18%',
      trend: 'up',
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <Link key={stat.title} to={stat.link} className="group">
          <Card className={`${stat.color} hover:shadow-md transition-all duration-200 hover:-translate-y-1`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className={`w-4 h-4 ${stat.iconColor}`} />
                    ) : (
                      <TrendingDown className={`w-4 h-4 text-red-600`} />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? stat.iconColor : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs mes anterior</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <div className={`w-6 h-6 rounded ${stat.iconColor.replace('text-', 'bg-').replace('-600', '-200')}`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default EnhancedDashboardStats;
