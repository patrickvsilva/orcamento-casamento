'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { triggerHaptic } from '@/hooks/use-haptic';
import { cn } from '@/lib/utils';

const PULL_THRESHOLD = 72;

interface PullToRefreshProps {
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ children, className }: PullToRefreshProps) {
  const router = useRouter();
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const reset = useCallback(() => {
    pulling.current = false;
    setPullDistance(0);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    triggerHaptic([12, 24, 12]);
    router.refresh();
    window.setTimeout(() => {
      setRefreshing(false);
      reset();
    }, 600);
  }, [reset, router]);

  const onTouchStart = (event: React.TouchEvent) => {
    if (refreshing || window.scrollY > 0) return;
    startY.current = event.touches[0]?.clientY ?? 0;
    pulling.current = true;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;

    const currentY = event.touches[0]?.clientY ?? 0;
    const distance = Math.max(0, Math.min(currentY - startY.current, PULL_THRESHOLD * 1.5));

    if (distance > 0 && window.scrollY <= 0) {
      setPullDistance(distance);
      if (distance > 12) event.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (!pulling.current || refreshing) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setPullDistance(PULL_THRESHOLD);
      handleRefresh();
      return;
    }

    reset();
  };

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 flex -translate-y-full justify-center transition-transform duration-200 md:hidden',
          (pullDistance > 0 || refreshing) && 'translate-y-2',
        )}
        style={{
          transform:
            pullDistance > 0 || refreshing
              ? `translateY(${Math.min(pullDistance * 0.35, 28)}px)`
              : undefined,
        }}
        aria-hidden
      >
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <Loader2
            className={cn('h-4 w-4', (refreshing || progress >= 1) && 'animate-spin')}
            style={{
              opacity: Math.max(progress, refreshing ? 1 : 0),
            }}
          />
          <span>{refreshing ? 'Atualizando...' : progress >= 1 ? 'Solte para atualizar' : 'Puxe para atualizar'}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
