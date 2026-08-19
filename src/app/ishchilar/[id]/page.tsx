import { notFound } from "next/navigation";
import { HistoryList, type HistoryRow } from "@/components/history-list";
import { ScreenHeader } from "@/components/screen-header";
import { partyBalance } from "@/lib/balance";
import { formatDate, todayISO } from "@/lib/day";
import { db } from "@/lib/db";
import { formatMoney, formatSomAbs } from "@/lib/money";
import { formatQtyWithUnit } from "@/lib/qty";
import { SECTION, TONE_CLASS } from "@/lib/sections";
import { requireActiveSession } from "@/lib/session";
import { WorkerActions } from "./worker-actions";

const TEXT = SECTION.ishchi;
const TONE = TONE_CLASS.worker;

export default async function WorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireActiveSession();

  const party = await db.party.findFirst({
    where: { id, companyId: session.companyId, kind: "ishchi" },
    select: {
      id: true,
      name: true,
      phone: true,
      openingBalance: true,
      payType: true,
      rate: true,
    },
  });
  if (!party) notFound();

  const payType = party.payType ?? "ishbay";

  const [balance, works, payments, products] = await Promise.all([
    partyBalance(session.companyId, party.id, "ishchi", party.openingBalance),
    db.workEntry.findMany({
      where: { companyId: session.companyId, partyId: party.id, deletedAt: null },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        qty: true,
        amount: true,
        label: true,
        date: true,
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
        direction: "chiqim",
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        amount: true,
        kind: true,
        date: true,
        note: true,
        createdAt: true,
      },
      take: 200,
    }),
    db.product.findMany({
      where: { companyId: session.companyId, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true },
    }),
  ]);

  const rows: (HistoryRow & { sortDate: string; sortAt: number })[] = [
    ...works.map((w) => {
      const what = w.product?.name ?? w.label ?? "Ish";
      const unit = w.product?.unit ?? "dona";
      const title =
        payType === "oylik"
          ? what
          : `${what} · ${formatQtyWithUnit(w.qty.toString(), unit)}`;

      return {
        id: w.id,
        type: "work" as const,
        title,
        subtitle: formatDate(w.date),
        amountText: `+${formatMoney(w.amount.toString())}`,
        tone: "debt" as const,
        sortDate: w.date.toISOString(),
        sortAt: w.createdAt.getTime(),
      };
    }),
    ...payments.map((p) => ({
      id: p.id,
      type: "payment" as const,
      title: p.kind === "avans" ? "Avans berildi" : TEXT.paymentLabel,
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
        subtitle={payType === "oylik" ? "Oylik" : "Ishbay"}
      />

      <section className={`mb-6 rounded-2xl px-5 py-7 text-center ${TONE.soft}`}>
        <p className="text-base text-muted">
          {negative ? "Ortiqcha berilgan" : TEXT.currentLabel}
        </p>
        <p className={`mt-1 num text-4xl font-bold tracking-tight ${TONE.text}`}>
          {formatSomAbs(balance.toString())}
        </p>
      </section>

      <WorkerActions
        partyId={party.id}
        payType={payType}
        rate={party.rate ? party.rate.toString() : ""}
        products={products}
        balance={balance.toString()}
        today={todayISO()}
      />

      <h2 className="mb-3 text-lg font-semibold">Oldi-berdi tarixi</h2>
      <HistoryList rows={rows} path={`${TEXT.path}/${party.id}`} />
    </main>
  );
}
