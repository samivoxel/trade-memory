"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/library", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "دریافت آرشیو ناموفق بود."
        );
      }

      setItems(result.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "ارتباط با سرور برقرار نشد."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function startEditing(item: LibraryItem) {
    setEditingId(item.id);
    setEditingDescription(item.description);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingDescription("");
  }

  async function saveDescription(id: string) {
    if (!editingDescription.trim()) {
      setError("توضیحات را وارد کنید.");
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      const response = await fetch(`/api/library/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: editingDescription.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ویرایش توضیحات ناموفق بود."
        );
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                description: result.description,
              }
            : item
        )
      );

      cancelEditing();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "ویرایش توضیحات ناموفق بود."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "تصویر و توضیحات آن برای همیشه حذف شوند؟"
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      const response = await fetch(`/api/library/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "حذف تصویر ناموفق بود."
        );
      }

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        cancelEditing();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "حذف تصویر ناموفق بود."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              آرشیو تصاویر
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              تصاویر و توضیحات ذخیره‌شده را مدیریت کنید
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white"
          >
            بازگشت
          </Link>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-900 bg-red-950 p-4 text-sm leading-7 text-red-300">
            {error}
          </p>
        )}

        {loading && (
          <p className="mt-8 text-zinc-400">
            در حال دریافت اطلاعات...
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
            هنوز تصویری ذخیره نشده است.
          </p>
        )}

        <div className="mt-8 grid gap-6">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isProcessing = processingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt="تصویر چارت ذخیره‌شده"
                    className="h-auto max-h-[620px] w-full object-contain"
                  />
                ) : (
                  <div className="flex min-h-48 items-center justify-center bg-zinc-800 text-zinc-400">
                    تصویر در دسترس نیست
                  </div>
                )}

                <div className="p-5">
                  {isEditing ? (
                    <textarea
                      rows={8}
                      value={editingDescription}
                      onChange={(event) =>
                        setEditingDescription(event.target.value)
                      }
                      disabled={isProcessing}
                      className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 p-4 leading-8 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap leading-8 text-zinc-100">
                      {item.description}
                    </p>
                  )}

                  <p className="mt-4 text-xs text-zinc-500">
                    {new Date(item.created_at).toLocaleString(
                      "fa-IR"
                    )}
                  </p>

                  <div className="mt-5 flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            saveDescription(item.id)
                          }
                          disabled={isProcessing}
                          className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-50"
                        >
                          {isProcessing
                            ? "در حال ذخیره..."
                            : "ذخیره تغییرات"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isProcessing}
                          className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 disabled:opacity-50"
                        >
                          انصراف
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          disabled={isProcessing}
                          className="flex-1 rounded-xl border border-blue-700 px-4 py-3 font-bold text-blue-300 disabled:opacity-50"
                        >
                          ویرایش توضیحات
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          disabled={isProcessing}
                          className="rounded-xl border border-red-900 px-5 py-3 font-bold text-red-400 disabled:opacity-50"
                        >
                          {isProcessing
                            ? "در حال حذف..."
                            : "حذف"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
