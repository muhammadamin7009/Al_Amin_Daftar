import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PLATFORM_COOKIE,
  signPlatformSession,
  verifyPlatformSession,
  type PlatformSession,
} from "@/lib/jwt";

const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 soat

export async function startPlatformSession(
  session: PlatformSession,
): Promise<void> {
  const token = await signPlatformSession(session);
  const jar = await cookies();
  jar.set(PLATFORM_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endPlatformSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(PLATFORM_COOKIE);
}

export async function getPlatformSession(): Promise<PlatformSession | null> {
  const jar = await cookies();
  const token = jar.get(PLATFORM_COOKIE)?.value;
  if (!token) return null;
  return verifyPlatformSession(token);
}

export async function requirePlatform(): Promise<PlatformSession> {
  const session = await getPlatformSession();
  if (!session) redirect("/platform/login");
  return session;
}
