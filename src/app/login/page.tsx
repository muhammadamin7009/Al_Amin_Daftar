import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-5">
      <h1 className="mb-8 text-center text-3xl font-bold">Al Amin Daftar</h1>
      <LoginForm />
    </main>
  );
}
