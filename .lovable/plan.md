

## Plan: Rediseñar Step 1 del formulario de calculadora-asesorias

### Resumen
Reemplazar completamente el `StepOne` y el `FormData` del archivo `src/pages/LandingCalculadoraAsesorias.tsx` con las 6 secciones especificadas, slider de recurrencia, chips multiselect/single-select, inputs numéricos con formateo español, y validación.

### Cambios en `src/pages/LandingCalculadoraAsesorias.tsx`

**1. Actualizar `FormData` interface y `INITIAL_FORM`:**
- Eliminar: `contactName`, `email`, `phone`, `firmName`, `firmType` (se moverán al paso de contacto/informe más adelante)
- Añadir: `services: string[]`, `location: string`, `employees: string`, `revenue: string`, `ebitda: string`, `recurringPct: number` (default 70), `growthTrend: string` (default "Creciendo 5-15%"), `netDebt: string`, `activeClients: string`

**2. Eliminar constantes obsoletas:** `FIRM_TYPES`, `EMPLOYEE_RANGES`

**3. Añadir constantes nuevas:**
- `SERVICES`: array de 8 strings (Fiscal, Contable, Laboral/Nóminas, etc.)
- `GROWTH_TRENDS`: array de 4 opciones

**4. Añadir helper de formateo numérico:**
- `formatES(value)`: formatea con `toLocaleString('es-ES')` al blur
- `parseES(value)`: limpia puntos para obtener número raw
- Usar `onBlur` en inputs numéricos para aplicar formateo

**5. Reescribir componente `StepOne` con las 6 secciones:**

- **Sección 1** — "Servicios que presta tu asesoría": chips multiselect con toggle, borde `#E2E4E8` inactivo, fondo `#161B22` + texto blanco activo
- **Sección 2** — Grid 2 cols: Ubicación (text input) + Empleados (input numérico)
- **Divisor dashed** — `border-dashed` con color `#E2E4E8`
- **Sección 3** — "Datos financieros" con subtítulo mono: Facturación + EBITDA en grid 2 cols, inputs con formateo `es-ES` on blur
- **Sección 4** — Slider % Ingresos recurrentes: HTML `<input type="range">` con min=10, max=100, step=5, default=70. Badge monospace a la derecha mostrando `{value}%`. Track estilizado con CSS inline (navy para filled, border para unfilled)
- **Sección 5** — Tendencia de crecimiento: chips single-select, default "Creciendo 5-15%"
- **Sección 6** — Grid 2 cols: Deuda financiera neta + Clientes activos (opcionales)
- **Info box** — Fondo `#F9FAFB`, borde `#E2E4E8`, texto explicativo sobre EBITDA
- **Botón** — "Calcular valoración", disabled hasta validación completa, fondo `#161B22`

**6. Validación para habilitar botón:**
`services.length > 0 && location.trim() && parseInt(employees) > 0 && parseES(revenue) > 0 && parseES(ebitda) > 0`

### Archivos modificados
Solo `src/pages/LandingCalculadoraAsesorias.tsx` — cambios internos al componente existente.

