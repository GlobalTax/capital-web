import { z } from 'zod';

// ===== INTERFACES =====
export interface OperationNote {
  id: string;
  operation_id: string;
  user_id: string | null;
  note_text: string;
  note_html?: string;
  is_internal: boolean;
  parent_note_id: string | null;
  mentions: string[];
  attachments: string[];
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  
  // Datos relacionados (joins)
  author?: {
    full_name: string | null;
    email: string | null;
  };
  replies?: OperationNote[];
  mention_users?: {
    full_name: string | null;
    email: string | null;
  }[];
}

export interface NoteMention {
  id: string;
  note_id: string;
  mentioned_user_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  note?: OperationNote;
}

// ===== ZOD SCHEMAS =====
export const createNoteSchema = z.object({
  operation_id: z.string().uuid(),
  note_text: z.string().min(1, 'La nota no puede estar vacía').max(5000),
  note_html: z.string().optional(),
  is_internal: z.boolean().default(true),
  parent_note_id: z.string().uuid().nullable().optional(),
  mentions: z.array(z.string().uuid()).default([]),
  attachments: z.array(z.string().url()).default([]),
});

export const updateNoteSchema = z.object({
  note_text: z.string().min(1).max(5000).optional(),
  note_html: z.string().optional(),
  is_internal: z.boolean().optional(),
  mentions: z.array(z.string().uuid()).optional(),
  attachments: z.array(z.string().url()).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
