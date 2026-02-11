"use client";

import { useState, useEffect } from "react";

type ScrollDirection = "up" | "down" | "none";

export function useScrollDirection(options?: { threshold?: number }) {
  const threshold = options?.threshold ?? 50;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("none");
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY ?? window.pageYOffset;
        setIsAtTop(y < 10);
        if (Math.abs(y - lastY) < threshold) {
          ticking = false;
          return;
        }
        setScrollDirection(y > lastY ? "down" : "up");
        setLastY(y);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY, threshold]);

  return { scrollDirection, isAtTop };
}
