import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { ProfessionalValuationData, NormalizationAdjustment, FinancialYear } from '@/types/professionalValuation';

// Registrar fuentes
Font.register({
  family: 'Plus Jakarta Sans',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Light.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Medium.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/PlusJakartaSans-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    lineHeight: 1.5,
  },
  // Cover page
coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 50,
    fontFamily: 'Plus Jakarta Sans',
  },
  coverLogos: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    gap: 40,
  },
  coverLogo: {
    width: 120,
    height: 40,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: 1,
  },
  coverCompany: {
    fontSize: 24,
    fontWeight: 500,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 60,
  },
  coverConfidential: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#ef4444',
    letterSpacing: 3,
    fontWeight: 700,
  },
  // Content pages
contentPage: {
    padding: 40,
    fontFamily: 'Plus Jakarta Sans',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
  },
  headerLogo: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
  },
  headerCompany: {
    fontSize: 10,
    color: '#64748b',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
  },
  // Executive summary
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#0f172a',
    padding: 20,
    marginBottom: 25,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  summaryLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  summarySubtext: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 2,
  },
  // Valuation highlight
  valuationHighlight: {
    backgroundColor: '#0f172a',
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  valuationLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valuationValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
  },
  valuationRange: {
    fontSize: 11,
    color: '#64748b',
  },
  // Tables
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontWeight: 700,
    fontSize: 9,
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0f172a',
  },
  // Financial evolution
  financialGrid: {
    flexDirection: 'row',
    marginTop: 10,
  },
  yearColumn: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8fafc',
    marginHorizontal: 3,
  },
  yearLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 15,
  },
  metricRow: {
    width: '100%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 11,
    fontWeight: 500,
    color: '#0f172a',
  },
  // Normalization
  normalizationBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
    padding: 15,
    marginBottom: 15,
  },
  normalizationTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#92400e',
    marginBottom: 8,
  },
  normalizationText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.4,
  },
  adjustmentAdd: {
    color: '#16a34a',
  },
  adjustmentSubtract: {
    color: '#dc2626',
  },
  // Sensitivity matrix
  matrixContainer: {
    marginTop: 15,
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixCell: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  matrixHeaderCell: {
    backgroundColor: '#0f172a',
  },
  matrixHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: '#ffffff',
  },
  matrixLabelCell: {
    backgroundColor: '#f1f5f9',
  },
  matrixLabelText: {
    fontSize: 8,
    fontWeight: 500,
    color: '#475569',
  },
  matrixValueText: {
    fontSize: 8,
    color: '#334155',
  },
  matrixHighlight: {
    backgroundColor: '#dbeafe',
  },
  matrixHighlightText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1e40af',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
  },
  // Disclaimer
  disclaimer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 15,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#991b1b',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#7f1d1d',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  // Signature
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#64748b',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
  },
  signatureRole: {
    fontSize: 10,
    color: '#64748b',
  },
  signatureContact: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 4,
  },
  // Text styles
  paragraph: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 700,
  },
  // Context boxes
  contextBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 15,
  },
  contextTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  // Strengths/Weaknesses
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  columnBox: {
    flex: 1,
    padding: 15,
  },
  strengthsBox: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  weaknessesBox: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  columnTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
  },
  strengthsTitle: {
    color: '#166534',
  },
  weaknessesTitle: {
    color: '#991b1b',
  },
  columnText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  strengthsText: {
    color: '#15803d',
  },
  weaknessesText: {
    color: '#b91c1c',
  },
});

interface ProfessionalValuationPDFProps {
  data: ProfessionalValuationData;
  advisorInfo?: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    website?: string;
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (date?: string): string => {
  if (!date) return new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Logo de Capittal - Componente de texto estilizado
const CapittalLogo: React.FC<{ color?: string; fontSize?: number }> = ({ 
  color = '#0f172a', 
  fontSize = 16 
}) => (
  <Text style={{ 
    fontFamily: 'Plus Jakarta Sans',
    fontSize, 
    fontWeight: 700, 
    color,
    letterSpacing: 1 
  }}>
    Capittal
  </Text>
);

// Cover Page Component
const CoverPage: React.FC<{ data: ProfessionalValuationData }> = ({ data }) => (
  <Page size="A4" style={styles.coverPage}>
    <View style={styles.coverLogos}>
      <CapittalLogo color="#0f172a" fontSize={28} />
      {data.clientLogoUrl && (
        <>
          <Text style={{ fontSize: 20, color: '#64748b', marginHorizontal: 15 }}>×</Text>
          <Image 
            src={data.clientLogoUrl} 
            style={{ 
              maxWidth: 120, 
              maxHeight: 50, 
              objectFit: 'contain' 
            }} 
          />
        </>
      )}
    </View>
    
    <Text style={[styles.coverTitle, { color: '#0f172a' }]}>INFORME DE VALORACIÓN</Text>
    
    <Text style={[styles.coverCompany, { color: '#0f172a' }]}>{data.clientCompany}</Text>
    
    <Text style={styles.coverDate}>{formatDate(data.createdAt)}</Text>
    
    <Text style={styles.coverConfidential}>CONFIDENCIAL</Text>
  </Page>
);

// Executive Summary Page
const ExecutiveSummaryPage: React.FC<{ data: ProfessionalValuationData }> = ({ data }) => (
  <Page size="A4" style={styles.contentPage}>
    <View style={styles.header}>
      <CapittalLogo />
      <Text style={styles.headerCompany}>{data.clientCompany}</Text>
    </View>
    
    <Text style={styles.pageTitle}>Resumen Ejecutivo</Text>
    
    {/* Main Valuation */}
    <View style={styles.valuationHighlight}>
      <Text style={styles.valuationLabel}>Valoración Estimada</Text>
      <Text style={styles.valuationValue}>{formatCurrency(data.valuationCentral || 0)}</Text>
    </View>
    
    {/* Key Metrics */}
    <View style={styles.summaryBox}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EBITDA Normalizado</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.normalizedEbitda || 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Múltiplo Aplicado</Text>
          <Text style={styles.summaryValue}>{(data.ebitdaMultipleUsed || 0).toFixed(1)}x</Text>
          <Text style={styles.summarySubtext}>
            Rango: {(data.ebitdaMultipleLow || 0).toFixed(1)}x - {(data.ebitdaMultipleHigh || 0).toFixed(1)}x
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Sector</Text>
          <Text style={[styles.summaryValue, { fontSize: 11 }]}>{data.sector}</Text>
        </View>
      </View>
    </View>
    
    {/* Client Info */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información del Cliente</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.4 }]}>Empresa:</Text>
          <Text style={[styles.tableCellBold, { flex: 0.6 }]}>{data.clientCompany}</Text>
        </View>
        {data.clientCif && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.4 }]}>CIF:</Text>
            <Text style={[styles.tableCell, { flex: 0.6 }]}>{data.clientCif}</Text>
          </View>
        )}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.4 }]}>Contacto:</Text>
          <Text style={[styles.tableCell, { flex: 0.6 }]}>{data.clientName}</Text>
        </View>
        {data.clientEmail && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.4 }]}>Email:</Text>
            <Text style={[styles.tableCell, { flex: 0.6 }]}>{data.clientEmail}</Text>
          </View>
        )}
      </View>
    </View>
    
    {/* Context if provided */}
    {data.valuationContext && (
      <View style={styles.contextBox}>
        <Text style={styles.contextTitle}>Contexto de la Valoración</Text>
        <Text style={styles.contextText}>{data.valuationContext}</Text>
      </View>
    )}
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>Capittal - Informe de Valoración Profesional</Text>
      <Text style={styles.pageNumber}>Página 2</Text>
    </View>
  </Page>
);

// Financial Analysis Page
const FinancialAnalysisPage: React.FC<{ data: ProfessionalValuationData }> = ({ data }) => {
  const years = data.financialYears || [];
  const sortedYears = [...years].sort((a, b) => a.year - b.year);
  
  return (
    <Page size="A4" style={styles.contentPage}>
      <View style={styles.header}>
        <CapittalLogo />
        <Text style={styles.headerCompany}>{data.clientCompany}</Text>
      </View>
      
      <Text style={styles.pageTitle}>Análisis Financiero</Text>
      
      {/* Financial Evolution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolución Financiera</Text>
        <View style={styles.financialGrid}>
          {sortedYears.map((year, index) => (
            <View key={index} style={styles.yearColumn}>
              <Text style={styles.yearLabel}>{year.year}</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Facturación</Text>
                <Text style={styles.metricValue}>{formatCurrency(year.revenue)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>EBITDA</Text>
                <Text style={styles.metricValue}>{formatCurrency(year.ebitda)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Resultado Neto</Text>
                <Text style={styles.metricValue}>{formatCurrency(year.netProfit)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Margen EBITDA</Text>
                <Text style={styles.metricValue}>
                  {year.revenue > 0 ? ((year.ebitda / year.revenue) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Financial Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalle Financiero</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.3 }]}>Concepto</Text>
            {sortedYears.map((year, i) => (
              <Text key={i} style={[styles.tableHeaderCell, { flex: 0.7 / sortedYears.length, textAlign: 'right' }]}>
                {year.year}
              </Text>
            ))}
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.3 }]}>Facturación</Text>
            {sortedYears.map((year, i) => (
              <Text key={i} style={[styles.tableCell, { flex: 0.7 / sortedYears.length, textAlign: 'right' }]}>
                {formatCurrency(year.revenue)}
              </Text>
            ))}
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.3 }]}>EBITDA Reportado</Text>
            {sortedYears.map((year, i) => (
              <Text key={i} style={[styles.tableCell, { flex: 0.7 / sortedYears.length, textAlign: 'right' }]}>
                {formatCurrency(year.ebitda)}
              </Text>
            ))}
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.3 }]}>Resultado Neto</Text>
            {sortedYears.map((year, i) => (
              <Text key={i} style={[styles.tableCell, { flex: 0.7 / sortedYears.length, textAlign: 'right' }]}>
                {formatCurrency(year.netProfit)}
              </Text>
            ))}
          </View>
          
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tableCellBold, { flex: 0.3 }]}>Margen EBITDA</Text>
            {sortedYears.map((year, i) => (
              <Text key={i} style={[styles.tableCellBold, { flex: 0.7 / sortedYears.length, textAlign: 'right' }]}>
                {year.revenue > 0 ? ((year.ebitda / year.revenue) * 100).toFixed(1) : 0}%
              </Text>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Capittal - Informe de Valoración Profesional</Text>
        <Text style={styles.pageNumber}>Página 3</Text>
      </View>
    </Page>
  );
};

// EBITDA Normalization Page
const NormalizationPage: React.FC<{ data: ProfessionalValuationData }> = ({ data }) => {
  const adjustments = data.normalizationAdjustments || [];
  const reportedEbitda = data.reportedEbitda || 0;
  const normalizedEbitda = data.normalizedEbitda || 0;
  
  const totalAdd = adjustments
    .filter(a => a.type === 'add')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const totalSubtract = adjustments
    .filter(a => a.type === 'subtract')
    .reduce((sum, a) => sum + a.amount, 0);
  
  return (
    <Page size="A4" style={styles.contentPage}>
      <View style={styles.header}>
        <CapittalLogo />
        <Text style={styles.headerCompany}>{data.clientCompany}</Text>
      </View>
      
      <Text style={styles.pageTitle}>Normalización del EBITDA</Text>
      
      {/* Explanation */}
      <View style={styles.normalizationBox}>
        <Text style={styles.normalizationTitle}>¿Por qué normalizamos el EBITDA?</Text>
        <Text style={styles.normalizationText}>
          La normalización del EBITDA ajusta los resultados financieros para reflejar el rendimiento 
          real y recurrente del negocio. Eliminamos gastos no operativos, extraordinarios o que no 
          se transferirían a un nuevo propietario, obteniendo así una base más precisa para la valoración.
        </Text>
      </View>
      
      {/* Normalization Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajustes Aplicados</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Concepto</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.3 }]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.2, textAlign: 'right' }]}>Importe</Text>
          </View>
          
          {/* Starting EBITDA */}
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>EBITDA Reportado</Text>
            <Text style={[styles.tableCell, { flex: 0.3 }]}>Base de partida</Text>
            <Text style={[styles.tableCellBold, { flex: 0.2, textAlign: 'right' }]}>
              {formatCurrency(reportedEbitda)}
            </Text>
          </View>
          
          {/* Adjustments */}
          {adjustments.map((adj, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{adj.concept}</Text>
              <Text style={[styles.tableCell, { flex: 0.3, fontSize: 8 }]}>{adj.description || '-'}</Text>
              <Text style={[
                styles.tableCell, 
                { flex: 0.2, textAlign: 'right' },
                adj.type === 'add' ? styles.adjustmentAdd : styles.adjustmentSubtract
              ]}>
                {adj.type === 'add' ? '+' : '-'} {formatCurrency(adj.amount)}
              </Text>
            </View>
          ))}
          
          {/* Totals */}
          {totalAdd > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.8, fontWeight: 500 }]}>Total ajustes positivos</Text>
              <Text style={[styles.tableCell, styles.adjustmentAdd, { flex: 0.2, textAlign: 'right' }]}>
                + {formatCurrency(totalAdd)}
              </Text>
            </View>
          )}
          {totalSubtract > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.8, fontWeight: 500 }]}>Total ajustes negativos</Text>
              <Text style={[styles.tableCell, styles.adjustmentSubtract, { flex: 0.2, textAlign: 'right' }]}>
                - {formatCurrency(totalSubtract)}
              </Text>
            </View>
          )}
          
          {/* Final EBITDA */}
          <View style={[styles.tableRow, { backgroundColor: '#0f172a' }]}>
            <Text style={[styles.tableCellBold, { flex: 0.8, color: '#ffffff' }]}>EBITDA NORMALIZADO</Text>
            <Text style={[styles.tableCellBold, { flex: 0.2, textAlign: 'right', color: '#ffffff' }]}>
              {formatCurrency(normalizedEbitda)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Capittal - Informe de Valoración Profesional</Text>
        <Text style={styles.pageNumber}>Página 4</Text>
      </View>
    </Page>
  );
};

// Methodology Page
const MethodologyPage: React.FC<{ data: ProfessionalValuationData }> = ({ data }) => (
  <Page size="A4" style={styles.contentPage}>
    <View style={styles.header}>
      <CapittalLogo />
      <Text style={styles.headerCompany}>{data.clientCompany}</Text>
    </View>
    
    <Text style={styles.pageTitle}>Metodología de Valoración</Text>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Método de Múltiplos EBITDA</Text>
      <Text style={styles.paragraph}>
        El método de múltiplos EBITDA es el enfoque de valoración más utilizado en el mercado español 
        de M&A para empresas medianas. Este método compara la empresa objetivo con transacciones 
        comparables en el mismo sector, aplicando un múltiplo al EBITDA normalizado.
      </Text>
      <Text style={styles.paragraph}>
        El múltiplo EBITDA refleja cuántos años de beneficio operativo normalizado está dispuesto a 
        pagar un comprador estratégico o financiero por la empresa.
      </Text>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cálculo de la Valoración</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.6 }]}>EBITDA Normalizado</Text>
          <Text style={[styles.tableCellBold, { flex: 0.4, textAlign: 'right' }]}>
            {formatCurrency(data.normalizedEbitda || 0)}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.6 }]}>Múltiplo aplicado</Text>
          <Text style={[styles.tableCellBold, { flex: 0.4, textAlign: 'right' }]}>
            {(data.ebitdaMultipleUsed || 0).toFixed(1)}x
          </Text>
        </View>
        <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
          <Text style={[styles.tableCellBold, { flex: 0.6 }]}>Valoración resultante</Text>
          <Text style={[styles.tableCellBold, { flex: 0.4, textAlign: 'right' }]}>
            {formatCurrency(data.valuationCentral || 0)}
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Justificación del Múltiplo</Text>
      <View style={styles.contextBox}>
        <Text style={styles.contextText}>
          {data.multipleJustification || 
            `El múltiplo de ${(data.ebitdaMultipleUsed || 0).toFixed(1)}x se ha seleccionado considerando 
            el sector de actividad (${data.sector}), el tamaño de la empresa, la calidad de los beneficios, 
            las perspectivas de crecimiento y las condiciones actuales del mercado de M&A en España.`}
        </Text>
      </View>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rango de Múltiplos del Sector</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Escenario</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.25, textAlign: 'center' }]}>Múltiplo</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.25, textAlign: 'right' }]}>Valoración</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>Conservador</Text>
          <Text style={[styles.tableCell, { flex: 0.25, textAlign: 'center' }]}>
            {(data.ebitdaMultipleLow || 0).toFixed(1)}x
          </Text>
          <Text style={[styles.tableCell, { flex: 0.25, textAlign: 'right' }]}>
            {formatCurrency(data.valuationLow || 0)}
          </Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={[styles.tableCellBold, { flex: 0.5 }]}>Base (recomendado)</Text>
          <Text style={[styles.tableCellBold, { flex: 0.25, textAlign: 'center' }]}>
            {(data.ebitdaMultipleUsed || 0).toFixed(1)}x
          </Text>
          <Text style={[styles.tableCellBold, { flex: 0.25, textAlign: 'right' }]}>
            {formatCurrency(data.valuationCentral || 0)}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>Optimista</Text>
          <Text style={[styles.tableCell, { flex: 0.25, textAlign: 'center' }]}>
            {(data.ebitdaMultipleHigh || 0).toFixed(1)}x
          </Text>
          <Text style={[styles.tableCell, { flex: 0.25, textAlign: 'right' }]}>
            {formatCurrency(data.valuationHigh || 0)}
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>Capittal - Informe de Valoración Profesional</Text>
      <Text style={styles.pageNumber}>Página 5</Text>
    </View>
  </Page>
);

// Disclaimer & Signature Page
const DisclaimerPage: React.FC<{ 
  data: ProfessionalValuationData;
  advisorInfo?: { name: string; role: string; email: string; phone?: string; website?: string };
}> = ({ data, advisorInfo }) => (
  <Page size="A4" style={styles.contentPage}>
    <View style={styles.header}>
      <CapittalLogo />
      <Text style={styles.headerCompany}>{data.clientCompany}</Text>
    </View>
    
    <Text style={styles.pageTitle}>Aviso Legal y Limitaciones</Text>
    
    {/* Strengths & Weaknesses moved from SensitivityPage */}
    {(data.strengths || data.weaknesses) && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Factores que Influyen en la Valoración</Text>
        <View style={styles.twoColumnGrid}>
          {data.strengths && (
            <View style={[styles.columnBox, styles.strengthsBox]}>
              <Text style={[styles.columnTitle, styles.strengthsTitle]}>
                Factores Positivos
              </Text>
              <Text style={[styles.columnText, styles.strengthsText]}>
                {data.strengths}
              </Text>
            </View>
          )}
          {data.weaknesses && (
            <View style={[styles.columnBox, styles.weaknessesBox]}>
              <Text style={[styles.columnTitle, styles.weaknessesTitle]}>
                Factores de Riesgo
              </Text>
              <Text style={[styles.columnText, styles.weaknessesText]}>
                {data.weaknesses}
              </Text>
            </View>
          )}
        </View>
      </View>
    )}
    
    <View style={styles.disclaimer}>
      <Text style={styles.disclaimerTitle}>Propósito del Informe</Text>
      <Text style={styles.disclaimerText}>
        Este informe de valoración ha sido preparado exclusivamente para fines informativos 
        y tiene carácter estrictamente confidencial. No debe tomarse como un informe de 
        valoración formal ni como asesoramiento profesional.
      </Text>
      <Text style={styles.disclaimerText}>
        La valoración contenida es una estimación basada en el método de múltiplos de EBITDA 
        y no constituye una oferta de compra o venta, ni tampoco asesoramiento financiero, 
        fiscal o legal.
      </Text>
      
      <Text style={styles.disclaimerTitle}>Limitaciones</Text>
      <Text style={styles.disclaimerText}>
        • Los resultados se basan en la información financiera proporcionada por el cliente. 
        No se ha realizado una auditoría independiente de dicha información.
      </Text>
      <Text style={styles.disclaimerText}>
        • Los múltiplos utilizados son referencias de mercado que pueden variar según las 
        condiciones económicas, el perfil del comprador y las características específicas 
        de cada transacción.
      </Text>
      <Text style={styles.disclaimerText}>
        • Esta valoración NO incluye el valor de inmuebles, activos no operativos, exceso 
        de tesorería ni deuda financiera neta. Estos elementos deberían ajustarse para 
        obtener el valor de las participaciones (equity value).
      </Text>
      
      <Text style={styles.disclaimerTitle}>Validez</Text>
      <Text style={styles.disclaimerText}>
        Esta valoración refleja las condiciones de mercado en la fecha de emisión 
        ({formatDate(data.createdAt)}) y está sujeta a cambios en función de la evolución 
        de la empresa y del mercado. Se recomienda actualizar periódicamente.
      </Text>
      
      <Text style={styles.disclaimerTitle}>Uso Recomendado</Text>
      <Text style={styles.disclaimerText}>
        Para transacciones reales de compraventa, se recomienda complementar esta valoración 
        indicativa con un proceso de due diligence completo y valoración profesional detallada.
      </Text>
    </View>
    
    {/* Signature */}
    <View style={styles.signatureSection}>
      <Text style={styles.signatureTitle}>Preparado por</Text>
      <Text style={styles.signatureName}>
        {advisorInfo?.name || data.advisorName || 'Equipo Capittal'}
      </Text>
      <Text style={styles.signatureRole}>
        {advisorInfo?.role || 'Consultor de M&A'}
      </Text>
      <Text style={styles.signatureContact}>
        {advisorInfo?.email || data.advisorEmail || 'info@capittal.es'}
      </Text>
      <Text style={styles.signatureContact}>
        {advisorInfo?.website || 'www.capittal.es'} | {advisorInfo?.phone || '+34 XXX XXX XXX'}
      </Text>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>Capittal - Informe de Valoración Profesional</Text>
      <Text style={styles.pageNumber}>Página 6</Text>
    </View>
  </Page>
);

// Main Document Component
const ProfessionalValuationPDF: React.FC<ProfessionalValuationPDFProps> = ({ data, advisorInfo }) => {
  return (
    <Document
      title={`Valoración - ${data.clientCompany}`}
      author="Capittal"
      subject="Informe de Valoración Empresarial"
      keywords="valoración, EBITDA, M&A, Capittal"
    >
      <CoverPage data={data} />
      <ExecutiveSummaryPage data={data} />
      <FinancialAnalysisPage data={data} />
      {(data.normalizationAdjustments?.length ?? 0) > 0 && <NormalizationPage data={data} />}
      <MethodologyPage data={data} />
      <DisclaimerPage data={data} advisorInfo={advisorInfo} />
    </Document>
  );
};

export default ProfessionalValuationPDF;
