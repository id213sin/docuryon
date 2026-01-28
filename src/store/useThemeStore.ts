import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types/theme';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        let resolved: 'light' | 'dark' = 'light';

        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        } else {
          resolved = theme;
        }

        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);

        set({ theme, resolvedTheme: resolved });
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);
