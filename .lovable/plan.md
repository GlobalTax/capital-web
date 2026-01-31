

# Plan: Sección de Casos de Éxito para el Nuevo Diseño

## Objetivo

Crear una sección de "Casos de éxito" que se integre con el diseño oscuro institucional estilo Portobello, usando los datos reales de la base de datos.

## Diseño Visual

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          bg-[hsl(0,0%,5%)]                                  │
│                                                                             │
│  CASOS DE ÉXITO                                                             │
│                                                                             │
│  Operaciones que hablan                                                     │
│  por sí mismas                                                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  [Logo]         │  │  [Logo]         │  │  [Logo]         │              │
│  │                 │  │                 │  │                 │              │
│  │  Sector • 2024  │  │  Sector • 2024  │  │  Sector • 2024  │              │
│  │                 │  │                 │  │                 │              │
│  │  Título del     │  │  Título del     │  │  Título del     │              │
│  │  caso de éxito  │  │  caso de éxito  │  │  caso de éxito  │              │
│  │                 │  │                 │  │                 │              │
│  │  Descripción... │  │  Descripción... │  │  Descripción... │              │
│  │                 │  │                 │  │                 │              │
│  │  €12M           │  │  Confidencial   │  │  €8M            │              │
│  │  ────────────── │  │  ────────────── │  │  ────────────── │              │
│  │  Ver caso →     │  │  Ver caso →     │  │  Ver caso →     │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Más de 200 operaciones cerradas           [ Ver todos los casos ]         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Características

| Elemento | Descripción |
|----------|-------------|
| **Fondo** | Oscuro `bg-[hsl(0,0%,5%)]` consistente |
| **Tipografía** | Serif display para títulos |
| **Cards** | Fondo ligeramente más claro con hover effect |
| **Datos** | Cargados desde Supabase via `useCaseStudies` |
| **Logos** | Prominentes en la parte superior de cada card |
| **Valor** | Mostrar monto o "Confidencial" con icono |
| **Animaciones** | Scroll-triggered con Framer Motion |

## Archivo a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/pages/test/components/CaseStudiesSection.tsx` | Sección de casos con estilo oscuro institucional |

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/test/NuevoDiseno.tsx` | Reemplazar placeholder con nuevo componente |

## Estructura del Componente

```typescript
// CaseStudiesSection.tsx
import { useCaseStudies } from '@/hooks/useCaseStudies';
import { motion } from 'framer-motion';

const CaseStudiesSection = () => {
  const { caseStudies, isLoading } = useCaseStudies();
  
  // Mostrar solo 3 casos destacados
  const featuredCases = caseStudies
    .filter(c => c.is_featured)
    .slice(0, 3);
  
  return (
    <section className="py-24 md:py-32 bg-[hsl(0,0%,5%)]">
      {/* Header */}
      <motion.div>
        <span className="text-white/40 uppercase tracking-widest">
          Casos de éxito
        </span>
        <h2 className="font-serif-display text-white text-5xl">
          Operaciones que hablan
          <br />
          <span className="text-white/60">por sí mismas</span>
        </h2>
      </motion.div>
      
      {/* Grid de casos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredCases.map(case_ => (
          <CaseCard key={case_.id} {...case_} />
        ))}
      </div>
      
      {/* CTA */}
      <div className="border-t border-white/10 pt-12 mt-16">
        <Link to="/casos-exito">Ver todos los casos</Link>
      </div>
    </section>
  );
};
```

## Diseño de la Card

Cada card de caso de éxito tendrá:

1. **Logo** - Imagen del cliente en la parte superior
2. **Badge** - Sector y año en etiqueta sutil
3. **Título** - En serif display
4. **Descripción** - Texto condensado (2-3 líneas)
5. **Valor** - Monto de la operación o "Confidencial"
6. **Hover** - Fondo más claro + "Ver caso →"

## Estados de Carga

El componente manejará:
- **Loading**: Skeleton con pulse animation
- **Empty**: Mensaje elegante "Próximamente"
- **Error**: Fallback graceful sin romper el diseño

## Sección Técnica

### Estilos CSS

```css
/* Card base */
.case-card {
  background: hsl(0, 0%, 7%);
  transition: background 0.3s ease;
}

.case-card:hover {
  background: hsl(0, 0%, 10%);
}

/* Valor confidencial */
.value-confidential {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
}
```

### Animaciones

```typescript
// Stagger animation para las cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};
```

### Integración con NuevoDiseno.tsx

```typescript
import CaseStudiesSection from './components/CaseStudiesSection';

const NuevoDiseno = () => {
  return (
    <TestLayout>
      <InstitutionalHeader />
      <DarkHeroSection />
      <ServicesSection />
      <CaseStudiesSection /> {/* Nuevo */}
      <Footer />
    </TestLayout>
  );
};
```

