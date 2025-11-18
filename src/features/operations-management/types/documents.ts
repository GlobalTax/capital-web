import { z } from 'zod';
import { FileText, File, FileCheck, Scale, FileSignature, Presentation, BarChart3, Mail, HelpCircle } from 'lucide-react';

/**
 * Document category enum matching database
 */
export enum DocumentCategory {
  NDA = 'nda',
  FINANCIAL_STATEMENTS = 'financial_statements',
  DUE_DILIGENCE = 'due_diligence',
  LEGAL = 'legal',
  CONTRACTS = 'contracts',
  PRESENTATIONS = 'presentations',
  REPORTS = 'reports',
  CORRESPONDENCE = 'correspondence',
  OTHER = 'other'
}

/**
 * Document status enum matching database
 */
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

/**
 * Access level enum matching database
 */
export enum AccessLevel {
  INTERNAL = 'internal',
  CLIENT = 'client',
  PUBLIC = 'public'
}

/**
 * Operation document interface
 */
export interface OperationDocument {
  id: string;
  operation_id: string;
  
  // File information
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  
  // Document metadata
  title: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  access_level: AccessLevel;
  
  // Versioning
  version: number;
  parent_document_id?: string;
  is_latest_version: boolean;
  
  // Tags
  tags: string[];
  
  // Audit
  uploaded_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  download_count: number;
  
  // Soft delete
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Document download audit interface
 */
export interface DocumentDownload {
  id: string;
  document_id: string;
  downloaded_by?: string;
  ip_address?: string;
  user_agent?: string;
  downloaded_at: string;
}

/**
 * Zod schema for creating documents
 */
export const createDocumentSchema = z.object({
  operation_id: z.string().uuid(),
  file_name: z.string().min(1, 'El nombre del archivo es requerido'),
  file_path: z.string().min(1, 'La ruta del archivo es requerida'),
  file_size: z.number().positive().max(52428800, 'El archivo no puede superar 50MB'),
  file_type: z.string().min(1, 'El tipo de archivo es requerido'),
  title: z.string().min(1, 'El título es requerido').max(255),
  description: z.string().max(1000).optional(),
  category: z.nativeEnum(DocumentCategory),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.DRAFT),
  access_level: z.nativeEnum(AccessLevel).default(AccessLevel.INTERNAL),
  tags: z.array(z.string()).default([]),
  version: z.number().positive().default(1),
  parent_document_id: z.string().uuid().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

/**
 * Zod schema for updating documents
 */
export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  access_level: z.nativeEnum(AccessLevel).optional(),
  tags: z.array(z.string()).optional(),
  reviewed_by: z.string().uuid().optional(),
  reviewed_at: z.string().optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

/**
 * Helper: Get category label
 */
export const getCategoryLabel = (category: DocumentCategory): string => {
  const labels: Record<DocumentCategory, string> = {
    [DocumentCategory.NDA]: 'NDA',
    [DocumentCategory.FINANCIAL_STATEMENTS]: 'Estados Financieros',
    [DocumentCategory.DUE_DILIGENCE]: 'Due Diligence',
    [DocumentCategory.LEGAL]: 'Legal',
    [DocumentCategory.CONTRACTS]: 'Contratos',
    [DocumentCategory.PRESENTATIONS]: 'Presentaciones',
    [DocumentCategory.REPORTS]: 'Informes',
    [DocumentCategory.CORRESPONDENCE]: 'Correspondencia',
    [DocumentCategory.OTHER]: 'Otros'
  };
  return labels[category];
};

/**
 * Helper: Get status label
 */
export const getStatusLabel = (status: DocumentStatus): string => {
  const labels: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: 'Borrador',
    [DocumentStatus.PENDING_REVIEW]: 'Pendiente Revisión',
    [DocumentStatus.APPROVED]: 'Aprobado',
    [DocumentStatus.REJECTED]: 'Rechazado',
    [DocumentStatus.ARCHIVED]: 'Archivado'
  };
  return labels[status];
};

/**
 * Helper: Get access level label
 */
export const getAccessLevelLabel = (level: AccessLevel): string => {
  const labels: Record<AccessLevel, string> = {
    [AccessLevel.INTERNAL]: 'Interno',
    [AccessLevel.CLIENT]: 'Cliente',
    [AccessLevel.PUBLIC]: 'Público'
  };
  return labels[level];
};

/**
 * Helper: Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Helper: Get file icon
 */
export const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('word') || fileType.includes('document')) return FileSignature;
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return BarChart3;
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return Presentation;
  if (fileType.includes('image')) return FileCheck;
  if (fileType.includes('text')) return Mail;
  return File;
};

/**
 * Helper: Get category icon
 */
export const getCategoryIcon = (category: DocumentCategory) => {
  const icons: Record<DocumentCategory, typeof FileText> = {
    [DocumentCategory.NDA]: FileSignature,
    [DocumentCategory.FINANCIAL_STATEMENTS]: BarChart3,
    [DocumentCategory.DUE_DILIGENCE]: FileCheck,
    [DocumentCategory.LEGAL]: Scale,
    [DocumentCategory.CONTRACTS]: FileSignature,
    [DocumentCategory.PRESENTATIONS]: Presentation,
    [DocumentCategory.REPORTS]: BarChart3,
    [DocumentCategory.CORRESPONDENCE]: Mail,
    [DocumentCategory.OTHER]: HelpCircle
  };
  return icons[category];
};

/**
 * Helper: Get status badge color
 */
export const getStatusBadgeColor = (status: DocumentStatus): string => {
  const colors: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: 'bg-muted text-muted-foreground',
    [DocumentStatus.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [DocumentStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [DocumentStatus.ARCHIVED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  };
  return colors[status];
};

/**
 * Helper: Check if file type is previewable
 */
export const isPreviewable = (fileType: string): boolean => {
  const previewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  return previewableTypes.includes(fileType);
};
