-- Create newsletter_snippets table for reusable HTML blocks
CREATE TABLE public.newsletter_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('header', 'footer', 'cta', 'divider', 'signature', 'social', 'content')),
  description TEXT,
  html_content TEXT NOT NULL,
  preview_image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.newsletter_snippets ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Authenticated users can read snippets"
ON public.newsletter_snippets
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow admin users to manage snippets
CREATE POLICY "Admin users can manage snippets"
ON public.newsletter_snippets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_newsletter_snippets_updated_at
BEFORE UPDATE ON public.newsletter_snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default snippets
INSERT INTO public.newsletter_snippets (name, category, description, html_content, is_default, display_order) VALUES
('Header Clásico', 'header', 'Header con logo centrado y fecha', '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); border-radius:16px 16px 0 0;">
  <tr>
    <td style="padding:40px; text-align:center;">
      <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">CAPITTAL</h1>
      <p style="margin:8px 0 0; font-size:14px; color:#94a3b8; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">Newsletter · {{current_date}}</p>
    </td>
  </tr>
</table>', true, 1),
('Footer Completo', 'footer', 'Footer con logo, contacto y unsubscribe', '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; padding:32px; border-radius:0 0 16px 16px; border-top:1px solid #e2e8f0;">
  <tr>
    <td align="center" style="padding-bottom:16px;">
      <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">CAPITTAL</p>
      <p style="margin:4px 0 0; font-size:12px; color:#64748b; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">Asesores en M&A y valoración de empresas</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <p style="margin:0; font-size:11px; color:#94a3b8; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">
        <a href="{{unsubscribe}}" style="color:#64748b; text-decoration:underline;">Darse de baja</a>
      </p>
    </td>
  </tr>
</table>', true, 1),
('CTA Primary', 'cta', 'Botón de llamada a la acción principal', '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background-color:#0f172a; border-radius:8px;">
            <a href="{{cta_url}}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">{{cta_text}}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>', true, 1),
('Separador Simple', 'divider', 'Línea horizontal simple', '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="border-top:1px solid #e2e8f0; height:1px;"></td>
  </tr>
</table>', true, 1),
('Firma Personal', 'signature', 'Firma con nombre y cargo', '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px; padding-top:24px; border-top:1px solid #e2e8f0;">
  <tr>
    <td>
      <p style="margin:0; font-size:14px; color:#334155; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">Un saludo,</p>
      <p style="margin:8px 0 0; font-size:16px; font-weight:600; color:#0f172a; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">El equipo de Capittal</p>
      <p style="margin:4px 0 0; font-size:12px; color:#64748b; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">info@capittal.es · +34 900 000 000</p>
    </td>
  </tr>
</table>', true, 1),
('Redes Sociales', 'social', 'Enlaces a redes sociales', '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
  <tr>
    <td align="center">
      <a href="https://linkedin.com/company/capittal" style="display:inline-block; margin:0 8px; color:#64748b; text-decoration:none; font-size:12px; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">LinkedIn</a>
      <span style="color:#cbd5e1;">|</span>
      <a href="https://twitter.com/capittal" style="display:inline-block; margin:0 8px; color:#64748b; text-decoration:none; font-size:12px; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">Twitter</a>
      <span style="color:#cbd5e1;">|</span>
      <a href="https://capittal.es" style="display:inline-block; margin:0 8px; color:#64748b; text-decoration:none; font-size:12px; font-family:''Plus Jakarta Sans'',Arial,sans-serif;">Web</a>
    </td>
  </tr>
</table>', true, 1);