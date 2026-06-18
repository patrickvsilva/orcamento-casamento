'use client';

import { useRef, useState } from 'react';
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
import { formatCurrency, formatDueDate, cn } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/use-haptic';
import {
  getVendorRemaining,
  isVendorFullyPaid,
  type Vendor,
} from '@/lib/vendor-utils';

const SWIPE_THRESHOLD = 56;
const MAX_SWIPE = 112;

export function VendorMobileCard({ vendor }: { vendor: Vendor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const dragging = useRef(false);

  const remaining = getVendorRemaining(vendor);
  const isFullyPaid = isVendorFullyPaid(vendor);

  const closeSwipe = () => setOffset(0);

  const onTouchStart = (event: React.TouchEvent) => {
    startX.current = event.touches[0]?.clientX ?? 0;
    startOffset.current = offset;
    dragging.current = true;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!dragging.current) return;

    const currentX = event.touches[0]?.clientX ?? 0;
    const delta = currentX - startX.current;
    const nextOffset = Math.max(-MAX_SWIPE, Math.min(0, startOffset.current + delta));
    setOffset(nextOffset);
  };

  const onTouchEnd = () => {
    dragging.current = false;

    if (offset <= -SWIPE_THRESHOLD) {
      setOffset(-MAX_SWIPE);
      triggerHaptic(6);
      return;
    }

    closeSwipe();
  };

  const openEdit = () => {
    closeSwipe();
    setFormOpen(true);
  };

  const openMenu = () => {
    triggerHaptic(6);
    setMenuOpen(true);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-y-0 right-0 flex w-28">
          <button
            type="button"
            className="flex flex-1 items-center justify-center bg-primary text-primary-foreground"
            aria-label={`Editar ${vendor.name}`}
            onClick={openEdit}
          >
            <Pencil className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center justify-center bg-destructive text-white">
            <DeleteVendorButton
              id={vendor.id}
              iconOnly
              label="Excluir fornecedor"
              variant="ghost"
              className="h-full w-full text-white hover:bg-destructive hover:text-white"
              onSuccess={closeSwipe}
            />
          </div>
        </div>

        <div
          className={cn(
            'relative rounded-xl border bg-card p-4 transition-transform duration-200 motion-reduce:transition-none',
            isFullyPaid ? 'border-primary/30' : 'border-border',
            offset === 0 ? 'touch-pan-y' : 'touch-none',
          )}
          style={{ transform: `translateX(${offset}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {isFullyPaid && (
            <div
              className="pointer-events-none absolute inset-0 rounded-xl bg-primary/10"
              aria-hidden
            />
          )}
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{vendor.name}</p>
              <p className="text-xs text-muted-foreground">{vendor.service}</p>
            <Badge variant="outline" className="mt-2">
              {vendor.category}
            </Badge>
            {vendor.next_due_date && !isFullyPaid && (
              <p className="mt-2 text-xs text-muted-foreground">
                Vence em {formatDueDate(vendor.next_due_date)}
              </p>
            )}
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
                onClick={openMenu}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
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
