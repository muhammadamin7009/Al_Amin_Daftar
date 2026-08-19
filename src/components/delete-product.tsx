"use client";

import { useState } from "react";
import { deleteProductAction } from "@/server/product-actions";

/**
 * Modelni o'chirish. Bir bosishda ketmasin — avval so'raydi.
 * Yozuvlar qolgani ham aytiladi, foydalanuvchi nima bo'lishini bilsin.
 */
export function DeleteProduct({
  productId,
  recordCount,
}: {
  productId: string;
  recordCount: number;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="btn mt-10 text-debt"
      >
        Modelni o'chirish
      </button>
    );
  }

  return (
    <div className="mt-10 rounded-2xl bg-debt-soft p-4">
      <p className="text-base">
        Bu model ro'yxatdan olib tashlanadi.
        {recordCount > 0
          ? ` ${recordCount} ta yozuv o'z joyida qoladi — sotuv tarixi buzilmaydi.`
          : ""}
      </p>

      <div className="mt-4 flex gap-2">
        <form action={deleteProductAction} className="flex-1">
          <input type="hidden" name="productId" value={productId} />
          <button type="submit" className="btn bg-debt text-white">
            Ha, o'chir
          </button>
        </form>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="btn flex-1 border-[1.5px] border-edge"
        >
          Yo'q
        </button>
      </div>
    </div>
  );
}
