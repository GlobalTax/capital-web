// Presentation Engine Types

export type PresentationType = 'teaser_sell' | 'firm_deck' | 'client_deck' | 'one_pager' | 'mandate_deck' | 'custom';
export type SlideLayout = 'title' | 'hero' | 'stats' | 'bullets' | 'comparison' | 'timeline' | 'team' | 'financials' | 'closing' | 'disclaimer' | 'overview' | 'market' | 'testimonials' | 'custom';
export type SharePermission = 'view' | 'download_pdf' | 'edit';
export type PresentationStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type Theme = 'light' | 'dark';

export interface BrandKit {
  id: string;
  name: string;
  logo_url?: string;
  logo_dark_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_light: string;
  background_dark: string;
  font_heading: string;
  font_body: string;
  footer_text?: string;
  disclaimer_text?: string;
  watermark_text?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image_url?: string;
  sector?: string;
}

export interface SlideContent {
  bullets?: string[];
  stats?: { label: string; value: string; suffix?: string }[];
  table?: boolean;
  team?: boolean;
  phases?: string[];
  options?: string[];
  image_url?: string;
  custom_html?: string;
  testimonials?: Testimonial[];
}

export type SlideApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'locked';

export interface Slide {
  id: string;
  project_id: string;
  order_index: number;
  layout: SlideLayout;
  headline?: string;
  subline?: string;
  content: SlideContent;
  background_color?: string;
  background_image_url?: string;
  text_color?: string;
  is_hidden: boolean;
  notes?: string;
  approval_status?: SlideApprovalStatus;
  approved_at?: string;
  approved_by?: string;
  is_locked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PresentationProject {
  id: string;
  title: string;
  description?: string;
  type: PresentationType;
  brand_kit_id?: string;
  theme: Theme;
  status: PresentationStatus;
  is_confidential: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  empresa_id?: string;
  client_name?: string;
  project_code?: string;
  // Versioning
  version?: number;
  parent_version_id?: string;
  version_notes?: string;
  // Relations
  brand_kit?: BrandKit;
  slides?: Slide[];
}

export interface PresentationVersion {
  id: string;
  project_id: string;
  version_number: number;
  created_at: string;
  created_by?: string;
  version_notes?: string;
  slides_snapshot: Slide[];
  is_current: boolean;
}

export interface SharingLink {
  id: string;
  project_id: string;
  token: string;
  permission: SharePermission;
  password_hash?: string;
  expires_at?: string;
  max_views?: number;
  view_count: number;
  is_active: boolean;
  recipient_email?: string;
  recipient_name?: string;
  created_at: string;
  last_accessed_at?: string;
}

export interface PresentationTemplate {
  id: string;
  name: string;
  type: PresentationType;
  description?: string;
  thumbnail_url?: string;
  slides_config: Partial<Slide>[];
  is_active: boolean;
  display_order: number;
}

export interface PresentationComment {
  id: string;
  project_id: string;
  slide_id?: string;
  author_name: string;
  author_email?: string;
  content: string;
  is_resolved: boolean;
  resolved_at?: string;
  parent_id?: string;
  created_at: string;
}

// UI State Types
export interface PresentationViewerState {
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
  isPdfMode: boolean;
  isMobilePreview: boolean;
}

export interface EditorState {
  selectedSlideId: string | null;
  isDragging: boolean;
  hasUnsavedChanges: boolean;
  previewMode: 'web' | 'mobile' | 'pdf';
}

// Form Types
export interface CreatePresentationInput {
  title: string;
  description?: string;
  type: PresentationType;
  template_id?: string;
  brand_kit_id?: string;
  theme?: Theme;
  client_name?: string;
  project_code?: string;
}

export interface UpdateSlideInput {
  layout?: SlideLayout;
  headline?: string;
  subline?: string;
  content?: SlideContent;
  background_color?: string;
  background_image_url?: string;
  text_color?: string;
  is_hidden?: boolean;
  notes?: string;
}

// Presentation Type Labels
export const PRESENTATION_TYPE_LABELS: Record<PresentationType, string> = {
  teaser_sell: 'Teaser Sell-Side',
  firm_deck: 'Firm Deck',
  client_deck: 'Client Deck',
  one_pager: 'One Pager',
  mandate_deck: 'Mandate Deck',
  custom: 'Custom'
};

export const SLIDE_LAYOUT_LABELS: Record<SlideLayout, string> = {
  title: 'Title Slide',
  hero: 'Hero / Highlights',
  stats: 'Statistics',
  bullets: 'Bullet Points',
  comparison: 'Comparison',
  timeline: 'Timeline',
  team: 'Team',
  financials: 'Financials',
  closing: 'Closing / CTA',
  disclaimer: 'Confidentiality & Disclaimer',
  overview: 'Company Overview',
  market: 'Market & Positioning',
  testimonials: 'Testimonials / Case Studies',
  custom: 'Custom'
};

export const STATUS_LABELS: Record<PresentationStatus, string> = {
  draft: 'Draft',
  review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived'
};
