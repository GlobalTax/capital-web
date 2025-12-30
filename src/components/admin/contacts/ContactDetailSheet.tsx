import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MapPin, 
  TrendingUp,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  DollarSign,
  FileText,
  Send,
  Archive,
  Megaphone,
  Pencil,
  Save,
  XCircle,
  Loader2
} from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AcquisitionChannelSelect } from './AcquisitionChannelSelect';
import { supabase } from '@/integrations/supabase/client';
import { useAcquisitionChannels, CATEGORY_LABELS, CATEGORY_COLORS } from '@/hooks/useAcquisitionChannels';
import ContactEditForm from './ContactEditForm';
import { useContactUpdate, ContactUpdateData } from '@/hooks/useContactUpdate';

interface ContactDetailSheetProps {
  contact: UnifiedContact | null;
  open: boolean;
  onClose: () => void;
  onNavigateToFull?: (contact: UnifiedContact) => void;
  onArchive?: (contact: UnifiedContact) => void;
}

const getOriginConfig = (origin: ContactOrigin) => {
  const configs: Record<ContactOrigin, { label: string; color: string; icon: React.ReactNode }> = {
    contact: { label: 'Comercial', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Briefcase className="h-3 w-3" /> },
    valuation: { label: 'Valoración', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <TrendingUp className="h-3 w-3" /> },
    collaborator: { label: 'Colaborador', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: <User className="h-3 w-3" /> },
    general: { label: 'General', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: <FileText className="h-3 w-3" /> },
    acquisition: { label: 'Adquisición', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <DollarSign className="h-3 w-3" /> },
    company_acquisition: { label: 'Compra', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: <Building2 className="h-3 w-3" /> },
    advisor: { label: 'Asesor', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: <Briefcase className="h-3 w-3" /> },
  };
  return configs[origin] || configs.general;
};

const formatCurrency = (value?: number) => {
  if (!value) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; copyable?: string }> = ({ 
  icon, 
  label, 
  value,
  copyable 
}) => {
  const { toast } = useToast();
  
  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(copyable);
      toast({ title: "Copiado al portapapeles" });
    }
  };

  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground truncate">{value}</p>
          {copyable && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactDetailSheet: React.FC<ContactDetailSheetProps> = ({
  contact,
  open,
  onClose,
  onNavigateToFull,
  onArchive,
}) => {
  const { toast } = useToast();
  const { channels } = useAcquisitionChannels();
  const { updateContact, isUpdating } = useContactUpdate();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    (contact as any)?.acquisition_channel_id || null
  );
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ContactUpdateData>({});

  // Initialize form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        company: contact.company || '',
        industry: contact.industry || '',
        employee_range: contact.employee_range || '',
        cif: contact.cif || '',
        revenue: contact.revenue,
        ebitda: contact.ebitda,
        profession: contact.profession || '',
        experience: contact.experience || '',
        motivation: contact.motivation || '',
        service_type: contact.service_type || '',
        sectors_of_interest: contact.sectors_of_interest || '',
        investment_budget: contact.investment_budget || '',
        target_timeline: contact.target_timeline || '',
        preferred_location: contact.preferred_location || '',
      });
      setIsEditing(false);
    }
  }, [contact]);

  if (!contact) return null;

  const handleSave = () => {
    updateContact(
      { id: contact.id, origin: contact.origin, data: formData },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    // Reset form data to original contact values
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      industry: contact.industry || '',
      employee_range: contact.employee_range || '',
      cif: contact.cif || '',
      revenue: contact.revenue,
      ebitda: contact.ebitda,
      profession: contact.profession || '',
      experience: contact.experience || '',
      motivation: contact.motivation || '',
      service_type: contact.service_type || '',
      sectors_of_interest: contact.sectors_of_interest || '',
      investment_budget: contact.investment_budget || '',
      target_timeline: contact.target_timeline || '',
      preferred_location: contact.preferred_location || '',
      
    });
    setIsEditing(false);
  };

  const originConfig = getOriginConfig(contact.origin);
  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  const handleChannelChange = async (channelId: string | null) => {
    if (!contact || contact.origin !== 'contact') return;
    
    setIsSavingChannel(true);
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({ acquisition_channel_id: channelId })
        .eq('id', contact.id);

      if (error) throw error;
      
      setSelectedChannelId(channelId);
      toast({ title: 'Canal actualizado' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el canal', variant: 'destructive' });
    } finally {
      setIsSavingChannel(false);
    }
  };

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      toast({ title: "Email copiado" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        className="w-[400px] sm:w-[440px] bg-[hsl(var(--linear-bg))] border-l border-[hsl(var(--linear-border))] p-0 overflow-hidden"
        side="right"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg-elevated))]">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn("h-5 text-[10px] font-medium border gap-1", originConfig.color)}>
                  {originConfig.icon}
                  {originConfig.label}
                </Badge>
                {contact.is_from_pro_valuation && (
                  <Badge variant="outline" className="h-5 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Pro
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-lg font-semibold text-foreground truncate">
                {contact.name}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {contact.company || 'Sin empresa'}
              </p>
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-180px)] px-6 py-4">
          {isEditing ? (
            <>
              {/* Edit Mode */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Editando información del contacto
                </h3>
                <ContactEditForm
                  contact={contact}
                  formData={formData}
                  onChange={setFormData}
                />
              </div>
              
              {/* Save/Cancel buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* View Mode - Quick actions */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 border-[hsl(var(--linear-border))]"
                  onClick={() => window.open(`mailto:${contact.email}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                {contact.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 border-[hsl(var(--linear-border))]"
                    onClick={() => window.open(`tel:${contact.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                )}
                {contact.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 border-[hsl(var(--linear-border))]"
                    onClick={() => window.open(`https://wa.me/${contact.phone?.replace(/\D/g, '')}`)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>

          {/* Contact info section */}
          <div className="space-y-1 mb-6 group">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Información de contacto
            </h3>
            <InfoRow 
              icon={<Mail className="h-4 w-4" />} 
              label="Email" 
              value={contact.email}
              copyable={contact.email}
            />
            {contact.phone && (
              <InfoRow 
                icon={<Phone className="h-4 w-4" />} 
                label="Teléfono" 
                value={contact.phone}
                copyable={contact.phone}
              />
            )}
            {contact.company && (
              <InfoRow 
                icon={<Building2 className="h-4 w-4" />} 
                label="Empresa" 
                value={contact.company}
              />
            )}
            {contact.cif && (
              <InfoRow 
                icon={<FileText className="h-4 w-4" />} 
                label="CIF" 
                value={contact.cif}
                copyable={contact.cif}
              />
            )}
            {contact.location && (
              <InfoRow 
                icon={<MapPin className="h-4 w-4" />} 
                label="Ubicación" 
                value={contact.location}
              />
            )}
          </div>

          {/* Canal de adquisición (solo para contact_leads) */}
          {contact.origin === 'contact' && (
            <>
              <Separator className="bg-[hsl(var(--linear-border))] my-4" />
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Canal de adquisición
                </h3>
                <AcquisitionChannelSelect
                  value={selectedChannelId}
                  onChange={handleChannelChange}
                  disabled={isSavingChannel}
                />
              </div>
            </>
          )}

          <Separator className="bg-[hsl(var(--linear-border))] my-4" />

          {/* Financial info (if valuation) */}
          {(contact.final_valuation || contact.revenue || contact.ebitda) && (
            <>
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Datos financieros
                </h3>
                {contact.final_valuation && (
                  <InfoRow 
                    icon={<TrendingUp className="h-4 w-4" />} 
                    label="Valoración estimada" 
                    value={
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(contact.final_valuation)}
                      </span>
                    }
                  />
                )}
                {contact.revenue && (
                  <InfoRow 
                    icon={<DollarSign className="h-4 w-4" />} 
                    label="Facturación" 
                    value={formatCurrency(contact.revenue)}
                  />
                )}
                {contact.ebitda && (
                  <InfoRow 
                    icon={<DollarSign className="h-4 w-4" />} 
                    label="EBITDA" 
                    value={formatCurrency(contact.ebitda)}
                  />
                )}
                {contact.industry && (
                  <InfoRow 
                    icon={<Briefcase className="h-4 w-4" />} 
                    label="Sector" 
                    value={contact.industry}
                  />
                )}
                {contact.employee_range && (
                  <InfoRow 
                    icon={<User className="h-4 w-4" />} 
                    label="Empleados" 
                    value={contact.employee_range}
                  />
                )}
              </div>
              <Separator className="bg-[hsl(var(--linear-border))] my-4" />
            </>
          )}

          {/* Email tracking */}
          <div className="space-y-1 mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Estado del seguimiento
            </h3>
            <div className="flex items-center gap-3 py-2">
              {contact.email_opened ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Email abierto</p>
                    {contact.email_opened_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(contact.email_opened_at), "d MMM 'a las' HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                </>
              ) : contact.email_sent ? (
                <>
                  <Mail className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Email enviado</p>
                    {contact.email_sent_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(contact.email_sent_at), "d MMM 'a las' HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Sin contactar</p>
                </>
              )}
            </div>
            <InfoRow 
              icon={<Calendar className="h-4 w-4" />} 
              label="Fecha de registro" 
              value={format(new Date(contact.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
            />
          </div>

          {/* UTM tracking */}
          {(contact.utm_source || contact.utm_medium || contact.utm_campaign) && (
            <>
              <Separator className="bg-[hsl(var(--linear-border))] my-4" />
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Atribución
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {contact.utm_source && (
                    <Badge variant="outline" className="text-[10px] bg-[hsl(var(--linear-bg-elevated))]">
                      {contact.utm_source}
                    </Badge>
                  )}
                  {contact.utm_medium && (
                    <Badge variant="outline" className="text-[10px] bg-[hsl(var(--linear-bg-elevated))]">
                      {contact.utm_medium}
                    </Badge>
                  )}
                  {contact.utm_campaign && (
                    <Badge variant="outline" className="text-[10px] bg-[hsl(var(--linear-bg-elevated))]">
                      {contact.utm_campaign}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg-elevated))]">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={() => {
                if (window.confirm(`¿Archivar "${contact.name}"?`)) {
                  onArchive?.(contact);
                }
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </Button>
            <Button
              className="flex-1"
              onClick={() => onNavigateToFull?.(contact)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver ficha
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ContactDetailSheet;
