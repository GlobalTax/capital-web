import React, { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { 
  LiquidGlassProvider, 
  NavBar, 
  ToggleSwitch 
} from './LiquidGlassKit';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayoutContent: React.FC<MainLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  const navLinks = [
    { label: 'Dashboard', href: '/admin/v2/demo' },
    { label: 'Mandatos', href: '/admin/mandatos' },
    { label: 'Targets', href: '/admin/targets' },
    { label: 'Open Deals', href: '/admin/deals' },
    { label: 'Informes', href: '/admin/informes' }
  ];

  return (
    <LiquidGlassProvider>
      <div 
        className={cn(
          "min-h-screen transition-colors duration-500",
          theme === 'dark'
            ? "bg-gradient-to-br from-slate-900 via-slate-950 to-black"
            : "bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50"
        )}
      >
        <NavBar 
          brand="Capittal Transacciones"
          links={navLinks}
          rightSlot={<ToggleSwitch />}
        />

        <main className="mx-auto max-w-7xl p-6">
          {children}
        </main>
      </div>
    </LiquidGlassProvider>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </ThemeProvider>
  );
};
