/**
 * Telefon raqam. Bazada doim bitta ko'rinishda: "+998901234567".
 * Foydalanuvchi esa faqat 9 ta raqam kiritadi.
 */

/** "90 123 45 67", "+998901234567", "998901234567" -> "+998901234567" */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, "");

  let local: string;
  if (digits.length === 12 && digits.startsWith("998")) {
    local = digits.slice(3);
  } else if (digits.length === 9) {
    local = digits;
  } else {
    return null;
  }

  return `+998${local}`;
}

/** "+998901234567" -> "+998 90 123 45 67" */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 ? digits.slice(3) : digits;
  if (local.length !== 9) return phone;
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

/** Kiritish paytida: "901234567" -> "90 123 45 67" */
export function formatLocalWhileTyping(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  return parts.filter(Boolean).join(" ");
}
