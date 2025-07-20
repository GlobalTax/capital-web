
# Ejemplo de Configuración para Supabase

Este archivo muestra cómo configurar las credenciales de Supabase en este proyecto.

## Configuración Actual

```typescript
// src/config/supabase.ts
export const SUPABASE_CONFIG = {
  url: "https://tu-proyecto.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
} as const;

export const PROJECT_INFO = {
  projectId: "tu-project-id",
  region: "eu-west-1", // o tu región
  environment: "production" // o "development"
} as const;
```

## Pasos para Configurar un Nuevo Proyecto

1. **Crear proyecto en Supabase**
   - Ve a https://supabase.com/dashboard
   - Crea un nuevo proyecto
   - Anota el Project ID y la URL

2. **Obtener las credenciales**
   - Ve a Settings > API
   - Copia la URL del proyecto
   - Copia la clave anónima (anon/public key)

3. **Actualizar la configuración**
   - Edita `src/config/supabase.ts`
   - Reemplaza los valores con los de tu proyecto
   - Actualiza `PROJECT_INFO` con la información correcta

4. **Verificar la conexión**
   ```typescript
   import { checkSupabaseHealth } from '@/utils/supabaseHealthCheck';
   
   const health = await checkSupabaseHealth();
   console.log('Supabase health:', health);
   ```

## Notas Importantes

- ✅ La clave anónima (anon key) es segura para exposición pública
- ❌ NUNCA expongas la clave de servicio (service_role key)
- 🔧 Las políticas RLS protegen tus datos automáticamente
- 📊 Usa las utilidades de health check para debugging

## Variables Alternativas (Si usas otros entornos)

Si migras a un entorno que soporta variables de entorno tradicionales:

```bash
# .env (no usado en Lovable)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Entonces podrías usar:
```typescript
const url = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;
```
