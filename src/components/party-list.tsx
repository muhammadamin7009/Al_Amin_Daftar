"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

export type PartyListRow = {
  id: string;
  name: string;
  subtitle: string | null;
  /** Qarz — string ko'rinishida: "2400000" yoki "-500000" */
  balance: string;
};

type Props = {
  basePath: string;
  rows: PartyListRow[];
  toneClass: string;
};

/** Qidiruv faqat 10 tadan ortiq bo'lganda ko'rinadi */
const SEARCH_THRESHOLD = 10;

export function PartyList({ basePath, rows, toneClass }: Props) {
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? rows.filter((r) => r.name.toLowerCase().includes(needle))
    : rows;

  return (
    <div>
      {rows.length > SEARCH_THRESHOLD ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qidirish"
          className="field mb-3"
        />
      ) : null}

      <ul>
        {visible.map((row) => {
          const zero = /^-?0*$/.test(row.balance);
          const negative = row.balance.startsWith("-") && !zero;

          return (
            <li key={row.id} className="border-b border-line last:border-0">
              <Link
                href={`${basePath}/${row.id}`}
                className="flex min-h-[64px] items-center justify-between gap-3 py-3 active:opacity-60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg">{row.name}</span>
                  {row.subtitle ? (
                    <span className="block truncate text-sm text-faint">
                      {row.subtitle}
                    </span>
                  ) : null}
                </span>

                <span className="shrink-0 text-right">
                  <span
                    className={`num text-lg font-bold ${
                      zero ? "font-medium text-faint" : toneClass
                    }`}
                  >
                    {formatMoney(row.balance.replace(/^-/, ""))}
                  </span>
                  {negative ? (
                    <span className="block text-sm text-faint">oldindan</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-muted">Topilmadi.</p>
      ) : null}
    </div>
  );
}
