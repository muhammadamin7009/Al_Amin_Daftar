import { Prisma } from "@prisma/client";
import { EmptyState, TotalHeader } from "@/components/bits";
import { NewPartySheet } from "@/components/new-party-sheet";
import { PartyList } from "@/components/party-list";
import { ScreenHeader } from "@/components/screen-header";
import { listParties } from "@/lib/balance";
import { SECTION, TONE_CLASS } from "@/lib/sections";
import { requireSession } from "@/lib/session";
import { TabBar } from "@/components/tab-bar";

const TEXT = SECTION.ishchi;
const TONE = TONE_CLASS.worker;

export default async function WorkersPage() {
  const session = await requireSession();
  const parties = await listParties(session.companyId, "ishchi");

  const total = parties.reduce(
    (sum, p) => sum.plus(p.balance),
    new Prisma.Decimal(0),
  );

  return (
    <main className="mx-auto max-w-md p-5 pb-32">
      <ScreenHeader title={TEXT.title} backHref="/" />

      <TotalHeader
        label={TEXT.totalLabel}
        amount={total.toString()}
        soft={TONE.soft}
        tone={TONE.text}
      />

      {parties.length === 0 ? (
        <EmptyState text={TEXT.empty} />
      ) : (
        <PartyList
          basePath={TEXT.path}
          toneClass={TONE.text}
          rows={parties.map((p) => ({
            id: p.id,
            name: p.name,
            subtitle: p.subtitle,
            balance: p.balance.toString(),
          }))}
        />
      )}

      <NewPartySheet kind="ishchi" />
      <TabBar current="ishchi" />
    </main>
  );
}
