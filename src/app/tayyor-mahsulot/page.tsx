import Link from "next/link";
import { EmptyState } from "@/components/bits";
import { NewProductSheet } from "@/components/product-sheets";
import { ScreenHeader } from "@/components/screen-header";
import { TabBar } from "@/components/tab-bar";
import { listProductFolders } from "@/lib/balance";
import { formatQtyWithUnit } from "@/lib/qty";
import { PRODUCT_SECTION, PRODUCT_UNIT } from "@/lib/sections";
import { requireActiveSession } from "@/lib/session";

export default async function ProductsPage() {
  const session = await requireActiveSession();
  const folders = await listProductFolders(session.companyId);

  return (
    <main className="mx-auto max-w-md p-5 pb-32">
      <ScreenHeader title={PRODUCT_SECTION.title} backHref="/" />

      {folders.length === 0 ? (
        <EmptyState text={PRODUCT_SECTION.empty} />
      ) : (
        <ul>
          {folders.map((folder) => {
            const empty = folder.stock.isZero() || folder.stock.isNegative();

            return (
              <li key={folder.name} className="border-b border-line last:border-0">
                <Link
                  href={`${PRODUCT_SECTION.path}/papka/${encodeURIComponent(folder.name)}`}
                  className="flex min-h-[68px] items-center gap-3 py-3 active:opacity-60"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className="shrink-0 text-store"
                  >
                    <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
                  </svg>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-medium">
                      {folder.name}
                    </span>
                    <span className="block text-sm text-faint">
                      {`${folder.count} xil`}
                    </span>
                  </span>

                  <span
                    className={`num shrink-0 text-lg font-bold ${
                      empty ? "font-medium text-faint" : "text-ink"
                    }`}
                  >
                    {formatQtyWithUnit(folder.stock.toString(), PRODUCT_UNIT)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <NewProductSheet />
      <TabBar current="mahsulot" />
    </main>
  );
}
