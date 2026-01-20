import type { PresentationType, SlideLayout } from '../types/presentation.types';

// Slide type definitions per presentation type
export const PRESENTATION_SLIDE_TYPES: Record<PresentationType, SlideLayout[]> = {
  teaser_sell: ['disclaimer', 'hero', 'overview', 'bullets', 'market', 'financials', 'timeline', 'closing'],
  firm_deck: ['hero', 'bullets', 'stats', 'timeline', 'closing'],
  client_deck: ['title', 'hero', 'stats', 'comparison', 'bullets', 'closing'],
  one_pager: ['title', 'stats', 'closing'],
  mandate_deck: ['title', 'hero', 'stats', 'bullets', 'comparison', 'closing'],
  custom: ['title', 'hero', 'stats', 'bullets', 'comparison', 'timeline', 'team', 'financials', 'closing', 'disclaimer', 'overview', 'market', 'custom']
};

export interface SlideOutlineItem {
  slide_index: number;
  slide_type: SlideLayout;
  layout: 'A' | 'B' | 'C'; // A: Statement, B: Bullets, C: Two-column
  purpose: string;
}

export interface SlideOutlineInputs {
  company_name?: string;
  sector?: string;
  transaction_type?: string;
  key_highlights?: string[];
  financial_metrics?: {
    revenue?: number;
    ebitda?: number;
    growth_rate?: number;
  };
  target_audience?: string;
  confidentiality_level?: 'standard' | 'high' | 'maximum';
}

// Generate slide outline based on presentation type
export function generateSlideOutline(
  presentationType: PresentationType,
  inputs: SlideOutlineInputs
): SlideOutlineItem[] {
  const allowedTypes = PRESENTATION_SLIDE_TYPES[presentationType];
  
  switch (presentationType) {
    case 'teaser_sell':
      return generateTeaserSellOutline(inputs, allowedTypes);
    case 'firm_deck':
      return generateFirmDeckOutline(inputs, allowedTypes);
    case 'client_deck':
      return generateClientDeckOutline(inputs, allowedTypes);
    case 'one_pager':
      return generateOnePagerOutline(inputs, allowedTypes);
    case 'mandate_deck':
      return generateMandateDeckOutline(inputs, allowedTypes);
    default:
      return generateCustomOutline(inputs, allowedTypes);
  }
}

function generateTeaserSellOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  const companyRef = inputs.company_name || 'Target Company';
  const sectorRef = inputs.sector || 'sector';
  
  return [
    // Slide 1: Confidentiality & Disclaimer
    {
      slide_index: 0,
      slide_type: 'disclaimer',
      layout: 'A',
      purpose: 'Present confidentiality notice, legal disclaimer, and project code identifier'
    },
    // Slide 2: Investment Highlights
    {
      slide_index: 1,
      slide_type: 'hero',
      layout: 'B',
      purpose: `Present 3-5 key investment highlights for ${companyRef} opportunity`
    },
    // Slide 3: Company Overview
    {
      slide_index: 2,
      slide_type: 'overview',
      layout: 'B',
      purpose: `Provide factual overview of ${companyRef}: history, operations, and geographic presence`
    },
    // Slide 4: Business Model
    {
      slide_index: 3,
      slide_type: 'bullets',
      layout: 'B',
      purpose: `Describe ${companyRef} business model, revenue streams, and operational structure`
    },
    // Slide 5: Market & Positioning
    {
      slide_index: 4,
      slide_type: 'market',
      layout: 'C',
      purpose: `Present ${sectorRef} market context and ${companyRef} competitive positioning`
    },
    // Slide 6: Financial Snapshot
    {
      slide_index: 5,
      slide_type: 'financials',
      layout: 'C',
      purpose: 'Display financial summary: revenue, EBITDA, margins, and key ratios'
    },
    // Slide 7: Growth & Value Creation
    {
      slide_index: 6,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Outline growth levers and strategic value creation opportunities for acquirer'
    },
    // Slide 8: Transaction & Next Steps
    {
      slide_index: 7,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Present transaction timeline, process details, and advisor contact information'
    }
  ];
}

function generateFirmDeckOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  return [
    // Slide 1: Positioning Statement
    {
      slide_index: 0,
      slide_type: 'hero',
      layout: 'A',
      purpose: 'Present firm positioning statement and core identity with understated authority'
    },
    // Slide 2: What We Do & For Whom
    {
      slide_index: 1,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Define services offered and target client profiles with clarity'
    },
    // Slide 3: Our Approach
    {
      slide_index: 2,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Describe methodology, philosophy, and principles guiding the work'
    },
    // Slide 4: Experience & Credibility
    {
      slide_index: 3,
      slide_type: 'stats',
      layout: 'C',
      purpose: 'Display track record: transactions closed, aggregate value, years of experience'
    },
    // Slide 5: How We Work
    {
      slide_index: 4,
      slide_type: 'timeline',
      layout: 'B',
      purpose: 'Outline engagement process from initial contact to transaction close'
    },
    // Slide 6: Call to Action
    {
      slide_index: 5,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Provide clear next step and contact information without sales pressure'
    }
  ];
}

function generateClientDeckOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  const clientRef = inputs.company_name || 'client';
  
  return [
    {
      slide_index: 0,
      slide_type: 'title',
      layout: 'A',
      purpose: `Present strategic options review for ${clientRef}`
    },
    {
      slide_index: 1,
      slide_type: 'hero',
      layout: 'B',
      purpose: 'Executive summary with key findings and recommendation'
    },
    {
      slide_index: 2,
      slide_type: 'stats',
      layout: 'A',
      purpose: 'Current position metrics: revenue, growth rate, market share'
    },
    {
      slide_index: 3,
      slide_type: 'comparison',
      layout: 'C',
      purpose: 'Compare strategic options with pros/cons analysis'
    },
    {
      slide_index: 4,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Detail recommended approach with implementation steps'
    },
    {
      slide_index: 5,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Timeline for decision and next action items'
    }
  ];
}

function generateOnePagerOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  return [
    {
      slide_index: 0,
      slide_type: 'title',
      layout: 'A',
      purpose: 'Executive summary headline with key message'
    },
    {
      slide_index: 1,
      slide_type: 'stats',
      layout: 'A',
      purpose: 'Critical metrics at a glance for quick decision-making'
    },
    {
      slide_index: 2,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Conclusion with call to action and contact'
    }
  ];
}

function generateMandateDeckOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  return [
    {
      slide_index: 0,
      slide_type: 'title',
      layout: 'A',
      purpose: 'Introduce buy-side mandate with investment thesis'
    },
    {
      slide_index: 1,
      slide_type: 'hero',
      layout: 'B',
      purpose: 'Present acquisition criteria and target profile'
    },
    {
      slide_index: 2,
      slide_type: 'stats',
      layout: 'A',
      purpose: 'Define target parameters: revenue range, EBITDA, geography'
    },
    {
      slide_index: 3,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Detail sector focus, subsectors, and exclusions'
    },
    {
      slide_index: 4,
      slide_type: 'comparison',
      layout: 'C',
      purpose: 'Compare deal structures and preferred transaction types'
    },
    {
      slide_index: 5,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Next steps for target sourcing and contact information'
    }
  ];
}

function generateCustomOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  return [
    {
      slide_index: 0,
      slide_type: 'title',
      layout: 'A',
      purpose: 'Opening slide with presentation title and context'
    },
    {
      slide_index: 1,
      slide_type: 'hero',
      layout: 'B',
      purpose: 'Key messages and main takeaways'
    },
    {
      slide_index: 2,
      slide_type: 'stats',
      layout: 'A',
      purpose: 'Supporting data and metrics'
    },
    {
      slide_index: 3,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Detailed content and analysis'
    },
    {
      slide_index: 4,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Conclusion and next steps'
    }
  ];
}

// AI-powered outline generation prompt
export function buildSlideOutlinePrompt(
  presentationType: PresentationType,
  inputs: SlideOutlineInputs
): string {
  const allowedTypes = PRESENTATION_SLIDE_TYPES[presentationType];
  
  return `Create a slide outline for a ${presentationType.replace('_', ' ')} presentation.

Rules:
- Return structure only (no final copy)
- Decide slide order, slide type, and layout
- Use only the allowed slide types: ${allowedTypes.join(', ')}

Return JSON array with:
- slide_index
- slide_type
- layout (A: Statement, B: Bullets, C: Two-column)
- purpose (1 short sentence)

Inputs:
${JSON.stringify(inputs, null, 2)}

Output JSON only.`;
}

// Validate outline against allowed types
export function validateSlideOutline(
  outline: SlideOutlineItem[],
  presentationType: PresentationType
): { valid: boolean; errors: string[] } {
  const allowedTypes = PRESENTATION_SLIDE_TYPES[presentationType];
  const errors: string[] = [];
  
  outline.forEach((item, index) => {
    if (!allowedTypes.includes(item.slide_type)) {
      errors.push(`Slide ${index}: type "${item.slide_type}" not allowed for ${presentationType}`);
    }
    if (!['A', 'B', 'C'].includes(item.layout)) {
      errors.push(`Slide ${index}: invalid layout "${item.layout}"`);
    }
    if (!item.purpose || item.purpose.length < 10) {
      errors.push(`Slide ${index}: purpose too short or missing`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
