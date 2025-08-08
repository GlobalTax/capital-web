import { lazy } from 'react';
import type { LucideIcon } from 'lucide-react';

export type IconName = 
  | 'Building' | 'Calculator' | 'Scale' | 'FileText' | 'Target' | 'Gavel'
  | 'Hospital' | 'Factory' | 'ShoppingBag' | 'Computer'
  | 'Newspaper' | 'BookOpen' | 'BarChart3' | 'Mail' | 'Video'
  | 'Award' | 'TrendingUp' | 'Users'
  | 'UserPlus';

// Lazy import map for icons
export const iconImports: Record<IconName, () => Promise<{ default: LucideIcon }>> = {
  Building: () => import('lucide-react').then(mod => ({ default: mod.Building })),
  Calculator: () => import('lucide-react').then(mod => ({ default: mod.Calculator })),
  Scale: () => import('lucide-react').then(mod => ({ default: mod.Scale })),
  FileText: () => import('lucide-react').then(mod => ({ default: mod.FileText })),
  Target: () => import('lucide-react').then(mod => ({ default: mod.Target })),
  Gavel: () => import('lucide-react').then(mod => ({ default: mod.Gavel })),
  Hospital: () => import('lucide-react').then(mod => ({ default: mod.Hospital })),
  Factory: () => import('lucide-react').then(mod => ({ default: mod.Factory })),
  ShoppingBag: () => import('lucide-react').then(mod => ({ default: mod.ShoppingBag })),
  Computer: () => import('lucide-react').then(mod => ({ default: mod.Computer })),
  Newspaper: () => import('lucide-react').then(mod => ({ default: mod.Newspaper })),
  BookOpen: () => import('lucide-react').then(mod => ({ default: mod.BookOpen })),
  BarChart3: () => import('lucide-react').then(mod => ({ default: mod.BarChart3 })),
  Mail: () => import('lucide-react').then(mod => ({ default: mod.Mail })),
  Video: () => import('lucide-react').then(mod => ({ default: mod.Video })),
  Award: () => import('lucide-react').then(mod => ({ default: mod.Award })),
  TrendingUp: () => import('lucide-react').then(mod => ({ default: mod.TrendingUp })),
  Users: () => import('lucide-react').then(mod => ({ default: mod.Users })),
  UserPlus: () => import('lucide-react').then(mod => ({ default: mod.UserPlus })),
};

// Icon cache to avoid re-importing
const iconCache = new Map<IconName, LucideIcon>();

export const getIcon = async (iconName: IconName): Promise<LucideIcon> => {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  try {
    const iconModule = await iconImports[iconName]();
    const icon = iconModule.default;
    iconCache.set(iconName, icon);
    return icon;
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
    // Return a fallback icon
    const { Circle } = await import('lucide-react');
    return Circle;
  }
};