
import React, { useMemo } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = React.memo<LoadingButtonProps>(({ 
  loading = false, 
  loadingText, 
  children, 
  disabled,
  className,
  ...props 
}) => {
  const isDisabled = disabled || loading;
  
  const buttonContent = useMemo(() => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'Cargando...'}
        </>
      );
    }
    return children;
  }, [loading, loadingText, children]);

  return (
    <Button
      disabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.children === nextProps.children &&
    prevProps.loadingText === nextProps.loadingText &&
    prevProps.className === nextProps.className
  );
});

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
