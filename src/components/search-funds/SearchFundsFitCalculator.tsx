import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Calculator, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  options: { label: string; value: number; description?: string }[];
}

const questions: Question[] = [
  {
    id: 'revenue',
    question: '¿Cuál es la facturación anual de tu empresa?',
    options: [
      { label: 'Menos de €1M', value: 0, description: 'Demasiado pequeña para Search Funds' },
      { label: '€1M - €3M', value: 60, description: 'Tamaño mínimo viable' },
      { label: '€3M - €10M', value: 100, description: 'Rango ideal para Search Funds' },
      { label: '€10M - €20M', value: 80, description: 'Tamaño atractivo' },
      { label: 'Más de €20M', value: 40, description: 'Puede requerir PE tradicional' },
    ],
  },
  {
    id: 'ebitda',
    question: '¿Cuál es el EBITDA aproximado de tu empresa?',
    options: [
      { label: 'Negativo o 0', value: 0, description: 'Los Search Funds buscan rentabilidad' },
      { label: '€100K - €500K', value: 70, description: 'Rango inicial aceptable' },
      { label: '€500K - €1.5M', value: 100, description: 'Rango ideal' },
      { label: '€1.5M - €3M', value: 90, description: 'Muy atractivo' },
      { label: 'Más de €3M', value: 50, description: 'Puede superar capacidad típica' },
    ],
  },
  {
    id: 'sector',
    question: '¿En qué sector opera tu empresa?',
    options: [
      { label: 'Servicios B2B', value: 100, description: 'Sector preferido' },
      { label: 'Manufactura especializada', value: 90, description: 'Muy valorado' },
      { label: 'Distribución', value: 80, description: 'Buena opción' },
      { label: 'Servicios B2C', value: 60, description: 'Depende del modelo' },
      { label: 'Tecnología/SaaS', value: 70, description: 'Atractivo si hay recurrencia' },
    ],
  },
  {
    id: 'dependency',
    question: '¿Cuánto depende la empresa del fundador/dueño actual?',
    options: [
      { label: 'Muy alta - yo soy el negocio', value: 30, description: 'Riesgo de transición alto' },
      { label: 'Alta - participo en ventas clave', value: 60, description: 'Requiere plan de transición' },
      { label: 'Media - tengo equipo capaz', value: 90, description: 'Buena estructura' },
      { label: 'Baja - podría irme mañana', value: 100, description: 'Ideal para compradores' },
    ],
  },
  {
    id: 'motivation',
    question: '¿Cuál es tu principal motivación para vender?',
    options: [
      { label: 'Jubilación planificada', value: 100, description: 'Motivo ideal, tiempo flexible' },
      { label: 'Nuevo proyecto empresarial', value: 90, description: 'Buen momento de transición' },
      { label: 'Salud o circunstancias personales', value: 70, description: 'Puede requerir rapidez' },
      { label: 'Problemas financieros', value: 30, description: 'Señal de alerta para compradores' },
      { label: 'Oportunidad de mercado', value: 80, description: 'Buena narrativa' },
    ],
  },
  {
    id: 'timeline',
    question: '¿En qué plazo te gustaría cerrar la operación?',
    options: [
      { label: 'Menos de 6 meses', value: 50, description: 'Muy ajustado para Search Funds' },
      { label: '6-12 meses', value: 100, description: 'Plazo ideal' },
      { label: '12-18 meses', value: 90, description: 'Tiempo cómodo' },
      { label: 'Más de 18 meses', value: 70, description: 'Puede perder momentum' },
    ],
  },
];

export const SearchFundsFitCalculator = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const calculateScore = () => {
    const values = Object.values(answers);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: '¡Excelente candidato!',
        message: 'Tu empresa tiene un perfil ideal para Search Funds. Los searchers buscan activamente empresas como la tuya.',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle2,
      };
    } else if (score >= 60) {
      return {
        title: 'Buen candidato',
        message: 'Tu empresa tiene potencial para Search Funds. Algunos aspectos podrían optimizarse, pero vale la pena explorar esta opción.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: Sparkles,
      };
    } else {
      return {
        title: 'Otras opciones pueden ser mejores',
        message: 'Basándonos en tus respuestas, quizás un Private Equity o una venta tradicional se ajuste mejor a tu situación. Pero cada caso es único.',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        icon: XCircle,
      };
    }
  };

  const resetCalculator = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const score = calculateScore();
  const scoreInfo = getScoreMessage(score);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Calculadora de Compatibilidad
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Es tu empresa candidata para Search Funds?
          </h2>
          <p className="text-lg text-muted-foreground">
            Responde 6 preguntas rápidas y descubre si tu empresa encaja con el perfil que buscan los searchers.
          </p>
        </motion.div>

        <Card className="p-8 shadow-lg">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={`question-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
                    <span>{Math.round(progress)}% completado</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {questions[currentQuestion].question}
                </h3>

                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={option.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 ${
                        answers[questions[currentQuestion].id] === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <div className="font-medium text-foreground">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {currentQuestion > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                    className="mt-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${scoreInfo.bgColor} mb-6`}>
                  <scoreInfo.icon className={`w-10 h-10 ${scoreInfo.color}`} />
                </div>

                <div className="mb-6">
                  <div className="text-5xl font-bold text-foreground mb-2">{score}%</div>
                  <div className="text-lg text-muted-foreground">Puntuación de compatibilidad</div>
                </div>

                <h3 className={`text-2xl font-bold mb-3 ${scoreInfo.color}`}>
                  {scoreInfo.title}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {scoreInfo.message}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {score >= 60 ? (
                    <Button asChild size="lg">
                      <Link to="/contacto?origen=fit-calculator&score={score}">
                        Hablar con un experto
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg">
                      <Link to="/lp/calculadora-web">
                        Obtener valoración gratuita
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={resetCalculator}>
                    Repetir test
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
};

export default SearchFundsFitCalculator;
