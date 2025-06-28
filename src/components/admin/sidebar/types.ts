
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}
