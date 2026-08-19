import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import {
  MAX_FAILURES,
  checkLock,
  clearFailures,
  recordAttempt,
} from "@/lib/login-guard";

export const PIN_COST = 12;

export type LoginUser = {
  id: string;
  companyId: string;
  name: string;
  role: "owner" | "xodim";
};

export type LoginResult =
  | { ok: true; user: LoginUser }
  | { ok: false; reason: "locked"; minutesLeft: number }
  | { ok: false; reason: "wrong"; triesLeft: number };

/**
 * Raqam bazada yo'q bo'lganda ham bcrypt vaqti sarflansin —
 * javob tezligidan "bu raqam bor ekan" degan xulosa chiqmasin.
 */
let dummyHash: string | null = null;

async function checkPin(pin: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    dummyHash ??= await bcrypt.hash("0000", PIN_COST);
    await bcrypt.compare(pin, dummyHash);
    return false;
  }
  return bcrypt.compare(pin, hash);
}

/**
 * Telefon raqam korxonani aniqlaydi: bitta raqam — bitta korxona.
 * Cookie'ga tegmaydi — shuning uchun alohida tekshirsa bo'ladi.
 */
export async function verifyLogin(
  phoneRaw: string,
  pin: string,
): Promise<LoginResult> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { ok: false, reason: "wrong", triesLeft: MAX_FAILURES };

  const lock = await checkLock(phone);
  if (lock.locked) {
    return { ok: false, reason: "locked", minutesLeft: lock.minutesLeft };
  }

  const user = await db.user.findUnique({
    where: { phone },
    select: {
      id: true,
      companyId: true,
      name: true,
      role: true,
      pinHash: true,
    },
  });

  const pinOk = await checkPin(pin, user?.pinHash ?? null);
  const ok = !!user && pinOk;

  await recordAttempt(phone, ok);

  if (!ok) {
    return {
      ok: false,
      reason: "wrong",
      triesLeft: Math.max(0, MAX_FAILURES - (lock.failures + 1)),
    };
  }

  await clearFailures(phone);
  return {
    ok: true,
    user: {
      id: user.id,
      companyId: user.companyId,
      name: user.name,
      role: user.role,
    },
  };
}
