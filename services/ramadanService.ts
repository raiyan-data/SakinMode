// Ramadan 2025: March 1 – March 30
// Ramadan 2026: February 18 – March 19
// Ramadan 2027: February 7 – March 8

export interface RamadanPeriod {
  year: number;
  start: Date;
  end: Date;
}

const RAMADAN_DATES: RamadanPeriod[] = [
  { year: 2025, start: new Date(2025, 2, 1), end: new Date(2025, 2, 30) },
  { year: 2026, start: new Date(2026, 1, 18), end: new Date(2026, 2, 19) },
  { year: 2027, start: new Date(2027, 1, 7), end: new Date(2027, 2, 8) },
];

export function isRamadan(date: Date = new Date()): boolean {
  return RAMADAN_DATES.some(
    (r) => date >= r.start && date <= r.end
  );
}

export function getRamadanDay(date: Date = new Date()): number | null {
  const period = RAMADAN_DATES.find((r) => date >= r.start && date <= r.end);
  if (!period) return null;
  const diff = Math.floor((date.getTime() - period.start.getTime()) / 86400000);
  return diff + 1;
}

export function getRamadanPeriod(date: Date = new Date()): RamadanPeriod | null {
  return RAMADAN_DATES.find((r) => date >= r.start && date <= r.end) ?? null;
}

export function getRamadanProgress(date: Date = new Date()): number {
  const period = getRamadanPeriod(date);
  if (!period) return 0;
  const total = (period.end.getTime() - period.start.getTime()) / 86400000;
  const elapsed = (date.getTime() - period.start.getTime()) / 86400000;
  return Math.min(1, elapsed / total);
}

// Quran has 30 juz — one per Ramadan day
export function getSuggestedJuz(day: number): string {
  return `Juz ${day} of 30`;
}
