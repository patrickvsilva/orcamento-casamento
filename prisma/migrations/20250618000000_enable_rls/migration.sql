-- Enable RLS on public tables exposed to PostgREST
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
