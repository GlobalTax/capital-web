import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BannerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-14 animate-pulse" role="presentation" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    </div>
  );
};

export default React.memo(BannerSkeleton);