

## Plan: Panel resumen de KPIs en Listas de Contacto

### Métricas a mostrar
Fila de 5 cards compactas encima de los tabs con datos calculados de las listas existentes:

1. **Total Empresas** — Suma de `contact_count` de todas las listas
2. **Total Listas** — Número total de listas
3. **Listas Activas** — Listas con `estado === 'activa'`
4. **Media Empresas/Lista** — Total empresas / total listas
5. **Con Campaña** — Listas que tienen `last_campaign_name` asignada

Las métricas se recalculan con `useMemo` desde el array `lists` ya disponible (sin queries adicionales).

### Diseño
Cards compactas tipo `EmpresasStatsCards` con icono, valor grande y subtítulo. Grid `grid-cols-2 md:grid-cols-5`.

### Cambio
- **`src/pages/admin/ContactListsPage.tsx`**: Añadir bloque de KPIs entre el header y los tabs, usando `Card`/`CardContent` + iconos de lucide.

