
## Plan: Reorganizar menú "Recursos" con submenu "Search Funds | Recursos"

### Enfoque
Convertir el menú superior "Recursos" en un megamenú con dos columnas principales separadas por un divisor vertical: **Search Funds** (izquierda) y **Recursos** (derecha). Esto permite destacar ambas áreas sin añadir un nuevo botón al header.

### Diseño
```text
┌─────────────────────────────────────────────────────────────────┐
│  RECURSOS                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Search Funds ────────┐  │  ┌─ Recursos ────────────────┐  │
│  │                        │  │  │                            │  │
│  │  [Featured Card]       │  │  │  [Featured Card]           │  │
│  │  ¿Es tu empresa ideal  │  │  │  Calculadora Valoración    │  │
│  │  para un Search Fund?  │  │  │                            │  │
│  │                        │  │  │  Herramientas Gratuitas    │  │
│  │  Para Empresarios      │  │  │  - Calculadora             │  │
│  │  - Calculadora Fit     │  │  │  - Test Exit-Ready         │  │
│  │  - Valoración SF       │  │  │  - Calculadora Fiscal      │  │
│  │  - Negociación         │  │  │                            │  │
│  │                        │  │  │  Contenido                 │  │
│  │  Para Searchers        │  │  │  - Biblioteca Recursos     │  │
│  │  - Registro Searcher   │  │  │  - Informes M&A            │  │
│  │  - Guía Sourcing       │  │  │  - Noticias                │  │
│  │                        │  │  │  - Blog                    │  │
│  │  Aprende               │  │  │  - Case Studies            │  │
│  │  - Guía Completa       │  │  │  - Newsletter              │  │
│  │  - Glosario M&A        │  │  │  ...                       │  │
│  │  - Casos de Éxito      │  │  │                            │  │
│  │  - Centro de Recursos  │  │  │                            │  │
│  │                        │  │  │                            │  │
│  └────────────────────────┘  │  └────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cambios

1. **Eliminar menú "Search Funds"** del NavigationMenu principal (actualmente es un item separado)
2. **Crear `RecursosUnifiedMenu`** que combine:
   - Columna izquierda: contenido actual de `SearchFundsMenu`
   - Divisor vertical (`border-l`)
   - Columna derecha: contenido actual de `RecursosMenu`
3. **Actualizar ancho del dropdown** de 700px a ~900px para acomodar ambas columnas

### Archivos

- **Editar** `src/components/header/AdvancedDesktopNavigation.tsx`:
  - Eliminar NavigationMenuItem "Search Funds" (líneas 337-346)
  - Reemplazar `RecursosMenu` con `RecursosUnifiedMenu` que combine ambas áreas
  - Ajustar grid a `lg:grid-cols-[340px_1px_1fr]` (Search Funds | divisor | Recursos)

### Resultado
Un solo menú "Recursos" que presenta Search Funds como sección destacada a la izquierda y el contenido tradicional a la derecha, reduciendo la cantidad de items de nivel superior en el header.
