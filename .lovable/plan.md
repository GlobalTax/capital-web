
## Plan: Tests Automaticos Completos para Formularios y Calculadora

### Estado Actual

Ya existen 2 archivos de test con 34 tests pasando:
- `validation.engine.test.ts` - 24 tests (email, phone, CIF, financials, steps, business logic)
- `questions.config.test.ts` - 10 tests (Typeform config structure)

Faltan tests para: formularios de UI (BasicInfoForm, FinancialDataForm, CharacteristicsForm), AdvisorStepperForm, TypeformCalculator, motor de calculo, schemas Zod, utilidades de formateo, y formularios de contacto/venta.

### Archivos de test a crear (8 nuevos)

**1. `src/features/valuation/utils/__tests__/calculation.engine.test.ts`**
Tests del motor de calculo puro (sin UI):
- Valoracion base con multiplo fijo 5.75x EBITDA
- Rango de valoracion: min (5.5x) y max (6.0x)
- Escenarios: conservador (0.8x), base (1.0x), optimista (1.2x)
- Calculo fiscal: ganancia patrimonial, tipos impositivos
- Reducciones fiscales: reinversion, renta vitalicia, edad
- Recomendaciones generadas segun escenarios
- Edge cases: EBITDA cero, sin datos fiscales

**2. `src/utils/__tests__/numberFormatting.test.ts`**
Tests de utilidades de formateo numerico:
- `formatNumberWithDots`: 1000000 a "1.000.000"
- `parseNumberWithDots`: "1.000.000" a 1000000
- Edge cases: 0, string vacio, caracteres no numericos

**3. `src/schemas/__tests__/contactFormSchema.test.ts`**
Tests de validacion Zod del formulario de contacto:
- Campos requeridos (fullName, company, email, serviceType)
- Validacion de email (formatos validos/invalidos)
- Validacion de telefono espanol (formatos +34, 0034, solo digitos)
- Honeypot: campo `website` debe ser vacio
- Campos opcionales (message, investmentBudget, etc.)
- Schema de operaciones (operationId UUID obligatorio)
- Funcion `validateRequiredFields`
- Funcion `getFieldErrors` extrae errores por campo

**4. `src/schemas/__tests__/formSchemas.test.ts`**
Tests de todos los schemas Zod de formularios:
- `newsletterSchema`: email requerido y valido
- `ventaEmpresasSchema`: nombre, email, phone, empresa, facturacion obligatorios; CIF opcional; EBITDA formato espanol
- `compraEmpresasSchema`: campos requeridos vs opcionales
- `collaboratorSchema`: profesion requerida, experiencia opcional
- `professionalValuationSchema`: rango de facturacion requerido

**5. `src/schemas/__tests__/campaignValuationSchema.test.ts`**
Tests del schema de valoracion de campana:
- CIF formato estricto (regex: letra + 7 digitos + alfanum)
- Revenue/EBITDA como numeros positivos
- Honeypot `website` debe ser vacio
- Email y CIF obligatorios

**6. `src/components/valuation/forms/__tests__/BasicInfoForm.test.tsx`**
Tests de renderizado del formulario de informacion basica:
- Renderiza todos los campos: contactName, companyName, email, phone, CIF, industry, activityDescription, location, employeeRange
- Campo de contactName acepta texto y llama a updateField
- Checkbox de WhatsApp se renderiza y responde a clicks
- Seccion de sector muestra 15 industrias

**7. `src/components/valuation/forms/__tests__/FinancialDataForm.test.tsx`**
Tests del formulario financiero:
- Renderiza campos de revenue y EBITDA
- Checkbox de ajustes muestra/oculta campo adjustmentAmount
- Caja informativa con tips se renderiza

**8. `src/components/valuation/forms/__tests__/CharacteristicsForm.test.tsx`**
Tests del formulario de caracteristicas:
- Renderiza campos de ubicacion, participacion, ventaja competitiva
- Selector de participacion tiene 3 opciones (alta, media, baja)
- Caja informativa verde se renderiza

### Archivos existentes a modificar

**`src/test/mocks.ts`**
Anadir mocks adicionales para:
- `sonner` (toast)
- `@/hooks/use-toast` (useToast)
- `framer-motion` (AnimatePresence, motion)
- `@/utils/getIPAddress` (mock para tests de AdvisorStepper)

### Seccion tecnica

**Dependencias de mock para formularios UI:**
Los 3 formularios (BasicInfo, Financial, Characteristics) usan `useI18n` y componentes de Radix UI. Los tests usaran:
- Mock de `useI18n` ya existente (devuelve la key)
- Renderizado real de componentes shadcn/ui (Input, Label, Checkbox funcionan en jsdom)
- Para Select de Radix UI: se testara que el componente se renderiza sin interaccion compleja de portal

**Patron de test para schemas Zod:**
```typescript
// Test de schema puro - sin necesidad de mocks
it('accepts valid data', () => {
  const result = schema.safeParse(validData);
  expect(result.success).toBe(true);
});
it('rejects invalid email', () => {
  const result = schema.safeParse({ ...validData, email: 'invalid' });
  expect(result.success).toBe(false);
});
```

**Patron de test para formularios UI:**
```typescript
// Requiere mocks de i18n + renderizado con RTL
vi.mock('@/shared/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, lang: 'es', setLang: vi.fn(), managed: false }),
}));

it('renders contact name field', () => {
  render(<BasicInfoForm companyData={mockData} updateField={mockUpdateField} />);
  expect(screen.getByLabelText('label.contactName')).toBeInTheDocument();
});
```

**Cobertura total estimada tras implementacion:**
- Validation engine: ~90% (ya existente)
- Calculation engine: ~85% (nuevo)
- Schemas Zod: ~95% (nuevo, logica pura)
- Number formatting: ~100% (nuevo, logica pura)
- BasicInfoForm: ~75% (nuevo)
- FinancialDataForm: ~75% (nuevo)
- CharacteristicsForm: ~75% (nuevo)

**Total: ~60 tests nuevos + 34 existentes = ~94 tests**
