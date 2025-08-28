
import type { IconName } from '@/components/ui/DirectIcon';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: IconName;
  description?: string;
  image?: string;
}

export interface MenuCategory {
  title: string;
  items: NavItem[];
}
