import pptxgen from 'pptxgenjs';

// ─── DESIGN TOKENS ───
const BLACK = '000000';
const NAVY = '161B22';
const WHITE = 'FFFFFF';
const TEXT_SECONDARY = '58606E';
const TEXT_TERTIARY = '6B7280';
const TEXT_MUTED = '8B919B';
const BORDER = 'E2E4E8';
const BG_CARD = 'F3F4F5';
const FONT = 'Plus Jakarta Sans';

// Slide dimensions (widescreen 13.33 x 7.5)
const SW = 13.33;
const SH = 7.5;
const M = 0.5; // margin

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
  expected_market_text?: string | null;
  project_status?: string | null;
}

type TemplateType = 'teaser' | 'cim' | 'pitch_deck';

// ─── HELPERS ───

const now = new Date();
const MONTH_YEAR = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
const YEAR = String(now.getFullYear());

const fmtCurrency = (amount: number, currency: string): string => {
  const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${sym}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ${sym}`;
  return `${amount.toLocaleString('es-ES')} ${sym}`;
};

const dealLabel = (dt: string) => {
  const m: Record<string, string> = { sale: 'Venta', acquisition: 'Adquisición', merger: 'Fusión', partnership: 'Asociación' };
  return m[dt] || dt;
};

const statusLabel = (s: string) => {
  const m: Record<string, string> = { available: 'Disponible', negotiation: 'En Negociación', sold: 'Vendida', withdrawn: 'Retirada' };
  return m[s] || s;
};

// ─── FOOTER (content slides only) ───

let slideNum = 0;

const addFooter = (slide: pptxgen.Slide) => {
  slideNum++;
  const y = SH - 0.4;
  slide.addText(`Material de Debate – ${MONTH_YEAR}`, {
    x: M, y, w: 4, h: 0.3,
    fontSize: 8, color: TEXT_TERTIARY, fontFace: FONT,
  });
  slide.addText('Capittal', {
    x: SW / 2 - 1, y, w: 2, h: 0.3,
    fontSize: 8, color: TEXT_TERTIARY, fontFace: FONT, align: 'center',
  });
  slide.addText(String(slideNum), {
    x: SW - M - 1, y, w: 1, h: 0.3,
    fontSize: 8, color: TEXT_TERTIARY, fontFace: FONT, align: 'right',
  });
};

// ─── SECTION SEPARATOR ───

const addSectionSeparator = (pres: pptxgen, title: string) => {
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText(title, {
    x: M, y: SH / 2 - 0.5, w: SW - M * 2, h: 1,
    fontSize: 36, color: WHITE, fontFace: FONT, bold: true, valign: 'middle',
  });
};

// ─── COVER SLIDE ───

const addCover = (pres: pptxgen, op: OperationData) => {
  const slide = pres.addSlide();
  slide.background = { color: BLACK };

  // Company name — bottom left
  slide.addText(op.company_name, {
    x: M, y: SH - 2.8, w: SW - M * 2, h: 1.2,
    fontSize: 44, color: WHITE, fontFace: FONT, bold: true, valign: 'bottom',
  });

  // Sector + deal type
  slide.addText(`${op.sector}${op.subsector ? ` · ${op.subsector}` : ''} · ${dealLabel(op.deal_type)}`, {
    x: M, y: SH - 1.5, w: SW - M * 2 - 4, h: 0.4,
    fontSize: 16, color: TEXT_MUTED, fontFace: FONT,
  });

  // Date
  slide.addText(MONTH_YEAR, {
    x: M, y: SH - 1.0, w: 4, h: 0.35,
    fontSize: 11, color: TEXT_TERTIARY, fontFace: FONT,
  });

  // Branding — bottom right
  slide.addText('CAPITTAL M&A · CONSULTING', {
    x: SW - M - 4, y: SH - 1.0, w: 4, h: 0.35,
    fontSize: 9, color: WHITE, fontFace: FONT, align: 'right',
  });
};

// ─── CONTENT SLIDE HELPERS ───

const addContentSlide = (pres: pptxgen, opts: {
  overline: string;
  title: string;
  subtitle?: string;
}) => {
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  // Overline
  slide.addText(opts.overline.toUpperCase(), {
    x: M, y: M, w: SW - M * 2, h: 0.3,
    fontSize: 9, color: TEXT_TERTIARY, fontFace: FONT,
  });

  // Title
  slide.addText(opts.title, {
    x: M, y: M + 0.4, w: SW - M * 2, h: 0.6,
    fontSize: 28, color: NAVY, fontFace: FONT, bold: true,
  });

  // Subtitle
  if (opts.subtitle) {
    slide.addText(opts.subtitle, {
      x: M, y: M + 1.1, w: SW - M * 2, h: 0.4,
      fontSize: 14, color: TEXT_SECONDARY, fontFace: FONT,
    });
  }

  addFooter(slide);
  return slide;
};

// ─── SLIDE BUILDERS ───

const buildResumenEjecutivo = (pres: pptxgen, op: OperationData) => {
  addSectionSeparator(pres, 'Resumen Ejecutivo');

  const slide = addContentSlide(pres, {
    overline: 'Resumen Ejecutivo',
    title: op.company_name,
    subtitle: `${op.sector} · ${dealLabel(op.deal_type)}`,
  });

  const desc = op.short_description || op.description || '';
  if (desc) {
    slide.addText(desc.substring(0, 800), {
      x: M, y: 1.9, w: SW - M * 2, h: 2.0,
      fontSize: 11, color: NAVY, fontFace: FONT, lineSpacingMultiple: 1.5,
    });
  }

  // Highlights as bullets
  if (op.highlights?.filter(Boolean).length) {
    const bullets = op.highlights.filter(Boolean).map(h => ({
      text: h,
      options: { bullet: true, indentLevel: 0 },
    }));
    slide.addText(bullets as any, {
      x: M, y: 4.1, w: SW - M * 2, h: 2.5,
      fontSize: 11, color: NAVY, fontFace: FONT, lineSpacingMultiple: 1.5,
    });
  }
};

const buildEmpresa = (pres: pptxgen, op: OperationData) => {
  addSectionSeparator(pres, 'La Empresa');

  const slide = addContentSlide(pres, {
    overline: 'La Empresa',
    title: op.company_name,
  });

  // Description
  const desc = op.description || '';
  if (desc) {
    slide.addText(desc.substring(0, 1000), {
      x: M, y: 1.6, w: SW - M * 2, h: 2.5,
      fontSize: 11, color: TEXT_SECONDARY, fontFace: FONT, lineSpacingMultiple: 1.4,
    });
  }

  // Details table
  const rows: string[][] = [
    ['Sector', `${op.sector}${op.subsector ? ` — ${op.subsector}` : ''}`],
    ['Empleados', op.company_size_employees || 'N/D'],
    ['Año', String(op.year)],
    ['Tipo de operación', dealLabel(op.deal_type)],
    ['Estado', statusLabel(op.status)],
  ];

  slide.addTable(
    rows.map(([k, v]) => [
      { text: k, options: { fontSize: 10, color: TEXT_TERTIARY, fontFace: FONT, bold: true } },
      { text: v, options: { fontSize: 10, color: NAVY, fontFace: FONT } },
    ]) as any,
    {
      x: M, y: 4.4, w: 6, h: 2,
      border: { type: 'dash', pt: 0.5, color: BORDER },
      colW: [2.5, 3.5],
      rowH: 0.35,
    }
  );
};

const buildFinancieros = (pres: pptxgen, op: OperationData) => {
  addSectionSeparator(pres, 'Financieros');

  const slide = addContentSlide(pres, {
    overline: 'Datos Financieros',
    title: 'Resumen Financiero',
    subtitle: `Cifras en ${op.valuation_currency}`,
  });

  // Build KPI cards
  const kpis: { label: string; value: string }[] = [];
  kpis.push({ label: 'Valoración', value: fmtCurrency(op.valuation_amount, op.valuation_currency) });
  if (op.revenue_amount) kpis.push({ label: 'Facturación', value: fmtCurrency(op.revenue_amount, op.valuation_currency) });
  if (op.ebitda_amount) kpis.push({ label: 'EBITDA', value: fmtCurrency(op.ebitda_amount, op.valuation_currency) });
  if (op.ebitda_multiple) kpis.push({ label: 'Múltiplo EBITDA', value: `${op.ebitda_multiple}x` });
  if (op.growth_percentage) kpis.push({ label: 'Crecimiento', value: `${op.growth_percentage}%` });
  if (op.revenue_amount && op.ebitda_amount) {
    const margin = ((op.ebitda_amount / op.revenue_amount) * 100).toFixed(1);
    kpis.push({ label: 'Margen EBITDA', value: `${margin}%` });
  }

  const cols = Math.min(kpis.length, 4);
  const gap = 0.3;
  const cardW = (SW - M * 2 - gap * (cols - 1)) / cols;
  const startY = 2.0;

  kpis.forEach((kpi, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = M + col * (cardW + gap);
    const y = startY + row * 2.0;

    // Card border
    slide.addShape(pres.ShapeType.rect as any, {
      x, y, w: cardW, h: 1.6,
      fill: { color: WHITE },
      line: { color: BORDER, width: 0.75, dashType: 'solid' },
      rectRadius: 0.05,
    });

    // Value
    slide.addText(kpi.value, {
      x: x + 0.3, y: y + 0.25, w: cardW - 0.6, h: 0.7,
      fontSize: 36, color: NAVY, fontFace: FONT, valign: 'middle',
    });

    // Label
    slide.addText(kpi.label, {
      x: x + 0.3, y: y + 1.0, w: cardW - 0.6, h: 0.35,
      fontSize: 11, color: TEXT_SECONDARY, fontFace: FONT,
    });
  });
};

const buildTesisInversion = (pres: pptxgen, op: OperationData) => {
  const items = op.highlights?.filter(Boolean);
  if (!items?.length) return; // skip if no data

  addSectionSeparator(pres, 'Tesis de Inversión');

  const slide = addContentSlide(pres, {
    overline: 'Tesis de Inversión',
    title: 'Razones para invertir',
  });

  const bullets = items.map(h => ({
    text: h,
    options: { bullet: true, indentLevel: 0 },
  }));

  slide.addText(bullets as any, {
    x: M, y: 1.8, w: SW - M * 2, h: 4.5,
    fontSize: 12, color: NAVY, fontFace: FONT, lineSpacingMultiple: 1.7,
  });
};

const buildProcesoMA = (pres: pptxgen, op: OperationData) => {
  addSectionSeparator(pres, 'Proceso M&A');

  const slide = addContentSlide(pres, {
    overline: 'Proceso M&A',
    title: 'Fases del proceso',
    subtitle: `Tipo: ${dealLabel(op.deal_type)} · Estado: ${statusLabel(op.status)}`,
  });

  const steps = [
    ['1', 'NDA & Teaser', 'Firma de acuerdo de confidencialidad y envío del teaser de la operación.'],
    ['2', 'Cuaderno de Información', 'Acceso al CIM con información financiera y operativa detallada.'],
    ['3', 'Indicación de Interés', 'Presentación de oferta indicativa no vinculante (IOI).'],
    ['4', 'Due Diligence', 'Proceso de auditoría legal, financiera y operativa.'],
    ['5', 'Oferta Vinculante', 'Negociación y firma del contrato de compraventa (SPA).'],
    ['6', 'Cierre', 'Transferencia de acciones y cierre de la operación.'],
  ];

  // Table with header
  const headerRow = [
    { text: '#', options: { fontSize: 10, color: WHITE, fontFace: FONT, bold: true, fill: { color: NAVY } } },
    { text: 'FASE', options: { fontSize: 10, color: WHITE, fontFace: FONT, bold: true, fill: { color: NAVY } } },
    { text: 'DESCRIPCIÓN', options: { fontSize: 10, color: WHITE, fontFace: FONT, bold: true, fill: { color: NAVY } } },
  ];

  const dataRows = steps.map(([n, phase, desc]) => [
    { text: n, options: { fontSize: 10, color: NAVY, fontFace: FONT, align: 'center' as const } },
    { text: phase, options: { fontSize: 10, color: NAVY, fontFace: FONT, bold: true } },
    { text: desc, options: { fontSize: 10, color: TEXT_SECONDARY, fontFace: FONT } },
  ]);

  slide.addTable(
    [headerRow, ...dataRows] as any,
    {
      x: M, y: 2.0, w: SW - M * 2,
      border: { type: 'dash', pt: 0.5, color: BORDER },
      colW: [0.6, 2.8, SW - M * 2 - 3.4],
      rowH: 0.55,
    }
  );
};

const buildContacto = (pres: pptxgen) => {
  addSectionSeparator(pres, 'Contacto');

  // Closing slide
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addText('Gracias', {
    x: M, y: SH / 2 - 1.5, w: SW - M * 2, h: 1.5,
    fontSize: 72, color: NAVY, fontFace: FONT, bold: true, align: 'center', valign: 'middle',
  });

  slide.addText([
    { text: 'Capittal Transacciones', options: { fontSize: 14, bold: true } },
    { text: '\ninfo@capittal.es · www.capittal.es', options: { fontSize: 12 } },
  ] as any, {
    x: SW / 2 - 3, y: SH / 2 + 0.3, w: 6, h: 0.8,
    color: TEXT_SECONDARY, fontFace: FONT, align: 'center',
  });

  // Disclaimer
  slide.addText(
    `Esta presentación ha sido elaborada con fines meramente informativos y no constituye asesoramiento profesional. © ${YEAR} Capittal Transacciones. Todos los derechos reservados.`,
    {
      x: M + 1, y: SH - 1.0, w: SW - M * 2 - 2, h: 0.5,
      fontSize: 8, color: TEXT_TERTIARY, fontFace: FONT, align: 'center',
    }
  );
};

// ─── PUBLIC API ───

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
  _template: TemplateType
): Promise<void> {
  slideNum = 0;

  const pres = new pptxgen();
  pres.defineLayout({ name: 'CAPITTAL', width: SW, height: SH });
  pres.layout = 'CAPITTAL';
  pres.author = 'Capittal';
  pres.company = 'Capittal Transacciones';
  pres.title = `${operation.company_name} – Capittal – ${MONTH_YEAR}`;

  const builders: Record<SectionKey, () => void> = {
    portada: () => addCover(pres, operation),
    resumen: () => buildResumenEjecutivo(pres, operation),
    empresa: () => buildEmpresa(pres, operation),
    financieros: () => buildFinancieros(pres, operation),
    tesis: () => buildTesisInversion(pres, operation),
    proceso: () => buildProcesoMA(pres, operation),
    contacto: () => buildContacto(pres),
  };

  for (const s of ALL_SECTIONS) {
    if (sections.includes(s)) builders[s]();
  }

  const safeName = operation.company_name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').trim().replace(/\s+/g, ' ');
  await pres.writeFile({ fileName: `${safeName} – Capittal – ${MONTH_YEAR}.pptx` });
}
