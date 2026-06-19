import 'dotenv/config';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { normalizeCategory } from './src/lib/categories';
import { parseCsvDueDate } from './src/lib/csv-dates';
import { prisma } from './src/lib/db';

type CsvRecord = Record<string, string>;

function parseMoney(val: string | undefined): number {
  if (!val) return 0;
  const clean = val
    .replace(/\u00a0/g, ' ')
    .replace(/R\$/g, '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(clean) || 0;
}

function parseContracted(val: string | undefined): number | null {
  const amount = parseMoney(val);
  return amount > 0 ? amount : null;
}

function resolveBudgeted(record: CsvRecord, contracted: number | null, paid: number): number {
  const budgetedFromCsv = parseMoney(record['Valor Orçado']);
  if (budgetedFromCsv > 0) return budgetedFromCsv;

  if (contracted && contracted > 0) return contracted;
  if (paid > 0) return paid;

  return 0;
}

async function upsertVendor(data: {
  name: string;
  service: string;
  category: string;
  budgeted_amount: number;
  contracted_amount: number | null;
  paid_amount: number;
  next_due_date: Date | null;
}) {
  const existing = await prisma.vendor.findFirst({
    where: { name: data.name },
  });

  if (existing) {
    await prisma.vendor.update({
      where: { id: existing.id },
      data,
    });
    return 'atualizado';
  }

  await prisma.vendor.create({ data });
  return 'criado';
}

async function main() {
  const fileContent = fs.readFileSync('data.csv', 'utf8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvRecord[];

  console.log(`Encontrados ${records.length} registros. Sincronizando...`);

  let created = 0;
  let updated = 0;

  for (const record of records) {
    const name = record['Nome']?.trim();
    if (!name) continue;

    const rawCategory = record['Categoria'] ?? 'Outros';
    const category = normalizeCategory(rawCategory, name);
    const contracted = parseContracted(record['Valor Contratado']);
    const paid = parseMoney(record['Valor Pago']);
    const budgeted = resolveBudgeted(record, contracted, paid);
    const service = record['Serviço']?.trim() || name;
    const nextDueDate = parseCsvDueDate(record['Próximo Vencimento']);

    const result = await upsertVendor({
      name,
      service,
      category,
      budgeted_amount: budgeted,
      contracted_amount: contracted,
      paid_amount: paid,
      next_due_date: nextDueDate,
    });

    if (result === 'criado') {
      created += 1;
      console.log(`Criado: ${name} [${category}]`);
    } else {
      updated += 1;
      console.log(`Atualizado: ${name} [${category}]`);
    }
  }

  console.log(`Seed completo! ${created} criados, ${updated} atualizados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
