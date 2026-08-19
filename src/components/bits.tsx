import { formatSom } from "@/lib/money";

/** Modal ichida: Jami: 4 800 000 so'm */
export function TotalLine({ total }: { total: string }) {
  return (
    <div className="rounded-xl bg-page px-4 py-3">
      <span className="text-base text-muted">Jami: </span>
      <span className="text-2xl font-bold">
        {total ? formatSom(total) : "—"}
      </span>
    </div>
  );
}

/** Ro'yxat bo'sh bo'lganda */
export function EmptyState({
  text,
  action,
}: {
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-10 text-center">
      <p className="text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Ro'yxat tepasidagi jami */
export function TotalHeader({
  label,
  amount,
  soft,
  tone,
}: {
  label: string;
  amount: string;
  soft: string;
  tone: string;
}) {
  return (
    <div className={`mb-5 rounded-xl px-5 py-4 ${soft}`}>
      <p className="text-base text-muted">{label}</p>
      <p className={`text-3xl font-bold ${tone}`}>{formatSom(amount)}</p>
    </div>
  );
}
