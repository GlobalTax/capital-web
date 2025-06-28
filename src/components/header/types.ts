
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  description?: string;
  image?: string;
}

export interface MenuCategory {
  title: string;
  items: NavItem[];
}
