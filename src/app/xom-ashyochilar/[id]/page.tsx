import { notFound } from "next/navigation";
import { HistoryList, type HistoryRow } from "@/components/history-list";
import { ScreenHeader } from "@/components/screen-header";
import { partyBalance } from "@/lib/balance";
import { formatDate, todayISO } from "@/lib/day";
import { db } from "@/lib/db";
import { formatMoney, formatSomAbs } from "@/lib/money";
import { formatPhone } from "@/lib/phone";
import { formatQtyWithUnit } from "@/lib/qty";
import { SECTION, TONE_CLASS } from "@/lib/sections";
import { requireSession } from "@/lib/session";
import { SupplierActions } from "./supplier-actions";

const TEXT = SECTION.taminotchi;
const TONE = TONE_CLASS.debt;

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const party = await db.party.findFirst({
    where: { id, companyId: session.companyId, kind: "taminotchi" },
    select: { id: true, name: true, phone: true, openingBalance: true },
  });
  if (!party) notFound();

  const [balance, purchases, payments, materials] = await Promise.all([
    partyBalance(session.companyId, party.id, "taminotchi", party.openingBalance),
    db.purchase.findMany({
      where: { companyId: session.companyId, partyId: party.id, deletedAt: null },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        qty: true,
        total: true,
        date: true,
        note: true,
        createdAt: true,
        material: { select: { name: true, unit: true } },
      },
      take: 200,
    }),
    db.payment.findMany({
      where: {
        companyId: session.companyId,
        partyId: party.id,
        deletedAt: null,
        direction: "chiqim",
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { id: true, amount: true, date: true, note: true, createdAt: true },
      take: 200,
    }),
    db.material.findMany({
      where: { companyId: session.companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true },
    }),
  ]);

  const rows: (HistoryRow & { sortDate: string; sortAt: number })[] = [
    ...purchases.map((p) => ({
      id: p.id,
      type: "purchase" as const,
      title: `${p.material.name} · ${formatQtyWithUnit(p.qty.toString(), p.material.unit)}`,
      subtitle: p.note ? `${formatDate(p.date)} · ${p.note}` : formatDate(p.date),
      amountText: `+${formatMoney(p.total.toString())}`,
      tone: "debt" as const,
      sortDate: p.date.toISOString(),
      sortAt: p.createdAt.getTime(),
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
          {negative ? "Oldindan to'laganman" : TEXT.currentLabel}
        </p>
        <p className={`mt-1 num text-4xl font-bold tracking-tight ${TONE.text}`}>
          {formatSomAbs(balance.toString())}
        </p>
      </section>

      <SupplierActions
        partyId={party.id}
        materials={materials}
        balance={balance.toString()}
        today={todayISO()}
      />

      <h2 className="mb-3 text-lg font-semibold">Oldi-berdi tarixi</h2>
      <HistoryList rows={rows} path={`${TEXT.path}/${party.id}`} />
    </main>
  );
}
