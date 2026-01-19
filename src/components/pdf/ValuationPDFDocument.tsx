
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { localeForIntl, LangCode } from '@/shared/i18n/locale';

// Registrar fuentes con fallback en caso de error de red
let fontsRegistered = false;
try {
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
  fontsRegistered = true;
} catch (fontError) {
  console.warn('[PDF_FONT_REGISTRATION_FAILED]', fontError);
  // Will fall back to Helvetica (built-in)
}

// Estilos para el PDF - Usa Helvetica como fallback si las fuentes custom no cargan
const PDF_FONT_FAMILY = fontsRegistered ? 'Plus Jakarta Sans' : 'Helvetica';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: PDF_FONT_FAMILY,
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
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#333333',
    marginBottom: 8,
  },
  executiveSummary: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
    padding: 15,
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryColumn: {
    flex: 1,
    paddingRight: 15,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: 500,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 8,
    color: '#666666',
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataColumn: {
    flex: 1,
    paddingRight: 20,
  },
  table: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eeeeee',
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tableLabelCell: {
    flex: 0.6,
    fontWeight: 500,
  },
  tableValueCell: {
    flex: 0.4,
  },
  tableValueCellRight: {
    flex: 0.4,
    textAlign: 'right',
  },
  tableValueBold: {
    flex: 0.4,
    textAlign: 'right',
    fontWeight: 700,
    fontSize: 11,
  },
  methodologyBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 15,
  },
  calculationBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    textAlign: 'center',
    marginTop: 10,
  },
  calculationLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  factorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  factorBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    flex: 0.48,
  },
  factorTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 8,
  },
  factorList: {
    fontSize: 8,
    lineHeight: 1.3,
  },
  competitiveAdvantageBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  competitiveAdvantageText: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    fontSize: 8,
    lineHeight: 1.4,
    marginTop: 8,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    padding: 15,
    marginTop: 30,
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
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerColumn: {
    flex: 1,
    textAlign: 'center',
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 5,
  },
  footerText: {
    fontSize: 7,
    lineHeight: 1.3,
  },
});

interface ValuationPDFDocumentProps {
  companyData: any;
  result: any;
  lang?: LangCode;
}

const ValuationPDFDocument: React.FC<ValuationPDFDocumentProps> = ({ companyData, result, lang = 'es' }) => {
  const locale = localeForIntl(lang);

  const L = {
    es: {
      reportDateLabel: 'Fecha del informe',
      reportTitle: 'INFORME DE VALORACIÓN EMPRESARIAL',
      executiveSummary: 'RESUMEN EJECUTIVO',
      estimatedValuation: 'Valoración estimada:',
      range: 'Rango:',
      ebitdaMultipleApplied: 'Múltiplo EBITDA aplicado:',
      sector: 'Sector:',
      companyInfo: 'INFORMACIÓN DE LA EMPRESA',
      generalData: 'Datos Generales',
      legalName: 'Razón Social:',
      cif: 'CIF:',
      location: 'Ubicación:',
      yearsOperating: 'Años operando:',
      yearsSuffix: 'años',
      employeesCount: 'Nº empleados:',
      contact: 'Contacto',
      contactPerson: 'Persona de contacto:',
      email: 'Email:',
      phone: 'Teléfono:',
      financialData: 'DATOS FINANCIEROS',
      annualRevenue: 'Ingresos anuales:',
      ebitda: 'EBITDA:',
      netProfitMargin: 'Margen beneficio neto:',
      growthRate: 'Tasa de crecimiento:',
      valuationMethodology: 'METODOLOGÍA DE VALORACIÓN',
      ebitdaMultiplesBySector: 'Múltiplos EBITDA por Sector',
      methodologyParagraph: 'La valoración se ha realizado utilizando el método de múltiplos EBITDA, ampliamente aceptado en el mercado para la valoración de empresas. Este método compara la empresa con otras similares en el mismo sector y rango de empleados.',
      appliedCalculation: 'Cálculo aplicado:',
      consideredFactors: 'Factores considerados:',
      companySize: 'Tamaño de la empresa:',
      yearsOfOperation: 'Años de operación:',
      geographicLocation: 'Ubicación geográfica:',
      valuationRange: 'Rango de valoración:',
      minimum: 'Mínimo:',
      centralValuation: 'Valoración central:',
      maximum: 'Máximo:',
      qualitativeAnalysis: 'ANÁLISIS CUALITATIVO',
      competitiveAdvantage: 'Ventaja Competitiva',
      shareOwnership: 'Participación societaria:',
      profitability: 'Rentabilidad:',
      ebitdaMargin: 'Margen EBITDA:',
      legalDisclaimerAndLimitations: 'AVISO LEGAL Y LIMITACIONES',
      realEstateDisclaimer: '*Esta valoración NO incluye el valor de los inmuebles en balance. Si la empresa posee bienes inmuebles, su valor debería añadirse de forma independiente.',
      disclaimerPurposeTitle: 'Propósito del informe:',
      disclaimerPurposeText: 'Esta valoración es una estimación basada en múltiplos EBITDA por sector y no constituye asesoramiento financiero, fiscal o legal profesional.',
      disclaimerLimitationsTitle: 'Limitaciones:',
      disclaimerLimitationsText: 'Los resultados se basan en la información proporcionada por el cliente y múltiplos de mercado generales. Para valoraciones precisas se recomienda un análisis detallado por parte de expertos.',
      disclaimerValidityTitle: 'Validez:',
      disclaimerValidityText: 'Esta estimación es válida en la fecha de emisión y está sujeta a cambios en las condiciones del mercado y la empresa.',
      disclaimerUseTitle: 'Uso recomendado:',
      disclaimerUseText: 'Esta valoración debe usarse únicamente como referencia inicial. Para transacciones reales, se recomienda realizar una due diligence completa y valoración profesional detallada.',
    },
    ca: {
      reportDateLabel: "Data de l'informe",
      reportTitle: 'INFORME DE VALORACIÓ EMPRESARIAL',
      executiveSummary: 'RESUMEN EXECUTIU',
      estimatedValuation: 'Valoració estimada:',
      range: 'Rang:',
      ebitdaMultipleApplied: "Múltiple d'EBITDA aplicat:",
      sector: 'Sector:',
      companyInfo: "INFORMACIÓ DE L'EMPRESA",
      generalData: 'Dades generals',
      legalName: 'Raó Social:',
      cif: 'NIF:',
      location: 'Ubicació:',
      yearsOperating: "Anys operant:",
      yearsSuffix: 'anys',
      employeesCount: "Núm. d’empleats:",
      contact: 'Contacte',
      contactPerson: 'Persona de contacte:',
      email: 'Email:',
      phone: 'Telèfon:',
      financialData: 'DADES FINANCERES',
      annualRevenue: 'Ingressos anuals:',
      ebitda: 'EBITDA:',
      netProfitMargin: 'Marge de benefici net:',
      growthRate: 'Taxa de creixement:',
      valuationMethodology: 'METODOLOGIA DE VALORACIÓ',
      ebitdaMultiplesBySector: "Múltiples d'EBITDA per sector",
      methodologyParagraph: "La valoració s'ha realitzat utilitzant el mètode de múltiples d'EBITDA, àmpliament acceptat al mercat. Aquest mètode compara l'empresa amb d'altres similars en el mateix sector i rang d'empleats.",
      appliedCalculation: 'Càlcul aplicat:',
      consideredFactors: 'Factors considerats:',
      companySize: "Mida de l'empresa:",
      yearsOfOperation: "Anys d'operació:",
      geographicLocation: 'Ubicació geogràfica:',
      valuationRange: 'Rang de valoració:',
      minimum: 'Mínim:',
      centralValuation: 'Valoració central:',
      maximum: 'Màxim:',
      qualitativeAnalysis: 'ANÀLISI QUALITATIVA',
      competitiveAdvantage: 'Avantatge competitiu',
      shareOwnership: 'Participació societària:',
      profitability: 'Rendibilitat:',
      ebitdaMargin: "Marge d'EBITDA:",
      legalDisclaimerAndLimitations: 'AVÍS LEGAL I LIMITACIONS',
      realEstateDisclaimer: "*Aquesta valoració NO inclou el valor dels immobles en balanç. Si l'empresa posseeix béns immobles, el seu valor s'hauria d'afegir de forma independent.",
      disclaimerPurposeTitle: "Propòsit de l'informe:",
      disclaimerPurposeText: "Aquesta valoració és una estimació basada en múltiples d'EBITDA per sector i no constitueix assessorament professional.",
      disclaimerLimitationsTitle: 'Limitacions:',
      disclaimerLimitationsText: "Els resultats es basen en la informació facilitada pel client i múltiples de mercat generals. Per a valoracions precises es recomana un anàlisi detallat.",
      disclaimerValidityTitle: 'Validesa:',
      disclaimerValidityText: "Aquesta estimació és vàlida en la data d'emissió i subjecta a canvis.",
      disclaimerUseTitle: 'Ús recomanat:',
      disclaimerUseText: "Aquesta valoració s'ha d'utilitzar només com a referència inicial. Per a transaccions reals, es recomana due diligence completa.",
    },
    val: {
      reportDateLabel: "Data de l'informe",
      reportTitle: 'INFORME DE VALORACIÓ EMPRESARIAL',
      executiveSummary: 'RESUM EXECUTIU',
      estimatedValuation: 'Valoració estimada:',
      range: 'Rang:',
      ebitdaMultipleApplied: "Múltiple d’EBITDA aplicat:",
      sector: 'Sector:',
      companyInfo: "INFORMACIÓ DE L’EMPRESA",
      generalData: 'Dades generals',
      legalName: 'Raó Social:',
      cif: 'NIF:',
      location: 'Ubicació:',
      yearsOperating: "Anys operant:",
      yearsSuffix: 'anys',
      employeesCount: "Núm. d’empleats:",
      contact: 'Contacte',
      contactPerson: 'Persona de contacte:',
      email: 'Email:',
      phone: 'Telèfon:',
      financialData: 'DADES FINANCERES',
      annualRevenue: 'Ingressos anuals:',
      ebitda: 'EBITDA:',
      netProfitMargin: 'Marge de benefici net:',
      growthRate: 'Taxa de creixement:',
      valuationMethodology: 'METODOLOGIA DE VALORACIÓ',
      ebitdaMultiplesBySector: "Múltiples d’EBITDA per sector",
      methodologyParagraph: "La valoració s’ha realitzat utilitzant el mètode de múltiples d’EBITDA, àmpliament acceptat al mercat. Este mètode compara l’empresa amb altres similars en el mateix sector i rang d’empleats.",
      appliedCalculation: 'Càlcul aplicat:',
      consideredFactors: 'Factors considerats:',
      companySize: "Mida de l’empresa:",
      yearsOfOperation: "Anys d’operació:",
      geographicLocation: 'Ubicació geogràfica:',
      valuationRange: 'Rang de valoració:',
      minimum: 'Mínim:',
      centralValuation: 'Valoració central:',
      maximum: 'Màxim:',
      qualitativeAnalysis: 'ANÀLISI QUALITATIVA',
      competitiveAdvantage: 'Avantatge competitiu',
      shareOwnership: 'Participació societària:',
      profitability: 'Rendibilitat:',
      ebitdaMargin: "Marge d’EBITDA:",
      legalDisclaimerAndLimitations: 'AVÍS LEGAL I LIMITACIONS',
      disclaimerPurposeTitle: "Propòsit de l’informe:",
      disclaimerPurposeText: "Esta valoració és una estimació basada en múltiples d’EBITDA per sector i no constituïx assessorament professional.",
      disclaimerLimitationsTitle: 'Limitacions:',
      disclaimerLimitationsText: "Els resultats es basen en la informació facilitada pel client i múltiples de mercat generals. Per a valoracions precises es recomana un anàlisi detallat.",
      disclaimerValidityTitle: 'Validesa:',
      disclaimerValidityText: "Esta estimació és vàlida en la data d’emissió i subjecta a canvis.",
      disclaimerUseTitle: 'Ús recomanat:',
      disclaimerUseText: "Esta valoració s’ha d’utilitzar només com a referència inicial. Per a transaccions reals, es recomana due diligence completa.",
    },
    gl: {
      reportDateLabel: 'Data do informe',
      reportTitle: 'INFORME DE VALORACIÓN EMPRESARIAL',
      executiveSummary: 'RESUMO EXECUTIVO',
      estimatedValuation: 'Valoración estimada:',
      range: 'Rango:',
      ebitdaMultipleApplied: 'Múltiplo EBITDA aplicado:',
      sector: 'Sector:',
      companyInfo: 'INFORMACIÓN DA EMPRESA',
      generalData: 'Datos xerais',
      legalName: 'Razón Social:',
      cif: 'NIF:',
      location: 'Localización:',
      yearsOperating: 'Anos operando:',
      yearsSuffix: 'anos',
      employeesCount: 'Nº de empregados:',
      contact: 'Contacto',
      contactPerson: 'Persoa de contacto:',
      email: 'Email:',
      phone: 'Teléfono:',
      financialData: 'DATOS FINANCEIROS',
      annualRevenue: 'Ingresos anuais:',
      ebitda: 'EBITDA:',
      netProfitMargin: 'Marxe de beneficio neto:',
      growthRate: 'Taxa de crecemento:',
      valuationMethodology: 'METODOLOXÍA DE VALORACIÓN',
      ebitdaMultiplesBySector: 'Múltiplos EBITDA por sector',
      methodologyParagraph: 'A valoración realizouse empregando o método de múltiplos EBITDA, amplamente aceptado no mercado. Este método compara a empresa con outras similares no mesmo sector e rango de empregados.',
      appliedCalculation: 'Cálculo aplicado:',
      consideredFactors: 'Factores considerados:',
      companySize: 'Tamaño da empresa:',
      yearsOfOperation: 'Anos de operación:',
      geographicLocation: 'Localización xeográfica:',
      valuationRange: 'Rango de valoración:',
      minimum: 'Mínimo:',
      centralValuation: 'Valoración central:',
      maximum: 'Máximo:',
      qualitativeAnalysis: 'ANÁLISE CUALITATIVA',
      competitiveAdvantage: 'Vantaxe competitiva',
      shareOwnership: 'Participación societaria:',
      profitability: 'Rentabilidade:',
      ebitdaMargin: 'Marxe EBITDA:',
      legalDisclaimerAndLimitations: 'AVISO LEGAL E LIMITACIÓNS',
      realEstateDisclaimer: '*Esta valoración NON inclúe o valor dos inmobles en balance. Se a empresa posúe bens inmobles, o seu valor debería engadirse de forma independente.',
      disclaimerPurposeTitle: 'Propósito do informe:',
      disclaimerPurposeText: 'Esta valoración é unha estimación baseada en múltiplos EBITDA por sector e non constitúe asesoramento profesional.',
      disclaimerLimitationsTitle: 'Limitacións:',
      disclaimerLimitationsText: 'Os resultados baséanse na información proporcionada polo cliente e múltiplos de mercado xerais. Para valoracións precisas recoméndase unha análise detallada.',
      disclaimerValidityTitle: 'Validez:',
      disclaimerValidityText: 'Esta estimación é válida na data de emisión e pode cambiar coas condicións do mercado e da empresa.',
      disclaimerUseTitle: 'Uso recomendado:',
      disclaimerUseText: 'Esta valoración debe empregarse só como referencia inicial. Para transaccións reais, recoméndase unha due diligence completa.',
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

  const getEmployeeRangeLabel = (range: string) => {
    const ranges: Record<string, Record<string, string>> = {
      es: { '1-10': '1-10 empleados', '11-50': '11-50 empleados', '51-200': '51-200 empleados', '201-500': '201-500 empleados', '500+': 'Más de 500 empleados' },
      ca: { '1-10': '1-10 empleats', '11-50': '11-50 empleats', '51-200': '51-200 empleats', '201-500': '201-500 empleats', '500+': 'Més de 500 empleats' },
      val:{ '1-10': '1-10 empleats', '11-50': '11-50 empleats', '51-200': '51-200 empleats', '201-500': '201-500 empleats', '500+': 'Més de 500 empleats' },
      gl: { '1-10': '1-10 empregados', '11-50': '11-50 empregados', '51-200': '51-200 empregados', '201-500': '201-500 empregados', '500+': 'Máis de 500 empregados' },
    };
    return (ranges[lang] && ranges[lang][range]) || range;
  };

  const getOwnershipLabel = (participation: string) => {
    const labels: Record<string, Record<string, string>> = {
      es: { alta: 'Alta (>75%)', media: 'Media (25-75%)', baja: 'Baja (<25%)' },
      ca: { alta: 'Alta (>75%)', media: 'Mitjana (25-75%)', baja: 'Baixa (<25%)' },
      val:{ alta: 'Alta (>75%)', media: 'Mitjana (25-75%)', baja: 'Baixa (<25%)' },
      gl: { alta: 'Alta (>75%)', media: 'Media (25-75%)', baja: 'Baixa (<25%)' },
    };
    return (labels[lang] && labels[lang][participation]) || participation;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>CAPITTAL</Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>{T.reportDateLabel}</Text>
            <Text style={styles.dateValue}>{getCurrentDate()}</Text>
          </View>
        </View>

        {/* Título principal */}
        <View style={styles.title}>
          <Text style={styles.mainTitle}>{T.reportTitle}</Text>
          <Text style={styles.companyTitle}>{companyData.companyName}</Text>
        </View>

        {/* Resumen ejecutivo */}
        <View style={styles.executiveSummary}>
          <Text style={styles.sectionTitle}>{T.executiveSummary}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>{T.estimatedValuation}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(result.finalValuation)}</Text>
              <Text style={styles.summarySubtext}>
                {T.range} {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
              </Text>
            </View>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>{T.ebitdaMultipleApplied}</Text>
              <Text style={styles.summaryValue}>{result.multiples.ebitdaMultipleUsed}x</Text>
              <Text style={styles.summarySubtext}>
                {T.sector} {companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de la empresa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.companyInfo}</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataColumn}>
              <Text style={styles.subsectionTitle}>{T.generalData}</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.legalName}</Text>
                  <Text style={styles.tableValueCell}>{companyData.companyName}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.cif}</Text>
                  <Text style={styles.tableValueCell}>{companyData.cif}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.sector}</Text>
                  <Text style={styles.tableValueCell}>{companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.location}</Text>
                  <Text style={styles.tableValueCell}>{companyData.location}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.yearsOperating}</Text>
                  <Text style={styles.tableValueCell}>{companyData.yearsOfOperation} {T.yearsSuffix}</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>{T.employeesCount}</Text>
                  <Text style={styles.tableValueCell}>{getEmployeeRangeLabel(companyData.employeeRange)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.dataColumn}>
              <Text style={styles.subsectionTitle}>{T.contact}</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.contactPerson}</Text>
                  <Text style={styles.tableValueCell}>{companyData.contactName}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.email}</Text>
                  <Text style={styles.tableValueCell}>{companyData.email}</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>{T.phone}</Text>
                  <Text style={styles.tableValueCell}>{companyData.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Datos financieros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.financialData}</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataColumn}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.annualRevenue}</Text>
                  <Text style={styles.tableValueBold}>{formatCurrency(companyData.revenue)}</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>{T.ebitda}</Text>
                  <Text style={styles.tableValueBold}>{formatCurrency(companyData.ebitda)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.dataColumn}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>{T.netProfitMargin}</Text>
                  <Text style={styles.tableValueBold}>{companyData.netProfitMargin}%</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>{T.growthRate}</Text>
                  <Text style={styles.tableValueBold}>{companyData.growthRate}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Metodología de valoración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.valuationMethodology}</Text>
          <View style={styles.methodologyBox}>
            <Text style={styles.subsectionTitle}>{T.ebitdaMultiplesBySector}</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, marginBottom: 10 }}>
              {T.methodologyParagraph}
            </Text>
            
            <View style={styles.calculationBox}>
              <Text style={styles.calculationLabel}>{T.appliedCalculation}</Text>
              <Text style={styles.calculationValue}>
                {formatCurrency(companyData.ebitda)} × {result.multiples.ebitdaMultipleUsed} = {formatCurrency(result.finalValuation)}
              </Text>
            </View>
          </View>

          <View style={styles.factorsGrid}>
            <View style={styles.factorBox}>
              <Text style={styles.factorTitle}>{T.consideredFactors}</Text>
              <Text style={styles.factorList}>
                • {T.sector} {companyData.industry}{'\n'}
                • {T.companySize} {getEmployeeRangeLabel(companyData.employeeRange)}{'\n'}
                • {T.yearsOfOperation} {companyData.yearsOfOperation} {T.yearsSuffix}{'\n'}
                • {T.geographicLocation} {companyData.location}
              </Text>
            </View>
            <View style={styles.factorBox}>
              <Text style={styles.factorTitle}>{T.valuationRange}</Text>
              <Text style={styles.factorList}>
                {T.minimum} {formatCurrency(result.valuationRange.min)} (-20%){'\n'}
                {T.centralValuation} {formatCurrency(result.finalValuation)}{'\n'}
                {T.maximum} {formatCurrency(result.valuationRange.max)} (+20%)
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer Inmuebles - Destacado */}
        <View style={{
          backgroundColor: '#fef2f2',
          borderWidth: 2,
          borderColor: '#ef4444',
          padding: 12,
          marginBottom: 15,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>*</Text>
          <Text style={{ fontSize: 10, color: '#991b1b', fontWeight: 700, lineHeight: 1.4 }}>
            {T.realEstateDisclaimer}
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>{T.legalDisclaimerAndLimitations}</Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>{T.disclaimerPurposeTitle}</Text> {T.disclaimerPurposeText}
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>{T.disclaimerLimitationsTitle}</Text> {T.disclaimerLimitationsText}
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>{T.disclaimerValidityTitle}</Text> {T.disclaimerValidityText}
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>{T.disclaimerUseTitle}</Text> {T.disclaimerUseText}
          </Text>
        </View>

        {/* Footer eliminado a petición del cliente */}
      </Page>
    </Document>
  );
};

export default ValuationPDFDocument;
