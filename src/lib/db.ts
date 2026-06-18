import * as dns from 'dns';
import { Pool, type PoolConfig } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dns.setDefaultResultOrder('ipv6first');

function buildPoolConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL ?? '';
  const isSupabase = raw.includes('supabase');

  if (!isSupabase) {
    return {
      connectionString: raw,
      max: process.env.VERCEL ? 1 : 10,
    };
  }

  // sslmode=require na URL força verify-full no pg 8+ e ignora rejectUnauthorized.
  // Removemos da query e configuramos SSL explicitamente no Pool.
  const connectionString = raw
    .replace(/([?&])sslmode=[^&]*&?/g, '$1')
    .replace(/[?&]$/, '');

  const parsed = new URL(connectionString);
  const isDirectDbHost = /^db\.[^.]+\.supabase\.co$/.test(parsed.hostname);

  if (isDirectDbHost) {
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, '') || 'postgres',
      ssl: { rejectUnauthorized: false },
      max: process.env.VERCEL ? 1 : 10,
    };
  }

  return {
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: process.env.VERCEL ? 1 : 10,
  };
}

const pool = new Pool(buildPoolConfig());
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
