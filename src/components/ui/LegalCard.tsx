
import React from 'react';
import { cn } from '@/lib/utils';

interface LegalCardProps {
  children: React.ReactNode;
  className?: string;
}

const LegalCard = ({ children, className }: LegalCardProps) => {
  return (
    <div className={cn('card-base', className)}>
      {children}
    </div>
  );
};

export default LegalCard;
