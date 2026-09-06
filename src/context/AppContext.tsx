import React, { createContext, useContext, useState, useEffect } from 'react';
import { Repository, ThemeMode } from '../types';
import { repoService } from '../services/api';

interface AppContextType {
  activeRepoId: string;
  setActiveRepoId: (id: string) => void;
  activeRepo: Repository | undefined;
  repositories: Repository[];
  refreshRepositories: () => Promise<void>;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  diffGlowEnabled: boolean;
  setDiffGlowEnabled: (enabled: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [activeRepoId, setActiveRepoId] = useState<string>('repolens-demo');
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('repolens_theme');
    return (saved as ThemeMode) || 'dark';
  });
  const [diffGlowEnabled, setDiffGlowEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('repolens_diff_glow');
    return saved !== null ? saved === 'true' : true;
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const refreshRepositories = async () => {
    const list = await repoService.getRepositories();
    setRepositories(list);
  };

  useEffect(() => {
    refreshRepositories();
  }, []);

  const activeRepo = repositories.find((r) => r.id === activeRepoId) || repositories[0];

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('repolens_theme', newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const setDiffGlowEnabled = (val: boolean) => {
    setDiffGlowEnabledState(val);
    localStorage.setItem('repolens_diff_glow', String(val));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
      }
    }
  }, [theme]);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeRepoId,
        setActiveRepoId,
        activeRepo,
        repositories,
        refreshRepositories,
        theme,
        setTheme,
        toggleTheme,
        diffGlowEnabled,
        setDiffGlowEnabled,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
