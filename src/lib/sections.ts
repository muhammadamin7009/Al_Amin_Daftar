/**
 * To'rtta bo'lim. Uchtasi odamlar (Party), to'rtinchisi ombor (Product).
 * Bir joyda turgani uchun matnlar bir-biriga mos bo'ladi.
 */

export const KINDS = ["taminotchi", "mijoz", "ishchi"] as const;

export type Kind = (typeof KINDS)[number];

export function isKind(value: string): value is Kind {
  return (KINDS as readonly string[]).includes(value);
}

export const UNITS = ["par", "dona", "kg", "metr", "dis"] as const;

/** Tayyor mahsulot har doim par bilan sanaladi — tanlash so'ralmaydi */
export const PRODUCT_UNIT = "par" as const;
export type UnitValue = (typeof UNITS)[number];

export function isUnit(value: string): value is UnitValue {
  return (UNITS as readonly string[]).includes(value);
}

type SectionText = {
  path: string;
  title: string;
  /** Ro'yxat tepasidagi jami */
  totalLabel: string;
  /** Bosh sahifadagi raqam tagidagi izoh */
  homeLabel: string;
  /** Yangi odam qo'shish modali sarlavhasi */
  addTitle: string;
  empty: string;
  /** Qarzni oshiradigan amal */
  upLabel: string;
  /** Qarzni kamaytiradigan amal */
  downLabel: string;
  /** Tarixda pul harakati qanday yoziladi */
  paymentLabel: string;
  /** Qoldiq eslatmasi */
  currentLabel: string;
  tone: "debt" | "paid" | "worker";
};

export const SECTION: Record<Kind, SectionText> = {
  taminotchi: {
    path: "/xom-ashyochilar",
    title: "Xom-ashyochilar",
    totalLabel: "Jami qarzim",
    homeLabel: "Men qarzdorman",
    addTitle: "Yangi xom-ashyochi",
    empty: "Hali xom-ashyochi qo'shilmagan",
    upLabel: "Xarid qo'shish",
    downLabel: "Pul berdim",
    paymentLabel: "Pul berildi",
    currentLabel: "Hozirgi qarz",
    tone: "debt",
  },
  mijoz: {
    path: "/mijozlar",
    title: "Mijozlar",
    totalLabel: "Jami haqim",
    homeLabel: "Mendan haqdorlar",
    addTitle: "Yangi mijoz",
    empty: "Hali mijoz qo'shilmagan",
    upLabel: "Sotuv qo'shish",
    downLabel: "Pul oldim",
    paymentLabel: "Pul olindi",
    currentLabel: "Hozirgi qarzi",
    tone: "paid",
  },
  ishchi: {
    path: "/ishchilar",
    title: "Ishchilar",
    totalLabel: "Ishchilarga jami",
    homeLabel: "Ishchilarga",
    addTitle: "Yangi ishchi",
    empty: "Hali ishchi qo'shilmagan",
    upLabel: "Ish qo'shish",
    downLabel: "Pul berdim",
    paymentLabel: "Pul berildi",
    currentLabel: "Hozirgi qoldiq",
    tone: "worker",
  },
};

export const PRODUCT_SECTION = {
  path: "/tayyor-mahsulot",
  title: "Tayyor mahsulot",
  addTitle: "Yangi model",
  empty: "Hali mahsulot qo'shilmagan",
  upLabel: "Ishlab chiqarildi",
};

/** Matn ranglari: mening qarzim qizil, menga qarz yashil */
export const TONE_CLASS = {
  debt: { text: "text-debt", soft: "bg-debt-soft", solid: "bg-debt" },
  paid: { text: "text-paid", soft: "bg-paid-soft", solid: "bg-paid" },
  worker: { text: "text-worker", soft: "bg-worker-soft", solid: "bg-worker" },
} as const;
