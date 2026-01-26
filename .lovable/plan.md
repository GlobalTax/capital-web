

## Plan: Indicador Visual Prominente para Ctrl+V

Se añadirá un indicador visual más llamativo en la zona de drop de imágenes que muestre claramente "Pega con Ctrl+V".

---

### Cambios a Implementar

#### Actualizar `src/components/admin/leads/BuyerQuickSearch.tsx`

**Cambios en la zona de drop (líneas 239-268):**

1. **Añadir indicador de Ctrl+V con icono de teclado** dentro de la zona de drop
2. **Diseño visual mejorado** con badge o chip destacado
3. **Eliminar la mención redundante** del texto inferior (línea 345)

**Diseño propuesto:**

```text
┌─────────────────────────────────────────────────────┐
│                    [📷 icono]                       │
│         Arrastra una imagen aquí                    │
│   Logo, tarjeta de visita, informe financiero...   │
│                                                     │
│  [Seleccionar imagen]   ───o───   [⌨ Ctrl+V]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Implementación:**

```tsx
<div className="flex items-center justify-center gap-3 mt-2">
  <Button variant="outline" size="sm" type="button">
    <ImagePlus className="h-4 w-4 mr-2" />
    Seleccionar imagen
  </Button>
  <span className="text-xs text-muted-foreground">o</span>
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md border border-primary/20">
    <Keyboard className="h-3.5 w-3.5" />
    <span className="text-xs font-medium">Ctrl+V</span>
  </div>
</div>
```

---

### Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/leads/BuyerQuickSearch.tsx` | Añadir indicador visual prominente de Ctrl+V en la zona de drop |

