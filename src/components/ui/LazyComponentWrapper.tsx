import React, { Suspense } from 'react';
import { DynamicImportFallback } from './DynamicImportFallback';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  componentName?: string;
  loadingComponent?: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  showDebug?: boolean;
}

const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
  </div>
);

class LazyErrorBoundary extends React.Component<
  { 
    children: React.ReactNode;
    componentName?: string;
    fallbackComponent?: React.ReactNode;
    showDebug?: boolean;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponentWrapper caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <DynamicImportFallback
          error={this.state.error}
          componentName={this.props.componentName}
          onRetry={() => this.setState({ hasError: false, error: null })}
          showDebug={this.props.showDebug}
        />
      );
    }

    return this.props.children;
  }
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  componentName,
  loadingComponent = <DefaultLoading />,
  fallbackComponent,
  showDebug = false
}) => {
  return (
    <LazyErrorBoundary
      componentName={componentName}
      fallbackComponent={fallbackComponent}
      showDebug={showDebug}
    >
      <Suspense fallback={loadingComponent}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
};