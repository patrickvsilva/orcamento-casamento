'use client';

import { useState } from 'react';
import { MoreVertical, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VendorForm } from '@/components/VendorForm';
import { DeleteVendorButton } from '@/components/DeleteVendorButton';
import { formatCurrency, cn } from '@/lib/utils';
import {
  getVendorRemaining,
  isVendorFullyPaid,
  type Vendor,
} from '@/lib/vendor-utils';

export function VendorMobileCard({ vendor }: { vendor: Vendor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const remaining = getVendorRemaining(vendor);
  const isFullyPaid = isVendorFullyPaid(vendor);

  return (
    <>
      <div
        className={cn(
          'rounded-xl border p-4',
          isFullyPaid ? 'border-primary/20 bg-primary/10' : 'bg-card',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{vendor.name}</p>
            <p className="text-xs text-muted-foreground">{vendor.service}</p>
            <Badge variant="outline" className="mt-2">
              {vendor.category}
            </Badge>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              {isFullyPaid ? (
                <Badge>Pago</Badge>
              ) : (
                <>
                  <p className="font-semibold text-destructive">{formatCurrency(remaining)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">falta pagar</p>
                </>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Ações para ${vendor.name}`}
              onClick={() => setMenuOpen(true)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent showCloseButton>
          <SheetHeader>
            <SheetTitle>{vendor.name}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Editar fornecedor
            </Button>
            <DeleteVendorButton
              id={vendor.id}
              className="w-full justify-start gap-2"
              variant="outline"
              size="default"
              label="Excluir fornecedor"
              onSuccess={() => setMenuOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <VendorForm
        vendor={vendor}
        open={formOpen}
        onOpenChange={setFormOpen}
        hideTrigger
        onSuccess={() => setFormOpen(false)}
      />
    </>
  );
}
