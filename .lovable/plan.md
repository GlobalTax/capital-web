
# Corrección de Tipografía en Componentes Institucionales

## Problema Identificado

Los nuevos componentes del rediseño institucional están usando la clase `font-serif-display` que **no existe** en la configuración de Tailwind. Esto causa que los títulos fallen silenciosamente al font por defecto.

## Configuración Actual del Proyecto

```typescript
// tailwind.config.ts
fontFamily: {
  'sans': ['General Sans', ...],      // ✓ Para cuerpo de texto
  'serif': ['Playfair Display', ...], // ✓ Para títulos elegantes
  'mono': ['Roboto Mono', ...],       // Para código
}
```

## Cambios a Realizar

### 1. HeroSliderSection.tsx
- Línea con `font-serif-display` → `font-serif`
- Afecta: Título principal del hero

### 2. AboutSection.tsx
- Línea con `font-serif-display` → `font-serif`
- Afecta: Título "LA FIRMA"

### 3. TeamSection.tsx
- Línea con `font-serif-display` → `font-serif`
- Afecta: Título "NUESTRO EQUIPO"

### 4. ServicesSectionWithImages.tsx
- Línea con `font-serif-display` → `font-serif`
- Afecta: Título "NUESTROS SERVICIOS"

### 5. InstitutionalFooter.tsx
- Línea con `font-serif-display` → `font-serif`
- Afecta: Título "ÚLTIMAS NOTICIAS"

## Resultado Esperado

| Elemento | Antes | Después |
|----------|-------|---------|
| Títulos H1/H2 | Font por defecto (fallback) | Playfair Display (serif elegante) |
| Cuerpo texto | General Sans | General Sans (sin cambios) |

## Impacto Visual

Los títulos pasarán de una tipografía sans-serif genérica a **Playfair Display**, una tipografía serif elegante que aportará el toque institucional y premium que buscan las referencias (Ethos Venture, Miura Partners).
