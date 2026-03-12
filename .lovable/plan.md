

## Mejorar importador Excel de Listas de Contacto — Validación y deduplicación previa

### Resumen

Añadir un flujo de validación en 4 pasos entre el mapeo de columnas y la inserción, todo client-side. El archivo principal a modificar es `src/pages/admin/ContactListDetailPage.tsx`, extrayendo la lógica de validación a un nuevo hook.

### Arquitectura

```text
Excel parsed → Column mapping (existente, sin cambios)
                    ↓
         [NUEVO] Validación client-side
                    ↓
              Consulta CIFs existentes en:
              - outbound_list_companies (mismo list_id)
              - empresas (directorio global)
                    ↓
              Clasifica cada fila:
              ✅ Nueva | 🔗 Vinculada | ⚠ Duplicada | ❌ Error
                    ↓
         [NUEVO] Modal de previsualización con resumen
                    ↓
              Inserción selectiva (solo Nuevas + Vinculadas)
                    ↓
         [NUEVO] Modal de resumen final + descarga errores
```

### Ficheros a crear/modificar

**1. Nuevo: `src/hooks/useExcelImportValidation.ts`**

Hook que encapsula toda la lógica de validación:

- Recibe las filas mapeadas (con CIF extraído), el `listId`, y las companies ya cargadas
- **Validación de errores**: Fila sin empresa NI CIF → error. CIF con formato inválido (no alfanumérico de 9 chars) → error
- **Dedup en lista**: Consulta `outbound_list_companies` con el `list_id` actual, compara CIFs normalizados (uppercase, trim)
- **Dedup en directorio**: Consulta `empresas` por CIFs, identifica las que existen globalmente pero no en esta lista → "vinculadas"
- **Dedup intra-Excel**: Si hay CIFs repetidos dentro del propio Excel, solo la primera fila cuenta; las demás se marcan como duplicadas
- Retorna: `{ nuevas: Row[], vinculadas: Row[], duplicadas: Row[], errores: Row[] & { motivo: string, rowNumber: number }[], isValidating: boolean }`

**2. Nuevo: `src/components/admin/contact-lists/ImportPreviewModal.tsx`**

Modal de previsualización (Paso 2):
- Muestra 4 líneas de resumen con iconos y contadores (✅ Nuevas, 🔗 Vinculadas, ⚠ Duplicadas, ❌ Errores)
- Secciones colapsables para ver las filas de cada categoría (nombre empresa, CIF, motivo si es error)
- Botón "Importar" (desactivado si nuevas + vinculadas === 0) y "Cancelar"
- Al confirmar, llama a la función de inserción selectiva

**3. Nuevo: `src/components/admin/contact-lists/ImportResultModal.tsx`**

Modal de resumen final (Paso 4):
- Muestra contadores de: importadas, vinculadas, omitidas por duplicación, omitidas por error
- Tabla expandible con las filas con error: nº fila, nombre empresa, CIF, motivo
- Botón para descargar Excel con solo las filas con error (usa xlsx library ya instalada)
- Botón "Cerrar"

**4. Modificar: `src/pages/admin/ContactListDetailPage.tsx`**

Cambios en `handleConfirmImport`:
- Tras el mapeo de columnas, en vez de insertar directamente, pasa las filas al hook de validación
- Añade estados: `importStep: 'upload' | 'mapping' | 'validating' | 'preview' | 'importing' | 'result'`
- El modal de Excel actual se amplía para manejar los nuevos pasos:
  - Upload + mapping → (existente, sin cambios)
  - Al pulsar "Importar" → ejecuta validación → muestra `ImportPreviewModal`
  - Al confirmar en preview → inserta solo nuevas + vinculadas via `addCompanies.mutateAsync`
  - Al terminar → muestra `ImportResultModal`
- No se toca: trigger `trg_sync_outbound_list_to_empresas`, `mapColumn`, `COLUMN_SYNONYMS`, `parseSpanishNumber`, `normalizeColumnName`

### Detalle técnico de las consultas de deduplicación

```typescript
// CIFs de la lista actual
const { data: existingInList } = await supabase
  .from('outbound_list_companies')
  .select('cif')
  .eq('list_id', listId)
  .not('cif', 'is', null);

// CIFs en directorio global
const { data: existingInEmpresas } = await supabase
  .from('empresas')
  .select('cif')
  .not('cif', 'is', null);
```

Se normalizan ambos sets a uppercase/trim para comparación. Las filas sin CIF que tengan nombre de empresa se clasifican como "nuevas" (se importan sin dedup). Las filas sin CIF NI empresa → error.

### Reglas de clasificación por fila

| CIF presente | CIF válido | En esta lista | En empresas | Estado |
|---|---|---|---|---|
| No | — | — | — | Nueva (si tiene empresa) o Error (si no tiene empresa) |
| Sí | No (!=9 chars alfanum) | — | — | Error |
| Sí | Sí | Sí | — | Duplicada |
| Sí | Sí | No | Sí | Vinculada |
| Sí | Sí | No | No | Nueva |

### Scope

- 3 ficheros nuevos, 1 modificado
- Sin cambios en base de datos, triggers ni hooks existentes
- Sin cambios en el mapeo de columnas ni la plantilla Excel

