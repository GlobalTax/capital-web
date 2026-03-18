

## Plan: Generar catálogo ROD (Relación de Oportunidades) automático desde operaciones

### Contexto
El usuario quiere generar un documento tipo "Capittal Dealhub - Open Deals" que agrupe TODAS las operaciones activas en un solo PPTX, replicando la estructura exacta del PDF subido. Esto es diferente de la funcionalidad actual que genera una presentación para UNA sola operación.

### Estructura del documento (replicando el PDF)

El PPTX agrupará las operaciones por `project_status` y `deal_type` en 4 secciones:

```text
1. PORTADA (negra) — "Capittal Dealhub - Open Deals Q[trimestre]"
2. ÍNDICE — 4 tarjetas: Mandatos de venta, Fase de preparación, Mandatos de compra, En exclusividad
3. SECCIÓN 01 — "Empresas en proceso de venta" (separador negro)
   → 1 slide por operación (project_status=active, deal_type=sale)
4. SECCIÓN 02 — "Próximamente en mercado" (separador negro)
   → 1 slide por operación (project_status=upcoming)
5. SECCIÓN 03 — "Empresas en búsqueda de adquisición" (separador negro)
   → 1 slide por operación (deal_type=acquisition)
6. SECCIÓN 04 — "Procesos en fase de exclusividad" (separador negro)
   → 1 slide por operación (project_status=exclusive)
```

### Layout de cada slide de operación (replicando page 4 del PDF)

Dos columnas:
- **Izquierda**: Nombre proyecto (28pt bold), descripción (11pt), bullets/highlights
- **Derecha**: Tarjeta negra con Resumen (Ubicación, Sector, Oportunidad) + Tabla "Datos Clave" (Facturación, EBITDA, Margen/Empleados) + "Más Información"

### Archivos a modificar/crear

**1. Crear `src/features/operations-management/utils/generateDealhubPptx.ts`**
- Nueva función `generateDealhubPptx(operations: Operation[])` que recibe TODAS las operaciones activas
- Filtra por `is_active && !is_deleted`
- Agrupa por las 4 categorías
- Genera portada, índice, y 1 slide por operación con el layout de dos columnas
- Descarga como `Capittal Dealhub - Open Deals Q[X] [Year].pptx`

**2. Crear `src/features/operations-management/components/GenerateDealhubModal.tsx`**
- Modal nuevo con: selector de trimestre (Q1/Q2/Q3/Q4), checklist de las 4 secciones, botón generar
- Usa TODAS las operaciones cargadas en AdminOperations (no requiere selección)

**3. Modificar `src/pages/admin/AdminOperations.tsx`**
- Cambiar el botón "Generar Presentación" actual para abrir el nuevo modal de Dealhub (sin necesidad de selección previa)
- O bien añadir un segundo botón "Generar Catálogo ROD"
- Pasar el array `operations` completo al modal

### Data mapping por slide de operación

| Campo visual | Campo DB |
|---|---|
| Nombre proyecto | `company_name` |
| Descripción | `description` (columna izq) |
| Ubicación | "España" (estático) |
| Sector | `sector` |
| Oportunidad | `short_description` |
| Facturación | `revenue_amount` |
| EBITDA | `ebitda_amount` |
| Margen EBITDA | calculado `ebitda/revenue` |
| Empleados | `company_size_employees` |
| Highlights | `highlights[]` como bullets |

### Sin backend
Todo client-side con pptxgenjs ya instalado. Solo se reutilizan los datos ya cargados en la página.

