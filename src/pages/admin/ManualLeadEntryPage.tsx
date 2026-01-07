// ============= MANUAL LEAD ENTRY PAGE =============
// Admin page for entering leads from external sources (Meta, calls, etc.)

import React, { useState } from 'react';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { MANUAL_ENTRY_CONFIG } from '@/features/valuation/configs/calculator.configs';
import { UserPlus, AlertCircle, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LEAD_SOURCES = [
  { value: 'meta-ads', label: 'Meta Ads (Facebook/Instagram)' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'llamada-entrante', label: 'Llamada Entrante' },
  { value: 'referido', label: 'Referido' },
  { value: 'feria-evento', label: 'Feria / Evento' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email-directo', label: 'Email Directo' },
  { value: 'otro', label: 'Otro' }
];

const ManualLeadEntryPage = () => {
  const [leadSource, setLeadSource] = useState<string>('');
  const [leadSourceDetail, setLeadSourceDetail] = useState<string>('');

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">
                Entrada Manual de Leads
              </h1>
              <p className="text-amber-700">
                Para leads de Meta Ads, formularios externos u otros orígenes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert info */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Las valoraciones introducidas desde esta página se marcarán automáticamente como <strong>"✍️ Manual"</strong> en el listado de contactos, 
            diferenciándolas de los leads que llegan directamente desde la web.
          </AlertDescription>
        </Alert>
      </div>

      {/* Lead Source Selector */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Origen del Lead
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-source">Canal de origen</Label>
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger id="lead-source">
                  <SelectValue placeholder="Selecciona el origen..." />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-source-detail">
                Detalle adicional <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="lead-source-detail"
                placeholder="Ej: Campaña Valoración 2025, Referido por Juan García..."
                value={leadSourceDetail}
                onChange={(e) => setLeadSourceDetail(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <UnifiedCalculator 
          config={MANUAL_ENTRY_CONFIG}
          className="[&>div]:min-h-0 [&>div]:py-0"
          extraMetadata={{
            leadSource,
            leadSourceDetail
          }}
        />
      </div>

      {/* Quick link to contacts */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <a 
          href="/admin/contacts" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver listado de contactos
        </a>
      </div>
    </div>
  );
};

export default ManualLeadEntryPage;
