

## Redirigir perfil de empresa de Capittal a GoDeal

### Concepto
En lugar de mantener dos perfiles paralelos, cuando se abra una empresa en Capittal admin se abrirá directamente el perfil de GoDeal (`https://godeal.es/empresas/{id}`). GoDeal pasa a ser la fuente única de verdad para el perfil de empresa.

### Cambios

**1. Cambiar todas las navegaciones a empresas** (6 archivos)

Reemplazar `navigate('/admin/empresas/${id}')` por `window.open('https://godeal.es/empresas/${id}', '_blank')` en:

- `src/components/admin/empresas/EmpresasTableVirtualized.tsx` (handleNavigate)
- `src/components/admin/companies/CompanyLinkCard.tsx` (3 ubicaciones)
- `src/components/admin/apollo-visitors/ImportedEmpresasTable.tsx` (2 Links)
- `src/pages/admin/DealsPausedPage.tsx` (2 ubicaciones)
- `src/pages/admin/EmpresasPage.tsx` (si hay alguna)

**2. Ruta `/admin/empresas/:id`** 

Convertir `EmpresaDetailPage` en un redirect: si alguien accede directamente a la URL, redirige a GoDeal y muestra un mensaje de "Abriendo en GoDeal...". Esto cubre links guardados en favoritos, emails antiguos, etc.

**3. Lo que NO cambia**
- La tabla/listado de empresas en Capittal (`EmpresasPage`) se mantiene como está
- Los hooks, datos financieros y triggers de sincronización siguen funcionando (alimentan la DB que GoDeal consume)
- La funcionalidad de crear/editar empresa sigue disponible desde el listado

### Resultado
Un solo perfil de empresa (GoDeal) alimentado por los datos de Capittal. Sin duplicidad de interfaces.

