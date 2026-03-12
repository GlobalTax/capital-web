

## Plan: Sincronizar empresas de listas de contacto → Empresas + Contactos

### Qué se hará

Un trigger `AFTER INSERT` en `outbound_list_companies` que automáticamente:

1. **Crea/actualiza la empresa** en la tabla `empresas` (directorio `/admin/empresas`)
2. **Crea el contacto principal** en la tabla `contactos` y lo vincula a la empresa
3. **Crea un segundo contacto** (Director Ejecutivo) si es diferente del contacto principal

### Mapeo de campos

```text
outbound_list_companies  →  empresas
────────────────────────────────────────
empresa                  →  nombre
cif                      →  cif
web                      →  sitio_web
provincia                →  ubicacion
facturacion              →  facturacion + revenue
ebitda                   →  ebitda
num_trabajadores         →  empleados
descripcion_actividad    →  descripcion
cnae                     →  cnae_descripcion
origen                   →  'outbound'
source                   →  'lista'

outbound_list_companies  →  contactos
────────────────────────────────────────
contacto                 →  nombre
email                    →  email
telefono                 →  telefono
linkedin                 →  linkedin
posicion_contacto        →  cargo
(empresa.id)             →  empresa_principal_id
source                   →  'lista'

director_ejecutivo       →  nombre (2º contacto, cargo='Director Ejecutivo')
```

### Lógica de deduplicación

- **Empresas**: Busca primero por CIF, luego por nombre normalizado (`normalize_company_name`). Si existe → UPDATE con `COALESCE` (no pisa datos existentes). Si no → INSERT.
- **Contactos**: Busca por email (`LOWER(email)`) gracias al índice único existente. Si ya existe un contacto con ese email, lo vincula a la empresa si no tiene `empresa_principal_id`. Si no existe → INSERT.
- **Director Ejecutivo**: Solo se crea si es diferente del contacto principal (por nombre). Se busca también por nombre+empresa para evitar duplicados.

### Implementación

Una única migración SQL con:
1. Función `sync_outbound_list_to_empresas_and_contactos()`
2. Trigger `trg_sync_outbound_list_to_empresas` en `outbound_list_companies`

### Impacto

Cero cambios en código TypeScript. El trigger se ejecuta transparentemente tras cada INSERT en `outbound_list_companies`, que es lo que ya hace el flujo de importación existente.

