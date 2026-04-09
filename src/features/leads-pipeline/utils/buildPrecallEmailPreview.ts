/**
 * Builds the pre-call email preview HTML with 6 variants:
 * valoracion-cast, venta-cast, valoracion-cat, venta-cat, compra-cast, compra-cat
 */

export type EmailVariant = 'valoracion-cast' | 'venta-cast' | 'valoracion-cat' | 'venta-cat' | 'compra-cast' | 'compra-cat';

export interface EmailVariantOption {
  variant: EmailVariant;
  label: string;
}

export const SELL_PIPELINE_VARIANTS: EmailVariantOption[] = [
  { variant: 'valoracion-cast', label: 'Valoración - Castellano' },
  { variant: 'venta-cast', label: 'Venta - Castellano' },
  { variant: 'valoracion-cat', label: 'Valoració - Català' },
  { variant: 'venta-cat', label: 'Venda - Català' },
];

export const BUY_PIPELINE_VARIANTS: EmailVariantOption[] = [
  { variant: 'compra-cast', label: 'Compra - Castellano' },
  { variant: 'compra-cat', label: 'Compra - Català' },
];

interface PrecallEmailPreviewParams {
  contactName: string;
  companyName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  ccNames: string[]; // First names of visible CC recipients
  variant?: EmailVariant;
}

export interface PrecallEmailPreview {
  subject: string;
  htmlBody: string;
  from: string;
  to: string;
  ccList: string[];
}

function buildCcMention(ccNames: string[], lang: 'cast' | 'cat'): string {
  if (ccNames.length === 0) return '';
  const prefix = lang === 'cat' ? 'Poso en còpia els meus companys' : 'Pongo en copia a mis compañeros';
  if (ccNames.length === 1) return `${prefix} ${ccNames[0]}.`;
  const conjunction = lang === 'cat' ? ' i ' : ' y ';
  return `${prefix} ${ccNames.slice(0, -1).join(', ')}${conjunction}${ccNames[ccNames.length - 1]}.`;
}

function buildBody(params: {
  saludo: string;
  intro: string;
  ccMention: string;
  paragraphs: string[];
  phoneBlock: string;
  closing: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
}): string {
  const { saludo, intro, ccMention, paragraphs, phoneBlock, closing, senderName, senderPhone, senderEmail } = params;

  const pStyle = 'style="margin:0 0 18px;"';
  const ccText = ccMention ? ` ${ccMention}` : '';

  const bodyParagraphs = paragraphs.map(p => `<p ${pStyle}>${p}</p>`).join('\n        ');

  return `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#ffffff;">
      <div style="color:#111827; font-size:15px; line-height:1.7;">
        <p ${pStyle}>${saludo}</p>
        
        <p ${pStyle}>${intro}${ccText}</p>
        
        ${bodyParagraphs}
        
        <p ${pStyle}>${phoneBlock}</p>
        
        <p style="margin:0 0 8px;">${closing}</p>
        <p style="margin:0 0 4px; font-weight:600; color:#1f2937;">${senderName}</p>
        <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Fusiones y Adquisiciones · Capittal</p>
        <p style="margin:0; font-size:13px; color:#9ca3af;">${senderPhone} · ${senderEmail}</p>
      </div>
    </div>
  `;
}

export function buildPrecallEmailPreview(
  params: PrecallEmailPreviewParams & { to: string; ccEmails: string[] }
): PrecallEmailPreview {
  const { contactName, companyName, senderName, senderEmail, senderPhone, ccNames, to, ccEmails, variant = 'valoracion-cast' } = params;

  const senderFirstName = senderName.split(' ')[0];
  const contactFirstName = contactName ? contactName.split(' ')[0] : '';
  const lang = variant.endsWith('-cat') ? 'cat' : 'cast';
  const ccMention = buildCcMention(ccNames, lang);

  const subject = `Consulta M&A | ${companyName} <> Capittal`;

  let saludo: string;
  let intro: string;
  let paragraphs: string[];
  let phoneBlock: string;
  let closing: string;

  switch (variant) {
    case 'valoracion-cast':
      saludo = contactFirstName ? `Apreciado ${contactFirstName},` : 'Apreciado/a,';
      intro = `Soy ${senderFirstName}, del equipo de fusiones y adquisiciones de Capittal. Encantado de saludarte.`;
      paragraphs = [
        'Me pongo en contacto contigo dado que hemos recibido tu respuesta a nuestro formulario web de valoración automática de empresas y, tras analizar vuestra actividad, así como la información disponible en el Registro Mercantil, nos ha parecido muy interesante conocer más acerca de vuestro proyecto y situación actual.',
        'Desconozco si estáis valorando una posible venta, si os ha contactado algún inversor, o simplemente queréis tener una referencia del valor de la empresa. En cualquier caso, me gustaría poder hablar contigo para entender mejor vuestra situación.',
        'Si te parece bien, intentaré llamarte a lo largo del día de mañana. Si prefieres, también podemos organizar una videollamada o indicarme el horario que mejor te encaje.',
      ];
      phoneBlock = `Te dejo mi número: ${senderPhone} por si prefieres llamarme tú directamente.`;
      closing = 'Un cordial saludo,';
      break;

    case 'venta-cast':
      saludo = contactFirstName ? `Apreciado ${contactFirstName},` : 'Apreciado/a,';
      intro = `Encantado de saludarte. Soy ${senderFirstName}, miembro del equipo de Capittal.`;
      paragraphs = [
        'Hemos recibido recientemente una solicitud a través de nuestro formulario interesándose por nuestros servicios de asesoramiento en compraventa de empresas. Tras analizar vuestra actividad y la información disponible, nos ha parecido especialmente interesante el trabajo que realizáis.',
        'Desconozco si estáis valorando una posible venta, si os ha contactado algún inversor, o simplemente queréis tener una referencia del valor de la empresa. En cualquier caso, me gustaría poder hablar contigo para entender mejor vuestra situación.',
        'Si te parece bien, intentaré llamarte a lo largo del día de mañana. Si prefieres, también podemos organizar una videollamada o indicarme el horario que mejor te encaje.',
      ];
      phoneBlock = `Te dejo mi número: ${senderPhone} por si prefieres llamarme tú directamente.`;
      closing = 'Quedo a tu disposición para cualquier duda o comentario.<br><br>Un cordial saludo,';
      break;

    case 'valoracion-cat':
      saludo = contactFirstName ? `Apreciat ${contactFirstName},` : 'Apreciat/ada,';
      intro = `Soc ${senderFirstName}, de l'equip de fusions i adquisicions de Capittal. Encantat de saludar-te.`;
      paragraphs = [
        'Em poso en contacte amb tu perquè hem rebut la teva resposta al nostre formulari web de valoració automàtica d\'empreses i, després d\'analitzar la vostra activitat, així com la informació disponible al Registre Mercantil, ens ha semblat molt interessant conèixer més sobre el vostre projecte i la vostra situació actual.',
        'Desconec si esteu valorant una possible venda, si us ha contactat algun inversor, o simplement voleu tenir una referència del valor de l\'empresa. En qualsevol cas, m\'agradaria poder parlar amb tu per entendre millor la vostra situació.',
        'Si et sembla bé, intentaré trucar-te al llarg del dia de demà. Si ho prefereixes, també podem organitzar una videotrucada o bé em pots indicar l\'horari que millor et vagi.',
      ];
      phoneBlock = `Et deixo el meu número: ${senderPhone} per si prefereixes trucar-me directament.`;
      closing = 'Una cordial salutació,';
      break;

    case 'venta-cat':
      saludo = contactFirstName ? `Benvolgut ${contactFirstName},` : 'Benvolgut/da,';
      intro = `Encantat de saludar-te. Soc ${senderFirstName}, membre de l'equip de Capittal.`;
      paragraphs = [
        'Hem rebut recentment una sol·licitud a través del nostre formulari interessant-se pels nostres serveis d\'assessorament en compravenda d\'empreses. Després d\'analitzar la vostra activitat i la informació disponible, ens ha semblat especialment interessant la feina que realitzeu.',
        'Desconec si esteu valorant una possible venda, si us ha contactat algun inversor, o simplement voleu tenir una referència del valor de l\'empresa. En qualsevol cas, m\'agradaria poder parlar amb tu per entendre millor la vostra situació.',
        'Si et sembla bé, intentaré trucar-te al llarg del dia de demà. Si ho prefereixes, també podem organitzar una videotrucada o indicar-me l\'horari que millor et vagi.',
      ];
      phoneBlock = `Et deixo el meu número: ${senderPhone} per si prefereixes trucar-me tu directament.`;
      closing = 'Quedo a la teva disposició per a qualsevol dubte o comentari.<br><br>Una cordial salutació,';
      break;

    case 'compra-cast':
      saludo = contactFirstName ? `Apreciado ${contactFirstName},` : 'Apreciado/a,';
      intro = `Soy ${senderFirstName}, del equipo de fusiones y adquisiciones de Capittal. Encantado de saludarte.`;
      paragraphs = [
        'Me pongo en contacto contigo porque hemos recibido tu consulta relacionada con la adquisición de empresas. Tras analizar tu perfil e intereses, nos ha parecido muy interesante poder conversar sobre las oportunidades que encajen con lo que estás buscando.',
        'Desconozco si ya tenéis un mandato de compra en curso, si estáis explorando el mercado, o si simplemente queréis conocer las oportunidades disponibles. En cualquier caso, me gustaría hablar contigo para entender mejor vuestras necesidades y criterios de inversión.',
        'Si te parece bien, intentaré llamarte a lo largo del día de mañana. Si prefieres, también podemos organizar una videollamada o indicarme el horario que mejor te encaje.',
      ];
      phoneBlock = `Te dejo mi número: ${senderPhone} por si prefieres llamarme tú directamente.`;
      closing = 'Un cordial saludo,';
      break;

    case 'compra-cat':
      saludo = contactFirstName ? `Apreciat ${contactFirstName},` : 'Apreciat/ada,';
      intro = `Soc ${senderFirstName}, de l'equip de fusions i adquisicions de Capittal. Encantat de saludar-te.`;
      paragraphs = [
        'Em poso en contacte amb tu perquè hem rebut la teva consulta relacionada amb l\'adquisició d\'empreses. Després d\'analitzar el teu perfil i interessos, ens ha semblat molt interessant poder conversar sobre les oportunitats que encaixin amb el que esteu buscant.',
        'Desconec si ja teniu un mandat de compra en curs, si esteu explorant el mercat, o si simplement voleu conèixer les oportunitats disponibles. En qualsevol cas, m\'agradaria parlar amb tu per entendre millor les vostres necessitats i criteris d\'inversió.',
        'Si et sembla bé, intentaré trucar-te al llarg del dia de demà. Si ho prefereixes, també podem organitzar una videotrucada o bé em pots indicar l\'horari que millor et vagi.',
      ];
      phoneBlock = `Et deixo el meu número: ${senderPhone} per si prefereixes trucar-me directament.`;
      closing = 'Una cordial salutació,';
      break;
  }

  const htmlBody = buildBody({
    saludo,
    intro,
    ccMention,
    paragraphs,
    phoneBlock,
    closing,
    senderName,
    senderPhone,
    senderEmail,
  });

  return {
    subject,
    htmlBody,
    from: `${senderName} <${senderEmail}>`,
    to,
    ccList: ccEmails,
  };
}
