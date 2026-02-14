"use client";

import { useEffect, useRef } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number>(0);
  const lenisRef = useRef<import("lenis").default | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      return;
    }

    let isUnmounted = false;
    let cleanup: (() => void) | undefined;

    void import("lenis").then(({ default: Lenis }) => {
      if (isUnmounted) return;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);

      cleanup = () => {
        cancelAnimationFrame(rafRef.current);
        lenis.destroy();
        lenisRef.current = null;
        rafRef.current = 0;
      };
    });

    return () => {
      isUnmounted = true;
      cleanup?.();
      cleanup = undefined;
    };
  }, []);

  return <>{children}</>;
}
