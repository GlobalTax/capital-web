
import React, { useState, useEffect } from 'react';
import { Settings, Plus, Minus, RotateCcw, Eye, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
}

const AccessibilityTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  // Save settings to localStorage and apply them
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('accessibility-settings', JSON.stringify(updated));
    applySettings(updated);
  };

  // Apply settings to the DOM
  const applySettings = (settingsToApply: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settingsToApply.fontSize}%`;
    
    // High contrast
    if (settingsToApply.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Dark mode
    if (settingsToApply.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Reduced motion
    if (settingsToApply.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const increaseFontSize = () => {
    const newSize = Math.min(settings.fontSize + 10, 150);
    updateSettings({ fontSize: newSize });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(settings.fontSize - 10, 80);
    updateSettings({ fontSize: newSize });
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      highContrast: false,
      darkMode: false,
      reducedMotion: false,
    };
    updateSettings(defaultSettings);
  };

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast });
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const toggleReducedMotion = () => {
    updateSettings({ reducedMotion: !settings.reducedMotion });
  };

  return (
    <>
      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
        size="sm"
        aria-label="Abrir herramientas de accesibilidad"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80">
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Herramientas de Accesibilidad
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Font Size Controls */}
              <div>
                <h3 className="font-medium mb-2">Tamaño de Texto</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    disabled={settings.fontSize <= 80}
                    aria-label="Disminuir tamaño de texto"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-16 text-center">
                    {settings.fontSize}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    disabled={settings.fontSize >= 150}
                    aria-label="Aumentar tamaño de texto"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Visual Controls */}
              <div className="space-y-3">
                <h3 className="font-medium">Controles Visuales</h3>
                
                <Button
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={toggleHighContrast}
                  className="w-full justify-start"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Alto Contraste
                </Button>

                <Button
                  variant={settings.darkMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleDarkMode}
                  className="w-full justify-start"
                >
                  {settings.darkMode ? (
                    <Sun className="h-4 w-4 mr-2" />
                  ) : (
                    <Moon className="h-4 w-4 mr-2" />
                  )}
                  {settings.darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                </Button>

                <Button
                  variant={settings.reducedMotion ? "default" : "outline"}
                  size="sm"
                  onClick={toggleReducedMotion}
                  className="w-full justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reducir Animaciones
                </Button>
              </div>

              <Separator />

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Configuración
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccessibilityTools;
