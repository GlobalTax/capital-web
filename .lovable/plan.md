
## Anadir columna Facturacion en tabla de revision

### Cambio
Anadir columna "Facturacion" antes de la columna EBITDA (que actualmente se llama dinamicamente segun `baseValueLabel`). Se reemplaza la columna unica por dos columnas separadas: Facturacion y EBITDA, resaltando en negrita la que se usa como base de calculo.

### Archivo a modificar
`src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx`

### Cambios especificos

**1. TableHeader (linea 495)** - Reemplazar la columna unica `baseValueLabel` por dos columnas:
```
<TableHead className="text-right">Facturacion</TableHead>
<TableHead className="text-right">EBITDA</TableHead>
```

**2. colSpan en fila vacia** (linea 508) - Cambiar de 11 a 12 (una columna mas)

**3. TableBody (linea 526)** - Reemplazar la celda unica por dos celdas:
- Facturacion: `c.revenue` formateado, en negrita si `isRevenue`, o "---" si no hay dato
- EBITDA: `c.ebitda` formateado, en negrita si no es `isRevenue`, o "---" si no hay dato

### Resultado visual
```
Empresa         Facturacion    EBITDA       Multiplo   Val. Baja ...
CASANOVAS       3.034.205 EUR  500.000 EUR  1.3x       ...
```
La columna base de calculo se muestra en negrita.
