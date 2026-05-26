import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { prisma } from './src/lib/db';

function parseMoney(val: string): number {
  if (!val) return 0;
  // Remove "R$ ", replace "." with "", replace "," with "."
  const clean = val.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

async function main() {
  const fileContent = fs.readFileSync('data.csv', 'utf8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  console.log(`Encontrados ${records.length} registros. Sincronizando...`);

  for (const record of records) {
    const name = record['Nome'];
    if (!name) continue;

    const category = record['Categoria'] || 'Outros';
    const contracted = parseMoney(record['Valor Contratado']);
    const paid = parseMoney(record['Valor Pago']);

    const budgeted = contracted;

    await prisma.vendor.create({
      data: {
        name,
        service: name, // Using Name as service for now
        category,
        budgeted_amount: budgeted,
        contracted_amount: contracted,
        paid_amount: paid,
      },
    });
    console.log(`Criado fornecedor: ${name}`);
  }

  console.log('Seed completo!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
