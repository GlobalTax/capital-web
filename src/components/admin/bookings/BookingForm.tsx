import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AdvisorSelector } from './AdvisorSelector';
import { ContactSelector } from './ContactSelector';
import { ContactForBooking } from './hooks/useContactsForBooking';
import { CreateBookingData } from './hooks/useCreateBooking';

interface BookingFormProps {
  onSubmit: (data: CreateBookingData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateBookingData>;
}

const MEETING_TYPES = [
  { value: 'initial_consultation', label: 'Consulta Inicial' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'valuation_review', label: 'Revisión de Valoración' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'closing', label: 'Cierre' },
  { value: 'other', label: 'Otro' },
];

const MEETING_FORMATS = [
  { value: 'video_call', label: 'Videollamada' },
  { value: 'phone_call', label: 'Llamada telefónica' },
  { value: 'in_person', label: 'Presencial' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export const BookingForm = ({ onSubmit, isLoading, defaultValues }: BookingFormProps) => {
  const [formData, setFormData] = useState<Partial<CreateBookingData>>({
    client_name: defaultValues?.client_name || '',
    client_email: defaultValues?.client_email || '',
    client_phone: defaultValues?.client_phone || '',
    company_name: defaultValues?.company_name || '',
    booking_date: defaultValues?.booking_date || '',
    booking_time: defaultValues?.booking_time || '',
    meeting_type: defaultValues?.meeting_type || 'initial_consultation',
    meeting_format: defaultValues?.meeting_format || 'video_call',
    assigned_to: defaultValues?.assigned_to || '',
    notes: defaultValues?.notes || '',
    send_confirmation_email: true,
  });

  const [selectedContact, setSelectedContact] = useState<ContactForBooking | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    defaultValues?.booking_date ? new Date(defaultValues.booking_date) : undefined
  );

  const handleContactSelect = (contact: ContactForBooking | null) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        client_name: contact.full_name,
        client_email: contact.email,
        client_phone: contact.phone || '',
        company_name: contact.company || '',
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        booking_date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_email || !formData.booking_date || !formData.booking_time) {
      return;
    }

    onSubmit(formData as CreateBookingData);
  };

  const updateField = (field: keyof CreateBookingData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Contact Selector */}
      <div className="space-y-2">
        <Label>Seleccionar contacto</Label>
        <ContactSelector
          selectedContact={selectedContact}
          onSelect={handleContactSelect}
        />
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_name">Nombre del cliente *</Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => updateField('client_name', e.target.value)}
            placeholder="Juan García"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_email">Email *</Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => updateField('client_email', e.target.value)}
            placeholder="juan@empresa.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_phone">Teléfono</Label>
          <Input
            id="client_phone"
            value={formData.client_phone}
            onChange={(e) => updateField('client_phone', e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Empresa</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
            placeholder="Nombre de la empresa"
          />
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Hora *</Label>
          <Select
            value={formData.booking_time}
            onValueChange={(value) => updateField('booking_time', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona hora" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de reunión</Label>
          <Select
            value={formData.meeting_type}
            onValueChange={(value) => updateField('meeting_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEETING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Formato</Label>
          <Select
            value={formData.meeting_format}
            onValueChange={(value) => updateField('meeting_format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEETING_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advisor Assignment */}
      <div className="space-y-2">
        <Label>Asesor asignado</Label>
        <AdvisorSelector
          value={formData.assigned_to || ''}
          onChange={(value) => updateField('assigned_to', value)}
          placeholder="Selecciona un asesor (opcional)"
          showUnassign
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Notas sobre la reunión..."
          rows={3}
        />
      </div>

      {/* Send Email */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="send_email"
          checked={formData.send_confirmation_email}
          onCheckedChange={(checked) => updateField('send_confirmation_email', checked)}
        />
        <Label htmlFor="send_email" className="font-normal cursor-pointer">
          Enviar email de confirmación al cliente
        </Label>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando reserva...
          </>
        ) : (
          'Crear Reserva'
        )}
      </Button>
    </form>
  );
};
