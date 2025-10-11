import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Check, AlertTriangle } from 'lucide-react';
import { COLOR_THEMES, getContrastInfo, isValidHex } from '@/shared/utils/color';
import type { ColorTheme } from '@/shared/utils/color';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showPresets?: boolean;
  showContrastChecker?: boolean;
  contrastAgainst?: string;
  onThemeSelect?: (theme: ColorTheme) => void;
}

const PRESET_COLORS = [
  '#1d4ed8', // blue-700
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#ca8a04', // yellow-600
  '#9333ea', // purple-600
  '#c2410c', // orange-600
  '#0891b2', // cyan-600
  '#be123c', // rose-600
  '#374151', // gray-700
  '#000000', // black
  '#ffffff', // white
  '#6b7280', // gray-500
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  showPresets = true,
  showContrastChecker = false,
  contrastAgainst = '#ffffff',
  onThemeSelect
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color using enhanced validation
    if (isValidHex(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handleThemeClick = (theme: ColorTheme) => {
    setInputValue(theme.primary);
    onChange(theme.primary);
    onThemeSelect?.(theme);
  };

  // Calculate contrast ratio if enabled
  const contrastInfo = showContrastChecker ? getContrastInfo(value, contrastAgainst) : null;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-10 h-10 rounded border-2 border-border cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: value }}
        onClick={() => {
          // Create a temporary input element to trigger the color picker
          const input = document.createElement('input');
          input.type = 'color';
          input.value = value;
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            setInputValue(target.value);
            onChange(target.value);
          };
          input.click();
        }}
      >
        {!value && <Palette className="w-4 h-4 text-muted-foreground" />}
      </div>
      
      <div className="flex-1">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#1d4ed8"
          className="font-mono text-sm"
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            {/* Theme Presets */}
            {showPresets && (
              <>
                <div>
                  <p className="text-sm font-medium mb-3">Color Themes</p>
                  <div className="grid grid-cols-1 gap-2">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        className="flex items-center justify-between p-2 rounded-md border hover:bg-muted transition-colors"
                        onClick={() => handleThemeClick(theme)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: theme.primary }}
                            />
                            {theme.secondary && (
                              <div
                                className="w-4 h-4 rounded-full border border-border"
                                style={{ backgroundColor: theme.secondary }}
                              />
                            )}
                          </div>
                          <span className="text-sm font-medium">{theme.name}</span>
                        </div>
                        {onThemeSelect && (
                          <Check className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Individual Preset Colors */}
            <div>
              <p className="text-sm font-medium mb-2">Preset Colors</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetClick(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            {/* Custom Color Picker */}
            <div>
              <p className="text-sm font-medium mb-2">Custom Color</p>
              <Input
                type="color"
                value={value}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-full h-10"
              />
            </div>

            {/* Contrast Checker */}
            {showContrastChecker && contrastInfo && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Accessibility Check</p>
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      {contrastInfo.accessible ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm">Contrast Ratio: {contrastInfo.ratio.toFixed(2)}</span>
                    </div>
                    <Badge 
                      variant={contrastInfo.accessible ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {contrastInfo.level}
                    </Badge>
                  </div>
                  {!contrastInfo.accessible && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Consider using a different color for better readability
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};