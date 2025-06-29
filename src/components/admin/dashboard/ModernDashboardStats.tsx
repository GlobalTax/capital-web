
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Building2, Users, MessageSquare, BarChart3, TrendingUp, Calculator } from 'lucide-react';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
  valuations: number;
}

interface ModernDashboardStatsProps {
  stats: DashboardStats;
}

const ModernDashboardStats = ({ stats }: ModernDashboardStatsProps) => {
  const statsData = [
    {
      title: "Casos de Éxito",
      value: stats.caseStudies,
      icon: FileText,
      change: "+2.1%",
      changeType: "positive" as const
    },
    {
      title: "Operaciones",
      value: stats.operations,
      icon: Building2,
      change: "+1.8%",
      changeType: "positive" as const
    },
    {
      title: "Valoraciones",
      value: stats.valuations,
      icon: Calculator,
      change: "+12.5%",
      changeType: "positive" as const
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      icon: MessageSquare,
      change: "+4.2%",
      changeType: "positive" as const
    },
    {
      title: "Testimonios",
      value: stats.testimonials,
      icon: Users,
      change: "0.0%",
      changeType: "neutral" as const
    },
    {
      title: "Estadísticas",
      value: stats.statistics,
      icon: TrendingUp,
      change: "+0.8%",
      changeType: "positive" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ModernDashboardStats;
