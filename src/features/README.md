# Features Directory

Módulos de negocio organizados por dominio siguiendo arquitectura modular.

## 📂 Estructura General

Cada feature sigue la misma estructura consistente:

```
feature-name/
├── components/         # Componentes UI específicos del feature
├── hooks/             # Custom hooks del feature
├── services/          # Lógica de negocio y API calls (opcional)
├── utils/             # Utilidades específicas (opcional)
├── types/             # Definiciones TypeScript
├── validation/        # Schemas de validación Zod
├── index.ts           # Barrel export para imports limpios
└── README.md          # Documentación detallada
```

## 🎯 Features Disponibles

### [Admin](./admin/README.md) 
Sistema completo de panel administrativo
- **Componentes**: Dashboard, Router, Layout, Error Boundary
- **Hooks**: `useAdminAuth`, `useAdminNavigation`
- **Lazy Loading**: Todos los componentes pesados
- **Rutas**: `/admin/*`

```typescript
import { useAdminAuth, AdminRouter } from '@/features/admin';
```

### [Blog](./blog/README.md)
Gestión completa de contenido del blog
- **Componentes**: Editor, Sidebar, Error Boundary
- **Hooks**: `useBlogForm`, `useBlogValidation`
- **Validación**: Schemas Zod para posts, categorías, tags
- **SEO**: Meta tags optimizados

```typescript
import { useBlogForm, blogPostSchema } from '@/features/blog';
```

### [Contacts](./contacts/README.md)
Sistema de gestión de contactos y leads
- **Componentes**: Stats Cards, Tabs, Error Boundary
- **Hooks**: `useContactActions`, `useContactSelection`
- **Validación**: Schemas para updates, filtros, acciones
- **Bulk Actions**: Actualización y eliminación masiva

```typescript
import { useContactActions, type Contact } from '@/features/contacts';
```

### [Jobs](./jobs/README.md)
Plataforma de ofertas de empleo
- **Componentes**: Editor completo, Preview, Error Boundary
- **Hooks**: `useJobForm`, `useJobListManagement`
- **Validación**: Schemas para posts, aplicaciones, categorías
- **Templates**: Sistema de plantillas reutilizables

```typescript
import { useJobForm, jobPostSchema } from '@/features/jobs';
```

### [Valuation](./valuation/README.md)
Sistema unificado de valoración de empresas
- **Componentes**: UnifiedCalculator
- **Hooks**: `useUnifiedCalculator`
- **Services**: DataAccessService para persistencia
- **Validación**: Schemas para company data y tax data

```typescript
import { useUnifiedCalculator, type CompanyData } from '@/features/valuation';
```

## 🎨 Principios de Diseño

### 1. Barrel Exports
Cada feature exporta su API pública a través de `index.ts`:

```typescript
// ❌ NO: Imports directos internos
import { BlogEditorContent } from '@/features/blog/components/BlogEditorContent';

// ✅ SÍ: Usar barrel exports
import { BlogEditorContent } from '@/features/blog';
```

### 2. Tipos TypeScript Estrictos
Sin `any` types, todo tipado con interfaces y types:

```typescript
// Todos los features exportan sus tipos
import type { AdminUser, BlogPost, Contact, JobPost, CompanyData } from '@/features/[feature]';
```

### 3. Validación Zod
Validación declarativa con Zod en cada feature:

```typescript
import { blogPostSchema, contactUpdateSchema, jobPostSchema } from '@/features/[feature]';

// Validación automática
const validated = blogPostSchema.parse(data);
```

### 4. Error Boundaries
Cada feature tiene su propio error boundary:

```typescript
import { AdminErrorBoundary, BlogErrorBoundary, ContactsErrorBoundary } from '@/features/[feature]';
```

### 5. Lazy Loading
Componentes pesados con lazy loading optimizado:

```typescript
// En admin/components/LazyAdminComponents.tsx
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'));
```

## 🚀 Cómo Crear un Nuevo Feature

### 1. Crear la estructura base

```bash
features/
└── my-feature/
    ├── components/
    │   └── index.ts
    ├── hooks/
    │   └── index.ts
    ├── types/
    │   └── index.ts
    ├── validation/
    │   └── schemas.ts
    ├── index.ts
    └── README.md
```

### 2. Definir tipos en `types/index.ts`

```typescript
export interface MyFeatureData {
  id: string;
  name: string;
  // ...otros campos
}

export type MyFeatureStatus = 'active' | 'inactive';
```

### 3. Crear schemas de validación en `validation/schemas.ts`

```typescript
import { z } from 'zod';

export const myFeatureSchema = z.object({
  name: z.string().min(2),
  status: z.enum(['active', 'inactive']),
});

export type MyFeatureFormData = z.infer<typeof myFeatureSchema>;
```

### 4. Implementar hooks en `hooks/`

```typescript
export const useMyFeature = () => {
  // Lógica del hook
  return {
    data,
    isLoading,
    error,
    actions
  };
};
```

### 5. Crear componentes en `components/`

```typescript
export const MyFeatureComponent: React.FC = () => {
  const { data, isLoading } = useMyFeature();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* UI */}</div>;
};
```

### 6. Configurar barrel export en `index.ts`

```typescript
// Hooks
export * from './hooks/useMyFeature';

// Components
export { MyFeatureComponent } from './components/MyFeatureComponent';

// Types
export type { MyFeatureData, MyFeatureStatus } from './types';

// Validation
export { myFeatureSchema } from './validation/schemas';
export type { MyFeatureFormData } from './validation/schemas';
```

### 7. Documentar en `README.md`

Seguir la plantilla de los features existentes con:
- Estructura del feature
- Uso rápido
- Ejemplos de código
- Tipos disponibles
- Validación
- Mejores prácticas
- Debugging

## 🛡️ Mejores Prácticas Generales

### Imports
```typescript
// ✅ Usar imports de feature completos
import { useAdminAuth, type AdminUser } from '@/features/admin';

// ❌ No acceder a internos
import { AdminUser } from '@/features/admin/types';
```

### Naming
```typescript
// Componentes: PascalCase
MyFeatureComponent.tsx

// Hooks: camelCase con prefijo 'use'
useMyFeature.ts

// Types: PascalCase
MyFeatureData

// Constantes: UPPER_SNAKE_CASE
MY_FEATURE_CONSTANT
```

### Organización
```typescript
// Agrupar imports por feature
import { 
  useAdminAuth, 
  type AdminUser 
} from '@/features/admin';

import { 
  useBlogForm, 
  type BlogPost 
} from '@/features/blog';
```

### Error Handling
```typescript
// Siempre usar error boundaries
<MyFeatureErrorBoundary>
  <MyFeatureContent />
</MyFeatureErrorBoundary>

// Try-catch en operaciones async
try {
  await myFeatureAction();
} catch (error) {
  handleError(error);
}
```

### Validación
```typescript
// Validar antes de enviar
try {
  const validated = myFeatureSchema.parse(data);
  await submitData(validated);
} catch (error) {
  if (error instanceof z.ZodError) {
    showValidationErrors(error.errors);
  }
}
```

## 📊 Diagrama de Dependencias

```
App
├── Admin Feature
│   ├── Dashboard
│   ├── Router
│   └── Auth
├── Blog Feature
│   ├── Editor
│   ├── Validation
│   └── Posts Manager
├── Contacts Feature
│   ├── List
│   ├── Actions
│   └── Filters
├── Jobs Feature
│   ├── Editor
│   ├── Applications
│   └── Templates
└── Valuation Feature
    ├── Calculator
    ├── Validation
    └── Results
```

## 🔗 Referencias

- [Admin Feature](./admin/README.md)
- [Blog Feature](./blog/README.md)
- [Contacts Feature](./contacts/README.md)
- [Jobs Feature](./jobs/README.md)
- [Valuation Feature](./valuation/README.md)

## 📚 Recursos Adicionales

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [React Query Docs](https://tanstack.com/query)
- [React Router v6](https://reactrouter.com/)
