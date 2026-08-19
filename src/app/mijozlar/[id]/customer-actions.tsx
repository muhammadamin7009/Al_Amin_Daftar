"use client";

import { useState } from "react";
import { PaymentSheet } from "@/components/payment-sheet";
import { SaleSheet } from "@/components/sale-sheet";
import type { PickerItem } from "@/components/item-picker";
import { SECTION } from "@/lib/sections";

type Props = {
  partyId: string;
  products: (PickerItem & { stock: string })[];
  balance: string;
  today: string;
};

export function CustomerActions({ partyId, products, balance, today }: Props) {
  const [sheet, setSheet] = useState<"sale" | "payment" | null>(null);

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSheet("sale")}
          className="btn bg-debt text-white"
        >
          + Sotuv qo'shish
        </button>
        <button
          type="button"
          onClick={() => setSheet("payment")}
          className="btn bg-paid text-white"
        >
          + Pul oldim
        </button>
      </div>

      <SaleSheet
        open={sheet === "sale"}
        onClose={() => setSheet(null)}
        partyId={partyId}
        products={products}
        today={today}
      />

      <PaymentSheet
        open={sheet === "payment"}
        onClose={() => setSheet(null)}
        title="Pul oldim"
        partyId={partyId}
        currentBalance={balance}
        currentLabel={SECTION.mijoz.currentLabel}
        today={today}
        tone="paid"
      />
    </>
  );
}
