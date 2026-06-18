import { prisma } from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';

export type VendorFilters = {
  status?: string;
  category?: string;
  q?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
};

export type VendorRecord = {
  id: string;
  name: string;
  service: string;
  category: string;
  budgeted_amount: number;
  contracted_amount: number | null;
  paid_amount: number;
  next_due_date: Date | null;
  created_at: Date;
  updated_at: Date;
};

function mapVendor(vendor: {
  id: string;
  name: string;
  service: string;
  category: string;
  budgeted_amount: Prisma.Decimal;
  contracted_amount: Prisma.Decimal | null;
  paid_amount: Prisma.Decimal;
  next_due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}): VendorRecord {
  return {
    ...vendor,
    budgeted_amount: Number(vendor.budgeted_amount),
    contracted_amount: vendor.contracted_amount ? Number(vendor.contracted_amount) : null,
    paid_amount: Number(vendor.paid_amount),
  };
}

export async function findVendors(filters?: VendorFilters): Promise<VendorRecord[]> {
  const needsRemainingSort = filters?.sort === 'remaining';
  const needsStatusFilter = filters?.status && filters.status !== 'all';

  if (needsRemainingSort || needsStatusFilter) {
    const direction = filters?.dir === 'desc' ? 'DESC' : 'ASC';
    const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];

    if (filters?.category && filters.category !== 'all') {
      conditions.push(Prisma.sql`category = ${filters.category}`);
    }

    const query = filters?.q?.trim();
    if (query) {
      const pattern = `%${query}%`;
      conditions.push(Prisma.sql`(name ILIKE ${pattern} OR service ILIKE ${pattern})`);
    }

    if (filters?.status === 'paid') {
      conditions.push(
        Prisma.sql`contracted_amount IS NOT NULL AND contracted_amount > 0 AND paid_amount >= contracted_amount`,
      );
    }

    if (filters?.status === 'pending') {
      conditions.push(
        Prisma.sql`NOT (contracted_amount IS NOT NULL AND contracted_amount > 0 AND paid_amount >= contracted_amount)`,
      );
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    let orderClause = Prisma.sql`created_at DESC`;
    if (needsRemainingSort) {
      orderClause =
        direction === 'DESC'
          ? Prisma.sql`(COALESCE(contracted_amount, 0) - paid_amount) DESC`
          : Prisma.sql`(COALESCE(contracted_amount, 0) - paid_amount) ASC`;
    } else if (filters?.sort) {
      const allowed = new Set([
        'name',
        'category',
        'budgeted_amount',
        'contracted_amount',
        'paid_amount',
        'next_due_date',
        'created_at',
      ]);
      if (allowed.has(filters.sort)) {
        orderClause = Prisma.sql`${Prisma.raw(filters.sort)} ${Prisma.raw(direction)}`;
      }
    }

    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        service: string;
        category: string;
        budgeted_amount: Prisma.Decimal;
        contracted_amount: Prisma.Decimal | null;
        paid_amount: Prisma.Decimal;
        next_due_date: Date | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      SELECT id, name, service, category, budgeted_amount, contracted_amount, paid_amount, next_due_date, created_at, updated_at
      FROM vendors
      WHERE ${whereClause}
      ORDER BY ${orderClause}
    `;

    return rows.map(mapVendor);
  }

  const where: Prisma.VendorWhereInput = {};

  if (filters?.category && filters.category !== 'all') {
    where.category = filters.category;
  }

  const query = filters?.q?.trim();
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { service: { contains: query, mode: 'insensitive' } },
    ];
  }

  const direction = filters?.dir === 'desc' ? 'desc' : 'asc';
  let orderBy: Prisma.VendorOrderByWithRelationInput = { created_at: 'desc' };

  switch (filters?.sort) {
    case 'name':
      orderBy = { name: direction };
      break;
    case 'category':
      orderBy = { category: direction };
      break;
    case 'budgeted_amount':
      orderBy = { budgeted_amount: direction };
      break;
    case 'contracted_amount':
      orderBy = { contracted_amount: direction };
      break;
    case 'paid_amount':
      orderBy = { paid_amount: direction };
      break;
    case 'next_due_date':
      orderBy = { next_due_date: direction };
      break;
    default:
      orderBy = { created_at: 'desc' };
  }

  const vendors = await prisma.vendor.findMany({ where, orderBy });
  return vendors.map(mapVendor);
}
