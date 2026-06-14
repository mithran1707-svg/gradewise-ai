"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Calls `onSave` (debounced) whenever `data` changes, and exposes a
 * `status` flag the UI can use to render "✓ Changes saved".
 */
export function useAutoSave<T>(data: T, onSave: (data: T) => void, delay = 600) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSave(data);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1800);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return status;
}

export function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return <div className="h-5" />;
  return (
    <div className="h-5 flex items-center gap-1.5 text-xs font-medium animate-fade-up">
      {status === "saving" ? (
        <span className="text-slate-muted">Saving…</span>
      ) : (
        <span className="text-teal-deep dark:text-teal">✓ Changes saved</span>
      )}
    </div>
  );
}
