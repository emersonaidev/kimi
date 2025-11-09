import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0 bg-secondary rounded-[var(--radius)] p-1">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-2 px-4 py-2 rounded-[calc(var(--radius)-2px)] transition-all duration-200 ${
          theme === 'light'
            ? 'bg-card shadow-sm'
            : 'bg-transparent hover:bg-muted'
        }`}
        aria-label="Switch to light mode"
        aria-pressed={theme === 'light'}
      >
        <Sun 
          className={`w-5 h-5 transition-colors ${
            theme === 'light' ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <span 
          className={`transition-colors ${
            theme === 'light' ? 'text-foreground' : 'text-muted-foreground'
          }`}
          style={{
            fontWeight: theme === 'light' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
          }}
        >
          Light
        </span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-2 px-4 py-2 rounded-[calc(var(--radius)-2px)] transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-card shadow-sm'
            : 'bg-transparent hover:bg-muted'
        }`}
        aria-label="Switch to dark mode"
        aria-pressed={theme === 'dark'}
      >
        <Moon 
          className={`w-5 h-5 transition-colors ${
            theme === 'dark' ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <span 
          className={`transition-colors ${
            theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'
          }`}
          style={{
            fontWeight: theme === 'dark' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
          }}
        >
          Dark
        </span>
      </button>
    </div>
  );
}
