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
      }, 1500);
      setTimeout(() => {
        setPhase("visible");
      }, 3000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const email = emails[activeIndex];

  const style: React.CSSProperties =
    phase === "exit"
      ? { opacity: 0, transform: "translateY(-8px) rotateX(40deg)", transition: "all 1.5s ease-in-out" }
      : phase === "enter"
      ? { opacity: 0, transform: "translateY(8px) rotateX(-40deg)", transition: "none" }
      : { opacity: 1, transform: "translateY(0) rotateX(0deg)", transition: "all 1.5s ease-in-out" };

  return (
    <a
      href={email.href}
      className={`inline-flex items-center ${className}`}
      style={{ perspective: "200px" }}
    >
      <span className="inline-block" style={style}>
        {email.label}
      </span>
    </a>
  );
};

export default AnimatedEmailScroller;
