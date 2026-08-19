import Link from "next/link";

type Props = {
  title: string;
  backHref: string;
  subtitle?: string;
};

export function ScreenHeader({ title, backHref, subtitle }: Props) {
  return (
    <header className="mb-4 flex items-center gap-2">
      <Link
        href={backHref}
        aria-label="Orqaga"
        className="-ml-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-faint active:bg-line"
      >
        ‹
      </Link>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="truncate text-base text-faint">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
