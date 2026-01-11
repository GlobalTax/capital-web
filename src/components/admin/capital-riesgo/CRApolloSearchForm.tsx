import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  ChevronDown, 
  Zap, 
  MapPin, 
  Briefcase, 
  Users,
  Loader2,
  Sparkles,
  List,
  Link2
} from 'lucide-react';
import { CRApolloSearchCriteria, CRApolloSearchPreset } from '@/hooks/useCRApolloSearchImport';

interface CRApolloSearchFormProps {
  presets: CRApolloSearchPreset[];
  onSearch: (criteria: CRApolloSearchCriteria) => void;
  onSearchFromList: (listId: string) => void;
  isSearching: boolean;
  isSearchingFromList: boolean;
}

const extractListId = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/lists\/([a-f0-9]+)/i);
  if (urlMatch) return urlMatch[1];
  if (/^[a-f0-9]{24}$/i.test(trimmed)) return trimmed;
  return trimmed;
};

const TagInput: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)} 
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  );
};

export const CRApolloSearchForm: React.FC<CRApolloSearchFormProps> = ({
  presets,
  onSearch,
  onSearchFromList,
  isSearching,
  isSearchingFromList,
}) => {
  const [criteria, setCriteria] = useState<CRApolloSearchCriteria>({
    person_titles: [],
    person_locations: [],
    person_seniorities: [],
    q_keywords: '',
    organization_industries: [],
    per_page: 25,
    page: 1,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [listInput, setListInput] = useState('');

  const applyPreset = (preset: CRApolloSearchPreset) => {
    setCriteria(prev => ({
      ...prev,
      ...preset.criteria,
    }));
  };

  const handleSearch = () => {
    onSearch(criteria);
  };

  const handleSearchFromList = () => {
    const listId = extractListId(listInput);
    if (listId) {
      onSearchFromList(listId);
    }
  };

  const clearForm = () => {
    setCriteria({
      person_titles: [],
      person_locations: [],
      person_seniorities: [],
      q_keywords: '',
      organization_industries: [],
      per_page: 25,
      page: 1,
    });
  };

  const hasFilters = 
    (criteria.person_titles?.length || 0) > 0 ||
    (criteria.person_locations?.length || 0) > 0 ||
    (criteria.q_keywords?.length || 0) > 0 ||
    (criteria.organization_industries?.length || 0) > 0;

  const isValidListInput = listInput.trim().length > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5" />
          Importar desde Apollo - Capital Riesgo
        </CardTitle>
        <CardDescription>
          Importa contactos de PE/VC desde tus listas guardadas o busca en la base de datos global
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import from List Section */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <List className="h-4 w-4 text-primary" />
            Importar desde Lista de Apollo
          </Label>
          <p className="text-xs text-muted-foreground">
            Pega el ID o URL de una lista guardada con contactos PE/VC
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={listInput}
                onChange={(e) => setListInput(e.target.value)}
                placeholder="Ej: 6963a8a0d67d450011d306e1 o app.apollo.io/#/lists/..."
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSearchFromList}
              disabled={isSearchingFromList || !isValidListInput}
              className="gap-2 whitespace-nowrap"
            >
              {isSearchingFromList ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando todos...
                </>
              ) : (
                <>
                  <List className="h-4 w-4" />
                  Cargar Lista
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Encuentra el ID en la URL de tu lista: app.apollo.io/#/lists/<strong>6963a8a0d67d450011d306e1</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">O BUSCAR EN BASE DE DATOS GLOBAL</span>
          <Separator className="flex-1" />
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Búsquedas Predefinidas PE/VC
          </Label>
          <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="gap-2"
              >
                <Sparkles className="h-3 w-3" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Main filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Cargos
            </Label>
            <TagInput
              value={criteria.person_titles || []}
              onChange={(v) => setCriteria({ ...criteria, person_titles: v })}
              placeholder="Ej: Partner, Principal, Director... (Enter para añadir)"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Ubicaciones
            </Label>
            <TagInput
              value={criteria.person_locations || []}
              onChange={(v) => setCriteria({ ...criteria, person_locations: v })}
              placeholder="Ej: Spain, Germany, France... (Enter para añadir)"
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-muted-foreground" />
            Keywords (OR separados)
          </Label>
          <Input
            value={criteria.q_keywords || ''}
            onChange={(e) => setCriteria({ ...criteria, q_keywords: e.target.value })}
            placeholder='Ej: "private equity" OR "venture capital" OR "growth equity"'
          />
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 w-full justify-start">
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              Opciones Avanzadas
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                Nivel de Seniority
              </Label>
              <TagInput
                value={criteria.person_seniorities || []}
                onChange={(v) => setCriteria({ ...criteria, person_seniorities: v })}
                placeholder="Ej: partner, c_suite, director, owner..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Industrias de la Organización</Label>
              <TagInput
                value={criteria.organization_industries || []}
                onChange={(v) => setCriteria({ ...criteria, organization_industries: v })}
                placeholder="Ej: private equity, venture capital, investment banking..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Resultados por página</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={criteria.per_page || 25}
                onChange={(e) => setCriteria({ ...criteria, per_page: parseInt(e.target.value) || 25 })}
                className="w-32"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSearch}
            disabled={isSearching || !hasFilters}
            className="gap-2"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isSearching ? 'Buscando...' : 'Buscar en Apollo'}
          </Button>
          
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearForm}>
              Limpiar filtros
            </Button>
          )}
          
          {hasFilters && (
            <Badge variant="secondary" className="ml-auto">
              {[
                criteria.person_titles?.length || 0,
                criteria.person_locations?.length || 0,
                criteria.q_keywords ? 1 : 0,
              ].reduce((a, b) => a + b, 0)} filtros activos
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
