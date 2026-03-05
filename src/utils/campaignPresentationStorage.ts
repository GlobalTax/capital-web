export const CAMPAIGN_PRESENTATIONS_BUCKET = 'campaign-presentations';

const PDF_EXTENSION_REGEX = /\.pdf$/i;

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

  const decode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  if (safePath.startsWith('http://') || safePath.startsWith('https://')) {
    try {
      const url = new URL(safePath);
      const pathname = decode(url.pathname);
      const match = pathname.match(new RegExp(`/storage/v1/object/(?:sign|public)/${CAMPAIGN_PRESENTATIONS_BUCKET}/(.+)$`));
      if (match?.[1]) {
        return match[1].replace(/^\/+/, '');
      }
    } catch {
      // Fallback to non-URL parsing below
    }
  }

  const bucketPrefix = `${CAMPAIGN_PRESENTATIONS_BUCKET}/`;
  if (safePath.startsWith(bucketPrefix)) {
    return decode(safePath.slice(bucketPrefix.length)).replace(/^\/+/, '');
  }

  const genericMatch = decode(safePath).match(new RegExp(`${CAMPAIGN_PRESENTATIONS_BUCKET}/(.+)$`));
  if (genericMatch?.[1]) {
    return genericMatch[1].replace(/^\/+/, '');
  }

  return decode(safePath).replace(/^\/+/, '');
};
