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
 * Uploads a file to campaign-presentations storage via the Edge Function
 * `upload-campaign-presentation`, which uses `service_role` to bypass
 * Storage RLS policies that don't cooperate with upsert operations.
 *
 * Falls back to direct storage upload only if the Edge Function call fails
 * for infrastructure reasons (e.g. function not deployed).
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

  // 2. Try uploading via Edge Function (service_role bypasses Storage RLS)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storagePath', path);

    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      'upload-campaign-presentation',
      { body: formData },
    );

    if (fnError) {
      console.warn('[safeStorageUpload] Edge Function error, falling back to direct upload', fnError.message);
    } else if (fnData?.error) {
      console.warn('[safeStorageUpload] Edge Function returned error, falling back', fnData.error);
    } else if (fnData?.path) {
      console.log('[safeStorageUpload] Upload via Edge Function OK:', fnData.path);
      return { data: { path: fnData.path }, error: null };
    }
  } catch (e) {
    console.warn('[safeStorageUpload] Edge Function unavailable, falling back to direct upload', e);
  }

  // 3. Fallback: direct storage upload
  console.log('[safeStorageUpload] Using direct storage upload fallback', { bucket, path });
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: options?.contentType,
    });

  if (error) {
    console.error('[safeStorageUpload] Upload error', { bucket, path, message: error.message });
  }

  if (fnData?.error) {
    console.error('[safeStorageUpload] Upload rejected', fnData.error);
    return { data: null, error: new Error(fnData.error) };
  }

  console.log('[safeStorageUpload] OK via Edge Function:', fnData?.path);
  return { data: { path: fnData?.path || path }, error: null };
};

/**
 * Creates a signed URL for a file in campaign-presentations via Edge Function (bypasses RLS).
 */
export const safeCreateSignedUrl = async (
  storagePath: string,
): Promise<{ signedUrl: string | null; error: Error | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) return { signedUrl: null, error: new Error('No hay sesión activa.') };
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke(
    'upload-campaign-presentation',
    { body: { action: 'sign', path: storagePath } },
  );

  if (fnError) {
    console.error('[safeCreateSignedUrl] error', fnError.message);
    return { signedUrl: null, error: new Error(fnError.message) };
  }
  if (fnData?.error) {
    return { signedUrl: null, error: new Error(fnData.error) };
  }

  return { signedUrl: fnData?.signedUrl ?? null, error: null };
};

/**
 * Deletes a file from campaign-presentations via Edge Function (bypasses RLS).
 */
export const safeStorageDelete = async (
  storagePath: string,
): Promise<{ error: Error | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) return { error: new Error('No hay sesión activa.') };
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke(
    'upload-campaign-presentation',
    { body: { action: 'delete', path: storagePath } },
  );

  if (fnError) {
    console.error('[safeStorageDelete] error', fnError.message);
    return { error: new Error(fnError.message) };
  }
  if (fnData?.error) {
    return { error: new Error(fnData.error) };
  }

  return { error: null };
};
