

# Plan: Rediseño Completo Estilo Portobello Capital

## Diferencias Identificadas

Después de analizar el screenshot de Portobello Capital, el diseño actual difiere significativamente:

| Elemento | Portobello (Referencia) | Diseño Actual |
|----------|-------------------------|---------------|
| **Hero Background** | Imagen fullscreen (molinos) con overlay oscuro | Fondo sólido negro |
| **Tipografía título** | Serif elegante (tipo Playfair Display) | Sans-serif |
| **Posición stats** | Debajo del subtítulo, alineados izquierda | Arriba, grid horizontal |
| **Header estructura** | Logo izq + Nav centro + Idiomas arriba-derecha | Logo izq + Nav centro + CTA derecha |
| **Alineación contenido** | Todo alineado a la izquierda | Centrado parcialmente |
| **Indicadores** | Dots/líneas de slider abajo-derecha | No existen |

## Cambios a Implementar

### 1. Header Rediseñado

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                                              ÁREA DE INVERSORES  ES | EN│
├─────────────────────────────────────────────────────────────────────────┤
│  [Logo]  Capittal     SERVICIOS  EQUIPO  CASOS  ACTUALIDAD  CONTACTO   │
└─────────────────────────────────────────────────────────────────────────┘
```

- Dos filas: barra superior pequeña + navegación principal
- Navegación en mayúsculas con tracking amplio
- Selector de idioma arriba a la derecha

### 2. Hero con Imagen de Fondo

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                        ┌──────────────────────────────┐ │
│                                        │  IMAGEN DE FONDO FULLSCREEN  │ │
│   Construimos                          │  (Overlay semi-transparente)  │ │
│   empresas líderes                     │                              │ │
│                                        └──────────────────────────────┘ │
│   Somos una gestora independiente                                       │
│   de M&A líder en el 'Middle Market'.                                   │
│                                                                         │
│   €902M          +10           +200                          ○────○     │
│   Valor total    Años          Operaciones                   Slider     │
│   asesorado      experiencia   cerradas                      dots       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3. Tipografía Serif

- Título principal: Fuente serif (Playfair Display o similar)
- Resto: General Sans (actual)

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/test/components/InstitutionalHeader.tsx` | Rediseño completo con 2 filas |
| `src/pages/test/components/DarkHeroSection.tsx` | Imagen fondo, layout izquierdo, tipografía serif |
| `src/index.css` | Añadir fuente serif e imagen de fondo |
| `index.html` | Cargar Google Font Playfair Display |

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `public/images/hero-background.jpg` | Imagen de fondo del hero (placeholder inicialmente) |

## Código del Nuevo Header

```typescript
// Estructura de 2 niveles
<header className="fixed top-0 left-0 right-0 z-50">
  {/* Top bar - pequeña */}
  <div className="bg-[#1a1a1a] border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 flex justify-end items-center h-8">
      <span className="text-white/60 text-xs uppercase tracking-widest mr-6">
        Área de inversores
      </span>
      <div className="flex items-center gap-2 text-xs">
        <button className="text-white">ES</button>
        <span className="text-white/30">|</span>
        <button className="text-white/60 hover:text-white">EN</button>
      </div>
    </div>
  </div>
  
  {/* Main nav */}
  <div className="bg-transparent">
    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
      <Logo />
      <nav className="flex items-center gap-8">
        {/* Links en mayúsculas, tracking wide */}
      </nav>
    </div>
  </div>
</header>
```

## Código del Nuevo Hero

```typescript
<section className="relative min-h-screen">
  {/* Background Image */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
  >
    <div className="absolute inset-0 bg-black/50" /> {/* Overlay */}
  </div>
  
  {/* Content - Alineado a la izquierda */}
  <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 lg:px-12">
    <div className="max-w-3xl">
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight">
        Construimos<br/>empresas líderes
      </h1>
      <p className="text-white/80 text-lg mt-6 max-w-md">
        Somos una gestora independiente de capital privado líder en el 'Middle Market'.
      </p>
      
      {/* Stats inline */}
      <div className="flex gap-12 mt-12">
        <div>
          <span className="text-white text-4xl font-light">€3.7bn</span>
          <span className="block text-white/60 text-sm">Activos bajo gestión</span>
        </div>
        {/* ... más stats */}
      </div>
    </div>
  </div>
  
  {/* Slider indicators */}
  <div className="absolute bottom-8 right-12 flex gap-2">
    <div className="w-12 h-0.5 bg-white" />
    <div className="w-12 h-0.5 bg-white/30" />
  </div>
</section>
```

## Imagen de Fondo

Usaremos una imagen de stock temporal. Opciones:

1. **Unsplash** - imagen corporativa/industrial gratuita
2. **Placeholder gradiente** - mientras consigues la imagen definitiva
3. **Tu propia imagen** - puedes subirla después

## Fuente Serif

Añadiremos Playfair Display de Google Fonts:

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
/* index.css */
.font-serif-display {
  font-family: 'Playfair Display', serif;
}
```

## Resultado Visual Esperado

El diseño será prácticamente idéntico a Portobello Capital:
- Hero fullscreen con imagen de fondo oscurecida
- Título grande en serif elegante
- Stats alineados a la izquierda debajo del subtítulo
- Header con barra superior de idiomas
- Navegación en mayúsculas espaciadas

## Sección Técnica

### Estructura CSS del Hero

```css
.hero-portobello {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-portobello::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0,0,0,0.7) 0%,
    rgba(0,0,0,0.4) 50%,
    rgba(0,0,0,0.2) 100%
  );
}
```

### Imagen de Fondo Temporal

Usaremos una imagen de Unsplash de alta calidad relacionada con energía/industria:

```
https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920
```

(Molinos de viento similares a Portobello)

