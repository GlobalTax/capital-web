import React, { Suspense, lazy } from 'react';
import { LucideProps } from 'lucide-react';
import { dynamicIconImports, type IconName } from './icon-registry';

interface LazyIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

const IconFallback = ({ size = 24 }: { size?: number | string }) => (
  <div 
    className="animate-pulse bg-muted rounded"
    style={{ 
      width: typeof size === 'number' ? size : parseInt(String(size)) || 24, 
      height: typeof size === 'number' ? size : parseInt(String(size)) || 24 
    }}
  />
);

const LazyIcon: React.FC<LazyIconProps> = ({ name, ...props }) => {
  const IconComponent = lazy(dynamicIconImports[name]);

  return (
    <Suspense fallback={<IconFallback size={props.size} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

export default LazyIcon;