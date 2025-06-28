
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { SectorReportResult } from '@/types/sectorReports';

// Registrar fuentes (reutilizando las del ValuationPDFDocument)
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
  sectorTitle: {
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
    fontSize: 12,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 8,
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 15,
  },
  contentText: {
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  metadataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  metadataBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 12,
    flex: 0.48,
  },
  metadataTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 8,
    lineHeight: 1.3,
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

interface SectorReportPDFDocumentProps {
  report: SectorReportResult;
}

const SectorReportPDFDocument: React.FC<SectorReportPDFDocumentProps> = ({ report }) => {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      'market-analysis': 'Análisis de Mercado',
      'ma-trends': 'Tendencias M&A',
      'valuation-multiples': 'Múltiplos de Valoración',
      'due-diligence': 'Due Diligence Sectorial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatContent = (content: string, maxLength: number = 800) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>CAPITTAL</Text>
            <Text style={styles.subtitle}>Reportes Sectoriales Especializados</Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Fecha del reporte</Text>
            <Text style={styles.dateValue}>{getCurrentDate()}</Text>
          </View>
        </View>

        {/* Título principal */}
        <View style={styles.title}>
          <Text style={styles.mainTitle}>{getReportTypeLabel(report.reportType)}</Text>
          <Text style={styles.sectorTitle}>Sector: {report.sector}</Text>
        </View>

        {/* Resumen ejecutivo */}
        <View style={styles.executiveSummary}>
          <Text style={styles.sectionTitle}>RESUMEN EJECUTIVO</Text>
          <Text style={styles.contentText}>
            {formatContent(report.sections.executiveSummary)}
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Palabras:</Text>
              <Text style={styles.summaryValue}>{report.wordCount.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Profundidad:</Text>
              <Text style={styles.summaryValue}>{report.metadata.depth}</Text>
            </View>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Período:</Text>
              <Text style={styles.summaryValue}>{report.metadata.period}</Text>
            </View>
          </View>
        </View>

        {/* Análisis de mercado */}
        {report.sections.marketAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ANÁLISIS DE MERCADO</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>
                {formatContent(report.sections.marketAnalysis)}
              </Text>
            </View>
          </View>
        )}

        {/* Oportunidades */}
        {report.sections.opportunities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OPORTUNIDADES</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>
                {formatContent(report.sections.opportunities)}
              </Text>
            </View>
          </View>
        )}

        {/* Conclusiones */}
        {report.sections.conclusions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONCLUSIONES</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>
                {formatContent(report.sections.conclusions)}
              </Text>
            </View>
          </View>
        )}

        {/* Metadatos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL REPORTE</Text>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataBox}>
              <Text style={styles.metadataTitle}>Configuración:</Text>
              <Text style={styles.metadataText}>
                Tipo: {getReportTypeLabel(report.reportType)}{'\n'}
                Sector: {report.sector}{'\n'}
                Profundidad: {report.metadata.depth}{'\n'}
                Período: {report.metadata.period}
              </Text>
            </View>
            <View style={styles.metadataBox}>
              <Text style={styles.metadataTitle}>Datos incluidos:</Text>
              <Text style={styles.metadataText}>
                Múltiplos: {report.metadata.includeData.multiples ? 'Sí' : 'No'}{'\n'}
                Casos de estudio: {report.metadata.includeData.caseStudies ? 'Sí' : 'No'}{'\n'}
                Estadísticas: {report.metadata.includeData.statistics ? 'Sí' : 'No'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerGrid}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>CAPITTAL</Text>
              <Text style={styles.footerText}>Consultoría especializada{'\n'}en M&A y valoración empresarial</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Contacto</Text>
              <Text style={styles.footerText}>Carrer Ausias March, 36 Principal{'\n'}P.º de la Castellana, 11, B-A{'\n'}Chamberí, 28046 Madrid</Text>
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

export default SectorReportPDFDocument;
