"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade" | "scale" | "blur";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  threshold?: number;
  once?: boolean;
  distance?: string;
  scale?: number;
  className?: string;
}

function getStyles(
  direction: Direction,
  distance: string,
  scale: number,
  visible: boolean
): React.CSSProperties {
  const transition = "opacity 0.6s var(--ease-out, ease-out), transform 0.6s var(--ease-out, ease-out), filter 0.6s var(--ease-out, ease-out)";
  if (visible) {
    return {
      opacity: 1,
      transform: "translateY(0) translateX(0) scale(1)",
      filter: "blur(0)",
      transition,
    };
  }
  switch (direction) {
    case "up":
      return { opacity: 0, transform: `translateY(${distance})`, transition };
    case "down":
      return { opacity: 0, transform: `translateY(-${distance})`, transition };
    case "left":
      return { opacity: 0, transform: `translateX(${distance})`, transition };
    case "right":
      return { opacity: 0, transform: `translateX(-${distance})`, transition };
    case "fade":
      return { opacity: 0, transition };
    case "scale":
      return { opacity: 0, transform: `scale(${scale})`, transition };
    case "blur":
      return { opacity: 0, filter: "blur(8px)", transition };
    default:
      return {};
  }
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.1,
  distance = "2rem",
  scale = 0.95,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [visible, setVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          timeoutId = setTimeout(() => setVisible(true), delay);
          io.unobserve(entry.target);
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay, threshold, reduceMotion]);

  const style = reduceMotion || visible
    ? getStyles(direction, distance, scale, true)
    : getStyles(direction, distance, scale, false);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
