/**
 * OfflineBanner — shown at the top of each standalone app when offline.
 * Automatically hides 3 s after reconnection.
 */
import { useState, useEffect } from "react";
import { WifiOff, Wifi, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  isOnline: boolean;
  /** short label e.g. "Worksheet Maker" */
  appName: string;
  /** what still works offline */
  offlineCapabilities?: string;
  className?: string;
}

export default function OfflineBanner({
  isOnline,
  appName,
  offlineCapabilities = "Saved data is available offline",
  className,
}: OfflineBannerProps) {
  const [visible, setVisible] = useState(!isOnline);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setReconnected(false);
    } else if (visible) {
      // Show "back online" briefly then hide
      setReconnected(true);
      const t = setTimeout(() => {
        setVisible(false);
        setReconnected(false);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-500",
        reconnected
          ? "bg-[hsl(142,60%,35%)] text-white"
          : "bg-[hsl(38,92%,50%)] text-[hsl(213,53%,10%)]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        {reconnected ? (
          <Wifi className="h-4 w-4 shrink-0" />
        ) : (
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
        )}
        <span className="truncate">
          {reconnected
            ? `✅ Back online — ${appName} fully available`
            : `📴 Offline — ${offlineCapabilities}`}
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
