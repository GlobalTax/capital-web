

## Añadir pills/links de servicios al Hero

### Qué se hará

Añadir una fila de **pills (badges clicables)** debajo del subtítulo y encima de los CTAs en el Hero, con los enlaces:

- **Venta de empresas** → `/venta-empresas`
- **Mandatos de compra** → `/mandatos-compra` (o la ruta correspondiente)
- **Valoración & Due Diligence** → `/servicios/valoraciones`

### Diseño visual

Las pills serán botones con estilo de etiqueta (pill/chip), separados por un punto medio (`·`), con:
- Borde sutil (`border-foreground/20`)
- Fondo semi-transparente (`bg-white/60 backdrop-blur-sm`)
- Hover con fondo más sólido
- Tamaño de texto pequeño (`text-sm`)
- Esquinas redondeadas (`rounded-full`)
- Separados visualmente por un `·` decorativo en color muted

### Ubicación en el layout

```text
[Título serif grande]
[Subtítulo descriptivo]
[Pill 1] · [Pill 2] · [Pill 3]    <-- NUEVO
[CTA Contactar] [CTA Valorar]
```

### Archivo a modificar

**`src/components/Hero.tsx`** (líneas ~154-158 aprox.)

Se insertará un bloque nuevo entre el párrafo del subtítulo y el div de CTAs, con 3 `Link` de React Router estilizados como pills.

### Detalle técnico

- Usa `Link` de `react-router-dom` (ya importado)
- Estilo Tailwind inline, sin componente nuevo
- Los pills son estáticos (no vienen de BD), ya que representan la propuesta de valor fija de la firma
- Responsive: en móvil se apilarán o harán wrap con `flex-wrap`

