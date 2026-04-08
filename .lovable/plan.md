

## Plan: Integrar Leads Inversores (ROD) en Rel. Oportunidades + Auto-add a Listados ROD

### Contexto actual
- **OportunidadesPage** tiene 5 pestanas: Sell-Side, Buy-Side, Documentos ROD, Listados ROD, Envios ROD
- **InvestorLeadsManager** es una pagina independiente en `/admin/investor-leads` que muestra leads de la tabla `investor_leads` (personas que descargaron la ROD)
- La Edge Function `generate-rod-document` ya inserta en `investor_leads` y `buyer_contacts`, pero NO en `rod_list_members`

### Cambios propuestos

**1. Nueva pestana "Leads Inversores" en OportunidadesPage**
- Anadir una 6a pestana con icono `TrendingUp` en `OportunidadesPage.tsx`
- Cargar `InvestorLeadsManager` como lazy component dentro de esa pestana
- Eliminar la ruta independiente `/admin/investor-leads` del router
- Eliminar el enlace del sidebar

**2. Auto-add a rod_list_members al descargar la ROD**
- Modificar la Edge Function `generate-rod-document` para que, tras crear el `investor_lead`, haga un upsert en `rod_list_members` con el email, nombre, empresa y el idioma del documento descargado
- Esto asegura que todo descargador pase automaticamente al listado ROD del idioma correspondiente

### Archivos a modificar
- `src/pages/admin/OportunidadesPage.tsx` — anadir pestana con lazy load del InvestorLeadsManager
- `src/features/admin/config/sidebar-config.ts` — eliminar entrada "Leads Inversores (ROD)"
- `src/features/admin/components/AdminRouter.tsx` — eliminar ruta `/investor-leads`
- `supabase/functions/generate-rod-document/index.ts` — anadir upsert en `rod_list_members` tras crear el lead

### Detalle tecnico del upsert automatico
```sql
-- Dentro de generate-rod-document, tras el insert en investor_leads:
INSERT INTO rod_list_members (language, full_name, email, company)
VALUES ($language, $full_name, $email, $company)
ON CONFLICT (language, email) DO NOTHING;
```
El idioma se determina por el idioma del documento descargado (`es` o `en`).

