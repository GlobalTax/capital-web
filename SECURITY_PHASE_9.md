# 🔒 FASE 9: Protección CRÍTICA de RH y Contactos

## ✅ Estado: IMPLEMENTADO

**Fecha de implementación**: 2025-10-29  
**Tiempo total**: ~20 minutos  
**Migraciones ejecutadas**: 4 de 5 (1 bloqueada por limitación de PostgreSQL)

---

## 📋 Resumen Ejecutivo

### Problemas Críticos Resueltos

| Tabla | Vulnerabilidad Antes | Solución Implementada |
|-------|---------------------|----------------------|
| `rh_empleados` | 🔴 Acceso público sin restricciones | ✅ Sistema de roles RH requerido |
| `rh_nominas` | 🔴 Acceso público a datos financieros | ✅ Solo usuarios con rol RH + super admins |
| `contactos` | 🟠 Lectura por cualquier usuario autenticado | ✅ Solo administradores |
| `empresas` | 🟠 Lectura por cualquier usuario autenticado | ✅ Solo administradores |

### Resultado de Seguridad

**Antes de Fase 9:**
- ❌ 15 Critical Security Findings
- ❌ Datos RH públicos (CRÍTICO)
- ❌ Contactos/empresas sin restricciones

**Después de Fase 9:**
- ✅ Reducción esperada a 9-10 findings (verificar con scanner)
- ✅ Sistema de roles RH implementado
- ✅ Acceso a contactos/empresas restringido a admins

---

## 🎯 Implementación Realizada

### MIGRACIÓN 1: Sistema de Roles para RH ✅ COMPLETADA

**Componentes creados:**

1. **Enum de roles RH**:
```sql
CREATE TYPE public.rh_role AS ENUM ('rh_admin', 'rh_manager', 'rh_viewer');
```

2. **Tabla `rh_user_roles`**:
   - Campos: `id`, `user_id`, `role`, `granted_by`, `granted_at`, `notes`
   - Constraint: `UNIQUE(user_id, role)`
   - RLS habilitado
   - Políticas:
     - Super admins pueden gestionar roles
     - Usuarios pueden ver su propio rol

3. **Funciones de verificación**:
   - `has_rh_role(_user_id uuid, _role rh_role)` → boolean
   - `current_user_has_rh_access()` → boolean
   - `current_user_is_rh_admin()` → boolean

**Seguridad:**
- Todas las funciones son `SECURITY DEFINER` con `SET search_path = public`
- Previenen recursión RLS
- Solo super admins pueden asignar roles

---

### MIGRACIÓN 2: Políticas RLS Seguras para Tablas RH ✅ COMPLETADA

**Tabla: `rh_empleados`**

**Políticas eliminadas:**
```sql
DROP POLICY "Public read" ON public.rh_empleados; -- ❌ PELIGROSA
```

**Nuevas políticas implementadas:**
- ✅ `RH users can read empleados` → SELECT (requiere rol RH)
- ✅ `RH admins can insert empleados` → INSERT (requiere rh_admin)
- ✅ `RH admins can update empleados` → UPDATE (requiere rh_admin)
- ✅ `RH admins can delete empleados` → DELETE (requiere rh_admin)

**Tabla: `rh_nominas`**

**Políticas eliminadas:**
```sql
DROP POLICY "Public read" ON public.rh_nominas; -- ❌ PELIGROSA
```

**Nuevas políticas implementadas:**
- ✅ `RH users can read nominas` → SELECT (requiere rol RH)
- ✅ `RH admins can insert nominas` → INSERT (requiere rh_admin)
- ✅ `RH admins can update nominas` → UPDATE (requiere rh_admin)
- ✅ `RH admins can delete nominas` → DELETE (requiere rh_admin)

**Resultado:**
- ❌ **ANTES**: Cualquier persona sin autenticar podía leer empleados y nóminas
- ✅ **DESPUÉS**: Solo usuarios con rol RH + super admins tienen acceso

---

### MIGRACIÓN 3: Políticas Restrictivas para Contactos/Empresas ✅ COMPLETADA

**Tabla: `contactos`**

**Políticas eliminadas:**
```sql
DROP POLICY "Admins can manage contactos" ON public.contactos;
```

**Nuevas políticas implementadas:**
- ✅ `Only admins can read contactos` → SELECT
- ✅ `Only admins can insert contactos` → INSERT
- ✅ `Only admins can update contactos` → UPDATE
- ✅ `Only admins can delete contactos` → DELETE

**Tabla: `empresas`**

**Políticas eliminadas:**
```sql
DROP POLICY "Admins can manage empresas" ON public.empresas;
```

**Nuevas políticas implementadas:**
- ✅ `Only admins can read empresas` → SELECT
- ✅ `Only admins can insert empresas` → INSERT
- ✅ `Only admins can update empresas` → UPDATE
- ✅ `Only admins can delete empresas` → DELETE

**Resultado:**
- ❌ **ANTES**: Cualquier usuario autenticado podía leer todos los contactos y empresas
- ✅ **DESPUÉS**: Solo administradores tienen acceso completo

---

### MIGRACIÓN 4: Auditoría de Accesos ❌ NO IMPLEMENTADA

**Razón:** PostgreSQL no permite triggers `AFTER SELECT`. Las operaciones de lectura no pueden ser auditadas mediante triggers.

**Alternativas para auditoría de lectura:**
1. **pgAudit extension** (requiere acceso al servidor)
2. **Funciones wrapper** que registren el acceso antes de devolver datos
3. **Logging en la aplicación** (frontend/edge functions)

**Decisión:** Implementar logging de accesos en la capa de aplicación si es necesario en el futuro.

---

### MIGRACIÓN 5: Funciones de Gestión de Roles RH ✅ COMPLETADA

**Función: `grant_rh_role()`**

```sql
public.grant_rh_role(
  target_user_id uuid,
  target_role rh_role,
  notes_text text DEFAULT NULL
) RETURNS jsonb
```

**Comportamiento:**
- ✅ Verifica que quien ejecuta sea super admin
- ✅ Verifica que el usuario objetivo existe
- ✅ Inserta o actualiza el rol (ON CONFLICT)
- ✅ Registra evento de seguridad en `security_events`
- ✅ Retorna JSON con `success` y `message`/`error`

**Función: `revoke_rh_role()`**

```sql
public.revoke_rh_role(
  target_user_id uuid,
  target_role rh_role
) RETURNS jsonb
```

**Comportamiento:**
- ✅ Verifica que quien ejecuta sea super admin
- ✅ Elimina el rol del usuario
- ✅ Registra evento de seguridad en `security_events`
- ✅ Retorna JSON con `success` y `message`/`error`

---

## 🚨 Breaking Changes y Acciones Requeridas

### ⚠️ ACCIÓN OBLIGATORIA POST-IMPLEMENTACIÓN

Los usuarios sin roles RH asignados **han perdido acceso** a las tablas RH. Debes asignar el rol RH al super admin inicial:

```sql
-- Ejecutar en SQL Editor de Supabase
SELECT grant_rh_role(
  (SELECT user_id FROM admin_users WHERE role = 'super_admin' LIMIT 1),
  'rh_admin',
  'Initial RH admin - migración Fase 9'
);
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "RH role granted successfully"
}
```

### Verificar el resultado:

```sql
-- Ver roles RH asignados
SELECT 
  rur.user_id,
  au.email,
  rur.role,
  rur.granted_at,
  rur.notes
FROM public.rh_user_roles rur
JOIN public.admin_users au ON au.user_id = rur.user_id
ORDER BY rur.granted_at DESC;
```

---

## 🧪 Testing y Verificación

### Test 1: Verificar Aislamiento RH

**Como usuario sin rol RH:**

```sql
-- Debe fallar con error RLS
SELECT * FROM rh_empleados;
-- ERROR: new row violates row-level security policy

SELECT * FROM rh_nominas;
-- ERROR: new row violates row-level security policy
```

### Test 2: Verificar Acceso con Rol RH Viewer

```sql
-- Asignar rol RH viewer
SELECT grant_rh_role(
  'USER_ID_AQUI',
  'rh_viewer',
  'Testing RH viewer access'
);

-- Ahora debe funcionar
SELECT * FROM rh_empleados; -- ✅ Funciona
SELECT * FROM rh_nominas;   -- ✅ Funciona

-- Pero no puede modificar
INSERT INTO rh_empleados (...) VALUES (...); -- ❌ Falla (requiere rh_admin)
```

### Test 3: Verificar Contactos Restringidos

**Como usuario autenticado no-admin:**

```sql
-- Debe fallar con error RLS
SELECT * FROM contactos;
-- ERROR: new row violates row-level security policy

SELECT * FROM empresas;
-- ERROR: new row violates row-level security policy
```

### Test 4: Verificar Logs de Seguridad

```sql
-- Ver eventos de asignación de roles (como super admin)
SELECT 
  event_type,
  severity,
  user_id,
  details,
  created_at
FROM public.security_events 
WHERE event_type IN ('RH_ROLE_GRANTED', 'RH_ROLE_REVOKED')
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📊 Roles RH Disponibles

### Matriz de Permisos

| Operación | `rh_viewer` | `rh_manager` | `rh_admin` | `super_admin` |
|-----------|-------------|--------------|------------|---------------|
| **Lectura RH** | ✅ | ✅ | ✅ | ✅ |
| **Insertar empleados** | ❌ | ❌ | ✅ | ✅ |
| **Actualizar empleados** | ❌ | ❌ | ✅ | ✅ |
| **Eliminar empleados** | ❌ | ❌ | ✅ | ✅ |
| **Gestionar roles RH** | ❌ | ❌ | ❌ | ✅ |

### Descripción de Roles

- **`rh_viewer`**: Solo lectura de datos RH
- **`rh_manager`**: Lectura (reservado para futura lógica de permisos)
- **`rh_admin`**: Gestión completa de datos RH (CRUD)
- **`super_admin`**: Control total, puede asignar/revocar roles RH

---

## 🔧 Gestión de Roles desde SQL

### Asignar Rol RH

```sql
SELECT grant_rh_role(
  'UUID_DEL_USUARIO',
  'rh_admin', -- o 'rh_manager', 'rh_viewer'
  'Motivo de asignación'
);
```

### Revocar Rol RH

```sql
SELECT revoke_rh_role(
  'UUID_DEL_USUARIO',
  'rh_admin'
);
```

### Ver Todos los Roles RH Asignados

```sql
SELECT 
  rur.user_id,
  au.email,
  au.full_name,
  rur.role,
  rur.granted_at,
  rur.notes,
  gb.email AS granted_by_email
FROM public.rh_user_roles rur
JOIN public.admin_users au ON au.user_id = rur.user_id
LEFT JOIN public.admin_users gb ON gb.user_id = rur.granted_by
ORDER BY rur.granted_at DESC;
```

### Ver Usuarios Sin Rol RH

```sql
SELECT 
  au.user_id,
  au.email,
  au.full_name,
  au.role AS admin_role
FROM public.admin_users au
WHERE au.user_id NOT IN (
  SELECT user_id FROM public.rh_user_roles
)
AND au.role != 'super_admin'
ORDER BY au.email;
```

---

## 🛠️ Integración con Frontend

### Hook Recomendado: `useRHPermissions`

```typescript
// src/hooks/useRHPermissions.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRHPermissions = () => {
  const { data: hasRHAccess, isLoading } = useQuery({
    queryKey: ['rh-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('current_user_has_rh_access');
      if (error) throw error;
      return data as boolean;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: isRHAdmin } = useQuery({
    queryKey: ['rh-admin-status'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('current_user_is_rh_admin');
      if (error) throw error;
      return data as boolean;
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasRHAccess === true,
  });

  return {
    hasRHAccess: hasRHAccess ?? false,
    isRHAdmin: isRHAdmin ?? false,
    isLoading,
  };
};
```

### Uso en Componentes

```typescript
const RHDashboard = () => {
  const { hasRHAccess, isRHAdmin, isLoading } = useRHPermissions();

  if (isLoading) return <Spinner />;
  
  if (!hasRHAccess) {
    return <AccessDenied message="Requieres rol RH para acceder" />;
  }

  return (
    <div>
      <h1>Panel RH</h1>
      {isRHAdmin && <AdminControls />}
      <EmployeeList />
    </div>
  );
};
```

---

## 📈 Métricas de Seguridad

### Queries de Monitoreo

**Ver actividad de roles RH:**

```sql
SELECT 
  event_type,
  severity,
  details->>'target_user_id' AS target_user,
  details->>'role' AS role_changed,
  user_id AS performed_by,
  created_at
FROM public.security_events
WHERE event_type IN ('RH_ROLE_GRANTED', 'RH_ROLE_REVOKED')
ORDER BY created_at DESC
LIMIT 50;
```

**Conteo de roles RH activos:**

```sql
SELECT 
  role,
  COUNT(*) AS user_count
FROM public.rh_user_roles
GROUP BY role
ORDER BY user_count DESC;
```

---

## ⚠️ Limitaciones Conocidas

### Auditoría de Lectura No Disponible

**Problema:** La Migración 4 (triggers de auditoría para SELECT) no pudo implementarse debido a limitaciones de PostgreSQL.

**Impacto:** No se registran automáticamente los accesos de lectura a tablas RH, contactos y empresas.

**Mitigación:**
1. Implementar logging en la capa de aplicación (hooks de React Query)
2. Configurar pgAudit si tienes acceso al servidor PostgreSQL
3. Crear funciones wrapper que registren el acceso antes de devolver datos

**Ejemplo de logging en aplicación:**

```typescript
const { data: employees } = useQuery({
  queryKey: ['employees'],
  queryFn: async () => {
    // Log de acceso
    await supabase.rpc('log_security_event', {
      _event_type: 'RH_EMPLEADOS_ACCESS',
      _severity: 'medium',
      _details: { timestamp: new Date().toISOString() }
    });
    
    // Luego obtener datos
    const { data, error } = await supabase
      .from('rh_empleados')
      .select('*');
    if (error) throw error;
    return data;
  }
});
```

---

## 🔗 Recursos y Referencias

### Supabase Dashboard

- [SQL Editor](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/sql/new)
- [Table Editor](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/editor)
- [Security Events Table](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/editor/security_events)

### Documentación Relacionada

- [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) - Fases 1-4
- [SECURITY_PHASE_8.md](./SECURITY_PHASE_8.md) - Limpieza del linter
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Próximos Pasos (Fase 10 - Opcional)

### Mejoras de Seguridad Adicionales

1. **Cifrado de Columnas Sensibles**
   - PII en `contactos` y `empresas`
   - Datos financieros en `rh_nominas`

2. **Máscaras de Datos por Roles**
   - `rh_viewer` ve salarios ofuscados
   - `rh_manager` ve datos parciales
   - `rh_admin` ve datos completos

3. **Rate Limiting por Usuario**
   - Limitar consultas masivas a tablas sensibles
   - Alertas de comportamiento anómalo

4. **Implementar pgAudit**
   - Auditoría completa de operaciones SELECT
   - Cumplimiento de compliance (GDPR, SOC2)

---

## 📞 Soporte

Si tienes problemas con la implementación:

1. Verificar que el super admin tiene rol `rh_admin` asignado
2. Revisar logs de seguridad en `security_events`
3. Ejecutar queries de test arriba para diagnosticar
4. Consultar [Supabase Dashboard](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj)

---

**Implementado el**: 2025-10-29  
**Estado**: ✅ COMPLETO (4 de 5 migraciones - 1 bloqueada por PostgreSQL)  
**Próxima acción**: Asignar rol RH al super admin inicial
