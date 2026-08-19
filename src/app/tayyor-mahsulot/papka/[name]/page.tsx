import Link from "next/link";
import { notFound } from "next/navigation";
import { NewProductSheet } from "@/components/product-sheets";
import { ScreenHeader } from "@/components/screen-header";
import { listFolderProducts } from "@/lib/balance";
import { formatQty, formatQtyWithUnit } from "@/lib/qty";
import { PRODUCT_SECTION, PRODUCT_UNIT } from "@/lib/sections";
import { requireSession } from "@/lib/session";

export default async function ProductFolderPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: raw } = await params;
  const name = decodeURIComponent(raw);

  const session = await requireSession();
  const products = await listFolderProducts(session.companyId, name);
  if (products.length === 0) notFound();

  const total = products.reduce(
    (sum, p) => sum.plus(p.stock),
    products[0].stock.minus(products[0].stock),
  );

  return (
    <main className="mx-auto max-w-md p-5 pb-16">
      <ScreenHeader
        title={name}
        backHref={PRODUCT_SECTION.path}
        subtitle={`${products.length} xil · ${formatQty(total.toString())} ${PRODUCT_UNIT} omborda`}
      />

      <ul>
        {products.map((product) => {
          const empty = product.stock.isZero() || product.stock.isNegative();

          return (
            <li key={product.id} className="border-b border-line last:border-0">
              <Link
                href={`${PRODUCT_SECTION.path}/${product.id}`}
                className="flex min-h-[64px] items-center justify-between gap-3 py-3 active:opacity-60"
              >
                <span className="min-w-0 flex-1 truncate text-lg">
                  {product.description ?? "Tavsifsiz"}
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

      <NewProductSheet defaultName={name} label="+ Shu papkaga qo'shish" />
    </main>
  );
}
