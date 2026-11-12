import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bender — privacy policy",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-xl font-semibold text-zinc-950 dark:text-white">{children}</h2>;
}

export default function BenderPrivacy() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-zinc-950 dark:text-white">Privacy policy</h1>
      <p className="text-sm text-zinc-500">Last updated: 12 November 2026</p>

      <p>
        Bender is a personal assistant used by a single person, its owner, on their own home
        server. This policy explains what Bender does with data from Google accounts it is
        connected to.
      </p>

      <H2>Data accessed</H2>
      <p>
        Bender requests one Google permission:{" "}
        <code className="rounded bg-zinc-200 px-1 text-sm dark:bg-zinc-800">calendar.readonly</code>
        . With it, Bender reads calendar events (title, time, location, description and
        attendees) from the calendars of the account that granted access. It does not access
        Gmail, Drive, contacts or any other Google data, and it cannot change the calendar.
      </p>

      <H2>How the data is used</H2>
      <p>
        Calendar events are used only to show the owner their own schedule, answer their
        questions about it, and include it in their daily summaries. Data is not used for
        advertising, profiling, or training of machine-learning models, and it is not sold.
      </p>

      <H2>Storage</H2>
      <p>
        The OAuth token and a short-lived cache of upcoming events are stored on the owner&rsquo;s
        private home server. The cache is refreshed regularly and old entries are overwritten.
        No calendar data is stored on any public server.
      </p>

      <H2>Sharing</H2>
      <p>
        Calendar data is not shared with or transferred to third parties. To answer a question
        the owner asks, the relevant events may be passed to the AI model provider that powers
        the assistant, solely to produce that answer, under that provider&rsquo;s API terms.
      </p>

      <H2>Google API Services User Data Policy</H2>
      <p>
        Bender&rsquo;s use and transfer of information received from Google APIs adheres to the{" "}
        <a
          className="underline"
          href="https://developers.google.com/terms/api-services-user-data-policy"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <H2>Revoking access and deleting data</H2>
      <p>
        Access can be revoked at any time from{" "}
        <a className="underline" href="https://myaccount.google.com/permissions">
          myaccount.google.com/permissions
        </a>
        . Once access is revoked, Bender can no longer read the calendar, and the stored token
        and cached events are deleted.
      </p>

      <H2>Contact</H2>
      <p>
        Questions about this policy can be sent to the support email address shown on the
        app&rsquo;s Google sign-in screen.
      </p>
    </>
  );
}
