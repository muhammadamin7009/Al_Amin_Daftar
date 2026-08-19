/**
 * Sana bilan ishlash. Hamma "bugun" hisobi Toshkent vaqti bo'yicha —
 * server UTC'da tursa ham kechqurun soat 22:00 da sana adashmasin.
 * O'zbekistonda yozgi vaqt yo'q, shuning uchun siljish doim +5 soat.
 */

const TZ_OFFSET_MS = 5 * 60 * 60 * 1000;

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toTashkent(d: Date): Date {
  return new Date(d.getTime() + TZ_OFFSET_MS);
}

function isoFromUTCParts(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Toshkent bo'yicha bugungi sana: "2026-08-17" */
export function todayISO(now: Date = new Date()): string {
  return isoFromUTCParts(toTashkent(now));
}

/**
 * Formadan kelgan "2026-08-17" -> Date.
 * `@db.Date` maydoniga UTC yarim tuni yoziladi, shunda sana siljimaydi.
 */
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  if (isoFromUTCParts(d) !== value) return null;
  return d;
}

/** `@db.Date` qiymatini ko'rsatish: "17.08.2026" */
export function formatDate(d: Date): string {
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
}

/** Yozuv Toshkent bo'yicha bugun yaratilganmi? Faqat shundagina o'chirish mumkin. */
export function isCreatedToday(createdAt: Date, now: Date = new Date()): boolean {
  return isoFromUTCParts(toTashkent(createdAt)) === todayISO(now);
}

/** Sana yaroqlimi: kelajak emas va juda eski emas */
export function isUsableDate(value: string, now: Date = new Date()): boolean {
  const parsed = parseISODate(value);
  if (!parsed) return false;
  return value <= todayISO(now) && value >= "2000-01-01";
}
