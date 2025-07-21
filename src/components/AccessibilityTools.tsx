import React, { useState, useEffect } from 'react';

import { Eye, EyeOff, Type, Palette, MousePointer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

const AccessibilityTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
    };
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        aria-label="Herramientas de accesibilidad"
      >
        <Eye className="h-5 w-5" />
      </Button>

      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Herramientas de Accesibilidad</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm">Alto contraste</span>
                </div>
                <Button
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('highContrast')}
                >
                  {settings.highContrast ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span className="text-sm">Texto grande</span>
                </div>
                <Button
                  variant={settings.largeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('largeText')}
                >
                  {settings.largeText ? 'A+' : 'A'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  <span className="text-sm">Reducir animaciones</span>
                </div>
                <Button
                  variant={settings.reducedMotion ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('reducedMotion')}
                >
                  {settings.reducedMotion ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="w-full text-xs"
              >
                Restablecer configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessibilityTools;
