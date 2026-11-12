import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bender — terms of service",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-xl font-semibold text-zinc-950 dark:text-white">{children}</h2>;
}

export default function BenderTerms() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-zinc-950 dark:text-white">Terms of service</h1>
      <p className="text-sm text-zinc-500">Last updated: 12 November 2026</p>

      <H2>Who can use Bender</H2>
      <p>
        Bender is a personal assistant built for and used by its owner only. It is not offered
        to the public, and no one else may sign in to it or connect an account to it.
      </p>

      <H2>What it does</H2>
      <p>
        With the owner&rsquo;s permission, Bender reads their Google Calendar (read-only) to
        show and summarise their schedule. How that data is handled is described in the{" "}
        <a href="/bender/privacy" className="underline">
          privacy policy
        </a>
        .
      </p>

      <H2>No warranty</H2>
      <p>
        Bender is provided as is, without any warranty. It may show incomplete or out-of-date
        information, and it may stop working or change at any time.
      </p>

      <H2>Ending access</H2>
      <p>
        Access can be ended at any time by revoking it at{" "}
        <a className="underline" href="https://myaccount.google.com/permissions">
          myaccount.google.com/permissions
        </a>
        .
      </p>

      <H2>Changes</H2>
      <p>These terms may be updated; the date above shows the latest version.</p>
    </>
  );
}
