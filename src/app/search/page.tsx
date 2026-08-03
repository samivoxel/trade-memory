"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  image_url: string | null;
  description: string;
  created_at: string;
  similarity: number;
};

export default function SearchPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setResults([]);
    setStatus("");
  }

  async function handleSearch() {
    if (!image) {
      setStatus("تصویر را انتخاب کنید.");
      return;
    }

    setLoading(true);
    setResults([]);
    setStatus("در حال تحلیل و مقایسه تصویر...");

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("/api/search", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "جستجوی تصویر ناموفق بود."
        );
      }

      setResults(result.results);

      if (result.results.length === 0) {
        setStatus(
          "نمونه مشابهی در آرشیو پیدا نشد."
        );
        return;
      }

      setStatus(
        `${result.results.length} تصویر نزدیک پیدا شد.`
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "خطایی هنگام جستجوی تصویر رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              جستجوی تصویر مشابه
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              تصویر چارت فعلی را برای مقایسه انتخاب کنید
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white"
          >
            بازگشت
          </Link>
        </div>

        <div className="mt-8 space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={loading}
            className="block w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white disabled:opacity-50"
          />

          {previewUrl && (
            <div className="overflow-hidden rounded-xl border border-zinc-700 bg-black">
              <div className="border-b border-zinc-800 px-4 py-3 text-sm font-bold text-zinc-200">
                تصویر فعلی
              </div>

              <img
                src={previewUrl}
                alt="تصویر مورد جستجو"
                className="h-auto max-h-[520px] w-full object-contain"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !image}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "در حال جستجو..."
              : "پیدا کردن تصاویر مشابه"}
          </button>

          {status && (
            <p className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-sm leading-7 text-zinc-200">
              {status}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-8">
          {results.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                <span className="text-sm font-bold text-zinc-200">
                  نتیجه {index + 1}
                </span>

                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                  {item.similarity.toFixed(1)}٪ شباهت
                </span>
              </div>

              <div className="grid gap-px bg-zinc-800 md:grid-cols-2">
                <div className="bg-zinc-950">
                  <div className="border-b border-zinc-800 px-4 py-3 text-sm font-bold text-zinc-300">
                    تصویر فعلی
                  </div>

                  {previewUrl ? (
                    <div className="flex min-h-64 items-center justify-center bg-black">
                      <img
                        src={previewUrl}
                        alt="تصویر فعلی برای مقایسه"
                        className="h-auto max-h-[520px] w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-64 items-center justify-center text-zinc-500">
                      تصویر فعلی در دسترس نیست
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950">
                  <div className="border-b border-zinc-800 px-4 py-3 text-sm font-bold text-zinc-300">
                    تصویر مشابه ذخیره‌شده
                  </div>

                  {item.image_url ? (
                    <div className="flex min-h-64 items-center justify-center bg-black">
                      <img
                        src={item.image_url}
                        alt="چارت مشابه ذخیره‌شده"
                        className="h-auto max-h-[520px] w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-64 items-center justify-center text-zinc-500">
                      تصویر در دسترس نیست
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-sm font-bold text-zinc-400">
                  توضیحات نمونه ذخیره‌شده
                </h2>

                <p className="mt-3 whitespace-pre-wrap leading-8 text-zinc-100">
                  {item.description}
                </p>

                <p className="mt-4 text-xs text-zinc-500">
                  {new Date(item.created_at).toLocaleString(
                    "fa-IR"
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
