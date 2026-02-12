"use client";

import Image from "next/image";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageTrailProps {
  images?: string[];
  threshold?: number;
  className?: string;
}

interface TrailImage {
  id: number;
  x: number;
  y: number;
  src: string;
  zIndex: number;
}

export default function ImageTrail({
  images = [],
  threshold = 80,
  className = "",
}: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [trailImages, setTrailImages] = useState<TrailImage[]>([]);
  const lastPosition = useRef({ x: 0, y: 0 });
  const imageIndex = useRef(0);
  const idCounter = useRef(0);
  const zIndexCounter = useRef(1);
  const isFirstMove = useRef(true);
  const timeoutIds = useRef<number[]>([]);

  const getDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.hypot(x2 - x1, y2 - y1);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || images.length === 0) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target?.closest("button") ||
        target?.closest("a") ||
        target?.closest("input") ||
        target?.closest("textarea") ||
        target?.closest("select") ||
        target?.closest("[data-pressable='true']") ||
        target?.closest("[data-no-trail]")
      ) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        isFirstMove.current = true;
        return;
      }

      if (isFirstMove.current) {
        isFirstMove.current = false;
        lastPosition.current = { x, y };
      }

      const distance = getDistance(x, y, lastPosition.current.x, lastPosition.current.y);
      if (distance < threshold) {
        return;
      }

      const newImage: TrailImage = {
        id: idCounter.current++,
        x,
        y,
        src: images[imageIndex.current % images.length],
        zIndex: zIndexCounter.current++,
      };

      imageIndex.current = (imageIndex.current + 1) % images.length;
      lastPosition.current = { x, y };

      setTrailImages((prev) => [...prev.slice(-40), newImage]);

      const timeoutId = window.setTimeout(() => {
        setTrailImages((prev) => prev.filter((img) => img.id !== newImage.id));
      }, 2000);
      timeoutIds.current.push(timeoutId);
    },
    [images, threshold, getDistance]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, [handleMouseMove]);

  return (
    <>
      <div ref={containerRef} className={`pointer-events-none absolute inset-0 ${className}`} />
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 20 }}>
        {trailImages.map((image) => (
          <TrailImageItem key={image.id} image={image} />
        ))}
      </div>
    </>
  );
}

function TrailImageItem({ image }: { image: TrailImage }) {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current) {
      return;
    }

    const element = imageRef.current;
    const timeline = gsap.timeline();

    timeline.to(element, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });

    timeline.to(element, {
      opacity: 0,
      scale: 0.6,
      duration: 1.2,
      delay: 0.8,
      ease: "power2.inOut",
    });

    return () => {
      timeline.kill();
    };
  }, [image.id]);

  return (
    <div
      ref={imageRef}
      className="absolute will-change-transform"
      style={{
        zIndex: image.zIndex,
        left: image.x,
        top: image.y,
        transform: "translate(-50%, -50%) scale(0.8)",
        opacity: 0,
      }}
    >
      <Image
        src={image.src}
        alt=""
        aria-hidden="true"
        width={176}
        height={176}
        className="h-auto w-20 select-none rounded-[4px] sm:w-24 md:w-28 lg:w-32"
        style={{ objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}
