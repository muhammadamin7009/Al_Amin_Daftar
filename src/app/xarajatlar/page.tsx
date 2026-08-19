import { EmptyState, TotalHeader } from "@/components/bits";
import { HistoryList, type HistoryRow } from "@/components/history-list";
import { ScreenHeader } from "@/components/screen-header";
import { expensesTotal } from "@/lib/cash";
import { formatDate, todayISO } from "@/lib/day";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { requireSession } from "@/lib/session";
import { EXPENSE_PATH } from "@/lib/expenses";
import { ExpenseSheet } from "./expense-sheet";

export default async function ExpensesPage() {
  const session = await requireSession();

  const [total, expenses] = await Promise.all([
    expensesTotal(session.companyId),
    db.expense.findMany({
      where: { companyId: session.companyId, deletedAt: null },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, amount: true, date: true },
      take: 200,
    }),
  ]);

  const rows: HistoryRow[] = expenses.map((e) => ({
    id: e.id,
    type: "expense",
    title: e.title,
    subtitle: formatDate(e.date),
    amountText: `−${formatMoney(e.amount.toString())}`,
    tone: "debt",
  }));

  return (
    <main className="mx-auto max-w-md p-5 pb-16">
      <ScreenHeader title="Xarajatlar" backHref="/" />

      <TotalHeader
        label="Jami xarajat"
        amount={total.toString()}
        soft="bg-debt-soft"
        tone="text-debt"
      />

      <p className="mb-5 mt-3 text-base text-faint">
        Elektr, ijara, benzin — hech kimga bog'liq bo'lmagan, kassadan
        chiqib ketgan pul. Shu yerga yozilsa kassadagi raqam to'g'ri chiqadi.
      </p>

      {rows.length === 0 ? (
        <EmptyState text="Hali xarajat yozilmagan" />
      ) : (
        <HistoryList rows={rows} path={EXPENSE_PATH} />
      )}

      <ExpenseSheet today={todayISO()} />
    </main>
  );
}
