"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";

interface SplitTextRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  stagger?: number;
  split?: "words" | "chars" | "lines";
  once?: boolean;
  className?: string;
}

export default function SplitTextReveal({
  children,
  delay = 0,
  duration = 0.6,
  stagger = 0.03,
  split = "words",
  className,
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const splitRef = useRef<SplitType | null>(null);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion || !containerRef.current) return;

    const el = containerRef.current;
    const types = split === "lines" ? "lines" : split === "chars" ? "chars" : "words";

    const st = new SplitType(el, { types: [types] as ("words" | "chars" | "lines")[] });
    splitRef.current = st;

    const targets =
      types === "lines" ? st.lines : types === "chars" ? st.chars : st.words;
    if (!targets?.length) return;

    gsap.set(targets, { opacity: 0, y: 20, rotationX: -30, transformOrigin: "0% 50% -50%" });
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration,
      stagger,
      delay: delay / 1000,
      ease: "power3.out",
    });

    return () => {
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [reduceMotion, split, delay, duration, stagger]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden" }}>
      {children}
    </div>
  );
}
