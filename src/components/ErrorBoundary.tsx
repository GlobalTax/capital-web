
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface CustomErrorInfo extends ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  eventId?: string;
}

class ErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: CustomErrorInfo) {
    console.error('Error Boundary capturó un error:', error);
    console.error('Información del error:', errorInfo);
    
    // Actualizar el estado con la información del error
    this.setState({ errorInfo });
    
    // Llamar al callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Aquí se podría integrar con servicios de logging como Sentry
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorType = (error: Error | null) => {
    if (!error) return 'unknown';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('chunk') || message.includes('loading')) return 'loading';
    if (message.includes('permission') || message.includes('unauthorized')) return 'permission';
    return 'application';
  };

  getErrorTitle = (errorType: string) => {
    switch (errorType) {
      case 'network':
        return 'Problema de Conexión';
      case 'loading':
        return 'Error de Carga';
      case 'permission':
        return 'Sin Permisos';
      default:
        return '¡Ups! Algo salió mal';
    }
  };

  getErrorDescription = (errorType: string) => {
    switch (errorType) {
      case 'network':
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.';
      case 'loading':
        return 'Hubo un problema al cargar algunos recursos. Esto puede deberse a una conexión lenta.';
      case 'permission':
        return 'No tienes los permisos necesarios para acceder a esta sección.';
      default:
        return 'Se ha producido un error inesperado en la aplicación. Nuestro equipo ha sido notificado automáticamente.';
    }
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Detectar tipo de error para mostrar fallback específico
      const errorType = this.getErrorType(this.state.error);
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg border p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {this.getErrorTitle(errorType)}
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {this.getErrorDescription(errorType)}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-muted border rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-foreground mb-2">Detalles del Error (Solo en desarrollo):</h3>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <div className="mt-2">
                      <strong>Stack:</strong>
                      <br />
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </div>
                  )}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </Button>
              
              <Button 
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-6">
              ID del Error: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
