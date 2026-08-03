import Link from "next/link";
import { Archive, ImagePlus, Search } from "lucide-react";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              حافظه معاملاتی
            </h1>

            <p className="mt-2 text-zinc-400">
              تصویرهای معاملاتی خود را ثبت و جستجو کنید.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-4">
          <Link
            href="/upload"
            className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-white transition hover:border-blue-500 hover:bg-zinc-800"
          >
            <ImagePlus size={24} />
            <div>
              <p className="font-bold">ثبت تصویر جدید</p>
              <p className="mt-1 text-sm text-zinc-400">
                تصویر چارت و توضیحات آن را ذخیره کنید
              </p>
            </div>
          </Link>

          <Link
            href="/search"
            className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-white transition hover:border-blue-500 hover:bg-zinc-800"
          >
            <Search size={24} />
            <div>
              <p className="font-bold">جستجوی تصویر مشابه</p>
              <p className="mt-1 text-sm text-zinc-400">
                نزدیک‌ترین چارت‌های ذخیره‌شده را پیدا کنید
              </p>
            </div>
          </Link>

          <Link
            href="/library"
            className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-white transition hover:border-blue-500 hover:bg-zinc-800"
          >
            <Archive size={24} />
            <div>
              <p className="font-bold">آرشیو تصاویر</p>
              <p className="mt-1 text-sm text-zinc-400">
                تمام تصاویر و توضیحات ذخیره‌شده را ببینید
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
