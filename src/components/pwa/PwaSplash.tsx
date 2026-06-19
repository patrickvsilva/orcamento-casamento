'use client';

import { useLayoutEffect, useState } from 'react';

function isStandalonePwa() {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function PwaSplash() {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!isStandalonePwa()) return;

    const shown = sessionStorage.getItem('pwa-splash-shown');
    if (shown) return;

    setVisible(true);
    sessionStorage.setItem('pwa-splash-shown', '1');

    const timer = window.setTimeout(() => setVisible(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      id="pwa-splash"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background motion-reduce:transition-none"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/apple-icon.png"
          alt=""
          width={96}
          height={96}
          className="h-24 w-24 rounded-[22%] object-cover shadow-lg ring-1 ring-border"
          decoding="sync"
          fetchPriority="high"
        />
        <div className="text-center">
          <p className="font-heading text-xl font-semibold tracking-tight">Orçamento</p>
          <p className="mt-1 text-sm text-muted-foreground">Casamento L&P</p>
        </div>
      </div>
    </div>
  );
}
