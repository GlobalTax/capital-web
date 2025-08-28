import React from 'react';
import { 
  Building, Calculator, Scale, FileText, Target, Gavel,
  Hospital, Factory, ShoppingBag, Computer,
  Newspaper, BookOpen, BarChart3, Mail, Video,
  Award, TrendingUp, Users, UserPlus, Circle
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export type IconName = 
  | 'Building' | 'Calculator' | 'Scale' | 'FileText' | 'Target' | 'Gavel'
  | 'Hospital' | 'Factory' | 'ShoppingBag' | 'Computer'
  | 'Newspaper' | 'BookOpen' | 'BarChart3' | 'Mail' | 'Video'
  | 'Award' | 'TrendingUp' | 'Users' | 'UserPlus';

interface DirectIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

// Direct icon mapping - no lazy loading
const iconMap: Record<IconName, React.ComponentType<LucideProps>> = {
  Building,
  Calculator,
  Scale,
  FileText,
  Target,
  Gavel,
  Hospital,
  Factory,
  ShoppingBag,
  Computer,
  Newspaper,
  BookOpen,
  BarChart3,
  Mail,
  Video,
  Award,
  TrendingUp,
  Users,
  UserPlus,
};

export const DirectIcon: React.FC<DirectIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || Circle;
  return <IconComponent {...props} />;
};

export default DirectIcon;