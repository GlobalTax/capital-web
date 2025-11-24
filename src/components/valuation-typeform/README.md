# 🎯 Calculadora Variante B - Estilo Typeform

Implementación de calculadora de valoración con experiencia **Typeform** para A/B testing.

## 📊 Características

### Experiencia Typeform
- ✅ **4 pasos optimizados** (vs 1 paso en variante A)
- ✅ **Campos agrupados lógicamente** (3-2-1-2 campos por paso)
- ✅ **Animaciones fluidas** con Framer Motion
- ✅ **Progreso visual** minimalista
- ✅ **Copy conversacional** con emojis
- ✅ **Enter para continuar**
- ✅ **Navegación hacia atrás**

### Estructura de Pasos

**Paso 1: Contacto** (3 campos)
- Nombre ✅ Requerido
- Email ✅ Requerido
- Teléfono ⚠️ Opcional

**Paso 2: Empresa** (3 campos)
- Nombre empresa ✅ Requerido
- Sector ✅ Requerido
- Descripción actividad ✅ Requerido

**Paso 3: Tamaño** (1 campo)
- Número de empleados ✅ Requerido

**Paso 4: Finanzas** (2 campos)
- Facturación ✅ Requerido
- EBITDA ⚠️ Opcional

## 🚀 Uso

```typescript
import { TypeformCalculator } from '@/components/valuation-typeform';

<TypeformCalculator />
```

## 📁 Archivos

- `TypeformCalculator.tsx` - Container principal
- `TypeformStep.tsx` - Componente de paso individual
- `TypeformProgress.tsx` - Barra de progreso
- `questions.config.ts` - Configuración de preguntas
- `index.ts` - Exports

## 🔗 Ruta

**Producción:** `https://capittal.es/lp/calculadora-b`

## 📈 Tracking A/B

### Query SQL para análisis

```sql
-- Conversión por variante
SELECT 
  source_project,
  COUNT(*) as formularios_iniciados,
  COUNT(CASE WHEN final_valuation IS NOT NULL THEN 1 END) as conversiones,
  ROUND(
    (COUNT(CASE WHEN final_valuation IS NOT NULL THEN 1 END)::numeric / 
     COUNT(*)::numeric) * 100, 
    2
  ) as tasa_conversion_pct
FROM company_valuations
WHERE 
  source_project IN ('lp-calculadora-principal', 'lp-calculadora-b-typeform')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY source_project
ORDER BY source_project;
```

### Google Ads Setup

```
Campaña A → https://capittal.es/lp/calculadora
Campaña B → https://capittal.es/lp/calculadora-b
```

## 🎨 Diseño

- **Tema**: Limpio y minimalista
- **Emojis**: Para conexión emocional
- **Animaciones**: Suaves y no intrusivas
- **Tipografía**: Clara y legible
- **Responsive**: Mobile-first

## 🔧 Configuración

### Config en `calculator.configs.ts`

```typescript
export const V2_B_CONFIG: CalculatorConfig = {
  version: 'v2',
  steps: 4,
  sourceProject: 'lp-calculadora-b-typeform',
  validation: {
    optionalFields: ['phone', 'ebitda']
  }
};
```

## 📊 Métricas Esperadas

| Variante | Conversión Objetivo |
|----------|---------------------|
| A (actual) | 3-5% |
| B (typeform) | 10-15% |

**Criterio de éxito:** B > +25% que A

## 🎯 Ventajas vs Variante A

| Feature | Variante A | Variante B |
|---------|------------|------------|
| Campos por pantalla | Todos (8+) | 1-3 campos |
| Progreso visual | Barra simple | Barra + contador |
| Copy | Formal | Conversacional |
| Animaciones | Básicas | Typeform-style |
| Teléfono | Obligatorio | Opcional |
| EBITDA | Obligatorio | Opcional |
| Experiencia | Tradicional | Moderna |

## 🔐 Validación

- **Cliente-side**: Validación en tiempo real
- **Campos opcionales**: `phone`, `ebitda`
- **Campos requeridos**: Resto
- **Enter key**: Auto-avance si válido

## 🌐 i18n

Actualmente en español. Para añadir idiomas:

```typescript
// questions.config.ts
title: t('typeform.step1.title')
```
