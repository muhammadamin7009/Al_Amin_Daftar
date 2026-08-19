"use client";

import { useState } from "react";
import { PaymentSheet } from "@/components/payment-sheet";
import { WorkSheet } from "@/components/work-sheet";
import type { PickerItem } from "@/components/item-picker";
import { SECTION } from "@/lib/sections";

type Props = {
  partyId: string;
  payType: "ishbay" | "oylik";
  rate: string;
  products: PickerItem[];
  balance: string;
  today: string;
};

export function WorkerActions({
  partyId,
  payType,
  rate,
  products,
  balance,
  today,
}: Props) {
  const [sheet, setSheet] = useState<"work" | "payment" | null>(null);

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSheet("work")}
          className="btn bg-debt text-white"
        >
          + Ish qo'shish
        </button>
        <button
          type="button"
          onClick={() => setSheet("payment")}
          className="btn bg-paid text-white"
        >
          + Pul berdim
        </button>
      </div>

      <WorkSheet
        open={sheet === "work"}
        onClose={() => setSheet(null)}
        partyId={partyId}
        payType={payType}
        rate={rate}
        products={products}
        today={today}
      />

      <PaymentSheet
        open={sheet === "payment"}
        onClose={() => setSheet(null)}
        title="Pul berdim"
        partyId={partyId}
        currentBalance={balance}
        currentLabel={SECTION.ishchi.currentLabel}
        today={today}
        askKind
        tone="paid"
      />
    </>
  );
}
