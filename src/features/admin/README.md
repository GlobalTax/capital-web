# Admin Feature Module

Sistema completo de administración con dashboard, gestión de usuarios, y control de contenido.

## 📁 Estructura

```
admin/
├── components/          # Componentes UI del admin
│   ├── AdminDashboard.tsx
│   ├── AdminRouter.tsx
│   ├── AdminLayout.tsx
│   ├── AdminErrorBoundary.tsx
│   └── LazyAdminComponents.tsx
├── hooks/              # Hooks del admin
│   ├── useAdminAuth.ts
│   └── useAdminNavigation.ts
└── types/              # Definiciones TypeScript
    └── index.ts
```

## 🚀 Uso Rápido

### Configurar Routing Admin

```typescript
import { AdminRouter } from '@/features/admin';

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRouter />} />
    </Routes>
  );
}
```

### Hook de Autenticación Admin

```typescript
import { useAdminAuth } from '@/features/admin';

function MyAdminComponent() {
  const { adminUser, isAdmin, isLoading, signOut } = useAdminAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAdmin) return <div>Acceso denegado</div>;

  return (
    <div>
      <h1>Bienvenido {adminUser?.email}</h1>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  );
}
```

### Navegación Programática

```typescript
import { useAdminNavigation } from '@/features/admin';

function AdminMenu() {
  const { goToSection, isActiveSection, goToDashboard } = useAdminNavigation();

  return (
    <nav>
      <button 
        onClick={() => goToSection('blog-v2')}
        className={isActiveSection('blog-v2') ? 'active' : ''}
      >
        Blog
      </button>
      <button onClick={goToDashboard}>
        Dashboard
      </button>
    </nav>
  );
}
```

## 🎯 Componentes Principales

### AdminErrorBoundary

Error boundary específico para el panel admin con fallback UI profesional.

```typescript
import { AdminErrorBoundary } from '@/features/admin';

function AdminApp() {
  return (
    <AdminErrorBoundary>
      <YourAdminContent />
    </AdminErrorBoundary>
  );
}
```

### Lazy Loading de Componentes

Todos los componentes pesados usan lazy loading automático:

```typescript
import { 
  LazyAdminDashboard,
  LazyModernBlogManager,
  LazyContactsPage 
} from '@/features/admin';

// Se cargan solo cuando se necesitan
<Route path="/dashboard" element={<LazyAdminDashboard />} />
```

## 📊 Tipos TypeScript

```typescript
import type { 
  AdminUser, 
  AdminStats, 
  AdminActivity,
  AdminPermission 
} from '@/features/admin';

const user: AdminUser = {
  id: '123',
  email: 'admin@example.com',
  role: 'admin',
  permissions: ['manage_content', 'view_analytics'],
  created_at: '2024-01-01T00:00:00Z'
};
```

## 🔐 Permisos

```typescript
type AdminPermission = 
  | 'manage_users'
  | 'manage_content'
  | 'manage_valuations'
  | 'manage_contacts'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_blog'
  | 'manage_jobs';
```

## 🎨 Layout Admin

```typescript
import { AdminLayout } from '@/features/admin';

function MyAdminPage() {
  return (
    <AdminLayout>
      <h1>Mi Página Admin</h1>
      {/* Contenido aquí */}
    </AdminLayout>
  );
}
```

## 📈 Dashboard Metrics

```typescript
import type { AdminDashboardMetrics } from '@/features/admin';

const metrics: AdminDashboardMetrics = {
  totalLeads: 150,
  qualifiedLeads: 45,
  totalRevenue: 125000,
  identifiedCompanies: 75,
  leadConversionRate: 30,
  totalVisitors: 5000,
  averageLeadScore: 7.5,
  leadScoring: {
    hotLeads: 12
  }
};
```

## 🛡️ Mejores Prácticas

1. **Siempre usar `useAdminAuth`** antes de renderizar contenido admin
2. **Lazy loading** para componentes pesados
3. **Error boundaries** alrededor de secciones críticas
4. **Validar permisos** antes de acciones sensibles
5. **Logs estructurados** para auditoría

## 🔄 Rutas Admin Disponibles

- `/admin` - Dashboard principal
- `/admin/contacts` - Gestión de contactos
- `/admin/blog-v2` - Gestor de blog
- `/admin/jobs` - Ofertas de empleo
- `/admin/settings` - Configuración
- `/admin/analytics` - Métricas y análisis

## 🐛 Debugging

```typescript
// Activar modo debug en desarrollo
if (import.meta.env.DEV) {
  console.log('Admin User:', adminUser);
  console.log('Permissions:', adminUser?.permissions);
}
```
