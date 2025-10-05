import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sanitizeInput } from '@/hooks/validation/sanitizers';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Obtener tema de localStorage con sanitización
    const storedTheme = localStorage.getItem('capittal-admin-theme');
    if (storedTheme) {
      const sanitized = sanitizeInput(storedTheme, { maxLength: 10 });
      return sanitized === 'dark' || sanitized === 'light' ? sanitized : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Persistir tema en localStorage
    localStorage.setItem('capittal-admin-theme', theme);
    
    // Aplicar clase al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
