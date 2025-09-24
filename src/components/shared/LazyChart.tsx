import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load recharts components to avoid initialization issues
const ResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);

const BarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);

const LineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);

const PieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);

// Chart loading fallback
const ChartLoadingFallback = ({ height = 300 }: { height?: number }) => (
  <Card className="p-4">
    <Skeleton className="w-full mb-4 h-6" />
    <Skeleton className="w-full" style={{ height: `${height}px` }} />
  </Card>
);

// Error boundary for chart components
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Chart component error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">Error cargando gráfico</p>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Optimized chart wrappers
interface LazyChartProps {
  children: React.ReactNode;
  height?: number;
  fallback?: React.ReactNode;
}

export const LazyResponsiveContainer: React.FC<LazyChartProps> = ({ 
  children, 
  height = 300,
  fallback 
}) => (
  <ChartErrorBoundary fallback={fallback}>
    <Suspense fallback={<ChartLoadingFallback height={height} />}>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </Suspense>
  </ChartErrorBoundary>
);

export const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);

export const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);

export const LazyPieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);

// Re-export common recharts components with lazy loading
export const LazyBar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);

export const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);

export const LazyPie = lazy(() => 
  import('recharts').then(module => ({ default: module.Pie }))
);

export const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);

export const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);

export const LazyCartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);

export const LazyTooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);

export const LazyCell = lazy(() => 
  import('recharts').then(module => ({ default: module.Cell }))
);

export { ChartErrorBoundary, ChartLoadingFallback };