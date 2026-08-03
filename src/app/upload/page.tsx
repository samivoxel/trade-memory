"use client";

import { useState } from "react";

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!image) {
      alert("تصویر را انتخاب کنید.");
      return;
    }

    if (!description.trim()) {
      alert("توضیحات را وارد کنید.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setLoading(false);

    if (!result.success) {
      alert(result.message ?? "خطا");
      return;
    }

    alert("با موفقیت ذخیره شد.");

    setImage(null);
    setDescription("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-white">
          ثبت تصویر جدید
        </h1>

        <div className="mt-8 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
          />

          <textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات مربوط به این چارت را وارد کنید..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </div>
    </main>
  );
}
