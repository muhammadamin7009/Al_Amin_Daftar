import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { companyStatus, isActive } from "@/lib/subscription";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  type Session,
} from "@/lib/jwt";

export type { Session };

export async function startSession(session: Session): Promise<void> {
  const token = await signSession(session);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Har bir himoyalangan sahifa va server action shu yerdan boshlanadi.
 * Qaytgan `companyId` — hamma so'rovlardagi majburiy filtr.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Himoyalangan sahifalar shu yerdan boshlanadi: sessiya bor,
 * korxonaning muddati ham tugamagan bo'lishi kerak.
 */
export async function requireActiveSession(): Promise<Session> {
  const session = await requireSession();

  const company = await db.company.findUnique({
    where: { id: session.companyId },
    select: { trialEndsAt: true, paidUntil: true, blockedAt: true },
  });
  if (!company) redirect("/login");

  if (!isActive(companyStatus(company))) redirect("/tolov");

  return session;
}
