import Link from "next/link";

type Props = {
  title: string;
  backHref: string;
  subtitle?: string;
};

export function ScreenHeader({ title, backHref, subtitle }: Props) {
  return (
    <header className="mb-5 flex items-start gap-3">
      <Link
        href={backHref}
        aria-label="Orqaga"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-line bg-paper text-2xl active:bg-page"
      >
        ‹
      </Link>
      <div className="min-w-0 pt-1">
        <h1 className="truncate text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="text-base text-muted">{subtitle}</p> : null}
      </div>
    </header>
  );
}
