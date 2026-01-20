// ============= USE BUYER CONTACT IMPORT HOOK =============
// Hook para importación de contactos desde Excel

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ExcelRow, 
  ImportValidationResult, 
  ImportError,
  BuyerContactImport 
} from '@/types/buyer-contacts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useBuyerContactImport = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [parsedRows, setParsedRows] = useState<ExcelRow[]>([]);
  const [importResult, setImportResult] = useState<BuyerContactImport | null>(null);

  // Parsear archivo Excel
  const parseExcelFile = async (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { 
            raw: false,
            defval: '' 
          });
          
          setParsedRows(jsonData);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar datos antes de importar
  const validateData = async (rows: ExcelRow[]): Promise<ImportValidationResult> => {
    setIsProcessing(true);
    
    try {
      const valid: ExcelRow[] = [];
      const duplicatesInExcel: ExcelRow[] = [];
      const duplicatesInDB: ExcelRow[] = [];
      const invalidEmails: ExcelRow[] = [];
      const missingRequired: ExcelRow[] = [];
      
      // Obtener emails existentes en la DB
      const emails = rows.map(r => r.email?.toLowerCase().trim()).filter(Boolean);
      const { data: existingContacts } = await supabase
        .from('buyer_contacts')
        .select('email')
        .in('email', emails);
      
      const existingEmails = new Set(existingContacts?.map(c => c.email.toLowerCase()) || []);
      const seenEmails = new Set<string>();
      
      for (const row of rows) {
        const email = row.email?.toLowerCase().trim();
        const firstName = row.first_name?.trim();
        
        // Validar campos requeridos
        if (!firstName || !email) {
          missingRequired.push(row);
          continue;
        }
        
        // Validar formato de email
        if (!isValidEmail(email)) {
          invalidEmails.push(row);
          continue;
        }
        
        // Verificar duplicados en el Excel
        if (seenEmails.has(email)) {
          duplicatesInExcel.push(row);
          continue;
        }
        seenEmails.add(email);
        
        // Verificar duplicados en la DB
        if (existingEmails.has(email)) {
          duplicatesInDB.push(row);
          continue;
        }
        
        valid.push(row);
      }
      
      const result: ImportValidationResult = {
        valid,
        duplicatesInExcel,
        duplicatesInDB,
        invalidEmails,
        missingRequired,
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  // Ejecutar importación
  const executeImport = async (
    rows: ExcelRow[], 
    filename: string
  ): Promise<BuyerContactImport> => {
    setIsProcessing(true);
    
    try {
      // Crear registro de importación
      const { data: importRecord, error: importError } = await supabase
        .from('buyer_contact_imports')
        .insert({
          filename,
          total_rows: rows.length,
          status: 'processing',
        })
        .select()
        .single();
      
      if (importError) throw importError;
      
      const batchId = importRecord.id;
      const errors: ImportError[] = [];
      let successCount = 0;
      let failCount = 0;
      
      // Insertar contactos en lotes de 50
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        const contacts = batch.map(row => ({
          first_name: row.first_name?.trim() || '',
          last_name: row.last_name?.trim() || null,
          email: row.email?.toLowerCase().trim() || '',
          phone: row.phone?.trim() || null,
          company: row.company?.trim() || null,
          position: row.position?.trim() || null,
          import_batch_id: batchId,
          import_filename: filename,
          imported_at: new Date().toISOString(),
        }));
        
        const { data, error } = await supabase
          .from('buyer_contacts')
          .insert(contacts)
          .select();
        
        if (error) {
          // Si hay error, procesar uno por uno para identificar cuáles fallan
          for (let j = 0; j < batch.length; j++) {
            const contact = contacts[j];
            const { error: singleError } = await supabase
              .from('buyer_contacts')
              .insert(contact);
            
            if (singleError) {
              errors.push({
                row: i + j + 1,
                email: contact.email,
                reason: singleError.message,
              });
              failCount++;
            } else {
              successCount++;
            }
          }
        } else {
          successCount += data?.length || 0;
        }
      }
      
      // Actualizar registro de importación
      const { data: finalRecord, error: updateError } = await supabase
        .from('buyer_contact_imports')
        .update({
          successful_imports: successCount,
          failed_imports: failCount,
          duplicate_emails: validationResult?.duplicatesInDB.length || 0,
          error_log: JSON.parse(JSON.stringify(errors)),
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', batchId)
        .select()
        .maybeSingle();
      
      if (updateError) throw updateError;
      
      const result = finalRecord as unknown as BuyerContactImport;
      setImportResult(result);
      
      queryClient.invalidateQueries({ queryKey: ['buyer-contacts'] });
      
      toast.success(`Importación completada: ${successCount} contactos creados`);
      
      return result;
    } catch (error) {
      console.error('Error during import:', error);
      toast.error('Error durante la importación');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Resetear estado
  const reset = () => {
    setValidationResult(null);
    setParsedRows([]);
    setImportResult(null);
  };

  return {
    parseExcelFile,
    validateData,
    executeImport,
    reset,
    isProcessing,
    validationResult,
    parsedRows,
    importResult,
  };
};
