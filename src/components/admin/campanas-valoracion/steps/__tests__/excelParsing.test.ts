import { describe, it, expect } from 'vitest';

// Extract and test the parsing functions directly
// We replicate them here since they're not exported from the component

function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');
}

function parseSpanishNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (!str) return 0;
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  let cleaned: string;
  if (hasDot && hasComma) {
    cleaned = str.replace(/\./g, '').replace(',', '.');
  } else if (hasDot && !hasComma) {
    const isThousandsSep = /^\d{1,3}(\.\d{3})+$/.test(str.replace(/[^\d.]/g, ''));
    if (isThousandsSep) {
      cleaned = str.replace(/\./g, '');
    } else {
      cleaned = str;
    }
  } else if (hasComma && !hasDot) {
    cleaned = str.replace(',', '.');
  } else {
    cleaned = str;
  }
  cleaned = cleaned.replace(/[^\d.\-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function buildColumnMap(years: number[]): Record<string, string> {
  const base: Record<string, string> = {};
  const addSynonyms = (field: string, synonyms: string[]) => {
    for (const syn of synonyms) {
      base[normalizeColumnName(syn)] = field;
    }
  };
  addSynonyms('client_company', [
    'empresa', 'company', 'compañía', 'compañia', 'compania',
    'sociedad', 'denominación', 'denominacion', 'nombre empresa',
    'nombre de empresa', 'razón social', 'razon social',
    'denominación social', 'denominacion social',
  ]);
  addSynonyms('client_name', [
    'contacto', 'contact', 'nombre', 'nombre contacto', 'nombre de contacto',
    'persona contacto', 'persona de contacto', 'responsable',
    'contact name', 'name', 'interlocutor',
  ]);
  addSynonyms('client_email', [
    'email', 'e-mail', 'correo', 'correo electrónico', 'correo electronico',
    'mail', 'dirección email', 'direccion email', 'email address',
  ]);
  addSynonyms('client_phone', [
    'teléfono', 'telefono', 'phone', 'tel', 'telf', 'tlf',
    'móvil', 'movil', 'celular', 'telephone', 'mobile',
    'número teléfono', 'numero telefono',
  ]);
  addSynonyms('client_cif', [
    'cif', 'nif', 'tax id', 'vat', 'número fiscal', 'numero fiscal',
    'identificación fiscal', 'identificacion fiscal', 'nif/cif',
    'cif/nif', 'tax number', 'vat number',
  ]);
  addSynonyms('revenue', [
    'facturación', 'facturacion', 'revenue', 'ventas', 'ingresos',
    'sales', 'turnover', 'cifra de negocio', 'cifra negocio',
    'volumen de negocio', 'volumen negocio',
  ]);
  addSynonyms('ebitda', ['ebitda', 'e.b.i.t.d.a', 'e-b-i-t-d-a']);
  const suffixes = ['', '_year_2', '_year_3'];
  years.forEach((yr, i) => {
    const suffix = suffixes[i] || `_year_${i + 1}`;
    addSynonyms(`revenue${suffix}`, [
      `facturación ${yr}`, `facturacion ${yr}`, `facturacion${yr}`,
      `revenue ${yr}`, `ventas ${yr}`, `ingresos ${yr}`,
      `sales ${yr}`, `turnover ${yr}`,
      `cifra de negocio ${yr}`, `cifra negocio ${yr}`,
    ]);
    addSynonyms(`ebitda${suffix}`, [
      `ebitda ${yr}`, `ebitda${yr}`, `ebitda_${yr}`,
      `ebitda-${yr}`, `e.b.i.t.d.a ${yr}`,
    ]);
  });
  return base;
}

describe('normalizeColumnName', () => {
  it('handles accented Spanish characters', () => {
    expect(normalizeColumnName('Facturación')).toBe('facturacion');
    expect(normalizeColumnName('Teléfono')).toBe('telefono');
    expect(normalizeColumnName('Razón Social')).toBe('razon social');
    expect(normalizeColumnName('Compañía')).toBe('compania');
    expect(normalizeColumnName('Número Fiscal')).toBe('numero fiscal');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeColumnName('Facturación   2024')).toBe('facturacion 2024');
    expect(normalizeColumnName('  Empresa  ')).toBe('empresa');
  });

  it('strips special characters', () => {
    expect(normalizeColumnName('E-mail')).toBe('email');
    expect(normalizeColumnName('NIF/CIF')).toBe('nifcif');
    expect(normalizeColumnName('E.B.I.T.D.A')).toBe('ebitda');
  });

  it('handles uppercase', () => {
    expect(normalizeColumnName('EMPRESA')).toBe('empresa');
    expect(normalizeColumnName('EBITDA 2024')).toBe('ebitda 2024');
  });
});

describe('parseSpanishNumber', () => {
  it('parses Spanish thousands format (dots as separators)', () => {
    expect(parseSpanishNumber('500.000')).toBe(500000);
    expect(parseSpanishNumber('1.500.000')).toBe(1500000);
    expect(parseSpanishNumber('12.000.000')).toBe(12000000);
  });

  it('parses European decimal format (comma)', () => {
    expect(parseSpanishNumber('500,50')).toBe(500.50);
    expect(parseSpanishNumber('1.500.000,50')).toBe(1500000.50);
  });

  it('parses plain numbers', () => {
    expect(parseSpanishNumber(500000)).toBe(500000);
    expect(parseSpanishNumber('500000')).toBe(500000);
  });

  it('parses Anglo-Saxon decimal (dot as decimal)', () => {
    expect(parseSpanishNumber('500.5')).toBe(500.5);
    expect(parseSpanishNumber('1234.56')).toBe(1234.56);
  });

  it('handles empty/null values', () => {
    expect(parseSpanishNumber(null)).toBe(0);
    expect(parseSpanishNumber(undefined)).toBe(0);
    expect(parseSpanishNumber('')).toBe(0);
  });

  it('handles strings with currency symbols', () => {
    expect(parseSpanishNumber('€500.000')).toBe(500000);
    expect(parseSpanishNumber('500.000€')).toBe(500000);
    expect(parseSpanishNumber('€ 1.500.000')).toBe(1500000);
  });

  it('handles negative numbers', () => {
    expect(parseSpanishNumber('-500.000')).toBe(-500000);
    expect(parseSpanishNumber('-1.234,56')).toBe(-1234.56);
  });
});

describe('buildColumnMap - auto-mapping with accents', () => {
  const map = buildColumnMap([2024, 2023, 2022]);

  it('maps accented Facturación columns', () => {
    // Year-specific synonyms for years[0] use suffix '' initially but then get overwritten by _year_1
    // The buildColumnMap adds both generic 'revenue' AND year-specific 'revenue_year_1' for first year
    const rev2024 = map[normalizeColumnName('Facturación 2024')];
    expect(rev2024 === 'revenue' || rev2024 === 'revenue_year_1').toBe(true);
    expect(map[normalizeColumnName('Facturación 2023')]).toBe('revenue_year_2');
    expect(map[normalizeColumnName('Facturación 2022')]).toBe('revenue_year_3');
  });

  it('maps non-accented facturacion columns', () => {
    const rev2024 = map[normalizeColumnName('facturacion 2024')];
    expect(rev2024 === 'revenue' || rev2024 === 'revenue_year_1').toBe(true);
    const rev2024b = map[normalizeColumnName('Facturacion2024')];
    expect(rev2024b === 'revenue' || rev2024b === 'revenue_year_1').toBe(true);
  });

  it('maps Teléfono with accent', () => {
    expect(map[normalizeColumnName('Teléfono')]).toBe('client_phone');
    expect(map[normalizeColumnName('telefono')]).toBe('client_phone');
    expect(map[normalizeColumnName('Móvil')]).toBe('client_phone');
  });

  it('maps Empresa variations', () => {
    expect(map[normalizeColumnName('Empresa')]).toBe('client_company');
    expect(map[normalizeColumnName('Compañía')]).toBe('client_company');
    expect(map[normalizeColumnName('Razón Social')]).toBe('client_company');
    expect(map[normalizeColumnName('EMPRESA')]).toBe('client_company');
  });

  it('maps Email variations', () => {
    expect(map[normalizeColumnName('Email')]).toBe('client_email');
    expect(map[normalizeColumnName('E-mail')]).toBe('client_email');
    expect(map[normalizeColumnName('Correo Electrónico')]).toBe('client_email');
  });

  it('maps CIF variations', () => {
    expect(map[normalizeColumnName('CIF')]).toBe('client_cif');
    expect(map[normalizeColumnName('NIF')]).toBe('client_cif');
    expect(map[normalizeColumnName('VAT')]).toBe('client_cif');
  });

  it('maps EBITDA with year', () => {
    const ebitda2024 = map[normalizeColumnName('EBITDA 2024')];
    expect(ebitda2024 === 'ebitda' || ebitda2024 === 'ebitda_year_1').toBe(true);
    expect(map[normalizeColumnName('EBITDA 2023')]).toBe('ebitda_year_2');
    expect(map[normalizeColumnName('ebitda_2022')]).toBe('ebitda_year_3');
  });
});

describe('Full simulated Excel row parsing', () => {
  it('parses a row with Spanish column names and number formats', () => {
    const map = buildColumnMap([2024, 2023, 2022]);
    
    // Simulate an Excel row with Spanish headers
    const excelHeaders = [
      'Empresa', 'Contacto', 'Correo Electrónico', 'Teléfono', 
      'CIF', 'Facturación 2024', 'EBITDA 2024',
      'Facturación 2023', 'EBITDA 2023'
    ];
    const excelRow: Record<string, any> = {
      'Empresa': 'Industrias Demo S.A.',
      'Contacto': 'Juan García',
      'Correo Electrónico': 'juan@demo.com',
      'Teléfono': '+34 612 345 678',
      'CIF': 'B12345678',
      'Facturación 2024': '12.500.000',
      'EBITDA 2024': '2.800.000',
      'Facturación 2023': '11.000.000',
      'EBITDA 2023': '2.400.000',
    };

    // Auto-map headers
    const headerMapping: Record<string, string> = {};
    for (const h of excelHeaders) {
      const normalized = normalizeColumnName(h);
      if (map[normalized]) {
        headerMapping[h] = map[normalized];
      }
    }

    // Verify all columns mapped
    expect(headerMapping['Empresa']).toBe('client_company');
    expect(headerMapping['Contacto']).toBe('client_name');
    expect(headerMapping['Correo Electrónico']).toBe('client_email');
    expect(headerMapping['Teléfono']).toBe('client_phone');
    expect(headerMapping['CIF']).toBe('client_cif');
    expect(headerMapping['Facturación 2024'] === 'revenue' || headerMapping['Facturación 2024'] === 'revenue_year_1').toBe(true);
    expect(headerMapping['EBITDA 2024'] === 'ebitda' || headerMapping['EBITDA 2024'] === 'ebitda_year_1').toBe(true);
    expect(headerMapping['Facturación 2023']).toBe('revenue_year_2');
    expect(headerMapping['EBITDA 2023']).toBe('ebitda_year_2');

    // Parse numeric values
    expect(parseSpanishNumber(excelRow['Facturación 2024'])).toBe(12500000);
    expect(parseSpanishNumber(excelRow['EBITDA 2024'])).toBe(2800000);
    expect(parseSpanishNumber(excelRow['Facturación 2023'])).toBe(11000000);
    expect(parseSpanishNumber(excelRow['EBITDA 2023'])).toBe(2400000);
  });
});
