import Link from "next/link";
import { homeTotals, listProducts } from "@/lib/balance";
import { cashOnHand, initials, recentParties } from "@/lib/cash";
import { db } from "@/lib/db";
import { formatMoney, formatSomAbs } from "@/lib/money";
import { PRODUCT_SECTION, SECTION } from "@/lib/sections";
import { requireSession } from "@/lib/session";
import { TabBar } from "@/components/tab-bar";

const AVATAR_BG = ["bg-debt-soft", "bg-paid-soft", "bg-store-soft"];

export default async function HomePage() {
  const session = await requireSession();

  const [company, totals, cash, products, recent] = await Promise.all([
    db.company.findUnique({
      where: { id: session.companyId },
      select: { name: true },
    }),
    homeTotals(session.companyId),
    cashOnHand(session.companyId),
    listProducts(session.companyId),
    recentParties(session.companyId),
  ]);

  const stock = products.reduce(
    (acc, p) => acc + (p.stock.isPositive() ? 1 : 0),
    0,
  );
  const stockLine = products.length
    ? `${products.length} model · ${stock} tasi omborda`
    : "Hali model qo'shilmagan";

  const tiles = [
    {
      href: SECTION.taminotchi.path,
      title: SECTION.taminotchi.title,
      caption: "Qarzim",
      value: formatSomAbs(totals.taminotchi.toString()),
      valueClass: "text-debt",
      bg: "bg-debt-soft",
      icon: (
        <>
          <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3z" />
          <path d="M3 7.5 12 12l9-4.5M12 12v9" />
        </>
      ),
    },
    {
      href: SECTION.mijoz.path,
      title: SECTION.mijoz.title,
      caption: "Haqim",
      value: formatSomAbs(totals.mijoz.toString()),
      valueClass: "text-paid",
      bg: "bg-paid-soft",
      icon: (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      ),
    },
    {
      href: PRODUCT_SECTION.path,
      title: PRODUCT_SECTION.title,
      caption: "Omborda",
      value: stockLine,
      valueClass: "text-store",
      bg: "bg-store-soft",
      icon: <path d="M3 8h18v11H3zM3 8l2-4h14l2 4M12 4v4" />,
    },
    {
      href: SECTION.ishchi.path,
      title: SECTION.ishchi.title,
      caption: "Berilishi kerak",
      value: formatSomAbs(totals.ishchi.toString()),
      valueClass: "text-worker",
      bg: "bg-worker-soft",
      icon: (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M2.5 20v-1.5A4 4 0 0 1 6.5 15h5a4 4 0 0 1 4 3.5V20" />
          <path d="M16.5 6.2a3 3 0 0 1 0 5.6M18 15h.6a4 4 0 0 1 4 3.5V20" />
        </>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-4">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base text-muted">Salom,</p>
          <p className="truncate text-lg font-semibold">{company?.name}</p>
        </div>

        <Link
          href="/sozlamalar"
          aria-label="Sozlamalar"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full active:bg-line"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
          </svg>
        </Link>
      </header>

      <p className="num mt-2 text-4xl font-bold tracking-tight">
        {formatMoney(cash.toString())}
      </p>

      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-line px-3 py-1.5">
        <span className="h-4 w-4 rounded-full bg-paid" />
        <span className="text-base text-muted">Kassada, so'm</span>
      </div>
      <p className="mt-2 text-base text-faint">
        Bu — daftarga yozilgan pul. Elektr, ijara kabi harajatlar bunga kirmaydi.
      </p>

      <p className="mb-3 mt-7 text-base text-faint">Bo'limlar</p>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`tile flex min-h-[132px] flex-col active:translate-y-px ${tile.bg}`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-5"
            >
              {tile.icon}
            </svg>
            <span className="text-base font-semibold leading-tight">
              {tile.title}
            </span>
            <span className="mt-1 text-sm text-muted">{tile.caption}</span>
            <span className={`num text-sm font-semibold ${tile.valueClass}`}>
              {tile.value}
            </span>
          </Link>
        ))}
      </div>

      {recent.length > 0 ? (
        <>
          <p className="mb-3 mt-7 text-base text-faint">Oxirgi yozganlaringiz</p>
          <div className="flex gap-4">
            {recent.map((party, i) => (
              <Link
                key={party.id}
                href={`${SECTION[party.kind].path}/${party.id}`}
                className="w-16 text-center"
              >
                <span
                  className={`mx-auto mb-1.5 flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${
                    AVATAR_BG[i % AVATAR_BG.length]
                  }`}
                >
                  {initials(party.name)}
                </span>
                <span className="block truncate text-sm text-muted">
                  {party.name}
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <TabBar current="home" />
    </main>
  );
}
