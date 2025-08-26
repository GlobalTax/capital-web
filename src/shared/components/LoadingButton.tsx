// ============= LOADING BUTTON COMPONENT =============
// Button with loading state and consistent styling

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const LoadingButton = ({
  loading = false,
  loadingText = 'Cargando...',
  children,
  disabled,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn("relative", className)}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading ? loadingText : children}
    </Button>
  );
};