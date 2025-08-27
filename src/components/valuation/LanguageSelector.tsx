import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { LangCode } from '@/shared/i18n/locale';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'es' as LangCode, name: 'Español', flag: '🇪🇸' },
  { code: 'ca' as LangCode, name: 'Català', flag: '🇪🇸' },
  { code: 'val' as LangCode, name: 'Valencià', flag: '🇪🇸' },
  { code: 'gl' as LangCode, name: 'Galego', flag: '🇪🇸' }
];

const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Select value={lang} onValueChange={setLang}>
        <SelectTrigger className="w-auto min-w-[120px] border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;