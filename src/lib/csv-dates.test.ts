import { describe, expect, it } from 'vitest';
import { formatCsvDueDate, parseCsvDueDate } from '@/lib/csv-dates';

describe('parseCsvDueDate', () => {
  it('parses Brazilian long date format', () => {
    const date = parseCsvDueDate('28 de agosto de 2026');
    expect(date?.toISOString().slice(0, 10)).toBe('2026-08-28');
  });

  it('returns null for empty values', () => {
    expect(parseCsvDueDate('')).toBeNull();
    expect(parseCsvDueDate(undefined)).toBeNull();
  });
});

describe('formatCsvDueDate', () => {
  it('formats date for CSV export', () => {
    const formatted = formatCsvDueDate(new Date('2026-08-28T00:00:00.000Z'));
    expect(formatted).toContain('2026');
    expect(formatted.toLowerCase()).toContain('agosto');
  });
});
