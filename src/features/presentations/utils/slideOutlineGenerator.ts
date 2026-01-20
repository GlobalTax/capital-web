import type { PresentationType, SlideLayout } from '../types/presentation.types';

// Slide type definitions per presentation type
export const PRESENTATION_SLIDE_TYPES: Record<PresentationType, SlideLayout[]> = {
  teaser_sell: ['title', 'hero', 'stats', 'bullets', 'financials', 'timeline', 'closing'],
  firm_deck: ['title', 'hero', 'stats', 'bullets', 'team', 'closing'],
  client_deck: ['title', 'hero', 'stats', 'comparison', 'bullets', 'closing'],
  one_pager: ['title', 'stats', 'closing'],
  mandate_deck: ['title', 'hero', 'stats', 'bullets', 'comparison', 'closing'],
  custom: ['title', 'hero', 'stats', 'bullets', 'comparison', 'timeline', 'team', 'financials', 'closing', 'custom']
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
  const companyRef = inputs.company_name ? `for ${inputs.company_name}` : '';
  
  return [
    {
      slide_index: 0,
      slide_type: 'title',
      layout: 'A',
      purpose: `Introduce confidential memorandum ${companyRef} with project code`
    },
    {
      slide_index: 1,
      slide_type: 'hero',
      layout: 'B',
      purpose: 'Present 3-5 key investment highlights that differentiate the opportunity'
    },
    {
      slide_index: 2,
      slide_type: 'stats',
      layout: 'A',
      purpose: 'Display core metrics: revenue, EBITDA, employees, years in business'
    },
    {
      slide_index: 3,
      slide_type: 'bullets',
      layout: 'B',
      purpose: `Describe business model, market position, and competitive advantages in ${inputs.sector || 'sector'}`
    },
    {
      slide_index: 4,
      slide_type: 'financials',
      layout: 'C',
      purpose: 'Show 3-year financial summary with revenue, EBITDA, and margins'
    },
    {
      slide_index: 5,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Outline growth opportunities and strategic value for acquirers'
    },
    {
      slide_index: 6,
      slide_type: 'timeline',
      layout: 'A',
      purpose: 'Present transaction timeline with key milestones and expected closing'
    },
    {
      slide_index: 7,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Provide next steps and advisor contact information'
    }
  ];
}

function generateFirmDeckOutline(inputs: SlideOutlineInputs, _allowed: SlideLayout[]): SlideOutlineItem[] {
  return [
    {
      slide_index: 0,
      slide_type: 'title',
      layout: 'A',
      purpose: 'Introduce firm with logo, tagline, and service areas'
    },
    {
      slide_index: 1,
      slide_type: 'hero',
      layout: 'B',
      purpose: 'Present firm value proposition and differentiators'
    },
    {
      slide_index: 2,
      slide_type: 'stats',
      layout: 'A',
      purpose: 'Display track record metrics: transactions completed, total volume, years of experience'
    },
    {
      slide_index: 3,
      slide_type: 'team',
      layout: 'C',
      purpose: 'Showcase key team members with credentials and expertise'
    },
    {
      slide_index: 4,
      slide_type: 'bullets',
      layout: 'B',
      purpose: 'Detail service offerings and methodology'
    },
    {
      slide_index: 5,
      slide_type: 'closing',
      layout: 'A',
      purpose: 'Call to action with contact details and next steps'
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
