"use client";

import { useState } from "react";
import { PaymentSheet } from "@/components/payment-sheet";
import { PurchaseSheet } from "@/components/purchase-sheet";
import type { PickerItem } from "@/components/item-picker";
import { SECTION } from "@/lib/sections";

type Props = {
  partyId: string;
  materials: PickerItem[];
  balance: string;
  today: string;
};

export function SupplierActions({ partyId, materials, balance, today }: Props) {
  const [sheet, setSheet] = useState<"purchase" | "payment" | null>(null);

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSheet("purchase")}
          className="btn bg-debt text-white"
        >
          + Xarid qo'shish
        </button>
        <button
          type="button"
          onClick={() => setSheet("payment")}
          className="btn bg-paid text-white"
        >
          + Pul berdim
        </button>
      </div>

      <PurchaseSheet
        open={sheet === "purchase"}
        onClose={() => setSheet(null)}
        partyId={partyId}
        materials={materials}
        today={today}
      />

      <PaymentSheet
        open={sheet === "payment"}
        onClose={() => setSheet(null)}
        title="Pul berdim"
        partyId={partyId}
        currentBalance={balance}
        currentLabel={SECTION.taminotchi.currentLabel}
        today={today}
        tone="paid"
      />
    </>
  );
}
