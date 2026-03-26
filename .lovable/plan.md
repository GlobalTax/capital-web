

## Plan: Dos logos por caso de éxito + quitar borde del sector

### Resumen
Cada caso de éxito mostrara dos logos: el de la **Parte Asesorada** (logo actual `logo_url`) y el de la **Otra Parte** (nuevo campo `counterpart_logo_url`). Los labels "Parte Asesorada" / "Otra Parte" son solo internos (admin). En la web publica se muestran ambos logos lado a lado sin etiquetas. Ademas se elimina el recuadro/borde del badge de sector.

### 1. Migración de base de datos
- Añadir columna `counterpart_logo_url TEXT` a la tabla `case_studies`
- Regenerar tipos de Supabase

### 2. Admin: CaseStudiesManager.tsx
- Renombrar el campo de logo actual a **"Logo Parte Asesorada"** (interno)
- Añadir segundo `ImageUploadField` con label **"Logo Otra Parte"** (interno)
- Actualizar interface, emptyCase y formData para incluir `counterpart_logo_url`
- En la tabla de listado, mostrar ambos logos pequeños

### 3. Vista publica: CaseStudies.tsx (pagina /casos-exito)
- Mostrar ambos logos lado a lado (sin etiquetas) en la zona superior de cada tarjeta
- Quitar `border` del badge de sector (clase `border border-border` → sin borde)

### 4. Vista compacta: CaseStudiesCompact.tsx (landing/home)
- Mostrar ambos logos centrados lado a lado
- Quitar `border` del badge de sector

### 5. ServiceClosedOperations.tsx (paginas de servicio)
- Mostrar ambos logos en la zona de logo
- Sin cambios al badge (ya no tiene borde visual relevante, pero verificar)

### 6. CaseStudyPreview.tsx (preview admin)
- Actualizar para mostrar ambos logos

### Diseño visual de los dos logos
```text
┌─────────────────────────────────┐
│  [Logo Asesorada]  [Logo Otra]  │  ← lado a lado, sin labels
│                                 │
│  Sector • 2026                  │  ← sin borde/recuadro
│  Título de la operación         │
│  ...                            │
└─────────────────────────────────┘
```

Ambos logos tendrán el mismo tamaño (~w-20 h-20), contenidos en un fondo gris claro redondeado, separados por un pequeño espacio. Si solo hay un logo, se centra solo.

### Archivos a modificar
- **Migration SQL**: nueva columna `counterpart_logo_url`
- `src/components/admin/CaseStudiesManager.tsx`
- `src/components/admin/preview/CaseStudyPreview.tsx`
- `src/components/CaseStudies.tsx`
- `src/components/CaseStudiesCompact.tsx`
- `src/components/shared/ServiceClosedOperations.tsx`
- `src/hooks/useCaseStudies.tsx` (añadir campo al select si no usa `*`)

