import React, { Suspense, lazy, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de loading para el NavigationMenu
const NavigationMenuLoading = () => (
  <div className="flex h-10 items-center space-x-1">
    <Skeleton className="h-10 w-20" />
    <Skeleton className="h-10 w-20" />
    <Skeleton className="h-10 w-20" />
    <Skeleton className="h-10 w-20" />
  </div>
);

// Lazy load del NavigationMenu original
const NavigationMenuComponents = lazy(async () => {
  // Asegurar que cva esté completamente cargado antes de importar
  await import('class-variance-authority');
  // Pequeña pausa para asegurar inicialización completa
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const components = await import('./navigation-menu');
  return {
    default: components.NavigationMenu,
    ...components
  };
});

// Wrapper con Suspense para cada componente
export const NavigationMenu = React.forwardRef<any, any>((props, ref) => (
  <Suspense fallback={<NavigationMenuLoading />}>
    <NavigationMenuComponents {...props} ref={ref} />
  </Suspense>
));

// Crear lazy wrappers para cada componente exportado
const createLazyComponent = (componentName: string) => {
  const LazyComponent = lazy(async () => {
    await import('class-variance-authority');
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const components = await import('./navigation-menu');
    return {
      default: (components as any)[componentName]
    };
  });

  return React.forwardRef((props: any, ref: any) => (
    <Suspense fallback={<Skeleton className="h-4 w-16" />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

export const NavigationMenuList = createLazyComponent('NavigationMenuList');
export const NavigationMenuItem = createLazyComponent('NavigationMenuItem');
export const NavigationMenuContent = createLazyComponent('NavigationMenuContent');
export const NavigationMenuTrigger = createLazyComponent('NavigationMenuTrigger');
export const NavigationMenuLink = createLazyComponent('NavigationMenuLink');
export const NavigationMenuIndicator = createLazyComponent('NavigationMenuIndicator');
export const NavigationMenuViewport = createLazyComponent('NavigationMenuViewport');

// Lazy wrapper para navigationMenuTriggerStyle
export const navigationMenuTriggerStyle = () => {
  try {
    const { navigationMenuTriggerStyle: originalStyle } = require('./navigation-menu');
    return originalStyle;
  } catch (error) {
    console.warn('Fallback to basic navigation menu styles:', error);
    return () => "inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium";
  }
};

NavigationMenu.displayName = "NavigationMenu";