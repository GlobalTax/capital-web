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
 * Uploads a file to the campaign-presentations bucket via an Edge Function
 * that uses `service_role`, bypassing Storage RLS entirely.
 */
export const safeStorageUpload = async (
  _bucket: string,
  path: string,
  file: File | Blob,
  _options?: { upsert?: boolean; contentType?: string },
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  // 1. Check current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.warn('[safeStorageUpload] No session found — attempting refresh…');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session) {
      console.error('[safeStorageUpload] Refresh failed', refreshError?.message);
      throw new Error('No hay sesión activa. Cierra sesión e inicia sesión de nuevo.');
    }
    console.log('[safeStorageUpload] Session refreshed OK');
  }

  // 2. Upload via Edge Function (service_role bypass)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  const { data: fnData, error: fnError } = await supabase.functions.invoke(
    'upload-campaign-presentation',
    { body: formData },
  );

  if (fnError) {
    const isFetchError = fnError.name === 'FunctionsFetchError' || fnError.message?.includes('Failed to send');
    const friendlyMsg = isFetchError
      ? 'La función de subida no está disponible. Contacta al administrador o reintenta en unos minutos.'
      : fnError.message;
    console.error('[safeStorageUpload] Edge Function error', { name: fnError.name, message: fnError.message, path });
    return { data: null, error: new Error(friendlyMsg) };
  }

  if (fnData?.error) {
    console.error('[safeStorageUpload] Upload rejected', fnData.error);
    return { data: null, error: new Error(fnData.error) };
  }

  console.log('[safeStorageUpload] OK via Edge Function:', fnData?.path);
  return { data: { path: fnData?.path || path }, error: null };
};
