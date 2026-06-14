"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppData, Subject } from "./types";
import { getSession, loadData, saveData, SessionUser } from "./storage";

export function useSession(requireAuth = true) {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null | "loading">("loading");
  const [data, setDataState] = useState<AppData | null>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s) {
      setDataState(loadData(s.uid));
    } else if (requireAuth) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    (next: AppData) => {
      setDataState(next);
      if (session && session !== "loading") {
        saveData(session.uid, next);
      }
    },
    [session]
  );

  const updateSubjects = useCallback(
    (updater: (subjects: Subject[]) => Subject[]) => {
      setDataState((prev) => {
        if (!prev) return prev;
        const next = { ...prev, subjects: updater(prev.subjects) };
        if (session && session !== "loading") {
          saveData(session.uid, next);
        }
        return next;
      });
    },
    [session]
  );

  return {
    session: session === "loading" ? null : session,
    loading: session === "loading",
    data: data,
    setData: persist,
    updateSubjects,
  };
}
