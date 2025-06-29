
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Building2, Users, MessageSquare, Calculator, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

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
      change: "+2.1%",
      changeType: "positive" as const,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      textColor: "text-blue-900",
      iconColor: "text-blue-600"
    },
    {
      title: "Operaciones",
      value: stats.operations,
      icon: Building2,
      change: "+1.8%",
      changeType: "positive" as const,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      textColor: "text-green-900",
      iconColor: "text-green-600"
    },
    {
      title: "Valoraciones",
      value: stats.valuations,
      icon: Calculator,
      change: "+12.5%",
      changeType: "positive" as const,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      textColor: "text-purple-900",
      iconColor: "text-purple-600"
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      icon: MessageSquare,
      change: "+4.2%",
      changeType: "positive" as const,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      textColor: "text-orange-900",
      iconColor: "text-orange-600"
    },
    {
      title: "Testimonios",
      value: stats.testimonials,
      icon: Users,
      change: "0.0%",
      changeType: "neutral" as const,
      gradient: "from-gray-500 to-gray-600",
      bgGradient: "from-gray-50 to-gray-100",
      textColor: "text-gray-900",
      iconColor: "text-gray-600"
    },
    {
      title: "Estadísticas",
      value: stats.statistics,
      icon: TrendingUp,
      change: "+0.8%",
      changeType: "positive" as const,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      textColor: "text-indigo-900",
      iconColor: "text-indigo-600"
    }
  ];

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return <ArrowUp className="h-4 w-4" />;
      case 'negative':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'neutral' ? 'text-gray-500' : 
                  'text-red-600'
                }`}>
                  {getTrendIcon(stat.changeType)}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>

              {/* Mini sparkline simulado */}
              <div className="mt-4 flex items-end space-x-1 h-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-t ${stat.gradient} rounded-sm flex-1 opacity-60`}
                    style={{
                      height: `${Math.random() * 100 + 20}%`,
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedDashboardStats;
