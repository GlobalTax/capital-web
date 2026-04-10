

## Plan: Rediseñar StepTwo con pantalla de resultados completa

### Resumen
Reemplazar el componente `StepTwo` (líneas 663-821) con la pantalla de resultados de 9 secciones especificada, incluyendo hero de resultados, métricas, barras de progreso, compradores activos, y CTA con formulario de contacto.

### Cambios en `src/pages/LandingCalculadoraAsesorias.tsx`

**1. Añadir estado de contacto al componente principal** para el formulario CTA (nombre, email, teléfono, nombre asesoría).

**2. Pasar `form` al StepTwo** para acceder a datos del formulario (empleados, etc.) en las barras.

**3. Reescribir `StepTwo` completamente con estas 9 secciones:**

- **1. Hero de resultados**: Overline mono "RANGO DE VALORACIÓN ESTIMADO (ENTERPRISE VALUE)", rango grande Playfair "€X – €Y", valor central, método en mono
- **2. Grid 3 métricas** con separadores 1px: Múltiplo (central + rango), Margen EBITDA (% + benchmark semántico), Equity Value (EV - deuda)
- **3. Box ingresos recurrentes** (borde dashed): múltiplo Playfair grande + texto explicativo con rango habitual 0,7–1,5x
- **4. Barra facturación/empleado**: barra de progreso con color semáforo (verde ≥70K, ámbar ≥50K, rojo <50K), ticks €30K/€60K/€90K/€120K+
- **5. Barra posición en mercado**: escala 3.0x–10.0x con marker circular en el múltiplo, label "X.Xx aplicado"
- **6. Factores**: grid 2 columnas con dots de color (verde/ámbar/rojo) + texto
- **7. Bloque compradores activos**: fondo #161B22, overline gold, 2 párrafos contexto, 3 cards (Afianza/BlackRock, Auren/Waterland, Asenza/Ufenau) con datos reales
- **8. Botones**: "← Modificar datos" (secondary) + "Quiero un informe detallado" (primary, scroll a CTA)
- **9. CTA section**: fondo #161B22, título Playfair, 4 inputs dark (nombre, email, teléfono, nombre asesoría), botón gold "Descargar informe PDF", disclaimer RGPD

### Detalles técnicos
- Benchmark margen EBITDA: ≥25% "Excelente", ≥15% "En media", <15% "Por debajo"
- Barra rev/emp: max 120K, color dinámico por umbral
- Barra mercado: posición proporcional del múltiplo en escala 3–10
- Scroll suave al CTA desde botón primary
- Formulario CTA sin lógica de envío por ahora (solo estructura visual)
- Solo se modifica `src/pages/LandingCalculadoraAsesorias.tsx`

