"use client";

import { type ReactNode } from "react";

type Effect = "magnetic" | "ripple" | "glow" | "morph" | "elastic";
type Variant = "primary" | "secondary" | "ghost";

interface PremiumButtonProps {
  children: ReactNode;
  effect?: Effect;
  variant?: Variant;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const variantClass = {
  primary: "bg-white text-neutral-950 hover:bg-neutral-200 shadow-md hover:shadow-lg active:shadow-md",
  secondary: "bg-neutral-800 text-neutral-50 hover:bg-neutral-700 border border-neutral-700 shadow-md hover:shadow-lg active:shadow-md",
  ghost: "bg-transparent text-neutral-50 border border-neutral-600 hover:border-neutral-400",
};

export default function PremiumButton({
  children,
  effect = "magnetic",
  variant = "primary",
  onClick,
  href,
  className,
}: PremiumButtonProps) {
  const baseClass = "inline-flex items-center justify-center rounded-[8px] px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] active:translate-y-0.5";
  const combined = `${baseClass} ${variantClass[variant]} ${className ?? ""}`;

  if (href) {
    return (
      <a href={href} className={combined}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combined}>
      {children}
    </button>
  );
}
