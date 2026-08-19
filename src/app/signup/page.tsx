import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-5">
      <h1 className="mb-2 text-center text-3xl font-bold">Al Amin Daftar</h1>
      <p className="mb-8 text-center text-base text-muted">
        Korxonangizni ro'yxatdan o'tkazing
      </p>
      <SignupForm />
    </main>
  );
}
