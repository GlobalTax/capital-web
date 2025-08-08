import React, { Suspense, lazy } from 'react';
import type { IconName } from './icon-registry';
import type { LucideProps } from 'lucide-react';

interface LazyIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

const IconFallback = ({ size = 24 }: { size?: number | string }) => (
  <div 
    className="animate-pulse bg-muted rounded"
    style={{ width: typeof size === 'number' ? size : parseInt(String(size)) || 24, height: typeof size === 'number' ? size : parseInt(String(size)) || 24 }}
  />
);

const LazyIcon: React.FC<LazyIconProps> = ({ name, ...props }) => {
  const IconComponent = lazy(async () => {
    try {
      const { getIcon } = await import('./icon-registry');
      const Icon = await getIcon(name);
      return { default: Icon };
    } catch (error) {
      console.warn(`Failed to load icon: ${name}`, error);
      // Fallback to Circle icon
      const { Circle } = await import('lucide-react');
      return { default: Circle };
    }
  });

  return (
    <Suspense fallback={<IconFallback size={props.size} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

export default LazyIcon;