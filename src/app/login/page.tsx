export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Trade Memory
        </h1>

        <p className="text-zinc-400 text-center mt-2">
          ورود به سامانه
        </p>

        <div className="mt-8">
          <label className="block text-sm text-zinc-300 mb-2">
            رمز عبور
          </label>

          <input
            type="password"
            placeholder="رمز عبور را وارد کنید"
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        <button
          className="w-full mt-6 rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 transition"
        >
          ورود
        </button>
      </div>
    </main>
  );
}
