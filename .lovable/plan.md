

## Panel de Inteligencia PE Sectorial -- Reproduccion del Excel en Admin

### Objetivo
Crear un panel completo en `/admin/sector-intelligence` que reproduzca fielmente el Excel de sectores PE, con vista tipo tabla/spreadsheet y capacidad de edicion CRUD completa.

### Datos actuales vs Excel

La tabla `pe_sector_intelligence` ya existe con 43 registros pero tiene 3 columnas vacias que el Excel si tiene:
- `quantitative_data`: Datos cuantitativos clave (vacio en todos los registros)
- `active_pe_firms`: Firmas PE activas con plataformas (vacio)
- `platforms_operations`: Plataformas y operaciones concretas (vacio)

### Cambios planificados

**1. Actualizar datos existentes en la BD**
- Rellenar las 3 columnas vacias con los datos completos del Excel para los 43 registros existentes
- Verificar que no falten subsectores del Excel (el Excel tiene ~50+ filas, la BD tiene 43)
- Insertar los subsectores que falten

**2. Crear pagina de admin `/admin/sector-intelligence`**
- Nueva ruta en AdminRouter
- Vista principal con tabla expandible que muestre las 9 columnas del Excel:
  - Subsector | Vertical | Tesis PE | Datos cuantitativos | Firmas PE | Plataformas | Multiplos | Fase | Geografia
- Agrupacion por sector (SALUD, CONSTRUCCION, etc.) con headers de seccion coloreados
- Filas expandibles: al hacer clic se despliega el detalle completo (firmas PE, plataformas, datos cuantitativos son textos muy largos)
- Filtros: busqueda libre, filtro por sector, filtro por fase de consolidacion
- Badges de color por fase de consolidacion (reutilizando el sistema de colores de PESectorBrowser)

**3. CRUD completo**
- **Editar**: modal o panel lateral para editar cualquier campo de un subsector
- **Crear**: boton para anadir nuevos subsectores con formulario completo
- **Eliminar**: con confirmacion
- **Activar/Desactivar**: toggle de is_active

**4. Registrar ruta en AdminRouter y sidebar**
- Anadir la ruta `/sector-intelligence` al AdminRouter
- Anadir enlace en la navegacion lateral del admin

---

### Detalles tecnicos

| Archivo | Cambio |
|---|---|
| `supabase` (INSERT datos) | Actualizar los 43 registros con quantitative_data, active_pe_firms, platforms_operations del Excel. Insertar subsectores faltantes |
| `src/pages/admin/SectorIntelligencePage.tsx` | Nueva pagina con tabla expandible, filtros y CRUD |
| `src/components/admin/sector-intelligence/SectorTable.tsx` | Tabla principal con filas agrupadas por sector y expandibles |
| `src/components/admin/sector-intelligence/SectorEditDialog.tsx` | Modal de edicion/creacion de subsector |
| `src/hooks/useSectorIntelligence.ts` | Hook con queries y mutations CRUD sobre pe_sector_intelligence |
| `src/features/admin/components/AdminRouter.tsx` | Anadir ruta /sector-intelligence |
| `src/features/admin/components/AdminLayout.tsx` | Anadir enlace en sidebar |

### Resultado
Un panel tipo spreadsheet donde puedes ver toda la inteligencia PE sectorial como en el Excel, pero con capacidad de editar, anadir y eliminar datos directamente desde el admin.

