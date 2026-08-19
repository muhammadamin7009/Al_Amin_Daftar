import { SignJWT, jwtVerify } from "jose";

/**
 * Bu fayl `next/headers`ga tegmaydi — shuning uchun middleware (Edge) ham
 * shu yerdan foydalana oladi.
 */

export const SESSION_COOKIE = "daftar_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 kun

export type Session = {
  userId: string;
  companyId: string;
  name: string;
  role: "owner" | "xodim";
};

function sessionSecret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET .env faylida yo'q yoki 32 belgidan qisqa.");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionSecret());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const { userId, companyId, name, role } = payload as Record<string, unknown>;
    if (
      typeof userId !== "string" ||
      typeof companyId !== "string" ||
      typeof name !== "string" ||
      (role !== "owner" && role !== "xodim")
    ) {
      return null;
    }
    return { userId, companyId, name, role };
  } catch {
    return null;
  }
}

/* ---------- Platforma egasi uchun alohida sessiya ---------- */

export const PLATFORM_COOKIE = "daftar_platform";

export type PlatformSession = { adminId: string; login: string };

export async function signPlatformSession(
  session: PlatformSession,
): Promise<string> {
  return new SignJWT({ ...session, kind: "platform" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(sessionSecret());
}

/**
 * Korxona cookie'si bu yerdan o'tolmaydi: unda `kind` yo'q va `adminId` yo'q.
 * Platforma cookie'si ham korxona tekshiruvidan o'tmaydi — unda companyId yo'q.
 */
export async function verifyPlatformSession(
  token: string,
): Promise<PlatformSession | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const { adminId, login, kind } = payload as Record<string, unknown>;
    if (kind !== "platform") return null;
    if (typeof adminId !== "string" || typeof login !== "string") return null;
    return { adminId, login };
  } catch {
    return null;
  }
}
