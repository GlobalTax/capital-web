/**
 * Client-side matching of PDF filenames to campaign companies
 * using token-based Jaccard similarity.
 */

const LEGAL_FORMS = ['sl', 'sa', 'slp', 'slu', 'sll', 'scoop', 'sc', 'cb', 'scp', 'sal'];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): Set<string> {
  const words = normalize(text).split(' ');
  return new Set(words.filter(w => w.length > 0 && !LEGAL_FORMS.includes(w)));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function extractCompanyName(filename: string): string {
  return filename
    .replace(/^\d+_/, '')       // remove numeric prefix "027_"
    .replace(/\.pdf$/i, '')     // remove .pdf extension
    .replace(/_/g, ' ')         // underscores to spaces
    .trim();
}

export interface MatchResult {
  companyId: string | null;
  confidence: number;
  status: 'assigned' | 'unassigned';
}

export interface CompanyCandidate {
  id: string;
  company_name: string;
}

export function findBestMatch(
  extractedName: string,
  companies: CompanyCandidate[]
): MatchResult {
  if (companies.length === 0) {
    return { companyId: null, confidence: 0, status: 'unassigned' };
  }

  const fileTokens = tokenize(extractedName);
  if (fileTokens.size === 0) {
    return { companyId: null, confidence: 0, status: 'unassigned' };
  }

  let bestScore = 0;
  let bestId: string | null = null;

  for (const company of companies) {
    const companyTokens = tokenize(company.company_name);
    const score = jaccardSimilarity(fileTokens, companyTokens);
    if (score > bestScore) {
      bestScore = score;
      bestId = company.id;
    }
  }

  return {
    companyId: bestScore > 0.5 ? bestId : null,
    confidence: Math.round(bestScore * 100) / 100,
    status: bestScore > 0.5 ? 'assigned' : 'unassigned',
  };
}
