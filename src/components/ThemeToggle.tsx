'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/hooks/use-haptic';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" size={showLabel ? 'default' : 'icon'} className={className} disabled>
        <Sun className="h-4 w-4" />
        {showLabel && <span className="ml-2">Tema</span>}
      </Button>
    );
  }

  const isDark = (resolvedTheme ?? theme) === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? 'default' : 'icon'}
      className={className}
      onClick={() => {
        triggerHaptic(8);
        setTheme(isDark ? 'light' : 'dark');
      }}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && <span className="ml-2">{isDark ? 'Modo claro' : 'Modo escuro'}</span>}
    </Button>
  );
}
