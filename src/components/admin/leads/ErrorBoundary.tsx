import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class LeadScoringErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Lead Scoring Error Boundary caught error', error, {
      context: 'system',
      component: 'LeadScoringErrorBoundary',
      data: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.fallbackTitle || 'LeadScoring'
      }
    });

    this.setState({
      error,
      errorInfo
    });

    // Notify team in production
    if (import.meta.env.MODE === 'production') {
      // Integration with error reporting service would go here
      console.error('Critical Lead Scoring Error - Team notification triggered');
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {this.props.fallbackTitle || 'Error en Lead Scoring'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              Se ha producido un error inesperado. El equipo ha sido notificado automáticamente.
            </p>
            
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="bg-red-100 p-3 rounded border">
                <summary className="font-medium cursor-pointer">Detalles del error (solo desarrollo)</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="destructive"
                size="sm"
              >
                Recargar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default LeadScoringErrorBoundary;