
# Plan: Componente Admin para Sincronización de Dealsuite

## Resumen

Crear un componente `DealsuiteSyncPanel` en el panel de administración que permita:
1. Pegar la cookie de sesión de Dealsuite
2. Probar la conexión (dry run)
3. Sincronizar deals con la base de datos
4. Ver el historial de sincronizaciones y deals extraídos

---

## Arquitectura

```text
┌────────────────────────────────────────────────────────────────┐
│                   DealsuiteSyncPanel                           │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Cookie Input (textarea)                                │   │
│  │  [Pegar cookie de sesión aquí...]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ Probar      │  │ Sincronizar     │  │ Ver Deals        │   │
│  │ Conexión    │  │ Deals           │  │ Guardados        │   │
│  └─────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Resultado / Preview del contenido                      │   │
│  │  - Status de autenticación                              │   │
│  │  - Número de deals encontrados                          │   │
│  │  - Warnings y errores                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tabla de Deals Sincronizados (últimos 20)              │   │
│  │  | Título | Sector | País | EBITDA | Fecha |            │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear/Modificar

### 1. Nuevo Componente: `src/components/admin/DealsuiteSyncPanel.tsx`

Componente principal con:
- **Textarea** para pegar la cookie de sesión
- **Botón "Probar Conexión"**: Llama a `firecrawlApi.scrapeDealsuite(cookie, { dryRun: true })`
- **Botón "Sincronizar Deals"**: Llama a `firecrawlApi.scrapeDealsuite(cookie)`
- **Estado de resultado**: Muestra preview, errores, o estadísticas
- **Tabla de deals**: Muestra los últimos deals sincronizados desde `dealsuite_deals`

Funcionalidades:
- Indicadores de estado (loading, success, error)
- Preview del contenido HTML/markdown devuelto
- Estadísticas de sincronización (insertados, actualizados)
- Instrucciones claras de cómo obtener la cookie

### 2. Nueva Página: `src/pages/admin/DealsuitePage.tsx`

Página wrapper que renderiza `DealsuiteSyncPanel` con el layout correcto.

### 3. Lazy Import: `src/features/admin/components/LazyAdminComponents.tsx`

Añadir:
```typescript
export const LazyDealsuitePage = React.lazy(() => 
  import('@/pages/admin/DealsuitePage')
);
```

### 4. Ruta Admin: `src/features/admin/components/AdminRouter.tsx`

Añadir ruta:
```typescript
<Route path="/dealsuite" element={<LazyDealsuitePage />} />
```

### 5. Hook de datos: `src/hooks/useDealsuitDeals.ts`

Hook para obtener los deals guardados:
```typescript
export const useDealsuitDeals = () => {
  return useQuery({
    queryKey: ['dealsuite-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealsuite_deals')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });
};
```

---

## Diseño del Componente

### Estados de UI

| Estado | Indicador Visual |
|--------|------------------|
| Sin cookie | Textarea vacío, botones deshabilitados |
| Probando conexión | Spinner + "Verificando autenticación..." |
| Conexión exitosa | Badge verde + preview del contenido |
| Cookie inválida | Badge rojo + mensaje de error |
| Sincronizando | Progress bar + "Extrayendo deals..." |
| Sync completo | Stats de insertados/actualizados |

### Instrucciones para el Usuario

El componente incluirá un bloque colapsable con instrucciones:

1. Abre Dealsuite en tu navegador y asegúrate de estar logueado
2. Abre DevTools (F12 o Cmd+Option+I)
3. Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
4. En la sección "Cookies", selecciona "https://app.dealsuite.com"
5. Copia todos los valores de las cookies (o usa `document.cookie` en Console)
6. Pega el resultado en el campo de abajo

---

## Dependencias

Usa componentes existentes:
- `Card`, `CardHeader`, `CardContent` de `@/components/ui/card`
- `Button` de `@/components/ui/button`
- `Textarea` de `@/components/ui/textarea`
- `Badge` de `@/components/ui/badge`
- `Table` de `@/components/ui/table`
- `Collapsible` de `@/components/ui/collapsible`
- `toast` de `@/hooks/use-toast`

API existente:
- `firecrawlApi.scrapeDealsuite()` de `@/lib/api/firecrawl`

---

## Sección Técnica

### Estructura del Componente Principal

```typescript
// DealsuiteSyncPanel.tsx
import { useState } from 'react';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useDealsuitDeals } from '@/hooks/useDealsuitDeals';

interface SyncResult {
  success: boolean;
  dry_run?: boolean;
  preview?: string;
  extracted?: number;
  inserted?: number;
  updated?: number;
  error?: string;
}

export const DealsuiteSyncPanel = () => {
  const [cookie, setCookie] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const { data: deals, refetch } = useDealsuitDeals();

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult(null);
    const response = await firecrawlApi.scrapeDealsuite(cookie, { dryRun: true });
    setResult(response);
    setIsLoading(false);
  };

  const handleSync = async () => {
    setIsLoading(true);
    setResult(null);
    const response = await firecrawlApi.scrapeDealsuite(cookie);
    setResult(response);
    if (response.success) {
      refetch(); // Actualizar tabla de deals
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Cookie Input Section */}
      {/* Action Buttons */}
      {/* Result Display */}
      {/* Deals Table */}
    </div>
  );
};
```

### Manejo de Errores

| Error | Mensaje al Usuario |
|-------|-------------------|
| `session_expired` | "La cookie ha expirado. Por favor, obtén una nueva desde Dealsuite." |
| `captcha_detected` | "Dealsuite ha mostrado un captcha. Intenta de nuevo más tarde." |
| `rate_limited` | "Se ha excedido el límite de Firecrawl. Espera unos minutos." |
| `FIRECRAWL_API_KEY not configured` | "El conector de Firecrawl no está configurado." |

### Seguridad

- La cookie NO se guarda en ningún momento
- El campo de cookie tiene `type="password"` para ocultarlo
- Solo usuarios admin pueden acceder a esta página
- La cookie se envía cifrada vía HTTPS

---

## Entregables

1. `src/components/admin/DealsuiteSyncPanel.tsx` - Componente principal
2. `src/pages/admin/DealsuitePage.tsx` - Página wrapper
3. `src/hooks/useDealsuitDeals.ts` - Hook para datos
4. Actualización de `LazyAdminComponents.tsx` - Lazy import
5. Actualización de `AdminRouter.tsx` - Nueva ruta `/admin/dealsuite`

---

## Navegación

Se puede añadir un enlace en el sidebar del admin, en la sección de integraciones o deal sourcing, apuntando a `/admin/dealsuite`.
