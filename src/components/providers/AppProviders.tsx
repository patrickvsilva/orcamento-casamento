'use client';

import { ThemeProvider } from 'next-themes';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { PwaSplash } from '@/components/pwa/PwaSplash';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PwaSplash />
      {children}
      <ServiceWorkerRegistration />
    </ThemeProvider>
  );
}
