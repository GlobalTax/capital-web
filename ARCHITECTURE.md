# Arquitectura del Proyecto

## 📁 Estructura de Directorios

```
src/
├── components/           # Componentes principales de UI
│   └── admin/           # Componentes específicos del admin
├── features/            # Módulos de funcionalidades por dominio
│   ├── dashboard/       # Dashboard y métricas
│   └── lead-scoring/    # Sistema de puntuación de leads
├── shared/              # Código compartido entre features
│   ├── components/      # Componentes reutilizables
│   ├── services/        # Servicios compartidos
│   ├── hooks/          # Hooks reutilizables
│   └── utils/          # Utilidades compartidas
├── hooks/               # Hooks específicos del dominio
├── utils/               # Utilidades de propósito específico
└── integrations/        # Integraciones externas (Supabase, etc.)
```

## 🏗️ Principios Arquitectónicos

### 1. **Separación por Dominio (Features)**
- Cada feature es independiente y autodescriptiva
- Exports centralizados via `index.ts`
- Minimiza dependencias entre features

### 2. **Servicios Compartidos**
- **Performance Monitor**: Monitoreo de rendimiento centralizado
- **Cache Persistence**: Gestión inteligente de cache
- **Optimized Queries**: Configuraciones de React Query optimizadas

### 3. **Componentes Reutilizables**
- **ErrorFallback**: Manejo consistente de errores
- **LoadingSkeleton**: Estados de carga unificados
- **ConversionChart**: Gráficos optimizados con Recharts

## 🚀 Optimizaciones Implementadas

### Performance
- ✅ Memoización de componentes críticos
- ✅ Configuración inteligente de React Query
- ✅ Rate limiting para prevenir spam
- ✅ Debouncing en operaciones frecuentes
- ✅ Lazy loading preparado para implementar

### Cache Strategy
- ✅ Stale times optimizados por tipo de datos
- ✅ Persistencia en localStorage para datos críticos
- ✅ Invalidación inteligente de queries relacionadas
- ✅ Cleanup automático de cache expirado

### Error Handling
- ✅ Manejo centralizado de errores de RLS
- ✅ Retry logic inteligente para queries
- ✅ Logging estructurado en desarrollo
- ✅ Fallbacks graceful para usuarios sin permisos

## 📊 Configuraciones de Query

```typescript
// Datos críticos (30s stale time)
const hotLeads = useOptimizedQuery(['hotLeads'], fetchHotLeads, 'critical');

// Datos importantes (2min stale time)
const allLeads = useOptimizedQuery(['allLeads'], fetchAllLeads, 'important');

// Datos estáticos (10min stale time)
const rules = useOptimizedQuery(['rules'], fetchRules, 'static');

// Datos persistentes (1h stale time)
const config = useOptimizedQuery(['config'], fetchConfig, 'persistent');
```

## 🔄 Flujo de Datos

1. **Query**: Datos se obtienen con configuración optimizada
2. **Cache**: Se almacenan según el tipo de dato
3. **Performance**: Se monitorea tiempo de ejecución
4. **Invalidation**: Se invalidan queries relacionadas inteligentemente
5. **Persistence**: Datos críticos se persisten en localStorage

## 🛠️ Herramientas de Desarrollo

- **Performance Dashboard**: Monitoreo en tiempo real
- **Dev Logger**: Logging estructurado solo en desarrollo
- **Cache Inspector**: Herramientas de depuración de cache

## 📈 Próximas Mejoras

- [ ] Implementar lazy loading completo
- [ ] Añadir error boundaries
- [ ] Mejorar tipos TypeScript
- [ ] Documentación JSDoc completa
- [ ] Tests unitarios para servicios críticos

## 🎯 Principios de Mantenimiento

1. **Single Responsibility**: Cada módulo tiene una responsabilidad clara
2. **Dependency Injection**: Servicios son inyectables y testeable
3. **Immutability**: Estados se manejan de forma inmutable
4. **Performance First**: Optimizaciones son prioritarias
5. **Developer Experience**: Herramientas que facilitan el desarrollo