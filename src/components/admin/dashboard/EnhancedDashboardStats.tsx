
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
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 lg:gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="bg-white border-0.5 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 rounded-lg bg-gray-50">
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-xs lg:text-sm text-gray-500 mb-1 truncate">{stat.title}</p>
                    <p className="text-lg lg:text-2xl font-light text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedDashboardStats;
