
export interface LeadMagnet {
  id: string;
  title: string;
  type: 'report' | 'whitepaper' | 'checklist' | 'template';
  sector: string;
  description: string;
  content?: string;
  file_url?: string;
  landing_page_slug?: string;
  download_count: number;
  lead_conversion_count: number;
  status: 'active' | 'draft' | 'archived';
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadMagnetDownload {
  id: string;
  lead_magnet_id: string;
  user_email: string;
  user_name?: string;
  user_company?: string;
  user_phone?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
}

export interface LandingPageTemplate {
  id: string;
  name: string;
  type: 'sector-report' | 'valuation-tool' | 'consultation' | 'generic';
  template_html: string;
  template_config: {
    customizable_fields: string[];
    color_scheme: string;
    layout: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadMagnetFormData {
  title: string;
  type: 'report' | 'whitepaper' | 'checklist' | 'template';
  sector: string;
  description: string;
  meta_title?: string;
  meta_description?: string;
}

export interface DownloadFormData {
  user_email: string;
  user_name?: string;
  user_company?: string;
  user_phone?: string;
}
