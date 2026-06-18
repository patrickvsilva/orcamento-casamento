import { DesktopNav } from '@/components/layout/DesktopNav';
import { LiquidGlassTabBar } from '@/components/layout/LiquidGlassTabBar';
import { PullToRefresh } from '@/components/PullToRefresh';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <>
      <DesktopNav />
      <div className="flex min-h-dvh flex-col md:min-h-full">
        <PullToRefresh className="flex-1 tab-bar-safe-area md:pb-0">{children}</PullToRefresh>
        <LiquidGlassTabBar />
      </div>
    </>
  );
}
