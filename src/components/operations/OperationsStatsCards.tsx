import { Building2, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OperationsStatsCardsProps {
  totalOperations: number;
  activeOperations: number;
  thisYearOperations: number;
  withFinancialData: number;
}

export const OperationsStatsCards = ({ 
  totalOperations, 
  activeOperations, 
  thisYearOperations, 
  withFinancialData 
}: OperationsStatsCardsProps) => {
  const stats = [
    {
      label: 'Total Operaciones',
      value: totalOperations,
      icon: Building2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-gray-700'
    },
    {
      label: 'Activas',
      value: activeOperations,
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-gray-700'
    },
    {
      label: 'Este Año',
      value: thisYearOperations,
      icon: Calendar,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-gray-700'
    },
    {
      label: 'Con Datos Financieros',
      value: withFinancialData,
      icon: BarChart3,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-100 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-normal text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`h-10 w-10 ${stat.iconBg} rounded-full flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
