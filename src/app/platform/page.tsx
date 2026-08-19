import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/platform-session";
import {
  TRIAL_DAYS,
  companyStatus,
  formatDay,
  type CompanyStatus,
} from "@/lib/subscription";
import { DeleteCompany, ResetPin } from "./danger";
import {
  blockCompanyAction,
  clearPaymentAction,
  extendPaymentAction,
  platformLogoutAction,
} from "@/server/platform-actions";

const TONE: Record<CompanyStatus["state"], { dot: string; text: string }> = {
  trial: { dot: "bg-plat-warn", text: "text-plat-warn" },
  paid: { dot: "bg-plat-live", text: "text-plat-live" },
  expired: { dot: "bg-plat-dead", text: "text-plat-dead" },
  blocked: { dot: "bg-plat-faint", text: "text-plat-faint" },
};

/** Muddat qancha qolganini ko'rsatuvchi ingichka chiziq */
function Meter({ percent, tone }: { percent: number; tone: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-plat-line">
      <div
        className={`h-full rounded-full ${tone}`}
        style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
      />
    </div>
  );
}

export default async function PlatformPage() {
  const admin = await requirePlatform();

  // Faqat korxonaning o'zi va nechta foydalanuvchisi bor — ichidagi
  // savdo ma'lumotlari bu yerdan ko'rinmaydi.
  const companies = await db.company.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      trialEndsAt: true,
      paidUntil: true,
      blockedAt: true,
      _count: { select: { users: true } },
    },
  });

  const now = new Date();
  const rows = companies.map((c) => ({ ...c, status: companyStatus(c, now) }));

  const stats = [
    { label: "Sinovda", value: rows.filter((r) => r.status.state === "trial").length },
    { label: "To'langan", value: rows.filter((r) => r.status.state === "paid").length },
    { label: "Muddati tugagan", value: rows.filter((r) => r.status.state === "expired").length },
    { label: "Bloklangan", value: rows.filter((r) => r.status.state === "blocked").length },
  ];

  return (
    <div className="min-h-dvh bg-plat-bg text-plat-ink">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <header className="flex items-start justify-between gap-6 border-b border-plat-line pb-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-plat-accent">
              Al Amin Daftar
            </p>
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              Korxonalar
            </h1>
          </div>

          <div className="pt-2 text-right">
            <p className="text-sm text-plat-muted">{admin.login}</p>
            <form action={platformLogoutAction}>
              <button
                type="submit"
                className="mt-1 text-sm text-plat-faint underline underline-offset-4 hover:text-plat-ink"
              >
                Chiqish
              </button>
            </form>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-plat-line bg-plat-line sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-plat-panel px-5 py-6">
              <p className="num text-3xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-plat-faint">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {rows.length === 0 ? (
          <p className="py-20 text-center text-plat-faint">Hali korxona yo'q.</p>
        ) : null}

        <ul className="mt-6 flex flex-col gap-4">
          {rows.map((row) => {
            const tone = TONE[row.status.state];
            const s = row.status;
            const daysLeft =
              s.state === "trial" || s.state === "paid" ? s.daysLeft : null;
            const span = s.state === "paid" ? 30 : TRIAL_DAYS;
            const percent = daysLeft === null ? 0 : (daysLeft / span) * 100;

            return (
              <li
                key={row.id}
                className="overflow-hidden rounded-2xl border border-plat-line bg-plat-panel"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-xl font-medium">{row.name}</p>
                      <p className="mt-0.5 text-sm text-plat-faint">
                        {`${formatDay(row.createdAt)} dan beri · ${row._count.users} foydalanuvchi`}
                      </p>
                    </div>

                    <span className="flex shrink-0 items-center gap-2 rounded-full border border-plat-line bg-plat-raise px-3 py-1.5">
                      <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                      <span className={`text-sm ${tone.text}`}>
                        {row.status.label}
                      </span>
                    </span>
                  </div>

                  {daysLeft !== null ? (
                    <div className="mt-5">
                      <Meter percent={percent} tone={tone.dot} />
                      <p className="mt-2 text-sm text-plat-muted">
                        {`${daysLeft} kun qoldi`}
                      </p>
                    </div>
                  ) : null}

                  <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-plat-faint">
                        Sinov tugaydi
                      </dt>
                      <dd className="num mt-1 text-base">
                        {formatDay(row.trialEndsAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-plat-faint">
                        To'lov muddati
                      </dt>
                      <dd className="num mt-1 text-base">
                        {formatDay(row.paidUntil)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-plat-line bg-plat-raise px-5 py-4">
                  <form action={extendPaymentAction}>
                    <input type="hidden" name="companyId" value={row.id} />
                    <input type="hidden" name="months" value="1" />
                    <button
                      type="submit"
                      className="h-11 rounded-full bg-plat-accent px-5 text-sm font-semibold text-plat-bg hover:opacity-90"
                    >
                      +1 oy to'lov
                    </button>
                  </form>

                  <form action={extendPaymentAction}>
                    <input type="hidden" name="companyId" value={row.id} />
                    <input type="hidden" name="months" value="12" />
                    <button
                      type="submit"
                      className="h-11 rounded-full border border-plat-line px-5 text-sm text-plat-ink hover:border-plat-accent"
                    >
                      +1 yil
                    </button>
                  </form>

                  <ResetPin companyId={row.id} />

                  {row.paidUntil ? (
                    <form action={clearPaymentAction}>
                      <input type="hidden" name="companyId" value={row.id} />
                      <button
                        type="submit"
                        className="h-11 rounded-full px-4 text-sm text-plat-faint hover:text-plat-ink"
                      >
                        To'lovni bekor qilish
                      </button>
                    </form>
                  ) : null}

                  <form action={blockCompanyAction} className="ml-auto">
                    <input type="hidden" name="companyId" value={row.id} />
                    <input
                      type="hidden"
                      name="on"
                      value={row.blockedAt ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className={`h-11 rounded-full px-5 text-sm ${
                        row.blockedAt
                          ? "bg-plat-live font-semibold text-plat-bg"
                          : "border border-plat-line text-plat-muted hover:border-plat-dead hover:text-plat-dead"
                      }`}
                    >
                      {row.blockedAt ? "Blokdan chiqarish" : "Bloklash"}
                    </button>
                  </form>
                </div>

                <div className="border-t border-plat-line px-5 py-3">
                  <DeleteCompany companyId={row.id} name={row.name} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
