import pptxgen from 'pptxgenjs';
import type { Operation } from '../types/operations';
import type { SlideTemplate, FullSlideTemplate, CoverTemplate, IndexTemplate, SeparatorTemplate, ClosingTemplate } from '../types/slideTemplate';
import { DEFAULT_FULL_TEMPLATE, DEFAULT_CLOSING_TEMPLATE } from '../types/slideTemplate';

// ─── DESIGN TOKENS ───
const NAVY = '161B22';
const WHITE = 'FFFFFF';
const TEXT_SECONDARY = '58606E';
const TEXT_MUTED = '8B919B';
const BG_CARD = 'F3F4F5';
const ACCENT = '2563EB';
const FONT = 'Plus Jakarta Sans';

const SW = 13.33;
const SH = 7.5;
const M = 0.6;

// ─── TYPES ───
export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface DealhubSection {
  key: string;
  label: string;
  subtitle: string;
  filter: (op: Operation) => boolean;
}

export const DEALHUB_SECTIONS: DealhubSection[] = [
  {
    key: 'sale_active',
    label: 'Mandatos de Venta',
    subtitle: 'Empresas en proceso de venta',
    filter: (op) => op.project_status === 'active' && (op.deal_type === 'sale' || !op.deal_type),
  },
  {
    key: 'upcoming',
    label: 'Fase de Preparación',
    subtitle: 'Próximamente en mercado',
    filter: (op) => op.project_status === 'upcoming',
  },
  {
    key: 'acquisition',
    label: 'Mandatos de Compra',
    subtitle: 'Empresas en búsqueda de adquisición',
    filter: (op) => op.deal_type === 'acquisition',
  },
  {
    key: 'exclusive',
    label: 'En Exclusividad',
    subtitle: 'Procesos en fase de exclusividad',
    filter: (op) => op.project_status === 'exclusive',
  },
];

// ─── HELPERS ───
const fmtCurrency = (amount: number | undefined): string => {
  if (!amount || amount <= 0) return 'N/D';
  const normalized = amount < 10000 ? amount * 1_000_000 : amount;
  if (normalized >= 1_000_000) return `€${(normalized / 1_000_000).toFixed(1)}M`;
  if (normalized >= 1_000) return `€${(normalized / 1_000).toFixed(0)}K`;
  return `€${normalized.toFixed(0)}`;
};

const fmtMargin = (ebitda: number | undefined, revenue: number | undefined): string => {
  if (!ebitda || !revenue || revenue <= 0) return 'N/D';
  return `${((ebitda / revenue) * 100).toFixed(1)}%`;
};

// ─── SLIDE BUILDERS ───

function addCoverSlide(pptx: pptxgen, quarter: QuarterType, year: number, ct: CoverTemplate) {
  const slide = pptx.addSlide();

  if (ct.backgroundImage) {
    slide.background = { path: ct.backgroundImage };
    return;
  }

  slide.background = { color: ct.background.color || NAVY };

  // Year block (top-left, large)
  const yb = ct.yearBlock;
  if (yb && yb.visible) {
    slide.addText(String(year), {
      x: yb.x, y: yb.y, w: yb.w, h: yb.h,
      fontSize: yb.fontSize || 80, fontFace: FONT, color: yb.color || WHITE,
      bold: yb.bold ?? true, align: yb.align,
    });
  }

  // Logo image (top-right) — rendered before branding text so text appears below
  if (ct.logo?.visible && (ct.logo as any).imageUrl) {
    slide.addImage({
      path: (ct.logo as any).imageUrl,
      x: ct.logo.x, y: ct.logo.y, w: ct.logo.w, h: ct.logo.h,
      sizing: { type: 'contain', w: ct.logo.w, h: ct.logo.h },
    });
  }

  // Branding text (below logo, top-right)
  const br = ct.branding;
  if (br && br.visible) {
    slide.addText((br as any).text || 'M&A · Consulting', {
      x: br.x, y: br.y, w: br.w, h: br.h,
      fontSize: br.fontSize || 12, fontFace: FONT, color: br.color || TEXT_MUTED,
      bold: br.bold ?? false, align: br.align || 'right',
    });
  }

  // Title (bottom-left area)
  if (ct.title.visible) {
    slide.addText(ct.title.text || 'Capittal Dealhub — Open Deals', {
      x: ct.title.x, y: ct.title.y, w: ct.title.w, h: ct.title.h,
      fontSize: ct.title.fontSize || 44, fontFace: FONT, color: ct.title.color || WHITE,
      bold: ct.title.bold ?? true, italic: ct.title.italic,
      align: ct.title.align, valign: ct.title.valign,
    });
  }

  // Subtitle
  if (ct.subtitle.visible) {
    slide.addText(ct.subtitle.text || 'Relación de Oportunidades de Inversión', {
      x: ct.subtitle.x, y: ct.subtitle.y, w: ct.subtitle.w, h: ct.subtitle.h,
      fontSize: ct.subtitle.fontSize || 16, fontFace: FONT, color: ct.subtitle.color || TEXT_MUTED,
      bold: ct.subtitle.bold ?? false, italic: ct.subtitle.italic,
      align: ct.subtitle.align, valign: ct.subtitle.valign,
    });
  }

  // Quarter label
  if (ct.quarter.visible) {
    slide.addText(`${quarter} — ${year}`, {
      x: ct.quarter.x, y: ct.quarter.y, w: ct.quarter.w, h: ct.quarter.h,
      fontSize: ct.quarter.fontSize || 14, fontFace: FONT, color: ct.quarter.color || TEXT_MUTED,
      align: ct.quarter.align,
    });
  }

  // Divider (hidden by default)
  if (ct.divider.visible) {
    slide.addShape(pptx.ShapeType.rect, {
      x: ct.divider.x, y: ct.divider.y, w: ct.divider.w, h: ct.divider.h,
      fill: { color: ct.divider.bgColor || TEXT_MUTED },
    });
  }

  // Footer (hidden by default)
  if (ct.footer.visible) {
    slide.addText(ct.footer.text || 'CAPITTAL — Información Confidencial', {
      x: ct.footer.x, y: ct.footer.y, w: ct.footer.w, h: ct.footer.h,
      fontSize: ct.footer.fontSize || 9, fontFace: FONT, color: ct.footer.color || TEXT_MUTED,
      align: ct.footer.align,
    });
  }
}

function addIndexSlide(pptx: pptxgen, sectionCounts: Record<string, number>, idx: IndexTemplate) {
  const slide = pptx.addSlide();

  if (idx.backgroundImage) {
    slide.background = { path: idx.backgroundImage };
    return;
  }

  slide.background = { color: idx.background.color || WHITE };

  if (idx.title.visible) {
    slide.addText('Índice de Oportunidades', {
      x: idx.title.x, y: idx.title.y, w: idx.title.w, h: idx.title.h,
      fontSize: idx.title.fontSize || 32, fontFace: FONT, color: idx.title.color || NAVY,
      bold: idx.title.bold ?? true, align: idx.title.align,
    });
  }

  // Intro text paragraph
  const intro = idx.introText;
  if (intro && intro.visible) {
    slide.addText((intro as any).text || '', {
      x: intro.x, y: intro.y, w: intro.w, h: intro.h,
      fontSize: intro.fontSize || 14, fontFace: FONT, color: intro.color || TEXT_SECONDARY,
      lineSpacingMultiple: intro.lineSpacing || 1.4,
      valign: 'top', wrap: true,
    });
  }

  DEALHUB_SECTIONS.forEach((section, i) => {
    const x = idx.cardsStartX + i * (idx.cardW + idx.cardGap);
    const count = sectionCounts[section.key] || 0;
    const sectionNum = String(i + 1).padStart(2, '0');
    const sColor = idx.sectionColors[i] || ACCENT;

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: idx.cardsStartY, w: idx.cardW, h: idx.cardH,
      fill: { color: idx.cardBgColor || BG_CARD }, rectRadius: idx.cardRadius || 0.1,
    });

    slide.addText(sectionNum, {
      x: x + 0.25, y: idx.cardsStartY + 0.2, w: idx.cardW - 0.5, h: 0.7,
      fontSize: 36, fontFace: FONT, color: sColor, bold: true,
    });

    slide.addText(section.label, {
      x: x + 0.25, y: idx.cardsStartY + 1.0, w: idx.cardW - 0.5, h: 0.5,
      fontSize: 14, fontFace: FONT, color: NAVY, bold: true,
    });

    slide.addText(`${count} operaciones`, {
      x: x + 0.25, y: idx.cardsStartY + 1.55, w: idx.cardW - 0.5, h: 0.4,
      fontSize: 12, fontFace: FONT, color: TEXT_SECONDARY,
    });

    slide.addText(section.subtitle, {
      x: x + 0.25, y: idx.cardsStartY + 1.95, w: idx.cardW - 0.5, h: 0.5,
      fontSize: 9, fontFace: FONT, color: TEXT_MUTED, wrap: true,
    });
  });
}

function addSectionSeparator(pptx: pptxgen, sectionNum: string, title: string, subtitle: string, sep: SeparatorTemplate, sectionKey?: string) {
  const slide = pptx.addSlide();

  const bgImage = sectionKey && sep.backgroundImages?.[sectionKey];
  if (bgImage) {
    slide.background = { path: bgImage };
    return;
  }

  slide.background = { color: sep.background.color || NAVY };

  // Number (top-left, large)
  if (sep.number.visible) {
    slide.addText(sectionNum, {
      x: sep.number.x, y: sep.number.y, w: sep.number.w, h: sep.number.h,
      fontSize: sep.number.fontSize || 140, fontFace: FONT,
      color: sep.number.color || sep.accentColor || ACCENT,
      bold: sep.number.bold ?? true, align: sep.number.align,
    });
  }

  // Logo image (top-right) — use cover logo if available
  // We check if the full template's cover has a logo URL to reuse here
  const br = sep.branding;
  if (br && br.visible) {
    slide.addText((br as any).text || 'M&A · Consulting', {
      x: br.x, y: br.y, w: br.w, h: br.h,
      fontSize: br.fontSize || 12, fontFace: FONT, color: br.color || TEXT_MUTED,
      bold: br.bold ?? false, align: br.align || 'right',
    });
  }

  // Title (bottom-left)
  if (sep.title.visible) {
    slide.addText(title, {
      x: sep.title.x, y: sep.title.y, w: sep.title.w, h: sep.title.h,
      fontSize: sep.title.fontSize || 36, fontFace: FONT, color: sep.title.color || WHITE,
      bold: sep.title.bold ?? true, align: sep.title.align,
    });
  }

  // Subtitle
  if (sep.subtitle.visible) {
    slide.addText(subtitle, {
      x: sep.subtitle.x, y: sep.subtitle.y, w: sep.subtitle.w, h: sep.subtitle.h,
      fontSize: sep.subtitle.fontSize || 14, fontFace: FONT, color: sep.subtitle.color || TEXT_MUTED,
      align: sep.subtitle.align,
    });
  }
}

function addOperationSlide(pptx: pptxgen, op: Operation, t: SlideTemplate) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };

  // ─── LEFT COLUMN ───

  if (t.title.visible) {
    slide.addText(op.company_name, {
      x: t.title.x, y: t.title.y, w: t.title.w, h: t.title.h,
      fontSize: t.title.fontSize || 26, fontFace: FONT, color: t.title.color || NAVY,
      bold: t.title.bold ?? true, italic: t.title.italic,
      align: t.title.align, valign: t.title.valign,
    });
  }

  if (t.description.visible) {
    const rawDesc = op.description || '';
    const desc = rawDesc.length > 800 ? rawDesc.substring(0, 797) + '...' : rawDesc;
    slide.addText(desc, {
      x: t.description.x, y: t.description.y, w: t.description.w, h: t.description.h,
      fontSize: t.description.fontSize || 11, fontFace: FONT, color: t.description.color || TEXT_SECONDARY,
      lineSpacingMultiple: t.description.lineSpacing || 1.4,
      valign: t.description.valign || 'top',
      align: t.description.align,
      wrap: true, shrinkText: true,
      italic: t.description.italic,
    });
  }

  const highlights = op.highlights || [];
  if (t.highlights.visible && highlights.length > 0) {
    slide.addText('Aspectos Destacados', {
      x: t.highlights.x, y: t.highlights.y, w: t.highlights.w, h: 0.35,
      fontSize: t.highlights.fontSize || 11, fontFace: FONT, color: t.highlights.color || NAVY,
      bold: t.highlights.bold ?? true, align: t.highlights.align,
    });

    const bulletText = highlights.map(h => ({
      text: h,
      options: { fontSize: (t.highlights.fontSize || 11) - 1, fontFace: FONT, color: TEXT_SECONDARY, bullet: { code: '2022' }, lineSpacingMultiple: 1.3 },
    }));
    slide.addText(bulletText as any, {
      x: t.highlights.x + 0.2, y: t.highlights.y + 0.4, w: t.highlights.w - 0.4, h: t.highlights.h - 0.4,
      valign: 'top',
    });
  }

  // ─── RIGHT COLUMN — Dark card ───
  if (t.summaryCard.visible) {
    const cardColor = t.summaryCard.color || NAVY;
    const pad = 0.3;
    const innerW = t.summaryCard.w - pad * 2;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: t.summaryCard.x, y: t.summaryCard.y, w: t.summaryCard.w, h: t.summaryCard.h,
      fill: { color: cardColor }, rectRadius: t.summaryCard.rectRadius || 0.15,
    });

    if (t.summaryHeader.visible) {
      slide.addText('Resumen', {
        x: t.summaryHeader.x, y: t.summaryHeader.y, w: t.summaryHeader.w, h: t.summaryHeader.h,
        fontSize: t.summaryHeader.fontSize || 13, fontFace: FONT, color: t.summaryHeader.color || WHITE,
        bold: t.summaryHeader.bold ?? true, align: t.summaryHeader.align,
      });
    }

    if (t.infoRows.visible) {
      const simpleRows = [
        { label: 'Ubicación', value: 'España' },
        { label: 'Sector', value: op.sector || 'N/D' },
      ];

      let infoY = t.infoRows.y;
      simpleRows.forEach((row) => {
        slide.addText(row.label, {
          x: t.infoRows.x, y: infoY, w: 1.5, h: 0.3,
          fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
        });
        slide.addText(row.value, {
          x: t.infoRows.x + 1.5, y: infoY, w: innerW - 1.5, h: 0.3,
          fontSize: t.infoRows.fontSize || 10, fontFace: FONT, color: t.infoRows.color || WHITE, bold: true, wrap: true,
        });
        infoY += 0.45;
      });

      const oportunidadText = op.short_description || op.deal_type || 'Venta';
      slide.addText('Oportunidad', {
        x: t.infoRows.x, y: infoY, w: innerW, h: 0.25,
        fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
      });
      infoY += 0.25;
      slide.addText(oportunidadText, {
        x: t.infoRows.x, y: infoY, w: innerW, h: 0.7,
        fontSize: t.infoRows.fontSize || 10, fontFace: FONT, color: t.infoRows.color || WHITE, bold: true, wrap: true, valign: 'top',
      });
    }

    if (t.financialData.visible) {
      slide.addShape(pptx.ShapeType.rect, {
        x: t.financialData.x, y: t.financialData.y - 0.15, w: t.financialData.w, h: 0.01,
        fill: { color: TEXT_MUTED },
      });

      slide.addText('Datos Clave', {
        x: t.financialData.x, y: t.financialData.y, w: t.financialData.w, h: 0.4,
        fontSize: t.financialData.fontSize || 13, fontFace: FONT, color: t.financialData.color || WHITE,
        bold: t.financialData.bold ?? true, align: t.financialData.align,
      });

      const financialRows = [
        { label: 'Facturación', value: fmtCurrency(op.revenue_amount) },
        { label: 'EBITDA', value: fmtCurrency(op.ebitda_amount) },
        { label: 'Margen EBITDA', value: fmtMargin(op.ebitda_amount, op.revenue_amount) },
        { label: 'Empleados', value: op.company_size_employees || 'N/D' },
      ];

      financialRows.forEach((row, i) => {
        const rowY = t.financialData.y + 0.5 + i * 0.55;
        slide.addText(row.label, {
          x: t.financialData.x, y: rowY, w: 1.8, h: 0.3,
          fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
        });
        slide.addText(row.value, {
          x: t.financialData.x + 1.8, y: rowY, w: t.financialData.w - 1.8, h: 0.3,
          fontSize: t.financialData.fontSize || 12, fontFace: FONT, color: t.financialData.color || WHITE, bold: t.financialData.bold ?? true, align: 'right',
        });
      });
    }

    if (t.cta.visible) {
      const ctaText = (t.cta as any).text || 'Más Información →';
      slide.addShape(pptx.ShapeType.roundRect, {
        x: t.cta.x, y: t.cta.y, w: t.cta.w, h: t.cta.h,
        fill: { color: t.cta.bgColor || '3A3F47' }, rectRadius: t.cta.rectRadius || 0.05,
      });
      slide.addText(ctaText, {
        x: t.cta.x, y: t.cta.y, w: t.cta.w, h: t.cta.h,
        fontSize: t.cta.fontSize || 11, fontFace: FONT, color: t.cta.color || WHITE,
        bold: t.cta.bold ?? true, align: t.cta.align || 'center', valign: t.cta.valign || 'middle',
      });
    }
  }

  if (t.footer.visible) {
    const footerText = (t.footer as any).text || 'CAPITTAL — Información Confidencial';
    slide.addText(footerText, {
      x: t.footer.x, y: t.footer.y, w: t.footer.w, h: t.footer.h,
      fontSize: t.footer.fontSize || 8, fontFace: FONT, color: t.footer.color || TEXT_MUTED,
      align: t.footer.align,
    });
  }
}

function addClosingSlide(pptx: pptxgen, quarter: QuarterType, year: number, cl: ClosingTemplate) {
  const slide = pptx.addSlide();

  if (cl.backgroundImage) {
    slide.background = { path: cl.backgroundImage };
    return;
  }

  slide.background = { color: cl.background?.color || WHITE };

  // Bottom half navy background
  const bottomColor = cl.bottomBgColor || NAVY;
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: SH / 2, w: SW, h: SH / 2,
    fill: { color: bottomColor },
  });

  // Logo (top-right, white area)
  const logo = cl.logo;
  if (logo && logo.visible && (logo as any).imageUrl) {
    slide.addImage({
      path: (logo as any).imageUrl,
      x: logo.x, y: logo.y, w: logo.w, h: logo.h,
      sizing: { type: 'contain', w: logo.w, h: logo.h },
    });
  }

  // "Gracias" text (bottom half)
  const thanks = cl.thanksText;
  if (thanks && thanks.visible) {
    slide.addText((thanks as any).text || 'Gracias', {
      x: thanks.x, y: thanks.y, w: thanks.w, h: thanks.h,
      fontSize: thanks.fontSize || 40, fontFace: FONT, color: thanks.color || WHITE,
      bold: thanks.bold ?? true,
    });
  }

  // Email
  const email = cl.email;
  if (email && email.visible) {
    slide.addText((email as any).text || 'lluis@capittal.es', {
      x: email.x, y: email.y, w: email.w, h: email.h,
      fontSize: email.fontSize || 14, fontFace: FONT, color: email.color || TEXT_MUTED,
    });
  }

  // Doc title (bottom-right)
  const docTitle = cl.docTitle;
  if (docTitle && docTitle.visible) {
    slide.addText(`Capittal Dealhub — ${quarter} ${year}`, {
      x: docTitle.x, y: docTitle.y, w: docTitle.w, h: docTitle.h,
      fontSize: docTitle.fontSize || 12, fontFace: FONT, color: docTitle.color || TEXT_MUTED,
      align: docTitle.align || 'right',
    });
  }
}

// ─── MAIN EXPORT ───

export async function generateDealhubPptx(
  operations: Operation[],
  selectedSections: string[],
  quarter: QuarterType,
  year?: number,
  fullTemplate?: FullSlideTemplate,
) {
  const currentYear = year || new Date().getFullYear();
  const activeOps = operations.filter(op => op.is_active && !op.is_deleted);
  const ft = fullTemplate || DEFAULT_FULL_TEMPLATE;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Capittal';
  pptx.title = `Capittal Dealhub - Open Deals ${quarter} ${currentYear}`;

  const sectionCounts: Record<string, number> = {};
  DEALHUB_SECTIONS.forEach(s => {
    sectionCounts[s.key] = activeOps.filter(s.filter).length;
  });

  // 1. Cover
  addCoverSlide(pptx, quarter, currentYear, ft.cover);

  // 2. Index
  addIndexSlide(pptx, sectionCounts, ft.index);

  // 3. Sections
  DEALHUB_SECTIONS.forEach((section, i) => {
    if (!selectedSections.includes(section.key)) return;
    const ops = activeOps.filter(section.filter);
    if (ops.length === 0) return;

    const sectionNum = String(i + 1).padStart(2, '0');
    addSectionSeparator(pptx, sectionNum, section.label, section.subtitle, ft.separator, section.key);

    ops.forEach(op => addOperationSlide(pptx, op, ft.operation));
  });

  // 4. Closing slide
  const closingTemplate = ft.closing || DEFAULT_CLOSING_TEMPLATE;
  addClosingSlide(pptx, quarter, currentYear, closingTemplate);

  await pptx.writeFile({ fileName: `Capittal_Dealhub_${quarter}_${currentYear}.pptx` });
}
