/**
 * Pul bilan ishlash. Bu yerda Prisma yo'q — client komponentlarda ham ishlaydi.
 * Summalar hamma joyda string ko'rinishida yuradi, float ishlatilmaydi.
 */

/** Guruhlar orasidagi bo'shliq — qator ko'chmasin uchun uzilmas probel */
const NBSP = "\u00A0";

/** "2400000" -> "2 400 000" */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0";

  const raw = String(value).trim();
  const negative = raw.startsWith("-");
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [wholeRaw = "", fracRaw = ""] = cleaned.split(".");

  const whole = (wholeRaw.replace(/^0+(?=\d)/, "") || "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    NBSP,
  );
  const frac = fracRaw.replace(/0+$/, "");
  const body = frac ? `${whole},${frac}` : whole;

  const isZero = /^0*$/.test(wholeRaw) && frac === "";
  return negative && !isZero ? `-${body}` : body;
}

/** "2400000" -> "2 400 000 so'm" */
export function formatSom(value: string | number | null | undefined): string {
  return `${formatMoney(value)}${NBSP}so'm`;
}

/** Manfiy ishorasiz ko'rsatish uchun */
export function formatSomAbs(value: string | number | null | undefined): string {
  return formatSom(String(value ?? "0").replace(/^-/, ""));
}

/**
 * Foydalanuvchi kiritgan matndan summa oladi.
 * "2 400 000", "2.400.000", "2400000" -> "2400000"
 * Tiyin yo'q — butun so'm.
 */
export function parseMoney(input: string | null | undefined): string {
  if (!input) return "";
  const negative = String(input).trim().startsWith("-");
  const digits = String(input).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return negative ? `-${digits}` : digits;
}

/** Kiritish paytida jonli formatlash: "2400000" -> "2 400 000" */
export function formatWhileTyping(input: string): string {
  const parsed = parseMoney(input);
  if (!parsed) return "";
  return formatMoney(parsed);
}

/** Summa yaroqlimi: musbat butun son, juda katta emas */
export function isValidAmount(value: string): boolean {
  return /^[1-9]\d{0,14}$/.test(value);
}

/** Boshlang'ich qarz manfiy ham bo'lishi mumkin */
export function isValidBalance(value: string): boolean {
  return value === "" || /^-?\d{1,15}$/.test(value);
}
