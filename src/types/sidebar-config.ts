// Types for dynamic sidebar configuration

export interface SidebarSection {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  position: number;
  is_active: boolean;
  is_collapsed_default: boolean;
  created_at: string;
  updated_at: string;
  items?: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  section_id: string;
  title: string;
  url: string;
  icon: string;
  description: string | null;
  badge: 'URGENTE' | 'AI' | 'NEW' | 'HOT' | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SidebarGlobalConfig {
  id: string;
  show_search: boolean;
  show_version_switcher: boolean;
  collapsed_by_default: boolean;
  updated_at: string;
}

export interface SidebarSectionWithItems extends SidebarSection {
  items: SidebarItem[];
}

// Form types for creating/editing
export interface SidebarSectionFormData {
  title: string;
  description: string;
  emoji: string;
  is_active: boolean;
  is_collapsed_default: boolean;
}

export interface SidebarItemFormData {
  title: string;
  url: string;
  icon: string;
  description: string;
  badge: 'URGENTE' | 'AI' | 'NEW' | 'HOT' | null;
  is_active: boolean;
}
