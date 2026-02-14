// Newsletter Export Utilities - Multiple format support

export type ExportFormat = 'html' | 'mjml' | 'brevo-json' | 'zip';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  subject?: string;
  includeImages?: boolean;
}

// Convert HTML to MJML (basic conversion)
const htmlToMjml = (html: string, subject?: string): string => {
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  
  // Basic MJML wrapper
  return `<mjml>
  <mj-head>
    <mj-title>${subject || 'Newsletter'}</mj-title>
    <mj-preview>${subject || 'Newsletter preview'}</mj-preview>
    <mj-attributes>
      <mj-all font-family="Arial, Helvetica, sans-serif" />
      <mj-text font-size="14px" line-height="1.6" color="#333333" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section>
      <mj-column>
        <mj-raw>
          ${bodyContent}
        </mj-raw>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
};

// Convert to Brevo JSON format
const htmlToBrevoJson = (html: string, subject?: string): object => {
  return {
    sender: {
      name: "Capittal",
      email: "newsletter@capittal.es"
    },
    subject: subject || "Newsletter",
    htmlContent: html,
    params: {
      FIRSTNAME: "{{contact.FIRSTNAME}}",
      LASTNAME: "{{contact.LASTNAME}}",
      EMAIL: "{{contact.EMAIL}}"
    },
    templateId: null,
    createdAt: new Date().toISOString()
  };
};

// Extract and encode images as base64 for ZIP export
const extractImagesFromHtml = (html: string): { src: string; filename: string }[] => {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const images: { src: string; filename: string }[] = [];
  let match;
  let index = 0;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const extension = src.split('.').pop()?.split('?')[0] || 'png';
      images.push({
        src,
        filename: `image_${index}.${extension}`
      });
      index++;
    }
  }
  
  return images;
};

// Main export function
export const exportNewsletter = async (
  html: string,
  options: ExportOptions
): Promise<void> => {
  const { format, filename, subject } = options;
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = filename || `newsletter-${timestamp}`;

  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'mjml':
      content = htmlToMjml(html, subject);
      mimeType = 'text/plain';
      extension = 'mjml';
      break;

    case 'brevo-json':
      content = JSON.stringify(htmlToBrevoJson(html, subject), null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;

    case 'zip':
      // For ZIP, we need to create a more complex structure
      // This is a simplified version - in production you'd use JSZip
      const images = extractImagesFromHtml(html);
      
      // Create a simple HTML file with local image references
      let localHtml = html;
      images.forEach((img, idx) => {
        localHtml = localHtml.replace(img.src, `images/image_${idx}.${img.src.split('.').pop()?.split('?')[0] || 'png'}`);
      });
      
      // For now, just download the HTML with a note about images
      const zipContent = `<!-- 
Newsletter Export - ${timestamp}
Images to download manually:
${images.map(img => `- ${img.src}`).join('\n')}
-->
${localHtml}`;
      
      content = zipContent;
      mimeType = 'text/html';
      extension = 'html';
      break;

    case 'html':
    default:
      content = html;
      mimeType = 'text/html';
      extension = 'html';
      break;
  }

  // Create and download file
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseFilename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export format options for UI
export const exportFormatOptions = [
  {
    id: 'html' as ExportFormat,
    name: 'HTML',
    description: 'Código HTML listo para Brevo',
    icon: 'FileCode',
  },
  {
    id: 'mjml' as ExportFormat,
    name: 'MJML',
    description: 'Formato MJML para editores avanzados',
    icon: 'FileText',
  },
  {
    id: 'brevo-json' as ExportFormat,
    name: 'Brevo JSON',
    description: 'Formato JSON para API de Brevo',
    icon: 'FileJson',
  },
  {
    id: 'zip' as ExportFormat,
    name: 'HTML + Imágenes',
    description: 'HTML con referencias a imágenes locales',
    icon: 'Archive',
  },
];
