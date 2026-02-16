import { useEffect } from "react";

/**
 * Animates the favicon by redrawing a logo image on a canvas
 * at varying sizes (80→120px equivalent) over a 120-second cycle.
 */
const useFaviconPulse = (logoSrc: string) => {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logoSrc;

    let linkEl = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.rel = "icon";
      linkEl.type = "image/png";
      document.head.appendChild(linkEl);
    }

    const cycleDuration = 120000; // 120s in ms
    const minScale = 0.625; // 80/128 base
    const maxScale = 1.0;   // 120/120 peak
    let rafId: number;
    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) % cycleDuration;
      const progress = elapsed / cycleDuration;
      // Sine wave: 0→1→0 over cycle
      const t = Math.sin(progress * Math.PI);
      const scale = minScale + (maxScale - minScale) * t;

      const size = 64 * scale;
      const offset = (64 - size) / 2;

      ctx.clearRect(0, 0, 64, 64);
      ctx.drawImage(img, offset, offset, size, size);

      linkEl.href = canvas.toDataURL("image/png");
      rafId = requestAnimationFrame(draw);
    };

    img.onload = () => {
      rafId = requestAnimationFrame(draw);
    };

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [logoSrc]);
};

export default useFaviconPulse;
