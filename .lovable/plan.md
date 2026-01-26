

## Plan: Sistema de Favoritos para Leads

Se implementara una pestana de "Favoritos" en la tabla de Leads para facilitar el seguimiento de contactos importantes.

---

### Arquitectura Propuesta

Se reutilizara la infraestructura existente de favoritos (`corporate_favorites`) anadiendo un nuevo tipo de entidad `lead`. Esto sigue el patron ya establecido en el proyecto para CR, SF, y Corporate Buyers.

```text
+------------------------+     +-------------------------+
|   LinearContactsManager |     |  corporate_favorites   |
+------------------------+     +-------------------------+
|  - Tabs: Favoritos,    |<--->|  entity_type: 'lead'   |
|    Directorio, Stats   |     |  entity_id: UUID       |
|  - favoriteIds Set     |     |  added_by: UUID        |
+------------------------+     +-------------------------+
           |
           v
+------------------------+
|  LeadFavoriteButton    |
+------------------------+
|  - Star icon           |
|  - Toggle favorite     |
+------------------------+
```

---

### Cambios a Implementar

#### 1. Base de Datos
- Modificar el CHECK constraint de `corporate_favorites.entity_type` para incluir `'lead'`
- La tabla ya soporta cualquier UUID como `entity_id`, por lo que no se requieren cambios adicionales

#### 2. Hook de Favoritos (`useCorporateFavorites.ts`)
- Anadir `useFavoriteLeadIds()` para obtener IDs de leads favoritos
- Actualizar el tipo de `useToggleCorporateFavorite` para aceptar `'lead'` como entity type

#### 3. Componente Boton de Favorito (`LeadFavoriteButton.tsx`)
- Crear boton reutilizable con icono de estrella
- Misma estetica que `CRFavoriteButton`
- Props: `leadId`, `size`, `className`

#### 4. Fila de la Tabla (`ContactTableRow.tsx`)
- Anadir columna de estrella al inicio (antes del checkbox)
- Nuevo estilo de columna: `star: { minWidth: 32, flex: '0 0 32px' }`
- Integrar `LeadFavoriteButton`

#### 5. Header de la Tabla (`LinearContactsTable.tsx`)
- Anadir header para columna de estrella
- Ajustar scroll sync

#### 6. Manager Principal (`LinearContactsManager.tsx`)
- Anadir pestana "Favoritos" como default
- Filtrar contacts por `favoriteIds` cuando tab = 'favorites'
- Mostrar contador de favoritos en la pestana

---

### Resultado Visual

```text
+-----------------------------------------------------------+
| Leads                                                      |
|   [★ Favoritos (12)] [Directorio] [Estadisticas]          |
+-----------------------------------------------------------+
| ★ | ☐ | Contacto    | Origen    | Canal | Empresa | ...   |
|---|---|-------------|-----------|-------|---------|-------|
| ★ | ☐ | Juan Garcia | Valoracion| Web   | Acme    | ...   |
| ☆ | ☐ | Maria Lopez | Comercial | Ref   | Beta    | ...   |
+-----------------------------------------------------------+
```

---

### Secuencia de Implementacion

1. Migracion DB: Actualizar CHECK constraint para `entity_type`
2. Hook: Extender `useCorporateFavorites` con soporte para leads
3. Componente: Crear `LeadFavoriteButton`
4. Tabla: Modificar `ContactTableRow` y `LinearContactsTable`
5. Manager: Actualizar `LinearContactsManager` con tabs y filtro

---

### Detalles Tecnicos

**Migracion SQL:**
```sql
ALTER TABLE public.corporate_favorites 
DROP CONSTRAINT IF EXISTS corporate_favorites_entity_type_check;

ALTER TABLE public.corporate_favorites 
ADD CONSTRAINT corporate_favorites_entity_type_check 
CHECK (entity_type IN ('buyer', 'contact', 'lead'));
```

**Nuevo Hook:**
```typescript
export const useFavoriteLeadIds = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'lead-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_favorites')
        .select('entity_id')
        .eq('entity_type', 'lead');
      if (error) throw error;
      return new Set(data.map(f => f.entity_id));
    },
  });
};
```

**Identificador Unico de Lead:**
Como los leads vienen de multiples tablas (`company_valuations`, `contact_leads`, etc.), el `entity_id` sera el UUID del lead, y se guardara junto con el `origin` en el formato `{origin}_{id}` para identificar unicamente cada lead.

---

### Consideraciones

- **RLS**: La tabla `corporate_favorites` ya tiene politicas RLS configuradas para usuarios autenticados
- **Team-Wide**: Los favoritos son visibles para todo el equipo (mismo patron que CR/SF)
- **Performance**: El Set de IDs se carga una sola vez y se usa para filtrado en memoria
- **Persistencia**: Los favoritos persisten entre sesiones via base de datos

