// ============= CONTACTS ERROR BOUNDARY =============
// Error boundary específico para gestión de contactos

import React, { Component, ReactNode } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ContactsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Contacts Error:', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 m-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <Users className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Error al cargar contactos</h3>
              <p className="text-sm text-muted-foreground">
                No se pudieron cargar los contactos. Por favor, inténtalo de nuevo.
              </p>
            </div>
            <Button onClick={this.handleReset} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
