import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { getShortcutsHelp } from '@/hooks/useGlobalShortcuts';

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const shortcuts = getShortcutsHelp();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-shortcuts-help', handleOpen);
    return () => window.removeEventListener('open-shortcuts-help', handleOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atajos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {Object.entries(shortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-foreground">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Presiona <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">⌘/Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">/</kbd> para abrir esta ayuda
        </p>
      </DialogContent>
    </Dialog>
  );
}
