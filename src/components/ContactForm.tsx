import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Shield } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';
import { type ContactFormData } from '@/schemas/contactFormSchema';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface ContactFormProps {
  pageOrigin?: string;
  showTitle?: boolean;
  className?: string;
  variant?: 'default' | 'compra' | 'venta';
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  pageOrigin = 'contact_page', 
  showTitle = true,
  className = '',
  variant = 'default'
}) => {
  const { t } = useI18n();
  const { submitContactForm, isSubmitting } = useContactForm();
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    serviceType: variant === 'compra' ? 'comprar' as const : 'vender' as const,
    message: '',
    website: '', // Honeypot field
    investmentBudget: undefined,
    sectorsOfInterest: '',
    // Seller-specific fields
    annualRevenue: undefined,
    ebitda: undefined,
    employeeCount: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 ContactForm: Form submitted', { 
      pageOrigin, 
      requiredFieldsComplete: !!(formData.fullName && formData.company && formData.email),
      timestamp: new Date().toISOString()
    });
    
    const result = await submitContactForm(formData, pageOrigin);
    
    if (result.success) {
      console.log('✅ ContactForm: Submission successful, clearing form');
      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        serviceType: variant === 'compra' ? 'comprar' as const : 'vender' as const,
        message: '',
        website: '',
        investmentBudget: undefined,
        sectorsOfInterest: '',
        annualRevenue: undefined,
        ebitda: undefined,
        employeeCount: undefined,
      });
    } else {
      console.error('❌ ContactForm: Submission failed:', result.error);
    }
  };

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`w-full max-w-xl mx-auto ${className}`}>
      {showTitle && (
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl font-semibold text-foreground">
            {t('form.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('form.subtitle')}
          </p>
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot - invisible to users and screen readers */}
          <div className="hidden" aria-hidden="true">
            <input
              name="website"
              type="text"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                {t('form.fullName')} *
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder={t('form.fullName.placeholder')}
                disabled={isSubmitting}
                aria-describedby="fullName-hint"
                className="mt-1"
              />
              <p id="fullName-hint" className="text-xs text-muted-foreground mt-1">
                {t('form.fullName.hint')}
              </p>
            </div>

            <div>
              <Label htmlFor="company" className="text-sm font-medium text-foreground">
                {t('form.company')} *
              </Label>
              <Input
                id="company"
                type="text"
                required
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder={t('form.company.placeholder')}
                disabled={isSubmitting}
                aria-describedby="company-hint"
                className="mt-1"
              />
              <p id="company-hint" className="text-xs text-muted-foreground mt-1">
                {t('form.company.hint')}
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('form.email')} *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder={t('form.email.placeholder')}
                disabled={isSubmitting}
                aria-describedby="email-hint"
                className="mt-1"
              />
              <p id="email-hint" className="text-xs text-muted-foreground mt-1">
                {t('form.email.hint')}
              </p>
            </div>

            <div>
              <Label htmlFor="serviceType" className="text-sm font-medium text-foreground">
                {t('form.serviceType')} *
              </Label>
              <Select 
                value={formData.serviceType} 
                onValueChange={(value: ContactFormData['serviceType']) => updateField('serviceType', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('form.serviceType.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vender">{t('form.serviceType.sell')}</SelectItem>
              <SelectItem value="comprar">{t('form.serviceType.buy')}</SelectItem>
              <SelectItem value="otros">{t('form.serviceType.other')}</SelectItem>
            </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('form.serviceType.hint')}
              </p>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                {t('form.phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder={t('form.phone.placeholder')}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            {/* Buyer-specific fields */}
            {variant === 'compra' && (
              <>
                <div>
                  <Label htmlFor="investmentBudget" className="text-sm font-medium text-foreground">
                    {t('form.investmentBudget')}
                  </Label>
                  <Select 
                    value={formData.investmentBudget || ''} 
                    onValueChange={(value: NonNullable<ContactFormData['investmentBudget']>) => updateField('investmentBudget', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('form.investmentBudget.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos-500k">{t('form.investmentBudget.less500k')}</SelectItem>
                      <SelectItem value="500k-1m">{t('form.investmentBudget.500k1m')}</SelectItem>
                      <SelectItem value="1m-5m">{t('form.investmentBudget.1m5m')}</SelectItem>
                      <SelectItem value="5m-10m">{t('form.investmentBudget.5m10m')}</SelectItem>
                      <SelectItem value="mas-10m">{t('form.investmentBudget.more10m')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('form.investmentBudget.hint')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="sectorsOfInterest" className="text-sm font-medium text-foreground">
                    {t('form.sectorsOfInterest')}
                  </Label>
                  <Textarea
                    id="sectorsOfInterest"
                    value={formData.sectorsOfInterest || ''}
                    onChange={(e) => updateField('sectorsOfInterest', e.target.value)}
                    placeholder={t('form.sectorsOfInterest.placeholder')}
                    rows={2}
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('form.sectorsOfInterest.hint')}
                  </p>
                </div>
              </>
            )}

            {/* Seller-specific fields */}
            {variant === 'venta' && (
              <>
                <div>
                  <Label htmlFor="annualRevenue" className="text-sm font-medium text-foreground">
                    {t('form.annualRevenue')}
                  </Label>
                  <Select 
                    value={formData.annualRevenue || ''} 
                    onValueChange={(value: NonNullable<ContactFormData['annualRevenue']>) => updateField('annualRevenue', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('form.annualRevenue.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos-500k">{t('form.annualRevenue.less500k')}</SelectItem>
                      <SelectItem value="500k-1m">{t('form.annualRevenue.500k1m')}</SelectItem>
                      <SelectItem value="1m-5m">{t('form.annualRevenue.1m5m')}</SelectItem>
                      <SelectItem value="5m-10m">{t('form.annualRevenue.5m10m')}</SelectItem>
                      <SelectItem value="mas-10m">{t('form.annualRevenue.more10m')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('form.annualRevenue.hint')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="ebitda" className="text-sm font-medium text-foreground">
                    {t('form.ebitdaRange')}
                  </Label>
                  <Select 
                    value={formData.ebitda || ''} 
                    onValueChange={(value: NonNullable<ContactFormData['ebitda']>) => updateField('ebitda', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('form.ebitdaRange.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos-100k">{t('form.ebitdaRange.less100k')}</SelectItem>
                      <SelectItem value="100k-500k">{t('form.ebitdaRange.100k500k')}</SelectItem>
                      <SelectItem value="500k-1m">{t('form.ebitdaRange.500k1m')}</SelectItem>
                      <SelectItem value="1m-2m">{t('form.ebitdaRange.1m2m')}</SelectItem>
                      <SelectItem value="mas-2m">{t('form.ebitdaRange.more2m')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('form.ebitdaRange.hint')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="employeeCount" className="text-sm font-medium text-foreground">
                    {t('form.employeeCount')}
                  </Label>
                  <Select 
                    value={formData.employeeCount || ''} 
                    onValueChange={(value: NonNullable<ContactFormData['employeeCount']>) => updateField('employeeCount', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('form.employeeCount.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">{t('form.employeeCount.1to5')}</SelectItem>
                      <SelectItem value="6-15">{t('form.employeeCount.6to15')}</SelectItem>
                      <SelectItem value="16-50">{t('form.employeeCount.16to50')}</SelectItem>
                      <SelectItem value="51-100">{t('form.employeeCount.51to100')}</SelectItem>
                      <SelectItem value="mas-100">{t('form.employeeCount.more100')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('form.employeeCount.hint')}
                  </p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                {t('form.message.optional')}
              </Label>
              <Textarea
                id="message"
                value={formData.message || ''}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder={variant === 'compra' 
                  ? t('form.message.placeholder.buy')
                  : t('form.message.placeholder.default')
                }
                rows={3}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('form.submitting')}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t('form.submit')}
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Shield className="h-3 w-3" />
              <span>{t('form.privacy')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('form.rateLimit')}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;