

## Plan: Añadir columna "Tipo" (tipo de accionista) a Listas de Empresas

### Contexto
Se necesita una nueva columna "Tipo" en `outbound_list_companies` con valores predefinidos (tipos de accionista/propietario). Debe poder establecerse manualmente mediante un desplegable o importarse desde Excel.

### Valores del desplegable
- Una o más personas físicas o familias
- Empresa
- Empresa financiera
- Fondos mutuos & de pensiones/Nominee/Trust/Trustee
- Auto participación
- Banco
- Autoridades públicas, Estado, Gobierno
- Firmas Private Equity
- Venture capital
- Seguro
- Fundaciones/Institutos de investigación
- Accionistas privados no identificados, agregados
- Empleados/Administradores/Directores
- Otros accionistas no identificados, agregados

---

### Cambios necesarios

**1. Migración de base de datos**
- Añadir columna `tipo_accionista` (text, nullable) a `outbound_list_companies`.

**2. `src/hooks/useListColumnPreferences.ts`**
- Añadir nueva columna `tipo_accionista` con label "Tipo" en `DEFAULT_COLUMNS` (posición 15, antes de Notas).

**3. `src/pages/admin/ContactListDetailPage.tsx`**
- Añadir `tipo_accionista` a `COLUMN_SYNONYMS` con sinónimos: `tipo_accionista`, `tipo`, `type`, `tipo_propietario`.
- Añadir `tipo_accionista` al formulario manual (`addForm`) y a la plantilla de descarga Excel.
- Implementar el renderizado de la celda con un `Select` desplegable inline que guarde directamente en BD al cambiar el valor (patrón similar a la columna "Consolidador").

**4. Sincronización con triggers existentes**
- Verificar si el trigger `sync_sublist_company_to_madre` necesita incluir `tipo_accionista` en el COALESCE. Si es así, actualizar la migración.

### Detalles técnicos

- La celda mostrará un `Select` (shadcn) compacto con las 14 opciones. Valor vacío = "—".
- Al seleccionar un valor, se hace `UPDATE` inmediato a `outbound_list_companies` (mismo patrón que `consolidador`).
- En importación Excel, si la columna se mapea, el valor de texto se asigna directamente.
- No se crea un enum en BD para mantener flexibilidad; se valida solo en frontend.

