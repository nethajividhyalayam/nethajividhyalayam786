import { useState, useEffect } from "react";

const emails = [
  { label: "nethajividhyalayam@gmail.com", href: "mailto:nethajividhyalayam@gmail.com" },
  { label: "info@nethajividhyalayam.org", href: "mailto:info@nethajividhyalayam.org" },
];

interface AnimatedEmailScrollerProps {
  className?: string;
}

const AnimatedEmailScroller = ({ className = "" }: AnimatedEmailScrollerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exit" | "enter">("visible");

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase("exit");
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % emails.length);
        setPhase("enter");
      }, 600);
      setTimeout(() => {
        setPhase("visible");
      }, 1200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const email = emails[activeIndex];

  const animClass =
    phase === "exit"
      ? "opacity-0 -translate-y-5"
      : phase === "enter"
      ? "opacity-0 translate-y-5"
      : "opacity-100 translate-y-0";

  return (
    <a
      href={email.href}
      className={`inline-flex items-center transition-none ${className}`}
    >
      <span
        className={`inline-block transition-all duration-[600ms] ease-in-out ${animClass}`}
      >
        {email.label}
      </span>
    </a>
  );
};

export default AnimatedEmailScroller;
