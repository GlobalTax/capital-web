
# Plan: Distinguir Leads de Web vs Google Ads

## Resumen Ejecutivo

Implementación de un sistema mínimo y reversible para identificar leads que provienen de la web propia, sin modificar la URL usada por Google Ads (`/lp/calculadora`).

---

## Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO ACTUAL                              │
├─────────────────────────────────────────────────────────────────┤
│  Web interna ───► /lp/calculadora ◄─── Google Ads               │
│                          │                                       │
│                    [Sin distinción]                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO PROPUESTO                              │
├─────────────────────────────────────────────────────────────────┤
│  Web interna ───► /lp/calculadora-web                           │
│                          │                                       │
│                    [302 redirect]                                │
│                          ▼                                       │
│              /lp/calculadora?source=web                          │
│                          │                                       │
│              [Captura source en frontend]                        │
│                          │                                       │
│              [Guarda lead_source="web" en DB]                    │
│                          │                                       │
│              [Email interno: "Origen: Web"]                      │
│                                                                  │
│  Google Ads ───► /lp/calculadora (sin cambios)                  │
│                          │                                       │
│              [lead_source = NULL]                                │
│              [Email sin etiqueta de origen]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cambios a Implementar

### 1. Nueva Ruta Alias `/lp/calculadora-web` (REDIRECCIÓN)

**Archivo:** `src/core/routing/AppRoutes.tsx`

Añadir componente de redirección que:
- Capture cualquier query param existente
- Añada `source=web` sin duplicar si ya existe
- Use Navigate con redirect 302 (replace)

```typescript
// Nuevo componente de redirección
const CalculadoraWebRedirect = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Solo añadir source=web si no existe
  if (!searchParams.has('source')) {
    searchParams.set('source', 'web');
  }
  
  const newSearch = searchParams.toString();
  const targetUrl = `/lp/calculadora${newSearch ? `?${newSearch}` : ''}`;
  
  return <Navigate to={targetUrl} replace />;
};

// Nueva ruta
<Route path="/lp/calculadora-web" element={<CalculadoraWebRedirect />} />
<Route path="/lp/calculadora-web/*" element={<CalculadoraWebRedirect />} />
```

---

### 2. Captura de `source=web` en LandingCalculator

**Archivo:** `src/pages/LandingCalculator.tsx`

Modificar el componente para:
- Leer el query param `source`
- Si `source=web`, pasarlo como `extraMetadata` al UnifiedCalculator
- Persistir en sessionStorage para mantenerlo durante el flujo

```typescript
const LandingCalculatorInner = () => {
  const location = useLocation();
  // ... existing code
  
  // Capturar source=web del query string
  const searchParams = new URLSearchParams(location.search);
  const sourceParam = searchParams.get('source');
  
  // Crear extraMetadata si viene de web
  const extraMetadata = sourceParam === 'web' 
    ? { leadSource: 'web' } 
    : undefined;
  
  // Persistir en sessionStorage para mantener durante el flujo
  useEffect(() => {
    if (sourceParam === 'web') {
      sessionStorage.setItem('valuation_source', 'web');
    }
  }, [sourceParam]);
  
  // Recuperar de sessionStorage si no está en URL (navegación interna)
  const persistedSource = sessionStorage.getItem('valuation_source');
  const finalExtraMetadata = extraMetadata || 
    (persistedSource === 'web' ? { leadSource: 'web' } : undefined);
  
  return (
    <>
      {/* ... */}
      <UnifiedCalculator 
        config={V2_CONFIG} 
        extraMetadata={finalExtraMetadata}
      />
    </>
  );
};
```

---

### 3. Email Interno con "Origen: Web"

**Archivo:** `supabase/functions/send-valuation-email/index.ts`

Añadir lógica para mostrar etiqueta de origen en el email interno:

```typescript
// Después del bloque manualEntryBlock (línea ~430)
const webOriginBlock = payload.leadSource === 'web' ? `
  <p style="margin:16px 0 0; padding:8px 12px; background:#e0f2fe; border-left:3px solid #0284c7; font-size:13px; color:#0c4a6e;">
    <strong>Origen:</strong> Web
  </p>
` : '';

// Insertar en htmlInternal, después del footer
const htmlInternal = `
  <div style="...">
    ${manualEntryBlock}
    <!-- ... resto del contenido ... -->
    
    <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">
      Este correo se generó automáticamente...
    </p>
    ${webOriginBlock}
  </div>
`;
```

---

### 4. Actualizar Enlaces Internos de la Web

Los siguientes archivos contienen enlaces a `/lp/calculadora` que deben actualizarse a `/lp/calculadora-web`:

| Archivo | Línea | Uso |
|---------|-------|-----|
| `src/components/Hero.tsx` | 70 | CTA principal del hero |
| `src/components/ui/footer-section.tsx` | 172 | Link del footer |
| `src/hooks/useTopBarConfig.ts` | 42 | Menú de navegación top |
| `src/components/valoraciones/ValoracionesCTA.tsx` | 46 | CTA de valoraciones |
| `src/components/valoraciones/ValoracionesCTANew.tsx` | 53 | CTA nuevo |
| `src/components/valoraciones/ValoracionesHero.tsx` | 75 | Hero de valoraciones |
| `src/components/valoraciones/ValoracionesBenefits.tsx` | 90 | Beneficios |
| `src/components/header/AdvancedDesktopNavigation.tsx` | 105 | Navegación desktop |
| `src/components/blog/BlogValuationCTA.tsx` | 36 | CTA en blog |
| `src/components/search-funds/SearchFundsFitCalculator.tsx` | 250 | Calculator fit |
| `src/components/search-funds/SearchFundsResources.tsx` | 38 | Recursos |
| `src/components/search-funds-hub/SearchFundsHubHero.tsx` | 89 | Hub hero |
| `src/components/exit-readiness/ExitReadinessResults.tsx` | 84 | Exit readiness |

**Cambio:** `to="/lp/calculadora"` → `to="/lp/calculadora-web"`

---

## Base de Datos

**Campo existente:** `lead_source` (TEXT, nullable) en `company_valuations`

- No requiere migración
- Campo ya está en whitelist de `update-valuation` Edge Function
- Valores: `"web"` para leads de web, `NULL` para otros orígenes

---

## Flujo de Datos Completo

1. **Usuario entra por web interna** → `/lp/calculadora-web`
2. **Redirección automática** → `/lp/calculadora?source=web`
3. **LandingCalculator** → Lee `source=web`, crea `extraMetadata`
4. **UnifiedCalculator** → Pasa `extraMetadata` a `StepContent`
5. **Step4Results** → Invoca `saveValuation` con `leadSource: 'web'`
6. **useOptimizedSupabaseValuation** → Guarda `lead_source: 'web'` en DB
7. **send-valuation-email** → Renderiza `Origen: Web` en email interno

---

## Verificación y Pruebas

### Test A: Lead desde Web
1. Navegar a `https://capittal.es/lp/calculadora-web`
2. Verificar redirect a `/lp/calculadora?source=web`
3. Completar formulario
4. Verificar en `/admin/contacts`: `lead_source = "web"`
5. Verificar email interno: contiene "Origen: Web"

### Test B: Lead desde Google Ads (no romper nada)
1. Navegar directamente a `/lp/calculadora`
2. Completar formulario
3. Verificar: `lead_source = NULL`
4. Verificar email interno: NO contiene "Origen: Web"

---

## Sección Técnica

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/core/routing/AppRoutes.tsx` | Añadir ruta redirect `/lp/calculadora-web` |
| `src/pages/LandingCalculator.tsx` | Capturar `source=web` y pasar a calculadora |
| `supabase/functions/send-valuation-email/index.ts` | Añadir bloque "Origen: Web" |
| 13 archivos de componentes | Actualizar enlaces a `/lp/calculadora-web` |

### Impacto
- **Archivos modificados:** ~16
- **Líneas cambiadas:** ~60
- **Riesgo:** Bajo (cambios aditivos, sin modificar lógica existente)
- **Reversibilidad:** Alta (302 redirect permite rollback inmediato)

### Notas Importantes
- La ruta `/lp/calculadora` para Google Ads permanece **intacta**
- El 302 redirect es reversible; cuando esté confirmado, se puede cambiar a 301
- El campo `lead_source` ya existe en la DB, no requiere migración
- SessionStorage mantiene el source durante navegación multi-paso
