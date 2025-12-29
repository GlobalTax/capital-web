import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Phone } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    variant: 'outline' as const,
    icon: Clock,
    className: 'border-yellow-500 text-yellow-600 bg-yellow-50'
  },
  confirmed: {
    label: 'Confirmada',
    variant: 'outline' as const,
    icon: CheckCircle,
    className: 'border-blue-500 text-blue-600 bg-blue-50'
  },
  completed: {
    label: 'Completada',
    variant: 'outline' as const,
    icon: Phone,
    className: 'border-green-500 text-green-600 bg-green-50'
  },
  cancelled: {
    label: 'Cancelada',
    variant: 'outline' as const,
    icon: XCircle,
    className: 'border-red-500 text-red-600 bg-red-50'
  }
};

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
