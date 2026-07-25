"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * localStorage-backed state, hydration-safe: renders `initial` on the server,
 * loads the stored value after mount, and only persists once loaded so the
 * initial value never clobbers what's already saved.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // corrupt or inaccessible storage — fall back to the initial value
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — the app still works, just won't persist
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
