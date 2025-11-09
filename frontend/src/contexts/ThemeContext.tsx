import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('kimi-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Default to light mode
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('kimi-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
