import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';

export interface ReportData {
  leads: any[];
  valuations: any[];
  blogMetrics: any[];
  businessMetrics: any[];
  dateRange: { from: Date; to: Date };
}

export class ReportExporter {
  private dateRange: { from: Date; to: Date };

  constructor(dateRange: { from: Date; to: Date }) {
    this.dateRange = dateRange;
  }

  // Obtener datos reales basados en el rango de fechas
  async fetchReportData(): Promise<ReportData> {
    const { from, to } = this.dateRange;
    
    try {
      // Obtener leads del período
      const { data: leads } = await supabase
        .from('contact_leads')
        .select('*')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false });

      // Obtener valoraciones del período
      const { data: valuations } = await supabase
        .from('company_valuations')
        .select('*')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false });

      // Obtener métricas de blog del período
      const { data: blogMetrics } = await supabase
        .from('blog_post_metrics')
        .select(`
          *,
          blog_posts!inner(title, category, author_name)
        `)
        .gte('last_viewed', from.toISOString())
        .lte('last_viewed', to.toISOString());

      // Obtener métricas de negocio del período
      const { data: businessMetrics } = await supabase
        .from('business_metrics')
        .select('*')
        .gte('period_start', from.toISOString().split('T')[0])
        .lte('period_end', to.toISOString().split('T')[0]);

      return {
        leads: leads || [],
        valuations: valuations || [],
        blogMetrics: blogMetrics || [],
        businessMetrics: businessMetrics || [],
        dateRange: this.dateRange
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw new Error('No se pudieron obtener los datos del reporte');
    }
  }

  // Exportar como PDF
  async exportToPDF(data: ReportData, reportType: string): Promise<Blob> {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text(`Reporte ${reportType}`, 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Período: ${data.dateRange.from.toLocaleDateString('es-ES')} - ${data.dateRange.to.toLocaleDateString('es-ES')}`, 20, yPosition);
    yPosition += 20;

    // Resumen ejecutivo
    pdf.setFontSize(16);
    pdf.text('Resumen Ejecutivo', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.text(`• Total de Leads: ${data.leads.length}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`• Total de Valoraciones: ${data.valuations.length}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`• Posts con métricas: ${data.blogMetrics.length}`, 20, yPosition);
    yPosition += 20;

    // Detalles por sección
    if (reportType === 'leads' || reportType === 'analytics') {
      pdf.setFontSize(14);
      pdf.text('Detalle de Leads', 20, yPosition);
      yPosition += 10;

      data.leads.slice(0, 10).forEach((lead, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(9);
        pdf.text(`${index + 1}. ${lead.full_name} - ${lead.company}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`   Email: ${lead.email} | Status: ${lead.status}`, 25, yPosition);
        yPosition += 8;
      });
    }

    if (reportType === 'content' || reportType === 'analytics') {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text('Rendimiento de Contenido', 20, yPosition);
      yPosition += 10;

      data.blogMetrics.slice(0, 8).forEach((metric, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(9);
        const title = (metric as any).blog_posts?.title || 'Sin título';
        pdf.text(`${index + 1}. ${title}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`   Vistas: ${metric.total_views} | Tiempo: ${metric.avg_reading_time}min`, 25, yPosition);
        yPosition += 8;
      });
    }

    return pdf.output('blob');
  }

  // Exportar como Excel
  async exportToExcel(data: ReportData, reportType: string): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Hoja de resumen
    const summaryData = [
      ['Reporte', reportType],
      ['Período Desde', data.dateRange.from.toLocaleDateString('es-ES')],
      ['Período Hasta', data.dateRange.to.toLocaleDateString('es-ES')],
      [''],
      ['Métricas Generales'],
      ['Total Leads', data.leads.length],
      ['Total Valoraciones', data.valuations.length],
      ['Posts con Métricas', data.blogMetrics.length],
      [''],
      ['Generado el', new Date().toLocaleString('es-ES')]
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Resumen');

    // Hoja de Leads
    if (data.leads.length > 0) {
      const leadsData = data.leads.map(lead => ({
        'Nombre': lead.full_name,
        'Email': lead.email,
        'Empresa': lead.company,
        'Teléfono': lead.phone || 'N/A',
        'Estado': lead.status,
        'País': lead.country || 'N/A',
        'Fecha Creación': new Date(lead.created_at).toLocaleDateString('es-ES'),
        'Email Enviado': lead.email_sent ? 'Sí' : 'No',
        'HubSpot Enviado': lead.hubspot_sent ? 'Sí' : 'No'
      }));

      const leadsWS = XLSX.utils.json_to_sheet(leadsData);
      XLSX.utils.book_append_sheet(workbook, leadsWS, 'Leads');
    }

    // Hoja de Valoraciones
    if (data.valuations.length > 0) {
      const valuationsData = data.valuations.map(val => ({
        'Empresa': val.company_name,
        'Contacto': val.contact_name,
        'Email': val.email,
        'Industria': val.industry,
        'Empleados': val.employee_range,
        'Ingresos': val.revenue || 'N/A',
        'EBITDA': val.ebitda || 'N/A',
        'Valoración Final': val.final_valuation || 'N/A',
        'Fecha': new Date(val.created_at).toLocaleDateString('es-ES'),
        'V4 Accedido': val.v4_accessed ? 'Sí' : 'No'
      }));

      const valuationsWS = XLSX.utils.json_to_sheet(valuationsData);
      XLSX.utils.book_append_sheet(workbook, valuationsWS, 'Valoraciones');
    }

    // Hoja de Métricas de Contenido
    if (data.blogMetrics.length > 0) {
      const contentData = data.blogMetrics.map(metric => ({
        'Título': (metric as any).blog_posts?.title || 'Sin título',
        'Autor': (metric as any).blog_posts?.author_name || 'N/A',
        'Categoría': (metric as any).blog_posts?.category || 'N/A',
        'Total Vistas': metric.total_views,
        'Vistas Únicas': metric.unique_views,
        'Tiempo Promedio (min)': metric.avg_reading_time,
        'Scroll Promedio (%)': metric.avg_scroll_percentage,
        'Última Vista': metric.last_viewed ? new Date(metric.last_viewed).toLocaleDateString('es-ES') : 'N/A'
      }));

      const contentWS = XLSX.utils.json_to_sheet(contentData);
      XLSX.utils.book_append_sheet(workbook, contentWS, 'Contenido');
    }

    // Generar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Exportar como CSV
  async exportToCSV(data: ReportData, reportType: string): Promise<Blob> {
    let csvContent = '';

    if (reportType === 'leads' || reportType === 'analytics') {
      csvContent += 'Leads Report\n';
      csvContent += 'Nombre,Email,Empresa,Teléfono,Estado,País,Fecha Creación\n';
      
      data.leads.forEach(lead => {
        csvContent += `"${lead.full_name}","${lead.email}","${lead.company}","${lead.phone || 'N/A'}","${lead.status}","${lead.country || 'N/A'}","${new Date(lead.created_at).toLocaleDateString('es-ES')}"\n`;
      });
    }

    if (reportType === 'content' || reportType === 'analytics') {
      if (csvContent) csvContent += '\n\n';
      csvContent += 'Content Performance Report\n';
      csvContent += 'Título,Total Vistas,Vistas Únicas,Tiempo Promedio,Scroll Promedio\n';
      
      data.blogMetrics.forEach(metric => {
        const title = (metric as any).blog_posts?.title || 'Sin título';
        csvContent += `"${title}","${metric.total_views}","${metric.unique_views}","${metric.avg_reading_time}","${metric.avg_scroll_percentage}"\n`;
      });
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // Generar screenshot del dashboard
  async generateDashboardScreenshot(elementId: string): Promise<Blob> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento del dashboard no encontrado');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
  }
}

// Función helper para descargar archivos
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}