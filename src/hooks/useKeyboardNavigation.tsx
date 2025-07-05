import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onShiftTab,
  enabled = true,
  preventDefault = true
}: KeyboardNavigationOptions) => {

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          onEnter();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          onArrowRight();
        }
        break;
      case 'Tab':
        if (event.shiftKey && onShiftTab) {
          if (preventDefault) event.preventDefault();
          onShiftTab();
        } else if (!event.shiftKey && onTab) {
          if (preventDefault) event.preventDefault();
          onTab();
        }
        break;
    }
  }, [
    enabled, onEscape, onEnter, onArrowUp, onArrowDown, 
    onArrowLeft, onArrowRight, onTab, onShiftTab, preventDefault
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

// Hook específico para navegación en listas
export const useListNavigation = (
  items: any[], 
  selectedIndex: number, 
  onSelect: (index: number) => void,
  onConfirm?: (index: number) => void
) => {
  useKeyboardNavigation({
    onArrowUp: () => {
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
      onSelect(newIndex);
    },
    onArrowDown: () => {
      const newIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
      onSelect(newIndex);
    },
    onEnter: () => {
      if (onConfirm && selectedIndex >= 0) {
        onConfirm(selectedIndex);
      }
    }
  });
};

export default useKeyboardNavigation;