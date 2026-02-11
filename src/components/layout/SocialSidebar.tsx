import { Facebook, Youtube, Instagram } from "lucide-react";
import { useState, useEffect } from "react";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  { icon: Facebook, href: "https://www.facebook.com/", label: "Facebook", bg: "bg-[#1877F2]", hoverBg: "hover:shadow-[0_0_20px_rgba(24,119,242,0.5)]" },
  { icon: XIcon, href: "https://x.com/home", label: "X", bg: "bg-[#000000]", hoverBg: "hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]", isCustom: true },
  { icon: Youtube, href: "https://www.youtube.com/", label: "YouTube", bg: "bg-[#FF0000]", hoverBg: "hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]" },
  { icon: Instagram, href: "https://www.instagram.com/", label: "Instagram", bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]", hoverBg: "hover:shadow-[0_0_20px_rgba(225,48,108,0.4)]" },
];

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 2 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const SocialSidebar = () => {
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-collapse date/time after 3s
  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => setExpanded(false), 3000);
    return () => clearTimeout(t);
  }, [expanded]);

  // Auto-collapse social after 2s
  useEffect(() => {
    if (!activeSocial) return;
    const t = setTimeout(() => setActiveSocial(null), 2000);
    return () => clearTimeout(t);
  }, [activeSocial]);

  const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  return (
    <>
      {/* Floating Date/Time - Left Side */}
      <div className="fixed left-0 top-1/3 -translate-y-1/2 z-50 hidden md:flex flex-col">
        <div
          onClick={() => setExpanded(!expanded)}
          className={`bg-primary/90 backdrop-blur-md border border-white/10 rounded-r-2xl px-3 py-4 text-white text-center shadow-2xl cursor-pointer transition-all duration-500 overflow-hidden ${expanded ? "w-44" : "w-14"}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-accent font-bold">{dayName}</span>
              <span className="text-lg font-bold font-serif leading-tight">{now.getDate()}</span>
              <span className="text-[9px] text-white/60 uppercase">{now.toLocaleDateString("en-US", { month: "short" })}</span>
            </div>
            <div className={`transition-opacity duration-500 whitespace-nowrap text-left ${expanded ? "opacity-100" : "opacity-0"}`}>
              <div className="text-lg font-bold font-serif tabular-nums">{timeStr}</div>
              <div className="text-[10px] text-white/60">{dateStr}</div>
              <div className="mt-1.5 text-[9px] bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5 text-accent font-semibold">
                {getAcademicYear()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Social - Right Side */}
      <div className="fixed right-0 top-1/3 -translate-y-1/2 z-50 flex flex-col gap-1">
        {socials.map(({ icon: Icon, href, label, bg, hoverBg, isCustom }) => {
          const isActive = activeSocial === label;
          return (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              onMouseEnter={() => setActiveSocial(label)}
              onMouseLeave={() => setActiveSocial(null)}
              onTouchStart={() => setActiveSocial(prev => prev === label ? null : label)}
              className={`flex items-center ${bg} ${hoverBg} text-white transition-all duration-300 overflow-hidden rounded-l-xl shadow-lg ${isActive ? "w-36 scale-105" : "w-11"}`}
            >
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span className={`whitespace-nowrap text-sm font-semibold transition-opacity duration-300 pr-3 ${isActive ? "opacity-100" : "opacity-0"}`}>
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </>
  );
};

export default SocialSidebar;
