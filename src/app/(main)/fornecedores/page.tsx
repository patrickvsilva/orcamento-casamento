import { Suspense } from 'react';
import { VendorFilters } from '@/components/VendorFilters';
import { VendorTable } from '@/components/VendorTable';
import { VendorForm } from '@/components/VendorForm';
import { fetchVendors } from '@/lib/vendor-utils';

export default async function FornecedoresPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await props.searchParams;
  const category =
    typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const status =
    typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;
  const sort =
    typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
  const dir = resolvedSearchParams.dir === 'desc' ? 'desc' : 'asc';

  const spRecord = Object.fromEntries(
    Object.entries(resolvedSearchParams).filter(([, v]) => typeof v === 'string'),
  ) as Record<string, string>;

  const vendors = await fetchVendors({ category, status, sort, dir });

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">
            {vendors.length} {vendors.length === 1 ? 'fornecedor' : 'fornecedores'}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Suspense
            fallback={<div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-[300px]" />}
          >
            <VendorFilters />
          </Suspense>
          <div className="hidden md:block">
            <VendorForm />
          </div>
        </div>
      </div>

      <VendorTable
        vendors={vendors}
        sort={sort}
        dir={dir}
        searchParams={spRecord}
        basePath="/fornecedores"
      />
    </main>
  );
}
