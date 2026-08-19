import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Kind } from "@/lib/sections";

const ZERO = new Prisma.Decimal(0);

/**
 * Kassa = olingan pullar − berilgan pullar.
 * DIQQAT: elektr, ijara, benzin kabi harajatlar dasturga yozilmaydi,
 * shuning uchun bu raqam "daftarda ko'ringan pul", seyfdagi pul emas.
 */
export async function cashOnHand(companyId: string): Promise<Prisma.Decimal> {
  const [taken, given] = await Promise.all([
    db.payment.aggregate({
      where: { companyId, deletedAt: null, direction: "kirim" },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: { companyId, deletedAt: null, direction: "chiqim" },
      _sum: { amount: true },
    }),
  ]);

  return (taken._sum.amount ?? ZERO).minus(given._sum.amount ?? ZERO);
}

export type RecentParty = { id: string; name: string; kind: Kind };

/** Oxirgi yozuv kiritilgan odamlar — bosh sahifada tez ochish uchun */
export async function recentParties(
  companyId: string,
  take = 3,
): Promise<RecentParty[]> {
  const pick = {
    where: { companyId, deletedAt: null },
    orderBy: { createdAt: "desc" as const },
    take: 12,
    select: {
      createdAt: true,
      party: { select: { id: true, name: true, kind: true } },
    },
  };

  const [payments, purchases, sales, works] = await Promise.all([
    db.payment.findMany(pick),
    db.purchase.findMany(pick),
    db.sale.findMany(pick),
    db.workEntry.findMany(pick),
  ]);

  const all = [...payments, ...purchases, ...sales, ...works].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const seen = new Set<string>();
  const out: RecentParty[] = [];

  for (const row of all) {
    if (seen.has(row.party.id)) continue;
    seen.add(row.party.id);
    out.push({ id: row.party.id, name: row.party.name, kind: row.party.kind });
    if (out.length === take) break;
  }

  return out;
}

/** "Akmal aka" -> "AA" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}
