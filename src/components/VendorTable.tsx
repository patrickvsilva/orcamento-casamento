import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { VendorForm } from '@/components/VendorForm';
import { DeleteVendorButton } from '@/components/DeleteVendorButton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  getVendorRemaining,
  isVendorFullyPaid,
  type Vendor,
} from '@/lib/vendor-utils';

function SortHeader({
  title,
  column,
  currentSort,
  currentDir,
  align = 'left',
  searchParams,
  basePath,
}: {
  title: string;
  column: string;
  currentSort?: string;
  currentDir?: string;
  align?: 'left' | 'right';
  searchParams: Record<string, string>;
  basePath: string;
}) {
  const isSorted = currentSort === column;
  const newDir = isSorted && currentDir === 'asc' ? 'desc' : 'asc';

  const params = new URLSearchParams(searchParams);
  params.set('sort', column);
  params.set('dir', newDir);

  return (
    <TableHead className={align === 'right' ? 'text-right' : ''}>
      <Link
        href={`${basePath}?${params.toString()}`}
        className="group inline-flex items-center hover:text-foreground"
      >
        {title}
        {isSorted ? (
          currentDir === 'asc' ? (
            <ArrowUp className="ml-1.5 h-3 w-3" />
          ) : (
            <ArrowDown className="ml-1.5 h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="ml-1.5 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
        )}
      </Link>
    </TableHead>
  );
}

interface VendorTableProps {
  vendors: Vendor[];
  sort?: string;
  dir: 'asc' | 'desc';
  searchParams: Record<string, string>;
  basePath?: string;
}

export function VendorTable({
  vendors,
  sort,
  dir,
  searchParams,
  basePath = '/fornecedores',
}: VendorTableProps) {
  return (
    <>
      <div className="hidden rounded-md border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                title="Fornecedor"
                column="name"
                currentSort={sort}
                currentDir={dir}
                searchParams={searchParams}
                basePath={basePath}
              />
              <SortHeader
                title="Categoria"
                column="category"
                currentSort={sort}
                currentDir={dir}
                searchParams={searchParams}
                basePath={basePath}
              />
              <SortHeader
                title="Orçado"
                column="budgeted_amount"
                currentSort={sort}
                currentDir={dir}
                align="right"
                searchParams={searchParams}
                basePath={basePath}
              />
              <SortHeader
                title="Contratado"
                column="contracted_amount"
                currentSort={sort}
                currentDir={dir}
                align="right"
                searchParams={searchParams}
                basePath={basePath}
              />
              <SortHeader
                title="Falta Pagar"
                column="remaining"
                currentSort={sort}
                currentDir={dir}
                align="right"
                searchParams={searchParams}
                basePath={basePath}
              />
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => {
                const remaining = getVendorRemaining(vendor);
                const isFullyPaid = isVendorFullyPaid(vendor);

                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground">{vendor.service}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(vendor.budgeted_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {vendor.contracted_amount ? formatCurrency(vendor.contracted_amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {isFullyPaid ? (
                        <Badge variant="secondary">Pago</Badge>
                      ) : (
                        <span className="font-medium text-destructive">
                          {formatCurrency(remaining)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <VendorForm
                          vendor={vendor}
                          trigger={
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          }
                        />
                        <DeleteVendorButton id={vendor.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {vendors.length === 0 ? (
          <div className="rounded-lg border bg-card py-8 text-center text-muted-foreground">
            Nenhum fornecedor cadastrado.
          </div>
        ) : (
          vendors.map((vendor) => {
            const remaining = getVendorRemaining(vendor);
            const isFullyPaid = isVendorFullyPaid(vendor);

            return (
              <div key={vendor.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor.service}</p>
                    <Badge variant="outline" className="mt-2">
                      {vendor.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {isFullyPaid ? (
                      <Badge variant="secondary">Pago</Badge>
                    ) : (
                      <p className="font-semibold text-destructive">{formatCurrency(remaining)}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">falta pagar</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <VendorForm
                    vendor={vendor}
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                    }
                  />
                  <DeleteVendorButton id={vendor.id} className="flex-1" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
