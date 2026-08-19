import { PlatformLoginForm } from "./login-form";

export default function PlatformLoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-5">
      <h1 className="mb-2 text-center text-2xl font-bold">Platforma</h1>
      <p className="mb-8 text-center text-base text-faint">
        Korxonalarni boshqarish
      </p>
      <PlatformLoginForm />
    </main>
  );
}
