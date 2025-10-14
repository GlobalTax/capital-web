import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RODDocument {
  id: string;
  title: string;
  version: string;
  file_type: string;
  file_size_bytes: number | null;
  description: string | null;
  is_active: boolean;
  is_latest: boolean;
  total_downloads: number;
  created_at: string;
  activated_at: string | null;
  deactivated_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeStats?: boolean;
  includeLeads?: boolean;
}

const formatBytes = (bytes: number | null) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const exportRODHistory = async (
  documents: RODDocument[],
  options: ExportOptions = { format: 'csv', includeStats: true, includeLeads: false }
) => {
  if (options.format === 'csv') {
    return exportToCSV(documents, options);
  } else if (options.format === 'excel') {
    // Excel export would require a library like xlsx
    console.warn('Excel export not yet implemented');
    return exportToCSV(documents, options);
  } else if (options.format === 'pdf') {
    // PDF export would require a library like jspdf
    console.warn('PDF export not yet implemented');
    return exportToCSV(documents, options);
  }
};

const exportToCSV = (documents: RODDocument[], options: ExportOptions) => {
  const lines: string[] = [];

  // Header: Summary
  lines.push('RESUMEN GENERAL');
  lines.push('');
  
  const totalVersions = documents.length;
  const activeDoc = documents.find(d => d.is_active);
  const totalDownloads = documents.reduce((sum, d) => sum + d.total_downloads, 0);
  const avgDownloads = totalVersions > 0 ? Math.round(totalDownloads / totalVersions) : 0;

  lines.push('Total Versiones,' + totalVersions);
  lines.push('Versión Activa,' + (activeDoc?.version || 'Ninguna'));
  lines.push('Descargas Totales,' + totalDownloads);
  lines.push('Promedio Descargas/Versión,' + avgDownloads);
  lines.push('');
  lines.push('');

  // Sheet: Versions Detail
  lines.push('DETALLE POR VERSIÓN');
  lines.push('');
  
  const headers = [
    'Versión',
    'Título',
    'Tipo',
    'Tamaño',
    'Estado',
    'Descargas',
    'Fecha Creación',
    'Fecha Activación',
    'Fecha Desactivación',
    'Días Activa',
    'Descripción'
  ];
  lines.push(headers.join(','));

  documents.forEach(doc => {
    const createdAt = new Date(doc.created_at);
    const activatedAt = doc.activated_at ? new Date(doc.activated_at) : null;
    const deactivatedAt = doc.deactivated_at ? new Date(doc.deactivated_at) : null;
    
    const daysActive = activatedAt && deactivatedAt
      ? Math.floor((deactivatedAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
      : activatedAt
      ? Math.floor((new Date().getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const status = doc.is_active ? 'ACTIVA' : doc.is_deleted ? 'ELIMINADA' : 'INACTIVA';

    const row = [
      doc.version,
      `"${doc.title}"`,
      doc.file_type.toUpperCase(),
      formatBytes(doc.file_size_bytes),
      status,
      doc.total_downloads,
      format(createdAt, 'dd/MM/yyyy', { locale: es }),
      activatedAt ? format(activatedAt, 'dd/MM/yyyy', { locale: es }) : '-',
      deactivatedAt ? format(deactivatedAt, 'dd/MM/yyyy', { locale: es }) : '-',
      daysActive,
      doc.description ? `"${doc.description.replace(/"/g, '""')}"` : '-'
    ];
    lines.push(row.join(','));
  });

  // Generate CSV blob and download
  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `historico_rod_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};
