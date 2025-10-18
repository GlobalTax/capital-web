import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveBanners, type BannerData } from '@/hooks/useActiveBanners';
import { UniversalBanner } from '@/components/ui/universal-banner';
import type { AudienceType, BannerContainerProps } from '@/types/banners';

const getAudience = (user: any, isAdmin: boolean): AudienceType => {
  if (!user) return 'anon';
  if (isAdmin) return 'role:admin';
  return 'auth';
};

const BannerContainer: React.FC<BannerContainerProps> = ({ position }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  
  const audience = getAudience(user, isAdmin);
  const path = location.pathname;
  
  const { data: banners, isLoading, error } = useActiveBanners(path, audience);
  
  // Don't show anything while loading to avoid flash
  if (isLoading) {
    return null;
  }
  
  // Don't render anything if error or no banners
  if (error || !banners || banners.length === 0) {
    return null;
  }
  
  // Filter banners by position (no sorting needed since backend handles priority)
  const positionBanners = banners
    .filter(banner => banner.position === position);
  
  // Show only the highest priority banner for now
  // Could be extended to show multiple banners if needed
  const bannerToShow = positionBanners[0];
  
  if (!bannerToShow) {
    return null;
  }
  
  return (
    <UniversalBanner
      id={bannerToShow.id}
      title={bannerToShow.title}
      subtitle={bannerToShow.subtitle}
      ctaText={bannerToShow.ctaText}
      ctaHref={bannerToShow.ctaHref}
      variant={bannerToShow.variant}
      colorScheme={bannerToShow.colorScheme}
      position={bannerToShow.position}
      dismissible={bannerToShow.dismissible}
      rounded={bannerToShow.rounded as 'none' | 'md' | 'xl' | '2xl'}
      shadow={bannerToShow.shadow}
      align={bannerToShow.align}
      maxWidth={bannerToShow.maxWidth}
      show={bannerToShow.show}
      version={bannerToShow.version}
    />
  );
};

export default React.memo(BannerContainer);