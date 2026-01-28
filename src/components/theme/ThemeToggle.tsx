import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/types/theme';

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun size={18} />,
  dark: <Moon size={18} />,
  system: <Monitor size={18} />
};

const themeOrder: Theme[] = ['light', 'dark', 'system'];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
    >
      {themeIcons[theme]}
    </Button>
  );
}
