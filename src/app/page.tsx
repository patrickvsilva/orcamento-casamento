import { Suspense } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { getVendors } from "@/app/actions";
import { VendorForm } from "@/components/VendorForm";
import { VendorFilters } from "@/components/VendorFilters";
import { DeleteVendorButton } from "@/components/DeleteVendorButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Using a Client Component wrapper for the delete button to use useTransition or just forms.
// We'll use a simple form for delete action.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function SortHeader({ title, column, currentSort, currentDir, align = "left", searchParams }: { title: string, column: string, currentSort?: string, currentDir?: string, align?: "left" | "right", searchParams: any }) {
  const isSorted = currentSort === column;
  const newDir = isSorted && currentDir === 'asc' ? 'desc' : 'asc';
  
  const params = new URLSearchParams(searchParams);
  params.set('sort', column);
  params.set('dir', newDir);

  return (
    <TableHead className={align === 'right' ? 'text-right' : ''}>
      <Link href={`/?${params.toString()}`} className="group inline-flex items-center hover:text-foreground">
        {title}
        {isSorted ? (
          currentDir === 'asc' ? <ArrowUp className="ml-1.5 h-3 w-3" /> : <ArrowDown className="ml-1.5 h-3 w-3" />
        ) : (
          <ArrowUpDown className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        )}
      </Link>
    </TableHead>
  );
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await props.searchParams;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
  const dir = resolvedSearchParams.dir === 'desc' ? 'desc' : 'asc';

  // Convert to simple record for building links
  const spRecord = Object.fromEntries(
    Object.entries(resolvedSearchParams).filter(([_, v]) => typeof v === 'string')
  ) as Record<string, string>;

  let vendors: any[] = [];
  try {
    vendors = await getVendors({ category, status, sort, dir });
  } catch (e) {
    // Handling the case where DB is not connected yet
    console.warn("DB not connected yet");
  }

  const totalBudgeted = vendors.reduce((acc, v) => acc + v.budgeted_amount, 0);
  const totalContracted = vendors.reduce((acc, v) => acc + (v.contracted_amount || 0), 0);
  const totalPaid = vendors.reduce((acc, v) => acc + v.paid_amount, 0);
  const totalRemaining = totalContracted - totalPaid;

  return (
    <main className="container mx-auto py-8 space-y-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orçamento do Casamento</h1>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
          <Suspense fallback={<div className="w-[300px] h-10 bg-gray-100 animate-pulse rounded-md" />}>
            <VendorFilters />
          </Suspense>
          <VendorForm />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contratado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContracted)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falta Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader title="Fornecedor" column="name" currentSort={sort} currentDir={dir} searchParams={spRecord} />
              <SortHeader title="Categoria" column="category" currentSort={sort} currentDir={dir} searchParams={spRecord} />
              <SortHeader title="Orçado" column="budgeted_amount" currentSort={sort} currentDir={dir} align="right" searchParams={spRecord} />
              <SortHeader title="Contratado" column="contracted_amount" currentSort={sort} currentDir={dir} align="right" searchParams={spRecord} />
              <SortHeader title="Falta Pagar" column="remaining" currentSort={sort} currentDir={dir} align="right" searchParams={spRecord} />
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => {
                const contracted = vendor.contracted_amount || 0;
                const remaining = contracted - vendor.paid_amount;
                const isFullyPaid = contracted > 0 && remaining <= 0;

                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground">{vendor.service}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(vendor.budgeted_amount)}</TableCell>
                    <TableCell className="text-right">
                      {vendor.contracted_amount ? formatCurrency(vendor.contracted_amount) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isFullyPaid ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>
                      ) : (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(remaining)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <VendorForm 
                          vendor={vendor} 
                          trigger={<Button variant="outline" size="sm">Editar</Button>} 
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

      {/* Mobile Table View */}
      <div className="md:hidden rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader title="Fornecedor" column="name" currentSort={sort} currentDir={dir} searchParams={spRecord} />
              <SortHeader title="Falta Pagar" column="remaining" currentSort={sort} currentDir={dir} align="right" searchParams={spRecord} />
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => {
                const contracted = vendor.contracted_amount || 0;
                const remaining = contracted - vendor.paid_amount;
                const isFullyPaid = contracted > 0 && remaining <= 0;

                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{vendor.name}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isFullyPaid ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Pago</Badge>
                      ) : (
                        <span className="text-red-600 font-medium text-sm">
                          {formatCurrency(remaining)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col gap-2">
                        <VendorForm 
                          vendor={vendor} 
                          trigger={<Button variant="outline" size="sm" className="w-full text-xs h-7">Editar</Button>} 
                        />
                        <DeleteVendorButton id={vendor.id} className="w-full text-xs h-7" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
