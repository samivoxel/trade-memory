"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!password) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("رمز عبور اشتباه است.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <h1 className="text-center text-2xl font-bold text-white">
        حافظه معاملاتی
      </h1>

      <p className="mt-2 text-center text-zinc-400">
        برای ورود رمز عبور را وارد کنید
      </p>

      <div className="mt-8">
        <label
          htmlFor="password"
          className="mb-2 block text-sm text-zinc-300"
        >
          رمز عبور
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="رمز عبور را وارد کنید"
          autoComplete="current-password"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-white outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
