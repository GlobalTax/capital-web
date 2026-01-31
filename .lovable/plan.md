
# Plan: Crear Página de Prueba con Nuevo Diseño Estilo Portobello

## Estrategia Recomendada

Crearemos una **ruta de prueba aislada** (`/test/nuevo-diseno`) que no afectará las páginas de producción. Esto te permitirá:
- Ver los cambios en tiempo real
- Iterar sin riesgo
- Comparar lado a lado con la versión actual
- Decidir qué elementos adoptar

## Estructura del Prototipo

```text
src/pages/test/
├── NuevoDiseno.tsx          # Página principal de prueba
└── components/
    ├── DarkHeroSection.tsx   # Hero fullscreen estilo Portobello
    ├── StatsBar.tsx          # Barra de estadísticas horizontales
    └── MinimalHeader.tsx     # Header oscuro minimalista
```

## Elementos de Diseño a Implementar

### 1. Hero Section (Fullscreen)
Inspirado en Portobello Capital:
- Fondo oscuro (gris grafito / negro)
- Estadísticas grandes y prominentes: "€3.7bn | +25 años | 200+ operaciones"
- Título minimalista con tipografía ligera
- Sin imágenes de fondo distractoras

### 2. Header Minimalista
- Fondo transparente o oscuro
- Logo en blanco/gris claro
- Navegación espaciada con tipografía sans-serif
- Sin badges ni elementos decorativos

### 3. Sistema de Colores Oscuro

| Token | Valor | Uso |
|-------|-------|-----|
| `--dark-bg` | `#111111` | Fondo principal |
| `--dark-bg-elevated` | `#1a1a1a` | Cards y secciones |
| `--dark-text-primary` | `#ffffff` | Títulos |
| `--dark-text-secondary` | `#888888` | Subtítulos |
| `--dark-border` | `#333333` | Bordes sutiles |
| `--dark-accent` | `#c4a265` | Detalles dorados (opcional) |

### 4. Tipografía Institucional
- General Sans (ya tienes) - más ligera y espaciada
- Títulos grandes: `clamp(3rem, 8vw, 7rem)`
- Tracking más amplio en headers

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/pages/test/NuevoDiseno.tsx` | Página contenedora del prototipo |
| `src/pages/test/components/DarkHeroSection.tsx` | Hero fullscreen oscuro con stats |
| `src/pages/test/components/InstitutionalHeader.tsx` | Header minimalista estilo Portobello |
| `src/pages/test/components/TestLayout.tsx` | Layout específico para pruebas |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/core/routing/AppRoutes.tsx` | Añadir ruta `/test/nuevo-diseno` |
| `src/index.css` | Añadir tokens CSS para modo oscuro institucional |

## Ejemplo Visual del Hero

```text
┌─────────────────────────────────────────────────────────────────┐
│  Capittal                           Servicios   Casos   Contacto│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         €902M         200+          98,7%         10+           │
│      valor total   operaciones   tasa éxito   años exp         │
│                                                                 │
│                                                                 │
│                    VENDE TU EMPRESA                             │
│               CON EL MÁXIMO VALOR                               │
│                                                                 │
│         Asesoramos operaciones de M&A en el middle market       │
│                                                                 │
│                  [  Valorar empresa  ]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
       Fondo: #111111 | Texto: #ffffff | Stats: #888888
```

## Ruta de Acceso

Una vez implementado, podrás acceder a:
- **Preview**: `https://id-preview--c1cd2940-10b7-4c6d-900a-07b0f572e7b9.lovable.app/test/nuevo-diseno`

## Fases de Desarrollo

**Fase 1 (Este plan)**: Página de prueba con Hero + Header
**Fase 2**: Añadir más secciones (Services, Stats, Footer)
**Fase 3**: Refinar y decidir qué llevar a producción
**Fase 4**: Migrar gradualmente a la Home principal

## Ventajas de este Enfoque

- **Sin riesgo**: Las páginas actuales no se modifican
- **Iterativo**: Podemos ajustar hasta que estés satisfecho
- **Comparativo**: Puedes ver ambos diseños y decidir
- **Modular**: Los componentes nuevos pueden reutilizarse después

## Sección Técnica

### Estructura de Tokens CSS
Se añadirán a `index.css` dentro de un nuevo scope `.dark-institutional`:

```css
.dark-institutional {
  --background: 0 0% 7%;
  --foreground: 0 0% 100%;
  --card: 0 0% 10%;
  --card-foreground: 0 0% 100%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 53%;
  --border: 0 0% 20%;
  --accent-gold: 38 44% 58%;
}
```

### Lazy Loading
La página de prueba usará lazy loading para no afectar el bundle principal:

```typescript
const NuevoDiseno = lazy(() => import('@/pages/test/NuevoDiseno'));
```

### Ruta Protegida (Opcional)
Si prefieres que la página de prueba no sea pública, podemos añadir autenticación admin.
