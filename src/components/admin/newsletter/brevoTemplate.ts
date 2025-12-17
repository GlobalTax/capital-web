interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "Consultar";
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.', ',')} M€`;
  }
  return `${(amount / 1000).toFixed(0)} K€`;
}

function getStatusBadge(status: string): { label: string; color: string; bgColor: string } {
  const config: Record<string, { label: string; color: string; bgColor: string }> = {
    active: { label: "Activo", color: "#059669", bgColor: "#d1fae5" },
    upcoming: { label: "Próximo", color: "#d97706", bgColor: "#fef3c7" },
    exclusive: { label: "Exclusivo", color: "#7c3aed", bgColor: "#ede9fe" },
  };
  return config[status] || config.active;
}

export function generateBrevoHtml(
  operations: Operation[],
  subject: string,
  introText: string
): string {
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  const operationsHtml = operations.map((op) => {
    const status = getStatusBadge(op.project_status);
    return `
    <!-- OPERACIÓN -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="border:1px solid #e2e8f0; border-radius:12px; padding:24px; background-color:#ffffff;">
          <!-- Header con badge -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:16px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:18px; font-weight:700; color:#0f172a; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      🏢 ${op.company_name}
                    </td>
                    <td style="padding-left:12px;">
                      <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:600; color:${status.color}; background-color:${status.bgColor}; border-radius:9999px;">
                        ${status.label}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- Datos -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
            <tr>
              <td style="padding:4px 0; font-size:14px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                📍 <strong style="color:#334155;">Sector:</strong> ${op.sector}
              </td>
            </tr>
            ${op.geographic_location ? `
            <tr>
              <td style="padding:4px 0; font-size:14px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                🌍 <strong style="color:#334155;">Ubicación:</strong> ${op.geographic_location}
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding:4px 0; font-size:14px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                💰 <strong style="color:#334155;">Facturación:</strong> ${formatCurrency(op.revenue_amount)}
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:14px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                📊 <strong style="color:#334155;">EBITDA:</strong> ${formatCurrency(op.ebitda_amount)}
              </td>
            </tr>
          </table>
          
          ${op.short_description ? `
          <!-- Descripción -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
            <tr>
              <td style="font-size:14px; line-height:1.6; color:#475569; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                ${op.short_description}
              </td>
            </tr>
          </table>
          ` : ''}
          
          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:#0f172a; border-radius:8px;">
                <a href="https://capittal.es/oportunidades?op=${op.id}" target="_blank" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                  📩 Solicitar Información
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  }).join('\n');

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
    ${operations.length} oportunidades de inversión disponibles esta semana en Capittal
  </div>
  
  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- CONTAINER -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:40px; text-align:center; border-radius:16px 16px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans',Arial,sans-serif; letter-spacing:-0.5px;">
                      CAPITTAL
                    </h1>
                    <p style="margin:8px 0 0; font-size:14px; color:#94a3b8; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      Oportunidades de la Semana · ${currentDate}
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
                      ${introText || 'Te compartimos las últimas oportunidades de inversión disponibles en nuestro Marketplace. Cada una ha sido cuidadosamente seleccionada por nuestro equipo.'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- OPERATIONS -->
              ${operationsHtml}
              
              <!-- CTA PRINCIPAL -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0f172a; border-radius:8px;">
                          <a href="https://capittal.es/oportunidades" target="_blank" style="display:inline-block; padding:16px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                            Ver Todas las Oportunidades →
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
