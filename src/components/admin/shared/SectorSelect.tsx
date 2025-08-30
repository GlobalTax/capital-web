
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSectors } from '@/hooks/useSectors';

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
  const { activeSectors, isLoading } = useSectors();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={`border border-slate-300 rounded-lg bg-white ${className}`}>
          <SelectValue placeholder="Cargando sectores..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} required={required}>
      <SelectTrigger className={`border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-50 bg-white border border-slate-200 shadow-lg rounded-lg p-1">
        {activeSectors.map((sector) => (
          <SelectItem 
            key={sector.id} 
            value={sector.name_es}
            className="hover:bg-slate-50 focus:bg-slate-100 rounded-md px-3 py-2 cursor-pointer transition-colors"
          >
            {sector.name_es}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SectorSelect;
