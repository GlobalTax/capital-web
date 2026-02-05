

# Plan: Añadir Checkbox "Revisado" en Tabla de Corporate Buyers

## Resumen

Añadir una columna con checkbox para marcar compradores corporativos como "revisados" en la tabla `/admin/corporate-buyers`. El cambio persiste en base de datos y se actualiza al instante en la UI.

---

## Cambios Necesarios

### 1. Base de Datos - Nueva Columna

Ejecutar migración SQL para añadir el campo `is_reviewed`:

```sql
ALTER TABLE corporate_buyers 
ADD COLUMN is_reviewed BOOLEAN DEFAULT FALSE;

-- Opcional: índice si se planea filtrar por este campo
CREATE INDEX idx_corporate_buyers_is_reviewed 
ON corporate_buyers(is_reviewed) 
WHERE is_deleted = false;
```

### 2. Tipos TypeScript

**Archivo:** `src/types/corporateBuyers.ts`

Añadir campo al interface `CorporateBuyer`:

```typescript
export interface CorporateBuyer {
  // ... campos existentes ...
  is_reviewed: boolean;  // NUEVO
}
```

### 3. Hook para Toggle "Revisado"

**Archivo:** `src/hooks/useCorporateBuyers.ts`

Añadir nuevo hook:

```typescript
export const useToggleBuyerReviewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isReviewed }: { id: string; isReviewed: boolean }) => {
      const { error } = await supabase
        .from('corporate_buyers')
        .update({ is_reviewed: isReviewed })
        .eq('id', id);

      if (error) throw error;
      return { id, isReviewed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });
    },
    onError: () => {
      toast.error('Error al actualizar estado de revisión');
    },
  });
};
```

### 4. UI - Columna Checkbox en Tabla

**Archivo:** `src/components/admin/corporate-buyers/CorporateBuyersTable.tsx`

Añadir columna "Revisado" con checkbox:

| Ubicación | Cambio |
|-----------|--------|
| Props | Añadir `onToggleReviewed: (id: string, isReviewed: boolean) => void` |
| Header | Añadir columna "✓" (check icon) entre Favorito y Nombre |
| Row | Añadir Checkbox clicable que llama `onToggleReviewed` |

**Header:**
```tsx
<div className="w-10 flex-shrink-0 flex items-center justify-center">
  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
</div>
```

**Row:**
```tsx
<div className="w-10 flex-shrink-0 flex justify-center">
  <Checkbox
    checked={buyer.is_reviewed}
    onClick={(e) => {
      e.stopPropagation();
      onToggleReviewed(buyer.id, !buyer.is_reviewed);
    }}
    className="data-[state=checked]:bg-green-600"
  />
</div>
```

### 5. Página - Conectar Handler

**Archivo:** `src/pages/admin/CorporateBuyersPage.tsx`

Importar y usar el nuevo hook:

```tsx
import { useToggleBuyerReviewed } from '@/hooks/useCorporateBuyers';

const { mutate: toggleReviewed } = useToggleBuyerReviewed();

<CorporateBuyersTable
  // ...props existentes
  onToggleReviewed={(id, isReviewed) => toggleReviewed({ id, isReviewed })}
/>
```

---

## Resultado Visual

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ☐  │ ⭐ │ ✓  │ Nombre        │ Tipo     │ País │ Sectores │ Facturación │
├────┼────┼────┼───────────────┼──────────┼──────┼──────────┼─────────────┤
│ ☐  │ ☆  │ ☑  │ Grupo ABC     │ Corporate│ ES   │ Tech     │ €5M - €50M  │
│ ☐  │ ★  │ ☐  │ Inversiones XY│ PE Fund  │ ES   │ Industria│ €10M - €100M│
└────┴────┴────┴───────────────┴──────────┴──────┴──────────┴─────────────┘
        ▲
        Nueva columna "Revisado"
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| **SQL Migration** | Añadir columna `is_reviewed` |
| `src/types/corporateBuyers.ts` | Añadir `is_reviewed: boolean` al interface |
| `src/hooks/useCorporateBuyers.ts` | Añadir hook `useToggleBuyerReviewed` |
| `src/components/admin/corporate-buyers/CorporateBuyersTable.tsx` | Añadir columna con checkbox |
| `src/pages/admin/CorporateBuyersPage.tsx` | Conectar handler toggle |

---

## Comportamiento

- **Click en checkbox** → Toggle instantáneo (optimista) → Persiste en DB
- **Visual**: Checkbox verde cuando está marcado
- **Sin refresh**: La tabla se actualiza automáticamente via React Query invalidation

