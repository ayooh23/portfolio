"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import {
  ACTIVE_CELL_HINT_TEXT,
  AYU_TILE,
  LOADER_SUBLINE_TEXT,
  LOADER_TYPE_TEXT,
  LOADING_GALLERY,
  PROJECT_IMAGE_SEQUENCES,
  TILES,
  type Project,
} from "@/app/portfolio-content";

function NumberBadge({ n }: { n: number }) {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[14px] font-medium text-[#111] sm:text-[11px]">
      {n}
    </div>
  );
}

type GridSize = { cols: number; rows: number };
type TileTouchAction = "auto" | "none" | "pan-x" | "pan-y";

// --- helpers
function isAdjacent(a: number, b: number, cols: number) {
  const ax = a % cols;
  const ay = Math.floor(a / cols);
  const bx = b % cols;
  const by = Math.floor(b / cols);
  const manhattan = Math.abs(ax - bx) + Math.abs(ay - by);
  return manhattan === 1;
}

function cellXY(index: number, cols: number, cell: number, gap: number) {
  const x = (index % cols) * (cell + gap);
  const y = Math.floor(index / cols) * (cell + gap);
  return { x, y };
}

function getTileTouchAction(from: number, emptyIndices: number[], cols: number): TileTouchAction {
  let canMoveX = false;
  let canMoveY = false;

  for (const emptyIdx of emptyIndices) {
    if (!isAdjacent(from, emptyIdx, cols)) continue;
    if (Math.floor(emptyIdx / cols) === Math.floor(from / cols)) {
      canMoveX = true;
    } else {
      canMoveY = true;
    }
  }

  if (!canMoveX && !canMoveY) return "auto";
  if (canMoveX && canMoveY) return "none";
  return canMoveX ? "pan-y" : "pan-x";
}

const detailRowClass = "grid grid-cols-[24px_1fr] gap-3";
const detailTitleClass = "text-[15px] font-medium text-[#111]/85 sm:text-[13px]";
const detailBodyClass =
  "mt-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]";
const detailLinkClass =
  "underline decoration-[#111]/20 underline-offset-2 transition hover:decoration-[#111]/50 hover:text-[#111]";
const splitPaneDesktopTabletPaddingClass = "py-10 px-12";
const splitPaneHeaderClass = `${detailRowClass} items-center text-[15px] font-medium text-[#111]/80 sm:text-[12px]`;
const splitPaneFooterBaseClass = "mt-4 min-h-[36px] text-[14px] leading-[1.75] sm:mt-3 sm:text-[12px]";
const LOADER_SEEN_SESSION_KEY = "ayu-portfolio-loader-seen";

function PlusBadge() {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[14px] font-medium text-[#111]/70 sm:text-[13px]">
      +
    </div>
  );
}

function DetailSection({
  marker,
  title,
  children,
}: {
  marker: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div data-active-line className={detailRowClass}>
      <div className="pt-[2px]">{marker}</div>
      <div>
        <div className={detailTitleClass}>{title}</div>
        {children}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const tiles = TILES;
  const loadingGallery = LOADING_GALLERY;
  const loaderTypeText = LOADER_TYPE_TEXT;
  const loaderSublineText = LOADER_SUBLINE_TEXT;
  const activeCellHintText = ACTIVE_CELL_HINT_TEXT;
  const ayuTile = AYU_TILE;
  const allProjectSequenceImages = useMemo(
    () => Array.from(new Set(Object.values(PROJECT_IMAGE_SEQUENCES).flat())),
    []
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const loaderOverlayRef = useRef<HTMLDivElement | null>(null);
  const loaderContentRef = useRef<HTMLDivElement | null>(null);
  const loaderImageFrameRef = useRef<HTMLDivElement | null>(null);
  const loaderCursorRef = useRef<HTMLSpanElement | null>(null);
  const loaderSublineCursorRef = useRef<HTMLSpanElement | null>(null);
  const loaderTypeCharsRef = useRef(0);
  const loaderSublineCharsRef = useRef(0);
  const loaderImageIndexRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [loaderTypeChars, setLoaderTypeChars] = useState(0);
  const [loaderSublineChars, setLoaderSublineChars] = useState(0);
  const [loaderImageIndex, setLoaderImageIndex] = useState(0);

  // puzzle refs
  const boardRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activePanelRef = useRef<HTMLDivElement | null>(null);
  const prevActiveIdRef = useRef<string | null>(null);

  // --- Layout knobs: 3x3 grid, 6 tiles + 3 empty
  const grid: GridSize = { cols: 3, rows: 3 };
  const totalCells = grid.cols * grid.rows; // 9
  const activeCellIndex = 2; // top-right = active tile
  const splitLayoutBreakpoint = 768;
  const desktopViewportCap = { width: 1440, height: 900 };
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(false);

  // Board fills first-half width; cell/gap derived from measured container
  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const [boardContainerWidth, setBoardContainerWidth] = useState(576);
  useEffect(() => {
    const el = boardWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const nextWidth = el.offsetWidth;
      setBoardContainerWidth((prevWidth) => (prevWidth === nextWidth ? prevWidth : nextWidth));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cell = boardContainerWidth / (grid.cols + (grid.cols - 1) * 0.1); // 3 cells + 2 gaps (gap = cell*0.1)
  const gap = cell * 0.1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    const syncFinePointer = () => setIsFinePointer(media.matches);
    syncFinePointer();
    media.addEventListener("change", syncFinePointer);
    return () => media.removeEventListener("change", syncFinePointer);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;
    const dot = cursorDotRef.current;
    if (!dot) return;

    const xTo = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      gsap.to(dot, { autoAlpha: 1, duration: 0.18, ease: "sine.out", overwrite: "auto" });
    };
    const onLeave = () => {
      gsap.to(dot, { autoAlpha: 0, duration: 0.2, ease: "sine.out", overwrite: "auto" });
    };
    const onDown = () => {
      gsap.to(dot, { scale: 0.72, duration: 0.16, ease: "sine.out", overwrite: "auto" });
    };
    const onUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.22, ease: "sine.out", overwrite: "auto" });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isFinePointer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const src of allProjectSequenceImages) {
      const img = new window.Image();
      img.src = src;
    }
  }, [allProjectSequenceImages]);

  useEffect(() => {
    const overlayEl = loaderOverlayRef.current;
    const contentEl = loaderContentRef.current;
    const frameEl = loaderImageFrameRef.current;
    const rootEl = rootRef.current;
    if (!overlayEl || !contentEl || !rootEl) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      const rafId = window.requestAnimationFrame(() => {
        setLoaderTypeChars(loaderTypeText.length);
        setLoaderSublineChars(loaderSublineText.length);
        setLoaderImageIndex(loadingGallery.length - 1);
        setIsLoading(false);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    const entranceEls = rootEl.querySelectorAll("[data-entrance]");
    const preTileCellEls = rootEl.querySelectorAll("[data-pre-tile-cell]");
    const dropTileEls = rootEl.querySelectorAll("[data-tile-drop]");
    const activeDescriptorEl = rootEl.querySelectorAll("[data-active-descriptor]");
    gsap.set(entranceEls, { opacity: 0, y: 6 });
    gsap.set(preTileCellEls, { autoAlpha: 0 });
    gsap.set(dropTileEls, {
      autoAlpha: 0,
      yPercent: 1.5,
      scale: 1.085,
      transformOrigin: "50% 50%",
    });
    if (frameEl) {
      gsap.set(frameEl, {
        autoAlpha: 0,
        yPercent: 2.2,
        scale: 0.985,
        transformOrigin: "50% 50%",
      });
    }
    gsap.set(activeDescriptorEl, { autoAlpha: 0, yPercent: 1.2 });

    let hasSeenLoader = false;
    try {
      hasSeenLoader = window.sessionStorage.getItem(LOADER_SEEN_SESSION_KEY) === "1";
    } catch {
      hasSeenLoader = false;
    }

    const progressState = { value: 0 };
    const typeState = { chars: 0 };
    const sublineState = { chars: 0 };
    const totalImages = loadingGallery.length;
    const helloChars = "Hello!".length;
    const timing = hasSeenLoader
      ? {
          textSpeedFactor: 0.3,
          progressDuration: Math.max(1.9, totalImages * 0.28),
          helloPauseDuration: 0.1,
          punctuationPauseDuration: 0.03,
          beforeGuidePauseDuration: 0.12,
          guideBeatPauseDuration: 0.04,
          guideFinalPauseDuration: 0.03,
          holdDuration: 0.06,
          contentInDuration: 0.36,
          loaderFrameInDuration: 0.44,
          contentOutDuration: 0.24,
          overlayOutDuration: 0.3,
          entranceDuration: 0.52,
          preTileDuration: 0.12,
          dropTileDuration: 0.2,
          entranceStagger: 0.024,
          dropTileStagger: 0.012,
        }
      : {
          textSpeedFactor: 0.78,
          progressDuration: Math.max(5.2, totalImages * 0.86),
          helloPauseDuration: 0.58,
          punctuationPauseDuration: 0.2,
          beforeGuidePauseDuration: 0.82,
          guideBeatPauseDuration: 0.26,
          guideFinalPauseDuration: 0.2,
          holdDuration: 0.68,
          contentInDuration: 0.74,
          loaderFrameInDuration: 0.66,
          contentOutDuration: 0.46,
          overlayOutDuration: 0.58,
          entranceDuration: 0.9,
          preTileDuration: 0.18,
          dropTileDuration: 0.28,
          entranceStagger: 0.036,
          dropTileStagger: 0.016,
        };

    loaderTypeCharsRef.current = 0;
    loaderSublineCharsRef.current = 0;
    loaderImageIndexRef.current = 0;

    const syncTypeChars = () => {
      const nextChars = Math.min(loaderTypeText.length, Math.round(typeState.chars));
      if (nextChars !== loaderTypeCharsRef.current) {
        loaderTypeCharsRef.current = nextChars;
        setLoaderTypeChars(nextChars);
      }
    };
    const syncSublineChars = () => {
      const nextChars = Math.min(loaderSublineText.length, Math.round(sublineState.chars));
      if (nextChars !== loaderSublineCharsRef.current) {
        loaderSublineCharsRef.current = nextChars;
        setLoaderSublineChars(nextChars);
      }
    };

    const tl = gsap.timeline();
    if (frameEl) {
      tl.to(
        frameEl,
        {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
          duration: timing.loaderFrameInDuration,
          ease: "power2.out",
          overwrite: "auto",
        },
        0.02
      );
    }
    tl.fromTo(
      contentEl,
      { autoAlpha: 0, x: -14, y: 6, filter: "blur(2px)" },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        duration: timing.contentInDuration,
        ease: "power2.out",
        clearProps: "filter",
      }
    );
    tl.to(
      typeState,
      {
        chars: 3,
        duration: 0.32 * timing.textSpeedFactor,
        ease: "sine.out",
        onUpdate: syncTypeChars,
      },
      0.12
    );
    tl.to(
      typeState,
      {
        chars: helloChars,
        duration: 0.5 * timing.textSpeedFactor,
        ease: "none",
        onUpdate: syncTypeChars,
      },
      ">-0.01"
    );
    tl.to({}, { duration: timing.helloPauseDuration });
    tl.to(typeState, {
      chars: 8,
      duration: 0.3 * timing.textSpeedFactor,
      ease: "sine.out",
      onUpdate: syncTypeChars,
    });
    tl.to({}, { duration: timing.punctuationPauseDuration });
    tl.to(typeState, {
      chars: 7,
      duration: 0.1 * timing.textSpeedFactor,
      ease: "none",
      onUpdate: syncTypeChars,
    });
    tl.to(typeState, {
      chars: loaderTypeText.length,
      duration: 0.9 * timing.textSpeedFactor,
      ease: "none",
      onUpdate: syncTypeChars,
    });
    tl.to({}, { duration: timing.beforeGuidePauseDuration });
    tl.to(sublineState, {
      chars: "Slide".length,
      duration: 0.46 * timing.textSpeedFactor,
      ease: "none",
      onUpdate: syncSublineChars,
    });
    tl.to({}, { duration: timing.guideBeatPauseDuration });
    tl.to(sublineState, {
      chars: "Slide through".length,
      duration: 0.62 * timing.textSpeedFactor,
      ease: "none",
      onUpdate: syncSublineChars,
    });
    tl.to({}, { duration: timing.guideFinalPauseDuration });
    tl.to(sublineState, {
      chars: loaderSublineText.length,
      duration: 0.86 * timing.textSpeedFactor,
      ease: "none",
      onUpdate: syncSublineChars,
    });
    tl.to(
      progressState,
      {
        value: 100,
        duration: timing.progressDuration,
        ease: "none",
        onUpdate: () => {
          const nextImageIndex = Math.min(
            totalImages - 1,
            Math.floor((progressState.value / 100) * totalImages)
          );
          if (nextImageIndex !== loaderImageIndexRef.current) {
            loaderImageIndexRef.current = nextImageIndex;
            setLoaderImageIndex(nextImageIndex);
          }
        },
      },
      0
    );
    tl.to({}, { duration: timing.holdDuration });
    tl.to(
      contentEl,
      { autoAlpha: 0, x: -4, duration: timing.contentOutDuration, ease: "sine.inOut" },
      ">-0.04"
    );
    tl.to(
      overlayEl,
      {
        autoAlpha: 0,
        duration: timing.overlayOutDuration,
        ease: "sine.inOut",
      },
      "<0.03"
    );
    tl.to(
      entranceEls,
      {
        opacity: 1,
        y: 0,
        duration: timing.entranceDuration,
        ease: "power2.out",
        stagger: timing.entranceStagger,
      },
      "<0.02"
    );
    tl.to(
      preTileCellEls,
      {
        autoAlpha: 1,
        duration: timing.preTileDuration,
        ease: "sine.out",
      },
      "<0.18"
    );
    if (frameEl) {
      tl.to(
        frameEl,
        {
          autoAlpha: 0,
          duration: Math.min(0.18, timing.dropTileDuration * 0.75),
          ease: "sine.out",
          overwrite: "auto",
        },
        "<"
      );
    }
    tl.to(
      dropTileEls,
      {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        duration: timing.dropTileDuration,
        ease: "power2.out",
        stagger: timing.dropTileStagger,
      },
      "<0.1"
    );
    tl.to(
      activeDescriptorEl,
      {
        autoAlpha: 1,
        yPercent: 0,
        duration: timing.dropTileDuration,
        ease: "power2.out",
      },
      "<"
    );
    tl.eventCallback("onComplete", () => {
      try {
        window.sessionStorage.setItem(LOADER_SEEN_SESSION_KEY, "1");
      } catch {
        // no-op when session storage isn't available
      }
      setIsLoading(false);
    });

    return () => tl.kill();
  }, [loaderSublineText, loaderTypeText, loadingGallery]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const loaderCursor = loaderCursorRef.current;
    const loaderSublineCursor = loaderSublineCursorRef.current;
    const tweens: gsap.core.Tween[] = [];

    if (loaderCursor) {
      tweens.push(
        gsap.to(loaderCursor, {
          opacity: 0.28,
          duration: 0.62,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    }

    if (loaderSublineCursor) {
      tweens.push(
        gsap.to(loaderSublineCursor, {
          opacity: 0.28,
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    }

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  // puzzle state: tile -> cellIndex (6 tiles; 3 cells empty at 2,4,6)
  const [tilePos, setTilePos] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const order = [4, 8, 7, 3, 6, 0]; // empties at top-middle, top-right, middle-right
    tiles.forEach((t, i) => (initial[t.id] = order[i]));
    return initial;
  });
  const [hasTileEnteredActiveCell, setHasTileEnteredActiveCell] = useState(false);
  const profileTileIndex = tilePos[ayuTile.id];

  useEffect(() => {
    if (!isLoading) return;
    const frame = loaderImageFrameRef.current;
    const board = boardRef.current;
    const content = loaderContentRef.current;
    if (!frame || !board || !content || typeof profileTileIndex !== "number") return;

    const syncFrameToProfileTile = () => {
      const profileTileEl = tileRefs.current[ayuTile.id];
      const tileRect = profileTileEl?.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const fallback = cellXY(profileTileIndex, grid.cols, cell, gap);
      const left = tileRect ? tileRect.left : boardRect.left + fallback.x;
      const top = tileRect ? tileRect.top : boardRect.top + fallback.y;
      const width = tileRect ? tileRect.width : cell;
      const height = tileRect ? tileRect.height : cell;
      const safePadding = 16;
      const textOffset = Math.max(34, gap * 1.15);
      const rightSideLeft = left + width + textOffset;
      const textTop = top + height / 2;
      const isMobileLoader = window.innerWidth < splitLayoutBreakpoint;

      gsap.set(frame, {
        left,
        top,
        width,
        height,
      });

      if (isMobileLoader) {
        const viewportWidth = window.innerWidth;
        const preferredTextWidth = Math.min(240, viewportWidth - safePadding * 2);
        const availableRight = viewportWidth - safePadding - rightSideLeft;
        const availableLeft = left - safePadding - textOffset;
        const placeOnRight = availableRight >= availableLeft;
        const availableSpace = Math.max(0, placeOnRight ? availableRight : availableLeft);
        const mobileTextWidth = Math.min(preferredTextWidth, availableSpace);
        const textLeft = placeOnRight
          ? rightSideLeft
          : Math.max(safePadding, left - textOffset - mobileTextWidth);

        gsap.set(content, {
          left: textLeft,
          top: textTop,
          width: mobileTextWidth,
        });
        return;
      }

      gsap.set(content, { width: "auto" });
      const textWidth = content.getBoundingClientRect().width;
      const leftSideLeft = left - textWidth - textOffset;
      const placeOnRight = rightSideLeft + textWidth <= window.innerWidth - safePadding;
      const textLeft = placeOnRight
        ? rightSideLeft
        : Math.max(safePadding, leftSideLeft);

      gsap.set(content, {
        left: textLeft,
        top: textTop,
      });
    };

    const ticker = () => syncFrameToProfileTile();
    syncFrameToProfileTile();
    gsap.ticker.add(ticker);

    return () => {
      gsap.ticker.remove(ticker);
    };
  }, [ayuTile.id, cell, gap, grid.cols, isLoading, profileTileIndex, splitLayoutBreakpoint]);

  // empty indices (3 of them)
  const currentEmptyIndices = useMemo(() => {
    const occupied = new Set(Object.values(tilePos));
    return Array.from({ length: totalCells }, (_, i) => i).filter((i) => !occupied.has(i));
  }, [tilePos, totalCells]);

  // active = tile in top-right (index 2)
  const activeTile = useMemo(() => {
    for (const t of tiles) {
      if (tilePos[t.id] === activeCellIndex) return t;
    }
    return null;
  }, [tiles, tilePos, activeCellIndex]);
  const nonProfileCellIndices = useMemo(
    () =>
      Array.from({ length: totalCells }, (_, idx) => idx).filter((idx) => idx !== profileTileIndex),
    [profileTileIndex, totalCells]
  );

  // keep mobile in document flow; lock to horizontal split on tablet/desktop
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;

    const syncLayout = () => {
      const useHorizontalLayout = window.innerWidth >= splitLayoutBreakpoint;
      root.style.overflow = useHorizontalLayout ? "hidden" : "";
      setIsHorizontalLayout((prevLayout) =>
        prevLayout === useHorizontalLayout ? prevLayout : useHorizontalLayout
      );
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);

    return () => {
      window.removeEventListener("resize", syncLayout);
      root.style.overflow = prev;
    };
  }, [splitLayoutBreakpoint]);

  // sync tile DOM positions with state (smooth)
  useEffect(() => {
    for (const t of tiles) {
      const el = tileRefs.current[t.id];
      if (!el) continue;
      const pos = tilePos[t.id];
      const { x, y } = cellXY(pos, grid.cols, cell, gap);

      gsap.to(el, {
        x,
        y,
        duration: isLoading ? 0 : 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [tilePos, tiles, grid.cols, cell, gap, isLoading]);

  // Animate active panel content when activeTile changes (not on first paint)
  useEffect(() => {
    const el = activePanelRef.current;
    if (!el) return;

    const currentId = activeTile?.id ?? "empty";
    const isFirstPaint = prevActiveIdRef.current === null;
    prevActiveIdRef.current = currentId;

    if (isFirstPaint) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const lines = el.querySelectorAll("[data-active-line]");

    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
    gsap.fromTo(
      lines,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.035,
        delay: 0.05,
        ease: "power2.out",
      }
    );
  }, [activeTile]);

  // --- Drag-to-slide interaction (only if adjacent to an empty)
  const dragState = useRef<{
    id: string | null;
    from: number;
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
    max: number;
    sign: 1 | -1;
    targetIndex: number | null;
    baseX: number;
    baseY: number;
    pointerId: number | null;
  }>({
    id: null,
    from: 0,
    startX: 0,
    startY: 0,
    axis: null,
    max: 0,
    sign: 1,
    targetIndex: null,
    baseX: 0,
    baseY: 0,
    pointerId: null,
  });

  const onTilePointerDown = (tile: Project) => (e: React.PointerEvent) => {
    const el = tileRefs.current[tile.id];
    if (!el) return;

    const from = tilePos[tile.id];
    const hasAdjacentEmpty = currentEmptyIndices.some((emptyIdx) =>
      isAdjacent(from, emptyIdx, grid.cols)
    );
    if (!hasAdjacentEmpty) return;

    const baseX = Number(gsap.getProperty(el, "x")) || 0;
    const baseY = Number(gsap.getProperty(el, "y")) || 0;

    dragState.current = {
      id: tile.id,
      from,
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
      max: 0,
      sign: 1,
      targetIndex: null,
      baseX,
      baseY,
      pointerId: e.pointerId,
    };

    el.setPointerCapture(e.pointerId);
    gsap.to(el, { scale: 1.01, duration: 0.12, ease: "power2.out" });
  };

  const onBoardPointerMove = (e: React.PointerEvent) => {
    const st = dragState.current;
    if (!st.id || st.pointerId !== e.pointerId) return;

    const el = tileRefs.current[st.id];
    if (!el) return;

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    // On first meaningful movement, lock axis and target empty
    if (st.axis === null) {
      const threshold = 8;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      const axis: "x" | "y" = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      const sign: 1 | -1 = (axis === "x" ? dx : dy) > 0 ? 1 : -1;
      const targetIndex =
        axis === "x" ? st.from + sign : st.from + sign * grid.cols;
      if (
        targetIndex >= 0 &&
        targetIndex < totalCells &&
        currentEmptyIndices.includes(targetIndex)
      ) {
        dragState.current.axis = axis;
        dragState.current.sign = sign;
        dragState.current.max = cell + gap;
        dragState.current.targetIndex = targetIndex;
      }
    }

    const axis = dragState.current.axis;
    if (axis === null) return;

    let travel = axis === "x" ? dx : dy;
    travel *= dragState.current.sign;
    travel = Math.max(0, Math.min(dragState.current.max, travel));

    const tx =
      axis === "x"
        ? dragState.current.baseX + travel * dragState.current.sign
        : dragState.current.baseX;
    const ty =
      axis === "y"
        ? dragState.current.baseY + travel * dragState.current.sign
        : dragState.current.baseY;

    gsap.set(el, { x: tx, y: ty });
  };

  const onBoardPointerUp = (e: React.PointerEvent) => {
    const st = dragState.current;
    if (!st.id || st.pointerId !== e.pointerId) return;

    const id = st.id;
    const el = tileRefs.current[id];
    if (!el) {
      dragState.current.id = null;
      dragState.current.axis = null;
      dragState.current.targetIndex = null;
      dragState.current.pointerId = null;
      return;
    }

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    gsap.to(el, { scale: 1, duration: 0.18, ease: "power2.out" });

    const axis = st.axis;
    const targetIndex = st.targetIndex;

    let shouldSwap = false;
    if (
      axis !== null &&
      targetIndex !== null &&
      targetIndex >= 0 &&
      targetIndex < totalCells
    ) {
      let travel = axis === "x" ? dx : dy;
      travel *= st.sign;
      travel = Math.max(0, Math.min(st.max, travel));
      shouldSwap = travel > st.max * 0.3;

      if (shouldSwap) {
        if (targetIndex === activeCellIndex) {
          setHasTileEnteredActiveCell(true);
        }
        setTilePos((prev) => ({ ...prev, [id]: targetIndex }));
      }
    }

    // Always snap back if no swap happened so a tile can never rest between cells.
    if (!shouldSwap) {
      gsap.to(el, {
        x: st.baseX,
        y: st.baseY,
        duration: 0.22,
        ease: "power3.out",
      });
    }

    dragState.current.id = null;
    dragState.current.axis = null;
    dragState.current.targetIndex = null;
    dragState.current.pointerId = null;
  };

  const onBoardPointerCancel = (e: React.PointerEvent) => {
    // treat cancel as release
    onBoardPointerUp(e);
  };

  const shuffleTiles = () => {
    const indices = Array.from({ length: totalCells }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const next: Record<string, number> = {};
    tiles.forEach((t, i) => (next[t.id] = indices[i]));
    if (Object.values(next).includes(activeCellIndex)) {
      setHasTileEnteredActiveCell(true);
    }
    setTilePos(next);
  };

  return (
    <main
      ref={rootRef}
      className={`min-h-screen w-full overflow-x-hidden bg-white text-[#111]${
        isHorizontalLayout ? " flex h-screen w-screen items-center justify-center overflow-hidden" : ""
      }${isFinePointer ? " custom-cursor-scope" : ""}`}
    >
      {isFinePointer ? (
        <div
          ref={cursorDotRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[160] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference opacity-0"
        />
      ) : null}
      {isLoading ? (
        <div
          ref={loaderOverlayRef}
          className="fixed inset-0 z-[120] bg-white"
          aria-live="polite"
          aria-label="Loading portfolio"
        >
          <div
            ref={loaderContentRef}
            className="fixed z-[122] -translate-y-1/2 break-words text-left whitespace-normal [overflow-wrap:anywhere] md:break-normal md:whitespace-nowrap md:[overflow-wrap:normal]"
            style={{ left: 0, top: 0, opacity: 0 }}
          >
            <div className="text-[clamp(20px,2.3vw,26px)] font-medium tracking-[0.02em] text-[#111]">
              <span>{loaderTypeText.slice(0, loaderTypeChars)}</span>
              {loaderTypeChars < loaderTypeText.length ? (
                <span
                  ref={loaderCursorRef}
                  aria-hidden="true"
                  className="ml-1 inline-block w-[0.75ch]"
                >
                  _
                </span>
              ) : null}
              <br />
              <span>{loaderSublineText.slice(0, loaderSublineChars)}</span>
              {loaderTypeChars >= loaderTypeText.length &&
              loaderSublineChars < loaderSublineText.length ? (
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
              alt={`Loading gallery image ${loaderImageIndex + 1}`}
              fill
              sizes={`${Math.max(120, Math.round(cell))}px`}
              className="object-cover"
              priority
            />
          </div>
        </div>
      ) : null}
      <h1 className="sr-only">
        Ayu Koene portfolio, strategic designer focused on innovation, service design, and
        product design.
      </h1>
      <div
        className={
          isHorizontalLayout
            ? "flex min-h-0 flex-row flex-nowrap"
            : "flex min-h-screen flex-col"
        }
        style={
          isHorizontalLayout
            ? {
                width: "100vw",
                height: "100vh",
                maxWidth: `${desktopViewportCap.width}px`,
                maxHeight: `${desktopViewportCap.height}px`,
              }
            : undefined
        }
      >
        {/* Left half: puzzle full height; right padding matches second half left */}
        <div
          className={
            isHorizontalLayout
              ? `flex min-w-0 flex-1 basis-1/2 max-w-1/2 shrink-0 grow-0 flex-col ${splitPaneDesktopTabletPaddingClass}`
              : "flex min-w-0 flex-col px-5 pb-6 pt-8"
          }
        >
          <div
            data-entrance
            className={splitPaneHeaderClass}
          >
            <div className="pt-[2px]">
              <NumberBadge n={0} />
            </div>
            <span>Currently on display</span>
          </div>

          <div
            className={
              isHorizontalLayout
                ? "mt-5 flex w-full min-w-0 flex-1 min-h-0 flex-col"
                : "mt-5 flex w-full min-w-0 flex-col"
            }
          >
            <div
              className={
                isHorizontalLayout
                  ? "flex w-full min-w-0 flex-1 items-center"
                  : "flex w-full min-w-0"
              }
            >
              <div ref={boardWrapperRef} className="w-full min-w-0">
                <div
                  ref={boardRef}
                  data-entrance
                  className="relative select-none"
                  style={{
                    width: grid.cols * cell + (grid.cols - 1) * gap,
                    height: grid.rows * cell + (grid.rows - 1) * gap,
                  }}
                  onPointerMove={onBoardPointerMove}
                  onPointerUp={onBoardPointerUp}
                  onPointerCancel={onBoardPointerCancel}
                  aria-label="Sliding puzzle"
                >
                  {/* Grey base cells for all non-profile positions */}
                  {nonProfileCellIndices.map((idx) => {
                    const position = cellXY(idx, grid.cols, cell, gap);
                    return (
                      <div
                        key={`base-${idx}`}
                        data-pre-tile-cell
                        className="absolute rounded-[10px] border border-[#ededed] bg-transparent"
                        style={{
                          width: cell,
                          height: cell,
                          left: position.x,
                          top: position.y,
                        }}
                      />
                    );
                  })}

                  {/* Active empty cell indicator */}
                  {currentEmptyIndices
                    .filter((idx) => idx === activeCellIndex)
                    .map((idx) => {
                      const position = cellXY(idx, grid.cols, cell, gap);
                      return (
                      <div
                        key={`empty-${idx}`}
                        data-pre-tile-cell
                        className={`absolute rounded-[10px] border-[1.25px] border-[#cdcdcd] bg-transparent ${
                          hasTileEnteredActiveCell ? "" : "active-cell-pre-interaction-blink"
                        }`}
                        style={{
                          width: cell,
                          height: cell,
                          left: position.x,
                          top: position.y,
                        }}
                      >
                      <div
                        data-active-descriptor
                        className={`flex h-full w-full items-center justify-center p-1 text-center whitespace-pre-line text-[14px] font-normal leading-[1.35] ${
                          hasTileEnteredActiveCell ? "text-[#111]/42" : "text-[#111]/60"
                        } sm:p-4 sm:text-[12px]`}
                      >
                        <span>{activeCellHintText}</span>
                      </div>
                      </div>
                    );
                    })}

                  {/* Tiles */}
                  {tiles.map((tile) => {
                    const from = tilePos[tile.id];
                    const isActive = from === activeCellIndex;
                    const isProfileTile = tile.id === ayuTile.id;
                    const tileImageSrc = tile.thumb;
                    const touchAction = getTileTouchAction(from, currentEmptyIndices, grid.cols);
                    return (
                      <button
                        key={tile.id}
                        data-tile
                        data-tile-drop="true"
                        ref={(node) => {
                          tileRefs.current[tile.id] = node;
                        }}
                        type="button"
                        onPointerDown={onTilePointerDown(tile)}
                        className={[
                          "safari-transition-rounded absolute left-0 top-0 overflow-hidden",
                          isActive
                            ? "z-10 rounded-[10px] bg-[#f3f3f3] shadow-[0_0_0_2px_#e2e2e2,inset_0_1px_0_rgba(255,255,255,0.75)]"
                            : "rounded-[10px] bg-[#f3f3f3]",
                          !hasTileEnteredActiveCell && isActive ? "active-cell-pre-interaction-blink" : "",
                          "focus-visible:ring-2 focus-visible:ring-[#111]/20 outline-none",
                          "transition-opacity duration-200",
                        ].join(" ")}
                        style={{ width: cell, height: cell, touchAction }}
                        aria-label={`Tile: ${tile.title}`}
                      >
                        <div className="relative h-full w-full">
                          <Image
                            src={tileImageSrc}
                            alt={tile.title}
                            fill
                            sizes={`${Math.max(120, Math.round(cell))}px`}
                            className="safari-loading-fix object-cover"
                            priority={isProfileTile}
                            draggable={false}
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-white/0 transition duration-300 hover:bg-white/10" />
                      </button>
                    );
                  })}

                </div>
              </div>
            </div>
            <div
              data-entrance
              className={`${splitPaneFooterBaseClass} flex w-full text-[#111]/60 ${
                isHorizontalLayout
                  ? "flex-row flex-nowrap items-center gap-4"
                  : "flex-col items-start gap-2"
              }`}
            >
              <button
                type="button"
                onClick={shuffleTiles}
                className={`group inline-flex h-9 items-center gap-3 self-start rounded px-0 text-left cursor-pointer transition hover:text-[#111] focus-visible:outline focus-visible:ring-1 focus-visible:ring-[#111]/30 focus-visible:ring-offset-1 ${
                  isHorizontalLayout ? "shrink-0 whitespace-nowrap" : ""
                }`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[#111]/60">
                  !
                </span>
                <span className="underline-offset-2 group-hover:underline">Shuffle</span>
              </button>
              <div
                className={`text-left text-[#111]/55 ${
                  isHorizontalLayout ? "min-w-0 flex-1 whitespace-nowrap" : "w-full"
                }`}
              >
                Want to add a new project to my display?{" "}
                <a
                  href="mailto:ayukoene@gmail.com"
                  className={detailLinkClass}
                >
                  Send me a message.
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right half: left padding matches first half right */}
        <div
          className={
            isHorizontalLayout
              ? `flex min-w-0 flex-1 basis-1/2 max-w-1/2 shrink-0 grow-0 flex-col border-l border-[#111]/10 ${splitPaneDesktopTabletPaddingClass}`
              : "flex min-w-0 flex-col border-t border-[#111]/10 px-5 pb-8 pt-8"
          }
        >
          <div
            data-entrance
            className={isHorizontalLayout ? "min-h-0 flex-1 overflow-auto" : ""}
          >
            <div ref={activePanelRef}>
              {activeTile === null ? null : activeTile.isProfile ? (
                <div className="space-y-6">
                  <DetailSection marker={<NumberBadge n={1} />} title="Profile">
                    <p className={detailBodyClass}>{activeTile.description}</p>
                  </DetailSection>
                  <DetailSection marker={<NumberBadge n={2} />} title="Education">
                    <div className={detailBodyClass}>
                      <div>
                        <a
                          href="https://www.masterdigitaldesign.com/alumni/ayu-koene"
                          target="_blank"
                          rel="noreferrer"
                          className={detailLinkClass}
                        >
                          MSc Digital Design
                        </a>{" "}
                        · Amsterdam University of Applied Sciences
                      </div>
                      <div>
                        BSc Mechanical Engineering · University of Twente &amp; Vrije Universiteit
                        Amsterdam
                      </div>
                    </div>
                  </DetailSection>
                  <DetailSection marker={<NumberBadge n={3} />} title="Capabilities">
                    <div className={detailBodyClass}>
                    Strategy & product vision · Service & experience design · Hands-on prototyping & making · Systems thinking · Visual & interaction design · Research & synthesis · AI as creative tool · Engineering & technical collaboration
                    </div>
                  </DetailSection>
                  <DetailSection marker={<PlusBadge />} title="Latest explorations">
                    <div className={detailBodyClass}>Vibe coding</div>
                  </DetailSection>
                </div>
              ) : (
                <div className="space-y-6">
                  <DetailSection marker={<NumberBadge n={1} />} title={activeTile.title}>
                    <div className={detailBodyClass}>
                      <div>{activeTile.roleLine}</div>
                      <p className="mt-1">{activeTile.description}</p>
                    </div>
                  </DetailSection>
                  {activeTile.bullets.length > 0 ? (
                    <DetailSection marker={<NumberBadge n={2} />} title="Key points">
                      <div className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]">
                        {activeTile.bullets.map((b) => (
                          <div key={b}>{b}</div>
                        ))}
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "brnd" ? (
                    <DetailSection marker={<PlusBadge />} title="Recent builds">
                      <div className={detailBodyClass}>
                        <div>
                          <a
                            href="https://br-ndpeople.com"
                            target="_blank"
                            rel="noreferrer"
                            className={detailLinkClass}
                          >
                            Website refresh
                          </a>
                        </div>
                        <div>
                          <a
                            href="https://www.br-ndpeople.com/whats-new/23plusone-happiness-scan"
                            target="_blank"
                            rel="noreferrer"
                            className={detailLinkClass}
                          >
                            23plusone happiness scan + research dashboard platform
                          </a>
                        </div>
                        <div>Credits: Sinyo Koene | Software Engineer · Data Analyst</div>
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "do" ? (
                    <DetailSection marker={<PlusBadge />} title="Credits">
                      <div className={detailBodyClass}>
                        <a
                          href="https://www.masterdigitaldesign.com/alumni/victor-jimoh-2"
                          target="_blank"
                          rel="noreferrer"
                          className={detailLinkClass}
                        >
                          Victor Jimoh · UX/UI Design
                        </a>
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "stroll" ? (
                    <DetailSection marker={<PlusBadge />} title="Credits">
                      <div className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]">
                        <div>
                          <a
                            href="https://mehmetberkbostanci.com/"
                            target="_blank"
                            rel="noreferrer"
                            className={detailLinkClass}
                          >
                            Mehmet Bostanci · Head Engineer
                          </a>
                        </div>
                        <div>
                          <a
                            href="https://www.danielklein.design/"
                            target="_blank"
                            rel="noreferrer"
                            className={detailLinkClass}
                          >
                            Dani Klein · Program Lead
                          </a>
                        </div>
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "tiny" ? (
                    <DetailSection marker={<PlusBadge />} title="Credits">
                      <div className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]">
                        <div>Stefan David von Franquemont · 3D Artist</div>
                        <div>Sinyo Koene · Software Engineer</div>
                        <div>Luz David von Franquemont · Storytelling</div>
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.links && activeTile.links.length > 0 ? (
                    <DetailSection marker={<PlusBadge />} title="More">
                      <div className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]">
                        {activeTile.links.map((link) => (
                          <div key={`${activeTile.id}-${link.label}-${link.href}`}>
                            <a
                              href={link.href}
                              target={link.href.startsWith("http") ? "_blank" : undefined}
                              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                              className={detailLinkClass}
                            >
                              {link.label}
                            </a>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <aside
            data-entrance
            className={
              isHorizontalLayout
                ? `${splitPaneFooterBaseClass} text-[#111]/55`
                : "mt-8 pt-0 text-[14px] text-[#111]/55 sm:text-[12px]"
            }
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#111]/15 text-[#111]/70">
                i
              </span>
              <div className="min-w-0 flex-1">
                <span className="block whitespace-normal break-words">
                  Ayu Koene · Amsterdam · Mexico · Remote · +31610672283 ·{" "}
                  <a
                    className={detailLinkClass}
                    href="mailto:ayukoene@gmail.com"
                  >
                    ayukoene@gmail.com
                  </a>{" "}
                  ·{" "}
                  <a
                    className={detailLinkClass}
                    href="https://nl.linkedin.com/in/ayu-koene-55b63718a"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Linkedin
                  </a>{" "}
                  ·{" "}
                  <a
                    className={detailLinkClass}
                    href="https://www.instagram.com/ayukoene?igsh=YWxpdG5tZHZ5MjA0&utm_source=qr"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
