/**
 * Korxonaning holati: bir oy bepul sinov, keyin to'lov.
 * Platformadan bloklash ham shu yerda tekshiriladi.
 */

export const TRIAL_DAYS = 30;

export type CompanyDates = {
  trialEndsAt: Date | null;
  paidUntil: Date | null;
  blockedAt: Date | null;
};

export type CompanyStatus =
  | { state: "blocked"; label: string }
  | { state: "paid"; label: string; until: Date; daysLeft: number }
  | { state: "trial"; label: string; until: Date; daysLeft: number }
  | { state: "expired"; label: string; since: Date | null };

/** Sinov muddati: ro'yxatdan o'tgan kundan +30 kun */
export function trialEnd(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function companyStatus(
  company: CompanyDates,
  now: Date = new Date(),
): CompanyStatus {
  if (company.blockedAt) {
    return { state: "blocked", label: "Bloklangan" };
  }

  if (company.paidUntil && company.paidUntil > now) {
    return {
      state: "paid",
      label: "To'langan",
      until: company.paidUntil,
      daysLeft: daysBetween(now, company.paidUntil),
    };
  }

  if (company.trialEndsAt && company.trialEndsAt > now) {
    return {
      state: "trial",
      label: "Sinov muddati",
      until: company.trialEndsAt,
      daysLeft: daysBetween(now, company.trialEndsAt),
    };
  }

  return {
    state: "expired",
    label: "Muddati tugagan",
    since: company.paidUntil ?? company.trialEndsAt,
  };
}

/** Dasturdan foydalana oladimi */
export function isActive(status: CompanyStatus): boolean {
  return status.state === "trial" || status.state === "paid";
}

/** "18.09.2026" */
export function formatDay(date: Date | null): string {
  if (!date) return "—";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${date.getFullYear()}`;
}
