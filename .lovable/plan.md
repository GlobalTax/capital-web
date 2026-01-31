

# Plan: Convertir el Diseño de Oscuro a Claro (Light Theme)

## Objetivo

Transformar el diseño institucional actual de tema oscuro (negro) a un tema claro (blanco), manteniendo la elegancia y el estilo premium pero con colores invertidos.

## Comparativa Visual

```text
ANTES (Oscuro)                      DESPUÉS (Claro)
┌────────────────────┐              ┌────────────────────┐
│ ████████████████ █ │              │ ░░░░░░░░░░░░░░░░ ░ │
│ ████████████████ █ │              │ ░░░░░░░░░░░░░░░░ ░ │
│ ████ CAPITTAL  ███ │              │ ░░░░ CAPITTAL  ░░░ │
│ ████████████████ █ │              │ ░░░░░░░░░░░░░░░░ ░ │
│ ████████████████ █ │              │ ░░░░░░░░░░░░░░░░ ░ │
└────────────────────┘              └────────────────────┘
   Fondo: Negro #121212                Fondo: Blanco #FFFFFF
   Texto: Blanco                       Texto: Negro/Gris oscuro
```

## Paleta de Colores - Light Theme

| Elemento | Oscuro (actual) | Claro (nuevo) |
|----------|-----------------|---------------|
| **Fondo principal** | `hsl(0,0%,7%)` negro | `#ffffff` blanco |
| **Fondo elevado** | `hsl(0,0%,10%)` | `#f8f8f8` gris muy claro |
| **Texto principal** | `text-white` | `text-slate-900` |
| **Texto secundario** | `text-white/50` | `text-slate-500` |
| **Texto terciario** | `text-white/40` | `text-slate-400` |
| **Bordes** | `border-white/10` | `border-slate-200` |
| **Cards hover** | `bg-[hsl(0,0%,9%)]` | `bg-slate-50` |
| **Iconos** | `text-white/40` | `text-slate-400` |
| **Botones** | `bg-white text-black` | `bg-slate-900 text-white` |

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `TestLayout.tsx` | Cambiar clase y fondo a blanco |
| `InstitutionalHeader.tsx` | Invertir colores del header |
| `DarkHeroSection.tsx` | Renombrar a `HeroSection.tsx`, cambiar overlay |
| `ServicesSection.tsx` | Invertir todos los colores |
| `CaseStudiesSection.tsx` | Invertir todos los colores |
| `NuevoDiseno.tsx` | Actualizar footer y referencias |
| `src/index.css` | Añadir nuevo tema `.light-institutional` |

---

## Cambios Detallados por Componente

### 1. TestLayout.tsx

```typescript
// ANTES
<div className="dark-institutional min-h-screen bg-[hsl(var(--dark-bg))]">

// DESPUÉS  
<div className="light-institutional min-h-screen bg-white">
```

### 2. InstitutionalHeader.tsx

**Top bar (selector idioma):**
```typescript
// ANTES
<div className="bg-[hsl(0,0%,10%)] border-b border-white/10">
  <button className="text-white font-medium">ES</button>

// DESPUÉS
<div className="bg-slate-100 border-b border-slate-200">
  <button className="text-slate-900 font-medium">ES</button>
```

**Navegación principal:**
```typescript
// ANTES
<div className="bg-transparent backdrop-blur-sm bg-black/20">
  <Link className="text-white text-2xl">Capittal</Link>
  <a className="text-white/80">SERVICIOS</a>

// DESPUÉS
<div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
  <Link className="text-slate-900 text-2xl">Capittal</Link>
  <a className="text-slate-600 hover:text-slate-900">SERVICIOS</a>
```

**Menú móvil:**
```typescript
// ANTES
<div className="lg:hidden bg-[hsl(0,0%,7%)] border-t border-white/10">

// DESPUÉS
<div className="lg:hidden bg-white border-t border-slate-200">
```

### 3. DarkHeroSection.tsx → HeroSection.tsx

**Overlay del hero (clave para la legibilidad):**
```css
/* ANTES */
.hero-portobello-overlay {
  background: linear-gradient(
    to right,
    rgba(0,0,0,0.75) 0%,    /* Negro */
    rgba(0,0,0,0.5) 40%,
    rgba(0,0,0,0.3) 100%
  );
}

/* DESPUÉS - Overlay blanco para texto oscuro legible */
.hero-light-overlay {
  background: linear-gradient(
    to right,
    rgba(255,255,255,0.85) 0%,   /* Blanco fuerte */
    rgba(255,255,255,0.7) 40%,
    rgba(255,255,255,0.4) 100%
  );
}
```

**Textos del hero:**
```typescript
// ANTES
<h1 className="font-serif-display text-white">
<p className="text-white/70">
<div className="text-white text-4xl">

// DESPUÉS
<h1 className="font-serif-display text-slate-900">
<p className="text-slate-600">
<div className="text-slate-900 text-4xl">
```

**Stats y indicadores:**
```typescript
// ANTES
<div className="text-white/50 text-sm">Valor total asesorado</div>
<div className="w-12 h-0.5 bg-white" />  {/* Slider activo */}
<div className="w-12 h-0.5 bg-white/30" />  {/* Slider inactivo */}

// DESPUÉS
<div className="text-slate-500 text-sm">Valor total asesorado</div>
<div className="w-12 h-0.5 bg-slate-900" />
<div className="w-12 h-0.5 bg-slate-300" />
```

### 4. ServicesSection.tsx

**Fondo y header:**
```typescript
// ANTES
<section className="py-24 md:py-32 bg-[hsl(0,0%,7%)]">
<span className="text-white/40 text-sm tracking-[0.2em] uppercase">
<h2 className="font-serif-display text-white text-4xl">
  <span className="text-white/60">para tu empresa</span>

// DESPUÉS
<section className="py-24 md:py-32 bg-white">
<span className="text-slate-400 text-sm tracking-[0.2em] uppercase">
<h2 className="font-serif-display text-slate-900 text-4xl">
  <span className="text-slate-500">para tu empresa</span>
```

**Grid de servicios:**
```typescript
// ANTES
<div className="grid ... gap-px bg-white/10">
  <motion.div className="bg-[hsl(0,0%,7%)] hover:bg-[hsl(0,0%,9%)]">
    <div className="text-white/40 group-hover:text-white">
    <h3 className="text-white text-xl">
    <p className="text-white/50">

// DESPUÉS
<div className="grid ... gap-px bg-slate-200">
  <motion.div className="bg-white hover:bg-slate-50">
    <div className="text-slate-400 group-hover:text-slate-900">
    <h3 className="text-slate-900 text-xl">
    <p className="text-slate-500">
```

**CTA inferior:**
```typescript
// ANTES
<div className="border-t border-white/10">
  <p className="text-white/50">
  <button className="bg-white text-black">

// DESPUÉS
<div className="border-t border-slate-200">
  <p className="text-slate-500">
  <button className="bg-slate-900 text-white hover:bg-slate-800">
```

### 5. CaseStudiesSection.tsx

**Fondo y textos:**
```typescript
// ANTES
<section className="py-24 md:py-32 bg-[hsl(0,0%,5%)]">
<span className="text-white/40">Casos de éxito</span>
<h2 className="text-white">Operaciones que hablan</h2>
<span className="text-white/60">por sí mismas</span>

// DESPUÉS
<section className="py-24 md:py-32 bg-slate-50">
<span className="text-slate-400">Casos de éxito</span>
<h2 className="text-slate-900">Operaciones que hablan</h2>
<span className="text-slate-500">por sí mismas</span>
```

**Cards:**
```typescript
// ANTES
<motion.div className="bg-[hsl(0,0%,7%)] hover:bg-[hsl(0,0%,10%)]">
  <img className="filter brightness-0 invert opacity-60">
  <span className="text-white/40">Sector • 2024</span>
  <h3 className="text-white">Título</h3>
  <p className="text-white/50">

// DESPUÉS
<motion.div className="bg-white hover:bg-slate-50 shadow-sm">
  <img className="opacity-70 group-hover:opacity-100">  {/* Sin filtro invert */}
  <span className="text-slate-400">Sector • 2024</span>
  <h3 className="text-slate-900">Título</h3>
  <p className="text-slate-500">
```

**Loading y empty states:**
```typescript
// ANTES
<Skeleton className="bg-white/10" />
<Building2 className="text-white/20" />
<p className="text-white/40">

// DESPUÉS
<Skeleton className="bg-slate-200" />
<Building2 className="text-slate-300" />
<p className="text-slate-400">
```

### 6. NuevoDiseno.tsx (Footer)

```typescript
// ANTES
<footer className="py-16 border-t border-white/10 bg-[hsl(0,0%,5%)]">
  <span className="text-white text-2xl">Capittal</span>
  <p className="text-white/40">Especialistas en M&A</p>
  <a className="text-white/60 hover:text-white">

// DESPUÉS
<footer className="py-16 border-t border-slate-200 bg-slate-100">
  <span className="text-slate-900 text-2xl">Capittal</span>
  <p className="text-slate-500">Especialistas en M&A</p>
  <a className="text-slate-500 hover:text-slate-900">
```

### 7. src/index.css (Nuevo tema)

Añadir después de `.dark-institutional`:

```css
/* Light Institutional Theme Scope */
.light-institutional {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 98%;
  --card-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
}

/* Hero overlay for light theme */
.hero-light-overlay {
  background: linear-gradient(
    to right,
    rgba(255,255,255,0.9) 0%,
    rgba(255,255,255,0.7) 40%,
    rgba(255,255,255,0.4) 100%
  );
}
```

---

## Resultado Visual Esperado

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ bg-slate-100                                           ES | CA | EN    │
├─────────────────────────────────────────────────────────────────────────┤
│ bg-white/80 backdrop-blur                                              │
│  Capittal            SERVICIOS  EQUIPO  CASOS  RECURSOS  CONTACTO      │
│  (negro)             (gris oscuro con hover negro)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─── Hero con imagen + overlay blanco semitransparente ─────────────┐ │
│  │                                                                    │ │
│  │   Especialistas en                    (texto negro sobre           │ │
│  │   compraventa de empresas              fondo blanco/imagen)        │ │
│  │                                                                    │ │
│  │   Maximizamos el valor...              (texto gris)                │ │
│  │                                                                    │ │
│  │   €902M    98,7%    200+    60+        (texto negro)               │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ bg-white                           SERVICIOS                            │
│                                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   Cards blancas con              │
│  │  ◯      │ │  ◯      │ │  ◯      │   bordes sutiles,                │
│  │ Venta   │ │ Valor.  │ │ Due D.  │   hover gris claro               │
│  └─────────┘ └─────────┘ └─────────┘                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ bg-slate-50                        CASOS DE ÉXITO                       │
│                                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   Cards blancas con              │
│  │ [Logo]  │ │ [Logo]  │ │ [Logo]  │   sombra sutil                   │
│  │ Caso 1  │ │ Caso 2  │ │ Caso 3  │                                   │
│  └─────────┘ └─────────┘ └─────────┘                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ bg-slate-100                       FOOTER                               │
│  Capittal  |  Política  |  Aviso legal  |  © 2025                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Sección Técnica

### Mapeo de Clases Tailwind

| Clase Oscura | Clase Clara |
|--------------|-------------|
| `bg-[hsl(0,0%,5%)]` | `bg-slate-50` |
| `bg-[hsl(0,0%,7%)]` | `bg-white` |
| `bg-[hsl(0,0%,10%)]` | `bg-slate-50` |
| `bg-black/20` | `bg-white/80` |
| `text-white` | `text-slate-900` |
| `text-white/80` | `text-slate-700` |
| `text-white/70` | `text-slate-600` |
| `text-white/60` | `text-slate-500` |
| `text-white/50` | `text-slate-500` |
| `text-white/40` | `text-slate-400` |
| `text-white/30` | `text-slate-300` |
| `border-white/10` | `border-slate-200` |
| `bg-white/10` | `bg-slate-200` |
| `hover:bg-[hsl(0,0%,9%)]` | `hover:bg-slate-50` |
| `filter brightness-0 invert` | (eliminar) |

### Consideraciones del Hero

El hero con imagen de fondo requiere especial atención:
- El overlay pasa de **negro semitransparente** a **blanco semitransparente**
- Esto permite que el texto oscuro sea legible sobre la imagen
- Se mantiene el efecto de degradado de izquierda a derecha

### Orden de Implementación

1. **CSS Global** - Añadir `.light-institutional` y `.hero-light-overlay`
2. **TestLayout** - Cambiar clase base
3. **InstitutionalHeader** - Invertir colores
4. **DarkHeroSection** - Renombrar y adaptar (más complejo)
5. **ServicesSection** - Invertir colores
6. **CaseStudiesSection** - Invertir colores
7. **NuevoDiseno** - Actualizar footer

