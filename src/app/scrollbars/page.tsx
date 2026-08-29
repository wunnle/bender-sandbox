import styles from "./scrollbars.module.css";

const SHORT = `const a = 1;
const b = 2;`;

const LONG = `export async function handleIncomingMatrixEvent(client, room, event, { retries = 3, backoffMs = 250 } = {}) {
  const body = event.getContent().body ?? "";
  if (!body.startsWith("!")) return null;
  return client.sendMessage(room.roomId, { msgtype: "m.text", body: body.slice(1).toUpperCase() });
}`;

const VARIANTS: { id: string; name: string; note: string; cls: string }[] = [
  {
    id: "native",
    name: "1. Native",
    note: "overflow-x:auto only. No ::-webkit-scrollbar rules at all — Safari's default overlay behaviour.",
    cls: styles.native,
  },
  {
    id: "thin",
    name: "2. scrollbar-width: thin",
    note: "Standard property. Safari 18.2+ supports it; older Safari ignores it and falls back to native.",
    cls: styles.thin,
  },
  {
    id: "webkit4",
    name: "3. ::-webkit-scrollbar 4px",
    note: "Classic webkit styling, 4px tall track+thumb. Turns Safari's overlay bar into a permanent one that eats layout height.",
    cls: styles.webkit4,
  },
  {
    id: "lane",
    name: "4. 10px lane / 4px thumb",
    note: "10px hit target, thumb inset with a transparent border + background-clip so it reads as 4px.",
    cls: styles.lane,
  },
  {
    id: "padded",
    name: "5. 10px lane + padding-bottom",
    note: "Same as 4, plus padding-bottom on the pre so the bar never overlaps the last line of code.",
    cls: styles.padded,
  },
  {
    id: "gutter",
    name: "6. scrollbar-gutter: stable",
    note: "Reserves the lane whether or not it scrolls. Safari support is recent — check whether short blocks gain dead space.",
    cls: styles.gutter,
  },
  {
    id: "hover",
    name: "7. Hidden until hover",
    note: "Thumb is transparent until you hover the bubble. On iOS Safari there is no hover, so this reads as fully hidden.",
    cls: styles.hover,
  },
  {
    id: "hidden",
    name: "8. Fully hidden",
    note: "::-webkit-scrollbar{display:none}. Still scrolls by drag/trackpad, but no affordance at all.",
    cls: styles.hidden,
  },
];

function Bubble({
  variant,
}: {
  variant: (typeof VARIANTS)[number];
}) {
  return (
    <div className={styles.row}>
      <div className={styles.bubble}>
        <div className={styles.meta}>
          <span className={styles.name}>{variant.name}</span>
        </div>
        <p className={styles.prose}>
          Here is the handler you asked about — it lives in the gateway, not the
          bot:
        </p>
        <pre className={`${styles.pre} ${variant.cls}`}>
          <code>{LONG}</code>
        </pre>
        <p className={styles.prose}>
          And a short one that should <em>not</em> scroll, to see if the lane is
          reserved anyway:
        </p>
        <pre className={`${styles.pre} ${variant.cls}`}>
          <code>{SHORT}</code>
        </pre>
        <p className={styles.note}>{variant.note}</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Horizontal scrollbar variants</h1>
        <p className={styles.sub}>
          Eight <code>&lt;pre&gt;</code> treatments in a chat-bubble column.
          Things to check in Safari: does the bar overlap the last line, does it
          appear at all before you scroll, is the thumb draggable at that
          height, and does a non-overflowing block reserve dead space.
        </p>
      </header>
      {VARIANTS.map((v) => (
        <Bubble key={v.id} variant={v} />
      ))}
      <footer className={styles.footer}>
        Tap-and-drag the bars, not just the code — the hit target is the point.
      </footer>
    </main>
  );
}
