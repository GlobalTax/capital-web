import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CalendarDays, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useBookingKPIs } from './hooks/useBookings';
import { Skeleton } from '@/components/ui/skeleton';

export const BookingsKPIs = () => {
  const { data: kpis, isLoading } = useBookingKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiItems = [
    {
      label: 'Hoy',
      value: kpis?.todayCount || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Esta semana',
      value: kpis?.weekCount || 0,
      icon: CalendarDays,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Pendientes',
      value: kpis?.pendingCount || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Completadas',
      value: kpis?.completedCount || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Canceladas',
      value: kpis?.cancelledCount || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Tasa éxito',
      value: `${kpis?.confirmationRate || 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {kpiItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
