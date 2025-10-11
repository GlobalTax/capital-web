// ============= ADMIN ERROR BOUNDARY =============
// Error boundary específico para el panel administrativo

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Admin Error Boundary caught error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      location: window.location.href
    });

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Error en Panel Admin
                </h2>
                <p className="text-muted-foreground">
                  Ha ocurrido un error inesperado. El equipo técnico ha sido notificado.
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="w-full text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Detalles del error (solo visible en desarrollo)
                  </summary>
                  <div className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-48">
                    <div className="font-mono">
                      <div className="text-destructive font-bold mb-2">
                        {this.state.error.message}
                      </div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {this.state.error.stack}
                      </div>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Intentar de nuevo
                </Button>
                <Button
                  onClick={() => window.location.href = '/admin'}
                  variant="default"
                >
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
