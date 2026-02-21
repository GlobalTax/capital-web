
# Añadir estimación de tamaño del ZIP antes de descargar

## Contexto

Actualmente los botones "Descargar PDFs" (tanto el global como el de la FloatingActionBar) no muestran ninguna estimación de tamaño. El usuario no sabe si el ZIP pesará 5 MB o 500 MB antes de iniciar la descarga.

## Enfoque

Los PDFs se generan con `@react-pdf/renderer` dinámicamente, por lo que no podemos saber el tamaño exacto sin generarlos. Sin embargo, podemos usar una **estimación basada en un tamaño medio por PDF**. Observando PDFs de valoración típicos (gráficos + texto + branding), un PDF de valoración profesional pesa entre **150-250 KB**. Usaremos **~200 KB como media**.

La estimación se calcula como: `numPDFs * 200 KB` (sin comprimir) y `numPDFs * 150 KB` (comprimido ZIP ~75% del original).

## Cambios

### 1. Función helper de estimación

Añadir al inicio de `ProcessSendStep.tsx`:

```typescript
function estimateZipSize(count: number): string {
  // ~200KB per PDF, ZIP compression ~75%
  const estimatedBytes = count * 200 * 1024 * 0.75;
  if (estimatedBytes >= 1024 * 1024) {
    return `~${(estimatedBytes / (1024 * 1024)).toFixed(0)} MB`;
  }
  return `~${(estimatedBytes / 1024).toFixed(0)} KB`;
}
```

### 2. FloatingActionBar — mostrar tamaño estimado en el botón de descarga

Modificar `FloatingActionBarProps` para recibir `estimatedSize: string` y mostrarlo:

```tsx
<Button size="sm" variant="outline" onClick={onDownload} disabled={isBusy}>
  <Download className="h-4 w-4 mr-1.5" />
  Descargar PDFs ({estimatedSize})
</Button>
```

### 3. Botón "Descargar todas" — mostrar tamaño estimado

En el botón global (linea 617-626):

```tsx
Descargar {downloadableCompanies.length} PDFs ({estimateZipSize(downloadableCompanies.length)})
```

### 4. Pasar la prop al FloatingActionBar

En la invocación del componente (linea 806), añadir:

```tsx
<FloatingActionBar
  ...
  estimatedSize={estimateZipSize(selectedIds.length)}
/>
```

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `ProcessSendStep.tsx` | Función `estimateZipSize`, nueva prop en `FloatingActionBar`, textos actualizados en botones |

## Resultado visual

- Botón global: `Descargar 147 PDFs (~22 MB)`
- FloatingActionBar con 5 seleccionadas: `Descargar PDFs (~750 KB)`
- FloatingActionBar con 50 seleccionadas: `Descargar PDFs (~7 MB)`
