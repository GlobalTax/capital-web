import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, pdf } from '@react-pdf/renderer';
import type { Operation } from '../types/operations';
import { DEALHUB_SECTIONS, type QuarterType } from './generateDealhubPptx';

// ─── DESIGN TOKENS ───
const NAVY = '#161B22';
const WHITE = '#FFFFFF';
const TEXT_SECONDARY = '#58606E';
const TEXT_MUTED = '#8B919B';
const ACCENT = '#2563EB';
const CTA_BG = '#3A3F47';

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: WHITE,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // Cover
  coverPage: {
    backgroundColor: NAVY,
    padding: 60,
    justifyContent: 'flex-end',
    height: '100%',
  },
  coverYear: {
    fontSize: 72,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    position: 'absolute',
    top: 50,
    left: 60,
  },
  coverBranding: {
    fontSize: 11,
    color: TEXT_MUTED,
    position: 'absolute',
    top: 55,
    right: 60,
    textAlign: 'right',
  },
  coverTitle: {
    fontSize: 36,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 5,
  },
  // Separator
  separatorPage: {
    backgroundColor: NAVY,
    padding: 60,
    justifyContent: 'center',
    height: '100%',
  },
  separatorNum: {
    fontSize: 120,
    color: TEXT_MUTED,
    fontFamily: 'Helvetica-Bold',
    opacity: 0.15,
    position: 'absolute',
    top: 40,
    right: 60,
  },
  separatorLabel: {
    fontSize: 36,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  separatorSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  // Operation slide
  opPage: {
    padding: 40,
    height: '100%',
  },
  opHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  opLeft: {
    width: '55%',
  },
  opRight: {
    width: '40%',
    backgroundColor: NAVY,
    borderRadius: 8,
    padding: 20,
  },
  opTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 10,
  },
  opDescription: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    lineHeight: 1.5,
    marginBottom: 14,
  },
  highlightsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 6,
  },
  highlightItem: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    marginBottom: 3,
    paddingLeft: 8,
  },
  // Summary card
  summaryLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: TEXT_MUTED,
    marginVertical: 10,
    opacity: 0.3,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  financialLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
  },
  financialValue: {
    fontSize: 10,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
  },
  // CTA
  ctaContainer: {
    backgroundColor: CTA_BG,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  ctaText: {
    fontSize: 10,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'none',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
  },
  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  // Closing
  closingPage: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  closingTop: {
    width: '100%',
    height: '50%',
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closingBottom: {
    width: '100%',
    height: '50%',
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  closingTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    marginBottom: 8,
  },
  closingSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
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

// ─── COMPONENTS ───

const CoverPage = ({ quarter, year }: { quarter: QuarterType; year: number }) => (
  <Page size={[960, 540]} style={styles.coverPage}>
    <Text style={styles.coverYear}>{year}</Text>
    <Text style={styles.coverBranding}>CAPITTAL{'\n'}M&A · Consulting</Text>
    <Text style={styles.coverTitle}>Capittal Dealhub — Open Deals</Text>
    <Text style={styles.coverSubtitle}>{quarter} {year} · Información Confidencial</Text>
  </Page>
);

const SeparatorPage = ({ num, label, subtitle }: { num: string; label: string; subtitle: string }) => (
  <Page size={[960, 540]} style={styles.separatorPage}>
    <Text style={styles.separatorNum}>{num}</Text>
    <Text style={styles.separatorLabel}>{label}</Text>
    <Text style={styles.separatorSubtitle}>{subtitle}</Text>
  </Page>
);

const OperationPage = ({ op }: { op: Operation }) => {
  const desc = (op.description || '').substring(0, 800);
  const highlights = op.highlights || [];

  return (
    <Page size={[960, 540]} style={styles.opPage}>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {/* Left column */}
        <View style={styles.opLeft}>
          <Text style={styles.opTitle}>{op.company_name}</Text>
          {desc ? <Text style={styles.opDescription}>{desc}</Text> : null}
          {highlights.length > 0 && (
            <View>
              <Text style={styles.highlightsTitle}>Aspectos Destacados</Text>
              {highlights.map((h, i) => (
                <Text key={i} style={styles.highlightItem}>• {h}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Right column — dark card */}
        <View style={styles.opRight}>
          <Text style={styles.summaryLabel}>Ubicación</Text>
          <Text style={styles.summaryValue}>España</Text>
          <Text style={styles.summaryLabel}>Sector</Text>
          <Text style={styles.summaryValue}>{op.sector || 'N/D'}</Text>
          <Text style={styles.summaryLabel}>Oportunidad</Text>
          <Text style={styles.summaryValue}>{op.short_description || op.deal_type || 'Venta'}</Text>

          <View style={styles.divider} />

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Facturación</Text>
            <Text style={styles.financialValue}>{fmtCurrency(op.revenue_amount)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>EBITDA</Text>
            <Text style={styles.financialValue}>{fmtCurrency(op.ebitda_amount)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Margen EBITDA</Text>
            <Text style={styles.financialValue}>{fmtMargin(op.ebitda_amount, op.revenue_amount)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Empleados</Text>
            <Text style={styles.financialValue}>{op.company_size_employees || 'N/D'}</Text>
          </View>

          <View style={styles.ctaContainer}>
            <Link src="mailto:lluis@capittal.es" style={styles.ctaText}>
              Más Información →
            </Link>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CAPITTAL — Información Confidencial</Text>
      </View>
    </Page>
  );
};

const ClosingPage = ({ quarter, year }: { quarter: QuarterType; year: number }) => (
  <Page size={[960, 540]} style={styles.closingPage}>
    <View style={styles.closingTop} />
    <View style={styles.closingBottom}>
      <Text style={styles.closingTitle}>¿Interesado en alguna operación?</Text>
      <Text style={styles.closingSubtitle}>
        Contacta con nosotros para más información{'\n'}
        <Link src="mailto:lluis@capittal.es" style={{ color: ACCENT, textDecoration: 'none' }}>
          lluis@capittal.es
        </Link>
      </Text>
    </View>
  </Page>
);

// ─── MAIN DOCUMENT ───

interface DealhubPDFProps {
  operations: Operation[];
  selectedSections: string[];
  quarter: QuarterType;
  year: number;
}

const DealhubPDFDocument = ({ operations, selectedSections, quarter, year }: DealhubPDFProps) => (
  <Document title={`Capittal Dealhub - Open Deals ${quarter} ${year}`} author="Capittal">
    <CoverPage quarter={quarter} year={year} />

    {DEALHUB_SECTIONS.map((section, i) => {
      if (!selectedSections.includes(section.key)) return null;
      const ops = operations.filter(section.filter);
      if (ops.length === 0) return null;
      const sectionNum = String(i + 1).padStart(2, '0');

      return (
        <React.Fragment key={section.key}>
          <SeparatorPage num={sectionNum} label={section.label} subtitle={section.subtitle} />
          {ops.map(op => (
            <OperationPage key={op.id} op={op} />
          ))}
        </React.Fragment>
      );
    })}

    <ClosingPage quarter={quarter} year={year} />
  </Document>
);

// ─── EXPORT FUNCTION ───

export async function generateDealhubPdf(
  operations: Operation[],
  selectedSections: string[],
  quarter: QuarterType,
  year?: number,
): Promise<void> {
  const currentYear = year || new Date().getFullYear();
  const fileName = `Capittal_Dealhub_${quarter}_${currentYear}.pdf`;

  const doc = (
    <DealhubPDFDocument
      operations={operations}
      selectedSections={selectedSections}
      quarter={quarter}
      year={currentYear}
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
