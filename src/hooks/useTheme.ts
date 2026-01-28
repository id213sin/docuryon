import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return { theme, resolvedTheme, setTheme };
}
