
# Parseo Robusto de Excel en Valoraciones

## Diagnostico

El sistema actual en `CompaniesStep.tsx` ya tiene:
- Un `buildColumnMap()` (lineas 24-51) con mapeo basico de columnas
- Auto-mapping en `onDrop` (linea 278) que hace `h.toLowerCase().trim()` para buscar en el mapa
- Preview con mapeo manual de columnas via Select dropdowns
- Deteccion de duplicados y filas invalidas

**Debilidades actuales:**
- La normalizacion solo hace `toLowerCase().trim()` — no maneja acentos, espacios multiples ni caracteres especiales
- El mapa de sinonimos es limitado (faltan variaciones comunes como "compania", "correo electronico", "movil", etc.)
- Los numeros con formato espanol (puntos como separador de miles: "500.000") se parsean incorrectamente — `parseFloat("500.000")` da `500` en vez de `500000`
- No hay logs de debugging para el proceso de parseo
- El `MAPPABLE_FIELDS` para mapeo manual no incluye campos por ano (solo generico "Facturacion" / "EBITDA")

## Cambios Planificados

### 1. Funcion `normalizeColumnName` robusta

Crear una funcion de normalizacion que:
- Convierta a minusculas
- Elimine acentos (a/e/i/o/u, n)
- Colapse espacios multiples a uno
- Elimine caracteres especiales excepto alfanumericos y espacios
- Se aplique tanto en `buildColumnMap` como en el auto-mapping de `onDrop`

### 2. Ampliar `buildColumnMap` con mas sinonimos

Anadir variaciones comunes:
- Empresa: "compania", "compañia", "sociedad", "denominacion", "nombre empresa"
- Contacto: "persona contacto", "responsable", "contact name"
- Email: "correo electronico", "mail", "direccion email"
- Telefono: "movil", "celular", "telf", "tel"
- CIF: "tax id", "vat", "numero fiscal", "identificacion fiscal"
- Facturacion: "sales", "turnover", "cifra de negocio", "cifra negocio"
- EBITDA: variaciones con guiones y espacios

### 3. Mejorar `parseNumber` para formato espanol

El parseo numerico actual usa `parseFloat(String(value).replace(/[^\d.-]/g, ''))` que falla con "500.000" (formato espanol).

Nueva logica:
- Detectar si el numero usa formato espanol (puntos como miles, coma como decimal) vs formato anglosajón
- Heuristica: si hay punto seguido de exactamente 3 digitos, es separador de miles
- Limpiar correctamente antes de parsear

### 4. Logs de debugging

Anadir `console.group/log` en:
- `onDrop`: headers encontrados, mapeo automatico resultante
- `handleImportPreview`: filas procesadas, valores parseados
- Warnings para columnas no mapeadas

### 5. Actualizar `MAPPABLE_FIELDS` para incluir campos por ano

Actualmente solo tiene "Facturacion" y "EBITDA" genericos. Anadir opciones por ano (revenue_year_2, ebitda_year_2, etc.) para que el mapeo manual tambien soporte multi-ano.

## Archivos a modificar

1. **`src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx`** — Unico archivo. Todos los cambios son aqui:
   - Nueva funcion `normalizeColumnName`
   - Ampliar `buildColumnMap` con sinonimos
   - Mejorar parseo numerico en `handleImportPreview` y `previewStats`
   - Anadir campos por ano a `MAPPABLE_FIELDS`
   - Anadir logs en `onDrop` y `handleImportPreview`
   - Aplicar normalizacion en el auto-mapping de `onDrop`

## Lo que NO cambia

- La estructura del preview (ya existe y funciona bien)
- El flujo de importacion (upload -> preview con mapeo -> importar)
- La deteccion de duplicados
- La base de datos ni hooks
- El formulario manual
