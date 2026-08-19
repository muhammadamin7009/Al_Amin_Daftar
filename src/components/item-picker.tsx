"use client";

import { useState } from "react";
import { UNITS, type UnitValue } from "@/lib/sections";

export type PickerItem = {
  id: string;
  name: string;
  unit: string;
  /** O'ng tomonda ko'rinadi: "Omborda: 45 dona" */
  note?: string;
  /** Tanlanganda narx maydoniga o'zi qo'yiladi */
  price?: string;
};

export type PickerValue =
  | {
      mode: "existing";
      id: string;
      name: string;
      unit: string;
      note?: string;
      price?: string;
    }
  | { mode: "new"; name: string; unit: UnitValue }
  | { mode: "label"; name: string }
  | null;

/** Tanlangan narsaning o'lchov birligi */
export function pickerUnit(value: PickerValue): string | undefined {
  if (!value) return undefined;
  if (value.mode === "label") return undefined;
  return value.unit;
}

type Props = {
  /** Hidden maydon nomlari shu prefiksdan yasaladi: materialId, materialNewName... */
  name: string;
  items: PickerItem[];
  value: PickerValue;
  onChange: (value: PickerValue) => void;
  placeholder: string;
  invalid?: boolean;
  /**
   * unit  — yangi nom kiritilsa o'lchov birligi so'raladi va ro'yxatga qo'shiladi
   * label — yangi nom shunchaki matn bo'lib qoladi, hech narsa yaratilmaydi
   */
  createAs?: "unit" | "label";
};

const MAX_SHOWN = 8;

/**
 * Ro'yxatdan tanlash. Ro'yxatda yo'q bo'lsa, yozilgan matn bo'yicha
 * «Charm» qo'shish varianti chiqadi.
 */
export function ItemPicker({
  name,
  items,
  value,
  onChange,
  placeholder,
  invalid,
  createAs = "unit",
}: Props) {
  const [query, setQuery] = useState("");
  const [creatingName, setCreatingName] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? items.filter((i) => i.name.toLowerCase().includes(needle))
    : items;
  const exact = items.some((i) => i.name.toLowerCase() === needle);

  function reset() {
    onChange(null);
    setQuery("");
    setCreatingName(null);
  }

  // Tanlangan holat
  if (value) {
    const unit = pickerUnit(value);

    return (
      <div>
        {value.mode === "existing" ? (
          <input type="hidden" name={`${name}Id`} value={value.id} />
        ) : value.mode === "new" ? (
          <>
            <input type="hidden" name={`${name}NewName`} value={value.name} />
            <input type="hidden" name={`${name}NewUnit`} value={value.unit} />
          </>
        ) : (
          <input type="hidden" name={`${name}Label`} value={value.name} />
        )}

        <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border-2 border-ink bg-paper px-4">
          <span className="min-w-0 truncate text-xl">
            {value.name}
            {unit ? <span className="text-muted"> · {unit}</span> : null}
          </span>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-base text-muted underline"
          >
            O'zgartirish
          </button>
        </div>

        {value.mode === "new" ? (
          <p className="hint">Bu yangi nom — saqlanganda ro'yxatga qo'shiladi.</p>
        ) : value.mode === "existing" && value.note ? (
          <p className="hint">{value.note}</p>
        ) : null}
      </div>
    );
  }

  // Yangi nom uchun o'lchov birligi so'ralmoqda
  if (creatingName) {
    return (
      <div className="rounded-xl border-2 border-line bg-paper p-4">
        <p className="mb-3 text-base">«{creatingName}» nima bilan o'lchanadi?</p>
        <div className="grid grid-cols-4 gap-2">
          {UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => {
                onChange({ mode: "new", name: creatingName, unit });
                setCreatingName(null);
              }}
              className="min-h-14 rounded-xl border-2 border-line text-lg font-semibold active:bg-page"
            >
              {unit}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCreatingName(null)}
          className="mt-3 text-base text-muted underline"
        >
          Orqaga
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`field ${invalid ? "field-error" : ""}`}
      />

      {matches.length > 0 || (needle && !exact) ? (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl border-2 border-line bg-paper">
          {matches.slice(0, MAX_SHOWN).map((item) => (
            <li key={item.id} className="border-b border-line last:border-0">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    mode: "existing",
                    id: item.id,
                    name: item.name,
                    unit: item.unit,
                    note: item.note,
                    price: item.price,
                  })
                }
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left active:bg-page"
              >
                <span className="min-w-0 truncate text-lg">{item.name}</span>
                <span className="shrink-0 text-base text-muted">
                  {item.note ?? item.unit}
                </span>
              </button>
            </li>
          ))}

          {needle && !exact ? (
            <li className="border-t border-line">
              <button
                type="button"
                onClick={() => {
                  const trimmed = query.trim();
                  if (createAs === "label") {
                    onChange({ mode: "label", name: trimmed });
                  } else {
                    setCreatingName(trimmed);
                  }
                }}
                className="flex min-h-14 w-full items-center px-4 text-left text-lg font-semibold active:bg-page"
              >
                «{query.trim()}» {createAs === "label" ? "deb yozish" : "qo'shish"}
              </button>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="hint">
          {createAs === "label"
            ? "Yozing — ro'yxatda bo'lmasa ham bo'ladi."
            : "Yozing — ro'yxatda yo'q bo'lsa qo'shib ketasiz."}
        </p>
      )}
    </div>
  );
}
