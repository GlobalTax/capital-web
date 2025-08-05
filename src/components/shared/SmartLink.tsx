// ============= SMART LINK COMPONENT =============
// Link inteligente con preloading automático en hover

import React, { useRef, useEffect } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useRoutePreloader } from '@/hooks/useRoutePreloader';
import { useUserBehaviorTracking } from '@/hooks/useUserBehaviorTracking';

interface SmartLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  prefetchDelay?: number;
}

export const SmartLink: React.FC<SmartLinkProps> = ({
  to,
  children,
  preload = true,
  priority = 'medium',
  prefetchDelay,
  className,
  ...props
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const { preloadRoute, prefetchOnHover } = useRoutePreloader({
    prefetchDelay,
    enabled: preload
  });
  const { recordClickPattern } = useUserBehaviorTracking();

  // Configurar preloading en hover
  useEffect(() => {
    if (linkRef.current && preload) {
      const cleanup = prefetchOnHover(linkRef.current, to);
      return cleanup;
    }
  }, [to, preload, prefetchOnHover]);

  // Preloading inmediato para links de alta prioridad
  useEffect(() => {
    if (priority === 'high' && preload) {
      preloadRoute(to);
    }
  }, [to, priority, preload, preloadRoute]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Registrar patrón de click
    recordClickPattern(to);

    // Llamar handler original si existe
    if (props.onClick) {
      props.onClick(event);
    }
  };

  return (
    <Link
      ref={linkRef}
      to={to}
      className={className}
      {...props}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};