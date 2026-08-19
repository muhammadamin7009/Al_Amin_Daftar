/**
 * Miqdor bilan ishlash. Kilogramm va metr kasr bo'ladi (12,5 kg),
 * dona va dis butun. Bazada Decimal(18,3).
 */

const NBSP = "\u00A0";

/** Foydalanuvchi kiritgan matndan miqdor: "12,5" yoki "12.5" -> "12.5" */
export function parseQty(input: string | null | undefined): string {
  if (!input) return "";
  const cleaned = String(input).replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  const frac = rest.join("").slice(0, 3);
  const w = whole.replace(/^0+(?=\d)/, "");
  if (!w && !frac) return "";
  if (cleaned.includes(".")) return `${w || "0"}.${frac}`;
  return w;
}

/** "1200.5" -> "1 200,5" */
export function formatQty(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0";
  const raw = String(value);
  const [wholeRaw = "0", fracRaw = ""] = raw.replace(/,/g, ".").split(".");
  const whole = (wholeRaw.replace(/^0+(?=\d)/, "") || "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    NBSP,
  );
  const frac = fracRaw.replace(/0+$/, "");
  return frac ? `${whole},${frac}` : whole;
}

/** Kiritish paytida jonli ko'rsatish */
export function formatQtyWhileTyping(input: string): string {
  const parsed = parseQty(input);
  if (!parsed) return "";
  // Kasr nuqtasi endigina qo'yilgan bo'lsa uni yo'qotmaymiz
  if (parsed.endsWith(".")) return `${formatQty(parsed.slice(0, -1))},`;
  return formatQty(parsed);
}

/** Noldan katta bo'lishi shart */
export function isValidQty(value: string): boolean {
  if (!/^\d{1,12}(\.\d{1,3})?$/.test(value)) return false;
  return Number(value) > 0;
}

/** Miqdor va narxdan jami summa — faqat ekranda ko'rsatish uchun */
export function previewTotal(qty: string, price: string): string {
  if (!isValidQty(qty) || !/^\d{1,15}$/.test(price)) return "";
  const total = Number(qty) * Number(price);
  if (!Number.isFinite(total)) return "";
  return String(Math.round(total));
}

/** "45 dona", "12,5 kg" */
export function formatQtyWithUnit(
  value: string | number | null | undefined,
  unit: string,
): string {
  return `${formatQty(value)}${NBSP}${unit}`;
}
