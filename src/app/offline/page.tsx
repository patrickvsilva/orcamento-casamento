import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Sem conexão</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Não foi possível carregar os dados. Verifique sua internet e tente novamente.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants())}>
        Tentar novamente
      </Link>
    </main>
  );
}
