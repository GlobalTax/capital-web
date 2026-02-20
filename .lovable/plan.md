
# Crear sistema de Interacciones en el Perfil de Empresa

## Diagnóstico exacto del problema

El `EmpresaDetailPage.tsx` **no tiene ninguna sección de interacciones**. La página actual solo muestra: Contacto Principal, Financials, Contactos Asociados, Descripción, y un sidebar de Estado/Acciones. 

El usuario reporta el error desde `godeal.es/empresas/{id}` (entorno live). El feature existe en producción pero **el código fuente del mismo está ausente o fue eliminado** del repositorio. Es necesario construirlo desde cero.

### Estado de la base de datos (confirmado)

La tabla `interacciones` ya existe y tiene datos:
```
id, empresa_id, mandato_id, tipo, titulo, descripcion, fecha, 
resultado, siguiente_accion, fecha_siguiente_accion, created_by, ...
```

**Constraints importantes:**
- `tipo` CHECK: solo acepta `'llamada'|'email'|'reunion'|'nota'|'whatsapp'|'linkedin'|'visita'` (en español/lowercase)
- `resultado` CHECK: solo acepta `'positivo'|'neutral'|'negativo'|'pendiente_seguimiento'` (en español)
- `titulo` es NOT NULL y obligatorio
- `contacto_id IS NOT NULL OR empresa_id IS NOT NULL` (al menos uno requerido)
- `created_by` es nullable en DB pero la RLS policy de INSERT requiere `created_by = auth.uid()`

**RLS Policies:**
- SELECT: `current_user_can_read()` — funciona para cualquier admin
- INSERT: `current_user_can_read() AND (created_by = auth.uid())` — requiere pasar `created_by` con el UID del usuario autenticado

### Causa raíz del error

La causa más probable del error "Error al registrar la interacción" es que el formulario existente en producción enviaba alguno de estos valores incorrectos:
1. `tipo: 'WhatsApp'` en lugar de `tipo: 'whatsapp'` (violación de CHECK constraint → error 23514)
2. `resultado: 'Positivo'` en lugar de `resultado: 'positivo'` (violación de CHECK constraint)
3. `created_by` ausente o incorrecto (violación de RLS policy)
4. O simplemente el código fuente no existe en este repo y hay que crearlo

## Solución completa

### Arquitectura

```text
Nueva feature de Interacciones en EmpresaDetailPage
├── src/hooks/useEmpresaInteracciones.ts  (hook nuevo)
│     ├── useQuery: leer interacciones por empresa_id
│     └── useMutation: crear, actualizar, eliminar
└── src/pages/admin/EmpresaDetailPage.tsx  (añadir tab de Interacciones)
      ├── Tabs: Info General / Interacciones (NUEVO)
      ├── InteraccionesTimeline (lista con cards)
      └── NuevaInteraccionDialog (modal de creación)
```

### 1. Nuevo hook: `src/hooks/useEmpresaInteracciones.ts`

Este hook encapsula toda la lógica de datos para las interacciones de una empresa concreta:

```typescript
// Tipos
type TipoInteraccion = 'llamada' | 'email' | 'reunion' | 'nota' | 'whatsapp' | 'linkedin' | 'visita';
type ResultadoInteraccion = 'positivo' | 'neutral' | 'negativo' | 'pendiente_seguimiento';

interface Interaccion {
  id: string;
  empresa_id: string | null;
  tipo: TipoInteraccion;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  resultado: ResultadoInteraccion | null;
  siguiente_accion: string | null;
  fecha_siguiente_accion: string | null;
  created_by: string | null;
  created_at: string | null;
}

interface CreateInteraccionInput {
  tipo: TipoInteraccion;
  titulo: string;
  descripcion?: string;
  fecha: string;  // ISO string
  resultado?: ResultadoInteraccion;
  siguiente_accion?: string;
  fecha_siguiente_accion?: string;  // date string YYYY-MM-DD
}
```

**`useEmpresaInteracciones(empresaId)`** retorna:
- `interacciones: Interaccion[]` — lista ordenada por fecha desc
- `isLoading: boolean`
- `createInteraccion(input)` — mutación con validación + logs
- `deleteInteraccion(id)` — mutación

**Lógica crítica en `createInteraccion`:**
```typescript
const mutationFn = async (input: CreateInteraccionInput) => {
  // 1. Obtener userId actual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  
  // 2. Los valores ya vienen normalizados del formulario
  //    (el form usa los valores del enum directamente)
  const insertData = {
    empresa_id: empresaId,
    tipo: input.tipo,            // ya es 'whatsapp', 'llamada', etc.
    titulo: input.titulo.trim(),
    descripcion: input.descripcion?.trim() || null,
    fecha: input.fecha,          // ISO string
    resultado: input.resultado || null,
    siguiente_accion: input.siguiente_accion?.trim() || null,
    fecha_siguiente_accion: input.fecha_siguiente_accion || null,
    created_by: user.id,         // CRÍTICO: requerido por RLS
  };
  
  // 3. Validación frontend
  if (!insertData.titulo) throw new Error('El título es obligatorio');
  if (!insertData.tipo) throw new Error('El tipo de interacción es obligatorio');
  
  // 4. Insert con log exhaustivo
  console.group('[CREATE_INTERACCION]');
  console.log('empresa_id:', empresaId);
  console.log('user_id:', user.id);
  console.log('data:', insertData);
  
  const { data, error } = await supabase
    .from('interacciones')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error:', { code: error.code, message: error.message, details: error.details, hint: error.hint });
    console.groupEnd();
    // Mensajes de error específicos según código
    if (error.code === '23514') throw new Error(`Valor inválido: ${error.message}`);
    if (error.code === '23503') throw new Error('ID de empresa no válido');
    throw error;
  }
  
  console.log('Success:', data);
  console.groupEnd();
  return data;
};
```

### 2. Refactor de `EmpresaDetailPage.tsx` — añadir Tabs + InteraccionesSection

El layout actual (2 columnas: `[1fr_280px]`) se mantiene pero se envuelve en `<Tabs>`:

```text
ANTES: Layout directo con cards apiladas
DESPUÉS: 
  <Tabs defaultValue="info">
    <TabsList>
      <TabsTrigger value="info">Información</TabsTrigger>
      <TabsTrigger value="interacciones">
        Interacciones {count > 0 && <Badge>{count}</Badge>}
      </TabsTrigger>
    </TabsList>
    
    <TabsContent value="info">
      [contenido actual: contacto, financials, descripción, sidebar]
    </TabsContent>
    
    <TabsContent value="interacciones">
      <InteraccionesSection empresaId={id} />
    </TabsContent>
  </Tabs>
```

#### `InteraccionesSection` (componente inline en la página)

Contiene:
1. **Header con botón** "Nueva Interacción" (abre el dialog)
2. **Timeline de interacciones** — lista de cards ordenadas por fecha desc
3. **EmptyState** si no hay interacciones

#### `NuevaInteraccionDialog` (componente inline)

Modal con form controlado (sin react-hook-form para mantener simplicidad, usando estado local igual que otros modales de la app):

```text
Dialog max-w-lg
  DialogHeader: "Registrar Nueva Interacción"
  
  Form fields:
  ├── Tipo * [Select]
  │     opciones: llamada/email/reunion/nota/whatsapp/linkedin/visita
  │     valores del <SelectItem> = valores del enum DB directamente
  ├── Título * [Input]
  ├── Descripción [Textarea rows=3]
  ├── Fecha * [Input type="datetime-local" default=now]
  ├── Resultado [Select] opciones: positivo/neutral/negativo/pendiente_seguimiento
  ├── Siguiente Acción [Textarea rows=2]
  └── Fecha Siguiente Acción [Input type="date"]
  
  Footer: [Cancelar] [Guardar Interacción]
```

**Labels en español para el usuario, valores en español del enum para la DB:**
```typescript
const TIPO_OPTIONS = [
  { value: 'llamada',   label: '📞 Llamada' },
  { value: 'email',     label: '📧 Email' },
  { value: 'reunion',   label: '🤝 Reunión' },
  { value: 'nota',      label: '📝 Nota interna' },
  { value: 'whatsapp',  label: '💬 WhatsApp' },
  { value: 'linkedin',  label: '🔗 LinkedIn' },
  { value: 'visita',    label: '🏢 Visita' },
];

const RESULTADO_OPTIONS = [
  { value: 'positivo',              label: '✅ Positivo' },
  { value: 'neutral',               label: '➖ Neutral' },
  { value: 'negativo',              label: '❌ Negativo' },
  { value: 'pendiente_seguimiento', label: '⏰ Pendiente seguimiento' },
];
```

#### `InteraccionCard` (componente inline)

Card por interacción que muestra:
- Badge del tipo (con color por tipo)
- Título
- Descripción (truncada a 3 líneas)
- Fecha formateada (date-fns + es locale)
- Badge del resultado si existe
- Siguiente acción si existe

### 3. Archivos a crear/modificar

| Archivo | Operación | Descripción |
|---------|-----------|-------------|
| `src/hooks/useEmpresaInteracciones.ts` | Crear | Hook con read + create + delete |
| `src/pages/admin/EmpresaDetailPage.tsx` | Modificar | Añadir Tabs, InteraccionesSection, NuevaInteraccionDialog, InteraccionCard |

### 4. Cambios en `EmpresaDetailPage.tsx` en detalle

**Imports nuevos a añadir** (línea 1-46):
- `Tabs, TabsContent, TabsList, TabsTrigger` de `@/components/ui/tabs`
- `Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter` de `@/components/ui/dialog`
- `MessageSquare, Clock, ChevronRight` de `lucide-react`
- `useEmpresaInteracciones` del nuevo hook
- `format, formatDistanceToNow` de `date-fns` (ya importado `format`)

**Estado nuevo** en el componente (tras línea 74):
```typescript
const [isInteraccionDialogOpen, setIsInteraccionDialogOpen] = useState(false);
const [nuevaInteraccion, setNuevaInteraccion] = useState({
  tipo: 'llamada' as const,
  titulo: '',
  descripcion: '',
  fecha: new Date().toISOString().slice(0, 16),
  resultado: '' as string,
  siguiente_accion: '',
  fecha_siguiente_accion: '',
});
```

**Hook de datos**:
```typescript
const { interacciones, isLoading: isLoadingInteracciones, createInteraccion, isCreating } = useEmpresaInteracciones(id);
```

**Wrapping del contenido actual en Tabs** (línea 194 del return):
El `<div className="space-y-6">` principal se convierte en:
```tsx
<div className="space-y-6">
  {/* Header remains the same */}
  
  <Tabs defaultValue="info">
    <TabsList>
      <TabsTrigger value="info">Información General</TabsTrigger>
      <TabsTrigger value="interacciones">
        Interacciones
        {interacciones.length > 0 && (
          <Badge variant="secondary" className="ml-2">{interacciones.length}</Badge>
        )}
      </TabsTrigger>
    </TabsList>
    
    <TabsContent value="info" className="mt-4">
      {/* Todo el grid actual [1fr_280px] */}
    </TabsContent>
    
    <TabsContent value="interacciones" className="mt-4">
      <InteraccionesSection />
    </TabsContent>
  </Tabs>
  
  {/* Dialogs remain at the bottom */}
</div>
```

### 5. No se necesitan migraciones de DB

La tabla `interacciones` ya existe con la estructura correcta. Los RLS policies ya están configurados y correctos. Solo hay que construir el frontend.

### 6. Referencia al componente existente similar

`CRPortfolioInteractionsTab.tsx` es la referencia de diseño. La nueva implementación seguirá el mismo patrón visual (cards con icono + badge de tipo + descripción + fecha relativa), adaptado a la tabla `interacciones` en lugar de `cr_portfolio_interactions`.

### Resumen de cambios

- **1 hook nuevo**: `src/hooks/useEmpresaInteracciones.ts` (~120 líneas)
- **1 archivo modificado**: `src/pages/admin/EmpresaDetailPage.tsx` (~+200 líneas)
- **0 migraciones** de base de datos requeridas
- **0 cambios** en otros archivos o edge functions
