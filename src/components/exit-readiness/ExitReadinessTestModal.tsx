import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import ExitReadinessProgress from './ExitReadinessProgress';
import ExitReadinessQuestions from './ExitReadinessQuestions';
import ExitReadinessLeadForm from './ExitReadinessLeadForm';
import ExitReadinessResults from './ExitReadinessResults';
import { EXIT_READINESS_QUESTIONS, MAX_SCORE, getReadinessLevel } from './exitReadinessQuestions';
import { ExitReadinessResponse, ExitReadinessResult, ExitReadinessLeadData } from './types';
import { useExitReadinessTest } from '@/hooks/useExitReadinessTest';

interface ExitReadinessTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TestStep = 'questions' | 'lead-form' | 'results';

const ExitReadinessTestModal: React.FC<ExitReadinessTestModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<TestStep>('questions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<ExitReadinessResponse[]>([]);
  const [result, setResult] = useState<ExitReadinessResult | null>(null);
  
  const { saveTestResults, isLoading } = useExitReadinessTest();

  const currentQuestion = EXIT_READINESS_QUESTIONS[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);

  const handleAnswer = useCallback((value: string, points: number) => {
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== currentQuestion.id);
      return [...filtered, { questionId: currentQuestion.id, answer: value, points }];
    });
  }, [currentQuestion?.id]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < EXIT_READINESS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Test completed, show lead form
      setCurrentStep('lead-form');
    }
  }, [currentQuestionIndex]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const calculateResult = useCallback((): ExitReadinessResult => {
    const totalScore = responses.reduce((acc, r) => acc + r.points, 0);
    const readinessLevel = getReadinessLevel(totalScore);
    
    // Generate recommendations based on low-scoring answers
    const recommendations: string[] = [];
    responses.forEach(response => {
      const question = EXIT_READINESS_QUESTIONS.find(q => q.id === response.questionId);
      if (question && response.points < 10) {
        recommendations.push(question.recommendation);
      }
    });

    return {
      totalScore,
      maxScore: MAX_SCORE,
      readinessLevel,
      recommendations,
      responses
    };
  }, [responses]);

  const handleLeadSubmit = async (leadData: ExitReadinessLeadData) => {
    const calculatedResult = calculateResult();
    
    const saveResult = await saveTestResults({
      leadData,
      responses: calculatedResult.responses,
      totalScore: calculatedResult.totalScore,
      readinessLevel: calculatedResult.readinessLevel,
      recommendations: calculatedResult.recommendations
    });

    if (saveResult.success) {
      setResult(calculatedResult);
      setCurrentStep('results');
    }
  };

  const handleClose = useCallback(() => {
    // Reset state when closing
    setCurrentStep('questions');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResult(null);
    onClose();
  }, [onClose]);

  const totalScore = responses.reduce((acc, r) => acc + r.points, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'questions' && 'Test Exit-Ready'}
            {currentStep === 'lead-form' && 'Tus Resultados'}
            {currentStep === 'results' && 'Resultado del Test'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'questions' && currentQuestion && (
          <>
            <ExitReadinessProgress
              currentStep={currentQuestionIndex + 1}
              totalSteps={EXIT_READINESS_QUESTIONS.length}
            />
            <ExitReadinessQuestions
              question={currentQuestion}
              selectedAnswer={currentResponse?.answer || null}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === EXIT_READINESS_QUESTIONS.length - 1}
            />
          </>
        )}

        {currentStep === 'lead-form' && (
          <ExitReadinessLeadForm
            onSubmit={handleLeadSubmit}
            isLoading={isLoading}
            totalScore={totalScore}
          />
        )}

        {currentStep === 'results' && result && (
          <ExitReadinessResults
            result={result}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExitReadinessTestModal;
