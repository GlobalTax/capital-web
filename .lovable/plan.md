

## Plan: Añadir lógica de cálculo y resultados al Paso 2

### Archivo: `src/pages/LandingCalculadoraAsesorias.tsx`

**1. Añadir interface `ValuationResult` y tipo `Factor`** (después de `FormData`):
- `ValuationResult`: `evL`, `evH`, `evM`, `eqM`, `mL`, `mM`, `mH`, `ingRec`, `multIngRec`, `margen`, `revEmp`, `factors`
- `Factor`: `{ text: string; type: 'positive' | 'neutral' | 'negative' }`

**2. Añadir función `calculateValuation(form: FormData): ValuationResult`** (después de `parseES`):
- Parsea valores del formulario con `parseES`
- Calcula `baseM` según rangos de facturación (6 tramos)
- Calcula ajuste `a` sumando los 7 sub-ajustes (recurrencia, servicios, crecimiento, margen, productividad, cartera), capeado a ±1.0
- `mM = clamp(baseM + a, 3.0, 10.0)`
- `mL = clamp(round(mM × 0.88, 1), 2.5, 10.0)`, `mH = clamp(round(mM × 1.12, 1), 2.5, 10.0)`
- Calcula EV, equity, ingresos recurrentes, múltiplo s/ recurrentes, margen, rev/emp
- Genera array de factores según las reglas especificadas

**3. Añadir estado `result` al componente principal**:
- `const [result, setResult] = useState<ValuationResult | null>(null)`

**4. Modificar `onNext` del Step 1** para ejecutar el cálculo, guardar resultado, cambiar a paso 2, y scroll top

**5. Reescribir `StepTwo`** para recibir `result` y mostrar:
- Tarjeta principal con `evM` formateado grande + rango `evL – evH`
- Grid de métricas: múltiplo central, margen EBITDA, equity value, ingresos recurrentes, múltiplo s/ recurrentes, fact/empleado
- Lista de factores con indicador de color (verde/gris/rojo según tipo)
- Botón "Descargar informe PDF" (disabled, placeholder)
- Botón "← Volver al formulario"

### Sin cambios en otros archivos

