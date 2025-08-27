import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error del Sistema</h2>
        <p className="text-gray-600">Ha ocurrido un error inesperado. El sistema ha sido notificado.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar Página
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryProvider;