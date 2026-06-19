import 'dotenv/config';
import { parse } from 'csv-parse/sync';
import * as dns from 'dns';
import * as fs from 'fs';
import { Pool } from 'pg';
import { formatCsvDueDate } from '../src/lib/csv-dates';
import { deriveCsvStatus } from '../src/lib/vendor-status';

dns.setDefaultResultOrder('ipv6first');

type VendorRow = {
  name: string;
  service: string;
  category: string;
  budgeted_amount: string;
  contracted_amount: string | null;
  paid_amount: string;
  next_due_date: Date | null;
};

type LegacyCsvRow = Record<string, string>;

function getConnectionString(): string {
  return process.env.DATABASE_URL_POOLER ?? process.env.DATABASE_URL ?? '';
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPaymentRatio(paid: number, contracted: number | null): string {
  if (!contracted || contracted <= 0) return '0';
  const ratio = paid / contracted;
  return ratio === 1 ? '1' : String(ratio);
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function loadLegacyRows(): Map<string, LegacyCsvRow> {
  if (!fs.existsSync('data.csv')) return new Map();

  const content = fs.readFileSync('data.csv', 'utf8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as LegacyCsvRow[];

  return new Map(
    records
      .filter((row) => row['Nome']?.trim())
      .map((row) => [row['Nome'].trim().toLowerCase(), row]),
  );
}

async function fetchVendors(): Promise<VendorRow[]> {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('Configure DATABASE_URL ou DATABASE_URL_POOLER no .env');
  }

  const parsed = new URL(connectionString);
  const pool = new Pool({
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, '') || 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { rows } = await pool.query<VendorRow>(
      `SELECT name, service, category, budgeted_amount, contracted_amount, paid_amount, next_due_date
       FROM vendors
       ORDER BY created_at ASC, name ASC`,
    );
    return rows;
  } catch (error) {
    if (parsed.hostname.startsWith('db.') && (error as NodeJS.ErrnoException).code === 'ENOTFOUND') {
      const projectRef = parsed.hostname.replace(/^db\./, '').split('.')[0];
      const addresses = await dns.promises.resolve6(`db.${projectRef}.supabase.co`);
      const ipv6Pool = new Pool({
        host: addresses[0],
        port: Number(parsed.port || 5432),
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, '') || 'postgres',
        ssl: { rejectUnauthorized: false },
      });

      try {
        const { rows } = await ipv6Pool.query<VendorRow>(
          `SELECT name, service, category, budgeted_amount, contracted_amount, paid_amount, next_due_date
           FROM vendors
           ORDER BY created_at ASC, name ASC`,
        );
        return rows;
      } finally {
        await ipv6Pool.end();
      }
    }

    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  const legacyByName = loadLegacyRows();
  const vendors = await fetchVendors();

  if (vendors.length === 0) {
    throw new Error('Nenhum fornecedor encontrado no banco');
  }

  const header =
    'Nome,Atribuir,Categoria,Pagamento,Pendente,Próximo Vencimento,Status,Valor Orçado,Valor Contratado,Valor Pago';

  const rows = vendors.map((vendor) => {
    const legacy = legacyByName.get(vendor.name.trim().toLowerCase());
    const budgeted = Number(vendor.budgeted_amount);
    const contracted =
      vendor.contracted_amount !== null ? Number(vendor.contracted_amount) : null;
    const paid = Number(vendor.paid_amount);
    const pending = contracted !== null ? Math.max(contracted - paid, 0) : 0;
    const amounts = { budgeted_amount: budgeted, contracted_amount: contracted, paid_amount: paid };

    const fields = [
      vendor.name,
      legacy?.['Atribuir'] ?? '',
      vendor.category,
      formatPaymentRatio(paid, contracted),
      formatMoney(pending),
      formatCsvDueDate(vendor.next_due_date),
      legacy?.['Status'] ?? deriveCsvStatus(amounts),
      budgeted > 0 ? formatMoney(budgeted) : '',
      contracted !== null && contracted > 0 ? formatMoney(contracted) : '',
      paid > 0 ? formatMoney(paid) : '',
    ];

    return fields.map(escapeCsvField).join(',');
  });

  const csv = [header, ...rows].join('\n') + '\n';
  fs.writeFileSync('data.csv', csv, 'utf8');

  console.log(`Exportados ${vendors.length} fornecedores de produção para data.csv`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
