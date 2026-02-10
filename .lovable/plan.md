

## Plan: Herramienta de Tests Automaticos para Formularios

### Estado: ✅ Completado (Pasos 1, 2, 4, 7)

### Resumen

Configurar Vitest + React Testing Library desde cero y crear tests automatizados para los 3 formularios de valoracion del proyecto: Calculadora Principal (3 pasos), Typeform, y Calculadora de Asesores.

### Paso 1: ✅ Configurar la infraestructura de testing

- `vitest.config.ts` - Configuracion de Vitest con jsdom, aliases y setup
- `src/test/setup.ts` - Setup con jest-dom matchers y mocks de matchMedia/ResizeObserver
- `src/test/mocks.ts` - Mocks compartidos (useI18n, supabase, react-router-dom)
- `tsconfig.app.json` - Anadido `"vitest/globals"` a types
- Dependencias: vitest, @testing-library/react, @testing-library/jest-dom, jsdom

### Paso 4: ✅ Tests del motor de validacion (24 tests)

Archivo: `src/features/valuation/utils/__tests__/validation.engine.test.ts`
- Validacion de email (formatos validos e invalidos)
- Validacion de telefono
- Validacion de CIF
- Validacion de datos financieros (revenue > 0, ebitda <= revenue)
- Validacion por pasos (step 1, 2, 3 con config v1/master)
- Campos opcionales con config.validation.optionalFields
- Business logic warnings (margenes EBITDA)

### Paso 7: ✅ Tests de la config de Typeform (10 tests)

Archivo: `src/components/valuation-typeform/__tests__/questions.config.test.ts`
- Todos los pasos tienen al menos 1 campo
- IDs son unicos
- Campos requeridos estan marcados
- Select fields tienen opciones
- Field names son keys validas de ExtendedCompanyData
- interpolateText funciona correctamente

### Pendiente (futuras iteraciones)

- Paso 3: Tests de formularios (BasicInfoForm, FinancialDataForm, CharacteristicsForm) - requiere mocks de Radix UI Select/Dialog
- Paso 5: Tests de AdvisorStepperForm - requiere mocks de Supabase y hooks
- Paso 6: Tests de TypeformCalculator - requiere mocks del hook useUnifiedCalculator

---

### Archivos creados (6):
```
vitest.config.ts
src/test/setup.ts
src/test/mocks.ts
src/features/valuation/utils/__tests__/validation.engine.test.ts
src/components/valuation-typeform/__tests__/questions.config.test.ts
```

### Archivos modificados (1):
- `tsconfig.app.json` - Anadido `"vitest/globals"` a types

### Resultado: 34 tests pasando (24 + 10)
