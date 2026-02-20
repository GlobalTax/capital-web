
# Selección múltiple y descarga masiva (ZIP) en ProcessSendStep

## Estado actual

El `ProcessSendStep.tsx` (647 líneas) ya tiene:
- `downloadSingle(c)` — descarga individual por fila (en DropdownMenu)
- `handleDownloadAll()` — descarga secuencial de todos los PDFs (uno por uno, con delay de 600ms entre cada uno)
- `PDFPreviewModal` con iframe
- Barra de progreso de descarga (`downloadProgress` state)
- DropdownMenu por fila con Previsualizar / Descargar PDF / Enviar email / Reenviar

**Lo que falta completamente:**
1. Checkboxes por fila + master checkbox en header → `selectedIds: string[]`
2. Fondo visual diferenciado en filas seleccionadas
3. Barra flotante (`FloatingActionBar`) que aparece cuando `selectedIds.length > 0`
4. Descarga de seleccionadas como ZIP (actualmente solo hay descarga secuencial individual, no ZIP)
5. Atajos de teclado: Ctrl+A, Escape, Ctrl+D

## Decisión sobre ZIP

El plan original pide ZIP. El código actual hace descarga individual secuencial (trigerea múltiples descargas del browser). Con 147 empresas, el browser bloquea descargas múltiples.

**Solución**: Usamos la librería `fflate` que ya está disponible transitivamente en el proyecto (es dependencia de `@react-pdf/renderer`). Importación dinámica: `const { zip, strToU8 } = await import('fflate')`. Esto genera un `.zip` real en memoria sin instalar nada nuevo.

Si `fflate` no está disponible en runtime, fallback a descarga secuencial con delay (la implementación actual de `handleDownloadAll`).

## Cambios — solo `ProcessSendStep.tsx`

### 1. Nuevos imports (línea 1)
Añadir `Checkbox` de `@/components/ui/checkbox`, `X` de `lucide-react`, y `cn` de `@/lib/utils`.

### 2. Estado de selección (después de línea 217)
```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const toggleSelection = (id: string) =>
  setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

const toggleSelectAll = () =>
  setSelectedIds(selectedIds.length === companies.length ? [] : companies.map(c => c.id));

const clearSelection = () => setSelectedIds([]);

const isAllSelected = companies.length > 0 && selectedIds.length === companies.length;
const isIndeterminate = selectedIds.length > 0 && selectedIds.length < companies.length;
```

### 3. Función `handleDownloadSelected` (nueva, después de `handleDownloadAll`)
```typescript
const handleDownloadSelected = useCallback(async (ids: string[]) => {
  const targets = companies.filter(c => ids.includes(c.id));
  if (targets.length === 0) return;
  
  setDownloadProgress({ active: true, current: 0, total: targets.length, name: '' });
  
  try {
    // Intento ZIP con fflate
    const fflate = await import('fflate');
    const files: Record<string, Uint8Array> = {};
    
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      setDownloadProgress(p => ({ ...p, current: i + 1, name: c.client_company }));
      const blob = await generatePdfBlob(c, campaign);
      const buffer = await blob.arrayBuffer();
      const filename = `${String(i + 1).padStart(3, '0')}_${c.client_company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      files[filename] = new Uint8Array(buffer);
    }
    
    // Generar ZIP sincrónicamente
    const zipped = fflate.zipSync(files, { level: 6 });
    const zipBlob = new Blob([zipped], { type: 'application/zip' });
    downloadBlob(zipBlob, `Valoraciones_${targets.length}_empresas.zip`);
    toast.success(`${targets.length} PDFs descargados como ZIP`);
  } catch (err) {
    // Fallback: descarga secuencial
    console.warn('[ZIP] fflate no disponible, fallback secuencial', err);
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      setDownloadProgress(p => ({ ...p, current: i + 1, name: c.client_company }));
      const blob = await generatePdfBlob(c, campaign);
      downloadBlob(blob, `${String(i + 1).padStart(3, '0')}_${c.client_company.replace(/\s+/g, '_')}.pdf`);
      await new Promise(r => setTimeout(r, 600));
    }
    toast.success(`${targets.length} PDFs descargados`);
  } finally {
    setDownloadProgress(p => ({ ...p, active: false }));
  }
}, [companies, campaign]);
```

### 4. Atajos de teclado (nuevo `useEffect`)
```typescript
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      toggleSelectAll();
    }
    if (e.key === 'Escape' && selectedIds.length > 0) clearSelection();
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedIds.length > 0) {
      e.preventDefault();
      handleDownloadSelected(selectedIds);
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [selectedIds, toggleSelectAll, clearSelection, handleDownloadSelected]);
```

### 5. Header de la tabla — añadir columna checkbox (línea ~537)
Antes de `<TableHead>Empresa</TableHead>` añadir:
```tsx
<TableHead className="w-10">
  <Checkbox
    checked={isAllSelected}
    // Radix Checkbox acepta boolean o 'indeterminate'
    data-state={isIndeterminate ? 'indeterminate' : undefined}
    onCheckedChange={toggleSelectAll}
    aria-label="Seleccionar todas"
  />
</TableHead>
```

### 6. Filas de la tabla — añadir checkbox y fondo seleccionado (línea ~554)
- `<TableRow>` → `<TableRow className={cn(selectedIds.includes(c.id) && 'bg-primary/5')}>`
- Primera celda nueva antes de `<TableCell className="font-medium">`:
```tsx
<TableCell className="w-10">
  <Checkbox
    checked={selectedIds.includes(c.id)}
    onCheckedChange={() => toggleSelection(c.id)}
    aria-label={`Seleccionar ${c.client_company}`}
  />
</TableCell>
```

### 7. `FloatingActionBar` — nuevo componente inline (antes del `return` principal)
```tsx
function FloatingActionBar({
  selectedCount, onClear, onDownload, onSend, isBusy
}: {
  selectedCount: number;
  onClear: () => void;
  onDownload: () => void;
  onSend: () => void;
  isBusy: boolean;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <span className="text-sm font-medium tabular-nums">
            {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
          </span>
          <div className="h-4 w-px bg-border" />
          <Button size="sm" variant="ghost" onClick={onClear} disabled={isBusy}>
            <X className="h-4 w-4 mr-1.5" />Limpiar
          </Button>
          <Button size="sm" variant="outline" onClick={onDownload} disabled={isBusy}>
            <Download className="h-4 w-4 mr-1.5" />
            Descargar PDFs
          </Button>
          <Button size="sm" onClick={onSend} disabled={isBusy}>
            <Mail className="h-4 w-4 mr-1.5" />
            Enviar emails
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8. Render del `FloatingActionBar` (al final del JSX principal, antes del cierre `</div>`)
```tsx
{selectedIds.length > 0 && (
  <FloatingActionBar
    selectedCount={selectedIds.length}
    onClear={clearSelection}
    onDownload={() => handleDownloadSelected(selectedIds)}
    onSend={() => { /* enviar solo seleccionadas — llama sendSingle en loop */ }}
    isBusy={isBusy}
  />
)}
```

Para "Enviar emails" desde la barra flotante, se añade `handleSendSelected(ids)` que reutiliza la lógica de `sendSingle` en bucle sobre las seleccionadas con email.

## Archivos a modificar

Solo **`src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`**:
- Nuevos imports en línea 1: `Checkbox`, `X`, `cn`
- Estado `selectedIds` y helpers de selección tras línea 217
- Función `handleDownloadSelected` tras `handleDownloadAll` (~línea 337)
- Función `handleSendSelected` (similar a `handleSendEmails` pero filtra por ids)
- `useEffect` de atajos de teclado
- Componente `FloatingActionBar` (inline antes del componente principal)
- Header de tabla: nueva columna checkbox (línea ~537)
- Cada `<TableRow>`: clase condicional + celda checkbox (línea ~554)
- Render de `FloatingActionBar` al final del JSX

## Lo que NO cambia
- Toda la lógica de `sendSingle`, `handleSendEmails`, `handleDownloadAll`, `handleRetryFailed`
- `PDFPreviewModal`
- `generatePdfBlob`, `downloadBlob`, `mapToPdfData`
- La Card de "Enviar Valoraciones" (botones globales superiores)
- Base de datos, edge functions, otros pasos
