// ============= BUYER CONTACTS TYPES =============
// Tipos para el módulo de Contactos Compra

export type BuyerContactStatus = 'nuevo' | 'contactado' | 'calificado' | 'descartado';

export interface BuyerContact {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  position: string | null;
  origin: 'campana_compras';
  campaign_name: string;
  import_batch_id: string | null;
  import_filename: string | null;
  imported_at: string | null;
  imported_by: string | null;
  internal_notes: string | null;
  status: BuyerContactStatus;
  created_at: string;
  updated_at: string;
}

export interface BuyerContactImport {
  id: string;
  filename: string;
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  duplicate_emails: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: ImportError[];
  imported_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ImportError {
  row: number;
  email?: string;
  reason: string;
}

export interface ExcelRow {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  [key: string]: string | undefined;
}

export interface ColumnMapping {
  excelColumn: string;
  systemField: keyof ExcelRow | null;
}

export interface ImportValidationResult {
  valid: ExcelRow[];
  duplicatesInExcel: ExcelRow[];
  duplicatesInDB: ExcelRow[];
  invalidEmails: ExcelRow[];
  missingRequired: ExcelRow[];
}
