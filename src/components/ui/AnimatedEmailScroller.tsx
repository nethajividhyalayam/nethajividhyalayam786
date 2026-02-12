import { useState, useEffect } from "react";

const emails = [
  { label: "nethajividhyalayam@gmail.com", href: "mailto:nethajividhyalayam@gmail.com" },
  { label: "info@nethajividhyalayam.org", href: "mailto:info@nethajividhyalayam.org" },
];

interface AnimatedEmailScrollerProps {
  className?: string;
  iconClassName?: string;
}

const AnimatedEmailScroller = ({ className = "", iconClassName = "" }: AnimatedEmailScrollerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % emails.length);
        setIsAnimating(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const email = emails[activeIndex];

  return (
    <a
      href={email.href}
      className={`inline-flex items-center gap-2 transition-all duration-300 ${className}`}
    >
      <span
        className={`inline-block transition-all duration-400 ${
          isAnimating
            ? "opacity-0 translate-y-3 blur-sm"
            : "opacity-100 translate-y-0 blur-0"
        }`}
      >
        {email.label}
      </span>
    </a>
  );
};

export default AnimatedEmailScroller;
