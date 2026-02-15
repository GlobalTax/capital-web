

## Actualizar Header con CTAs de contacto y calculadora

### Resumen

Anadir al header principal un boton secundario "Valora tu empresa" (enlazando a la calculadora), mantener el boton principal "Contactar" ya existente, y en movil anadir un icono de telefono click-to-call visible junto al boton de menu hamburguesa.

### Cambios propuestos

#### 1. `src/components/Header.tsx`

**Desktop (zona de CTAs, lineas 31-40):**
- Anadir un enlace de texto "Valora tu empresa" apuntando a `/lp/calculadora` con estilo secundario (texto negro, sin fondo, similar a los links de navegacion pero con un toque diferenciador como un underline o un borde outline)
- Mantener el boton solido "Contactar" ya existente (amber-500) como CTA principal

**Movil (lineas 42-50):**
- Anadir un icono `Phone` de Lucide como enlace `tel:+34695717490` al lado del boton hamburguesa
- Este icono sera visible siempre en movil, sin necesidad de abrir el menu

#### 2. `src/components/header/AdvancedMobileNavigation.tsx`

**Zona de botones de accion (lineas 146-170):**
- Anadir un enlace "Valora tu empresa" apuntando a `/lp/calculadora` como boton secundario (outline) antes del boton de contacto
- Ya tiene el boton "Llamar Ahora" con `tel:+34695717490` -- se mantiene

### Detalle de los cambios

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/components/Header.tsx` | 31-40 | Anadir Link "Valora tu empresa" con estilo outline/texto antes del boton Contactar |
| `src/components/Header.tsx` | 42-50 | Anadir icono Phone con `tel:+34695717490` al lado del hamburguesa en movil |
| `src/components/header/AdvancedMobileNavigation.tsx` | 146-162 | Anadir boton "Valora tu empresa" outline antes de "Contacto" |

### Diseno

- **Desktop**: `[Valora tu empresa]` (outline/texto) + `[Contactar]` (solido amber) en la zona derecha del header
- **Movil**: Icono telefono + hamburguesa visibles en la barra. Dentro del menu: "Valora tu empresa" (outline) + "Contacto" (solido) + "Llamar Ahora" (ya existente)

No se necesitan cambios en i18n ya que los textos se pueden poner directamente o usar claves existentes.

