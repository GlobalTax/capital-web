import { supabase } from '@/integrations/supabase/client';

export const CAMPAIGN_PRESENTATIONS_BUCKET = 'campaign-presentations';

const PDF_EXTENSION_REGEX = /\.pdf$/i;

const decodeSafely = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const decodeRecursively = (value: string, rounds = 3): string => {
  let decoded = value;
  for (let i = 0; i < rounds; i++) {
    const next = decodeSafely(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
};

const trimPdfBoundary = (value: string): string => {
  const lower = value.toLowerCase();
  const pdfIndex = lower.indexOf('.pdf');
  if (pdfIndex === -1) return value;
  return value.slice(0, pdfIndex + 4);
};

const extractFromJsonLike = (value: string): string => {
  const jsonStoragePathMatch = value.match(/"storage_path"\s*:\s*"([^"]+)"/i);
  if (jsonStoragePathMatch?.[1]) return jsonStoragePathMatch[1];

  const bucketPathMatch = value.match(new RegExp(`${CAMPAIGN_PRESENTATIONS_BUCKET}/([^"\\s,}]+)`, 'i'));
  if (bucketPathMatch?.[1]) return bucketPathMatch[1];

  return value;
};

export const sanitizePdfFileName = (fileName: string): string => {
  const rawBaseName = fileName.replace(PDF_EXTENSION_REGEX, '');

  const sanitizedBaseName = rawBaseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
    .slice(0, 120);

  return `${sanitizedBaseName || 'documento'}.pdf`;
};

export const buildCampaignPresentationPath = (campaignId: string, fileName: string): string => {
  return `${campaignId}/${sanitizePdfFileName(fileName)}`;
};

export const normalizeCampaignPresentationPath = (storagePath: string): string => {
  const safePath = (storagePath || '').trim();
  if (!safePath) return safePath;

  const decodedInput = decodeRecursively(safePath);
  const fromJsonLike = extractFromJsonLike(decodedInput);
  const decodedPath = decodeRecursively(fromJsonLike).replace(/^['"`]+|['"`]+$/g, '');

  if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
    try {
      const url = new URL(decodedPath);
      const pathOnly = decodeRecursively(url.pathname);
      const match = pathOnly.match(new RegExp(`/storage/v1/object/(?:sign|public)/${CAMPAIGN_PRESENTATIONS_BUCKET}/(.+)$`));
      if (match?.[1]) {
        return trimPdfBoundary(match[1]).replace(/^\/+/, '');
      }
    } catch {
      // fallback below
    }
  }

  const withoutQuery = decodedPath.split('?')[0].split('#')[0];
  const bucketPrefix = `${CAMPAIGN_PRESENTATIONS_BUCKET}/`;

  if (withoutQuery.startsWith(bucketPrefix)) {
    return trimPdfBoundary(withoutQuery.slice(bucketPrefix.length)).replace(/^\/+/, '');
  }

  const genericMatch = withoutQuery.match(new RegExp(`${CAMPAIGN_PRESENTATIONS_BUCKET}/(.+)$`, 'i'));
  if (genericMatch?.[1]) {
    return trimPdfBoundary(genericMatch[1]).replace(/^\/+/, '');
  }

  return trimPdfBoundary(withoutQuery).replace(/^\/+/, '');
};

export const isValidCampaignPresentationPath = (storagePath: string): boolean => {
  const normalized = normalizeCampaignPresentationPath(storagePath);
  return PDF_EXTENSION_REGEX.test(normalized);
};

/**
 * Ensures an active authenticated session exists before performing a storage upload.
 * If the session is missing or expired, attempts a refresh. Throws a descriptive error
 * if the user is not authenticated — preventing the SDK from silently falling back to
 * the anon key and hitting RLS violations.
 */
export const safeStorageUpload = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { upsert?: boolean; contentType?: string },
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  // 1. Check current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // 2. Try refreshing
    console.warn('[safeStorageUpload] No session found — attempting refresh…');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session) {
      console.error('[safeStorageUpload] Refresh failed', refreshError?.message);
      throw new Error('No hay sesión activa. Cierra sesión e inicia sesión de nuevo.');
    }
    console.log('[safeStorageUpload] Session refreshed OK');
  }

  // 3. Log auth state for diagnostics
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  console.log('[safeStorageUpload] Auth state', {
    hasSession: !!currentSession,
    role: currentSession?.user?.role,
    expiresAt: currentSession?.expires_at,
    bucket,
    path,
  });

  // 4. Perform the upload
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: options?.contentType,
    });

  if (error) {
    console.error('[safeStorageUpload] Upload error', { bucket, path, message: error.message });
  }

  return { data, error };
};
