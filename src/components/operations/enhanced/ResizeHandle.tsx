import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    let currentDelta = 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      if (delta !== currentDelta) {
        onResize(delta - currentDelta);
        currentDelta = delta;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group-hover:bg-primary/20 transition-colors flex items-center justify-center ${
        isDragging ? 'bg-primary/40' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
