

## Plan: Corregir LinkedIn y reemplazar Twitter por Instagram en el Footer

### Cambios

**Archivo**: `src/components/ui/footer-section.tsx`

1. **Import**: Cambiar `Twitter` por `Instagram` en el import de lucide-react (línea 4)
2. **LinkedIn** (línea 233): Actualizar URL a `https://www.linkedin.com/company/capittal-ma-consulting/posts/?feedView=all`
3. **Twitter → Instagram** (líneas 241-249): Reemplazar enlace de Twitter por Instagram (`https://www.instagram.com/capittal.es/`), cambiar icono a `Instagram`, actualizar aria-label

### Verificar también
Buscar si `InstitutionalFooter.tsx` tiene los mismos enlaces para actualizarlos igualmente.

