
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNewsletter } from '@/hooks/useNewsletter';
import { NewsletterFormProps } from '@/types/forms';
import { cn } from '@/lib/utils';

const Newsletter: React.FC<NewsletterFormProps> = ({
  className,
  showName = false,
  showCompany = false,
  placeholder = "Tu email..."
}) => {
  const {
    email,
    fullName,
    company,
    isLoading,
    error,
    success,
    handleSubmit,
    handleEmailChange,
    handleNameChange,
    handleCompanyChange
  } = useNewsletter();

  if (success) {
    return (
      <div className={cn("text-center p-4", className)}>
        <p className="text-green-600 font-medium">
          ¡Gracias por suscribirte! Recibirás nuestras últimas noticias pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {showName && (
        <div className="space-y-2">
          <Label htmlFor="newsletter-name">Nombre</Label>
          <Input
            id="newsletter-name"
            type="text"
            value={fullName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Tu nombre..."
          />
        </div>
      )}

      {showCompany && (
        <div className="space-y-2">
          <Label htmlFor="newsletter-company">Empresa</Label>
          <Input
            id="newsletter-company"
            type="text"
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            placeholder="Tu empresa..."
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newsletter-email">Email</Label>
        <Input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder={placeholder}
          required
          error={error || undefined}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !email.trim()}
        className="w-full"
      >
        {isLoading ? 'Suscribiendo...' : 'Suscribirse'}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </form>
  );
};

export default Newsletter;
