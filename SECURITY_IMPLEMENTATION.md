# 🔒 Implementación de Seguridad Completa - Capittal

## ✅ Estado: IMPLEMENTADO

Todas las fases del plan de seguridad han sido implementadas exitosamente.

---

## 📋 Resumen de Cambios

### **FASE 1: Tokens de Valoración de Un Solo Uso** 🎯 CRÍTICO

**Implementado:**
- ✅ Función `verify_valuation_token()`: Valida y marca tokens como usados
- ✅ Política RLS `CRITICAL_SECURE_token_access`: Rate limit 3/hora
- ✅ Índices de seguridad para optimización

**Impacto:**
- ⚠️ **BREAKING CHANGE**: Los tokens de valoración ahora son de **un solo uso**
- Los enlaces compartidos en emails solo funcionarán **una vez**
- Rate limit reducido de 300/hora a **3/hora por IP**

### **FASE 2: Protección de Contact Leads** 📧

**Implementado:**
- ✅ Política RLS `SECURE_contact_leads_insert`: Rate limit 2/día
- ✅ Hook `useContactLeadSubmission`: Honeypot + validación local
- ✅ Anti-spam: Rechaza emails/nombres con "test", "fake", "spam"

**Impacto:**
- Máximo **2 leads por día por IP**
- Honeypot invisible detecta bots automáticamente
- Mensajes amigables al alcanzar límite

### **FASE 3: Monitoreo y Alertas** 📊

**Implementado:**
- ✅ Vista `admin_security_alerts`: Monitoreo de tokens y spam
- ✅ Hook `useValuationLoader` mejorado: Mensajes específicos de error
- ✅ Advertencia cuando token ya fue usado

**Impacto:**
- Admins pueden detectar patrones sospechosos
- Usuarios reciben mensajes claros al encontrar errores
- Tracking de tokens usados vs expirados

### **FASE 4: Limpieza Automática** 🧹

**Implementado:**
- ✅ Edge Function `cleanup-expired-tokens`
- ✅ Elimina valoraciones incompletas > 7 días
- ✅ Anonimiza valoraciones completadas > 90 días (GDPR)

**⚠️ REQUIERE CONFIGURACIÓN MANUAL** (ver abajo)

---

## 🚀 Configuración del Cron Job (OBLIGATORIO)

Para activar la limpieza automática diaria, debes configurar el cron job en Supabase:

### Opción 1: SQL Editor (Recomendado)

1. **Ir a Supabase Dashboard**
   - [SQL Editor](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/sql/new)

2. **Ejecutar este SQL:**

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Crear cron job para limpieza diaria (2 AM)
SELECT cron.schedule(
  'cleanup-expired-tokens-daily',
  '0 2 * * *', -- Todos los días a las 2 AM (UTC)
  $$
  SELECT
    net.http_post(
      url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/cleanup-expired-tokens',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verificar que el cron job fue creado
SELECT * FROM cron.job;
```

3. **Verificar ejecución:**

```sql
-- Ver logs de ejecuciones
SELECT * FROM cron.job_run_details 
WHERE jobname = 'cleanup-expired-tokens-daily'
ORDER BY start_time DESC 
LIMIT 10;
```

### Opción 2: Prueba Manual

Antes de activar el cron, puedes probar la función manualmente:

1. **Ir a Edge Functions**
   - [Functions Dashboard](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions/cleanup-expired-tokens)

2. **Invocar manualmente:**

```bash
curl -X POST \
  'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/cleanup-expired-tokens' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I' \
  -H 'Content-Type: application/json'
```

3. **Respuesta esperada:**

```json
{
  "success": true,
  "deleted": 0,
  "anonymized": 0
}
```

---

## 📊 Métricas de Seguridad

### Vista `admin_security_alerts`

Los admins pueden consultar alertas de seguridad:

```sql
-- Ver todas las alertas
SELECT * FROM admin_security_alerts
ORDER BY created_at DESC;

-- Ver solo intentos de tokens
SELECT * FROM admin_security_alerts
WHERE alert_type = 'valuation_token_abuse';

-- Ver solo spam de leads
SELECT * FROM admin_security_alerts
WHERE alert_type = 'contact_lead_spam';
```

---

## 🧪 Testing Recomendado

### Test 1: Token de Un Solo Uso

1. Crear nueva valoración en la app
2. Completar y recibir email con link
3. **Primera vez**: Abrir link → ✅ Debe funcionar
4. **Segunda vez**: Abrir mismo link → ❌ Debe fallar con mensaje claro

### Test 2: Rate Limiting de Tokens

1. Abrir 3 links diferentes de valoración en 1 hora → ✅ Debe funcionar
2. Abrir un 4to link en la misma hora → ❌ Debe fallar con "Demasiados intentos"
3. Esperar 1 hora → ✅ Debe permitir nuevos accesos

### Test 3: Honeypot en Contact Leads

1. Abrir formulario de contacto en navegador
2. Inspeccionar HTML → Buscar campo `website` (debe ser invisible)
3. Llenar formulario normal → ✅ Debe enviar correctamente
4. Llenar campo `website` (simulando bot) → ✅ Simula éxito pero no guarda

### Test 4: Rate Limiting de Leads

1. Enviar 2 leads desde la misma IP → ✅ Debe funcionar
2. Intentar enviar 3er lead el mismo día → ❌ Debe fallar con mensaje claro
3. Al día siguiente → ✅ Debe permitir nuevos envíos

### Test 5: Limpieza Automática

1. Ejecutar edge function manualmente (ver Opción 2 arriba)
2. Revisar logs en [Edge Functions](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions/cleanup-expired-tokens/logs)
3. Verificar que valoraciones antiguas se marquen como eliminadas/anonimizadas

---

## ⚠️ Consideraciones Importantes

### Breaking Changes

- **Los tokens existentes en emails ya enviados dejarán de funcionar después del primer uso**
- **Usuarios que compartan su link solo podrán abrirlo una vez**

### Mitigación

- Los usuarios pueden solicitar una nueva valoración (máximo 2 por día)
- Los admins pueden regenerar tokens manualmente si es necesario
- Los mensajes explican claramente qué pasó cuando un token ya fue usado

### Compatibilidad

- ✅ No afecta valoraciones de usuarios autenticados
- ✅ No afecta panel de administración
- ✅ No requiere cambios en Edge Functions existentes
- ✅ Backward compatible con campos existentes en BD

---

## 📈 Resultado Esperado

### Antes (VULNERABLE):

- ❌ Tokens reutilizables infinitamente durante 2 horas
- ❌ Rate limit débil: 300 req/hora = posible scraping
- ❌ Contact leads sin rate limit = spam ilimitado
- ❌ Sin monitoreo de ataques
- ❌ Datos antiguos acumulándose sin límite

### Después (SEGURO):

- ✅ Tokens de un solo uso: link válido solo la primera vez
- ✅ Rate limit agresivo: 3 req/hora = máximo 72 valoraciones/día por IP
- ✅ Contact leads: máximo 2 envíos/día por IP + honeypot anti-bots
- ✅ Vista de monitoreo para detectar patrones sospechosos
- ✅ Limpieza automática diaria de datos antiguos
- ✅ Mensajes claros al usuario cuando algo falla

---

## 🔗 Enlaces Útiles

- [SQL Editor](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/sql/new)
- [Edge Functions](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions)
- [Edge Function Logs](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/functions/cleanup-expired-tokens/logs)
- [Supabase Cron Documentation](https://supabase.com/docs/guides/functions/schedule-functions)

---

## 📞 Soporte

Si tienes problemas con la implementación:

1. Revisar logs de Edge Functions
2. Ejecutar queries de test en SQL Editor
3. Verificar que el cron job está configurado correctamente
4. Consultar vista `admin_security_alerts` para patrones sospechosos

---

**Implementado el**: 2025-01-28
**Estado**: ✅ COMPLETO (falta activar cron job manualmente)
