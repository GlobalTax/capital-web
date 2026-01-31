

# Plan: Actualizar Contenido del Nuevo Diseño con Textos de Capittal

## Problema Identificado

El Hero del prototipo actual (`/test/nuevo-diseno`) usa textos copiados de Portobello Capital:
- "Construimos empresas líderes" ❌
- "Somos una gestora independiente de capital privado líder en el 'Middle Market' español" ❌

Estos deben ser reemplazados por el contenido auténtico de Capittal.

## Contenido Actual de Capittal (a usar)

Basado en el sistema de traducciones existente:

| Elemento | Contenido de Capittal |
|----------|----------------------|
| **Título principal** | "Especialistas en compraventa de empresas" |
| **Subtítulo** | "Maximizamos el valor de tu empresa con un equipo multidisciplinar de más de 60 profesionales y enfoque orientado a resultados." |
| **Stat 1** | €902M - Valor total asesorado |
| **Stat 2** | 98,7% - Tasa de éxito |
| **Stat 3** | 200+ - Operaciones cerradas |
| **Stat 4** | 60+ - Profesionales especializados |
| **Beneficios** | Máximo precio · Proceso 100% confidencial · +200 operaciones |

## Navegación del Header

Actualizar los enlaces del header para reflejar los servicios de Capittal:

| Actual (copiado) | Correcto (Capittal) |
|------------------|---------------------|
| SERVICIOS | SERVICIOS |
| EQUIPO | EQUIPO |
| CASOS | CASOS DE ÉXITO |
| ACTUALIDAD | RECURSOS |
| CONTACTO | CONTACTO |
| Área de inversores | (eliminar - Capittal no tiene) |

## Cambios a Realizar

### 1. DarkHeroSection.tsx

**Antes:**
```
Construimos
empresas líderes

Somos una gestora independiente de capital privado...
```

**Después:**
```
Especialistas en
compraventa de empresas

Maximizamos el valor de tu empresa con un equipo 
multidisciplinar de más de 60 profesionales.
```

**Stats actualizados:**
- €902M → Valor total asesorado ✓ (ya está bien)
- +10 años → **98,7%** Tasa de éxito
- +200 operaciones → 200+ Operaciones ✓ (ajustar formato)
- Añadir: 60+ Profesionales

### 2. InstitutionalHeader.tsx

- Eliminar "Área de inversores" (no aplica a Capittal)
- Mantener selector de idioma
- Actualizar navegación:
  - SERVICIOS → enlace a `/servicios`
  - EQUIPO → enlace a `/equipo`  
  - CASOS → enlace a `/casos-exito`
  - RECURSOS → enlace a `/recursos`
  - CONTACTO → enlace a `/contacto`

### 3. NuevoDiseno.tsx (Footer)

Actualizar el footer con el contenido de Capittal:
- "Especialistas en M&A y valoraciones" ✓ (ya está bien)
- Actualizar año: © 2024 → © 2025

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/test/components/DarkHeroSection.tsx` | Actualizar título, subtítulo y stats |
| `src/pages/test/components/InstitutionalHeader.tsx` | Eliminar "Área inversores", actualizar nav links |
| `src/pages/test/NuevoDiseno.tsx` | Actualizar año del footer |

## Resultado Visual Esperado

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                                                            ES | CA | EN │
├─────────────────────────────────────────────────────────────────────────┤
│  Capittal            SERVICIOS  EQUIPO  CASOS  RECURSOS  CONTACTO      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Especialistas en                                                      │
│   compraventa de empresas                                               │
│                                                                         │
│   Maximizamos el valor de tu empresa con un equipo                      │
│   multidisciplinar de más de 60 profesionales.                          │
│                                                                         │
│   €902M          98,7%         200+           60+                       │
│   Valor total    Tasa de       Operaciones    Profesionales             │
│   asesorado      éxito         cerradas       especializados            │
│                                                                         │
│                  [  Valorar Empresa  ]                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Sección Técnica

### Código actualizado del Hero (fragmento)

```typescript
const stats: StatItem[] = [
  { value: '€902M', label: 'Valor total asesorado' },
  { value: '98,7%', label: 'Tasa de éxito' },
  { value: '200+', label: 'Operaciones cerradas' },
  { value: '60+', label: 'Profesionales especializados' },
];

// En el JSX:
<h1 className="font-serif-display text-white ...">
  Especialistas en
  <br />
  <span className="text-primary">compraventa</span> de empresas
</h1>

<p className="text-white/70 ...">
  Maximizamos el valor de tu empresa con un equipo multidisciplinar 
  de más de 60 profesionales y enfoque orientado a resultados.
</p>
```

### Navegación actualizada

```typescript
const navItems = [
  { label: 'SERVICIOS', href: '/servicios' },
  { label: 'EQUIPO', href: '/equipo' },
  { label: 'CASOS', href: '/casos-exito' },
  { label: 'RECURSOS', href: '/recursos' },
  { label: 'CONTACTO', href: '/contacto' },
];
```

### CTA Button

Añadir un botón de llamada a la acción debajo de las stats:

```typescript
<Link to="/lp/calculadora-web">
  <button className="mt-12 px-8 py-4 bg-white text-black font-medium 
    tracking-wide hover:bg-white/90 transition-colors">
    Valorar Empresa
  </button>
</Link>
```

