# Dashboard Feature 🎨

Sistema modular de dashboard personalizable con widgets dinámicos.

## Componentes

- **PersonalizableDashboard**: Dashboard principal con drag & drop
- **WidgetFactory**: Factory para renderizar widgets por tipo
- **WidgetSelector**: Selector de widgets con templates
- **ActivityTimeline**: Timeline de actividad reciente
- **ConversionChart**: Gráfico de conversión
- **DashboardErrorBoundary**: Error boundary específico

## Widgets Disponibles

- **KPIWidget**: Indicadores clave de rendimiento
- **ChartWidget**: Gráficos (line, bar, area)
- **TableWidget**: Tablas de datos
- **TextWidget**: Contenido de texto/Markdown
- **AlertWidget**: Alertas y notificaciones

## Uso

```typescript
import { PersonalizableDashboard, usePersonalizedDashboard } from '@/features/dashboard';

function MyDashboard() {
  return <PersonalizableDashboard />;
}

// Hook personalizado
function MyCustomDashboard() {
  const { layouts, saveLayout, deleteLayout } = usePersonalizedDashboard();
  // ...
}
```

## Validación

```typescript
import { widgetConfigSchema, dashboardLayoutSchema } from '@/features/dashboard';

const widget = widgetConfigSchema.parse(data);
```
