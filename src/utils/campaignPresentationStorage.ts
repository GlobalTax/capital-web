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
