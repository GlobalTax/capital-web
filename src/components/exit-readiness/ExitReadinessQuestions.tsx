import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExitReadinessQuestion } from './types';
import { cn } from '@/lib/utils';

interface ExitReadinessQuestionsProps {
  question: ExitReadinessQuestion;
  selectedAnswer: string | null;
  onAnswer: (value: string, points: number) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ExitReadinessQuestions: React.FC<ExitReadinessQuestionsProps> = ({
  question,
  selectedAnswer,
  onAnswer,
  onNext,
  onBack,
  isFirst,
  isLast
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">
        {question.question}
      </h3>
      
      <div className="space-y-3">
        {question.options.map((option) => (
          <Card
            key={option.value}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:border-primary/50",
              selectedAnswer === option.value 
                ? "border-primary bg-primary/5" 
                : "border-border"
            )}
            onClick={() => onAnswer(option.value, option.points)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div 
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    selectedAnswer === option.value 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  )}
                >
                  {selectedAnswer === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-foreground">{option.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirst}
        >
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedAnswer}
        >
          {isLast ? 'Ver Resultados' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

export default ExitReadinessQuestions;
