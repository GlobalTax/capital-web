import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { useSupabaseValuation } from '@/hooks/useSupabaseValuation';

interface ToolRatingProps {
  companyData: any;
}

const ToolRating: React.FC<ToolRatingProps> = ({ companyData }) => {
  const [ratings, setRatings] = useState({
    ease_of_use: 0,
    result_accuracy: 0,
    recommendation: 0
  });
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState(companyData?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();
  const { createToolRating } = useHubSpotIntegration();
  const { saveToolRating } = useSupabaseValuation();

  const setRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (ratings.ease_of_use === 0 || ratings.result_accuracy === 0 || ratings.recommendation === 0) {
      toast({
        title: "Valoración incompleta",
        description: "Por favor, valora todos los aspectos de la herramienta",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        ease_of_use: ratings.ease_of_use,
        result_accuracy: ratings.result_accuracy,
        recommendation: ratings.recommendation,
        feedback_comment: feedback,
        user_email: email,
        company_sector: companyData?.industry || '',
        company_size: companyData?.employeeRange || ''
      };

      // Guardar primero en Supabase
      await saveToolRating(ratingData);

      // Luego enviar a HubSpot
      try {
        await createToolRating(ratingData);
      } catch (hubspotError) {
        console.warn('Error enviando a HubSpot, pero datos guardados en Supabase:', hubspotError);
      }

      setIsSubmitted(true);
      toast({
        title: "¡Gracias por tu valoración!",
        description: "Tu feedback nos ayuda a mejorar la herramienta",
      });
    } catch (error) {
      console.error('Error enviando valoración:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la valoración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ¡Gracias por tu valoración!
        </h3>
        <p className="text-green-700">
          Tu feedback es muy valioso para nosotros y nos ayuda a mejorar continuamente 
          nuestra herramienta de valoración empresarial.
        </p>
      </div>
    );
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        Valora nuestra herramienta
      </h3>
      <p className="text-blue-700 mb-6">
        Tu opinión nos ayuda a mejorar. ¿Qué te ha parecido la calculadora de valoración?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StarRating
          value={ratings.ease_of_use}
          onChange={(rating) => setRating('ease_of_use', rating)}
          label="Facilidad de uso"
        />
        <StarRating
          value={ratings.result_accuracy}
          onChange={(rating) => setRating('result_accuracy', rating)}
          label="Precisión del resultado"
        />
        <StarRating
          value={ratings.recommendation}
          onChange={(rating) => setRating('recommendation', rating)}
          label="¿La recomendarías?"
        />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios adicionales (opcional)
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Cuéntanos qué te ha gustado más o qué podríamos mejorar..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (opcional, para seguimiento)
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center"
      >
        <Send className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Enviando valoración...' : 'Enviar valoración'}
      </Button>
    </div>
  );
};

export default ToolRating;
