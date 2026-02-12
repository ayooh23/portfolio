"use client";

import { useState } from "react";
import { m } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
}

const dirMap = {
  up: { y: 12, x: 0 },
  down: { y: -12, x: 0 },
  left: { y: 0, x: 12 },
  right: { y: 0, x: -12 },
  none: { y: 0, x: 0 },
};

export default function FadeInText({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  className,
}: FadeInTextProps) {
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const d = dirMap[direction];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, x: d.x, y: d.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </m.div>
  );
}
