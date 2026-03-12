

## Mejoras: Notas inline + Mover/Copiar empresa a otra lista

### Cambios en `ContactListDetailPage.tsx`

**1. Columna Notas editable inline en la tabla de empresas (líneas 747-812)**
- Añadir `<TableHead>Notas</TableHead>` antes de la columna de acciones
- En cada fila, renderizar un `<textarea>` inline que:
  - Muestra el texto de `company.notas` o placeholder "Añadir nota..."
  - Al hacer clic, se activa para edición
  - Al perder foco (`onBlur`), guarda automáticamente via `supabase.from('outbound_list_companies').update({ notas }).eq('id', company.id)`
  - Actualiza el cache local de react-query para feedback inmediato
- Implementar con un pequeño componente inline `InlineNoteCell` dentro del mismo fichero para gestionar el estado local de edición

**2. Opciones "Mover a otra lista" y "Copiar a otra lista" en el dropdown (líneas 799-809)**
- Añadir dos `DropdownMenuItem` nuevos con iconos apropiados
- Nuevos estados: `moveCompany` / `copyCompany` (la empresa seleccionada), `moveTargetListId` / `copyTargetListId`
- Nuevo modal compartido con:
  - Título dinámico ("Mover empresa" / "Copiar empresa")
  - Select con todas las listas (`allLists` ya existe en el componente, línea 230)
  - Botón confirmar
- **Mover**: Actualiza `list_id` del registro en `outbound_list_companies` a la lista destino + limpia `notas` a null. El trigger de count se encarga del resto.
- **Copiar**: Primero consulta si el CIF ya existe en la lista destino. Si existe, muestra toast de error. Si no, inserta un nuevo registro con todos los datos excepto `notas` e `id`.

### No se crean ficheros nuevos — todo dentro de `ContactListDetailPage.tsx`

### Componente auxiliar `InlineNoteCell`
```text
Props: companyId, initialValue, onSaved
Estado local: value, isEditing
Render: textarea con auto-resize, placeholder gris, guarda onBlur
```

