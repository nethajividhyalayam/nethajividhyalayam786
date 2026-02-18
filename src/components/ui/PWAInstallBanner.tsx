import { useState, useEffect } from "react";
import { Download, X, Smartphone, Wifi } from "lucide-react";

interface PWAInstallBannerProps {
  appName: string;
  appEmoji: string;
  appColor: string; // tailwind gradient classes
  description: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner({ appName, appEmoji, appColor, description }: PWAInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  const storageKey = `pwa-banner-dismissed-${appName}`;

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    // Check if previously dismissed
    if (sessionStorage.getItem(storageKey)) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect iOS (Safari) — no beforeinstallprompt support
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari && !sessionStorage.getItem(storageKey)) {
      setShowIOSGuide(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [storageKey]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, "1");
    setDismissed(true);
    setShowIOSGuide(false);
  };

  // Already installed → show a small "installed" badge instead
  if (isInstalled) {
    return (
      <div className="mx-4 mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-2.5 text-sm text-green-700">
        <span className="text-base">✅</span>
        <span className="font-semibold">App installed!</span>
        <span className="text-green-600">Works offline too.</span>
      </div>
    );
  }

  if (dismissed && !showIOSGuide) return null;
  if (!deferredPrompt && !showIOSGuide) return null;

  // iOS Safari guide
  if (showIOSGuide && !dismissed) {
    return (
      <div className={`mx-4 mb-3 rounded-2xl bg-gradient-to-r ${appColor} p-0.5 shadow-lg`}>
        <div className="bg-white rounded-[14px] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{appEmoji}</span>
              <div>
                <p className="font-extrabold text-gray-800 text-sm leading-tight">Install {appName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Works offline • No app store needed</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 bg-blue-50 rounded-xl p-3 space-y-1.5 text-xs text-blue-800">
            <p className="font-bold text-blue-900">📱 How to install on iPhone/iPad:</p>
            <p>1. Tap the <strong>Share</strong> button <span className="font-mono bg-blue-100 px-1 rounded">⎙</span> at the bottom</p>
            <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
            <p>3. Tap <strong>"Add"</strong> — done! 🎉</p>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <Wifi className="h-3 w-3" />
            <span>{description}</span>
          </div>
        </div>
      </div>
    );
  }

  // Android / Chrome install prompt
  return (
    <div className={`mx-4 mb-3 rounded-2xl bg-gradient-to-r ${appColor} p-0.5 shadow-lg`}>
      <div className="bg-white rounded-[14px] p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{appEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-800 text-sm leading-tight">Install {appName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleInstall}
            disabled={installing}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${appColor} shadow-md active:scale-95 transition-transform disabled:opacity-70`}
          >
            <Download className="h-4 w-4" />
            {installing ? "Installing…" : "Add to Home Screen"}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200 active:scale-95 transition-transform"
          >
            Later
          </button>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> Works offline</span>
          <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Saves data</span>
          <span>• No App Store needed</span>
        </div>
      </div>
    </div>
  );
}
