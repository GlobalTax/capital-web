// Educational Template - Guides, tips, M&A education
import { ContentBlock } from '../ContentBlockEditor';

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  reading_time: number;
}

export function generateEducationalHtml(
  blocks: ContentBlock[],
  subject: string,
  relatedArticles?: RelatedArticle[],
  headerImageUrl?: string | null
): string {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const blocksHtml = blocks.map((block) => {
    if (block.type === 'text') {
      return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
          <td style="font-size:16px; line-height:1.8; color:#334155; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
            ${block.content.split('\n').map(p => `<p style="margin:0 0 16px;">${p}</p>`).join('')}
          </td>
        </tr>
      </table>`;
    }

    if (block.type === 'cta' && block.ctaUrl && block.ctaText) {
      return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:#0f172a; border-radius:8px;">
                  <a href="${block.ctaUrl}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                    ${block.ctaText}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
    }

    if (block.type === 'image' && block.content) {
      return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <img src="${block.content}" alt="Imagen" style="max-width:100%; height:auto; border-radius:12px; display:block;">
          </td>
        </tr>
      </table>`;
    }

    return '';
  }).join('\n');

  const relatedArticlesHtml = relatedArticles && relatedArticles.length > 0 ? `
    <!-- RELATED ARTICLES -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px; padding-top:32px; border-top:1px solid #e2e8f0;">
      <tr>
        <td style="padding-bottom:16px;">
          <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
            📚 Artículos relacionados
          </h3>
        </td>
      </tr>
      ${relatedArticles.map(article => `
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
          <a href="https://capittal.es/recursos/blog/${article.slug}" target="_blank" style="text-decoration:none;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                    ${article.title}
                  </p>
                  <p style="margin:4px 0 0; font-size:12px; color:#64748b; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                    ${article.category} · ${article.reading_time} min lectura
                  </p>
                </td>
                <td width="60" align="right">
                  <span style="color:#64748b;">→</span>
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
      `).join('')}
    </table>
  ` : '';

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
    Contenido educativo sobre M&A y valoración de empresas – Capittal
  </div>
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:40px; text-align:center; border-radius:16px 16px 0 0;">
              <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                🎓 CAPITTAL
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#94a3b8; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                Contenido Educativo · ${currentDate}
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
            <td style="background-color:#ffffff; padding:40px;" class="mobile-padding">
              
              <!-- GREETING -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="font-size:16px; line-height:1.6; color:#334155; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                    <p style="margin:0;">Hola {{contact.FIRSTNAME}},</p>
                  </td>
                </tr>
              </table>
              
              <!-- CONTENT BLOCKS -->
              ${blocksHtml}
              
              ${relatedArticlesHtml}
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0f172a; border-radius:8px;">
                          <a href="https://capittal.es/recursos/blog" target="_blank" style="display:inline-block; padding:16px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; font-family:'Plus Jakarta Sans',Arial,sans-serif;">
                            Explorar más contenido →
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
