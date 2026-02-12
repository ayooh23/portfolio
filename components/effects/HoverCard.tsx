"use client";

import { type ReactNode } from "react";

type Effect = "lift" | "glow" | "tilt" | "scale" | "border";
type Intensity = "subtle" | "medium" | "strong";

interface HoverCardProps {
  children: ReactNode;
  effect?: Effect;
  intensity?: Intensity;
  className?: string;
}

const intensityMap = {
  subtle: {
    lift: "hover:-translate-y-1",
    glow: "hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]",
    scale: "hover:scale-[1.02]",
  },
  medium: {
    lift: "hover:-translate-y-2 hover:shadow-lg",
    glow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]",
    scale: "hover:scale-[1.04]",
  },
  strong: {
    lift: "hover:-translate-y-3 hover:shadow-xl",
    glow: "hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]",
    scale: "hover:scale-[1.06]",
  },
};

export default function HoverCard({
  children,
  effect = "lift",
  intensity = "medium",
  className,
}: HoverCardProps) {
  const classes = intensityMap[intensity];
  let effectClass = classes.lift;
  switch (effect) {
    case "glow":
      effectClass = classes.glow;
      break;
    case "tilt":
      effectClass = "hover:rotate-1 transition-transform duration-300";
      break;
    case "scale":
      effectClass = classes.scale;
      break;
    case "border":
      effectClass = "hover:border-neutral-500 transition-colors duration-300";
      break;
    case "lift":
    default:
      break;
  }

  return (
    <div
      className={`transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${effectClass} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
