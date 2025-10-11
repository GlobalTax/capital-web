# Valuation Feature Module

Sistema unificado de valoración de empresas con múltiples métodos, autosave y análisis fiscal.

## 📁 Estructura

```
valuation/
├── components/         # Componentes del calculador
│   └── UnifiedCalculator.tsx
├── hooks/             # Hooks de valoración
│   └── useUnifiedCalculator.ts
├── services/          # Servicios de datos
│   └── data-access.service.ts
├── utils/             # Utilidades
│   └── validation.engine.ts
├── types/             # Tipos TypeScript
│   └── index.ts
└── validation/        # Schemas Zod
    └── schemas.ts
```

## 🚀 Uso Rápido

### Calculadora Unificada

```typescript
import { UnifiedCalculator } from '@/features/valuation';

function ValuationPage() {
  const config = {
    version: 'v4',
    steps: 4,
    features: {
      autosave: true,
      taxCalculation: true,
      comprehensiveAnalysis: true,
      pdfGeneration: true
    }
  };

  return <UnifiedCalculator config={config} />;
}
```

### Hook de Valoración

```typescript
import { useUnifiedCalculator } from '@/features/valuation';

function MyCalculator() {
  const calculator = useUnifiedCalculator(config);

  const handleFieldChange = (field: string, value: any) => {
    calculator.updateField(field, value);
  };

  const handleCalculate = async () => {
    const result = await calculator.calculateValuation();
    if (result) {
      console.log('Valoración:', result);
    }
  };

  return (
    <div>
      <input
        value={calculator.state.companyData.companyName}
        onChange={(e) => handleFieldChange('companyName', e.target.value)}
      />
      
      {calculator.state.errors.companyName && (
        <span className="error">{calculator.state.errors.companyName}</span>
      )}
      
      <button onClick={handleCalculate} disabled={!calculator.isFormValid}>
        Calcular Valoración
      </button>
    </div>
  );
}
```

## 📊 Tipos de Datos

### CompanyData

```typescript
import type { CompanyData } from '@/features/valuation';

const companyData: CompanyData = {
  companyName: 'Tech Solutions SL',
  email: 'info@techsolutions.com',
  phone: '+34600000000',
  industry: 'Tecnología',
  employeeRange: '11-50',
  revenue: 500000,
  ebitda: 150000,
  location: 'Madrid',
  whatsapp_opt_in: true
};
```

### ExtendedCompanyData

```typescript
import type { ExtendedCompanyData } from '@/features/valuation';

const extendedData: ExtendedCompanyData = {
  // Datos básicos
  ...companyData,
  
  // Datos financieros adicionales
  netProfit: 120000,
  totalAssets: 800000,
  totalLiabilities: 300000,
  cashFlow: 180000,
  
  // Métricas de mercado
  marketShare: 15,
  growthRate: 25,
  customerBase: 500,
  recurringRevenue: 300000,
  
  // Datos cualitativos
  businessModel: 'SaaS B2B',
  competitiveAdvantage: 'Tecnología propietaria y base de clientes consolidada',
  ownershipParticipation: '100%',
  exitTimeline: '1-2 años',
  
  // UTM tracking
  utm_source: 'google',
  utm_campaign: 'valoracion-2024'
};
```

### ValuationResult

```typescript
import type { ValuationResult } from '@/features/valuation';

const result: ValuationResult = {
  enterpriseValue: 2500000,
  equityValue: 2200000,
  multiple: 5.0,
  method: 'DCF + Multiples',
  confidence: 'high',
  details: {
    methodology: 'Valoración por múltiplos de EBITDA',
    assumptions: [
      'Múltiplo sector tecnología: 4.5x - 5.5x',
      'Crecimiento esperado: 20-25% anual',
      'Tasa de descuento: 12%'
    ],
    adjustments: {
      'Activos intangibles': 200000,
      'Working capital': -50000
    }
  }
};
```

### ComprehensiveResult

```typescript
import type { ComprehensiveResult } from '@/features/valuation';

const comprehensiveResult: ComprehensiveResult = {
  ...result,
  
  taxAnalysis: {
    currentTaxLiability: 75000,
    optimizedTaxLiability: 55000,
    potentialSavings: 20000,
    recommendations: [
      'Considerar régimen de holding',
      'Optimización de amortizaciones',
      'Diferimiento de plusvalía'
    ]
  },
  
  marketComparison: {
    industryAverage: 4.2,
    percentile: 75,
    similarCompanies: [
      {
        name: 'Competitor A',
        multiple: 4.8,
        revenue: 450000
      },
      {
        name: 'Competitor B',
        multiple: 5.2,
        revenue: 550000
      }
    ]
  }
};
```

## 🎯 Configuración del Calculador

```typescript
import type { CalculatorConfig } from '@/features/valuation';

const basicConfig: CalculatorConfig = {
  version: 'v4',
  steps: 3,
  features: {
    autosave: false,
    taxCalculation: false,
    comprehensiveAnalysis: false,
    pdfGeneration: true
  },
  fields: {
    required: ['companyName', 'email', 'revenue', 'ebitda'],
    optional: ['netProfit', 'totalAssets']
  }
};

const advancedConfig: CalculatorConfig = {
  version: 'master',
  steps: 5,
  features: {
    autosave: true,
    taxCalculation: true,
    comprehensiveAnalysis: true,
    pdfGeneration: true
  },
  fields: {
    required: ['companyName', 'email', 'revenue', 'ebitda', 'netProfit'],
    optional: ['marketShare', 'growthRate', 'customerBase']
  }
};
```

## 📝 Validación con Zod

```typescript
import { companyDataSchema, extendedCompanyDataSchema } from '@/features/valuation';

// Validar datos básicos
try {
  const validated = companyDataSchema.parse({
    companyName: 'Tech Solutions',
    email: 'info@tech.com',
    phone: '+34600000000',
    industry: 'Tecnología',
    employeeRange: '11-50',
    revenue: 500000,
    ebitda: 150000,
    location: 'Madrid'
  });
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```

### Reglas de Validación

```typescript
// Email válido
email: z.string().email()

// Teléfono formato válido
phone: z.string().min(9).regex(/^[+]?[\d\s()-]+$/)

// Revenue positivo
revenue: z.number().positive().min(1000)

// EBITDA puede ser negativo
ebitda: z.number().min(-1000000000)

// Market share 0-100%
marketShare: z.number().min(0).max(100)

// Growth rate -100% a 1000%
growthRate: z.number().min(-100).max(1000)
```

## 🔄 Autosave

```typescript
const calculator = useUnifiedCalculator({
  version: 'v4',
  features: { autosave: true }
});

// Autosave automático cada 30 segundos
// No requiere configuración adicional

// Forzar guardado manual
await calculator.saveProgress();
```

## 💾 Data Access Service

```typescript
import { dataAccessService } from '@/features/valuation';

// Crear valoración
const token = await dataAccessService.createValuation(companyData, utmData);

// Actualizar valoración
await dataAccessService.updateValuation(token, updates, 'revenue');

// Finalizar valoración
await dataAccessService.finalizeValuation(token, result);

// Obtener por token
const data = await dataAccessService.getValuationByToken(token);

// Track evento
await dataAccessService.trackEvent('valuation_completed', {
  value: result.enterpriseValue,
  method: result.method
});
```

## 🧮 Motor de Validación

```typescript
import { validateCalculatorData } from '@/features/valuation';

// Validar un paso
const stepValidation = validateCalculatorData(
  companyData, 
  1, 
  config
);

if (!stepValidation.isValid) {
  console.log('Errores:', stepValidation.errors);
  console.log('Campos inválidos:', stepValidation.invalidFields);
}

// Validar formulario completo
const fullValidation = validateCalculatorData(
  companyData,
  config.steps,
  config
);
```

## 📊 Múltiplos por Sector

```typescript
import type { SectorMultiple } from '@/features/valuation';

const techMultiples: SectorMultiple = {
  sector: 'Tecnología',
  ev_revenue_min: 2.5,
  ev_revenue_max: 5.0,
  ev_ebitda_min: 8.0,
  ev_ebitda_max: 15.0,
  sample_size: 50,
  updated_at: '2024-01-01T00:00:00Z'
};
```

## 🎨 Navegación entre Pasos

```typescript
const calculator = useUnifiedCalculator(config);

// Siguiente paso
calculator.nextStep();

// Paso anterior
calculator.prevStep();

// Ir a paso específico
calculator.goToStep(3);

// Estado actual
console.log('Paso actual:', calculator.state.currentStep);
console.log('¿Paso válido?', calculator.isCurrentStepValid);
```

## 🛡️ Mejores Prácticas

1. **Validar en cada paso** antes de avanzar
2. **Activar autosave** para valoraciones largas
3. **Usar ExtendedCompanyData** para análisis completo
4. **Tracking UTM** para analítica de marketing
5. **Análisis fiscal** para valor añadido
6. **PDF generation** para entregas profesionales
7. **Error handling** robusto con try-catch
8. **Loading states** durante cálculos

## 📈 Análisis Fiscal

```typescript
import type { TaxData } from '@/features/valuation';

const taxData: TaxData = {
  taxRegime: 'Régimen General',
  effectiveTaxRate: 25,
  deferredTaxes: 15000,
  taxCredits: 5000,
  estimatedTaxImpact: 75000
};

// Actualizar datos fiscales
calculator.updateTaxData('effectiveTaxRate', 22);
```

## 🐛 Debugging

```typescript
// Estado completo
console.log('State:', calculator.state);

// Errores de validación
console.log('Errors:', calculator.state.errors);

// Campos tocados
console.log('Touched:', calculator.state.touched);

// Resultado
console.log('Result:', calculator.state.result);

// Loading states
console.log('Calculating:', calculator.state.isCalculating);
```

## 🚀 Performance

- **Lazy loading** de componentes pesados
- **Memoización** de cálculos costosos
- **Debounce** en autosave
- **Validación progresiva** por paso
- **Cache** de múltiplos por sector
