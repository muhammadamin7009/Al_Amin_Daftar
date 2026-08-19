import { ScreenHeader } from "@/components/screen-header";
import { db } from "@/lib/db";
import { formatPhone } from "@/lib/phone";
import { requireActiveSession } from "@/lib/session";
import { logoutAction } from "@/server/auth-actions";
import { removeUserAction } from "@/server/settings-actions";
import { AddUser, ChangePin, RenameCompany } from "./settings-forms";

export default async function SettingsPage() {
  const session = await requireActiveSession();

  const [company, users] = await Promise.all([
    db.company.findUnique({
      where: { id: session.companyId },
      select: { name: true },
    }),
    db.user.findMany({
      where: { companyId: session.companyId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: { id: true, name: true, phone: true, role: true },
    }),
  ]);

  const owner = session.role === "owner";

  return (
    <main className="mx-auto max-w-md p-5 pb-16">
      <ScreenHeader title="Sozlamalar" backHref="/" />

      {owner ? (
        <RenameCompany current={company?.name ?? ""} />
      ) : (
        <div className="row">
          <span>
            <span className="block text-lg">Korxona nomi</span>
            <span className="block text-sm text-faint">{company?.name}</span>
          </span>
        </div>
      )}

      <ChangePin />

      <h2 className="mb-1 mt-8 text-lg font-semibold">Xodimlar</h2>
      <p className="mb-2 text-base text-faint">
        Xodim ham xuddi shu telefon va maxfiy raqam bilan kiradi.
      </p>

      <ul>
        {users.map((user) => (
          <li key={user.id} className="row">
            <span className="min-w-0">
              <span className="block truncate text-lg">{user.name}</span>
              <span className="block text-sm text-faint">
                {formatPhone(user.phone)}
                {user.role === "owner" ? " · rahbar" : ""}
              </span>
            </span>

            {owner && user.role === "xodim" ? (
              <form action={removeUserAction} className="shrink-0">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className="h-12 rounded-full border-[1.5px] border-edge px-4 text-base text-muted"
                >
                  O'chirish
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      {owner ? <AddUser /> : null}

      <form action={logoutAction} className="mt-10">
        <button
          type="submit"
          className="btn border-[1.5px] border-edge text-debt"
        >
          Dasturdan chiqish
        </button>
      </form>
    </main>
  );
}
