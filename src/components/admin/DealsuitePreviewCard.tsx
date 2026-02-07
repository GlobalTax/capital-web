import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, User, Mail, Building2, Calendar, Pencil, ZoomIn } from 'lucide-react';

interface ExtractedDeal {
  title: string;
  deal_type?: string | null;
  sector?: string | null;
  country?: string | null;
  location?: string | null;
  description?: string | null;
  revenue_min?: number | null;
  revenue_max?: number | null;
  ebitda_min?: number | null;
  ebitda_max?: number | null;
  stake_offered?: string | null;
  customer_types?: string | null;
  reference?: string | null;
  advisor?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_company?: string | null;
  published_at?: string | null;
  image_url?: string | null;
}

interface DealsuitePreviewCardProps {
  deal: ExtractedDeal;
  imagePreview: string | null;
  isSaving: boolean;
  readOnly?: boolean;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  onUpdate: (field: keyof ExtractedDeal, value: string | number | null) => void;
  onSave: () => void;
  onDiscard: () => void;
}

// Inline editable field — shows text, click to edit
const InlineField = ({
  value,
  onChange,
  type = 'text',
  placeholder = '—',
  disabled = false,
}: {
  value: string | number | null | undefined;
  onChange: (val: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const displayValue = value != null && value !== '' ? String(value) : '';

  if (disabled) {
    return (
      <span className="px-1 py-0.5">
        {displayValue || <span className="text-muted-foreground">{placeholder}</span>}
      </span>
    );
  }

  if (editing) {
    return (
      <Input
        autoFocus
        type={type}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
        className="h-7 text-sm py-0 px-2"
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors group inline-flex items-center gap-1 min-w-[40px]"
    >
      {displayValue || <span className="text-muted-foreground">{placeholder}</span>}
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  );
};

const formatRange = (min: number | null | undefined, max: number | null | undefined) => {
  const fmt = (v: number) =>
    new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(v);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `≥ ${fmt(min)}`;
  if (max) return `≤ ${fmt(max)}`;
  return null;
};

export const DealsuitePreviewCard = ({
  deal,
  imagePreview,
  isSaving,
  readOnly = false,
  notes = '',
  onNotesChange,
  onUpdate,
  onSave,
  onDiscard,
}: DealsuitePreviewCardProps) => {
  const [editingDesc, setEditingDesc] = useState(false);

  const dealTypes = deal.deal_type?.split(',').map((t) => t.trim()).filter(Boolean) || [];

  const detailRows: { label: string; field: keyof ExtractedDeal; type?: 'text' | 'number'; render?: () => React.ReactNode }[] = [
    { label: 'Sector', field: 'sector' },
    { label: 'País', field: 'country' },
    { label: 'Ubicación', field: 'location' },
    {
      label: 'Facturación',
      field: 'revenue_min',
      render: () => (
        <div className="flex items-center gap-2">
          <InlineField
            value={deal.revenue_min}
            type="number"
            placeholder="mín"
            disabled={readOnly}
            onChange={(v) => onUpdate('revenue_min', v ? Number(v) : null)}
          />
          <span className="text-muted-foreground">–</span>
          <InlineField
            value={deal.revenue_max}
            type="number"
            placeholder="máx"
            disabled={readOnly}
            onChange={(v) => onUpdate('revenue_max', v ? Number(v) : null)}
          />
        </div>
      ),
    },
    {
      label: 'EBITDA',
      field: 'ebitda_min',
      render: () => (
        <div className="flex items-center gap-2">
          <InlineField
            value={deal.ebitda_min}
            type="number"
            placeholder="mín"
            disabled={readOnly}
            onChange={(v) => onUpdate('ebitda_min', v ? Number(v) : null)}
          />
          <span className="text-muted-foreground">–</span>
          <InlineField
            value={deal.ebitda_max}
            type="number"
            placeholder="máx"
            disabled={readOnly}
            onChange={(v) => onUpdate('ebitda_max', v ? Number(v) : null)}
          />
        </div>
      ),
    },
    { label: 'Participación ofrecida', field: 'stake_offered' },
    { label: 'Tipo de clientes', field: 'customer_types' },
    { label: 'Referencia', field: 'reference' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* ===== MAIN COLUMN (2/3) ===== */}
          <div className="lg:col-span-2 p-6 space-y-5">
            {/* Title */}
            <div>
              <InlineField
                value={deal.title}
                onChange={(v) => onUpdate('title', v)}
                placeholder="Sin título"
                disabled={readOnly}
              />
              {dealTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dealTypes.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Details table */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Detalles</h3>
              <div className="rounded-md border overflow-hidden">
                {detailRows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-muted/30' : ''}`}
                  >
                    <div className="px-3 py-2 font-medium text-muted-foreground">
                      {row.label}
                    </div>
                    <div className="col-span-2 px-3 py-2 text-foreground">
                      {row.render ? (
                        row.render()
                      ) : (
                        <InlineField
                          value={deal[row.field] as string | null}
                          onChange={(v) => onUpdate(row.field, v || null)}
                          disabled={readOnly}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Descripción</h3>
              {!readOnly && editingDesc ? (
                <textarea
                  autoFocus
                  value={deal.description || ''}
                  onChange={(e) => onUpdate('description', e.target.value)}
                  onBlur={() => setEditingDesc(false)}
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : (
                <p
                  onClick={() => !readOnly && setEditingDesc(true)}
                  className={`text-sm text-foreground/80 whitespace-pre-wrap rounded p-2 transition-colors min-h-[60px] ${!readOnly ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                >
                  {deal.description || (
                    <span className="text-muted-foreground italic">
                      {readOnly ? 'Sin descripción' : 'Haz clic para añadir descripción…'}
                    </span>
                  )}
                </p>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Notas internas</h3>
              <Textarea
                value={notes}
                onChange={(e) => onNotesChange?.(e.target.value)}
                placeholder="Añade notas sobre este deal..."
                rows={3}
                className="text-sm"
              />
            </div>
          </div>

          {/* ===== SIDEBAR (1/3) ===== */}
          <div className="border-t lg:border-t-0 lg:border-l bg-muted/20 p-6 space-y-5">
            {/* Contact / Advisor card */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Contacto</h3>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-sm flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <InlineField
                      value={deal.contact_name}
                      onChange={(v) => onUpdate('contact_name', v || null)}
                      placeholder="Nombre"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <InlineField
                      value={deal.contact_company || deal.advisor}
                      onChange={(v) => onUpdate('contact_company', v || null)}
                      placeholder="Empresa"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <InlineField
                      value={deal.contact_email}
                      onChange={(v) => onUpdate('contact_email', v || null)}
                      placeholder="Correo electrónico"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Estado</h3>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs">Activo</Badge>
                {deal.published_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {deal.published_at}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Image thumbnail — clickable to expand */}
            {imagePreview && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Captura original</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative cursor-zoom-in group">
                      <img
                        src={imagePreview}
                        alt="Captura del deal"
                        className="w-full rounded-md border object-contain max-h-[200px]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-auto p-2">
                    <DialogTitle className="sr-only">Captura del deal</DialogTitle>
                    <img
                      src={imagePreview}
                      alt="Captura del deal ampliada"
                      className="max-h-[90vh] w-auto object-contain rounded"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="border-t px-6 py-3 flex gap-2 bg-muted/10">
          {readOnly ? (
            <Button variant="outline" onClick={onDiscard} className="flex-1">
              Cerrar
            </Button>
          ) : (
            <>
              <Button onClick={onSave} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Guardar deal</>
                )}
              </Button>
              <Button variant="outline" onClick={onDiscard}>
                Descartar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
