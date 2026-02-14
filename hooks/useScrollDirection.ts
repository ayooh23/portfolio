"use client";

import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down" | "none";

export function useScrollDirection(options?: { threshold?: number }) {
  const threshold = options?.threshold ?? 50;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("none");
  const [isAtTop, setIsAtTop] = useState(true);
  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY ?? window.pageYOffset;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY ?? window.pageYOffset;
        setIsAtTop((prev) => {
          const next = y < 10;
          return prev === next ? prev : next;
        });

        if (Math.abs(y - lastYRef.current) < threshold) {
          ticking = false;
          return;
        }

        const nextDirection: ScrollDirection = y > lastYRef.current ? "down" : "up";
        setScrollDirection((prev) => (prev === nextDirection ? prev : nextDirection));
        lastYRef.current = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { scrollDirection, isAtTop };
}
