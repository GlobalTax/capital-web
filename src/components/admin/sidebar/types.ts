
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}
