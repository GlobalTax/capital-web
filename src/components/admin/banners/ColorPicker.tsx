import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
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

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

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
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};