

## Anadir seccion "La Firma" y "Areas de Practica" a la Home

### Objetivo
Incorporar dos nuevas secciones al estilo institucional de Norgestion para reforzar la imagen profesional de la home.

---

### 1. Seccion "La Firma" (nueva)

Bloque institucional con layout 50/50 (imagen + texto) inspirado en el `AboutSection` del prototipo `/test/nuevo-diseno`. Incluye:

- **Subtitulo superior**: "La Firma" en tracking ancho y uppercase (estilo sutil)
- **Titulo serif**: "Confianza y experiencia desde 2008"
- **Imagen**: Reutilizar `about-firm.jpg` del directorio de assets
- **Texto descriptivo**: Parrafos sobre la historia, mision y diferenciacion de Capittal
- **Valores destacados**: Confidencialidad e Independencia con borde lateral
- **CTA**: Enlace a la pagina del equipo
- **Animaciones**: Entrada con framer-motion al hacer scroll

**Ubicacion en la home**: Justo despues de `SocialProofCompact` y antes de `SearchFundsCTA`.

---

### 2. Seccion "Areas de Practica" (nueva)

Cards grandes con imagen de fondo al estilo de `ServicesSectionWithImages` del prototipo. Grid 2x2 con:

- **4 servicios principales**: Venta de empresas, Valoracion, Due Diligence, Planificacion fiscal
- **Diseno**: Imagen de fondo a pantalla completa dentro de la card, gradient overlay oscuro, titulo en blanco
- **Hover**: Zoom en imagen + descripcion que aparece con fade
- **Enlace "Saber mas"**: Con flecha animada
- **CTA inferior**: "Contactar" con separador superior
- **Animaciones**: Stagger children con framer-motion
- **Imagenes**: Reutilizar las imagenes del directorio `src/assets/test/`

**Ubicacion en la home**: Reemplazar el componente `Services` actual, que usa cards con texto plano, por este nuevo diseno mas visual e institucional.

---

### Cambios en archivos

**Archivo nuevo**: `src/components/home/LaFirmaSection.tsx`
- Componente basado en `AboutSection` del prototipo, adaptado al sistema i18n existente
- Usa `useCountAnimation` para estadisticas (ya disponible)
- Importa `about-firm.jpg`

**Archivo nuevo**: `src/components/home/PracticeAreasSection.tsx`
- Componente basado en `ServicesSectionWithImages` del prototipo
- Grid 2x2 con cards de imagen de fondo
- Importa las imagenes de servicios existentes

**Archivo modificado**: `src/pages/Index.tsx`
- Importar `LaFirmaSection` y `PracticeAreasSection`
- Insertar `LaFirmaSection` despues de `SocialProofCompact`
- Reemplazar `<Services />` por `<PracticeAreasSection />`

---

### Orden final de secciones en la Home

```text
1. Hero
2. SocialProofCompact
3. LaFirmaSection          <-- NUEVA
4. SearchFundsCTA
5. PracticeAreasSection    <-- REEMPLAZA Services
6. EcosistemaIntegral
7. CaseStudiesCompact
8. MANewsSection
9. WhyChooseCapittal
10. Contact
```

### Detalles tecnicos

- Ambos componentes usan `framer-motion` para animaciones de entrada (ya instalado)
- Se reutilizan imagenes existentes en `src/assets/test/` sin necesidad de nuevos assets
- Se mantiene soporte i18n: se crearan claves de traduccion con fallback en espanol hardcoded inicialmente
- Tipografia: `font-serif` para titulos principales (Playfair Display), `font-sans` para cuerpo

