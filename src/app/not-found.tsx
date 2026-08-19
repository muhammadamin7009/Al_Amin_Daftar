import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-5 text-center">
      <p className="text-xl font-semibold">Bu sahifa topilmadi</p>
      <p className="mt-2 text-muted">
        Balki o'chirilgan yoki hali tayyor emas.
      </p>
      <Link href="/" className="btn mt-8 border-2 border-line bg-paper">
        Bosh sahifaga
      </Link>
    </main>
  );
}
