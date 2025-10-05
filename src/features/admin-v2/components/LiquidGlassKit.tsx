import React, { createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { sanitizeInput } from '@/hooks/validation/sanitizers';

// ==================== LIQUID GLASS PROVIDER ====================
interface LiquidGlassContextType {
  blurIntensity: string;
}

const LiquidGlassContext = createContext<LiquidGlassContextType>({ blurIntensity: 'md' });

export const useLiquidGlass = () => useContext(LiquidGlassContext);

interface LiquidGlassProviderProps {
  children: ReactNode;
  blurIntensity?: string;
}

export const LiquidGlassProvider: React.FC<LiquidGlassProviderProps> = ({ 
  children, 
  blurIntensity = 'md' 
}) => {
  return (
    <LiquidGlassContext.Provider value={{ blurIntensity }}>
      {children}
    </LiquidGlassContext.Provider>
  );
};

// ==================== GLASS ====================
interface GlassProps {
  children: ReactNode;
  className?: string;
  blur?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
}

export const Glass: React.FC<GlassProps> = ({ 
  children, 
  className, 
  blur = 'md',
  opacity = 5
}) => {
  const blurClasses = {
    xs: 'backdrop-blur-[2px]',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  return (
    <div 
      className={cn(
        blurClasses[blur],
        'bg-white/5 dark:bg-white/5',
        `bg-opacity-${opacity}`,
        'border border-white/10',
        'rounded-2xl',
        'shadow-2xl shadow-black/20',
        'font-["Inter"] tracking-[-0.06em]',
        className
      )}
    >
      {children}
    </div>
  );
};

// ==================== NAVBAR ====================
interface NavLink {
  label: string;
  href: string;
}

interface NavBarProps {
  brand: string;
  links: NavLink[];
  rightSlot?: ReactNode;
}

export const NavBar: React.FC<NavBarProps> = ({ brand, links, rightSlot }) => {
  const { theme } = useTheme();
  
  return (
    <Glass 
      blur="xl" 
      className="sticky top-0 z-50 px-6 py-4 mb-6"
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-foreground">
            {sanitizeInput(brand, { maxLength: 100 })}
          </span>
          <div className="hidden md:flex gap-6">
            {links.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  theme === 'dark' 
                    ? "text-white/70 hover:text-white" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {sanitizeInput(link.label, { maxLength: 50 })}
              </a>
            ))}
          </div>
        </div>
        {rightSlot && (
          <div className="flex items-center gap-4">
            {rightSlot}
          </div>
        )}
      </nav>
    </Glass>
  );
};

// ==================== TOGGLE SWITCH ====================
export const ToggleSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-7 rounded-full transition-colors duration-300",
        "flex items-center px-1",
        theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
      )}
      aria-label="Toggle theme"
    >
      <div 
        className={cn(
          "w-5 h-5 rounded-full bg-white shadow-lg",
          "flex items-center justify-center",
          "transition-transform duration-300",
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        )}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-slate-700" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
};

// ==================== FEATURE CARD ====================
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  href 
}) => {
  const { theme } = useTheme();
  
  return (
    <a href={href}>
      <Glass 
        blur="lg"
        className={cn(
          "p-6 transition-all duration-300",
          "hover:scale-105 hover:shadow-3xl",
          "group cursor-pointer"
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'
          )}>
            <Icon className={cn(
              "w-6 h-6",
              theme === 'dark' ? 'text-white' : 'text-slate-700'
            )} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 text-foreground">
              {sanitizeInput(title, { maxLength: 100 })}
            </h3>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            )}>
              {sanitizeInput(description, { maxLength: 200 })}
            </p>
          </div>
        </div>
      </Glass>
    </a>
  );
};

// ==================== TAB MENU ====================
interface Tab {
  id: string;
  label: string;
}

interface TabMenuProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({ 
  tabs, 
  activeTab = tabs[0]?.id,
  onTabChange 
}) => {
  const { theme } = useTheme();
  const [selected, setSelected] = React.useState(activeTab);

  const handleTabClick = (tabId: string) => {
    setSelected(tabId);
    onTabChange?.(tabId);
  };

  return (
    <Glass blur="md" className="p-2">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
              selected === tab.id
                ? theme === 'dark'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-900'
                : theme === 'dark'
                  ? 'text-white/60 hover:bg-white/10'
                  : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {sanitizeInput(tab.label, { maxLength: 50 })}
          </button>
        ))}
      </div>
    </Glass>
  );
};
