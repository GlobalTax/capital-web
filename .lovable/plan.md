

## Auto-clasificación de leads: Target Lead / Unqualified Lead

### El problema del error anterior
La tabla `company_valuations` tiene triggers de validación que comprueban el formato del email en CADA update. Algunos registros antiguos tienen emails inválidos (ej: `'yani'`), lo que bloquea cualquier UPDATE aunque solo cambies el estado CRM.

### Solución (2 pasos)

**Paso 1 - Migración SQL (esquema): Crear trigger para leads futuros**

Crear la función `auto_classify_lead_by_revenue()` y el trigger `BEFORE INSERT` para que todo lead nuevo se auto-clasifique:
- Revenue >= 1M → `contactando` (Target Lead)
- Revenue < 1M → `calificado` (Unqualified Lead)  
- Revenue NULL → se queda en `nuevo`

**Paso 2 - Actualización de datos: Reclasificar los 55 leads existentes**

Usar un UPDATE con condición `WHERE email ~* '^[A-Za-z0-9._%+-]+@...'` para evitar tocar registros con emails inválidos, O usar una sentencia SQL que desactive temporalmente los triggers de validación solo durante la operación.

La forma más limpia: ejecutar el UPDATE directamente vía la herramienta de inserción/actualización de datos (no migración), usando `SET lead_status_crm = CASE WHEN revenue >= 1000000 THEN 'contactando' ELSE 'calificado' END` solo sobre registros con `lead_status_crm = 'nuevo'` y `revenue IS NOT NULL`.

Para los registros con emails rotos, usaremos una sesión con `session_replication_role = 'replica'` que bypasea triggers.

### Archivos afectados
- 1 migración SQL nueva (solo CREATE FUNCTION + CREATE TRIGGER)
- 1 operación de datos (UPDATE existentes)

### Resultado
- Columna "Nuevo" pasará de 55 a ~9 leads (solo los sin facturación)
- Todos los leads futuros se auto-clasifican al entrar

