import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { headerVariants, footerVariants } from '@/config/newsletterThemes';
import { LayoutTemplate, PanelBottom } from 'lucide-react';

interface HeaderFooterConfigProps {
  headerVariant: string;
  footerVariant: string;
  onHeaderChange: (variant: string) => void;
  onFooterChange: (variant: string) => void;
}

export const HeaderFooterConfig: React.FC<HeaderFooterConfigProps> = ({
  headerVariant,
  footerVariant,
  onHeaderChange,
  onFooterChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Header Config */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Header</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={headerVariant} onValueChange={onHeaderChange}>
            <div className="space-y-2">
              {headerVariants.map((variant) => (
                <div key={variant.id} className="flex items-start gap-2">
                  <RadioGroupItem value={variant.id} id={`header-${variant.id}`} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={`header-${variant.id}`} className="text-sm font-medium cursor-pointer">
                      {variant.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{variant.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Footer Config */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PanelBottom className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Footer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={footerVariant} onValueChange={onFooterChange}>
            <div className="space-y-2">
              {footerVariants.map((variant) => (
                <div key={variant.id} className="flex items-start gap-2">
                  <RadioGroupItem value={variant.id} id={`footer-${variant.id}`} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={`footer-${variant.id}`} className="text-sm font-medium cursor-pointer">
                      {variant.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{variant.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};
