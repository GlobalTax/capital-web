// Banner-related type definitions
export type AudienceType = 'all' | 'anon' | 'auth' | 'role:admin' | 'role:manager';

export interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  variant: 'solid' | 'gradient' | 'soft' | 'outline';
  colorScheme: {
    primary: string;
    secondary?: string;
    textOnPrimary?: string;
  };
  position: 'top' | 'bottom';
  dismissible: boolean;
  rounded: 'none' | 'md' | 'xl' | '2xl';
  shadow: boolean;
  align: 'left' | 'center';
  maxWidth: 'none' | '7xl';
  show: boolean;
  version: string;
  priority: number;
}

export interface BannerContainerProps {
  position: 'top' | 'bottom';
}