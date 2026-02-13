
## Boton "Descargar plantilla Excel" en CompaniesStep

### Cambio

**Archivo:** `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx`

1. Añadir una funcion `downloadTemplate` que usa la libreria `xlsx` (ya importada) para generar un archivo `.xlsx` en memoria con:
   - Cabeceras: Empresa, Contacto, Email, Telefono, CIF, Facturacion, EBITDA, Año
   - Fila ejemplo 1: "Empresa Ejemplo S.L.", "Juan Garcia", "juan@ejemplo.com", "+34 612 345 678", "B12345678", 5000000, 800000, 2024
   - Fila ejemplo 2: "Industrias Demo S.A.", "Ana Lopez", "ana@demo.com", "+34 698 765 432", "A87654321", 12000000, 2500000, 2024
   - Anchos de columna ajustados para legibilidad

2. Añadir un boton `Download` (icono de lucide) junto al titulo "Importar Excel" en el CardHeader, con texto "Descargar plantilla". Se usa `variant="outline" size="sm"`.

3. La descarga se dispara con `XLSX.writeFile()` generando `plantilla_campana_valoracion.xlsx`.

### Ubicacion del boton

Dentro del `<CardHeader>` de la seccion "Importar Excel" (linea 115), se convierte el `CardTitle` en un flex container con el boton a la derecha, manteniendo el estilo actual.

### Sin dependencias nuevas
Se usa `xlsx` y `lucide-react` que ya estan importados.
