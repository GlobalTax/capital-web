
## Plan: Relación de Oportunidades en el Sidebar

### Objetivo
Sustituir el item "Operaciones" (`/admin/operations`) dentro de la sección "🏢 GESTIONAR DATOS" por un nuevo item "Relación de Oportunidades" que muestre automáticamente los mandatos visibles en ROD.

### Pasos

#### Paso 1: Crear página dedicada `/admin/oportunidades`
- Mover el componente `RODOpportunities` (ya creado en el dashboard) a una página completa en `/admin/oportunidades`
- Añadir funcionalidades extra para la vista dedicada: filtros por tipo (Sell/Buy), buscador, y posibilidad de expandir descripciones
- Los datos se leen en tiempo real de `mandatos` + `datos_proyecto` (ya funciona)

#### Paso 2: Actualizar sidebar-config.ts
- En la sección "🏢 GESTIONAR DATOS", **sustituir** el item "Operaciones" (`/admin/operations`) por:
  - Título: "Rel. Oportunidades"  
  - URL: `/admin/oportunidades`
  - Icono: `Briefcase`
  - Descripción: "Mandatos visibles en ROD"

#### Paso 3: Registrar ruta en AdminRouter
- Añadir lazy import de la nueva página
- Registrar `<Route path="/oportunidades" element={...} />`
- Mantener las rutas de `/operations` existentes (por si hay enlaces internos), sin eliminarlas

#### Paso 4: Registrar permiso en AdminSidebar
- Mapear la ruta `oportunidades` al permiso `dashboard` (visible para todos los usuarios autenticados, igual que Pipeline/Prospectos)

#### Paso 5: Eliminar widget RODOpportunities del Dashboard
- Quitar el componente del dashboard principal para evitar duplicidad (o mantenerlo como resumen si lo prefieres — **preguntaré antes de decidir**)

### Lo que NO cambia
- Las rutas `/admin/operations`, `/admin/operations/:id` y `/admin/operations/dashboard` siguen existiendo (no se eliminan)
- Solo se sustituye el acceso desde el sidebar
