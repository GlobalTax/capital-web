import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/seo';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Shield, Building2, Search, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useContactForm } from '@/hooks/useContactForm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OperationOption {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount?: number;
  valuation_currency?: string;
}

const LandingConsultaOportunidades: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get('operation');

  const { submitOperationContactForm, isSubmitting } = useContactForm();

  // Form state
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Operations state
  const [operations, setOperations] = useState<OperationOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingOps, setLoadingOps] = useState(true);

  // Fetch active operations
  useEffect(() => {
    const fetchOps = async () => {
      const { data, error } = await supabase
        .from('company_operations')
        .select('id, company_name, sector, valuation_amount, valuation_currency')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('sector', { ascending: true });

      if (!error && data) {
        setOperations(data);
        // Pre-select from query param
        if (preSelectedId && data.some(op => op.id === preSelectedId)) {
          setSelectedIds([preSelectedId]);
        }
      }
      setLoadingOps(false);
    };
    fetchOps();
  }, [preSelectedId]);

  // Group operations by sector
  const groupedOperations = useMemo(() => {
    const filtered = operations.filter(op =>
      op.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const groups: Record<string, OperationOption[]> = {};
    filtered.forEach(op => {
      const sector = op.sector || 'Otros';
      if (!groups[sector]) groups[sector] = [];
      groups[sector].push(op);
    });
    return groups;
  }, [operations, searchTerm]);

  const toggleOperation = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const removeSelected = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const getOperationName = (id: string) =>
    operations.find(op => op.id === id)?.company_name || id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    const selectedNames = selectedIds.map(id => getOperationName(id)).join(', ');
    const autoMessage = `Interesado en: ${selectedNames}${message ? `. ${message}` : ''}`;

    // Submit one lead with all operation IDs
    const result = await submitOperationContactForm({
      fullName,
      company,
      companyName: selectedNames,
      email,
      phone: phone || undefined,
      message: autoMessage,
      operationId: selectedIds[0], // Primary operation
      serviceType: 'comprar',
      website: honeypot,
    });

    if (result.success) {
      // If multiple operations, submit additional leads (non-blocking)
      if (selectedIds.length > 1) {
        for (const opId of selectedIds.slice(1)) {
          supabase.from('contact_leads').insert([{
            full_name: fullName,
            company,
            email,
            phone: phone || null,
            referral: `operation_${opId}`,
            status: 'new',
            user_agent: navigator.userAgent.slice(0, 255),
          }]).then(() => {});
        }
      }
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <>
        <SEOHead
          title="Consulta enviada | Capittal"
          description="Tu consulta sobre oportunidades de inversión ha sido enviada correctamente."
          canonical="https://capittal.es/lp/consulta-oportunidades"
        />
        <LandingHeaderMinimal />
        <main className="min-h-screen bg-background pt-20 pb-16 flex items-center justify-center">
          <Card className="max-w-lg mx-auto text-center p-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">¡Consulta enviada!</h1>
            <p className="text-muted-foreground mb-4">
              Hemos recibido tu interés en {selectedIds.length} oportunidad{selectedIds.length > 1 ? 'es' : ''}.
              Nuestro equipo te contactará en menos de 24 horas.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedIds.map(id => (
                <Badge key={id} variant="secondary">{getOperationName(id)}</Badge>
              ))}
            </div>
          </Card>
        </main>
        <LandingFooterMinimal />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Solicita información sobre oportunidades de inversión | Capittal"
        description="Selecciona las oportunidades que te interesan y recibe información detallada. Asesoramiento confidencial en M&A."
        canonical="https://capittal.es/lp/consulta-oportunidades"
      />

      <LandingHeaderMinimal />

      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-10 pt-8">
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Building2 className="h-4 w-4" />
              Oportunidades de inversión
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Consulta sobre oportunidades
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Selecciona las oportunidades que te interesan y envíanos tus datos. 
              Te contactaremos con información detallada bajo acuerdo de confidencialidad.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                name="website"
                type="text"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Step 1: Select operations */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    1. Selecciona las oportunidades
                  </h2>
                  {selectedIds.length > 0 && (
                    <Badge variant="default" className="text-sm">
                      {selectedIds.length} seleccionada{selectedIds.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Selected badges */}
                {selectedIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedIds.map(id => (
                      <Badge key={id} variant="secondary" className="text-sm pr-1">
                        {getOperationName(id)}
                        <button
                          type="button"
                          onClick={() => removeSelected(id)}
                          className="ml-1.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o sector..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Operations list */}
                {loadingOps ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[320px] rounded-md border border-border">
                    <div className="p-2">
                      {Object.entries(groupedOperations).map(([sector, ops]) => (
                        <div key={sector} className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                            {sector}
                          </p>
                          {ops.map(op => (
                            <label
                              key={op.id}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                                selectedIds.includes(op.id)
                                  ? 'bg-primary/5 border border-primary/20'
                                  : 'hover:bg-muted border border-transparent'
                              }`}
                            >
                              <Checkbox
                                checked={selectedIds.includes(op.id)}
                                onCheckedChange={() => toggleOperation(op.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {op.company_name}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {op.sector}
                              </Badge>
                            </label>
                          ))}
                        </div>
                      ))}
                      {Object.keys(groupedOperations).length === 0 && (
                        <p className="text-center text-muted-foreground py-8 text-sm">
                          No se encontraron oportunidades
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Contact details */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  2. Tus datos de contacto
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nombre completo *</Label>
                      <Input
                        id="fullName"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Tu nombre y apellidos"
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Tu empresa *</Label>
                      <Input
                        id="company"
                        required
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        placeholder="Nombre de tu empresa"
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono (opcional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+34 600 000 000"
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Mensaje adicional (opcional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Comparte detalles sobre tu interés o criterios de inversión..."
                      rows={3}
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isSubmitting || selectedIds.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando consulta...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar consulta{selectedIds.length > 0 ? ` (${selectedIds.length} oportunidad${selectedIds.length > 1 ? 'es' : ''})` : ''}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <p>Información confidencial protegida bajo acuerdo de no divulgación</p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <LandingFooterMinimal />
    </>
  );
};

export default LandingConsultaOportunidades;
