// Matriz de múltiplos por EBITDA (en millones €) según sector
// Fuente: tabla proporcionada por el usuario

export type EbitdaMetric = 'EV/EBITDA' | 'EV/Ingresos';

export interface SectorEbitdaRow {
  ebitdaM: number; // EBITDA en millones de euros
  low: number;     // múltiplo banda baja
  high: number;    // múltiplo banda alta
}

type SectorKey =
  | 'Alimentación & Distribución'
  | 'Logística & Transporte (3PL)'
  | 'Seguridad / PCI (servicios)'
  | 'IT Services / MSP'
  | 'Salud (servicios)'
  | 'Industriales / Servicios técnicos'
  | 'Energía / Servicios energéticos'
  | 'Telecom fijo / FTTH';

export const EBITDA_MATRIX: Record<SectorKey, SectorEbitdaRow[]> = {
  'Alimentación & Distribución': [
    { ebitdaM: 0.2, low: 4.5, high: 6.5 },
    { ebitdaM: 0.4, low: 5.2, high: 7.2 },
    { ebitdaM: 0.6, low: 5.6, high: 7.6 },
    { ebitdaM: 0.8, low: 5.8, high: 7.8 },
    { ebitdaM: 1.0, low: 6.0, high: 8.0 },
    { ebitdaM: 1.2, low: 6.1, high: 8.1 },
    { ebitdaM: 1.4, low: 6.2, high: 8.2 },
    { ebitdaM: 1.6, low: 6.3, high: 8.3 },
    { ebitdaM: 1.8, low: 6.4, high: 8.4 },
    { ebitdaM: 2.0, low: 6.5, high: 8.5 },
  ],
  'Logística & Transporte (3PL)': [
    { ebitdaM: 0.2, low: 4.5, high: 7.5 },
    { ebitdaM: 0.4, low: 5.2, high: 8.2 },
    { ebitdaM: 0.6, low: 5.6, high: 8.6 },
    { ebitdaM: 0.8, low: 5.8, high: 8.8 },
    { ebitdaM: 1.0, low: 6.0, high: 9.0 },
    { ebitdaM: 1.2, low: 6.1, high: 9.1 },
    { ebitdaM: 1.4, low: 6.2, high: 9.2 },
    { ebitdaM: 1.6, low: 6.3, high: 9.3 },
    { ebitdaM: 1.8, low: 6.4, high: 9.4 },
    { ebitdaM: 2.0, low: 6.5, high: 9.5 },
  ],
  'Seguridad / PCI (servicios)': [
    { ebitdaM: 0.2, low: 6.0, high: 9.5 },
    { ebitdaM: 0.4, low: 6.7, high: 10.2 },
    { ebitdaM: 0.6, low: 7.1, high: 10.6 },
    { ebitdaM: 0.8, low: 7.3, high: 10.8 },
    { ebitdaM: 1.0, low: 7.5, high: 11.0 },
    { ebitdaM: 1.2, low: 7.6, high: 11.1 },
    { ebitdaM: 1.4, low: 7.7, high: 11.2 },
    { ebitdaM: 1.6, low: 7.8, high: 11.3 },
    { ebitdaM: 1.8, low: 7.9, high: 11.4 },
    { ebitdaM: 2.0, low: 8.0, high: 11.5 },
  ],
  'IT Services / MSP': [
    { ebitdaM: 0.2, low: 4.5, high: 10.0 },
    { ebitdaM: 0.4, low: 5.2, high: 10.7 },
    { ebitdaM: 0.6, low: 5.6, high: 11.1 },
    { ebitdaM: 0.8, low: 5.8, high: 11.3 },
    { ebitdaM: 1.0, low: 6.0, high: 11.5 },
    { ebitdaM: 1.2, low: 6.1, high: 11.6 },
    { ebitdaM: 1.4, low: 6.2, high: 11.7 },
    { ebitdaM: 1.6, low: 6.3, high: 11.8 },
    { ebitdaM: 1.8, low: 6.4, high: 11.9 },
    { ebitdaM: 2.0, low: 6.5, high: 12.0 },
  ],
  'Salud (servicios)': [
    { ebitdaM: 0.2, low: 6.0, high: 9.0 },
    { ebitdaM: 0.4, low: 6.7, high: 9.7 },
    { ebitdaM: 0.6, low: 7.1, high: 10.1 },
    { ebitdaM: 0.8, low: 7.3, high: 10.3 },
    { ebitdaM: 1.0, low: 7.5, high: 10.5 },
    { ebitdaM: 1.2, low: 7.6, high: 10.6 },
    { ebitdaM: 1.4, low: 7.7, high: 10.7 },
    { ebitdaM: 1.6, low: 7.8, high: 10.8 },
    { ebitdaM: 1.8, low: 7.9, high: 10.9 },
    { ebitdaM: 2.0, low: 8.0, high: 11.0 },
  ],
  'Industriales / Servicios técnicos': [
    { ebitdaM: 0.2, low: 3.0, high: 6.5 },
    { ebitdaM: 0.4, low: 3.7, high: 7.2 },
    { ebitdaM: 0.6, low: 4.1, high: 7.6 },
    { ebitdaM: 0.8, low: 4.3, high: 7.8 },
    { ebitdaM: 1.0, low: 4.5, high: 8.0 },
    { ebitdaM: 1.2, low: 4.6, high: 8.1 },
    { ebitdaM: 1.4, low: 4.7, high: 8.2 },
    { ebitdaM: 1.6, low: 4.8, high: 8.3 },
    { ebitdaM: 1.8, low: 4.9, high: 8.4 },
    { ebitdaM: 2.0, low: 5.0, high: 8.5 },
  ],
  'Energía / Servicios energéticos': [
    { ebitdaM: 0.2, low: 0.5, high: 4.0 },
    { ebitdaM: 0.4, low: 1.2, high: 4.7 },
    { ebitdaM: 0.6, low: 1.6, high: 5.1 },
    { ebitdaM: 0.8, low: 1.8, high: 5.3 },
    { ebitdaM: 1.0, low: 2.0, high: 5.5 },
    { ebitdaM: 1.2, low: 2.1, high: 5.6 },
    { ebitdaM: 1.4, low: 2.2, high: 5.7 },
    { ebitdaM: 1.6, low: 2.3, high: 5.8 },
    { ebitdaM: 1.8, low: 2.4, high: 5.9 },
    { ebitdaM: 2.0, low: 2.5, high: 6.0 },
  ],
  'Telecom fijo / FTTH': [
    { ebitdaM: 0.2, low: 5.0, high: 7.5 },
    { ebitdaM: 0.4, low: 5.7, high: 8.2 },
    { ebitdaM: 0.6, low: 6.1, high: 8.6 },
    { ebitdaM: 0.8, low: 6.3, high: 8.8 },
    { ebitdaM: 1.0, low: 6.5, high: 9.0 },
    { ebitdaM: 1.2, low: 6.6, high: 9.1 },
    { ebitdaM: 1.4, low: 6.7, high: 9.2 },
    { ebitdaM: 1.6, low: 6.8, high: 9.3 },
    { ebitdaM: 1.8, low: 6.9, high: 9.4 },
    { ebitdaM: 2.0, low: 7.0, high: 9.5 },
  ],
};

const SECTOR_ALIASES: Array<{ match: RegExp; key: SectorKey }> = [
  { match: /aliment/i, key: 'Alimentación & Distribución' },
  { match: /log[ií]st/i, key: 'Logística & Transporte (3PL)' },
  { match: /(seguridad|pci)/i, key: 'Seguridad / PCI (servicios)' },
  { match: /(it|msp|ti\b|servicios ti)/i, key: 'IT Services / MSP' },
  { match: /salud|cl[ií]nic|sanitari/i, key: 'Salud (servicios)' },
  { match: /industrial|t[eé]cnico/i, key: 'Industriales / Servicios técnicos' },
  { match: /energ/i, key: 'Energía / Servicios energéticos' },
  { match: /(ftth|telecom|fibra)/i, key: 'Telecom fijo / FTTH' },
];

function normalizeSector(sector: string): SectorKey | null {
  const direct = (Object.keys(EBITDA_MATRIX) as SectorKey[]).find(
    k => k.toLowerCase() === sector.toLowerCase()
  );
  if (direct) return direct;
  const alias = SECTOR_ALIASES.find(a => a.match.test(sector));
  return alias ? alias.key : null;
}

export function getSectorMultiplesByEbitda(
  sector: string,
  ebitdaEuro: number
): { low: number; high: number; metric: EbitdaMetric } | null {
  const key = normalizeSector(sector);
  if (!key) return null;
  const rows = EBITDA_MATRIX[key];
  if (!rows || rows.length === 0) return null;

  const ebitdaM = (ebitdaEuro || 0) / 1_000_000; // convertir a millones

  // clamp a rango disponible
  const minM = rows[0].ebitdaM;
  const maxM = rows[rows.length - 1].ebitdaM;
  const target = Math.min(Math.max(ebitdaM, minM), maxM);

  // elegir la fila más cercana (sin interpolación para simplicidad)
  let best = rows[0];
  let bestDiff = Math.abs(rows[0].ebitdaM - target);
  for (let i = 1; i < rows.length; i++) {
    const d = Math.abs(rows[i].ebitdaM - target);
    if (d < bestDiff) {
      best = rows[i];
      bestDiff = d;
    }
  }

  return { low: best.low, high: best.high, metric: 'EV/EBITDA' };
}
