import * as LucideIcons from 'lucide-react';
import { cn } from '@/utils/cn';

type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps) {
  const IconComponent = LucideIcons[name] as React.ComponentType<{
    size?: number;
    className?: string;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} className={cn(className)} />;
}
