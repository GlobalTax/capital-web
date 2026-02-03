
# Plan: Mejorar Diagnóstico de Cookie Dealsuite

## Problema Identificado

Los logs muestran que Firecrawl devuelve solo **413 caracteres**. Este contenido tan corto casi seguro es una página de login o error, no el marketplace con deals. La detección actual de `isLoginPage` está correctamente identificando esto como "cookie inválida".

## Posibles Causas

1. **Cookie incompleta**: El string que copiaste puede estar truncado
2. **Cookie expirada**: Las cookies de Dealsuite expiran ~24 horas
3. **Cookies faltantes críticas**: Necesitas tanto `user` como `dstoken`

## Solución Propuesta

### Cambios en la Edge Function

**Mejorar el logging y diagnóstico:**

1. **Log el contenido devuelto** cuando se detecta login page para entender qué está pasando
2. **Validar formato de cookie** antes de hacer el scrape (verificar que contiene `user=` y `dstoken=`)
3. **Mostrar preview del contenido** en el error para diagnóstico

```typescript
// Añadir validación de formato de cookie
function validateCookieFormat(cookie: string): { valid: boolean; missing: string[] } {
  const required = ['user=', 'dstoken='];
  const missing = required.filter(key => !cookie.includes(key));
  return { valid: missing.length === 0, missing };
}
```

### Cambios en la UI

**Añadir diagnóstico visual:**

1. **Mostrar qué cookies se detectaron** al pegar (user, dstoken, etc.)
2. **Mostrar preview del contenido** cuando falla para entender qué devolvió Dealsuite
3. **Instrucciones mejoradas** para obtener la cookie completa

### Pasos Inmediatos para el Usuario

Mientras implemento estas mejoras, puedes verificar:

1. **Asegúrate de copiar TODO el string** del `document.cookie` - a veces es muy largo
2. **Verifica que contiene `user=` y `dstoken=`** - son las cookies críticas
3. **Refresca la página de Dealsuite** antes de copiar la cookie

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `supabase/functions/dealsuite-scrape-wanted/index.ts` | Añadir validación de cookie, mejorar logging, incluir preview en error |
| `src/components/admin/DealsuiteSyncPanel.tsx` | Mostrar cookies detectadas, mejorar feedback de error |

## Sección Técnica

### Validación de Cookie

```typescript
// En la edge function
function validateCookieFormat(cookie: string): { valid: boolean; missing: string[] } {
  const requiredKeys = ['user=', 'dstoken='];
  const missing = requiredKeys.filter(key => !cookie.includes(key));
  return { 
    valid: missing.length === 0, 
    missing 
  };
}

// Uso antes del scrape
const cookieValidation = validateCookieFormat(session_cookie);
if (!cookieValidation.valid) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'invalid_cookie_format',
      message: `Cookie incompleta. Faltan: ${cookieValidation.missing.join(', ')}`,
      hint: 'Asegúrate de copiar TODO el contenido de document.cookie'
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Mejora en UI para Detectar Cookies

```typescript
// En DealsuiteSyncPanel.tsx
const detectCookies = (cookieString: string) => {
  const hasUser = cookieString.includes('user=');
  const hasDstoken = cookieString.includes('dstoken=');
  const hasXsrf = cookieString.includes('_xsrf=');
  
  return { hasUser, hasDstoken, hasXsrf };
};

// Mostrar indicadores visuales de qué cookies están presentes
```

### Logging Mejorado

```typescript
// En isLoginPage, añadir logging
if (hasLoginIndicator && !hasDealContent) {
  console.log('[DEALSUITE] Login page detected. Content preview:', content.substring(0, 500));
  return true;
}
```
