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

function getStatusBadge(status: string): { label: string; color: string; bgColor: string; borderColor: string } {
  const config: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    active: { label: "ACTIVO", color: "#047857", bgColor: "#ecfdf5", borderColor: "#a7f3d0" },
    upcoming: { label: "PRÓXIMO", color: "#b45309", bgColor: "#fffbeb", borderColor: "#fcd34d" },
    exclusive: { label: "EXCLUSIVO", color: "#7c2d12", bgColor: "#fef3c7", borderColor: "#f59e0b" },
  };
  return config[status] || config.active;
}

/**
 * Generates a VML-compatible "bulletproof" button for Outlook Windows
 * with gradient background and rounded corners
 */
function generateVMLButton(
  href: string,
  text: string,
  align: 'center' | 'left' = 'center',
  size: 'normal' | 'large' = 'normal'
): string {
  const width = size === 'large' ? 320 : 230;
  const height = size === 'large' ? 52 : 44;
  const fontSize = size === 'large' ? 16 : 14;
  const padding = size === 'large' ? '18px 40px' : '14px 28px';
  const borderRadius = size === 'large' ? '12px' : '10px';

  return `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="${align}">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}"
                        style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="18%" stroke="f" fill="t">
                        <v:fill type="gradient" angle="135" color="#0f172a" color2="#1e3a5f"/>
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:${fontSize}px;font-weight:600;">
                          ${text}&nbsp;&nbsp;→
                        </center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a href="${href}" target="_blank"
                        style="display:inline-block; background-color:#0f172a; background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);
                        border-radius:${borderRadius}; padding:${padding}; font-size:${fontSize}px; font-weight:600; color:#ffffff; text-decoration:none;
                        font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                        ${text}&nbsp;&nbsp;→
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>`;
}

function generateOperationCard(op: Operation, index: number, total: number): string {
  const status = getStatusBadge(op.project_status);
  const isExclusive = op.project_status === 'exclusive';
  const isFirst = index === 0 && total > 2;
  
  // Card styling based on exclusive status
  const cardBorder = isExclusive ? '2px solid #f59e0b' : '1px solid #e2e8f0';
  const cardShadow = isExclusive ? '0 4px 20px rgba(245, 158, 11, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)';
  
  return `
    <!-- OPERACIÓN ${index + 1} de ${total} -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="border:${cardBorder}; border-radius:16px; background-color:#ffffff; box-shadow:${cardShadow}; overflow:hidden;">
          
          ${isExclusive ? `
          <!-- RIBBON EXCLUSIVO -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f59e0b; background:linear-gradient(90deg,#f59e0b 0%,#fbbf24 100%);">
            <tr>
              <td style="padding:8px 24px; text-align:center;">
                <span style="font-size:11px; font-weight:700; color:#78350f; letter-spacing:1.5px; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                  ★ OPORTUNIDAD EXCLUSIVA ★
                </span>
              </td>
            </tr>
          </table>
          ` : ''}
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:${isFirst ? '28px' : '24px'};">
            <tr>
              <td>
                <!-- Header con Badge y Número -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                  <tr>
                    <td>
                      <!-- Badge de Estado -->
                      <span style="display:inline-block; padding:6px 14px; font-size:10px; font-weight:700; letter-spacing:0.8px; color:${status.color}; background-color:${status.bgColor}; border:1px solid ${status.borderColor}; border-radius:6px; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                        ${status.label}
                      </span>
                    </td>
                    <td align="right" style="font-size:12px; color:#94a3b8; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                      ${index + 1} de ${total}
                    </td>
                  </tr>
                </table>
                
                <!-- Nombre de Empresa -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                  <tr>
                    <td>
                      <h2 style="margin:0 0 12px; font-size:${isFirst ? '22px' : '20px'}; font-weight:700; color:#0f172a; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif; letter-spacing:-0.3px;">
                        ${op.company_name}
                      </h2>
                      <!-- Divider decorativo -->
                      <table width="60" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="height:3px; background-color:#0f172a; background:linear-gradient(90deg,#0f172a 0%,#64748b 100%); border-radius:2px;"></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Sector y Ubicación -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                  <tr>
                    <td style="font-size:14px; color:#64748b; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                      <span style="color:#0f172a; font-weight:600;">${op.sector}</span>
                      ${op.geographic_location ? `<span style="color:#cbd5e1; padding:0 8px;">|</span>${op.geographic_location}` : ''}
                    </td>
                  </tr>
                </table>
                
                <!-- Métricas Financieras en 2 Columnas -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="width:48%; padding:16px; background-color:#f8fafc; border-radius:10px; vertical-align:top;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 4px; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                              Facturación
                            </p>
                            <p style="margin:0; font-size:${isFirst ? '20px' : '18px'}; font-weight:700; color:#0f172a; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                              ${formatCurrency(op.revenue_amount)}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="width:4%;"></td>
                    <td style="width:48%; padding:16px; background-color:#f8fafc; border-radius:10px; vertical-align:top;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 4px; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                              EBITDA
                            </p>
                            <p style="margin:0; font-size:${isFirst ? '20px' : '18px'}; font-weight:700; color:#0f172a; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                              ${formatCurrency(op.ebitda_amount)}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                ${op.short_description ? `
                <!-- Descripción -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="font-size:14px; line-height:1.7; color:#475569; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                      ${op.short_description}
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <!-- CTA Button (VML bulletproof) -->
                ${generateVMLButton(
                  `https://capittal.es/oportunidades?op=${op.id}`,
                  'Solicitar Información',
                  isFirst ? 'center' : 'left',
                  'normal'
                )}
                
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

export function generateBrevoHtml(
  operations: Operation[],
  subject: string,
  introText: string
): string {
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric' 
  });

  // Generate preheader with sector names
  const sectors = [...new Set(operations.map(op => op.sector))].slice(0, 3);
  const preheaderText = `${operations.length} oportunidades en ${sectors.join(', ')} - Capittal Marketplace`;

  const operationsHtml = operations
    .map((op, index) => generateOperationCard(op, index, operations.length))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    /* Reset */
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* Mobile */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-center { text-align: center !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-hide { display: none !important; }
      .mobile-full-width { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased;">
  
  <!-- PREHEADER -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; color:#f1f5f9; line-height:1px;">
    ${preheaderText}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>
  
  <!-- WRAPPER -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- OUTLOOK CONTAINER WRAPPER -->
        <!--[if mso]>
        <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0">
        <tr><td>
        <![endif]-->
        
        <!-- CONTAINER -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">
          
          <!-- HEADER (VML gradient + rounded corners for Outlook) -->
          <tr>
            <td align="center" style="padding:0;">
              
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" arcsize="3%" stroke="f" fill="t"
                style="width:600px; height:220px;">
                <v:fill type="gradient" angle="135" color="#0f172a" color2="#1e3a5f"/>
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              
              <!--[if !mso]><!-- -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0f172a; background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%); border-radius:20px 20px 0 0; overflow:hidden;">
                <tr>
                  <td>
              <!--<![endif]-->
              
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:40px 40px 32px;" class="mobile-padding">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center">
                                <!-- Logo Text -->
                                <h1 style="margin:0; font-size:32px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif; letter-spacing:2px;">
                                  CAPITTAL
                                </h1>
                                <p style="margin:8px 0 0; font-size:13px; color:#94a3b8; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif; letter-spacing:0.5px;">
                                  Asesores en M&A y Valoración
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Decorative Gold Line -->
                      <tr>
                        <td align="center" style="padding:0 40px;">
                          <table role="presentation" width="80" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="height:3px; background-color:#f59e0b; background:linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#f59e0b 100%); border-radius:2px;"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Subtitle with Date -->
                      <tr>
                        <td style="padding:24px 40px 36px;" class="mobile-padding">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center">
                                <p style="margin:0; font-size:15px; color:#e2e8f0; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                                  Oportunidades de la Semana
                                </p>
                                <p style="margin:6px 0 0; font-size:13px; color:#64748b; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                                  ${currentDate}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
              
              <!--[if !mso]><!-- -->
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
              
              <!--[if mso]>
                </v:textbox>
              </v:roundrect>
              <![endif]-->
              
            </td>
          </tr>
          
          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff; padding:36px 32px;" class="mobile-padding">
              
              <!-- INTRO -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="font-size:16px; line-height:1.7; color:#334155; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                    <p style="margin:0 0 16px; font-size:18px; color:#0f172a;">
                      Hola <strong>{{contact.FIRSTNAME}}</strong>,
                    </p>
                    <p style="margin:0; color:#475569;">
                      ${introText || 'Te compartimos las últimas oportunidades de inversión disponibles en nuestro Marketplace. Cada una ha sido cuidadosamente seleccionada por nuestro equipo de asesores.'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px; background-color:#e2e8f0; background:linear-gradient(90deg,transparent 0%,#e2e8f0 20%,#e2e8f0 80%,transparent 100%);"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Section Title -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1.5px; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                      ${operations.length} ${operations.length === 1 ? 'Oportunidad Disponible' : 'Oportunidades Disponibles'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- OPERATIONS -->
              ${operationsHtml}
              
              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px; background-color:#e2e8f0; background:linear-gradient(90deg,transparent 0%,#e2e8f0 20%,#e2e8f0 80%,transparent 100%);"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA PRINCIPAL (VML bulletproof) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    ${generateVMLButton(
                      'https://capittal.es/oportunidades',
                      'Ver Todas las Oportunidades',
                      'center',
                      'large'
                    )}
                    <p style="margin:16px 0 0; font-size:13px; color:#94a3b8; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                      Accede a nuestro marketplace completo
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- CONTACT BAR -->
          <tr>
            <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin:0; font-size:14px; color:#475569; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                      ¿Tienes dudas? Escríbenos a 
                      <a href="mailto:info@capittal.es" style="color:#0f172a; font-weight:600; text-decoration:none;">info@capittal.es</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- FOOTER (VML for rounded corners in Outlook) -->
          <tr>
            <td align="center" style="padding:0;">
              
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" arcsize="3%" stroke="f" fill="t"
                style="width:600px; height:auto; mso-wrap-style:none;">
                <v:fill type="solid" color="#0f172a"/>
                <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
              <![endif]-->
              
              <!--[if !mso]><!-- -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0f172a; border-radius:0 0 20px 20px;">
                <tr>
                  <td>
              <!--<![endif]-->
              
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:36px 32px;">
                      <tr>
                        <td>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            
                            <!-- Logo Footer -->
                            <tr>
                              <td align="center" style="padding-bottom:20px;">
                                <p style="margin:0; font-size:18px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif; letter-spacing:1.5px;">
                                  CAPITTAL
                                </p>
                                <p style="margin:6px 0 0; font-size:12px; color:#64748b; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                                  Asesores en M&A y valoración de empresas
                                </p>
                              </td>
                            </tr>
                            
                            <!-- Social Icons -->
                            <tr>
                              <td align="center" style="padding-bottom:24px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding:0 10px;">
                                      <a href="https://www.linkedin.com/company/104311808" target="_blank" style="text-decoration:none;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" width="32" height="32" style="display:block; border-radius:6px;">
                                      </a>
                                    </td>
                                    <td style="padding:0 10px;">
                                      <a href="https://capittal.es" target="_blank" style="text-decoration:none;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Web" width="32" height="32" style="display:block; border-radius:6px;">
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            
                            <!-- Separator -->
                            <tr>
                              <td align="center" style="padding-bottom:20px;">
                                <table role="presentation" width="100" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="height:1px; background-color:#334155;"></td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            
                            <!-- Unsubscribe -->
                            <tr>
                              <td align="center">
                                <p style="margin:0 0 8px; font-size:12px; color:#64748b; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                                  Has recibido este email porque estás suscrito a nuestro newsletter.
                                </p>
                                <p style="margin:0; font-size:12px; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                                  <a href="{{unsubscribe}}" style="color:#94a3b8; text-decoration:underline;">Darse de baja</a>
                                  <span style="color:#475569; padding:0 8px;">·</span>
                                  <a href="{{update_profile}}" style="color:#94a3b8; text-decoration:underline;">Actualizar preferencias</a>
                                </p>
                              </td>
                            </tr>
                            
                            <!-- Copyright -->
                            <tr>
                              <td align="center" style="padding-top:20px;">
                                <p style="margin:0; font-size:11px; color:#475569; font-family:'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif;">
                                  © ${new Date().getFullYear()} Capittal. Todos los derechos reservados.
                                </p>
                              </td>
                            </tr>
                            
                          </table>
                        </td>
                      </tr>
                    </table>
              
              <!--[if !mso]><!-- -->
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
              
              <!--[if mso]>
                </v:textbox>
              </v:roundrect>
              <![endif]-->
              
            </td>
          </tr>
          
        </table>
        
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
        
      </td>
    </tr>
  </table>
  
</body>
</html>`;
}
