
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
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderizar la UI de error por defecto
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Ups! Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Se ha producido un error inesperado en la aplicación. 
              Nuestro equipo ha sido notificado automáticamente.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Detalles del Error (Solo en desarrollo):</h3>
                <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
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
            
            <p className="text-xs text-gray-500 mt-6">
              ID del Error: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
