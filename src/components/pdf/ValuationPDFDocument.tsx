
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
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
    fontFamily: 'Roboto',
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
}

const ValuationPDFDocument: React.FC<ValuationPDFDocumentProps> = ({ companyData, result }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEmployeeRangeLabel = (range: string) => {
    const ranges: { [key: string]: string } = {
      '1-10': '1-10 empleados',
      '11-50': '11-50 empleados',
      '51-200': '51-200 empleados',
      '201-500': '201-500 empleados',
      '500+': 'Más de 500 empleados'
    };
    return ranges[range] || range;
  };

  const getOwnershipLabel = (participation: string) => {
    const labels: { [key: string]: string } = {
      'alta': 'Alta (>75%)',
      'media': 'Media (25-75%)',
      'baja': 'Baja (<25%)'
    };
    return labels[participation] || participation;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
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
            <Text style={styles.subtitle}>Consultoría en Valoración Empresarial</Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Fecha del informe</Text>
            <Text style={styles.dateValue}>{getCurrentDate()}</Text>
          </View>
        </View>

        {/* Título principal */}
        <View style={styles.title}>
          <Text style={styles.mainTitle}>INFORME DE VALORACIÓN EMPRESARIAL</Text>
          <Text style={styles.companyTitle}>{companyData.companyName}</Text>
        </View>

        {/* Resumen ejecutivo */}
        <View style={styles.executiveSummary}>
          <Text style={styles.sectionTitle}>RESUMEN EJECUTIVO</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Valoración estimada:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(result.finalValuation)}</Text>
              <Text style={styles.summarySubtext}>
                Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
              </Text>
            </View>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Múltiplo EBITDA aplicado:</Text>
              <Text style={styles.summaryValue}>{result.multiples.ebitdaMultipleUsed}x</Text>
              <Text style={styles.summarySubtext}>
                Sector: {companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de la empresa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DE LA EMPRESA</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataColumn}>
              <Text style={styles.subsectionTitle}>Datos Generales</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Razón Social:</Text>
                  <Text style={styles.tableValueCell}>{companyData.companyName}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>CIF:</Text>
                  <Text style={styles.tableValueCell}>{companyData.cif}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Sector:</Text>
                  <Text style={styles.tableValueCell}>{companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Ubicación:</Text>
                  <Text style={styles.tableValueCell}>{companyData.location}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Años operando:</Text>
                  <Text style={styles.tableValueCell}>{companyData.yearsOfOperation} años</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>Nº empleados:</Text>
                  <Text style={styles.tableValueCell}>{getEmployeeRangeLabel(companyData.employeeRange)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.dataColumn}>
              <Text style={styles.subsectionTitle}>Contacto</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Persona de contacto:</Text>
                  <Text style={styles.tableValueCell}>{companyData.contactName}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Email:</Text>
                  <Text style={styles.tableValueCell}>{companyData.email}</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>Teléfono:</Text>
                  <Text style={styles.tableValueCell}>{companyData.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Datos financieros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS FINANCIEROS</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataColumn}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Ingresos anuales:</Text>
                  <Text style={styles.tableValueBold}>{formatCurrency(companyData.revenue)}</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>EBITDA:</Text>
                  <Text style={styles.tableValueBold}>{formatCurrency(companyData.ebitda)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.dataColumn}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelCell}>Margen beneficio neto:</Text>
                  <Text style={styles.tableValueBold}>{companyData.netProfitMargin}%</Text>
                </View>
                <View style={styles.tableRowLast}>
                  <Text style={styles.tableLabelCell}>Tasa de crecimiento:</Text>
                  <Text style={styles.tableValueBold}>{companyData.growthRate}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Metodología de valoración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>METODOLOGÍA DE VALORACIÓN</Text>
          <View style={styles.methodologyBox}>
            <Text style={styles.subsectionTitle}>Múltiplos EBITDA por Sector</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, marginBottom: 10 }}>
              La valoración se ha realizado utilizando el método de múltiplos EBITDA, que es una metodología ampliamente 
              aceptada en el mercado para la valoración de empresas. Este método compara la empresa con otras similares 
              en el mismo sector y rango de empleados.
            </Text>
            
            <View style={styles.calculationBox}>
              <Text style={styles.calculationLabel}>Cálculo aplicado:</Text>
              <Text style={styles.calculationValue}>
                {formatCurrency(companyData.ebitda)} × {result.multiples.ebitdaMultipleUsed} = {formatCurrency(result.finalValuation)}
              </Text>
            </View>
          </View>

          <View style={styles.factorsGrid}>
            <View style={styles.factorBox}>
              <Text style={styles.factorTitle}>Factores considerados:</Text>
              <Text style={styles.factorList}>
                • Sector de actividad: {companyData.industry}{'\n'}
                • Tamaño de la empresa: {getEmployeeRangeLabel(companyData.employeeRange)}{'\n'}
                • Años de operación: {companyData.yearsOfOperation} años{'\n'}
                • Ubicación geográfica: {companyData.location}
              </Text>
            </View>
            <View style={styles.factorBox}>
              <Text style={styles.factorTitle}>Rango de valoración:</Text>
              <Text style={styles.factorList}>
                Mínimo: {formatCurrency(result.valuationRange.min)} (-20%){'\n'}
                Valoración central: {formatCurrency(result.finalValuation)}{'\n'}
                Máximo: {formatCurrency(result.valuationRange.max)} (+20%)
              </Text>
            </View>
          </View>
        </View>

        {/* Análisis cualitativo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ANÁLISIS CUALITATIVO</Text>
          <View style={styles.competitiveAdvantageBox}>
            <Text style={styles.subsectionTitle}>Ventaja Competitiva</Text>
            <Text style={styles.competitiveAdvantageText}>
              {companyData.competitiveAdvantage}
            </Text>
          </View>
          
          <View style={styles.factorsGrid}>
            <View style={styles.factorBox}>
              <Text style={styles.factorTitle}>Participación societaria:</Text>
              <Text style={styles.factorList}>
                {getOwnershipLabel(companyData.ownershipParticipation)}
              </Text>
            </View>
            <View style={styles.factorBox}>
              <Text style={styles.factorTitle}>Rentabilidad:</Text>
              <Text style={styles.factorList}>
                Margen EBITDA: {((companyData.ebitda / companyData.revenue) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>AVISO LEGAL Y LIMITACIONES</Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>Propósito del informe:</Text> Esta valoración es una estimación basada en múltiplos EBITDA por sector 
            y no constituye asesoramiento financiero, fiscal o legal profesional.
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>Limitaciones:</Text> Los resultados se basan en la información proporcionada por el cliente y múltiplos 
            de mercado generales. Para valoraciones precisas se recomienda un análisis detallado por parte de expertos.
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>Validez:</Text> Esta estimación es válida en la fecha de emisión y está sujeta a cambios en las 
            condiciones del mercado y la empresa.
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 700 }}>Uso recomendado:</Text> Esta valoración debe usarse únicamente como referencia inicial. Para 
            transacciones reales, se recomienda realizar una due diligence completa y valoración profesional detallada.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerGrid}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>CAPITTAL</Text>
              <Text style={styles.footerText}>Consultoría especializada{'\n'}en valoración empresarial</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Contacto</Text>
              <Text style={styles.footerText}>info@capittal.com{'\n'}+34 XXX XXX XXX</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Web</Text>
              <Text style={styles.footerText}>www.capittal.com</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ValuationPDFDocument;
