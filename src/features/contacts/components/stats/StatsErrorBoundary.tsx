// ============= STATS ERROR BOUNDARY =============
// Error boundary para aislar fallos por sección en Estadísticas

import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  section: string;
  fallbackClassName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class StatsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[StatsErrorBoundary] Error en "${this.props.section}":`, error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className={this.props.fallbackClassName}>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  No se pudo cargar: {this.props.section}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ha ocurrido un error al cargar esta sección. El resto de la página debería funcionar correctamente.
                </p>
                {this.state.error?.message && (
                  <p className="text-xs text-muted-foreground/70 font-mono bg-muted/50 p-2 rounded max-w-md mx-auto">
                    {this.state.error.message.slice(0, 150)}
                  </p>
                )}
              </div>
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Wrapper funcional para uso más limpio
export const withStatsErrorBoundary = (
  WrappedComponent: React.ComponentType<any>,
  section: string
) => {
  return function WithErrorBoundary(props: any) {
    return (
      <StatsErrorBoundary section={section}>
        <WrappedComponent {...props} />
      </StatsErrorBoundary>
    );
  };
};
