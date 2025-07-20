
# Configuración de Supabase en Capittal

## Información General

Este proyecto utiliza Supabase como backend principal para:
- Base de datos PostgreSQL
- Autenticación de usuarios
- Almacenamiento de archivos
- Funciones edge
- Políticas de seguridad RLS (Row Level Security)

## Configuración de Credenciales

### Ubicación de la Configuración

Las credenciales de Supabase están centralizadas en:
```
src/config/supabase.ts
```

### Tipos de Claves

**SUPABASE_ANON_KEY (Clave Anónima)**
- ✅ **Segura para exposición pública**
- ✅ Se puede incluir en el código frontend
- ✅ Solo permite operaciones autorizadas por RLS
- ❌ NO proporciona acceso administrativo

**SUPABASE_SERVICE_ROLE_KEY (Clave de Servicio)**
- ❌ **NUNCA debe exponerse públicamente**
- ✅ Solo para funciones del servidor/edge functions
- ✅ Bypass completo de políticas RLS
- ⚠️ Acceso total a la base de datos

### Información del Proyecto

- **Project ID**: fwhqtzkkvnjkazhaficj
- **URL**: https://fwhqtzkkvnjkazhaficj.supabase.co
- **Región**: eu-west-1
- **Entorno**: Producción

## Cómo Cambiar las Credenciales

Si necesitas cambiar las credenciales (por ejemplo, para un nuevo proyecto):

1. **Edita el archivo de configuración**:
   ```typescript
   // src/config/supabase.ts
   export const SUPABASE_CONFIG = {
     url: "https://tu-nuevo-proyecto.supabase.co",
     anonKey: "tu-nueva-clave-anon"
   } as const;
   ```

2. **Actualiza la información del proyecto**:
   ```typescript
   export const PROJECT_INFO = {
     projectId: "tu-nuevo-project-id",
     region: "tu-region",
     environment: "desarrollo" // o "producción"
   } as const;
   ```

## Seguridad y Mejores Prácticas

### ✅ Buenas Prácticas

- Las claves anónimas están correctamente expuestas
- Se utiliza validación de configuración
- Las políticas RLS protegen los datos
- La configuración está centralizada

### ⚠️ Consideraciones de Seguridad

- Las claves de servicio están en Supabase Secrets (no en el código)
- Todas las tablas tienen políticas RLS habilitadas
- Los permisos están configurados por roles específicos
- Se registra auditoría para acciones administrativas

### 🔧 Validación Automática

El sistema valida automáticamente:
- Formato correcto de la URL de Supabase
- Formato válido de la clave anónima
- Conectividad con el proyecto

## Entornos y Despliegue

### Lovable (Desarrollo)
- Configuración actual en `src/config/supabase.ts`
- Uso directo de credenciales públicas

### Producción (Futuro)
Si migras a otro entorno, considera:
- Variables de entorno reales
- Configuración por entorno
- Rotación de claves periódica

## Soporte y Resolución de Problemas

### Errores Comunes

**Error: "SUPABASE_URL no está configurada"**
```bash
Solución: Verificar que la URL en SUPABASE_CONFIG sea válida
```

**Error: "SUPABASE_ANON_KEY no está configurada"**
```bash
Solución: Verificar que la clave anón comience con 'eyJ'
```

**Error de conexión**
```bash
Solución: Verificar que el proyecto de Supabase esté activo
```

### Enlaces Útiles

- [Dashboard de Supabase](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj)
- [Configuración de API](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/settings/api)
- [Políticas RLS](https://supabase.com/dashboard/project/fwhqtzkkvnjkazhaficj/auth/policies)
- [Documentación de Supabase](https://supabase.com/docs)

## Contacto

Para cambios en la configuración de Supabase, contacta con el equipo de desarrollo.
