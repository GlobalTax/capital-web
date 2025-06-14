
import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCountAnimation } from '@/hooks/useCountAnimation';

interface ToolRatingProps {
  companyData: any;
}

const ToolRating: React.FC<ToolRatingProps> = ({ companyData }) => {
  const [ratings, setRatings] = useState({
    easeOfUse: 0,
    resultAccuracy: 0,
    recommendation: 0
  });
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalRatings, setTotalRatings] = useState(0);
  const { toast } = useToast();

  const { count: animatedCount, ref: countRef } = useCountAnimation(totalRatings, 2000);

  // Fetch total ratings count
  useEffect(() => {
    const fetchRatingsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('tool_ratings')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching ratings count:', error);
          return;
        }

        // Add a base number to make it seem like there are already many ratings
        const baseCount = 847; // Starting with a high number
        setTotalRatings((count || 0) + baseCount);
      } catch (error) {
        console.error('Error fetching ratings count:', error);
        // Fallback to base count if there's an error
        setTotalRatings(847);
      }
    };

    fetchRatingsCount();
  }, []);

  const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="transition-colors hover:scale-110 transform duration-200"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (ratings.easeOfUse === 0 || ratings.resultAccuracy === 0 || ratings.recommendation === 0) {
      toast({
        title: "Valoración incompleta",
        description: "Por favor, completa todas las valoraciones por estrellas",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tool_ratings')
        .insert({
          ease_of_use: ratings.easeOfUse,
          result_accuracy: ratings.resultAccuracy,
          recommendation: ratings.recommendation,
          feedback_comment: feedback || null,
          user_email: email || null,
          company_sector: companyData.industry,
          company_size: companyData.employeeRange,
          ip_address: null, // Se podría implementar si fuera necesario
          user_agent: navigator.userAgent
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      setTotalRatings(prev => prev + 1); // Actualizar contador localmente
      toast({
        title: "¡Gracias por tu valoración!",
        description: "Tu feedback nos ayuda a mejorar la herramienta",
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error al enviar valoración",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800">
              ¡Gracias por tu valoración!
            </h3>
            <p className="text-green-700">
              Tu feedback nos ayuda a mejorar continuamente nuestra herramienta
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¿Qué te ha parecido nuestra calculadora?
        </h3>
        <p className="text-gray-600 mb-3">
          Tu valoración nos ayuda a mejorar la herramienta para futuros usuarios
        </p>
        
        {/* Contador de valoraciones */}
        <div className="inline-flex items-center bg-white border border-gray-300 rounded-full px-4 py-2">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600">
              <span ref={countRef} className="font-semibold text-gray-900">{animatedCount}</span> valoraciones realizadas
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Valoraciones por estrellas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StarRating
            rating={ratings.easeOfUse}
            onRatingChange={(rating) => setRatings(prev => ({ ...prev, easeOfUse: rating }))}
            label="Facilidad de uso"
          />
          <StarRating
            rating={ratings.resultAccuracy}
            onRatingChange={(rating) => setRatings(prev => ({ ...prev, resultAccuracy: rating }))}
            label="Precisión de resultados"
          />
          <StarRating
            rating={ratings.recommendation}
            onRatingChange={(rating) => setRatings(prev => ({ ...prev, recommendation: rating }))}
            label="¿La recomendarías?"
          />
        </div>

        {/* Comentario opcional */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Comentarios adicionales (opcional)
          </label>
          <Textarea
            placeholder="Cuéntanos qué te ha gustado más o qué mejorarías..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Email opcional */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email (opcional - para enviarte actualizaciones)
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Botón enviar */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Enviando...' : 'Enviar Valoración'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolRating;
