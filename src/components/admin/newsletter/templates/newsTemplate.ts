// News M&A Template
interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  featured_image_url: string | null;
  reading_time: number;
}

export function generateNewsHtml(
  articles: BlogArticle[],
  subject: string,
  introText: string,
  headerImageUrl?: string | null
): string {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const articlesHtml = articles.map((article, index) => `
    <!-- ARTÍCULO ${index + 1} -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background-color:#ffffff;">
          ${article.featured_image_url ? `
          <!-- Imagen -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <a href="https://capittal.es/recursos/blog/${article.slug}" target="_blank">
                  <img src="${article.featured_image_url}" alt="${article.title}" width="100%" style="display:block; max-height:200px; object-fit:cover;">
                </a>
              </td>
            </tr>
          </table>
          ` : ''}
          <!-- Contenido -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:24px;">
            <tr>
              <td>
                <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:600; color:#0f172a; background-color:#f1f5f9; border-radius:9999px; margin-bottom:12px;">
                  ${article.category}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;">
                <a href="https://capittal.es/recursos/blog/${article.slug}" target="_blank" style="text-decoration:none;">
                  <h3 style="margin:0; font-size:18px; font-weight:700; color:#0f172a; font-family:'Plus Jakarta Sans',Arial,sans-serif; line-height:1.3;">
                    ${article.title}
                  </h3>
                </a>
              </td>
            </tr>
            ${article.excerpt ? `
            <tr>
              <td style="padding-bottom:16px;">
                <p style="margin:0; font-size:14px; line-height:1.6; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                  ${article.excerpt}
                </p>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background-color:#0f172a; border-radius:6px;">
                      <a href="https://capittal.es/recursos/blog/${article.slug}" target="_blank" style="display:inline-block; padding:10px 20px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                        Leer artículo →
                      </a>
                    </td>
                    <td style="padding-left:12px; font-size:12px; color:#94a3b8; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      📖 ${article.reading_time} min lectura
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
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
  
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    ${articles.length} artículos de M&A seleccionados para ti – Capittal
  </div>
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:40px; text-align:center; border-radius:16px 16px 0 0;">
              <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                📰 CAPITTAL
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#94a3b8; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                Noticias M&A · ${currentDate}
              </p>
            </td>
          </tr>
          
          ${headerImageUrl ? `
          <!-- HEADER IMAGE -->
          <tr>
            <td>
              <img src="${headerImageUrl}" alt="Header" width="100%" style="display:block; max-height:250px; object-fit:cover;">
            </td>
          </tr>
          ` : ''}
          
          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff; padding:32px;" class="mobile-padding">
              
              <!-- INTRO -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="font-size:16px; line-height:1.6; color:#334155; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                    <p style="margin:0 0 16px;">Hola {{contact.FIRSTNAME}},</p>
                    <p style="margin:0;">
                      ${introText || 'Te compartimos los artículos más relevantes sobre M&A, valoración de empresas y tendencias del mercado.'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- ARTICLES -->
              ${articlesHtml}
              
              <!-- CTA BLOG -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0f172a; border-radius:8px;">
                          <a href="https://capittal.es/recursos/blog" target="_blank" style="display:inline-block; padding:16px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                            Ver todos los artículos →
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
                  <td align="center">
                    <p style="margin:0; font-size:11px; color:#94a3b8; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                      Has recibido este email porque estás suscrito a nuestro newsletter.<br>
                      <a href="{{unsubscribe}}" style="color:#64748b; text-decoration:underline;">Darse de baja</a>
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
