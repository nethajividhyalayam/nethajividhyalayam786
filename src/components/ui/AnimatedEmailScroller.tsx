import { useState, useEffect } from "react";

const emails = [
  { label: "nethajividhyalayam@gmail.com", href: "mailto:nethajividhyalayam@gmail.com" },
  { label: "info@nethajividhyalayam.org", href: "mailto:info@nethajividhyalayam.org" },
];

const colorCycle = [
  "text-accent",
  "text-yellow-300",
  "text-emerald-300",
  "text-sky-300",
];

interface AnimatedEmailScrollerProps {
  className?: string;
}

const AnimatedEmailScroller = ({ className = "" }: AnimatedEmailScrollerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exit" | "enter">("visible");

  useEffect(() => {
    const interval = setInterval(() => {
      // Start exit
      setPhase("exit");

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % emails.length);
        setColorIndex((prev) => (prev + 1) % colorCycle.length);
        setPhase("enter");
      }, 500);

      setTimeout(() => {
        setPhase("visible");
      }, 1000);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const email = emails[activeIndex];

  const animClass =
    phase === "exit"
      ? "opacity-0 -translate-y-4 scale-95 blur-sm"
      : phase === "enter"
      ? "opacity-0 translate-y-4 scale-95 blur-sm"
      : "opacity-100 translate-y-0 scale-100 blur-0";

  return (
    <a
      href={email.href}
      className={`inline-flex items-center gap-2 transition-all duration-500 ease-in-out ${colorCycle[colorIndex]} ${className}`}
    >
      <span
        className={`inline-block transition-all duration-500 ease-in-out ${animClass}`}
      >
        {email.label}
      </span>
    </a>
  );
};

export default AnimatedEmailScroller;
