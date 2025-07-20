
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContactForm } from '@/hooks/useContactForm';
import { ContactFormProps } from '@/types/forms';
import { validateContactName } from '@/utils/validationUtils';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

const Contact: React.FC<ContactFormProps> = ({ 
  onSuccess,
  onError,
  className 
}) => {
  const {
    formData,
    isLoading,
    errors,
    handleSubmit,
    handleChange,
    resetForm
  } = useContactForm();

  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      await handleSubmit(e);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
    }
  };

  return (
    <div className={className}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Contacta con nosotros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo *</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                  className={errors.full_name ? 'border-destructive' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  required
                  className={errors.company ? 'border-destructive' : ''}
                />
                {errors.company && (
                  <p className="text-sm text-destructive mt-1">{errors.company}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_size">Tamaño de empresa</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value) => handleChange('company_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 empleados</SelectItem>
                    <SelectItem value="11-50">11-50 empleados</SelectItem>
                    <SelectItem value="51-200">51-200 empleados</SelectItem>
                    <SelectItem value="201-1000">201-1000 empleados</SelectItem>
                    <SelectItem value="1000+">Más de 1000 empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral">¿Cómo nos conociste?</Label>
              <Textarea
                id="referral"
                value={formData.referral}
                onChange={(e) => handleChange('referral', e.target.value)}
                placeholder="Cuéntanos cómo llegaste hasta nosotros..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
