import Link from "next/link";
import { homeTotals } from "@/lib/balance";
import { db } from "@/lib/db";
import { formatSomAbs } from "@/lib/money";
import { KINDS, PRODUCT_SECTION, SECTION, TONE_CLASS } from "@/lib/sections";
import { requireSession } from "@/lib/session";
import { logoutAction } from "@/server/auth-actions";

const BUTTONS = [
  { href: SECTION.taminotchi.path, label: SECTION.taminotchi.title },
  { href: SECTION.mijoz.path, label: SECTION.mijoz.title },
  { href: PRODUCT_SECTION.path, label: PRODUCT_SECTION.title },
  { href: SECTION.ishchi.path, label: SECTION.ishchi.title },
];

export default async function HomePage() {
  const session = await requireSession();

  const [company, totals] = await Promise.all([
    db.company.findUnique({
      where: { id: session.companyId },
      select: { name: true },
    }),
    homeTotals(session.companyId),
  ]);

  return (
    <main className="mx-auto max-w-md p-5 pb-12">
      <h1 className="mb-6 text-center text-2xl font-bold">{company?.name}</h1>

      <div className="flex flex-col gap-3">
        {KINDS.map((kind) => {
          const total = totals[kind];
          const tone = TONE_CLASS[SECTION[kind].tone];
          const negative = total.isNegative() && !total.isZero();

          return (
            <section key={kind} className={`rounded-xl px-5 py-4 ${tone.soft}`}>
              <p className="text-base text-muted">{SECTION[kind].homeLabel}</p>
              <p className={`text-3xl font-bold ${tone.text}`}>
                {formatSomAbs(total.toString())}
              </p>
              {negative ? (
                <p className="text-base text-muted">oldindan berilgan</p>
              ) : null}
            </section>
          );
        })}
      </div>

      <nav className="mt-8 grid grid-cols-2 gap-3">
        {BUTTONS.map((button) => (
          <Link
            key={button.href}
            href={button.href}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-line bg-paper p-3 text-center text-lg font-semibold leading-tight active:bg-page"
          >
            {button.label}
          </Link>
        ))}
      </nav>

      <form action={logoutAction} className="mt-10">
        <button type="submit" className="btn text-muted">
          Chiqish
        </button>
      </form>
    </main>
  );
}
