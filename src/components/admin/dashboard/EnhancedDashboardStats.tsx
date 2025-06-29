
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Building2, Users, MessageSquare, Calculator, TrendingUp } from 'lucide-react';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
  valuations: number;
}

interface EnhancedDashboardStatsProps {
  stats: DashboardStats;
}

const EnhancedDashboardStats = ({ stats }: EnhancedDashboardStatsProps) => {
  const statsData = [
    {
      title: "Casos de Éxito",
      value: stats.caseStudies,
      icon: FileText,
    },
    {
      title: "Operaciones",
      value: stats.operations,
      icon: Building2,
    },
    {
      title: "Valoraciones",
      value: stats.valuations,
      icon: Calculator,
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      icon: MessageSquare,
    },
    {
      title: "Testimonios",
      value: stats.testimonials,
      icon: Users,
    },
    {
      title: "Estadísticas",
      value: stats.statistics,
      icon: TrendingUp,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-light text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedDashboardStats;
