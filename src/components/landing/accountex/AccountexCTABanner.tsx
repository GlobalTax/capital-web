import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AccountexLeadForm from './AccountexLeadForm';

const AccountexCTABanner = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              ¿Quieres reunirte con nuestro equipo en Accountex?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Aprovecha tu visita a Accountex Madrid 2025 para conocer en persona 
              cómo podemos ayudarte a impulsar tu negocio o el de tus clientes
            </p>
            <Button
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="text-base px-8 py-6"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agenda tu cita ahora
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dialog for Lead Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reserva tu reunión en Accountex</DialogTitle>
            <DialogDescription>
              Completa el formulario y nos pondremos en contacto para confirmar tu cita
            </DialogDescription>
          </DialogHeader>
          <AccountexLeadForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountexCTABanner;
