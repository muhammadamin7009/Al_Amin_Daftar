import { db } from "@/lib/db";

/**
 * 4 xonali PIN — atigi 10 000 variant. Shuning uchun:
 * 5 marta noto'g'ri -> 15 daqiqaga blok. Urinishlar bazada, telefon bo'yicha.
 */

export const MAX_FAILURES = 5;
export const WINDOW_MINUTES = 15;

export type LockState =
  | { locked: false; failures: number }
  | { locked: true; minutesLeft: number };

export async function checkLock(phone: string, now: Date = new Date()): Promise<LockState> {
  const since = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);

  const failures = await db.loginAttempt.findMany({
    where: { phone, ok: false, at: { gte: since } },
    orderBy: { at: "asc" },
    select: { at: true },
  });

  if (failures.length < MAX_FAILURES) {
    return { locked: false, failures: failures.length };
  }

  const unlockAt = new Date(failures[0].at.getTime() + WINDOW_MINUTES * 60 * 1000);
  const minutesLeft = Math.max(
    1,
    Math.ceil((unlockAt.getTime() - now.getTime()) / 60000),
  );
  return { locked: true, minutesLeft };
}

export async function recordAttempt(phone: string, ok: boolean): Promise<void> {
  await db.loginAttempt.create({ data: { phone, ok } });
}

/** Muvaffaqiyatli kirgandan keyin eski xato urinishlar hisobdan chiqadi */
export async function clearFailures(phone: string): Promise<void> {
  await db.loginAttempt.deleteMany({ where: { phone, ok: false } });
}

export function lockMessage(minutesLeft: number): string {
  return `Maxfiy raqam ko'p marta xato kiritildi. ${minutesLeft} daqiqadan keyin qayta urining.`;
}
