import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, pdf } from '@react-pdf/renderer';
import type { Operation } from '../types/operations';
import type { FullSlideTemplate } from '../types/slideTemplate';
import { DEFAULT_FULL_TEMPLATE } from '../types/slideTemplate';
import { DEALHUB_SECTIONS, type QuarterType } from './generateDealhubPptx';

// ─── DESIGN TOKENS (matching PPTX) ───
const NAVY = '#161B22';
const WHITE = '#FFFFFF';
const TEXT_SECONDARY = '#58606E';
const TEXT_MUTED = '#8B919B';
const ACCENT = '#2563EB';
const CTA_BG = '#3A3F47';
const BG_CARD = '#F3F4F5';

// Page size: 13.33in × 7.5in in points (1in = 72pt)
const PW = 960;  // 13.33 * 72
const PH = 540;  // 7.5 * 72

// Scale factor: PPTX uses inches, PDF uses points (1in = 72pt)
const S = 72;

const styles = StyleSheet.create({
  page: {
    width: PW,
    height: PH,
    position: 'relative',
  },
});

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

const hexColor = (c: string | undefined, fallback: string): string => {
  if (!c) return fallback;
  return c.startsWith('#') ? c : `#${c}`;
};

// ─── COMPONENTS ───

const CoverPage = ({ quarter, year, t }: { quarter: QuarterType; year: number; t: FullSlideTemplate }) => {
  const ct = t.cover;
  return (
    <Page size={[PW, PH]} style={[styles.page, { backgroundColor: hexColor(ct.background.color, NAVY) }]}>
      {/* Year block */}
      {ct.yearBlock?.visible && (
        <Text style={{
          position: 'absolute',
          left: (ct.yearBlock.x || 0.6) * S,
          top: (ct.yearBlock.y || 0.4) * S,
          fontSize: (ct.yearBlock.fontSize || 80) * 0.85,
          color: hexColor(ct.yearBlock.color, WHITE),
          fontFamily: 'Helvetica-Bold',
        }}>
          {year}
        </Text>
      )}

      {/* Branding */}
      {ct.branding?.visible && (
        <Text style={{
          position: 'absolute',
          right: (13.33 - (ct.branding.x || 9.5) - (ct.branding.w || 3.23)) * S,
          top: (ct.branding.y || 1.4) * S,
          width: (ct.branding.w || 3.23) * S,
          fontSize: (ct.branding.fontSize || 12) * 0.85,
          color: hexColor(ct.branding.color, TEXT_MUTED),
          textAlign: 'right',
        }}>
          {(ct.branding as any).text || 'M&A · Consulting'}
        </Text>
      )}

      {/* Title */}
      {ct.title.visible && (
        <Text style={{
          position: 'absolute',
          left: (ct.title.x || 0.6) * S,
          top: (ct.title.y || 4.8) * S,
          width: (ct.title.w || 12.13) * S,
          fontSize: (ct.title.fontSize || 44) * 0.75,
          color: hexColor(ct.title.color, WHITE),
          fontFamily: 'Helvetica-Bold',
        }}>
          {(ct.title as any).text || 'Capittal Dealhub — Open Deals'}
        </Text>
      )}

      {/* Subtitle */}
      {ct.subtitle.visible && (
        <Text style={{
          position: 'absolute',
          left: (ct.subtitle.x || 0.6) * S,
          top: (ct.subtitle.y || 5.7) * S,
          width: (ct.subtitle.w || 12.13) * S,
          fontSize: (ct.subtitle.fontSize || 16) * 0.85,
          color: hexColor(ct.subtitle.color, TEXT_MUTED),
        }}>
          {(ct.subtitle as any).text || 'Relación de Oportunidades de Inversión'}
        </Text>
      )}

      {/* Quarter */}
      {ct.quarter.visible && (
        <Text style={{
          position: 'absolute',
          left: (ct.quarter.x || 0.6) * S,
          top: (ct.quarter.y || 6.4) * S,
          fontSize: (ct.quarter.fontSize || 14) * 0.85,
          color: hexColor(ct.quarter.color, TEXT_MUTED),
        }}>
          {quarter} — {year}
        </Text>
      )}

      {/* Footer */}
      {ct.footer.visible && (
        <Text style={{
          position: 'absolute',
          left: (ct.footer.x || 0.6) * S,
          bottom: 20,
          fontSize: (ct.footer.fontSize || 9) * 0.85,
          color: hexColor(ct.footer.color, TEXT_MUTED),
        }}>
          {(ct.footer as any).text || 'CAPITTAL — Información Confidencial'}
        </Text>
      )}
    </Page>
  );
};

const IndexPage = ({ sectionCounts, t }: { sectionCounts: Record<string, number>; t: FullSlideTemplate }) => {
  const idx = t.index;
  const sectionColors = idx.sectionColors || ['#2563EB', '#7C3AED', '#EA580C', '#059669'];

  return (
    <Page size={[PW, PH]} style={[styles.page, { backgroundColor: hexColor(idx.background.color, WHITE) }]}>
      {/* Title */}
      {idx.title.visible && (
        <Text style={{
          position: 'absolute',
          left: (idx.title.x || 0.6) * S,
          top: (idx.title.y || 0.5) * S,
          fontSize: (idx.title.fontSize || 32) * 0.8,
          color: hexColor(idx.title.color, NAVY),
          fontFamily: 'Helvetica-Bold',
        }}>
          Índice de Oportunidades
        </Text>
      )}

      {/* Intro text */}
      {idx.introText?.visible && (
        <Text style={{
          position: 'absolute',
          left: (idx.introText.x || 0.6) * S,
          top: (idx.introText.y || 1.3) * S,
          width: (idx.introText.w || 10) * S,
          fontSize: (idx.introText.fontSize || 14) * 0.8,
          color: hexColor(idx.introText.color, TEXT_SECONDARY),
          lineHeight: 1.4,
        }}>
          {(idx.introText as any).text || ''}
        </Text>
      )}

      {/* Section cards */}
      {DEALHUB_SECTIONS.map((section, i) => {
        const x = (idx.cardsStartX + i * (idx.cardW + idx.cardGap)) * S;
        const y = (idx.cardsStartY || 3.2) * S;
        const w = (idx.cardW || 2.8) * S;
        const h = (idx.cardH || 2.6) * S;
        const count = sectionCounts[section.key] || 0;
        const sectionNum = String(i + 1).padStart(2, '0');
        const sColor = hexColor(sectionColors[i], ACCENT);

        return (
          <View key={section.key} style={{
            position: 'absolute',
            left: x, top: y, width: w, height: h,
            backgroundColor: hexColor(idx.cardBgColor, BG_CARD),
            borderRadius: (idx.cardRadius || 0.1) * S,
            padding: 18,
          }}>
            <Text style={{ fontSize: 28, color: sColor, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
              {sectionNum}
            </Text>
            <Text style={{ fontSize: 11, color: NAVY, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
              {section.label}
            </Text>
            <Text style={{ fontSize: 10, color: TEXT_SECONDARY, marginBottom: 4 }}>
              {count} operaciones
            </Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED }}>
              {section.subtitle}
            </Text>
          </View>
        );
      })}
    </Page>
  );
};

const SeparatorPage = ({ num, label, subtitle, t }: {
  num: string; label: string; subtitle: string; t: FullSlideTemplate;
}) => {
  const sep = t.separator;
  return (
    <Page size={[PW, PH]} style={[styles.page, { backgroundColor: hexColor(sep.background.color, NAVY) }]}>
      {/* Large number */}
      {sep.number.visible && (
        <Text style={{
          position: 'absolute',
          left: (sep.number.x || 0.6) * S,
          top: (sep.number.y || 0.4) * S,
          fontSize: (sep.number.fontSize || 140) * 0.7,
          color: hexColor(sep.number.color || sep.accentColor, ACCENT),
          fontFamily: 'Helvetica-Bold',
        }}>
          {num}
        </Text>
      )}

      {/* Branding */}
      {sep.branding?.visible && (
        <Text style={{
          position: 'absolute',
          right: (13.33 - (sep.branding.x || 9.5) - (sep.branding.w || 3.23)) * S,
          top: (sep.branding.y || 0.5) * S,
          width: (sep.branding.w || 3.23) * S,
          fontSize: (sep.branding.fontSize || 14) * 0.8,
          color: hexColor(sep.branding.color, TEXT_MUTED),
          textAlign: 'right',
        }}>
          {(sep.branding as any).text || 'Capittal M&A · Consulting'}
        </Text>
      )}

      {/* Title */}
      {sep.title.visible && (
        <Text style={{
          position: 'absolute',
          left: (sep.title.x || 0.6) * S,
          top: (sep.title.y || 5.0) * S,
          width: (sep.title.w || 12.13) * S,
          fontSize: (sep.title.fontSize || 36) * 0.8,
          color: hexColor(sep.title.color, WHITE),
          fontFamily: 'Helvetica-Bold',
        }}>
          {label}
        </Text>
      )}

      {/* Subtitle */}
      {sep.subtitle.visible && (
        <Text style={{
          position: 'absolute',
          left: (sep.subtitle.x || 0.6) * S,
          top: (sep.subtitle.y || 5.8) * S,
          fontSize: (sep.subtitle.fontSize || 14) * 0.8,
          color: hexColor(sep.subtitle.color, TEXT_MUTED),
        }}>
          {subtitle}
        </Text>
      )}
    </Page>
  );
};

const OperationPage = ({ op, t }: { op: Operation; t: FullSlideTemplate }) => {
  const tmpl = t.operation;
  const desc = (op.description || '').substring(0, 800);
  const highlights = op.highlights || [];

  const cardX = (tmpl.summaryCard.x || 7.7) * S;
  const cardY = (tmpl.summaryCard.y || 0.4) * S;
  const cardW = (tmpl.summaryCard.w || 5.0) * S;
  const cardH = (tmpl.summaryCard.h || 6.2) * S;
  const pad = 22;

  return (
    <Page size={[PW, PH]} style={[styles.page, { backgroundColor: WHITE }]}>
      {/* Left column — Title */}
      {tmpl.title.visible && (
        <Text style={{
          position: 'absolute',
          left: (tmpl.title.x || 0.6) * S,
          top: (tmpl.title.y || 0.4) * S,
          width: (tmpl.title.w || 6.7) * S,
          fontSize: (tmpl.title.fontSize || 26) * 0.8,
          color: hexColor(tmpl.title.color, NAVY),
          fontFamily: 'Helvetica-Bold',
        }}>
          {op.company_name}
        </Text>
      )}

      {/* Description */}
      {tmpl.description.visible && desc && (
        <Text style={{
          position: 'absolute',
          left: (tmpl.description.x || 0.6) * S,
          top: (tmpl.description.y || 1.3) * S,
          width: (tmpl.description.w || 6.7) * S,
          fontSize: (tmpl.description.fontSize || 11) * 0.85,
          color: hexColor(tmpl.description.color, TEXT_SECONDARY),
          lineHeight: tmpl.description.lineSpacing || 1.4,
        }}>
          {desc}
        </Text>
      )}

      {/* Highlights */}
      {tmpl.highlights.visible && highlights.length > 0 && (
        <View style={{
          position: 'absolute',
          left: (tmpl.highlights.x || 0.6) * S,
          top: (tmpl.highlights.y || 5.2) * S,
          width: (tmpl.highlights.w || 6.7) * S,
        }}>
          <Text style={{
            fontSize: (tmpl.highlights.fontSize || 11) * 0.85,
            color: hexColor(tmpl.highlights.color, NAVY),
            fontFamily: 'Helvetica-Bold',
            marginBottom: 6,
          }}>
            Aspectos Destacados
          </Text>
          {highlights.map((h, i) => (
            <Text key={i} style={{
              fontSize: ((tmpl.highlights.fontSize || 11) - 1) * 0.85,
              color: TEXT_SECONDARY,
              marginBottom: 3,
              paddingLeft: 8,
            }}>
              • {h}
            </Text>
          ))}
        </View>
      )}

      {/* Right column — Dark summary card */}
      {tmpl.summaryCard.visible && (
        <View style={{
          position: 'absolute',
          left: cardX, top: cardY,
          width: cardW, height: cardH,
          backgroundColor: hexColor(tmpl.summaryCard.color, NAVY),
          borderRadius: (tmpl.summaryCard.rectRadius || 0.15) * S,
          padding: pad,
        }}>
          {/* Summary header */}
          {tmpl.summaryHeader.visible && (
            <Text style={{
              fontSize: (tmpl.summaryHeader.fontSize || 13) * 0.85,
              color: hexColor(tmpl.summaryHeader.color, WHITE),
              fontFamily: 'Helvetica-Bold',
              marginBottom: 12,
            }}>
              Resumen
            </Text>
          )}

          {/* Info rows */}
          {tmpl.infoRows.visible && (
            <View style={{ marginBottom: 10 }}>
              {[
                { label: 'Ubicación', value: 'España' },
                { label: 'Sector', value: op.sector || 'N/D' },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ fontSize: 7.5, color: TEXT_MUTED, width: 80 }}>{row.label}</Text>
                  <Text style={{
                    fontSize: (tmpl.infoRows.fontSize || 10) * 0.85,
                    color: hexColor(tmpl.infoRows.color, WHITE),
                    fontFamily: 'Helvetica-Bold',
                    flex: 1,
                  }}>
                    {row.value}
                  </Text>
                </View>
              ))}
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginBottom: 3 }}>Oportunidad</Text>
                <Text style={{
                  fontSize: (tmpl.infoRows.fontSize || 10) * 0.85,
                  color: hexColor(tmpl.infoRows.color, WHITE),
                  fontFamily: 'Helvetica-Bold',
                }}>
                  {op.short_description || op.deal_type || 'Venta'}
                </Text>
              </View>
            </View>
          )}

          {/* Divider */}
          {tmpl.financialData.visible && (
            <View style={{ height: 0.5, backgroundColor: TEXT_MUTED, opacity: 0.3, marginVertical: 10 }} />
          )}

          {/* Financial data */}
          {tmpl.financialData.visible && (
            <View>
              <Text style={{
                fontSize: (tmpl.financialData.fontSize || 13) * 0.8,
                color: hexColor(tmpl.financialData.color, WHITE),
                fontFamily: 'Helvetica-Bold',
                marginBottom: 10,
              }}>
                Datos Clave
              </Text>
              {[
                { label: 'Facturación', value: fmtCurrency(op.revenue_amount) },
                { label: 'EBITDA', value: fmtCurrency(op.ebitda_amount) },
                { label: 'Margen EBITDA', value: fmtMargin(op.ebitda_amount, op.revenue_amount) },
                { label: 'Empleados', value: op.company_size_employees || 'N/D' },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 7.5, color: TEXT_MUTED }}>{row.label}</Text>
                  <Text style={{
                    fontSize: (tmpl.financialData.fontSize || 12) * 0.8,
                    color: hexColor(tmpl.financialData.color, WHITE),
                    fontFamily: 'Helvetica-Bold',
                  }}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          {tmpl.cta.visible && (
            <View style={{
              backgroundColor: hexColor(tmpl.cta.bgColor, CTA_BG),
              borderRadius: (tmpl.cta.rectRadius || 0.05) * S,
              paddingVertical: 8,
              paddingHorizontal: 16,
              alignSelf: 'flex-start',
              marginTop: 12,
            }}>
              <Link src={`https://capittal.es/oportunidades?operation=${op.id}`} style={{
                fontSize: (tmpl.cta.fontSize || 11) * 0.85,
                color: hexColor(tmpl.cta.color, WHITE),
                fontFamily: 'Helvetica-Bold',
                textDecoration: 'none',
              }}>
                {tmpl.cta.text || 'Más Información →'}
              </Link>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      {tmpl.footer.visible && (
        <Text style={{
          position: 'absolute',
          left: (tmpl.footer.x || 0.6) * S,
          bottom: 15,
          fontSize: (tmpl.footer.fontSize || 8) * 0.85,
          color: hexColor(tmpl.footer.color, TEXT_MUTED),
        }}>
          {tmpl.footer.text || 'CAPITTAL — Información Confidencial'}
        </Text>
      )}
    </Page>
  );
};

const ClosingPage = ({ quarter, year, t }: { quarter: QuarterType; year: number; t: FullSlideTemplate }) => {
  const cl = t.closing || {};
  return (
    <Page size={[PW, PH]} style={[styles.page, { backgroundColor: hexColor((cl as any).background?.color, WHITE) }]}>
      {/* Top half — white */}
      <View style={{ width: PW, height: PH / 2, backgroundColor: WHITE }} />
      {/* Bottom half — navy */}
      <View style={{
        position: 'absolute',
        left: 0, top: PH / 2,
        width: PW, height: PH / 2,
        backgroundColor: hexColor((cl as any).bottomBgColor, NAVY),
        padding: 30,
      }}>
        {/* Thanks text */}
        {(cl as any).thanksText?.visible !== false && (
          <Text style={{
            fontSize: ((cl as any).thanksText?.fontSize || 40) * 0.8,
            color: hexColor((cl as any).thanksText?.color, WHITE),
            fontFamily: 'Helvetica-Bold',
            marginBottom: 10,
          }}>
            {(cl as any).thanksText?.text || 'Gracias'}
          </Text>
        )}

        {/* Email */}
        {(cl as any).email?.visible !== false && (
          <Link src="https://capittal.es/oportunidades" style={{
            fontSize: ((cl as any).email?.fontSize || 14) * 0.85,
            color: hexColor((cl as any).email?.color, TEXT_MUTED),
            textDecoration: 'none',
          }}>
            {(cl as any).email?.text || 'lluis@capittal.es'}
          </Link>
        )}

        {/* Doc title */}
        {(cl as any).docTitle?.visible !== false && (
          <Text style={{
            position: 'absolute',
            right: 30,
            bottom: 20,
            fontSize: ((cl as any).docTitle?.fontSize || 12) * 0.85,
            color: hexColor((cl as any).docTitle?.color, TEXT_MUTED),
          }}>
            Capittal Dealhub — {quarter} {year}
          </Text>
        )}
      </View>
    </Page>
  );
};

// ─── MAIN DOCUMENT ───

interface DealhubPDFProps {
  operations: Operation[];
  selectedSections: string[];
  quarter: QuarterType;
  year: number;
  template: FullSlideTemplate;
}

const DealhubPDFDocument = ({ operations, selectedSections, quarter, year, template }: DealhubPDFProps) => {
  // Build section counts for index page
  const sectionCounts: Record<string, number> = {};
  DEALHUB_SECTIONS.forEach(s => {
    sectionCounts[s.key] = operations.filter(s.filter).length;
  });

  return (
    <Document title={`Capittal Dealhub - Open Deals ${quarter} ${year}`} author="Capittal">
      <CoverPage quarter={quarter} year={year} t={template} />
      <IndexPage sectionCounts={sectionCounts} t={template} />

      {DEALHUB_SECTIONS.map((section, i) => {
        if (!selectedSections.includes(section.key)) return null;
        const ops = operations.filter(section.filter);
        if (ops.length === 0) return null;
        const sectionNum = String(i + 1).padStart(2, '0');

        return [
          <SeparatorPage key={`sep-${section.key}`} num={sectionNum} label={section.label} subtitle={section.subtitle} t={template} />,
          ...ops.map(op => (
            <OperationPage key={op.id} op={op} t={template} />
          )),
        ];
      })}

      <ClosingPage quarter={quarter} year={year} t={template} />
    </Document>
  );
};

// ─── EXPORT FUNCTION ───

export async function generateDealhubPdf(
  operations: Operation[],
  selectedSections: string[],
  quarter: QuarterType,
  year?: number,
  template?: FullSlideTemplate,
): Promise<void> {
  const currentYear = year || new Date().getFullYear();
  const fullTemplate = template || DEFAULT_FULL_TEMPLATE;
  const fileName = `Capittal_Dealhub_${quarter}_${currentYear}.pdf`;

  const doc = (
    <DealhubPDFDocument
      operations={operations}
      selectedSections={selectedSections}
      quarter={quarter}
      year={currentYear}
      template={fullTemplate}
    />
  );

  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
