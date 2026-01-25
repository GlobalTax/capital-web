import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Direct mapping for known sectors (no AI needed)
const DIRECT_MAPPING: Record<string, string> = {
  // company_operations sectors
  'Industrial y Manufacturero': 'manufacturing',
  'Industrial': 'manufacturing',
  'Manufacturero': 'manufacturing',
  'Construcción': 'construction_engineering',
  'Construcción e Ingeniería': 'construction_engineering',
  'Ingeniería': 'construction_engineering',
  'Salud y Biotecnología': 'healthcare',
  'Salud': 'healthcare',
  'Healthcare': 'healthcare',
  'Biotecnología': 'healthcare',
  'Seguridad': 'business_services',
  'Alimentación y Bebidas': 'agriculture_food',
  'Alimentación': 'agriculture_food',
  'F&B': 'agriculture_food',
  'Agroindustria': 'agriculture_food',
  'Turismo y Hostelería': 'hospitality_leisure',
  'Hostelería': 'hospitality_leisure',
  'Restauración': 'hospitality_leisure',
  'Energías Renovables': 'energy_utilities',
  'Energía y Renovables': 'energy_utilities',
  'Energía': 'energy_utilities',
  'Consultoría SAP': 'technology_software',
  'Consultoría TIC': 'technology_software',
  'SaaS': 'technology_software',
  'SaaS Vertical': 'technology_software',
  'Tecnología': 'technology_software',
  'Technology': 'technology_software',
  'IT Services': 'technology_software',
  'Software': 'technology_software',
  'Telecomunicaciones': 'technology_software',
  'Logística y Transporte': 'distribution_logistics',
  'Logística': 'distribution_logistics',
  'Transporte': 'transportation',
  'Frío Industrial': 'industrial_services',
  'Facility Services': 'business_services',
  'Servicios': 'business_services',
  'Business Services': 'business_services',
  'Consultoría': 'business_services',
  'PRL': 'business_services',
  'Gestión de Residuos': 'environmental_services',
  'Medioambiente': 'environmental_services',
  'Distribución Alimentaria': 'distribution_logistics',
  'Distribución Industrial': 'distribution_logistics',
  'Distribución Sanitaria': 'distribution_logistics',
  'Distribución': 'distribution_logistics',
  'Medical Devices': 'healthcare',
  'Pharma Services': 'healthcare',
  'Educación': 'education_training',
  'Formación': 'education_training',
  'Real Estate': 'real_estate_services',
  'Inmobiliario': 'real_estate_services',
  'Marketing': 'media_marketing',
  'Medios': 'media_marketing',
  'Finanzas': 'financial_services',
  'Financial Services': 'financial_services',
};

// Fund sector mapping (handles abbreviated/mixed terms)
const FUND_SECTOR_MAPPING: Record<string, string> = {
  ...DIRECT_MAPPING,
  'mantenimiento': 'industrial_services',
  'construcción': 'construction_engineering',
  'salud': 'healthcare',
  'TMT': 'technology_software',
  'Tech': 'technology_software',
  'Consumer': 'consumer_products',
  'Retail': 'consumer_products',
  'Industrial': 'manufacturing',
  'Services': 'business_services',
};

interface MigrationResult {
  companiesProcessed: number;
  companiesMigrated: number;
  companiesSkipped: number;
  companiesErrors: number;
  fundsProcessed: number;
  fundsMigrated: number;
  fundsSkipped: number;
  fundsErrors: number;
  details: {
    companies: Array<{
      id: string;
      name: string;
      originalSector: string | null;
      newSectorPe: string | null;
      method: 'direct' | 'ai' | 'skipped' | 'error';
      confidence?: number;
      error?: string;
    }>;
    funds: Array<{
      id: string;
      name: string;
      originalSectors: string[];
      newSectorsPe: string[];
      method: 'direct' | 'skipped' | 'error';
      error?: string;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = 'preview', batchSize = 20 } = await req.json().catch(() => ({}));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result: MigrationResult = {
      companiesProcessed: 0,
      companiesMigrated: 0,
      companiesSkipped: 0,
      companiesErrors: 0,
      fundsProcessed: 0,
      fundsMigrated: 0,
      fundsSkipped: 0,
      fundsErrors: 0,
      details: {
        companies: [],
        funds: [],
      },
    };

    // ============ MIGRATE COMPANIES ============
    const { data: companies, error: companiesError } = await supabase
      .from('company_operations')
      .select('id, company_name, sector, subsector, sector_pe')
      .order('created_at', { ascending: false });

    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }

    console.log(`Found ${companies?.length || 0} companies to process`);

    for (const company of companies || []) {
      result.companiesProcessed++;

      // Skip if already migrated
      if (company.sector_pe) {
        result.companiesSkipped++;
        result.details.companies.push({
          id: company.id,
          name: company.company_name,
          originalSector: company.sector,
          newSectorPe: company.sector_pe,
          method: 'skipped',
        });
        continue;
      }

      // Try direct mapping first
      const sectorToMap = company.sector || company.subsector || '';
      let mappedSector = DIRECT_MAPPING[sectorToMap];

      // Try partial matching if no direct match
      if (!mappedSector && sectorToMap) {
        for (const [key, value] of Object.entries(DIRECT_MAPPING)) {
          if (sectorToMap.toLowerCase().includes(key.toLowerCase()) ||
              key.toLowerCase().includes(sectorToMap.toLowerCase())) {
            mappedSector = value;
            break;
          }
        }
      }

      if (mappedSector) {
        // Direct mapping found
        if (mode === 'execute') {
          const { error: updateError } = await supabase
            .from('company_operations')
            .update({ sector_pe: mappedSector })
            .eq('id', company.id);

          if (updateError) {
            result.companiesErrors++;
            result.details.companies.push({
              id: company.id,
              name: company.company_name,
              originalSector: company.sector,
              newSectorPe: null,
              method: 'error',
              error: updateError.message,
            });
            continue;
          }
        }

        result.companiesMigrated++;
        result.details.companies.push({
          id: company.id,
          name: company.company_name,
          originalSector: company.sector,
          newSectorPe: mappedSector,
          method: 'direct',
          confidence: 1.0,
        });
      } else {
        // Use AI classification for unknown sectors
        try {
          const classifyResponse = await fetch(`${supabaseUrl}/functions/v1/classify-sector-pe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              company_name: company.company_name,
              existing_sector: company.sector,
              additional_info: company.subsector,
            }),
          });

          if (!classifyResponse.ok) {
            throw new Error(`Classification failed: ${classifyResponse.status}`);
          }

          const classification = await classifyResponse.json();

          if (mode === 'execute' && classification.sector_pe) {
            const { error: updateError } = await supabase
              .from('company_operations')
              .update({ sector_pe: classification.sector_pe })
              .eq('id', company.id);

            if (updateError) {
              result.companiesErrors++;
              result.details.companies.push({
                id: company.id,
                name: company.company_name,
                originalSector: company.sector,
                newSectorPe: null,
                method: 'error',
                error: updateError.message,
              });
              continue;
            }
          }

          result.companiesMigrated++;
          result.details.companies.push({
            id: company.id,
            name: company.company_name,
            originalSector: company.sector,
            newSectorPe: classification.sector_pe,
            method: 'ai',
            confidence: classification.confidence,
          });
        } catch (aiError) {
          result.companiesErrors++;
          result.details.companies.push({
            id: company.id,
            name: company.company_name,
            originalSector: company.sector,
            newSectorPe: null,
            method: 'error',
            error: aiError instanceof Error ? aiError.message : 'AI classification failed',
          });
        }
      }
    }

    // ============ MIGRATE FUNDS ============
    const { data: funds, error: fundsError } = await supabase
      .from('sf_funds')
      .select('id, fund_name, sector_focus, sector_exclusions, sector_focus_pe, sector_exclusions_pe')
      .order('created_at', { ascending: false });

    if (fundsError) {
      throw new Error(`Failed to fetch funds: ${fundsError.message}`);
    }

    console.log(`Found ${funds?.length || 0} funds to process`);

    for (const fund of funds || []) {
      result.fundsProcessed++;

      // Skip if already migrated
      if (fund.sector_focus_pe && fund.sector_focus_pe.length > 0) {
        result.fundsSkipped++;
        result.details.funds.push({
          id: fund.id,
          name: fund.fund_name,
          originalSectors: fund.sector_focus || [],
          newSectorsPe: fund.sector_focus_pe || [],
          method: 'skipped',
        });
        continue;
      }

      const originalSectors = fund.sector_focus || [];
      const mappedSectors: string[] = [];
      const mappedExclusions: string[] = [];

      // Map sector_focus
      for (const sector of originalSectors) {
        let mapped = FUND_SECTOR_MAPPING[sector];
        
        // Try partial matching
        if (!mapped) {
          for (const [key, value] of Object.entries(FUND_SECTOR_MAPPING)) {
            if (sector.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(sector.toLowerCase())) {
              mapped = value;
              break;
            }
          }
        }

        if (mapped && !mappedSectors.includes(mapped)) {
          mappedSectors.push(mapped);
        }
      }

      // Map sector_exclusions
      for (const exclusion of fund.sector_exclusions || []) {
        let mapped = FUND_SECTOR_MAPPING[exclusion];
        
        if (!mapped) {
          for (const [key, value] of Object.entries(FUND_SECTOR_MAPPING)) {
            if (exclusion.toLowerCase().includes(key.toLowerCase())) {
              mapped = value;
              break;
            }
          }
        }

        if (mapped && !mappedExclusions.includes(mapped)) {
          mappedExclusions.push(mapped);
        }
      }

      if (mode === 'execute') {
        const { error: updateError } = await supabase
          .from('sf_funds')
          .update({
            sector_focus_pe: mappedSectors,
            sector_exclusions_pe: mappedExclusions,
          })
          .eq('id', fund.id);

        if (updateError) {
          result.fundsErrors++;
          result.details.funds.push({
            id: fund.id,
            name: fund.fund_name,
            originalSectors,
            newSectorsPe: [],
            method: 'error',
            error: updateError.message,
          });
          continue;
        }
      }

      result.fundsMigrated++;
      result.details.funds.push({
        id: fund.id,
        name: fund.fund_name,
        originalSectors,
        newSectorsPe: mappedSectors,
        method: 'direct',
      });
    }

    // ============ MIGRATE CR PORTFOLIO ============
    const { data: crPortfolio, error: crPortfolioError } = await supabase
      .from('cr_portfolio')
      .select('id, company_name, sector, sector_pe, description')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (crPortfolioError) {
      console.error('Failed to fetch CR portfolio:', crPortfolioError.message);
    }

    let crPortfolioProcessed = 0;
    let crPortfolioMigrated = 0;
    let crPortfolioSkipped = 0;
    let crPortfolioErrors = 0;
    const crPortfolioDetails: Array<{
      id: string;
      name: string;
      originalSector: string | null;
      newSectorPe: string | null;
      method: 'direct' | 'ai' | 'skipped' | 'error';
      confidence?: number;
      error?: string;
    }> = [];

    console.log(`Found ${crPortfolio?.length || 0} CR portfolio companies to process`);

    for (const company of crPortfolio || []) {
      crPortfolioProcessed++;

      // Skip if already migrated
      if (company.sector_pe) {
        crPortfolioSkipped++;
        crPortfolioDetails.push({
          id: company.id,
          name: company.company_name,
          originalSector: company.sector,
          newSectorPe: company.sector_pe,
          method: 'skipped',
        });
        continue;
      }

      // Try direct mapping first
      const sectorToMap = company.sector || '';
      let mappedSector = DIRECT_MAPPING[sectorToMap];

      // Try partial matching if no direct match (case insensitive)
      if (!mappedSector && sectorToMap) {
        const normalizedSector = sectorToMap.toLowerCase().trim();
        
        // Check against lowercase mapping keys
        for (const [key, value] of Object.entries(FUND_SECTOR_MAPPING)) {
          if (normalizedSector === key.toLowerCase() ||
              normalizedSector.includes(key.toLowerCase()) ||
              key.toLowerCase().includes(normalizedSector)) {
            mappedSector = value;
            break;
          }
        }
      }

      if (mappedSector) {
        // Direct mapping found
        if (mode === 'execute') {
          const { error: updateError } = await supabase
            .from('cr_portfolio')
            .update({ sector_pe: mappedSector })
            .eq('id', company.id);

          if (updateError) {
            crPortfolioErrors++;
            crPortfolioDetails.push({
              id: company.id,
              name: company.company_name,
              originalSector: company.sector,
              newSectorPe: null,
              method: 'error',
              error: updateError.message,
            });
            continue;
          }
        }

        crPortfolioMigrated++;
        crPortfolioDetails.push({
          id: company.id,
          name: company.company_name,
          originalSector: company.sector,
          newSectorPe: mappedSector,
          method: 'direct',
          confidence: 1.0,
        });
      } else if (sectorToMap) {
        // Use AI classification for unknown sectors
        try {
          const classifyResponse = await fetch(`${supabaseUrl}/functions/v1/classify-sector-pe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              company_name: company.company_name,
              existing_sector: company.sector,
              additional_info: company.description,
            }),
          });

          if (!classifyResponse.ok) {
            throw new Error(`Classification failed: ${classifyResponse.status}`);
          }

          const classification = await classifyResponse.json();

          if (mode === 'execute' && classification.sector_pe) {
            const { error: updateError } = await supabase
              .from('cr_portfolio')
              .update({ sector_pe: classification.sector_pe })
              .eq('id', company.id);

            if (updateError) {
              crPortfolioErrors++;
              crPortfolioDetails.push({
                id: company.id,
                name: company.company_name,
                originalSector: company.sector,
                newSectorPe: null,
                method: 'error',
                error: updateError.message,
              });
              continue;
            }
          }

          crPortfolioMigrated++;
          crPortfolioDetails.push({
            id: company.id,
            name: company.company_name,
            originalSector: company.sector,
            newSectorPe: classification.sector_pe,
            method: 'ai',
            confidence: classification.confidence,
          });
        } catch (aiError) {
          crPortfolioErrors++;
          crPortfolioDetails.push({
            id: company.id,
            name: company.company_name,
            originalSector: company.sector,
            newSectorPe: null,
            method: 'error',
            error: aiError instanceof Error ? aiError.message : 'AI classification failed',
          });
        }
      } else {
        // No sector to map
        crPortfolioSkipped++;
        crPortfolioDetails.push({
          id: company.id,
          name: company.company_name,
          originalSector: null,
          newSectorPe: null,
          method: 'skipped',
        });
      }
    }

    // Calculate sector distribution (combine companies + CR portfolio)
    const sectorDistribution: Record<string, number> = {};
    for (const company of result.details.companies) {
      if (company.newSectorPe) {
        sectorDistribution[company.newSectorPe] = (sectorDistribution[company.newSectorPe] || 0) + 1;
      }
    }
    for (const company of crPortfolioDetails) {
      if (company.newSectorPe) {
        sectorDistribution[company.newSectorPe] = (sectorDistribution[company.newSectorPe] || 0) + 1;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        result: {
          ...result,
          crPortfolioProcessed,
          crPortfolioMigrated,
          crPortfolioSkipped,
          crPortfolioErrors,
          details: {
            ...result.details,
            crPortfolio: crPortfolioDetails,
          },
        },
        sectorDistribution,
        summary: {
          companies: `${result.companiesMigrated}/${result.companiesProcessed} migrated (${result.companiesSkipped} skipped, ${result.companiesErrors} errors)`,
          funds: `${result.fundsMigrated}/${result.fundsProcessed} migrated (${result.fundsSkipped} skipped, ${result.fundsErrors} errors)`,
          crPortfolio: `${crPortfolioMigrated}/${crPortfolioProcessed} migrated (${crPortfolioSkipped} skipped, ${crPortfolioErrors} errors)`,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
