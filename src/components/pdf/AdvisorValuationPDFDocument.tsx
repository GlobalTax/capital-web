import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { localeForIntl, LangCode } from '@/shared/i18n/locale';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';

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

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 15,
    marginBottom: 25,
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: '#000000',
  },
  subtitle: {
    fontSize: 9,
    color: '#666666',
    marginTop: 3,
  },
  dateSection: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 8,
    color: '#666666',
  },
  dateValue: {
    fontSize: 10,
    fontWeight: 500,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 8,
  },
  companyTitle: {
    fontSize: 14,
    color: '#333333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 3,
    marginBottom: 12,
  },
  executiveSummary: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  summaryColumn: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  summaryColumnBlue: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  summaryColumnGreen: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValueBlue: {
    color: '#2563eb',
  },
  summaryValueGreen: {
    color: '#16a34a',
  },
  summarySubtext: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 3,
  },
  comparisonTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dee2e6',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    textAlign: 'center',
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  dataColumn: {
    flex: 1,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eeeeee',
  },
  dataLabel: {
    flex: 0.6,
    fontSize: 9,
    fontWeight: 500,
  },
  dataValue: {
    flex: 0.4,
    fontSize: 9,
    textAlign: 'right',
  },
  methodologyBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginTop: 10,
  },
  methodologyText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    padding: 15,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#856404',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#856404',
    lineHeight: 1.3,
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
  },
});

interface AdvisorValuationPDFDocumentProps {
  formData: AdvisorFormData;
  result: AdvisorValuationSimpleResult;
  lang?: LangCode;
}

const AdvisorValuationPDFDocument: React.FC<AdvisorValuationPDFDocumentProps> = ({ 
  formData, 
  result, 
  lang = 'es' 
}) => {
  const locale = localeForIntl(lang);

  const L = {
    es: {
      reportDateLabel: 'Fecha del informe',
      reportTitle: 'INFORME DE VALORACIÓN EMPRESARIAL',
      dualMethodology: 'METODOLOGÍA DUAL',
      executiveSummary: 'RESUMEN EJECUTIVO - DOBLE METODOLOGÍA',
      ebitdaValuation: 'Valoración por EBITDA',
      revenueValuation: 'Valoración por Facturación',
      multiple: 'Múltiplo',
      range: 'Rango',
      comparisonTitle: 'COMPARACIÓN DE MÉTODOS',
      method: 'Método',
      valuation: 'Valoración',
      variance: 'Variación',
      companyInfo: 'INFORMACIÓN DE LA EMPRESA',
      generalData: 'Datos Generales',
      companyName: 'Razón Social',
      cif: 'CIF',
      firmType: 'Tipo de Firma',
      employees: 'Nº empleados',
      contactPerson: 'Persona de contacto',
      email: 'Email',
      phone: 'Teléfono',
      financialData: 'DATOS FINANCIEROS',
      annualRevenue: 'Facturación anual',
      ebitda: 'EBITDA',
      valuationMethodology: 'METODOLOGÍA DE VALORACIÓN',
      ebitdaMethodTitle: 'Método EBITDA',
      ebitdaMethodText: 'La valoración por EBITDA utiliza múltiplos de mercado específicos del sector para determinar el valor empresarial basándose en el beneficio operativo (EBITDA).',
      revenueMethodTitle: 'Método de Facturación',
      revenueMethodText: 'La valoración por facturación aplica múltiplos sobre los ingresos totales de la empresa, siendo útil para empresas con márgenes variables o en sectores específicos.',
      legalDisclaimer: 'AVISO LEGAL Y LIMITACIONES',
      disclaimerPurpose: 'Propósito del informe:',
      disclaimerPurposeText: 'Esta valoración es una estimación basada en metodologías de múltiplos sectoriales y no constituye asesoramiento financiero, fiscal o legal profesional.',
      disclaimerLimitations: 'Limitaciones:',
      disclaimerLimitationsText: 'Los resultados se basan en información proporcionada y múltiplos de mercado generales. Para valoraciones precisas se recomienda un análisis detallado.',
      disclaimerValidity: 'Validez:',
      disclaimerValidityText: 'Esta estimación es válida en la fecha de emisión y está sujeta a cambios en las condiciones del mercado.',
      disclaimerUse: 'Uso recomendado:',
      disclaimerUseText: 'Esta valoración debe usarse únicamente como referencia inicial. Para transacciones reales, se recomienda realizar una due diligence completa.',
      footerText: 'CAPITTAL - Expertos en Valoración y Venta de Empresas',
    },
    ca: {
      reportDateLabel: "Data de l'informe",
      reportTitle: 'INFORME DE VALORACIÓ EMPRESARIAL',
      dualMethodology: 'METODOLOGIA DUAL',
      executiveSummary: 'RESUM EXECUTIU - DOBLE METODOLOGIA',
      ebitdaValuation: "Valoració per EBITDA",
      revenueValuation: 'Valoració per Facturació',
      multiple: 'Múltiple',
      range: 'Rang',
      comparisonTitle: 'COMPARACIÓ DE MÈTODES',
      method: 'Mètode',
      valuation: 'Valoració',
      variance: 'Variació',
      companyInfo: "INFORMACIÓ DE L'EMPRESA",
      generalData: 'Dades Generals',
      companyName: 'Raó Social',
      cif: 'NIF',
      firmType: 'Tipus de Firma',
      employees: "Núm. d'empleats",
      contactPerson: 'Persona de contacte',
      email: 'Email',
      phone: 'Telèfon',
      financialData: 'DADES FINANCERES',
      annualRevenue: 'Facturació anual',
      ebitda: 'EBITDA',
      valuationMethodology: 'METODOLOGIA DE VALORACIÓ',
      ebitdaMethodTitle: 'Mètode EBITDA',
      ebitdaMethodText: "La valoració per EBITDA utilitza múltiples de mercat específics del sector per determinar el valor empresarial basant-se en el benefici operatiu (EBITDA).",
      revenueMethodTitle: 'Mètode de Facturació',
      revenueMethodText: "La valoració per facturació aplica múltiples sobre els ingressos totals de l'empresa, sent útil per a empreses amb marges variables.",
      legalDisclaimer: 'AVÍS LEGAL I LIMITACIONS',
      disclaimerPurpose: "Propòsit de l'informe:",
      disclaimerPurposeText: "Aquesta valoració és una estimació basada en metodologies de múltiples sectorials i no constitueix assessorament professional.",
      disclaimerLimitations: 'Limitacions:',
      disclaimerLimitationsText: 'Els resultats es basen en informació proporcionada i múltiples de mercat generals.',
      disclaimerValidity: 'Validesa:',
      disclaimerValidityText: "Aquesta estimació és vàlida en la data d'emissió i subjecta a canvis.",
      disclaimerUse: 'Ús recomanat:',
      disclaimerUseText: "Aquesta valoració s'ha d'utilitzar només com a referència inicial.",
      footerText: "CAPITTAL - Experts en Valoració i Venda d'Empreses",
    },
    val: {
      reportDateLabel: "Data de l'informe",
      reportTitle: 'INFORME DE VALORACIÓ EMPRESARIAL',
      dualMethodology: 'METODOLOGIA DUAL',
      executiveSummary: 'RESUM EXECUTIU - DOBLE METODOLOGIA',
      ebitdaValuation: "Valoració per EBITDA",
      revenueValuation: 'Valoració per Facturació',
      multiple: 'Múltiple',
      range: 'Rang',
      comparisonTitle: 'COMPARACIÓ DE MÈTODES',
      method: 'Mètode',
      valuation: 'Valoració',
      variance: 'Variació',
      companyInfo: "INFORMACIÓ DE L'EMPRESA",
      generalData: 'Dades Generals',
      companyName: 'Raó Social',
      cif: 'NIF',
      firmType: 'Tipus de Firma',
      employees: "Núm. d'empleats",
      contactPerson: 'Persona de contacte',
      email: 'Email',
      phone: 'Telèfon',
      financialData: 'DADES FINANCERES',
      annualRevenue: 'Facturació anual',
      ebitda: 'EBITDA',
      valuationMethodology: 'METODOLOGIA DE VALORACIÓ',
      ebitdaMethodTitle: 'Mètode EBITDA',
      ebitdaMethodText: "La valoració per EBITDA utilitza múltiples de mercat específics del sector per determinar el valor empresarial basant-se en el benefici operatiu (EBITDA).",
      revenueMethodTitle: 'Mètode de Facturació',
      revenueMethodText: "La valoració per facturació aplica múltiples sobre els ingressos totals de l'empresa, sent útil per a empreses amb marges variables.",
      legalDisclaimer: 'AVÍS LEGAL I LIMITACIONS',
      disclaimerPurpose: "Propòsit de l'informe:",
      disclaimerPurposeText: "Esta valoració és una estimació basada en metodologies de múltiples sectorials i no constituïx assessorament professional.",
      disclaimerLimitations: 'Limitacions:',
      disclaimerLimitationsText: 'Els resultats es basen en informació proporcionada i múltiples de mercat generals.',
      disclaimerValidity: 'Validesa:',
      disclaimerValidityText: "Esta estimació és vàlida en la data d'emissió i subjecta a canvis.",
      disclaimerUse: 'Ús recomanat:',
      disclaimerUseText: "Esta valoració s'ha d'utilitzar només com a referència inicial.",
      footerText: "CAPITTAL - Experts en Valoració i Venda d'Empreses",
    },
    gl: {
      reportDateLabel: 'Data do informe',
      reportTitle: 'INFORME DE VALORACIÓN EMPRESARIAL',
      dualMethodology: 'METODOLOXÍA DUAL',
      executiveSummary: 'RESUMO EXECUTIVO - DOBRE METODOLOXÍA',
      ebitdaValuation: "Valoración por EBITDA",
      revenueValuation: 'Valoración por Facturación',
      multiple: 'Múltiplo',
      range: 'Rango',
      comparisonTitle: 'COMPARACIÓN DE MÉTODOS',
      method: 'Método',
      valuation: 'Valoración',
      variance: 'Variación',
      companyInfo: 'INFORMACIÓN DA EMPRESA',
      generalData: 'Datos Xerais',
      companyName: 'Razón Social',
      cif: 'NIF',
      firmType: 'Tipo de Firma',
      employees: 'Nº de empregados',
      contactPerson: 'Persoa de contacto',
      email: 'Email',
      phone: 'Teléfono',
      financialData: 'DATOS FINANCEIROS',
      annualRevenue: 'Facturación anual',
      ebitda: 'EBITDA',
      valuationMethodology: 'METODOLOXÍA DE VALORACIÓN',
      ebitdaMethodTitle: 'Método EBITDA',
      ebitdaMethodText: 'A valoración por EBITDA utiliza múltiplos de mercado específicos do sector para determinar o valor empresarial baseándose no beneficio operativo (EBITDA).',
      revenueMethodTitle: 'Método de Facturación',
      revenueMethodText: 'A valoración por facturación aplica múltiplos sobre os ingresos totais da empresa, sendo útil para empresas con marxes variables.',
      legalDisclaimer: 'AVISO LEGAL E LIMITACIÓNS',
      disclaimerPurpose: 'Propósito do informe:',
      disclaimerPurposeText: 'Esta valoración é unha estimación baseada en metodoloxías de múltiplos sectoriais e non constitúe asesoramento profesional.',
      disclaimerLimitations: 'Limitacións:',
      disclaimerLimitationsText: 'Os resultados baséanse en información proporcionada e múltiplos de mercado xerais.',
      disclaimerValidity: 'Validez:',
      disclaimerValidityText: 'Esta estimación é válida na data de emisión e pode cambiar coas condicións do mercado.',
      disclaimerUse: 'Uso recomendado:',
      disclaimerUseText: 'Esta valoración debe empregarse só como referencia inicial.',
      footerText: 'CAPITTAL - Expertos en Valoración e Venda de Empresas',
    },
  } as const;

  const T = L[lang];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  };

  const getFirmTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'asesoria_fiscal': 'Asesoría Fiscal',
      'asesoria_laboral': 'Asesoría Laboral',
      'asesoria_contable': 'Asesoría Contable',
      'asesoria_juridica': 'Asesoría Jurídica',
      'asesoria_integral': 'Asesoría Integral',
      'gestoria': 'Gestoría',
      'consultora': 'Consultoría',
    };
    return labels[type] || type;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>CAPITTAL</Text>
            <Text style={styles.subtitle}>{T.dualMethodology}</Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>{T.reportDateLabel}</Text>
            <Text style={styles.dateValue}>{formatDate()}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.title}>
          <Text style={styles.mainTitle}>{T.reportTitle}</Text>
          <Text style={styles.companyTitle}>{formData.companyName}</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.executiveSummary}>
          <Text style={styles.summaryTitle}>{T.executiveSummary}</Text>
          <View style={styles.summaryGrid}>
            {/* EBITDA Column */}
            <View style={styles.summaryColumnBlue}>
              <Text style={styles.summaryLabel}>{T.ebitdaValuation}</Text>
              <Text style={[styles.summaryValue, styles.summaryValueBlue]}>
                {formatCurrency(result.ebitdaValuation)}
              </Text>
              <Text style={styles.summarySubtext}>
                {T.multiple}: {result.ebitdaMultiple.toFixed(2)}x
              </Text>
              <Text style={styles.summarySubtext}>
                {T.range}: ±15%
              </Text>
            </View>

            {/* Revenue Column */}
            <View style={styles.summaryColumnGreen}>
              <Text style={styles.summaryLabel}>{T.revenueValuation}</Text>
              <Text style={[styles.summaryValue, styles.summaryValueGreen]}>
                {formatCurrency(result.revenueValuation)}
              </Text>
              <Text style={styles.summarySubtext}>
                {T.multiple}: {result.revenueMultiple.toFixed(2)}x
              </Text>
              <Text style={styles.summarySubtext}>
                {T.range}: ±15%
              </Text>
            </View>
          </View>
        </View>

        {/* Comparison Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.comparisonTitle}</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>{T.method}</Text>
              <Text style={styles.tableHeaderCell}>{T.valuation}</Text>
              <Text style={styles.tableHeaderCell}>{T.multiple}</Text>
              <Text style={styles.tableHeaderCell}>{T.range}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>EBITDA</Text>
              <Text style={styles.tableCellBold}>{formatCurrency(result.ebitdaValuation)}</Text>
              <Text style={styles.tableCell}>{result.ebitdaMultiple.toFixed(2)}x</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(result.ebitdaRange.min)} - {formatCurrency(result.ebitdaRange.max)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{T.annualRevenue}</Text>
              <Text style={styles.tableCellBold}>{formatCurrency(result.revenueValuation)}</Text>
              <Text style={styles.tableCell}>{result.revenueMultiple.toFixed(2)}x</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(result.revenueRange.min)} - {formatCurrency(result.revenueRange.max)}
              </Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.companyInfo}</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataColumn}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.companyName}:</Text>
                <Text style={styles.dataValue}>{formData.companyName}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.cif}:</Text>
                <Text style={styles.dataValue}>{formData.cif}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.firmType}:</Text>
                <Text style={styles.dataValue}>{getFirmTypeLabel(formData.firmType)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.employees}:</Text>
                <Text style={styles.dataValue}>{formData.employeeRange}</Text>
              </View>
            </View>
            <View style={styles.dataColumn}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.contactPerson}:</Text>
                <Text style={styles.dataValue}>{formData.contactName}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.email}:</Text>
                <Text style={styles.dataValue}>{formData.email}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{T.phone}:</Text>
                <Text style={styles.dataValue}>{formData.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Financial Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.financialData}</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{T.annualRevenue}:</Text>
            <Text style={styles.dataValue}>{formatCurrency(formData.revenue)}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{T.ebitda}:</Text>
            <Text style={styles.dataValue}>{formatCurrency(formData.ebitda)}</Text>
          </View>
        </View>

        {/* Valuation Methodology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.valuationMethodology}</Text>
          
          <View style={styles.methodologyBox}>
            <Text style={[styles.methodologyText, { fontWeight: 700 }]}>{T.ebitdaMethodTitle}</Text>
            <Text style={styles.methodologyText}>{T.ebitdaMethodText}</Text>
          </View>

          <View style={styles.methodologyBox}>
            <Text style={[styles.methodologyText, { fontWeight: 700 }]}>{T.revenueMethodTitle}</Text>
            <Text style={styles.methodologyText}>{T.revenueMethodText}</Text>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>{T.legalDisclaimer}</Text>
          
          <Text style={[styles.disclaimerText, { fontWeight: 700 }]}>{T.disclaimerPurpose}</Text>
          <Text style={styles.disclaimerText}>{T.disclaimerPurposeText}</Text>

          <Text style={[styles.disclaimerText, { fontWeight: 700, marginTop: 8 }]}>{T.disclaimerLimitations}</Text>
          <Text style={styles.disclaimerText}>{T.disclaimerLimitationsText}</Text>

          <Text style={[styles.disclaimerText, { fontWeight: 700, marginTop: 8 }]}>{T.disclaimerValidity}</Text>
          <Text style={styles.disclaimerText}>{T.disclaimerValidityText}</Text>

          <Text style={[styles.disclaimerText, { fontWeight: 700, marginTop: 8 }]}>{T.disclaimerUse}</Text>
          <Text style={styles.disclaimerText}>{T.disclaimerUseText}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{T.footerText}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default AdvisorValuationPDFDocument;
