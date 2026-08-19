import Link from "next/link";
import { PRODUCT_SECTION, SECTION } from "@/lib/sections";

export type TabKey = "home" | "taminotchi" | "mijoz" | "mahsulot" | "ishchi";

const TABS: { key: TabKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Bosh" },
  { key: "taminotchi", href: SECTION.taminotchi.path, label: "Xom-ashyo" },
  { key: "mijoz", href: SECTION.mijoz.path, label: "Mijozlar" },
  { key: "mahsulot", href: PRODUCT_SECTION.path, label: "Ombor" },
  { key: "ishchi", href: SECTION.ishchi.path, label: "Ishchilar" },
];

function Icon({ tab, active }: { tab: TabKey; active: boolean }) {
  const stroke = active ? "var(--color-active)" : "var(--color-faint)";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (tab) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "taminotchi":
      return (
        <svg {...common}>
          <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3z" />
          <path d="M3 7.5 12 12l9-4.5M12 12v9" />
        </svg>
      );
    case "mijoz":
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "mahsulot":
      return (
        <svg {...common}>
          <path d="M3 8h18v11H3zM3 8l2-4h14l2 4M12 4v4" />
        </svg>
      );
    case "ishchi":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M2.5 20v-1.5A4 4 0 0 1 6.5 15h5a4 4 0 0 1 4 3.5V20" />
          <path d="M16.5 6.2a3 3 0 0 1 0 5.6M18 15h.6a4 4 0 0 1 4 3.5V20" />
        </svg>
      );
  }
}

/** Pastdagi panel — asosiy ekranlarning hammasida turadi */
export function TabBar({ current }: { current: TabKey }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-3 pb-3 pt-2">
        {TABS.map((tab) => {
          const active = tab.key === current;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 active:bg-line"
            >
              <Icon tab={tab.key} active={active} />
              <span
                className={`text-[11px] leading-none ${
                  active ? "font-semibold text-ink" : "text-faint"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
