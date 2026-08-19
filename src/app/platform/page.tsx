import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/platform-session";
import { companyStatus, formatDay, type CompanyStatus } from "@/lib/subscription";
import {
  blockCompanyAction,
  clearPaymentAction,
  extendPaymentAction,
  platformLogoutAction,
} from "@/server/platform-actions";

const BADGE: Record<CompanyStatus["state"], string> = {
  paid: "bg-paid-soft text-paid",
  trial: "bg-store-soft text-store",
  expired: "bg-debt-soft text-debt",
  blocked: "bg-debt text-white",
};

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

  const counts = {
    trial: rows.filter((r) => r.status.state === "trial").length,
    paid: rows.filter((r) => r.status.state === "paid").length,
    expired: rows.filter((r) => r.status.state === "expired").length,
    blocked: rows.filter((r) => r.status.state === "blocked").length,
  };

  return (
    <main className="mx-auto max-w-3xl p-5 pb-16">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Korxonalar</h1>
          <p className="text-base text-faint">{admin.login}</p>
        </div>
        <form action={platformLogoutAction}>
          <button type="submit" className="text-base text-muted underline">
            Chiqish
          </button>
        </form>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Sinovda", counts.trial, "bg-store-soft text-store"],
          ["To'langan", counts.paid, "bg-paid-soft text-paid"],
          ["Muddati tugagan", counts.expired, "bg-debt-soft text-debt"],
          ["Bloklangan", counts.blocked, "bg-line text-ink"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className={`tile ${tone}`}>
            <p className="num text-2xl font-bold">{String(value)}</p>
            <p className="text-sm">{String(label)}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-muted">Hali korxona yo'q.</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{row.name}</p>
                <p className="text-sm text-faint">
                  {`Ro'yxatdan o'tgan: ${formatDay(row.createdAt)} · ${row._count.users} foydalanuvchi`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${BADGE[row.status.state]}`}
              >
                {row.status.label}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Sinov tugaydi</dt>
                <dd className="num">{formatDay(row.trialEndsAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">To'lov muddati</dt>
                <dd className="num">{formatDay(row.paidUntil)}</dd>
              </div>
            </dl>

            {row.status.state === "trial" || row.status.state === "paid" ? (
              <p className="mt-2 text-sm text-faint">
                {`${row.status.daysLeft} kun qoldi`}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <form action={extendPaymentAction}>
                <input type="hidden" name="companyId" value={row.id} />
                <input type="hidden" name="months" value="1" />
                <button
                  type="submit"
                  className="h-12 rounded-full bg-ink px-5 text-base font-semibold text-white"
                >
                  +1 oy to'lov
                </button>
              </form>

              <form action={extendPaymentAction}>
                <input type="hidden" name="companyId" value={row.id} />
                <input type="hidden" name="months" value="12" />
                <button
                  type="submit"
                  className="h-12 rounded-full border-[1.5px] border-edge px-5 text-base"
                >
                  +1 yil
                </button>
              </form>

              {row.paidUntil ? (
                <form action={clearPaymentAction}>
                  <input type="hidden" name="companyId" value={row.id} />
                  <button
                    type="submit"
                    className="h-12 rounded-full border-[1.5px] border-edge px-5 text-base text-muted"
                  >
                    To'lovni bekor qilish
                  </button>
                </form>
              ) : null}

              <form action={blockCompanyAction} className="ml-auto">
                <input type="hidden" name="companyId" value={row.id} />
                <input type="hidden" name="on" value={row.blockedAt ? "0" : "1"} />
                <button
                  type="submit"
                  className={`h-12 rounded-full px-5 text-base font-semibold ${
                    row.blockedAt
                      ? "bg-paid text-white"
                      : "border-[1.5px] border-debt text-debt"
                  }`}
                >
                  {row.blockedAt ? "Blokdan chiqarish" : "Bloklash"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
