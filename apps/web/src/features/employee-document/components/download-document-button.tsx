"use client";

import { useRef, useState } from "react";
import { actionFeedback } from "@/lib/action-feedback";

export function DownloadDocumentButton({ documentId }: { documentId: string }) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const download = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      await actionFeedback(async () => {
        const response = await fetch(`/api/employee-documents/${encodeURIComponent(documentId)}/download`);
        if (!response.ok) throw new Error("Download request failed");
        const blob = await response.blob();
        if (!blob.size || /json|text\/html/i.test(blob.type)) throw new Error("Invalid download response");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers.get("content-disposition") ?? "";
        const filename = disposition.match(/filename="([^"\r\n]+)"/i)?.[1];
        link.href = url;
        link.download = filename?.replace(/[\\/]/g, "_") ?? "document";
        document.body.appendChild(link);
        try { link.click(); } finally {
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        }
      }, { loading: "Preparing download...", success: "Download started.", error: "Unable to download this document. Please try again." });
    } catch {
      // Request feedback is owned here; there is no navigation on failure.
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return <button type="button" onClick={download} disabled={pending}
    className="rounded-md border border-border-strong px-3 py-1.5 font-medium hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50">
    {pending ? "Preparing..." : "Download"}
  </button>;
}
