import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LazyIcon from '@/components/ui/LazyIcon';
import { useBannerDismiss } from '@/hooks/useBannerDismiss';
import { useBannerTracking } from '@/hooks/useBannerTracking';
import type { IconName } from './icon-registry';

interface ColorScheme {
  primary: string;
  secondary?: string;
  textOnPrimary?: string;
}

interface UniversalBannerProps {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  icon?: ReactNode | string;
  variant: "solid" | "gradient" | "soft" | "outline";
  colorScheme: ColorScheme;
  position?: "top" | "bottom";
  dismissible?: boolean;
  rounded?: "none" | "md" | "xl" | "2xl";
  shadow?: boolean;
  align?: "left" | "center";
  maxWidth?: "none" | "7xl";
  show: boolean;
  onDismiss?: (id: string) => void;
  version?: string;
}

// Helper function to determine if a color is hex
const isHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Helper function to get contrast text color
const getContrastTextColor = (backgroundColor: string): string => {
  // Simple contrast logic - in a real app you might want more sophisticated color analysis
  if (backgroundColor.includes('#')) {
    // For hex colors, assume dark background needs light text
    return '#ffffff';
  }
  // For Tailwind colors, use reasonable defaults
  const darkColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'black', 'blue', 'indigo', 'purple', 'violet'];
  const isDark = darkColors.some(dark => backgroundColor.includes(dark));
  return isDark ? '#ffffff' : '#000000';
};

// Helper function to generate banner classes
export const getBannerClasses = (
  variant: UniversalBannerProps['variant'],
  colorScheme: ColorScheme
): { container: string; background: string; text: string } => {
  const { primary, secondary, textOnPrimary } = colorScheme;
  const isHexPrimary = isHexColor(primary);
  const isHexSecondary = secondary && isHexColor(secondary);
  
  const textColor = textOnPrimary || getContrastTextColor(primary);
  
  let backgroundStyle = '';
  let containerClasses = '';
  let textClasses = '';

  switch (variant) {
    case 'solid':
      if (isHexPrimary) {
        backgroundStyle = `background-color: ${primary}`;
        textClasses = `text-white`;
      } else {
        containerClasses = `bg-${primary}`;
        textClasses = primary.includes('white') || primary.includes('yellow') ? 'text-black' : 'text-white';
      }
      break;

    case 'gradient':
      if (isHexPrimary && isHexSecondary) {
        backgroundStyle = `background: linear-gradient(135deg, ${primary}, ${secondary})`;
        textClasses = 'text-white';
      } else if (isHexPrimary && secondary) {
        backgroundStyle = `background: linear-gradient(135deg, ${primary}, ${secondary})`;
        textClasses = 'text-white';
      } else {
        const secondaryColor = secondary || primary;
        containerClasses = `bg-gradient-to-r from-${primary} to-${secondaryColor}`;
        textClasses = 'text-white';
      }
      break;

    case 'soft':
      if (isHexPrimary) {
        // Create a soft version of hex color
        backgroundStyle = `background-color: ${primary}1a; border-color: ${primary}4d`;
        containerClasses = 'border';
        textClasses = `text-black`;
      } else {
        containerClasses = `bg-${primary}/10 border border-${primary}/30`;
        textClasses = `text-${primary}`;
      }
      break;

    case 'outline':
      if (isHexPrimary) {
        backgroundStyle = `border-color: ${primary}`;
        containerClasses = 'bg-transparent border';
        textClasses = `text-black`;
      } else {
        containerClasses = `bg-transparent border border-${primary}`;
        textClasses = `text-${primary}`;
      }
      break;
  }

  return {
    container: containerClasses,
    background: backgroundStyle,
    text: textClasses,
  };
};

export const UniversalBanner: React.FC<UniversalBannerProps> = ({
  id,
  title,
  subtitle,
  ctaText,
  ctaHref,
  icon,
  variant,
  colorScheme,
  position = "top",
  dismissible = true,
  rounded = "md",
  shadow = true,
  align = "center",
  maxWidth = "7xl",
  show,
  onDismiss,
  version = "1.0",
}) => {
  const { isDismissed, dismissBanner } = useBannerDismiss(id, version);
  const { trackClick } = useBannerTracking({ bannerId: id, enabled: show });

  // Don't render if not showing or dismissed
  if (!show || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    dismissBanner();
    onDismiss?.(id);
  };

  const handleCtaClick = () => {
    trackClick();
  };

  const { container, background, text } = getBannerClasses(variant, colorScheme);

  const roundedClasses = {
    none: '',
    md: 'rounded-md',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  const maxWidthClasses = {
    none: '',
    '7xl': 'max-w-7xl',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
  };

  const positionClasses = position === 'top' ? 'animate-fade-in' : 'animate-fade-in';

  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return (
        <LazyIcon 
          name={icon as IconName} 
          className="w-5 h-5 mr-3 flex-shrink-0" 
        />
      );
    }
    
    return <div className="mr-3 flex-shrink-0">{icon}</div>;
  };

  return (
    <div
      role="region"
      aria-label="site banner"
      className={`w-full ${positionClasses} transition-all duration-300`}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4`}>
        <div
          className={`
            ${container}
            ${roundedClasses[rounded]}
            ${shadow ? 'shadow-sm' : ''}
            ${text}
            ${alignClasses[align]}
            p-4 relative
          `}
          style={background ? { 
            background: background.includes('background:') 
              ? background.split('background:')[1] 
              : background.includes('background-color:') 
                ? background.split('background-color:')[1]
                : background,
            borderColor: background.includes('border-color:') 
              ? background.split('border-color:')[1]
              : undefined
          } : undefined}
        >
          {/* Dismiss button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Content container */}
          <div className={`flex items-center ${align === 'center' ? 'justify-center' : 'justify-start'} gap-4`}>
            {/* Icon */}
            {renderIcon()}

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm md:text-base opacity-90 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* CTA Button */}
            {ctaText && (
              <div className="flex-shrink-0">
                {ctaHref ? (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-current border-white/30"
                    onClick={handleCtaClick}
                  >
                    <a href={ctaHref}>{ctaText}</a>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-current border-white/30"
                    onClick={handleCtaClick}
                  >
                    {ctaText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};