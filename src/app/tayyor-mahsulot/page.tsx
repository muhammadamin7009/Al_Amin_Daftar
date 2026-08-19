import Link from "next/link";
import { EmptyState } from "@/components/bits";
import { NewProductSheet } from "@/components/product-sheets";
import { ScreenHeader } from "@/components/screen-header";
import { listProducts } from "@/lib/balance";
import { formatQtyWithUnit } from "@/lib/qty";
import { PRODUCT_SECTION } from "@/lib/sections";
import { requireSession } from "@/lib/session";

export default async function ProductsPage() {
  const session = await requireSession();
  const products = await listProducts(session.companyId);

  return (
    <main className="mx-auto max-w-md p-5 pb-28">
      <ScreenHeader title={PRODUCT_SECTION.title} backHref="/" />

      {products.length === 0 ? (
        <EmptyState text={PRODUCT_SECTION.empty} />
      ) : (
        <ul className="card overflow-hidden">
          {products.map((product) => {
            const empty = product.stock.isZero() || product.stock.isNegative();

            return (
              <li key={product.id} className="border-b border-line last:border-0">
                <Link
                  href={`${PRODUCT_SECTION.path}/${product.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 active:bg-page"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-medium">
                      {product.name}
                    </span>
                    {product.description ? (
                      <span className="block truncate text-base text-muted">
                        {product.description}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`shrink-0 text-lg font-semibold ${
                      empty ? "text-muted" : "text-ink"
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
    </main>
  );
}
