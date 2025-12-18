export interface BuySideMandate {
  id: string;
  title: string;
  sector: string;
  geographic_scope: string;
  revenue_min: number | null;
  revenue_max: number | null;
  description: string | null;
  is_new: boolean;
}

function formatCurrencyRange(min: number | null, max: number | null): string {
  const format = (n: number) => {
    if (n >= 1000000) return `€ ${(n / 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}.000.000`;
    if (n >= 1000) return `€ ${(n / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}.000`;
    return `€ ${n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };
  
  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `> ${format(min)}`;
  if (max) return `< ${format(max)}`;
  return 'Consultar';
}

export function generateBuySideHtml(
  mandates: BuySideMandate[],
  subject: string,
  introText: string
): string {
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  const newMandates = mandates.filter(m => m.is_new);
  const existingMandates = mandates.filter(m => !m.is_new);

  const renderMandateItem = (mandate: BuySideMandate) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:15px; font-weight:600; color:#0f172a; font-family:'Plus Jakarta Sans',Arial,sans-serif; padding-bottom:4px;">
              • ${mandate.title}
            </td>
          </tr>
          <tr>
            <td style="font-size:13px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
              ${mandate.geographic_scope} | Rango de ingresos: ${formatCurrencyRange(mandate.revenue_min, mandate.revenue_max)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const renderSection = (title: string, items: BuySideMandate[], isNew: boolean) => {
    if (!items.length) return '';
    return `
    <!-- SECCIÓN ${title.toUpperCase()} -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#0f4c3a; padding:12px 20px; border-radius:8px 8px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:16px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                ${title}
              </td>
              ${isNew ? `
              <td align="right">
                <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:600; color:#0f4c3a; background-color:#ffffff; border-radius:9999px;">
                  ${items.length} nuevo${items.length !== 1 ? 's' : ''}
                </span>
              </td>
              ` : ''}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff; border:1px solid #e2e8f0; border-top:none; padding:16px 20px; border-radius:0 0 8px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${items.map(renderMandateItem).join('')}
          </table>
        </td>
      </tr>
    </table>`;
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { margin:0; padding:0; }
    table { border-collapse:collapse; }
    img { border:0; display:block; }
    @media only screen and (max-width:600px) {
      .container { width:100% !important; }
      .mobile-padding { padding-left:16px !important; padding-right:16px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  
  <!-- PREHEADER -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    ${mandates.length} empresas buscadas actualmente por nuestros clientes inversores
  </div>
  
  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- CONTAINER -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f4c3a 0%,#166534 100%); padding:40px; text-align:center; border-radius:16px 16px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans',Arial,sans-serif; letter-spacing:-0.5px;">
                      CAPITTAL
                    </h1>
                    <p style="margin:8px 0 0; font-size:14px; color:#bbf7d0; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      Empresas Buscadas · ${currentDate}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff; padding:32px;" class="mobile-padding">
              
              <!-- INTRO -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="font-size:16px; line-height:1.6; color:#334155; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                    <p style="margin:0 0 16px;">Hola {{contact.FIRSTNAME}},</p>
                    <p style="margin:0;">
                      ${introText || 'Te compartimos los perfiles de empresas que nuestros clientes inversores están buscando actualmente. Si conoces alguna empresa que pueda encajar, no dudes en contactarnos.'}
                    </p>
                  </td>
                </tr>
              </table>
              
              ${renderSection('Empresas buscadas', newMandates, true)}
              ${renderSection('Búsquedas activas', existingMandates, false)}
              
              <!-- CTA PRINCIPAL -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0f4c3a; border-radius:8px;">
                          <a href="https://capittal.es/contacto" target="_blank" style="display:inline-block; padding:16px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                            ¿Conoces alguna empresa? Contáctanos →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f8fafc; padding:32px; border-radius:0 0 16px 16px; border-top:1px solid #e2e8f0;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      CAPITTAL
                    </p>
                    <p style="margin:4px 0 0; font-size:12px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      Asesores en M&A y valoración de empresas
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="https://www.linkedin.com/company/104311808" target="_blank" style="text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" height="24" style="display:block;">
                          </a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="https://capittal.es" target="_blank" style="text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Web" width="24" height="24" style="display:block;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0; font-size:11px; color:#94a3b8; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      Has recibido este email porque estás suscrito a nuestro newsletter.<br>
                      <a href="{{unsubscribe}}" style="color:#64748b; text-decoration:underline;">Darse de baja</a> · 
                      <a href="{{update_profile}}" style="color:#64748b; text-decoration:underline;">Actualizar preferencias</a>
                    </p>
                    <p style="margin:16px 0 0; font-size:11px; color:#cbd5e1; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      © ${new Date().getFullYear()} Capittal. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>`;
}
