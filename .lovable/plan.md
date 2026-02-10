

## Plan: Herramienta de Tests Automaticos para Formularios

### Resumen

Configurar Vitest + React Testing Library desde cero y crear tests automatizados para los 3 formularios de valoracion del proyecto: Calculadora Principal (3 pasos), Typeform, y Calculadora de Asesores.

### Paso 1: Configurar la infraestructura de testing

Instalar dependencias de desarrollo:
- `vitest` (^3.2.4)
- `@testing-library/react` (^16.0.0)
- `@testing-library/jest-dom` (^6.6.0)
- `jsdom` (^20.0.3)

Crear archivos de configuracion:
- `vitest.config.ts` - Configuracion de Vitest con jsdom, aliases y setup
- `src/test/setup.ts` - Setup con jest-dom matchers y mocks de matchMedia/ResizeObserver
- Actualizar `tsconfig.app.json` - Anadir `"vitest/globals"` a types

### Paso 2: Mocks compartidos

Crear `src/test/mocks.ts` con mocks reutilizables para:
- `useI18n` - Devolver la key como texto (evita dependencias de traducciones)
- `supabase client` - Mock de las llamadas a Supabase
- `react-router-dom` - Mock de useNavigate
- Radix UI Select/Dialog - Mocks minimos para que rendericen en jsdom

### Paso 3: Tests del formulario principal (BasicInfoForm + FinancialDataForm + CharacteristicsForm)

Archivo: `src/components/valuation/forms/__tests__/BasicInfoForm.test.tsx`
- Renderiza todos los campos (contactName, companyName, email, phone, industry, employeeRange, etc.)
- Campos requeridos muestran error al hacer blur sin valor
- updateField se llama con el valor correcto al escribir
- Selector de sector muestra todas las opciones
- Checkbox de WhatsApp funciona

Archivo: `src/components/valuation/forms/__tests__/FinancialDataForm.test.tsx`
- Renderiza campos de revenue y EBITDA
- Formatea moneda correctamente
- Ajustes EBITDA: checkbox muestra/oculta campo de ajuste

Archivo: `src/components/valuation/forms/__tests__/CharacteristicsForm.test.tsx`
- Renderiza ubicacion, participacion, ventaja competitiva
- Selector de participacion funciona

### Paso 4: Tests del motor de validacion

Archivo: `src/features/valuation/utils/__tests__/validation.engine.test.ts`
- Validacion de email (formatos validos e invalidos)
- Validacion de telefono
- Validacion de CIF
- Validacion de datos financieros (revenue > 0, ebitda <= revenue)
- Validacion por pasos (step 1, 2, 3 con config v1/master)
- Campos opcionales con config.validation.optionalFields

### Paso 5: Tests del formulario Advisor (AdvisorStepperForm)

Archivo: `src/components/valuation-advisor/__tests__/AdvisorStepperForm.test.tsx`
- Renderiza las 3 secciones (contacto, empresa, financiero)
- Validacion completa: campos vacios muestran errores
- Formateo de numeros con puntos en revenue/ebitda
- Boton de calcular deshabilitado durante calculo

### Paso 6: Tests del Typeform (TypeformCalculator)

Archivo: `src/components/valuation-typeform/__tests__/TypeformCalculator.test.tsx`
- Renderiza el primer paso con campos de contacto
- Navegacion next/prev entre pasos
- Validacion impide avanzar sin campos requeridos
- Progreso se actualiza correctamente

### Paso 7: Tests de la config de Typeform

Archivo: `src/components/valuation-typeform/__tests__/questions.config.test.ts`
- Todos los pasos tienen al menos 1 campo
- IDs son unicos
- Campos requeridos estan marcados
- interpolateText funciona correctamente

---

### Seccion tecnica

**Archivos nuevos (9):**
```
vitest.config.ts
src/test/setup.ts
src/test/mocks.ts
src/components/valuation/forms/__tests__/BasicInfoForm.test.tsx
src/components/valuation/forms/__tests__/FinancialDataForm.test.tsx
src/components/valuation/forms/__tests__/CharacteristicsForm.test.tsx
src/features/valuation/utils/__tests__/validation.engine.test.ts
src/components/valuation-advisor/__tests__/AdvisorStepperForm.test.tsx
src/components/valuation-typeform/__tests__/questions.config.test.ts
```

**Archivos modificados (2):**
- `package.json` - Nuevas devDependencies + script `"test": "vitest"`
- `tsconfig.app.json` - Anadir `"vitest/globals"` a types

**Archivos existentes NO modificados:**
- Ningun componente, hook, utilidad o pagina existente se toca
- Solo se anade infraestructura de testing y archivos de test

**Cobertura estimada:**
- Validation engine: ~90% (logica pura, facil de testear)
- BasicInfoForm: ~80% (renderizado + interacciones)
- FinancialDataForm: ~80%
- CharacteristicsForm: ~75%
- AdvisorStepperForm: ~70% (mock de Supabase necesario)
- Typeform config: ~100% (datos estaticos)

