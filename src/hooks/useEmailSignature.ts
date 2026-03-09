import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

const QUERY_KEY = 'email-signature';

export interface EmailSignatureData {
  id?: string;
  user_id?: string;
  full_name: string;
  job_title: string;
  phone: string;
  website_url: string;
  linkedin_url: string;
  logo_url: string | null;
  confidentiality_note: string;
  privacy_note: string;
  extra_note: string;
  html_preview?: string | null;
}

export const DEFAULT_SIGNATURE: Omit<EmailSignatureData, 'id' | 'user_id'> = {
  full_name: '',
  job_title: 'M&A - Deal Advisory',
  phone: '+34 653 374 569',
  website_url: 'https://capittal.es',
  linkedin_url: 'https://linkedin.com/company/capittal',
  logo_url: null,
  confidentiality_note:
    'Este mensaje se envía desde el sistema de correo electrónico de Capittal. Podría contener información confidencial protegida por la legislación Europea y sus jurisdicciones. Si ha recibido este mensaje por error o no es la persona indicada en el encabezamiento, deberá eliminarlo inmediatamente. El incumplimiento de los deberes de confidencialidad puede resultar en acciones legales conforme a la legislación civil, penal y administrativa.',
  privacy_note:
    'De conformidad con la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales, y con el Reglamento General de Protección de Datos (RGPD), le informamos que su dirección de correo electrónico ha sido incorporada a nuestros sistemas para el envío de comunicaciones sobre nuestros servicios. Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos. En Capittal, sus datos son confidenciales y no se ceden a terceros sin su consentimiento expreso.',
  extra_note: 'Antes de imprimir este e-mail, piensa en el medio ambiente.',
};

export function generateSignatureHtml(data: Omit<EmailSignatureData, 'id' | 'user_id' | 'html_preview'>): string {
  const logoHtml = data.logo_url
    ? `<tr><td style="padding-bottom:10px;"><img src="${data.logo_url}" alt="Capittal" style="height:60px;display:block;"></td></tr>`
    : '';

  return `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;color:#222;width:500px;">
  <tr>
    <td style="padding-bottom:8px;">
      <strong style="font-size:14px;">${data.full_name}</strong><br>
      <span style="color:#555;">${data.job_title}</span>
    </td>
  </tr>
  ${logoHtml}
  <tr>
    <td style="padding-bottom:8px;color:#444;font-size:12px;line-height:1.5;">
      <strong>Sede Central:</strong> Carrer Ausiàs March número 36, 08010. Barcelona<br>
      <strong>Otras oficinas:</strong> Madrid - Girona - Lleida - Tarragona - Palma de Mallorca - Zaragoza - Valencia<br>
      T. ${data.phone}
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:10px;font-size:12px;">
      <a href="${data.website_url}" style="color:#0066cc;text-decoration:none;">Capittal.es</a>
      &nbsp;·&nbsp;
      <a href="${data.linkedin_url}" style="color:#0066cc;text-decoration:none;">LinkedIn</a>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:6px;font-size:11px;color:#555;line-height:1.4;border-top:1px solid #ddd;padding-top:8px;">
      <strong>Nota de confidencialidad:</strong> ${data.confidentiality_note}
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:6px;font-size:11px;color:#555;line-height:1.4;">
      <strong>Política de privacidad:</strong> ${data.privacy_note}
    </td>
  </tr>
  <tr>
    <td style="background:#f0f0f0;padding:6px 8px;font-size:11px;font-style:italic;color:#444;">
      ${data.extra_note}
    </td>
  </tr>
</table>`;
}

export function useEmailSignature() {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: signature, isLoading } = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await (supabase as any)
        .from('email_signatures')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as EmailSignatureData | null;
    },
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: Omit<EmailSignatureData, 'id' | 'user_id'>) => {
      if (!user?.id) throw new Error('No user');
      const html_preview = generateSignatureHtml(formData);
      const payload = { ...formData, user_id: user.id, html_preview, updated_at: new Date().toISOString() };

      const { data, error } = await (supabase as any)
        .from('email_signatures')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Firma guardada correctamente');
    },
    onError: (err: any) => {
      toast.error('Error al guardar la firma: ' + (err.message || 'Error desconocido'));
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('No user');
      const ext = file.name.split('.').pop();
      const path = `${user.id}/logo.${ext}`;
      const { error } = await supabase.storage
        .from('signature-assets')
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('signature-assets')
        .getPublicUrl(path);
      return urlData.publicUrl;
    },
    onError: (err: any) => {
      toast.error('Error al subir logo: ' + (err.message || 'Error desconocido'));
    },
  });

  return {
    signature,
    isLoading,
    saveSignature: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    uploadLogo: uploadLogoMutation.mutateAsync,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
}

/**
 * Hook to fetch the current user's signature HTML for injection in emails.
 * Returns the HTML string or generates from defaults.
 */
export function useEmailSignatureHtml() {
  const { user } = useAdminAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'html', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await (supabase as any)
        .from('email_signatures')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.html_preview) return data.html_preview as string;

      // Generate from stored data or defaults
      const sigData = data || { ...DEFAULT_SIGNATURE, full_name: user.email?.split('@')[0] || '' };
      return generateSignatureHtml(sigData);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}
