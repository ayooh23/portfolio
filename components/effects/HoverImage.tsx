"use client";

import Image from "next/image";
import { useState } from "react";

type Effect = "zoom" | "lift" | "tilt" | "shine" | "blur";

interface HoverImageProps {
  src: string;
  alt: string;
  effect?: Effect;
  containerClassName?: string;
  priority?: boolean;
}

export default function HoverImage({
  src,
  alt,
  effect = "zoom",
  containerClassName,
  priority = false,
}: HoverImageProps) {
  const [hover, setHover] = useState(false);

  const imgClass =
    effect === "zoom"
      ? "transition-transform duration-700 ease-out hover:scale-110"
      : effect === "lift"
        ? "transition-transform duration-500 ease-out hover:scale-105 hover:-translate-y-2"
        : effect === "tilt"
          ? "transition-transform duration-400 ease-out hover:rotate-2 hover:scale-105"
          : effect === "blur"
            ? "transition-all duration-500 hover:scale-105 hover:blur-0"
            : "transition-transform duration-700 ease-out hover:scale-105";

  return (
    <div
      className={`overflow-hidden ${containerClassName ?? ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className={`object-cover w-full h-full ${imgClass}`}
          priority={priority}
        />
        {effect === "shine" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full"
            style={{ transitionProperty: "opacity, transform" }}
          />
        )}
      </div>
    </div>
  );
}
