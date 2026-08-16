"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrPage() {
  const [text, setText] = useState("https://sandbox.kafagoz.com/qr");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!text) {
      setDataUrl("");
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(text, { width: 512, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          QR code
        </h1>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type anything…"
          autoFocus
          className="w-full rounded-xl border border-black/[.12] bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black/40 dark:border-white/[.18] dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-white/50"
        />

        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-white">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="QR code" className="h-full w-full" />
          ) : (
            <p className="text-sm text-zinc-400">
              {text ? "Text too long to encode" : "Type something to get a QR code"}
            </p>
          )}
        </div>

        {dataUrl && (
          <a
            href={dataUrl}
            download="qr.png"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
          >
            Download PNG
          </a>
        )}
      </main>
    </div>
  );
}
