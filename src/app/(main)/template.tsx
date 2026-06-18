'use client';

import { usePathname } from 'next/navigation';

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-in fade-in-0 slide-in-from-right-1 duration-200 fill-mode-both motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}
