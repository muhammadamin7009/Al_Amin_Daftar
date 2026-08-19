import { PlatformLoginForm } from "./login-form";

export default function PlatformLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-plat-bg px-5 text-plat-ink">
      <main className="w-full max-w-sm">
        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-plat-accent">
          Al Amin Daftar
        </p>
        <h1 className="mt-2 text-center font-serif text-4xl font-normal tracking-tight">
          Platforma
        </h1>
        <p className="mb-9 mt-2 text-center text-sm text-plat-faint">
          Korxonalarni boshqarish paneli
        </p>

        <div className="rounded-2xl border border-plat-line bg-plat-panel p-6">
          <PlatformLoginForm />
        </div>
      </main>
    </div>
  );
}
