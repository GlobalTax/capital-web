import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Mail, Phone, Linkedin, Building2, Pencil, Check, X,
  User, Link2, Calendar, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/* ─── Inline editable field ─────────────────────────────────────────── */
function InlineField({
  label,
  value,
  field,
  contactId,
  icon: Icon,
  type = 'text',
}: {
  label: string;
  value: string | null;
  field: string;
  contactId: string;
  icon?: React.ElementType;
  type?: 'text' | 'url' | 'email' | 'tel';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const save = async () => {
    const newVal = draft.trim() || null;
    if (newVal === value) { setEditing(false); return; }
    setSaving(true);
    const { error } = await (supabase as any)
      .from('contactos')
      .update({ [field]: newVal })
      .eq('id', contactId);
    setSaving(false);
    if (error) { toast.error('Error al guardar'); return; }
    qc.invalidateQueries({ queryKey: ['contacto-profile', contactId] });
    setEditing(false);
    toast.success('Guardado');
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="h-8 text-sm"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          disabled={saving}
          type={type}
        />
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={save} disabled={saving}>
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 text-sm">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value ? (
          type === 'email' ? (
            <a href={`mailto:${value}`} className="text-primary hover:underline">{value}</a>
          ) : type === 'tel' ? (
            <a href={`tel:${value}`} className="hover:underline">{value}</a>
          ) : type === 'url' && value.startsWith('http') ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[300px]">{value}</a>
          ) : (
            <span>{value}</span>
          )
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <button onClick={() => { setDraft(value || ''); setEditing(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
const ContactoProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Fetch contact with empresa join
  const { data: contacto, isLoading } = useQuery({
    queryKey: ['contacto-profile', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('contactos')
        .select(`
          *,
          empresas:empresa_principal_id ( id, nombre, cif, facturacion, ebitda )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch ROD lists this contact belongs to
  const { data: rodMemberships } = useQuery({
    queryKey: ['contacto-rod-lists', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('rod_list_members')
        .select('id, language, created_at')
        .eq('contacto_id', id);
      if (error) throw error;
      return data as { id: string; language: string; created_at: string }[];
    },
    enabled: !!id,
  });

  // Notes mutation
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  const notesMutation = useMutation({
    mutationFn: async (notas: string | null) => {
      const { error } = await (supabase as any)
        .from('contactos')
        .update({ notas })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacto-profile', id] });
      setEditingNotes(false);
      toast.success('Notas guardadas');
    },
    onError: () => toast.error('Error al guardar notas'),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contacto) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
        <p className="text-muted-foreground">Contacto no encontrado</p>
      </div>
    );
  }

  const fullName = [contacto.nombre, contacto.apellidos].filter(Boolean).join(' ');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{fullName}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {contacto.source && <Badge variant="outline" className="text-xs capitalize">{contacto.source}</Badge>}
              {contacto.created_at && (
                <span>Creado {format(new Date(contacto.created_at), "d MMM yyyy", { locale: es })}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Información de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InlineField label="Nombre" value={contacto.nombre} field="nombre" contactId={contacto.id} icon={User} />
          <InlineField label="Apellidos" value={contacto.apellidos} field="apellidos" contactId={contacto.id} />
          <InlineField label="Email" value={contacto.email} field="email" contactId={contacto.id} icon={Mail} type="email" />
          <InlineField label="Teléfono" value={contacto.telefono} field="telefono" contactId={contacto.id} icon={Phone} type="tel" />
          <InlineField label="Cargo" value={contacto.cargo} field="cargo" contactId={contacto.id} />
          <InlineField label="LinkedIn" value={contacto.linkedin} field="linkedin" contactId={contacto.id} icon={Linkedin} type="url" />
        </CardContent>
      </Card>

      {/* Linked company */}
      {contacto.empresas && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Empresa vinculada</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={() => navigate(`/admin/empresas/${contacto.empresas.id}`)}
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">{contacto.empresas.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {contacto.empresas.cif && `CIF: ${contacto.empresas.cif}`}
                  {contacto.empresas.facturacion && ` · Facturación: ${(contacto.empresas.facturacion / 1e6).toFixed(1)}M€`}
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ROD lists */}
      {rodMemberships && rodMemberships.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Listas ROD ({rodMemberships.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rodMemberships.map(rm => (
                <div key={rm.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Lista {rm.language?.toUpperCase() || '—'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(rm.created_at), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notas internas</CardTitle>
            {!editingNotes && (
              <Button variant="ghost" size="sm" onClick={() => { setNotesDraft(contacto.notas || ''); setEditingNotes(true); }}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                rows={4}
                placeholder="Añadir notas sobre este contacto..."
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEditingNotes(false)}>Cancelar</Button>
                <Button size="sm" onClick={() => notesMutation.mutate(notesDraft.trim() || null)} disabled={notesMutation.isPending}>
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {contacto.notas || 'Sin notas'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactoProfilePage;
