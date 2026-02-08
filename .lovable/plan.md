

## Añadir traducciones faltantes en el footer

### Problema
El footer usa las claves `footer.link.construccion`, `footer.link.seguridad`, `footer.link.medioAmbiente`, `footer.link.alimentacion` y `footer.link.logistica`, pero estas no existen en el diccionario de traducciones (`dictionaries.ts`). Esto hace que se muestren las claves en crudo en vez del texto traducido.

### Cambios en `src/shared/i18n/dictionaries.ts`

Añadir las 5 claves faltantes en los 3 idiomas:

**Español (ES)** -- tras la línea 324 (`footer.link.industrial`):
- `'footer.link.construccion': 'Construcción'`
- `'footer.link.seguridad': 'Seguridad'`
- `'footer.link.medioAmbiente': 'Medio Ambiente'`
- `'footer.link.alimentacion': 'Alimentación'`
- `'footer.link.logistica': 'Logística'`

**Catalán (CA)** -- tras `footer.link.industrial` en la sección catalana:
- `'footer.link.construccion': 'Construcció'`
- `'footer.link.seguridad': 'Seguretat'`
- `'footer.link.medioAmbiente': 'Medi Ambient'`
- `'footer.link.alimentacion': 'Alimentació'`
- `'footer.link.logistica': 'Logística'`

**Inglés (EN)** -- tras `footer.link.industrial` en la sección inglesa:
- `'footer.link.construccion': 'Construction'`
- `'footer.link.seguridad': 'Security'`
- `'footer.link.medioAmbiente': 'Environment'`
- `'footer.link.alimentacion': 'Food & Beverage'`
- `'footer.link.logistica': 'Logistics'`

### Archivos afectados
- `src/shared/i18n/dictionaries.ts` (3 bloques de idioma)

