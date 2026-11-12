export default function BenderHome() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-zinc-950 dark:text-white">
        A personal assistant for one person
      </h1>
      <p>
        Bender is a private assistant that runs on a small home server and helps its owner
        organise the day. It is a single-user tool: it is not sold, not offered to the public,
        and only its owner signs in to it.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-zinc-950 dark:text-white">
        What it does with Google Calendar
      </h2>
      <p>
        With the owner&rsquo;s permission, Bender reads events from their Google Calendar
        (read-only access) so it can:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>show the day&rsquo;s schedule on a timeline and on a display at home,</li>
        <li>answer questions such as &ldquo;what&rsquo;s next?&rdquo; or &ldquo;am I free on Friday?&rdquo;,</li>
        <li>include upcoming meetings in a morning summary.</li>
      </ul>
      <p>
        Bender never creates, edits or deletes Google Calendar events, and it does not share
        calendar data with anyone.
      </p>

      <p className="pt-4">
        See the{" "}
        <a href="/bender/privacy" className="underline">
          privacy policy
        </a>{" "}
        for exactly what data is accessed and how it is handled.
      </p>
    </>
  );
}
