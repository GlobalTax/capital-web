
# Plan: Arreglar Botones "Importar" y "Nuevo" en Corporate Buyers

## Diagnóstico del Problema

### 1. Botón "Importar" ❌ Sin funcionalidad
El botón en línea 177-180 de `CorporateBuyersPage.tsx` no tiene `onClick`:
```tsx
<Button variant="outline" size="sm" className="gap-1">
  <Upload className="h-4 w-4" />
  Importar
</Button>
```

Existe la edge function `corporate-buyers-import` pero **no hay componente de UI** para subir Excel e invocarla.

### 2. Botón "+ Nuevo" ⚠️ Puede no funcionar
Navega a `/admin/corporate-buyers/new` pero posiblemente hay un problema en la carga lazy o en el componente.

---

## Solución

### Parte 1: Crear Modal de Importación de Corporate Buyers

**Nuevo archivo:** `src/components/admin/corporate-buyers/CorporateBuyersImportModal.tsx`

Funcionalidad:
- Drag & drop o selector de archivo Excel
- Parseo de columnas: Nombre, País, Sectores, Descripción, Website, etc.
- Preview de datos antes de importar
- Invocación de la edge function `corporate-buyers-import`
- Feedback de progreso y resultados

Columnas soportadas (basado en la edge function existente):
| Columna Excel | Campo |
|---------------|-------|
| Nombre | name |
| País | country_base |
| Sectores | sectors |
| Descripción | description |
| Tesis de Inversión | investment_thesis |
| Keywords | keywords |
| Website | website |
| Geografía | geography_focus |
| Rango Facturación | revenue_range |
| Rango EBITDA | ebitda_range |
| URL Fuente | source_url |
| Contacto Nombre | contact.name |
| Contacto Título | contact.title |
| Contacto Email | contact.email |
| Contacto LinkedIn | contact.linkedin_url |
| Contacto Teléfono | contact.phone |

### Parte 2: Conectar Modal a la Página

**Archivo:** `src/pages/admin/CorporateBuyersPage.tsx`

Cambios:
1. Añadir estado `showImportModal`
2. Importar el nuevo componente
3. Conectar `onClick` al botón "Importar"
4. Renderizar el modal

```tsx
// Añadir estado
const [showImportModal, setShowImportModal] = useState(false);

// Modificar botón Importar
<Button 
  variant="outline" 
  size="sm" 
  className="gap-1"
  onClick={() => setShowImportModal(true)}  // ← AÑADIR
>
  <Upload className="h-4 w-4" />
  Importar
</Button>

// Añadir modal al final
<CorporateBuyersImportModal
  open={showImportModal}
  onClose={() => setShowImportModal(false)}
/>
```

### Parte 3: Verificar Navegación a "Nuevo"

El botón ya tiene `onClick={() => navigate('/admin/corporate-buyers/new')}` y la ruta existe en `AdminRouter.tsx`.

Verificar que:
1. `LazyCorporateBuyerDetailPage` se carga correctamente
2. El parámetro `id === 'new'` se procesa bien
3. El formulario `CorporateBuyerForm` se renderiza

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/admin/corporate-buyers/CorporateBuyersImportModal.tsx` | **CREAR** - Modal de importación Excel |
| `src/components/admin/corporate-buyers/index.ts` | **MODIFICAR** - Exportar nuevo componente |
| `src/pages/admin/CorporateBuyersPage.tsx` | **MODIFICAR** - Conectar botones |

---

## Estructura del Modal de Importación

```text
┌─────────────────────────────────────────────────┐
│  Importar Compradores Corporativos              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │   📄 Arrastra un archivo Excel aquí      │  │
│  │      o haz clic para seleccionar         │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Modo de importación:                           │
│  ○ Añadir (no borra existentes)                │
│  ○ Reemplazar (borra todos primero)            │
│                                                 │
├─────────────────────────────────────────────────┤
│  📊 Preview: 45 compradores detectados          │
│  ┌─────────────────────────────────────────┐    │
│  │ Nombre        │ País    │ Sectores     │    │
│  │ Abingdon...   │ UK      │ Tech, SaaS   │    │
│  │ ATU           │ Alemania│ Auto, Retail │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
├─────────────────────────────────────────────────┤
│              [Cancelar]  [Importar 45]          │
└─────────────────────────────────────────────────┘
```

---

## Flujo de Usuario Final

1. Usuario hace clic en "Importar"
2. Se abre modal con dropzone
3. Sube archivo Excel
4. Ve preview de datos detectados
5. Selecciona modo (añadir/reemplazar)
6. Confirma importación
7. Ve progreso y resultados
8. Tabla se actualiza automáticamente

---

## Pruebas Requeridas

1. **Botón Importar** → Abre modal correctamente
2. **Subir Excel** → Parsea y muestra preview
3. **Confirmar importación** → Llama edge function, muestra resultados
4. **Botón Nuevo** → Navega a formulario de creación
5. **Guardar nuevo comprador** → Crea correctamente y redirige

---

## Detalles Técnicos

El modal reutilizará patrones de:
- `AdsCostsImportModal.tsx` (estructura y dropzone)
- `react-dropzone` (ya instalado)
- `xlsx` (ya instalado para parsear Excel)
- Edge function `corporate-buyers-import` (ya existente)
