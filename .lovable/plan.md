
# Plan: Corregir Error de validateDOMNesting en BulkDeleteDialog

## Diagnóstico

El componente `AlertDialogDescription` de Radix UI renderiza como un elemento `<p>` (párrafo). Dentro de él hay elementos de bloque (`<p>` y `<div>`) que no pueden estar anidados dentro de un `<p>`.

```
HTML inválido:
<p>                               <!-- AlertDialogDescription -->
  <p>Texto...</p>                 <!-- ❌ p dentro de p -->
  <div>                           <!-- ❌ div dentro de p -->
    <Label>...</Label>
    <Input />
  </div>
</p>
```

## Solución

Mover el `<div>` con el formulario de confirmación **fuera** del `AlertDialogDescription`, y cambiar el `<p>` interno por un `<span>`.

## Cambio en `BulkDeleteDialog.tsx`

**Antes (líneas 57-76):**
```tsx
<AlertDialogDescription className="space-y-3">
  <p>
    Esta acción <strong>NO se puede deshacer</strong>. Los contactos serán
    eliminados de forma definitiva del sistema.
  </p>
  <div className="pt-2">
    <Label htmlFor="confirm-delete" className="text-foreground">
      Escribe <strong>{CONFIRMATION_TEXT}</strong> para confirmar:
    </Label>
    <Input
      id="confirm-delete"
      value={confirmationInput}
      onChange={(e) => setConfirmationInput(e.target.value)}
      placeholder={CONFIRMATION_TEXT}
      className="mt-2"
      autoComplete="off"
      disabled={isLoading}
    />
  </div>
</AlertDialogDescription>
```

**Después:**
```tsx
<AlertDialogDescription>
  Esta acción <strong>NO se puede deshacer</strong>. Los contactos serán
  eliminados de forma definitiva del sistema.
</AlertDialogDescription>
<div className="pt-2">
  <Label htmlFor="confirm-delete" className="text-foreground">
    Escribe <strong>{CONFIRMATION_TEXT}</strong> para confirmar:
  </Label>
  <Input
    id="confirm-delete"
    value={confirmationInput}
    onChange={(e) => setConfirmationInput(e.target.value)}
    placeholder={CONFIRMATION_TEXT}
    className="mt-2"
    autoComplete="off"
    disabled={isLoading}
  />
</div>
```

## Resultado

| Problema | Estado |
|----------|--------|
| `<p>` dentro de `<p>` | Resuelto (eliminado `<p>` interno) |
| `<div>` dentro de `<p>` | Resuelto (movido fuera del Description) |
| Warning aria-describedby | Se mantiene la estructura accesible |

## Estructura HTML Corregida

```
<div>                             <!-- AlertDialogHeader -->
  <h2>Título...</h2>             <!-- AlertDialogTitle -->
  <p>Descripción...</p>          <!-- AlertDialogDescription - solo texto inline -->
</div>
<div class="pt-2">               <!-- Formulario de confirmación - ahora FUERA -->
  <label>...</label>
  <input />
</div>
```

---

## Sección Técnica

### Archivo a modificar
`src/components/admin/contacts/BulkDeleteDialog.tsx`

### Cambios específicos
- Líneas 57-76: Reestructurar contenido del diálogo

### Impacto
- Archivos modificados: 1
- Líneas cambiadas: ~10
- Riesgo: Muy bajo (cambio de estructura HTML, sin cambios de lógica)
- Visual: Sin cambios perceptibles (misma apariencia)
