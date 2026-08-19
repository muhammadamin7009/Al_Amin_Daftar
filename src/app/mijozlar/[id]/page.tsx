import { notFound } from "next/navigation";
import { HistoryList, type HistoryRow } from "@/components/history-list";
import { ScreenHeader } from "@/components/screen-header";
import { listProducts, partyBalance } from "@/lib/balance";
import { formatDate, todayISO } from "@/lib/day";
import { db } from "@/lib/db";
import { formatMoney, formatSomAbs } from "@/lib/money";
import { formatPhone } from "@/lib/phone";
import { formatQty, formatQtyWithUnit } from "@/lib/qty";
import { SECTION, TONE_CLASS } from "@/lib/sections";
import { requireActiveSession } from "@/lib/session";
import { CustomerActions } from "./customer-actions";

const TEXT = SECTION.mijoz;
const TONE = TONE_CLASS.paid;

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireActiveSession();

  const party = await db.party.findFirst({
    where: { id, companyId: session.companyId, kind: "mijoz" },
    select: { id: true, name: true, phone: true, openingBalance: true },
  });
  if (!party) notFound();

  const [balance, sales, payments, products] = await Promise.all([
    partyBalance(session.companyId, party.id, "mijoz", party.openingBalance),
    db.sale.findMany({
      where: { companyId: session.companyId, partyId: party.id, deletedAt: null },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        qty: true,
        total: true,
        date: true,
        note: true,
        createdAt: true,
        product: { select: { name: true, unit: true } },
      },
      take: 200,
    }),
    db.payment.findMany({
      where: {
        companyId: session.companyId,
        partyId: party.id,
        deletedAt: null,
        direction: "kirim",
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { id: true, amount: true, date: true, note: true, createdAt: true },
      take: 200,
    }),
    listProducts(session.companyId),
  ]);

  const rows: (HistoryRow & { sortDate: string; sortAt: number })[] = [
    ...sales.map((s) => ({
      id: s.id,
      type: "sale" as const,
      title: `${s.product.name} · ${formatQtyWithUnit(s.qty.toString(), s.product.unit)}`,
      subtitle: s.note ? `${formatDate(s.date)} · ${s.note}` : formatDate(s.date),
      amountText: `+${formatMoney(s.total.toString())}`,
      tone: "debt" as const,
      sortDate: s.date.toISOString(),
      sortAt: s.createdAt.getTime(),
    })),
    ...payments.map((p) => ({
      id: p.id,
      type: "payment" as const,
      title: TEXT.paymentLabel,
      subtitle: p.note ? `${formatDate(p.date)} · ${p.note}` : formatDate(p.date),
      amountText: `−${formatMoney(p.amount.toString())}`,
      tone: "paid" as const,
      sortDate: p.date.toISOString(),
      sortAt: p.createdAt.getTime(),
    })),
  ].sort((a, b) =>
    a.sortDate === b.sortDate
      ? b.sortAt - a.sortAt
      : a.sortDate < b.sortDate
        ? 1
        : -1,
  );

  const negative = balance.isNegative() && !balance.isZero();

  return (
    <main className="mx-auto max-w-md p-5 pb-12">
      <ScreenHeader
        title={party.name}
        backHref={TEXT.path}
        subtitle={party.phone ? formatPhone(party.phone) : undefined}
      />

      <section className={`mb-6 rounded-2xl px-5 py-7 text-center ${TONE.soft}`}>
        <p className="text-base text-muted">
          {negative ? "Oldindan to'lagan" : TEXT.currentLabel}
        </p>
        <p className={`mt-1 num text-4xl font-bold tracking-tight ${TONE.text}`}>
          {formatSomAbs(balance.toString())}
        </p>
      </section>

      <CustomerActions
        partyId={party.id}
        balance={balance.toString()}
        today={todayISO()}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          stock: p.stock.toString(),
          note: `Omborda: ${formatQty(p.stock.toString())} ${p.unit}`,
          price: p.price ? p.price.toString() : undefined,
        }))}
      />

      <h2 className="mb-3 text-lg font-semibold">Oldi-berdi tarixi</h2>
      <HistoryList rows={rows} path={`${TEXT.path}/${party.id}`} />
    </main>
  );
}
