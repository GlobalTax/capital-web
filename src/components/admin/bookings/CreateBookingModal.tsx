import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from './BookingForm';
import { useCreateBooking, CreateBookingData } from './hooks/useCreateBooking';

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBookingModal = ({ open, onOpenChange }: CreateBookingModalProps) => {
  const createBooking = useCreateBooking();

  const handleSubmit = async (data: CreateBookingData) => {
    await createBooking.mutateAsync(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Reserva</DialogTitle>
          <DialogDescription>
            Crea una nueva reserva de llamada manualmente. La reserva se confirmará automáticamente.
          </DialogDescription>
        </DialogHeader>

        <BookingForm
          onSubmit={handleSubmit}
          isLoading={createBooking.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
