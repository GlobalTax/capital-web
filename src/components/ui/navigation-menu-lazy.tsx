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

// Simplified lazy load - fix TypeScript error
const NavigationMenuComponents = lazy(() => 
  import('./navigation-menu').then(module => ({ 
    default: module.NavigationMenu 
  }))
);

// Wrapper con Suspense para cada componente
export const NavigationMenu = React.forwardRef<any, any>((props, ref) => (
  <Suspense fallback={<NavigationMenuLoading />}>
    <NavigationMenuComponents {...props} ref={ref} />
  </Suspense>
));

// Simplified lazy component creation
const createLazyComponent = (componentName: string) => {
  const LazyComponent = lazy(() => 
    import('./navigation-menu').then(module => ({
      default: (module as any)[componentName]
    }))
  );

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

// Simplified style function
export const navigationMenuTriggerStyle = () => {
  return "inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";
};

NavigationMenu.displayName = "NavigationMenu";