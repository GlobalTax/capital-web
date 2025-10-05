import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AccountexLeadForm from './AccountexLeadForm';

const AccountexHero = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownloadGuide = () => {
    // TODO: Implementar descarga de guía PDF
    console.log('Descargar guía');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="text-center">
          {/* Event Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Calendar className="w-4 h-4" />
            <span>Accountex Madrid 2025 | 25-26 Marzo | IFEMA</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Nos vemos en{' '}
            <span className="text-primary">Accountex 2025</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Descubre cómo Capittal ayuda a asesorías y empresas tecnológicas a 
            crecer a través de operaciones de fusiones y adquisiciones
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto text-base px-8 py-6"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Reservar reunión en Accountex
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleDownloadGuide}
              className="w-full sm:w-auto text-base px-8 py-6"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar guía gratuita
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>15+ años de experiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>200+ operaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Especialistas en M&A</span>
            </div>
          </motion.div>
        </div>
      </div>

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
    </section>
  );
};

export default AccountexHero;
