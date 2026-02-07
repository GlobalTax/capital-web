

## Plan: Abrir ficha de deal + arreglar imagen

Hay dos problemas:

1. **Las tarjetas de deals no se abren** porque tienen `cursor-pointer` en el estilo pero no tienen ningun `onClick` — al hacer clic no pasa nada.
2. **La imagen no se ve** — la URL en la base de datos existe y el bucket es publico, pero hay que verificar que se renderiza correctamente.

### Solucion

#### 1. Vista de detalle al hacer clic en un deal

Se anadira un estado `selectedDeal` al componente `DealsuiteSyncPanel`. Al hacer clic en una tarjeta del listado, se mostrara el componente `DealsuitePreviewCard` ya existente con los datos de ese deal (reutilizando la misma vista Dealsuite que ya funciona para datos extraidos).

**Cambios en `DealsuiteSyncPanel.tsx`:**
- Nuevo estado: `selectedDeal` (tipo `DealsuiteDeal | null`)
- `onClick` en cada tarjeta del listado que establece `selectedDeal`
- Renderizar `DealsuitePreviewCard` cuando `selectedDeal` tiene valor, pasando los datos del deal guardado
- Boton "Cerrar" en lugar de "Guardar/Descartar" cuando se ve un deal existente (o permitir edicion y re-guardado)

#### 2. Imagen visible en la ficha y en el listado

- En la tarjeta del listado: ya se renderiza `deal.image_url` pero se verificara que no hay problemas de carga (anadir fallback si la imagen falla)
- En la ficha de detalle: usar `deal.image_url` como `imagePreview` para que se muestre en el sidebar del `DealsuitePreviewCard`

### Detalle tecnico

```text
Estado nuevo:
  const [selectedDeal, setSelectedDeal] = useState<DealsuiteDeal | null>(null)

En cada tarjeta:
  onClick={() => setSelectedDeal(deal)}

Renderizado condicional:
  {selectedDeal && (
    <DealsuitePreviewCard
      deal={selectedDeal}
      imagePreview={selectedDeal.image_url}
      isSaving={false}
      onUpdate={...}
      onSave={...}
      onDiscard={() => setSelectedDeal(null)}
    />
  )}

Fallback de imagen en tarjetas:
  <img ... onError={(e) => e.currentTarget.style.display = 'none'} />
```

### Archivos a modificar

- **`src/components/admin/DealsuiteSyncPanel.tsx`**: Anadir estado `selectedDeal`, onClick en tarjetas, renderizar preview card para deal seleccionado, fallback de imagen
- **`src/components/admin/DealsuitePreviewCard.tsx`**: Pequeno ajuste para mostrar "Cerrar" en vez de "Guardar" cuando se usa en modo solo lectura (prop opcional `readOnly`)
