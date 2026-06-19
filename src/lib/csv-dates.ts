const PT_MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

export function parseCsvDueDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\s+de\s+([\p{L}]+)\s+de\s+(\d{4})$/iu);

  if (match) {
    const day = Number(match[1]);
    const monthKey = match[2].toLowerCase();
    const year = Number(match[3]);
    const month = PT_MONTHS[monthKey];

    if (month !== undefined && day >= 1 && day <= 31) {
      return new Date(Date.UTC(year, month, day));
    }
  }

  const iso = new Date(trimmed);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export function formatCsvDueDate(value: Date | null | undefined): string {
  if (!value) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}
