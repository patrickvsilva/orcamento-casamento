import Link from 'next/link';
import { VendorForm } from '@/components/VendorForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { DesktopNavLink } from '@/components/layout/DesktopNavLink';

const links = [
  { href: '/', label: 'Resumo' },
  { href: '/fornecedores', label: 'Fornecedores' },
  { href: '/pendencias', label: 'Pendências' },
  { href: '/caixa', label: 'Caixa' },
  { href: '/mais', label: 'Mais' },
] as const;

export function DesktopNav() {
  return (
    <header className="hidden border-b bg-card md:block">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Orçamento do Casamento
          </Link>
          <nav className="flex items-center gap-1" aria-label="Navegação principal">
            {links.map((link) => (
              <DesktopNavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <VendorForm trigger={<Button>Adicionar Fornecedor</Button>} />
        </div>
      </div>
    </header>
  );
}
