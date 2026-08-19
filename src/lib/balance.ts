import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Kind } from "@/lib/sections";

/**
 * Qarzlar bazada saqlanmaydi — har safar hisoblanadi.
 * Faqat deletedAt IS NULL yozuvlar kiradi.
 * Har bir so'rovda companyId filtri bor — bu xavfsizlik masalasi.
 *
 *   Ta'minotchi qarzim = opening + Σ Purchase.total   − Σ Payment(chiqim)
 *   Mijoz qarzi        = opening + Σ Sale.total       − Σ Payment(kirim)
 *   Ishchi qoldig'i    = opening + Σ WorkEntry.amount − Σ Payment(chiqim)
 *   Mahsulot qoldig'i  = Σ Production.qty − Σ Sale.qty
 */

const ZERO = new Prisma.Decimal(0);

export type PartyRow = {
  id: string;
  name: string;
  phone: string | null;
  balance: Prisma.Decimal;
  /** Ishchida: "Ishbay" yoki "Oylik" */
  subtitle: string | null;
};

function toMap<T extends { partyId: string }>(
  rows: T[],
  pick: (row: T) => Prisma.Decimal | null,
): Map<string, Prisma.Decimal> {
  const map = new Map<string, Prisma.Decimal>();
  for (const row of rows) map.set(row.partyId, pick(row) ?? ZERO);
  return map;
}

export async function listParties(
  companyId: string,
  kind: Kind,
): Promise<PartyRow[]> {
  const parties = await db.party.findMany({
    where: { companyId, kind },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      openingBalance: true,
      payType: true,
    },
  });

  if (parties.length === 0) return [];
  const partyId = { in: parties.map((p) => p.id) };

  const paymentDirection = kind === "mijoz" ? "kirim" : "chiqim";

  const [ups, payments] = await Promise.all([
    kind === "taminotchi"
      ? db.purchase
          .groupBy({
            by: ["partyId"],
            where: { companyId, deletedAt: null, partyId },
            _sum: { total: true },
          })
          .then((rows) => toMap(rows, (r) => r._sum.total))
      : kind === "mijoz"
        ? db.sale
            .groupBy({
              by: ["partyId"],
              where: { companyId, deletedAt: null, partyId },
              _sum: { total: true },
            })
            .then((rows) => toMap(rows, (r) => r._sum.total))
        : db.workEntry
            .groupBy({
              by: ["partyId"],
              where: { companyId, deletedAt: null, partyId },
              _sum: { amount: true },
            })
            .then((rows) => toMap(rows, (r) => r._sum.amount)),
    db.payment
      .groupBy({
        by: ["partyId"],
        where: {
          companyId,
          deletedAt: null,
          partyId,
          direction: paymentDirection,
        },
        _sum: { amount: true },
      })
      .then((rows) => toMap(rows, (r) => r._sum.amount)),
  ]);

  return parties.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    subtitle: p.payType ? (p.payType === "ishbay" ? "Ishbay" : "Oylik") : null,
    balance: p.openingBalance
      .plus(ups.get(p.id) ?? ZERO)
      .minus(payments.get(p.id) ?? ZERO),
  }));
}

export async function partyBalance(
  companyId: string,
  partyId: string,
  kind: Kind,
  openingBalance: Prisma.Decimal,
): Promise<Prisma.Decimal> {
  const paymentDirection = kind === "mijoz" ? "kirim" : "chiqim";

  const [up, paid] = await Promise.all([
    kind === "taminotchi"
      ? db.purchase
          .aggregate({
            where: { companyId, partyId, deletedAt: null },
            _sum: { total: true },
          })
          .then((r) => r._sum.total ?? ZERO)
      : kind === "mijoz"
        ? db.sale
            .aggregate({
              where: { companyId, partyId, deletedAt: null },
              _sum: { total: true },
            })
            .then((r) => r._sum.total ?? ZERO)
        : db.workEntry
            .aggregate({
              where: { companyId, partyId, deletedAt: null },
              _sum: { amount: true },
            })
            .then((r) => r._sum.amount ?? ZERO),
    db.payment
      .aggregate({
        where: {
          companyId,
          partyId,
          deletedAt: null,
          direction: paymentDirection,
        },
        _sum: { amount: true },
      })
      .then((r) => r._sum.amount ?? ZERO),
  ]);

  return openingBalance.plus(up).minus(paid);
}

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  price: Prisma.Decimal | null;
  stock: Prisma.Decimal;
};

export async function listProducts(companyId: string): Promise<ProductRow[]> {
  const products = await db.product.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      unit: true,
      price: true,
    },
  });

  if (products.length === 0) return [];
  const productId = { in: products.map((p) => p.id) };

  const [made, sold] = await Promise.all([
    db.production.groupBy({
      by: ["productId"],
      where: { companyId, deletedAt: null, productId },
      _sum: { qty: true },
    }),
    db.sale.groupBy({
      by: ["productId"],
      where: { companyId, deletedAt: null, productId },
      _sum: { qty: true },
    }),
  ]);

  const madeMap = new Map(made.map((r) => [r.productId, r._sum.qty ?? ZERO]));
  const soldMap = new Map(sold.map((r) => [r.productId, r._sum.qty ?? ZERO]));

  return products.map((p) => ({
    ...p,
    stock: (madeMap.get(p.id) ?? ZERO).minus(soldMap.get(p.id) ?? ZERO),
  }));
}

export async function productStock(
  companyId: string,
  productId: string,
): Promise<Prisma.Decimal> {
  const [made, sold] = await Promise.all([
    db.production.aggregate({
      where: { companyId, productId, deletedAt: null },
      _sum: { qty: true },
    }),
    db.sale.aggregate({
      where: { companyId, productId, deletedAt: null },
      _sum: { qty: true },
    }),
  ]);

  return (made._sum.qty ?? ZERO).minus(sold._sum.qty ?? ZERO);
}

/** Bosh sahifadagi uchta raqam */
export async function homeTotals(
  companyId: string,
): Promise<Record<Kind, Prisma.Decimal>> {
  const [openings, purchases, sales, works, toSuppliers, fromCustomers, toWorkers] =
    await Promise.all([
      db.party.groupBy({
        by: ["kind"],
        where: { companyId },
        _sum: { openingBalance: true },
      }),
      db.purchase.aggregate({
        where: { companyId, deletedAt: null },
        _sum: { total: true },
      }),
      db.sale.aggregate({
        where: { companyId, deletedAt: null },
        _sum: { total: true },
      }),
      db.workEntry.aggregate({
        where: { companyId, deletedAt: null },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: {
          companyId,
          deletedAt: null,
          direction: "chiqim",
          party: { kind: "taminotchi" },
        },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: {
          companyId,
          deletedAt: null,
          direction: "kirim",
          party: { kind: "mijoz" },
        },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: {
          companyId,
          deletedAt: null,
          direction: "chiqim",
          party: { kind: "ishchi" },
        },
        _sum: { amount: true },
      }),
    ]);

  const opening = (kind: Kind) =>
    openings.find((o) => o.kind === kind)?._sum.openingBalance ?? ZERO;

  return {
    taminotchi: opening("taminotchi")
      .plus(purchases._sum.total ?? ZERO)
      .minus(toSuppliers._sum.amount ?? ZERO),
    mijoz: opening("mijoz")
      .plus(sales._sum.total ?? ZERO)
      .minus(fromCustomers._sum.amount ?? ZERO),
    ishchi: opening("ishchi")
      .plus(works._sum.amount ?? ZERO)
      .minus(toWorkers._sum.amount ?? ZERO),
  };
}

export type ProductFolder = {
  name: string;
  /** Ichidagi mahsulotlar soni */
  count: number;
  /** Hammasining qoldig'i qo'shilgan holda */
  stock: Prisma.Decimal;
};

/**
 * Ombor papka ko'rinishida: nomi bir xil mahsulotlar bitta papkaga yig'iladi.
 * Papka nomi — model nomi.
 */
export async function listProductFolders(
  companyId: string,
): Promise<ProductFolder[]> {
  const products = await listProducts(companyId);

  const folders = new Map<string, ProductFolder>();
  for (const p of products) {
    const found = folders.get(p.name);
    if (found) {
      found.count += 1;
      found.stock = found.stock.plus(p.stock);
    } else {
      folders.set(p.name, { name: p.name, count: 1, stock: p.stock });
    }
  }

  return [...folders.values()].sort((a, b) => a.name.localeCompare(b.name, "uz"));
}

/** Bitta papka ichidagi mahsulotlar */
export async function listFolderProducts(
  companyId: string,
  name: string,
): Promise<ProductRow[]> {
  const products = await listProducts(companyId);
  return products.filter((p) => p.name === name);
}
