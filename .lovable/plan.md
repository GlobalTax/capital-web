

## Reemplazar el Hero por un diseño institucional con slider

### Problema
El hero actual muestra un "dashboard" con operaciones activas, sectores y porcentajes de crecimiento, lo que transmite imagen de marketplace o plataforma SaaS en lugar de una firma de asesoramiento M&A de alta gama.

### Solucion
Reemplazar el hero actual por el componente **HeroSliderSection** ya prototipado en `/test/nuevo-diseno`, adaptandolo al sistema i18n y a las rutas de produccion. Este hero usa imagenes a pantalla completa con transiciones suaves, tipografia serif elegante y un CTA limpio, alineado con la identidad institucional de Norgestion y firmas similares.

---

### Diseno del nuevo Hero

- **Slider de 3 imagenes** a pantalla completa con transicion cada 6 segundos
- **Gradient overlay** blanco desde la izquierda para legibilidad del texto
- **Titulo serif grande** (Playfair Display) con mensajes rotativos
- **Subtitulo** descriptivo debajo del titulo
- **CTA unico**: Boton "Contactar" con flecha
- **Indicadores de slide**: Lineas horizontales en la esquina inferior izquierda
- **Contador**: "01/03" en la esquina inferior derecha
- **Indicador de scroll**: Animacion sutil centrada en la parte inferior
- **Imagenes existentes**: Reutiliza `hero-slide-1.jpg`, `hero-slide-2.jpg`, `hero-slide-3.jpg`

### Cambios en archivos

**Archivo modificado**: `src/components/Hero.tsx`
- Reemplazar completamente el contenido actual (dashboard card + badges flotantes)
- Nuevo componente basado en `HeroSliderSection` del prototipo
- Mantener soporte i18n con el hook `useI18n()` para los textos
- Conservar `ErrorBoundary` como wrapper
- Mantener el CTA apuntando a `/lp/calculadora-web` (valorar empresa) ademas de uno de contacto
- Adaptar los slides con mensajes institucionales: compraventa de empresas, presencia nacional, asesoramiento personalizado

**Sin archivos nuevos**: Se modifica el componente existente, manteniendo el mismo export default.

### Detalles tecnicos

- Usa `framer-motion` (AnimatePresence) para transiciones entre slides (ya instalado)
- Tipografia `font-serif` para el titulo principal (Playfair Display via Tailwind config)
- Autoplay cada 6 segundos con pausa al interactuar manualmente
- Las imagenes de los slides ya existen en `src/assets/test/`
- Se eliminan los badges flotantes ("M&A Leaders", "Profesional"), la dashboard card y las stats duplicadas (que ahora estan en LaFirmaSection)

