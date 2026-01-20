import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, FileText, Table2, Lock, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';

// Form Schema
const formSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().optional(),
  company: z.string().optional(),
  investor_type: z.string().optional(),
  investment_range: z.string().optional(),
  sectors_of_interest: z.string().optional(),
  preferred_location: z.string().optional(),
  document_format: z.enum(['pdf', 'excel']),
  document_language: z.enum(['es', 'en']),
  gdpr_consent: z.boolean().refine(val => val === true),
});

type FormData = z.infer<typeof formSchema>;

// Language Toggle Component
const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useI18n();
  
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => setLang('es')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === 'es' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        🇪🇸 ES
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === 'en' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
};

// Main Form Component
const RODLinkedInForm: React.FC = () => {
  const { t, lang } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch available languages from rod_documents
  const { data: availableLanguages = [] } = useQuery({
    queryKey: ['rod-available-languages-linkedin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('language')
        .eq('is_active', true)
        .eq('is_deleted', false);
      
      if (error) throw error;
      const languages = [...new Set(data?.map(d => d.language as 'es' | 'en') || [])];
      return languages;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      document_format: 'pdf',
      document_language: 'es',
      gdpr_consent: false,
    },
  });

  // Update document language when UI language changes
  useEffect(() => {
    if (availableLanguages.includes(lang as 'es' | 'en')) {
      form.setValue('document_language', lang as 'es' | 'en');
    }
  }, [lang, availableLanguages, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const trackingData = {
        referrer: document.referrer || undefined,
        utm_source: urlParams.get('utm_source') || 'linkedin',
        utm_medium: urlParams.get('utm_medium') || 'social',
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        page_origin: 'lp-rod-linkedin',
      };

      const { data: result, error } = await supabase.functions.invoke('generate-rod-document', {
        body: {
          ...data,
          language: data.document_language,
          ...trackingData,
        },
      });

      if (error) {
        let errorMessage = t('rodLanding.error.generic');
        if (error.message) {
          try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = error.message;
          }
        }
        throw new Error(errorMessage);
      }

      if (result?.download_url) {
        window.open(result.download_url, '_blank');
      }

      setIsSuccess(true);
      toast({
        title: t('rodLanding.success.title'),
        description: t('rodLanding.success.message'),
      });

    } catch (error: any) {
      console.error('Error ROD download:', error);
      toast({
        variant: 'destructive',
        title: t('rodLanding.error.title'),
        description: error.message || t('rodLanding.error.generic'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t('rodLanding.success.title')}
        </h2>
        <p className="text-slate-600">
          {t('rodLanding.success.message')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name" className="text-slate-700">
            {t('rodLanding.form.fullName')} *
          </Label>
          <Input
            id="full_name"
            {...form.register('full_name')}
            placeholder="John Doe"
            className="bg-white border-slate-200"
          />
          {form.formState.errors.full_name && (
            <p className="text-sm text-red-500">{t('rodLanding.form.required')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">
            {t('rodLanding.form.email')} *
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="john@company.com"
            className="bg-white border-slate-200"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{t('rodLanding.form.invalidEmail')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-slate-700">
            {t('rodLanding.form.phone')}
          </Label>
          <Input
            id="phone"
            type="tel"
            {...form.register('phone')}
            placeholder="+34 600 000 000"
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company" className="text-slate-700">
            {t('rodLanding.form.company')}
          </Label>
          <Input
            id="company"
            {...form.register('company')}
            placeholder="Acme Capital"
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Investor Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-700">{t('rodLanding.form.investorType')}</Label>
          <Select onValueChange={(value) => form.setValue('investor_type', value)}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder={t('rodLanding.form.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{t('rodLanding.investorType.individual')}</SelectItem>
              <SelectItem value="family_office">{t('rodLanding.investorType.familyOffice')}</SelectItem>
              <SelectItem value="venture_capital">{t('rodLanding.investorType.vc')}</SelectItem>
              <SelectItem value="private_equity">{t('rodLanding.investorType.pe')}</SelectItem>
              <SelectItem value="corporate">{t('rodLanding.investorType.corporate')}</SelectItem>
              <SelectItem value="search_fund">{t('rodLanding.investorType.searchFund')}</SelectItem>
              <SelectItem value="other">{t('rodLanding.investorType.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700">{t('rodLanding.form.investmentRange')}</Label>
          <Select onValueChange={(value) => form.setValue('investment_range', value)}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder={t('rodLanding.form.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="< 1M">{t('rodLanding.investmentRange.less1M')}</SelectItem>
              <SelectItem value="1M - 5M">{t('rodLanding.investmentRange.1to5M')}</SelectItem>
              <SelectItem value="5M - 15M">{t('rodLanding.investmentRange.5to15M')}</SelectItem>
              <SelectItem value="15M - 50M">{t('rodLanding.investmentRange.15to50M')}</SelectItem>
              <SelectItem value="> 50M">{t('rodLanding.investmentRange.more50M')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-700">{t('rodLanding.form.sectorsInterest')}</Label>
        <Textarea
          {...form.register('sectors_of_interest')}
          placeholder={t('rodLanding.form.sectorsPlaceholder')}
          rows={2}
          className="bg-white border-slate-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-700">{t('rodLanding.form.preferredLocation')}</Label>
        <Input
          {...form.register('preferred_location')}
          placeholder={t('rodLanding.form.locationPlaceholder')}
          className="bg-white border-slate-200"
        />
      </div>

      {/* Document Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Language */}
        <div className="space-y-1.5">
          <Label className="text-slate-700 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('rodLanding.form.documentLanguage')} *
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => form.setValue('document_language', 'es')}
              disabled={!availableLanguages.includes('es')}
              className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                form.watch('document_language') === 'es'
                  ? 'border-slate-900 bg-slate-50'
                  : availableLanguages.includes('es')
                    ? 'border-slate-200 hover:border-slate-400'
                    : 'border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">🇪🇸</span>
              <span className="text-sm font-medium">Español</span>
            </button>
            
            <button
              type="button"
              onClick={() => form.setValue('document_language', 'en')}
              disabled={!availableLanguages.includes('en')}
              className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                form.watch('document_language') === 'en'
                  ? 'border-slate-900 bg-slate-50'
                  : availableLanguages.includes('en')
                    ? 'border-slate-200 hover:border-slate-400'
                    : 'border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">🇬🇧</span>
              <span className="text-sm font-medium">English</span>
            </button>
          </div>
          {availableLanguages.length === 0 && (
            <p className="text-sm text-amber-600">{t('rodLanding.error.noLanguage')}</p>
          )}
        </div>

        {/* Document Format */}
        <div className="space-y-1.5">
          <Label className="text-slate-700">{t('rodLanding.form.documentFormat')} *</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => form.setValue('document_format', 'pdf')}
              className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                form.watch('document_format') === 'pdf'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">PDF</span>
            </button>
            
            <button
              type="button"
              onClick={() => form.setValue('document_format', 'excel')}
              className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                form.watch('document_format') === 'excel'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <Table2 className="h-5 w-5" />
              <span className="text-sm font-medium">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* GDPR Consent */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="gdpr_consent"
          checked={form.watch('gdpr_consent')}
          onCheckedChange={(checked) => form.setValue('gdpr_consent', checked as boolean)}
          className="mt-0.5"
        />
        <label htmlFor="gdpr_consent" className="text-sm text-slate-600 leading-tight">
          {t('rodLanding.form.gdprConsent')}{' '}
          <a href="/politica-privacidad" target="_blank" className="text-slate-900 underline">
            {t('rodLanding.form.privacyPolicy')}
          </a> *
        </label>
      </div>
      {form.formState.errors.gdpr_consent && (
        <p className="text-sm text-red-500">{t('rodLanding.form.gdprRequired')}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-lg"
        disabled={isSubmitting || availableLanguages.length === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('rodLanding.form.submitting')}
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            {t('rodLanding.form.submit')}
          </>
        )}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        {t('rodLanding.form.protected')}
      </p>
    </form>
  );
};

// Main Page Component
const LandingRODLinkedInInner: React.FC = () => {
  const { t } = useI18n();

  // SEO
  useEffect(() => {
    document.title = t('rodLanding.seo.title');
    
    // Meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('rodLanding.seo.description'));
    
    // Robots: noindex for campaign landing
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://capittal.es/lp/rod-linkedin');
  }, [t]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Minimal */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-normal text-slate-900 select-none">Capittal</span>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              {t('rodLanding.title')}
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {t('rodLanding.institutional')}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <RODLinkedInForm />
          </div>
        </div>
      </main>
    </div>
  );
};

// Export with I18nProvider wrapper
const LandingRODLinkedIn: React.FC = () => (
  <I18nProvider>
    <LandingRODLinkedInInner />
  </I18nProvider>
);

export default LandingRODLinkedIn;
