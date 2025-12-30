import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Phone, Eye, FileText, UserCheck } from 'lucide-react';
import { Booking, useUpdateBookingStatus } from './hooks/useBookings';
import { useAssignBooking } from './hooks/useBookingAssignment';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingDetailModal } from './BookingDetailModal';
import { AdvisorSelector } from './AdvisorSelector';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface BookingsTableProps {
  bookings: Booking[];
  isLoading: boolean;
}

export const BookingsTable = ({ bookings, isLoading }: BookingsTableProps) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  const { user } = useAuth();
  const updateStatus = useUpdateBookingStatus();
  const assignBooking = useAssignBooking();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleAssign = (bookingId: string, userId: string | null) => {
    if (!user?.id) return;
    assignBooking.mutate({ 
      bookingId, 
      assignedTo: userId, 
      assignedBy: user.id 
    });
  };

  const handleConfirm = (booking: Booking) => {
    updateStatus.mutate({ id: booking.id, status: 'confirmed' });
  };

  const handleComplete = (booking: Booking) => {
    updateStatus.mutate({ id: booking.id, status: 'completed' });
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancellationReason('');
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (bookingToCancel) {
      updateStatus.mutate({ 
        id: bookingToCancel.id, 
        status: 'cancelled',
        cancellationReason 
      });
    }
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEE d 'de' MMM", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay reservas que coincidan con los filtros</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.client_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.client_email}</p>
                    {booking.client_phone && (
                      <p className="text-xs text-muted-foreground">{booking.client_phone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{booking.company_name || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{formatDate(booking.booking_date)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">{booking.booking_time}</span>
                </TableCell>
                <TableCell>
                  {booking.assigned_user ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(booking.assigned_user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[100px]">
                        {booking.assigned_user.full_name || booking.assigned_user.email}
                      </span>
                    </div>
                  ) : (
                    <div className="w-[140px]">
                      <AdvisorSelector
                        value={null}
                        onChange={(userId) => handleAssign(booking.id, userId)}
                        placeholder="Asignar..."
                        showUnassign={false}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {booking.status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleConfirm(booking)}>
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                          Confirmar
                        </DropdownMenuItem>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <DropdownMenuItem onClick={() => handleComplete(booking)}>
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          Marcar completada
                        </DropdownMenuItem>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <DropdownMenuItem 
                          onClick={() => handleCancelClick(booking)}
                          className="text-destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la reserva de {bookingToCancel?.client_name}.
              Opcionalmente puedes indicar el motivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo de cancelación (opcional)"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground">
              Cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
