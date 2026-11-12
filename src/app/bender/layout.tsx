import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bender — personal assistant",
  description:
    "Bender is a private, single-user assistant that reads its owner's calendar to plan the day.",
};

export default function BenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 font-sans text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <div className="w-full max-w-2xl">
        <header className="mb-10 flex items-baseline justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <Link href="/bender" className="text-xl font-semibold text-zinc-950 dark:text-white">
            Bender
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/bender" className="hover:underline">
              Home
            </Link>
            <Link href="/bender/privacy" className="hover:underline">
              Privacy policy
            </Link>
            <Link href="/bender/terms" className="hover:underline">
              Terms
            </Link>
          </nav>
        </header>
        <main className="space-y-5 leading-7">{children}</main>
        <footer className="mt-16 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800">
          Bender is a personal project at kafagoz.com. It is not offered to the public.
        </footer>
      </div>
    </div>
  );
}
