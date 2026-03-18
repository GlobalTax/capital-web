import pptxgen from 'pptxgenjs';

const NAVY = '161B22';
const WHITE = 'FFFFFF';
const BG_SECONDARY = 'F3F4F5';
const TEXT_SECONDARY = '58606E';
const TEXT_TERTIARY = '6B7280';

interface OperationData {
  company_name: string;
  sector: string;
  subsector?: string;
  description: string;
  short_description?: string | null;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number | null;
  ebitda_amount?: number | null;
  ebitda_multiple?: number | null;
  growth_percentage?: number | null;
  year: number;
  deal_type: string;
  status: string;
  company_size_employees?: string | null;
  highlights?: string[] | null;
  logo_url?: string | null;
}

type TemplateType = 'teaser' | 'cim' | 'pitch_deck';

const formatCurrencyPptx = (amount: number, currency: string): string => {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${symbol}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ${symbol}`;
  return `${amount.toLocaleString('es-ES')} ${symbol}`;
};

const getDealTypeLabel = (dt: string) => {
  const map: Record<string, string> = { sale: 'Venta', acquisition: 'Adquisición', merger: 'Fusión', partnership: 'Asociación' };
  return map[dt] || dt;
};

const getTemplateLabel = (t: TemplateType) => {
  const map: Record<TemplateType, string> = { teaser: 'Teaser', cim: 'Cuaderno de Información', pitch_deck: 'Pitch Deck' };
  return map[t];
};

const addFooter = (slide: pptxgen.Slide) => {
  slide.addText('CAPITTAL · Confidencial', {
    x: 0.5, y: 5.1, w: 9, h: 0.3,
    fontSize: 8, color: TEXT_TERTIARY, fontFace: 'Arial',
  });
};

// ─── SLIDE BUILDERS ───

const addPortada = (pres: pptxgen, op: OperationData, template: TemplateType) => {
  const slide = pres.addSlide();
  slide.background = { color: NAVY };

  slide.addText('CAPITTAL', {
    x: 0.5, y: 0.4, w: 4, h: 0.4,
    fontSize: 14, color: TEXT_TERTIARY, fontFace: 'Arial', bold: false, letterSpacing: 4,
  });

  slide.addText(op.company_name, {
    x: 0.5, y: 1.8, w: 9, h: 1.2,
    fontSize: 40, color: WHITE, fontFace: 'Arial', bold: true,
  });

  slide.addText(`${op.sector}${op.subsector ? ` · ${op.subsector}` : ''}`, {
    x: 0.5, y: 3.0, w: 9, h: 0.5,
    fontSize: 16, color: TEXT_TERTIARY, fontFace: 'Arial',
  });

  slide.addText(getTemplateLabel(template), {
    x: 0.5, y: 3.6, w: 3, h: 0.4,
    fontSize: 12, color: TEXT_SECONDARY, fontFace: 'Arial',
  });

  slide.addText('Documento confidencial · No distribuir', {
    x: 0.5, y: 4.8, w: 9, h: 0.3,
    fontSize: 9, color: TEXT_TERTIARY, fontFace: 'Arial', italic: true,
  });
};

const addResumenEjecutivo = (pres: pptxgen, op: OperationData) => {
  const slide = pres.addSlide();
  slide.addText('Resumen Ejecutivo', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 22, color: NAVY, fontFace: 'Arial', bold: true,
  });

  const desc = op.short_description || op.description || 'Sin descripción disponible.';
  slide.addText(desc.substring(0, 600), {
    x: 0.5, y: 1.0, w: 9, h: 1.5,
    fontSize: 12, color: TEXT_SECONDARY, fontFace: 'Arial', lineSpacingMultiple: 1.4,
  });

  if (op.highlights?.length) {
    const bullets = op.highlights.filter(Boolean).map(h => ({ text: h, options: { bullet: true, indentLevel: 0 } }));
    slide.addText(bullets as any, {
      x: 0.5, y: 2.8, w: 9, h: 2,
      fontSize: 11, color: NAVY, fontFace: 'Arial', lineSpacingMultiple: 1.5,
    });
  }
  addFooter(slide);
};

const addLaEmpresa = (pres: pptxgen, op: OperationData) => {
  const slide = pres.addSlide();
  slide.addText('La Empresa', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 22, color: NAVY, fontFace: 'Arial', bold: true,
  });

  const desc = op.description || '';
  slide.addText(desc.substring(0, 800), {
    x: 0.5, y: 1.0, w: 9, h: 2.0,
    fontSize: 11, color: TEXT_SECONDARY, fontFace: 'Arial', lineSpacingMultiple: 1.4,
  });

  const details = [
    ['Sector', `${op.sector}${op.subsector ? ` — ${op.subsector}` : ''}`],
    ['Empleados', op.company_size_employees || 'N/D'],
    ['Año', String(op.year)],
    ['Tipo', getDealTypeLabel(op.deal_type)],
  ];

  details.forEach(([label, value], i) => {
    const y = 3.4 + i * 0.4;
    slide.addText(`${label}:`, { x: 0.5, y, w: 2, h: 0.35, fontSize: 10, color: TEXT_TERTIARY, fontFace: 'Arial', bold: true });
    slide.addText(value, { x: 2.5, y, w: 7, h: 0.35, fontSize: 10, color: NAVY, fontFace: 'Arial' });
  });
  addFooter(slide);
};

const addFinancieros = (pres: pptxgen, op: OperationData) => {
  const slide = pres.addSlide();
  slide.addText('Datos Financieros', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 22, color: NAVY, fontFace: 'Arial', bold: true,
  });

  const metrics: [string, string][] = [
    ['Valoración', formatCurrencyPptx(op.valuation_amount, op.valuation_currency)],
  ];
  if (op.revenue_amount) metrics.push(['Facturación', formatCurrencyPptx(op.revenue_amount, op.valuation_currency)]);
  if (op.ebitda_amount) metrics.push(['EBITDA', formatCurrencyPptx(op.ebitda_amount, op.valuation_currency)]);
  if (op.ebitda_multiple) metrics.push(['Múltiplo EBITDA', `${op.ebitda_multiple}x`]);
  if (op.growth_percentage) metrics.push(['Crecimiento', `${op.growth_percentage}%`]);
  if (op.revenue_amount && op.ebitda_amount) {
    const margin = ((op.ebitda_amount / op.revenue_amount) * 100).toFixed(1);
    metrics.push(['Margen EBITDA', `${margin}%`]);
  }

  const cols = Math.min(metrics.length, 3);
  const cardW = 2.6;
  const gap = 0.3;
  const startX = 0.5;

  metrics.forEach(([label, value], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gap);
    const y = 1.2 + row * 1.6;

    slide.addShape(pres.ShapeType.rect as any, {
      x, y, w: cardW, h: 1.3,
      fill: { color: BG_SECONDARY }, rectRadius: 0.08,
    });
    slide.addText(label, { x: x + 0.2, y: y + 0.15, w: cardW - 0.4, h: 0.35, fontSize: 9, color: TEXT_TERTIARY, fontFace: 'Arial' });
    slide.addText(value, { x: x + 0.2, y: y + 0.55, w: cardW - 0.4, h: 0.5, fontSize: 20, color: NAVY, fontFace: 'Arial', bold: true });
  });
  addFooter(slide);
};

const addTesisInversion = (pres: pptxgen, op: OperationData) => {
  const slide = pres.addSlide();
  slide.addText('Tesis de Inversión', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 22, color: NAVY, fontFace: 'Arial', bold: true,
  });

  const items = op.highlights?.filter(Boolean) || ['Información no disponible'];
  const bullets = items.map(h => ({ text: h, options: { bullet: true, indentLevel: 0 } }));

  slide.addText(bullets as any, {
    x: 0.5, y: 1.2, w: 9, h: 3.5,
    fontSize: 12, color: NAVY, fontFace: 'Arial', lineSpacingMultiple: 1.6,
  });
  addFooter(slide);
};

const addProcesoMA = (pres: pptxgen, op: OperationData) => {
  const slide = pres.addSlide();
  slide.addText('Proceso M&A', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 22, color: NAVY, fontFace: 'Arial', bold: true,
  });

  const steps = [
    { label: '1. NDA & Teaser', desc: 'Firma de acuerdo de confidencialidad y envío de teaser.' },
    { label: '2. Cuaderno de Información', desc: 'Acceso al CIM con información financiera y operativa detallada.' },
    { label: '3. Indicación de Interés', desc: 'Presentación de oferta indicativa no vinculante.' },
    { label: '4. Due Diligence', desc: 'Proceso de auditoría legal, financiera y operativa.' },
    { label: '5. Oferta Vinculante', desc: 'Negociación y firma del SPA.' },
    { label: '6. Cierre', desc: 'Transferencia de acciones y cierre de la operación.' },
  ];

  steps.forEach((step, i) => {
    const y = 1.1 + i * 0.6;
    slide.addText(step.label, { x: 0.5, y, w: 3, h: 0.4, fontSize: 11, color: NAVY, fontFace: 'Arial', bold: true });
    slide.addText(step.desc, { x: 3.5, y, w: 6, h: 0.4, fontSize: 10, color: TEXT_SECONDARY, fontFace: 'Arial' });
  });
  addFooter(slide);
};

const addContacto = (pres: pptxgen) => {
  const slide = pres.addSlide();
  slide.background = { color: NAVY };

  slide.addText('Contacto', {
    x: 0.5, y: 0.5, w: 9, h: 0.5,
    fontSize: 22, color: WHITE, fontFace: 'Arial', bold: true,
  });

  const lines = [
    'CAPITTAL',
    'Asesoramiento en compraventa de empresas',
    '',
    'info@capittal.es',
    'www.capittal.es',
    '',
    'Este documento es confidencial y ha sido preparado',
    'exclusivamente para el destinatario.',
  ];

  slide.addText(lines.join('\n'), {
    x: 0.5, y: 1.5, w: 9, h: 3,
    fontSize: 13, color: TEXT_TERTIARY, fontFace: 'Arial', lineSpacingMultiple: 1.5,
  });
};

// ─── MAIN ───

export type SectionKey = 'portada' | 'resumen' | 'empresa' | 'financieros' | 'tesis' | 'proceso' | 'contacto';

export const SECTION_LABELS: Record<SectionKey, string> = {
  portada: 'Portada',
  resumen: 'Resumen Ejecutivo',
  empresa: 'La Empresa',
  financieros: 'Financieros',
  tesis: 'Tesis de Inversión',
  proceso: 'Proceso M&A',
  contacto: 'Contacto',
};

export const ALL_SECTIONS: SectionKey[] = ['portada', 'resumen', 'empresa', 'financieros', 'tesis', 'proceso', 'contacto'];

export async function generateOperationPptx(
  operation: OperationData,
  sections: SectionKey[],
  template: TemplateType
): Promise<void> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'Capittal';
  pres.title = `${operation.company_name} — ${getTemplateLabel(template)}`;

  const builders: Record<SectionKey, () => void> = {
    portada: () => addPortada(pres, operation, template),
    resumen: () => addResumenEjecutivo(pres, operation),
    empresa: () => addLaEmpresa(pres, operation),
    financieros: () => addFinancieros(pres, operation),
    tesis: () => addTesisInversion(pres, operation),
    proceso: () => addProcesoMA(pres, operation),
    contacto: () => addContacto(pres),
  };

  for (const s of ALL_SECTIONS) {
    if (sections.includes(s)) builders[s]();
  }

  const safeName = operation.company_name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').trim().replace(/\s+/g, '_');
  await pres.writeFile({ fileName: `${getTemplateLabel(template)}_${safeName}.pptx` });
}
