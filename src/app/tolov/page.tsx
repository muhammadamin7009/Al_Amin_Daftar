import { db } from "@/lib/db";
import { companyStatus, formatDay } from "@/lib/subscription";
import { requireSession } from "@/lib/session";
import { logoutAction } from "@/server/auth-actions";
import { redirect } from "next/navigation";
import { isActive } from "@/lib/subscription";

export default async function PaywallPage() {
  const session = await requireSession();

  const company = await db.company.findUnique({
    where: { id: session.companyId },
    select: {
      name: true,
      trialEndsAt: true,
      paidUntil: true,
      blockedAt: true,
    },
  });
  if (!company) redirect("/login");

  const status = companyStatus(company);
  if (isActive(status)) redirect("/");

  const blocked = status.state === "blocked";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-5 text-center">
      <p className="text-base text-faint">{company.name}</p>

      <h1 className="mt-2 text-2xl font-bold">
        {blocked ? "Dastur to'xtatilgan" : "Muddat tugadi"}
      </h1>

      <p className="mt-4 text-muted">
        {blocked
          ? "Korxonangiz vaqtincha to'xtatib qo'yilgan. Biz bilan bog'laning."
          : `Bir oylik bepul muddat ${formatDay(
              company.paidUntil ?? company.trialEndsAt,
            )} da tugadi. Davom etish uchun to'lov qiling.`}
      </p>

      <p className="mt-6 rounded-2xl bg-line px-4 py-4 text-base">
        Ma'lumotlaringiz joyida turibdi — hech narsa o'chmadi. To'lovdan
        keyin hamma narsa o'z holida ochiladi.
      </p>

      <form action={logoutAction} className="mt-8">
        <button type="submit" className="btn border-[1.5px] border-edge">
          Chiqish
        </button>
      </form>
    </main>
  );
}
