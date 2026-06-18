import Link from 'next/link';
import { ChevronRight, Heart, List, Clock, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';
import { VENDOR_CATEGORIES } from '@/lib/constants';
import { fetchVendors } from '@/lib/vendor-utils';

export default async function MaisPage() {
  const vendors = await fetchVendors();

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Mais</h1>
        <p className="text-sm text-muted-foreground">Configurações e informações do app</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-primary" />
            Orçamento do Casamento
          </CardTitle>
          <CardDescription>
            Controle financeiro dos fornecedores do seu casamento, otimizado para mobile.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {vendors.length} fornecedores cadastrados · {VENDOR_CATEGORIES.length} categorias
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" />
            Aparência
          </CardTitle>
          <CardDescription>Alterne entre modo claro e escuro</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle showLabel className="w-full justify-start" />
        </CardContent>
      </Card>

      <PwaInstallPrompt />

      <div className="space-y-2">
        <Link
          href="/fornecedores"
          className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <List className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Fornecedores</p>
              <p className="text-xs text-muted-foreground">Ver e gerenciar lista completa</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/pendencias"
          className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Pendências</p>
              <p className="text-xs text-muted-foreground">Pagamentos em aberto</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias</CardTitle>
          <CardDescription>Categorias disponíveis para fornecedores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {VENDOR_CATEGORIES.map((category) => (
              <span
                key={category}
                className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
