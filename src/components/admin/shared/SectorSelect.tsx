
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STANDARD_SECTORS } from './sectorOptions';

interface SectorSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const SectorSelect: React.FC<SectorSelectProps> = ({
  value,
  onChange,
  placeholder = "Selecciona un sector",
  required = false,
  className = ""
}) => {
  return (
    <Select value={value} onValueChange={onChange} required={required}>
      <SelectTrigger className={`border border-gray-300 rounded-lg ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {STANDARD_SECTORS.map((sector) => (
          <SelectItem key={sector} value={sector}>
            {sector}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SectorSelect;
