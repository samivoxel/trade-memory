"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LibraryItem = {
  id: string;
  image_path: string;
  image_url: string | null;
  description: string;
  created_at: string;
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch("/api/library", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.message ?? "خطا در دریافت آرشیو");
          return;
        }

        setItems(result.items);
      } catch {
        setError("ارتباط با سرور برقرار نشد.");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              آرشیو تصاویر
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              تمام تصاویر و توضیحات ذخیره‌شده
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white"
          >
            بازگشت
          </Link>
        </div>

        {loading && (
          <p className="mt-8 text-zinc-400">
            در حال دریافت اطلاعات...
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-xl border border-red-900 bg-red-950 p-4 text-red-300">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="mt-8 text-zinc-400">
            هنوز تصویری ذخیره نشده است.
          </p>
        )}

        <div className="mt-8 grid gap-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt="تصویر چارت ذخیره‌شده"
                  className="h-auto w-full object-contain"
                />
              ) : (
                <div className="flex min-h-48 items-center justify-center bg-zinc-800 text-zinc-400">
                  تصویر در دسترس نیست
                </div>
              )}

              <div className="p-5">
                <p className="whitespace-pre-wrap leading-8 text-zinc-100">
                  {item.description}
                </p>

                <p className="mt-4 text-xs text-zinc-500">
                  {new Date(item.created_at).toLocaleString("fa-IR")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
