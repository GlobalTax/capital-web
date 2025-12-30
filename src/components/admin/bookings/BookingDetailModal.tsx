import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Building2, Mail, Phone, FileText, Save, UserCheck, History } from 'lucide-react';
import { Booking, useUpdateBookingNotes, useUpdateBookingStatus } from './hooks/useBookings';
import { useAssignBooking, useAssignmentHistory } from './hooks/useBookingAssignment';
import { BookingStatusBadge } from './BookingStatusBadge';
import { AdvisorSelector } from './AdvisorSelector';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookingDetailModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

export const BookingDetailModal = ({ booking, open, onClose }: BookingDetailModalProps) => {
  const [notes, setNotes] = useState(booking?.notes || '');
  const [showHistory, setShowHistory] = useState(false);
  
  const { user } = useAuth();
  const updateNotes = useUpdateBookingNotes();
  const updateStatus = useUpdateBookingStatus();
  const assignBooking = useAssignBooking();
  const { data: assignmentHistory = [] } = useAssignmentHistory(booking?.id || null);

  useEffect(() => {
    if (booking) {
      setNotes(booking.notes || '');
    }
  }, [booking]);

  if (!booking) return null;

  const handleSaveNotes = () => {
    updateNotes.mutate({ id: booking.id, notes });
  };

  const handleAssign = (userId: string | null) => {
    if (!user?.id || !booking) return;
    assignBooking.mutate({
      bookingId: booking.id,
      assignedTo: userId,
      assignedBy: user.id
    });
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatDateTime = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalle de Reserva
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <BookingStatusBadge status={booking.status} />
            </div>

            <Separator />

            {/* Assignment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Asesor asignado
                </Label>
                {assignmentHistory.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs"
                  >
                    <History className="w-3 h-3 mr-1" />
                    Historial ({assignmentHistory.length})
                  </Button>
                )}
              </div>
              <AdvisorSelector
                value={booking.assigned_to}
                onChange={handleAssign}
                disabled={assignBooking.isPending}
              />
              
              {/* Assignment History */}
              {showHistory && assignmentHistory.length > 0 && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg space-y-2 text-xs">
                  {assignmentHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(entry.assigned_user?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">
                        {entry.assigned_user?.full_name || 'Sin asignar'} — {formatDateTime(entry.assigned_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm font-medium">{formatDate(booking.booking_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="text-sm font-medium font-mono">{booking.booking_time}</p>
                </div>
              </div>
            </div>

            <Separator />

          {/* Client Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm font-medium">{booking.client_name}</p>
              </div>
            </div>
            {booking.company_name && (
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="text-sm font-medium">{booking.company_name}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a href={`mailto:${booking.client_email}`} className="text-sm font-medium text-primary hover:underline">
                  {booking.client_email}
                </a>
              </div>
            </div>
            {booking.client_phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <a href={`tel:${booking.client_phone}`} className="text-sm font-medium text-primary hover:underline">
                    {booking.client_phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Meeting Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tipo de reunión</p>
              <p className="text-sm font-medium capitalize">{booking.meeting_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Formato</p>
              <p className="text-sm font-medium capitalize">{booking.meeting_format}</p>
            </div>
          </div>

            {booking.cancellation_reason && (
              <>
                <Separator />
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-xs text-destructive font-medium mb-1">Motivo de cancelación</p>
                  <p className="text-sm">{booking.cancellation_reason}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas internas
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas sobre esta reserva..."
                rows={3}
              />
              <Button 
                size="sm" 
                onClick={handleSaveNotes}
                disabled={updateNotes.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar notas
              </Button>
            </div>

            {/* Quick Actions */}
            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
              <>
                <Separator />
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateStatus.mutate({ id: booking.id, status: 'confirmed' });
                        onClose();
                      }}
                    >
                      Confirmar
                    </Button>
                  )}
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      updateStatus.mutate({ id: booking.id, status: 'completed' });
                      onClose();
                    }}
                  >
                    Marcar completada
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
