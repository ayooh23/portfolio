import type { RefObject } from "react";
import Image from "next/image";

type PortfolioLoaderOverlayProps = {
  isLoading: boolean;
  loadingGallery: string[];
  loaderImageIndex: number;
  loaderTypeText: string;
  loaderTypeChars: number;
  loaderSublineText: string;
  loaderSublineChars: number;
  cell: number;
  loaderOverlayRef: RefObject<HTMLDivElement | null>;
  loaderContentRef: RefObject<HTMLDivElement | null>;
  loaderImageFrameRef: RefObject<HTMLDivElement | null>;
  loaderCursorRef: RefObject<HTMLSpanElement | null>;
  loaderSublineCursorRef: RefObject<HTMLSpanElement | null>;
};

export default function PortfolioLoaderOverlay({
  isLoading,
  loadingGallery,
  loaderImageIndex,
  loaderTypeText,
  loaderTypeChars,
  loaderSublineText,
  loaderSublineChars,
  cell,
  loaderOverlayRef,
  loaderContentRef,
  loaderImageFrameRef,
  loaderCursorRef,
  loaderSublineCursorRef,
}: PortfolioLoaderOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      ref={loaderOverlayRef}
      className="fixed inset-0 z-[120] bg-white"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Loading portfolio content"
    >
      <p className="sr-only">Loading portfolio content. Please wait.</p>
      <div
        ref={loaderContentRef}
        aria-hidden="true"
        className="fixed z-[122] -translate-y-1/2 break-words text-left whitespace-normal [overflow-wrap:anywhere] md:break-normal md:whitespace-nowrap md:[overflow-wrap:normal]"
        style={{ left: 0, top: 0, opacity: 0 }}
      >
        <div className="text-[clamp(20px,2.3vw,26px)] font-medium tracking-[0.02em] text-[#111]">
          <span>{loaderTypeText.slice(0, loaderTypeChars)}</span>
          {loaderTypeChars < loaderTypeText.length ? (
            <span ref={loaderCursorRef} aria-hidden="true" className="ml-1 inline-block w-[0.75ch]">
              _
            </span>
          ) : null}
          <br />
          <span>{loaderSublineText.slice(0, loaderSublineChars)}</span>
          {loaderTypeChars >= loaderTypeText.length && loaderSublineChars < loaderSublineText.length ? (
            <span
              ref={loaderSublineCursorRef}
              aria-hidden="true"
              className="ml-1 inline-block w-[0.75ch]"
            >
              _
            </span>
          ) : null}
        </div>
      </div>
      <div
        ref={loaderImageFrameRef}
        className="safari-transition-rounded fixed z-[121] overflow-hidden rounded-[10px] bg-[#f3f3f3]"
        style={{ width: cell, height: cell, opacity: 0 }}
      >
        <Image
          src={loadingGallery[loaderImageIndex]}
          alt=""
          aria-hidden="true"
          fill
          sizes={`${Math.max(120, Math.round(cell))}px`}
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
