import Link from "next/link";
import { EmptyState } from "@/components/bits";
import { NewProductSheet } from "@/components/product-sheets";
import { ScreenHeader } from "@/components/screen-header";
import { listProducts } from "@/lib/balance";
import { formatQtyWithUnit } from "@/lib/qty";
import { PRODUCT_SECTION } from "@/lib/sections";
import { requireSession } from "@/lib/session";
import { TabBar } from "@/components/tab-bar";

export default async function ProductsPage() {
  const session = await requireSession();
  const products = await listProducts(session.companyId);

  return (
    <main className="mx-auto max-w-md p-5 pb-32">
      <ScreenHeader title={PRODUCT_SECTION.title} backHref="/" />

      {products.length === 0 ? (
        <EmptyState text={PRODUCT_SECTION.empty} />
      ) : (
        <ul>
          {products.map((product) => {
            const empty = product.stock.isZero() || product.stock.isNegative();

            return (
              <li key={product.id} className="border-b border-line last:border-0">
                <Link
                  href={`${PRODUCT_SECTION.path}/${product.id}`}
                  className="flex min-h-[64px] items-center justify-between gap-3 py-3 active:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-medium">
                      {product.name}
                    </span>
                    {product.description ? (
                      <span className="block truncate text-sm text-faint">
                        {product.description}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`num shrink-0 text-lg font-bold ${
                      empty ? "font-medium text-faint" : "text-ink"
                    }`}
                  >
                    {formatQtyWithUnit(product.stock.toString(), product.unit)}
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
