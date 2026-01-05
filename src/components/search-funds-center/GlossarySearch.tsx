import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GlossarySearchProps {
  onSearch: (term: string) => void;
}

export const GlossarySearch = ({ onSearch }: GlossarySearchProps) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar término..."
        value={value}
        onChange={handleChange}
        className="pl-10 h-12 text-base"
      />
    </div>
  );
};
