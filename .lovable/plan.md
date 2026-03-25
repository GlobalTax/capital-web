

## Cambios en traducciones del Hero de Colaboradores

### 1. Cambiar título principal (ES)
- Línea 12: `'collab.hero.title': 'Únete al equipo de expertos en M&A'` → `'Conviértete en Colaborador'`

### 2. Corregir stat1 en castellano (ES)
- Línea 14: `'collab.hero.stat1': 'Col·laboradors Actius'` → `'Colaboradores Activos'`

### 3. También actualizar el dashboard hardcoded en `EnhancedHeroSection.tsx`
- Línea ~83: `"Colaboradores Activos"` — ya está bien en el componente, pero el stat del hero usa la traducción que está en catalán.

**Archivo**: `src/shared/i18n/collaborators-translations.ts` — 2 líneas modificadas.

