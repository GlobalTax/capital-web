

## Auto-deshabilitar campañas de pruebas en Resumen General

### Cambio

**Archivo: `src/components/admin/campanas-valoracion/OutboundSummaryDashboard.tsx`**

Inicializar `disabledCampaigns` con las campañas cuyo sector sea "Pruebas" (o nombre contenga "prueba"), en vez de empezar con un `Set` vacío.

Como los datos se cargan con React Query, no se puede saber los IDs al inicio. Se usará un `useEffect` que, cuando `raw` se cargue por primera vez, detecte las campañas con `sector?.toLowerCase() === 'pruebas'` y las añada al `disabledCampaigns`.

Se añadirá un `useRef` para ejecutar esta lógica solo una vez (primera carga), sin sobreescribir selecciones manuales del usuario en cargas posteriores.

```tsx
const initializedRef = useRef(false);

useEffect(() => {
  if (raw?.campaigns.length && !initializedRef.current) {
    initializedRef.current = true;
    const pruebas = raw.campaigns
      .filter(c => c.sector?.toLowerCase() === 'pruebas')
      .map(c => c.id);
    if (pruebas.length) {
      setDisabledCampaigns(new Set(pruebas));
    }
  }
}, [raw]);
```

El usuario podrá re-habilitarlas manualmente con el checkbox de cada campaña.

