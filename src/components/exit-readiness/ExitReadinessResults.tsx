import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, ArrowRight, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExitReadinessResult } from './types';
import { getReadinessLabel, getReadinessDescription } from './exitReadinessQuestions';
import { cn } from '@/lib/utils';

interface ExitReadinessResultsProps {
  result: ExitReadinessResult;
  onClose: () => void;
}

const ExitReadinessResults: React.FC<ExitReadinessResultsProps> = ({
  result,
  onClose
}) => {
  const { totalScore, maxScore, readinessLevel, recommendations } = result;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getIcon = () => {
    switch (readinessLevel) {
      case 'ready':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'needs_work':
        return <XCircle className="w-12 h-12 text-orange-500" />;
    }
  };

  const getProgressColor = () => {
    switch (readinessLevel) {
      case 'ready': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'needs_work': return 'bg-orange-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con score */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {getReadinessLabel(readinessLevel)}
        </h3>
        <p className="text-muted-foreground mb-4">
          {getReadinessDescription(readinessLevel)}
        </p>
      </div>


      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Áreas de mejora recomendadas:</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3 pt-4 border-t">
        <p className="text-sm text-center text-muted-foreground mb-4">
          ¿Quieres hablar con un experto sobre cómo preparar tu empresa?
        </p>
        <Link to="/contacto" onClick={onClose}>
          <Button className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Solicitar consulta gratuita
          </Button>
        </Link>
        <Link to="/lp/calculadora" onClick={onClose}>
          <Button variant="outline" className="w-full">
            Obtener valoración de mi empresa
          </Button>
        </Link>
        <a href="tel:+34695717490" className="block">
          <Button variant="ghost" className="w-full">
            <Phone className="w-4 h-4 mr-2" />
            Llamar ahora: 695 717 490
          </Button>
        </a>
      </div>

      <Button variant="link" onClick={onClose} className="w-full">
        Cerrar
      </Button>
    </div>
  );
};

export default ExitReadinessResults;
