'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function PwaSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);

    if (!isStandalone) return;

    const shown = sessionStorage.getItem('pwa-splash-shown');
    if (shown) return;

    setVisible(true);
    sessionStorage.setItem('pwa-splash-shown', '1');

    const timer = window.setTimeout(() => setVisible(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background motion-reduce:transition-none">
      <div className="flex flex-col items-center gap-4 animate-in fade-in-0 zoom-in-95 duration-500">
        <Image
          src="/apple-icon"
          alt=""
          width={96}
          height={96}
          className="rounded-[22%] shadow-lg ring-1 ring-border"
          priority
        />
        <div className="text-center">
          <p className="font-heading text-xl font-semibold tracking-tight">Orçamento</p>
          <p className="mt-1 text-sm text-muted-foreground">Casamento L&P</p>
        </div>
      </div>
    </div>
  );
}
