'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { triggerHaptic } from '@/hooks/use-haptic';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'pwa-install-dismissed';

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function PwaInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInstalled(isStandaloneMode());
    setIsIos(isIosDevice());
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1');

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    triggerHaptic(10);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }

    setDeferredPrompt(null);
    dismiss();
  };

  if (!mounted) {
    return <Skeleton className="h-36 w-full rounded-xl" />;
  }

  if (installed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">App instalado</CardTitle>
          <CardDescription>
            Abra pelo ícone na Tela de Início para a melhor experiência.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (dismissed) {
    return null;
  }

  if (deferredPrompt) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Instalar app</CardTitle>
            <CardDescription>
              Adicione o Orçamento à sua tela inicial para acesso rápido, mesmo offline.
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full gap-2" onClick={handleInstall}>
            <Download className="h-4 w-4" />
            Instalar agora
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isIos) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Instalar no iPhone</CardTitle>
            <CardDescription>
              Toque em Compartilhar e depois em Adicionar à Tela de Início.
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share className="h-4 w-4 shrink-0" />
          Safari → Compartilhar → Adicionar à Tela de Início
        </CardContent>
      </Card>
    );
  }

  return null;
}
