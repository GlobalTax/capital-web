
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  PenTool, 
  Users, 
  BarChart3,
  MessageSquare
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    caseStudies: number;
    operations: number;
    blogPosts: number;
    testimonials: number;
    teamMembers: number;
    statistics: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statCards = [
    {
      title: 'Casos de Éxito',
      value: stats.caseStudies,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
      link: '/admin/case-studies'
    },
    {
      title: 'Operaciones',
      value: stats.operations,
      icon: Building2,
      color: 'text-green-600 bg-green-100',
      link: '/admin/operations'
    },
    {
      title: 'Posts del Blog',
      value: stats.blogPosts,
      icon: PenTool,
      color: 'text-purple-600 bg-purple-100',
      link: '/admin/blog'
    },
    {
      title: 'Testimonios',
      value: stats.testimonials,
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-100',
      link: '/admin/testimonials'
    },
    {
      title: 'Miembros del Equipo',
      value: stats.teamMembers,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-100',
      link: '/admin/team'
    },
    {
      title: 'Estadísticas Clave',
      value: stats.statistics,
      icon: BarChart3,
      color: 'text-red-600 bg-red-100',
      link: '/admin/statistics'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Link key={stat.title} to={stat.link}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-normal text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default DashboardStats;
