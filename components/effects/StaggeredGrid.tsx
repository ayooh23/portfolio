"use client";

import { Children, type ReactNode } from "react";
import ScrollReveal from "@/components/ScrollReveal";

interface StaggeredGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale" | "blur";
  className?: string;
}

export default function StaggeredGrid({
  children,
  columns = 3,
  staggerDelay = 100,
  direction = "up",
  className,
}: StaggeredGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const items = Children.toArray(children);

  return (
    <div className={`grid gap-4 ${gridClass} ${className ?? ""}`}>
      {items.map((child, i) => (
        <ScrollReveal key={i} direction={direction} delay={i * staggerDelay}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
