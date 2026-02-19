/**
 * useOfflineApp — shared offline-detection + local persistence helpers
 * Used by all 4 standalone apps: Worksheet Maker, Spoken English, FeeDesk, AI Chat
 */
import { useState, useEffect, useCallback } from "react";

export function useOfflineApp(appKey: string) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setWasOffline(false);
    };
    const goOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Save any serialisable value to localStorage under this app's namespace
  const saveLocal = useCallback(
    <T>(key: string, value: T) => {
      try {
        localStorage.setItem(`${appKey}:${key}`, JSON.stringify(value));
      } catch {}
    },
    [appKey]
  );

  const loadLocal = useCallback(
    <T>(key: string, fallback: T): T => {
      try {
        const raw = localStorage.getItem(`${appKey}:${key}`);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    [appKey]
  );

  const removeLocal = useCallback(
    (key: string) => {
      try {
        localStorage.removeItem(`${appKey}:${key}`);
      } catch {}
    },
    [appKey]
  );

  return { isOnline, wasOffline, saveLocal, loadLocal, removeLocal };
}
