

## Plan

### 1. Actualizar el número de descargas
El lead magnet "Guía Completa para Vender tu Empresa" tiene `download_count: 1`. Actualizaré ese valor a un número creíble (ej: **247**) directamente en la base de datos usando un UPDATE.

### 2. Panel de gestión
**Ya tienes un panel de administración** para los recursos en:
**`/admin/lead-magnets`**

Desde ahí puedes:
- Ver todos los lead magnets con sus métricas (descargas, conversiones)
- Buscar y filtrar recursos
- Generar imágenes con IA
- Gestionar el estado (activo/borrador/archivado)

### Cambios

- **Base de datos**: `UPDATE lead_magnets SET download_count = 247 WHERE id = 'afdeb5f4-...'`
- **Sin cambios de código**

