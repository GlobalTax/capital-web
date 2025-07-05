import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from '@/components/LoadingButton';
import { useContactForm } from '@/hooks/useContactForm';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface SimplifiedContactProps {
  className?: string;
  title?: string;
  ctaText?: string;
}

const SimplifiedContact = ({ 
  className = '', 
  title = 'Solicita consultoría gratuita',
  ctaText = 'Enviar mensaje'
}: SimplifiedContactProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { submitContactForm, isSubmitting } = useContactForm();
  const { isOnline } = useNetworkStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptPrivacy) {
      alert('Debes aceptar la política de privacidad');
      return;
    }

    try {
      await submitContactForm({
        ...formData,
        company: '', // Campo opcional vacío
        country: '',
        companySize: '',
        referral: ''
      });
      
      setShowSuccess(true);
      setFormData({ fullName: '', email: '', phone: '', message: '' });
      setAcceptPrivacy(false);
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (showSuccess) {
    return (
      <div className={`bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.3)] rounded-lg p-6 text-center ${className}`}>
        <h3 className="text-lg font-semibold text-[hsl(var(--success))] mb-2">
          ¡Gracias por tu mensaje!
        </h3>
        <p className="text-[hsl(var(--muted-foreground))]">
          Te contactamos en menos de 24 horas
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-6 text-center">
        {title}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Nombre *
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@empresa.com"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Teléfono
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+34 600 000 000"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Mensaje
          </label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Cuéntanos sobre tu empresa..."
            maxLength={140}
            rows={3}
            className="w-full resize-none"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            {formData.message.length}/140 caracteres
          </p>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={acceptPrivacy}
            onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="privacy" className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            Acepto la{' '}
            <a 
              href="/politica-privacidad" 
              className="text-[hsl(var(--primary))] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad
            </a>
            {' '}y el tratamiento de mis datos personales para recibir información comercial.
          </label>
        </div>

        <LoadingButton
          loading={isSubmitting}
          disabled={isSubmitting || !isOnline || !acceptPrivacy}
          type="submit"
          className="w-full bg-[#ff6b00] text-white hover:bg-[#e55a00]"
        >
          {ctaText}
        </LoadingButton>
      </form>
    </div>
  );
};

export default SimplifiedContact;