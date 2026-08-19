import { notFound } from "next/navigation";
import { HistoryList, type HistoryRow } from "@/components/history-list";
import { DeleteProduct } from "@/components/delete-product";
import { ProductionSheet } from "@/components/product-sheets";
import { ScreenHeader } from "@/components/screen-header";
import { productStock } from "@/lib/balance";
import { formatDate, todayISO } from "@/lib/day";
import { db } from "@/lib/db";
import { formatQty, formatQtyWithUnit } from "@/lib/qty";
import { PRODUCT_SECTION } from "@/lib/sections";
import { requireActiveSession } from "@/lib/session";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireActiveSession();

  const product = await db.product.findFirst({
    where: { id, companyId: session.companyId, deletedAt: null },
    select: { id: true, name: true, description: true, unit: true },
  });
  if (!product) notFound();

  const [stock, productions, sales, workers] = await Promise.all([
    productStock(session.companyId, product.id),
    db.production.findMany({
      where: {
        companyId: session.companyId,
        productId: product.id,
        deletedAt: null,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        qty: true,
        date: true,
        createdAt: true,
        worker: { select: { name: true } },
      },
      take: 200,
    }),
    db.sale.findMany({
      where: {
        companyId: session.companyId,
        productId: product.id,
        deletedAt: null,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        qty: true,
        date: true,
        createdAt: true,
        party: { select: { name: true } },
      },
      take: 200,
    }),
    db.party.findMany({
      where: { companyId: session.companyId, kind: "ishchi" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: (HistoryRow & { sortDate: string; sortAt: number })[] = [
    ...productions.map((p) => ({
      id: p.id,
      type: "production" as const,
      title: `Ishlab chiqarildi${p.worker ? ` · ${p.worker.name}` : ""}`,
      subtitle: formatDate(p.date),
      amountText: `+${formatQty(p.qty.toString())}`,
      tone: "paid" as const,
      sortDate: p.date.toISOString(),
      sortAt: p.createdAt.getTime(),
    })),
    ...sales.map((s) => ({
      id: s.id,
      type: "sale" as const,
      title: `Sotildi · ${s.party.name}`,
      subtitle: formatDate(s.date),
      amountText: `−${formatQty(s.qty.toString())}`,
      tone: "debt" as const,
      sortDate: s.date.toISOString(),
      sortAt: s.createdAt.getTime(),
    })),
  ].sort((a, b) =>
    a.sortDate === b.sortDate
      ? b.sortAt - a.sortAt
      : a.sortDate < b.sortDate
        ? 1
        : -1,
  );

  const empty = stock.isZero() || stock.isNegative();

  return (
    <main className="mx-auto max-w-md p-5 pb-12">
      <ScreenHeader
        title={product.name}
        backHref={PRODUCT_SECTION.path}
        subtitle={product.description ?? undefined}
      />

      <section className="mb-6 rounded-2xl bg-store-soft px-5 py-7 text-center">
        <p className="text-base text-muted">Omborda</p>
        <p
          className={`mt-1 num text-4xl font-bold tracking-tight ${empty ? "text-muted" : "text-ink"}`}
        >
          {formatQtyWithUnit(stock.toString(), product.unit)}
        </p>
      </section>

      <ProductionSheet
        productId={product.id}
        unit={product.unit}
        workers={workers}
        today={todayISO()}
      />

      <h2 className="mb-3 text-lg font-semibold">Tarix</h2>
      <HistoryList rows={rows} path={`${PRODUCT_SECTION.path}/${product.id}`} />

      <DeleteProduct productId={product.id} recordCount={rows.length} />
    </main>
  );
}
