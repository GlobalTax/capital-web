/**
 * Builds the pre-call email preview HTML, replicating the Edge Function template.
 */

interface PrecallEmailPreviewParams {
  contactName: string;
  companyName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  ccNames: string[]; // First names of visible CC recipients
}

interface PrecallEmailPreview {
  subject: string;
  htmlBody: string;
  from: string;
  to: string;
  ccList: string[];
}

export function buildPrecallEmailPreview(
  params: PrecallEmailPreviewParams & { to: string; ccEmails: string[] }
): PrecallEmailPreview {
  const { contactName, companyName, senderName, senderEmail, senderPhone, ccNames, to, ccEmails } = params;

  const senderFirstName = senderName.split(' ')[0];
  const saludo = contactName ? `Apreciado ${contactName.split(' ')[0]},` : 'Apreciado/a,';

  const ccMention = ccNames.length > 0
    ? `Pongo en copia a mis compañeros ${ccNames.slice(0, -1).join(', ')}${ccNames.length > 1 ? ' y ' : ''}${ccNames[ccNames.length - 1]}.`
    : '';

  const subject = `Capittal - Comentamos la valoración de ${companyName}`;

  const htmlBody = `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#ffffff;">
      <div style="color:#111827; font-size:15px; line-height:1.7;">
        <p style="margin:0 0 18px;">${saludo}</p>
        
        <p style="margin:0 0 18px;">
          Soy ${senderFirstName}, del equipo de fusiones y adquisiciones de Capittal. Encantado de saludarte.${ccMention ? ` ${ccMention}` : ''}
        </p>
        
        <p style="margin:0 0 18px;">
          Me pongo en contacto contigo dado que hemos recibido tu respuesta a nuestro formulario web de valoración automática de empresas y, tras analizar vuestra actividad, así como la información disponible en el Registro Mercantil, nos ha parecido muy interesante conocer más acerca de vuestro proyecto y situación actual.
        </p>
        
        <p style="margin:0 0 18px;">
          Desconozco si estáis valorando una posible venta, si os ha contactado algún inversor, o simplemente queréis tener una referencia del valor de la empresa. En cualquier caso, me gustaría poder hablar contigo para entender mejor vuestra situación.
        </p>
        
        <p style="margin:0 0 18px;">
          Si te parece bien, intentaré llamarte a lo largo del día de mañana. Si prefieres, también podemos organizar una videollamada o indicarme el horario que mejor te encaje.
        </p>
        
        <p style="margin:0 0 18px;">
          Te dejo mi número: <strong>${senderPhone}</strong> por si prefieres llamarme tú directamente.
        </p>
        
        <p style="margin:0 0 8px;">Un cordial saludo,</p>
        <p style="margin:0 0 4px; font-weight:600; color:#1f2937;">${senderName}</p>
        <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Fusiones y Adquisiciones · Capittal</p>
        <p style="margin:0; font-size:13px; color:#9ca3af;">📞 ${senderPhone} · 📧 ${senderEmail}</p>
      </div>
    </div>
  `;

  return {
    subject,
    htmlBody,
    from: `${senderName} <${senderEmail}>`,
    to,
    ccList: ccEmails,
  };
}
