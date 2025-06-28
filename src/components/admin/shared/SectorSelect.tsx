
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STANDARD_SECTORS } from './sectorOptions';

interface SectorSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const SectorSelect: React.FC<SectorSelectProps> = ({
  id,
  value,
  onValueChange,
  placeholder = "Selecciona un sector",
  required = false,
  className = ""
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger id={id} className={`border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-50 bg-white border border-slate-200 shadow-lg rounded-lg p-1">
        {STANDARD_SECTORS.map((sector) => (
          <SelectItem 
            key={sector} 
            value={sector}
            className="hover:bg-slate-50 focus:bg-slate-100 rounded-md px-3 py-2 cursor-pointer transition-colors"
          >
            {sector}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SectorSelect;
