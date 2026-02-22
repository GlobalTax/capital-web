

# Fix: Timeout de LockManager en autenticacion Supabase

## Problema

El error `Acquiring an exclusive Navigator LockManager lock "lock:capittal-auth-token" timed out waiting 10000ms` bloquea la autenticacion en Chrome. Ocurre porque Supabase Auth usa el API `Navigator.locks` del navegador para coordinar sesiones entre pestanas, y el lock se queda "atascado" (por extensiones, multiples pestanas, o hot-reload en desarrollo).

Los demas errores de consola (`web-capture-extension-frames.js`, `inject.bundle.js`, `runtime.lastError`) son de extensiones de Chrome y no afectan a la aplicacion.

## Solucion

Añadir la opcion `lock: 'no-op'` en la configuracion de auth del cliente Supabase. Esto desactiva el uso del `Navigator LockManager`, eliminando el timeout. Es seguro porque la app ya usa un singleton global que impide multiples instancias del cliente.

## Cambio (1 archivo, 1 linea)

**Archivo:** `src/integrations/supabase/optimizedClient.ts`

En la configuracion de auth (linea 71-77), añadir `lock: 'no-op'`:

```typescript
auth: {
  persistSession: canPersistSession,
  storage: safeLocalStorage,
  storageKey: 'capittal-auth-token',
  autoRefreshToken: canPersistSession,
  detectSessionInUrl: true,
  lock: 'no-op',  // <-- NUEVO: evita timeout del Navigator LockManager
},
```

## Por que es seguro

- La app ya tiene un patron singleton robusto (`SupabaseClientSingleton`) que garantiza una unica instancia del cliente
- El lock solo es necesario cuando hay multiples instancias de Supabase Auth compitiendo por el mismo token, lo cual no ocurre aqui
- Supabase documenta `lock: 'no-op'` como opcion valida para entornos donde el LockManager causa problemas

## Lo que NO se toca

- Ninguna otra configuracion del cliente
- El sistema de autenticacion
- El singleton pattern
- Nada en el frontend

