"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type ProjectLink,
} from "@/app/portfolio-content";
import GalleryLinkCard from "@/components/portfolio/GalleryLinkCard";
import PortfolioLoaderOverlay from "@/components/portfolio/PortfolioLoaderOverlay";
import {
  AYU_GALLERY_DESCRIPTOR_PARTS,
  AYU_GALLERY_HEADING,
  AYU_PERSONAL_IMAGE_ORDER,
  AYU_PROJECT_IMAGE_ORDER,
  MOBILE_GALLERY_OVERLAY_TOP,
  PROJECT_GALLERY_VIDEOS,
  TINY_ROW_IMAGE_ORDER,
  TINY_TRAITS_IMAGE,
  detailBodyClass,
  detailLinkClass,
  detailMarkerSlotClass,
  galleryBentoGridClass,
  inlineActionControlClass,
  markerBadgeClass,
  openCaseButtonClass,
  overlayCleanupBufferMs,
  overlayMotionDurationMs,
  overlaySettleEase,
  overlayTileLeadSeconds,
  splitPaneDesktopTabletPaddingClass,
  splitPaneFooterBaseClass,
  splitPaneHeaderClass,
} from "@/components/portfolio/constants";
import {
  cellXY,
  getEaseTimeProgressForDistanceProgress,
  getGalleryBentoSpanClass,
  getTileTouchAction,
  hasMetadataValue,
  isAdjacent,
  isArticleLink,
  isExplainerVideoLink,
  isGalleryMediaVideo,
  isPaperLink,
  isPortfolioPdfLink,
  isResearchPaperLink,
  type GridSize,
} from "@/components/portfolio/helpers";
import { DetailSection, NumberBadge, PlusBadge } from "@/components/portfolio/primitives";
import { usePortfolioLoader } from "@/components/portfolio/usePortfolioLoader";
type PortfolioClientProps = {
  initialTileId: string | null;
};

export default function PortfolioClient({ initialTileId }: PortfolioClientProps) {
  const tiles = TILES;
  const requestedTileId = initialTileId;
  const loadingGallery = LOADING_GALLERY;
  const loaderTypeText = LOADER_TYPE_TEXT;
  const loaderSublineText = LOADER_SUBLINE_TEXT;
  const activeCellHintText = ACTIVE_CELL_HINT_TEXT;
  const ayuTile = AYU_TILE;

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const {
    rootRef,
    loaderOverlayRef,
    loaderContentRef,
    loaderImageFrameRef,
    loaderCursorRef,
    loaderSublineCursorRef,
    isLoading,
    loaderTypeChars,
    loaderSublineChars,
    loaderImageIndex,
  } = usePortfolioLoader({
    loadingGallery,
    loaderTypeText,
    loaderSublineText,
  });
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isNextProjectHovering, setIsNextProjectHovering] = useState(false);
  const [isCloseCaseHovering, setIsCloseCaseHovering] = useState(false);
  const [isOpenCaseHovering, setIsOpenCaseHovering] = useState(false);
  const [isGalleryOpeningTransition, setIsGalleryOpeningTransition] = useState(false);

  // puzzle refs
  const boardRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activePanelRef = useRef<HTMLDivElement | null>(null);
  const floatingTileRef = useRef<HTMLDivElement | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const prevActiveIdRef = useRef<string | null>(null);
  const galleryOpeningTransitionTimeoutRef = useRef<number | null>(null);

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

  // puzzle state: tile -> cellIndex (6 tiles; 3 cells empty at 2,4,6)
  const [tilePos, setTilePos] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const order = [4, 8, 7, 3, 6, 0]; // empties at top-middle, top-right, middle-right
    tiles.forEach((t, i) => (initial[t.id] = order[i]));

    if (!requestedTileId) return initial;

    const requestedTile = tiles.find((tile) => tile.id === requestedTileId);
    if (!requestedTile) return initial;

    const requestedTileIndex = initial[requestedTile.id];
    if (requestedTileIndex === activeCellIndex) return initial;

    const tileAtActiveCell = tiles.find((tile) => initial[tile.id] === activeCellIndex);
    initial[requestedTile.id] = activeCellIndex;
    if (tileAtActiveCell) {
      initial[tileAtActiveCell.id] = requestedTileIndex;
    }
    return initial;
  });
  const [hasTileEnteredActiveCell, setHasTileEnteredActiveCell] = useState(() =>
    Boolean(requestedTileId && tiles.some((tile) => tile.id === requestedTileId))
  );
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
  }, [
    ayuTile.id,
    cell,
    gap,
    grid.cols,
    isLoading,
    loaderContentRef,
    loaderImageFrameRef,
    profileTileIndex,
    splitLayoutBreakpoint,
  ]);

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
  const [hasOpenedGallery, setHasOpenedGallery] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTileId, setGalleryTileId] = useState<string | null>(null);
  const [desktopOverlayLeft, setDesktopOverlayLeft] = useState<number>(0);
  const [floatingTileRect, setFloatingTileRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const galleryTile = useMemo(
    () => (galleryTileId ? tiles.find((tile) => tile.id === galleryTileId) ?? null : null),
    [galleryTileId, tiles]
  );
  const galleryProjectTiles = useMemo(() => tiles, [tiles]);
  const nextGalleryProject = useMemo(() => {
    if (galleryProjectTiles.length === 0) return null;
    if (!galleryTile) return galleryProjectTiles[0] ?? null;
    const currentIndex = galleryProjectTiles.findIndex((tile) => tile.id === galleryTile.id);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % galleryProjectTiles.length : 0;
    return galleryProjectTiles[nextIndex] ?? null;
  }, [galleryProjectTiles, galleryTile]);
  const visibleCursorPreviewImageSrc =
    isGalleryOpen && isNextProjectHovering ? nextGalleryProject?.thumb ?? null : null;
  const isOpenCaseCursorVisible =
    !isGalleryOpen &&
    isOpenCaseHovering &&
    !isCloseCaseHovering &&
    !Boolean(visibleCursorPreviewImageSrc);
  const isCloseCaseCursorVisible =
    isGalleryOpen &&
    !isGalleryOpeningTransition &&
    isCloseCaseHovering &&
    !Boolean(visibleCursorPreviewImageSrc);
  const isGalleryLifecycleActive = galleryTileId !== null;
  const activeTileImages = useMemo(() => {
    if (!activeTile) return [];
    const sequence = PROJECT_IMAGE_SEQUENCES[activeTile.id] ?? [];
    const sourceImages = sequence.length > 0 ? sequence : [activeTile.thumb];
    return sourceImages.filter((imageSrc) => imageSrc !== activeTile.thumb);
  }, [activeTile]);
  const galleryImages = useMemo(() => {
    if (!galleryTile) return [];
    const sequence = PROJECT_IMAGE_SEQUENCES[galleryTile.id] ?? [];
    const sourceImages = sequence.length > 0 ? sequence : [galleryTile.thumb];
    return sourceImages.filter((imageSrc) => imageSrc !== galleryTile.thumb);
  }, [galleryTile]);
  const tinySequenceImages = useMemo(() => {
    if (!galleryTile || galleryTile.id !== "tiny") return [];
    const sequence = PROJECT_IMAGE_SEQUENCES[galleryTile.id] ?? [];
    const sourceImages = sequence.length > 0 ? sequence : [galleryTile.thumb];
    return Array.from(new Set(sourceImages.filter((imageSrc) => imageSrc !== galleryTile.thumb)));
  }, [galleryTile]);
  const galleryStandaloneImages = useMemo(() => {
    if (!galleryTile || galleryTile.id !== "tiny") return galleryImages;
    const hiddenTinyImages = new Set<string>([TINY_TRAITS_IMAGE, ...TINY_ROW_IMAGE_ORDER]);
    return tinySequenceImages.filter((imageSrc) => !hiddenTinyImages.has(imageSrc));
  }, [galleryImages, galleryTile, tinySequenceImages]);
  const ayuGalleryImages = useMemo(() => {
    if (!galleryTile || galleryTile.id !== "ayu") return [];
    const sequence = PROJECT_IMAGE_SEQUENCES[galleryTile.id] ?? [];
    const sourceImages = sequence.length > 0 ? sequence : [galleryTile.thumb];
    return Array.from(new Set(sourceImages));
  }, [galleryTile]);
  const ayuPersonalImages = useMemo(() => {
    if (!galleryTile || galleryTile.id !== "ayu") return [];
    return AYU_PERSONAL_IMAGE_ORDER.filter((src) => ayuGalleryImages.includes(src));
  }, [ayuGalleryImages, galleryTile]);
  const ayuProjectImages = useMemo(() => {
    if (!galleryTile || galleryTile.id !== "ayu") return [];
    return AYU_PROJECT_IMAGE_ORDER.filter((src) => ayuGalleryImages.includes(src));
  }, [ayuGalleryImages, galleryTile]);
  const galleryVideoSrc = useMemo(
    () => (galleryTile ? PROJECT_GALLERY_VIDEOS[galleryTile.id] ?? null : null),
    [galleryTile]
  );
  const doGalleryLinks = useMemo(() => {
    if (!galleryTile || galleryTile.id !== "do") return null;
    const links = galleryTile.links ?? [];
    const explainer = links.find((link) => isExplainerVideoLink(link));
    const article = links.find((link) => isArticleLink(link));
    const paper = links.find((link) => isPaperLink(link));
    const usedLinks = new Set([explainer, article, paper].filter(Boolean));
    const remaining = links.filter((link) => !usedLinks.has(link));
    return { explainer, article, paper, remaining };
  }, [galleryTile]);
  const doGalleryBentoLinks = useMemo(() => {
    if (!doGalleryLinks) return [];
    const orderedLinks: ProjectLink[] = [];
    if (doGalleryLinks.explainer) orderedLinks.push(doGalleryLinks.explainer);
    if (doGalleryLinks.article) orderedLinks.push(doGalleryLinks.article);
    if (doGalleryLinks.paper) orderedLinks.push(doGalleryLinks.paper);
    orderedLinks.push(...doGalleryLinks.remaining);
    return orderedLinks;
  }, [doGalleryLinks]);
  const hasGallery = Boolean(
    activeTile &&
      (activeTileImages.length > 0 ||
        Boolean(PROJECT_GALLERY_VIDEOS[activeTile.id]) ||
        Boolean(activeTile.links && activeTile.links.length > 0))
  );
  const shouldShowDesktopOpenCaseButton =
    isHorizontalLayout &&
    hasTileEnteredActiveCell &&
    hasGallery &&
    !isGalleryOpen &&
    !hasOpenedGallery;
  const galleryOverlayTop = isHorizontalLayout ? 0 : MOBILE_GALLERY_OVERLAY_TOP;
  const galleryContentTopPadding = floatingTileRect
    ? Math.max(0, Math.round(floatingTileRect.top - galleryOverlayTop + floatingTileRect.height))
    : Math.round(cell);

  const getTileRect = useCallback((tileId: string) => {
    const tileEl = tileRefs.current[tileId];
    if (!tileEl) return null;
    const rect = tileEl.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const clearGalleryOpeningTransitionTimeout = useCallback(() => {
    if (galleryOpeningTransitionTimeoutRef.current === null) return;
    window.clearTimeout(galleryOpeningTransitionTimeoutRef.current);
    galleryOpeningTransitionTimeoutRef.current = null;
  }, []);

  const closeGallery = useCallback(() => {
    clearGalleryOpeningTransitionTimeout();
    setIsGalleryOpeningTransition(false);
    setIsNextProjectHovering(false);
    setIsCloseCaseHovering(false);
    setIsOpenCaseHovering(false);
    setIsGalleryOpen(false);
  }, [clearGalleryOpeningTransitionTimeout]);

  const openGallery = () => {
    if (!activeTile) return;
    const rect = getTileRect(activeTile.id);
    clearGalleryOpeningTransitionTimeout();
    setHasOpenedGallery(true);
    setIsGalleryOpeningTransition(true);
    setIsNextProjectHovering(false);
    setIsCloseCaseHovering(false);
    setIsOpenCaseHovering(false);
    if (rect) {
      setFloatingTileRect(rect);
    }
    setGalleryTileId(activeTile.id);
    setIsGalleryOpen(true);
    galleryOpeningTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsGalleryOpeningTransition(false);
      galleryOpeningTransitionTimeoutRef.current = null;
    }, overlayMotionDurationMs);
  };

  useEffect(() => {
    return () => {
      if (galleryOpeningTransitionTimeoutRef.current === null) return;
      window.clearTimeout(galleryOpeningTransitionTimeoutRef.current);
      galleryOpeningTransitionTimeoutRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isGalleryOpen) return;
    const timeoutId = window.setTimeout(() => {
      setGalleryTileId(null);
      setFloatingTileRect(null);
    }, overlayMotionDurationMs + overlayCleanupBufferMs);
    return () => window.clearTimeout(timeoutId);
  }, [isGalleryOpen]);

  useEffect(() => {
    if (!isGalleryOpen || !galleryTileId) return;
    const scroller = galleryScrollRef.current;
    if (!scroller) return;
    scroller.scrollTop = 0;
  }, [galleryTileId, isGalleryOpen]);

  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGallery();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeGallery, isGalleryOpen]);

  useEffect(() => {
    if (!galleryTileId || !floatingTileRect) return;
    const floatingEl = floatingTileRef.current;
    if (!floatingEl) return;

    gsap.killTweensOf(floatingEl);
    const motionDurationSeconds = overlayMotionDurationMs / 1000;

    if (isGalleryOpen) {
      const boardRect = boardRef.current?.getBoundingClientRect();
      const targetLeft =
        isHorizontalLayout
          ? desktopOverlayLeft - floatingTileRect.width - gap
          : floatingTileRect.left;
      const targetTop =
        isHorizontalLayout && boardRect ? boardRect.top : floatingTileRect.top;
      const shiftX = targetLeft - floatingTileRect.left;
      const shiftY = targetTop - floatingTileRect.top;
      const overlayStartLeft = typeof window === "undefined" ? 0 : window.innerWidth;
      const overlayEndLeft = desktopOverlayLeft;
      const tileCollisionLeft = floatingTileRect.left + floatingTileRect.width + gap;
      const overlayTravelDistance = Math.max(0, overlayStartLeft - overlayEndLeft);
      const overlayTravelToCollision = Math.max(0, overlayStartLeft - tileCollisionLeft);
      const collisionDistanceProgress =
        overlayTravelDistance > 0 ? overlayTravelToCollision / overlayTravelDistance : 0;
      const collisionTimeProgress = isHorizontalLayout
        ? getEaseTimeProgressForDistanceProgress(collisionDistanceProgress)
        : 0;
      const collisionAlignedDelaySeconds = Math.min(
        Math.max(0, motionDurationSeconds - 0.12),
        motionDurationSeconds * collisionTimeProgress
      );
      const openDelaySeconds = Math.max(
        0,
        collisionAlignedDelaySeconds - overlayTileLeadSeconds
      );
      const openDurationSeconds = Math.max(0.12, motionDurationSeconds - openDelaySeconds);

      gsap.set(floatingEl, { x: 0, y: 0, scale: 1, autoAlpha: 1 });
      gsap.to(floatingEl, {
        x: shiftX,
        y: shiftY,
        scale: 1,
        delay: openDelaySeconds,
        duration: openDurationSeconds,
        ease: overlaySettleEase,
        overwrite: "auto",
      });
      return;
    }

    gsap.set(floatingEl, { autoAlpha: 1, scale: 1 });
    gsap.to(floatingEl, {
      x: 0,
      y: 0,
      duration: motionDurationSeconds,
      ease: overlaySettleEase,
      overwrite: "auto",
    });
  }, [
    desktopOverlayLeft,
    floatingTileRect,
    gap,
    galleryTileId,
    isGalleryOpen,
    isHorizontalLayout,
  ]);

  useEffect(() => {
    if (!isHorizontalLayout) return;
    const syncDesktopOverlayLeft = () => {
      const viewportWidth = window.innerWidth;
      const minOverlayWidth = Math.max(320, Math.min(520, Math.round(viewportWidth * 0.38)));
      const maxLeft = Math.max(0, viewportWidth - minOverlayWidth);

      const board = boardRef.current;
      if (!board) {
        const fallbackLeft = Math.max(0, Math.min(Math.round(viewportWidth * 0.34), maxLeft));
        setDesktopOverlayLeft((prev) => (prev === fallbackLeft ? prev : fallbackLeft));
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const secondColumnLeft = boardRect.left + cell + gap;
      const clampedLeft = Math.max(0, Math.min(Math.round(secondColumnLeft), maxLeft));
      setDesktopOverlayLeft((prev) => (prev === clampedLeft ? prev : clampedLeft));
    };

    syncDesktopOverlayLeft();
    window.addEventListener("resize", syncDesktopOverlayLeft);

    return () => {
      window.removeEventListener("resize", syncDesktopOverlayLeft);
    };
  }, [cell, gap, isHorizontalLayout]);

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
    if (isGalleryOpen) return;
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
    if (isGalleryOpen) return;
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
    if (isGalleryOpen) {
      dragState.current.id = null;
      dragState.current.axis = null;
      dragState.current.targetIndex = null;
      dragState.current.pointerId = null;
      return;
    }
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

  // Keyboard parity for tile movement: arrow keys move toward an adjacent empty cell.
  const moveTileToIndex = (tileId: string, targetIndex: number) => {
    if (isGalleryOpen) return false;
    const from = tilePos[tileId];
    if (typeof from !== "number") return false;
    if (!isAdjacent(from, targetIndex, grid.cols)) return false;
    if (!currentEmptyIndices.includes(targetIndex)) return false;
    if (targetIndex === activeCellIndex) {
      setHasTileEnteredActiveCell(true);
    }
    setTilePos((prev) => ({ ...prev, [tileId]: targetIndex }));
    return true;
  };

  const moveTileIntoActiveCell = useCallback(
    (tileId: string) => {
      setHasTileEnteredActiveCell(true);
      setTilePos((prev) => {
        const targetIndex = prev[tileId];
        if (typeof targetIndex !== "number") return prev;
        if (targetIndex === activeCellIndex) return prev;

        const next = { ...prev };
        const currentActiveTileId = tiles.find((tile) => prev[tile.id] === activeCellIndex)?.id;
        next[tileId] = activeCellIndex;
        if (currentActiveTileId) {
          next[currentActiveTileId] = targetIndex;
        }
        return next;
      });
    },
    [activeCellIndex, tiles]
  );

  const setActiveTileById = (tileId: string) => {
    if (isGalleryOpen) return;
    moveTileIntoActiveCell(tileId);
  };

  const openNextGalleryProject = useCallback(() => {
    if (!nextGalleryProject) return;
    const rect = activeTile ? getTileRect(activeTile.id) : getTileRect(nextGalleryProject.id);
    if (rect) {
      setFloatingTileRect(rect);
    }
    setGalleryTileId(nextGalleryProject.id);
    moveTileIntoActiveCell(nextGalleryProject.id);
  }, [activeTile, getTileRect, moveTileIntoActiveCell, nextGalleryProject]);

  const onTileKeyDown = (tile: Project) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isGalleryOpen) return;
    const from = tilePos[tile.id];
    if (typeof from !== "number") return;

    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
    }

    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      const firstAdjacentEmpty = currentEmptyIndices.find((emptyIdx) =>
        isAdjacent(from, emptyIdx, grid.cols)
      );
      if (typeof firstAdjacentEmpty === "number") {
        moveTileToIndex(tile.id, firstAdjacentEmpty);
      }
      return;
    }

    let targetIndex: number | null = null;
    const column = from % grid.cols;

    if (event.key === "ArrowLeft" && column > 0) {
      targetIndex = from - 1;
    } else if (event.key === "ArrowRight" && column < grid.cols - 1) {
      targetIndex = from + 1;
    } else if (event.key === "ArrowUp" && from - grid.cols >= 0) {
      targetIndex = from - grid.cols;
    } else if (event.key === "ArrowDown" && from + grid.cols < totalCells) {
      targetIndex = from + grid.cols;
    }

    if (typeof targetIndex === "number") {
      moveTileToIndex(tile.id, targetIndex);
    }
  };

  const shuffleTiles = () => {
    if (isGalleryOpen) return;
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

  const renderProjectDescription = (description: string) => {
    const [tagline, ...rest] = description.split(" · ");
    if (rest.length === 0) return description;
    return (
      <>
        {tagline}
        <br />
        {rest.join(" · ")}
      </>
    );
  };
  return (
    <main
      id="main-content"
      ref={rootRef}
      className={`min-h-screen w-full overflow-x-hidden bg-white text-[#111]${
        isHorizontalLayout ? " flex h-screen w-screen items-center justify-center overflow-hidden" : ""
      }${isFinePointer ? " custom-cursor-scope" : ""}`}
      aria-busy={isLoading}
    >
      {isFinePointer ? (
        <div
          ref={cursorDotRef}
          aria-hidden="true"
          className={`pointer-events-none fixed left-0 top-0 z-[160] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-[width,height,border-radius,box-shadow,background-color] duration-200 ${
            visibleCursorPreviewImageSrc
              ? "overflow-hidden rounded-[10px] bg-[#f3f3f3] bg-cover bg-center bg-no-repeat mix-blend-normal"
              : isOpenCaseCursorVisible
                ? "flex h-[110px] w-[110px] items-center justify-center rounded-full border border-[#111]/14 bg-white/92 mix-blend-difference"
              : isCloseCaseCursorVisible
                ? "flex h-[110px] w-[110px] items-center justify-center rounded-full border border-[#111]/14 bg-white/92 mix-blend-difference"
              : "h-2.5 w-2.5 rounded-full bg-white mix-blend-difference"
          }`}
          style={
            visibleCursorPreviewImageSrc
              ? {
                  backgroundImage: `url(${visibleCursorPreviewImageSrc})`,
                  width: cell,
                  height: cell,
                }
              : undefined
          }
        >
          {isOpenCaseCursorVisible ? (
            <span className="px-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-[#111]/72">
              open case
            </span>
          ) : null}
          {isCloseCaseCursorVisible ? (
            <span className="px-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-[#111]/72">
              close case
            </span>
          ) : null}
        </div>
      ) : null}
      <PortfolioLoaderOverlay
        isLoading={isLoading}
        loadingGallery={loadingGallery}
        loaderImageIndex={loaderImageIndex}
        loaderTypeText={loaderTypeText}
        loaderTypeChars={loaderTypeChars}
        loaderSublineText={loaderSublineText}
        loaderSublineChars={loaderSublineChars}
        cell={cell}
        loaderOverlayRef={loaderOverlayRef}
        loaderContentRef={loaderContentRef}
        loaderImageFrameRef={loaderImageFrameRef}
        loaderCursorRef={loaderCursorRef}
        loaderSublineCursorRef={loaderSublineCursorRef}
      />
      <h1 className="sr-only">
        Ayu Koene portfolio, strategic designer focused on innovation, service design, and
        product design.
      </h1>
      {/* Announces tile-detail changes without exposing extra visual UI. */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {activeTile ? `Showing details for ${activeTile.title}.` : "No project is selected."}
      </p>
      <div
        className={
          isHorizontalLayout
            ? "relative flex min-h-0 flex-row flex-nowrap justify-between border-y border-[#111]/12"
            : "relative flex min-h-screen flex-col border-y border-[#111]/12"
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
        <section
          aria-labelledby="display-heading"
          className={
            isHorizontalLayout
              ? `flex min-w-0 flex-1 basis-1/2 max-w-1/2 shrink-0 grow-0 flex-col ${splitPaneDesktopTabletPaddingClass}`
              : "flex min-w-0 flex-col px-5 pb-6 pt-8"
          }
        >
          <header
            data-entrance
            className={splitPaneHeaderClass}
          >
            <div className={detailMarkerSlotClass}>
              <NumberBadge n={0} />
            </div>
            <h2 id="display-heading" className="sr-only">
              Currently on display
            </h2>
            <span aria-hidden="true">Currently on display</span>
          </header>

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
                {/* Screen reader instruction block for keyboard puzzle controls. */}
                <p id="puzzle-instructions" className="sr-only">
                  Sliding puzzle. Use arrow keys while focused on a tile to move it toward an
                  adjacent empty space. Press Enter or Space to move a tile to any adjacent empty
                  space.
                </p>
                <div
                  ref={boardRef}
                  id="project-puzzle-board"
                  data-entrance
                  className="relative select-none"
                  role="region"
                  aria-roledescription="sliding puzzle"
                  style={{
                    width: grid.cols * cell + (grid.cols - 1) * gap,
                    height: grid.rows * cell + (grid.rows - 1) * gap,
                  }}
                  onPointerMove={onBoardPointerMove}
                  onPointerUp={onBoardPointerUp}
                  onPointerCancel={onBoardPointerCancel}
                  aria-label="Project tiles"
                  aria-describedby="puzzle-instructions"
                >
                  {/* Grey base cells for all non-profile positions */}
                  {nonProfileCellIndices.map((idx) => {
                    const position = cellXY(idx, grid.cols, cell, gap);
                    return (
                      <div
                        key={`base-${idx}`}
                        data-pre-tile-cell
                        aria-hidden="true"
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
                        aria-hidden="true"
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
                    const isGallerySourceTile = galleryTileId === tile.id;
                    const shouldFadeOutSourceTile = isGallerySourceTile && isGalleryOpen;
                    const shouldHideSourceTile =
                      isGallerySourceTile && isGalleryLifecycleActive;
                    const isMovable = currentEmptyIndices.some((emptyIdx) =>
                      isAdjacent(from, emptyIdx, grid.cols)
                    );
                    const touchAction = isGalleryOpen
                      ? "auto"
                      : getTileTouchAction(from, currentEmptyIndices, grid.cols);
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
                        onKeyDown={onTileKeyDown(tile)}
                        className={[
                          "safari-transition-rounded absolute left-0 top-0 overflow-hidden",
                          isActive ? "z-10" : "",
                          isActive
                            ? "rounded-[10px] bg-[#f3f3f3] shadow-[0_0_0_2px_#e2e2e2,inset_0_1px_0_rgba(255,255,255,0.75)]"
                            : "rounded-[10px] bg-[#f3f3f3]",
                          shouldHideSourceTile ? "opacity-0" : "opacity-100",
                          shouldHideSourceTile && !shouldFadeOutSourceTile ? "invisible" : "visible",
                          isGalleryOpen ? "pointer-events-none" : "",
                          !hasTileEnteredActiveCell && isActive ? "active-cell-pre-interaction-blink" : "",
                          "focus-visible:ring-2 focus-visible:ring-[#111]/20 outline-none",
                          shouldFadeOutSourceTile ? "transition-opacity duration-400" : "transition-none",
                        ].join(" ")}
                        style={{ width: cell, height: cell, touchAction }}
                        aria-label={isActive ? `Tile: ${tile.title}. Active detail tile.` : `Tile: ${tile.title}`}
                        aria-disabled={!isMovable || isGalleryOpen}
                        aria-describedby="puzzle-instructions"
                        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
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
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-white/0 transition duration-300 hover:bg-white/10"
                        />
                      </button>
                    );
                  })}

                </div>
              </div>
            </div>
            <div
              data-entrance
              className={`${splitPaneFooterBaseClass} flex w-full md:py-1 text-[#111]/60 ${
                isHorizontalLayout
                  ? "flex-row flex-nowrap items-center justify-between gap-4"
                  : "flex-col items-start gap-2"
              }`}
            >
              <button
                type="button"
                onClick={shuffleTiles}
                aria-controls="project-puzzle-board"
                disabled={isGalleryOpen}
                className={`${inlineActionControlClass} ${
                  isHorizontalLayout ? "shrink-0 whitespace-nowrap" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className={markerBadgeClass}
                >
                  !
                </span>
                <span className="underline-offset-2 group-hover:underline">Shuffle</span>
              </button>
              <div
                className={`text-left text-[#111]/55 ${
                  isHorizontalLayout ? "min-w-0 flex-1 lg:whitespace-nowrap" : "w-full"
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
        </section>

        {/* Right half: left padding matches first half right */}
        <section
          aria-labelledby="details-heading"
          className={
            isHorizontalLayout
              ? `flex min-w-0 flex-1 basis-1/2 max-w-1/2 shrink-0 grow-0 flex-col border-l border-[#111]/10 ${splitPaneDesktopTabletPaddingClass}`
              : "flex min-w-0 flex-col border-t border-[#111]/10 px-5 pb-8 pt-8"
          }
        >
          <h2 id="details-heading" className="sr-only">
            Selected project details
          </h2>
          <div
            data-entrance
            className={isHorizontalLayout ? "min-h-0 flex-1 overflow-auto" : ""}
          >
            <article ref={activePanelRef} aria-live="off">
              {activeTile === null ? null : activeTile.isProfile ? (
                <div className="space-y-6">
                  <DetailSection
                    marker={<NumberBadge n={1} />}
                    title={activeTile.title}
                    headingId="details-profile"
                  >
                    <div className={detailBodyClass}>
                      <div>{activeTile.roleLine}</div>
                      <p className="mt-1">{renderProjectDescription(activeTile.description)}</p>
                    </div>
                  </DetailSection>
                  <DetailSection
                    marker={<NumberBadge n={2} />}
                    title="Capabilities"
                    headingId="details-capabilities"
                  >
                    <div
                      className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]"
                      role="list"
                    >
                      <div role="listitem">
                        Strategy & product vision · Service & experience design · Hands-on
                        prototyping & making · Systems thinking · Visual & interaction design ·
                        Research & synthesis · AI as creative tool · Engineering & technical
                        collaboration
                      </div>
                    </div>
                  </DetailSection>
                  <DetailSection
                    marker={<NumberBadge n={3} />}
                    title="Education"
                    headingId="details-education"
                  >
                    <div
                      className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]"
                      role="list"
                    >
                      <div role="listitem">
                        <a
                          href="https://www.masterdigitaldesign.com/alumni/ayu-koene"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={detailLinkClass}
                        >
                          MSc Digital Design
                        </a>{" "}
                        · Amsterdam University of Applied Sciences
                      </div>
                      <div role="listitem">
                        BSc Mechanical Engineering · University of Twente &amp; Vrije Universiteit
                        Amsterdam
                      </div>
                    </div>
                  </DetailSection>
                  <DetailSection
                    marker={<PlusBadge />}
                    title="Latest explorations"
                    headingId="details-latest-explorations"
                  >
                    <div className={`${detailBodyClass} space-y-2`}>
                      <div>Prompt-driven prototyping</div>
                      <div>
                        <a
                          href="?tile=brnd"
                          onClick={(event) => {
                            event.preventDefault();
                            setActiveTileById("brnd");
                          }}
                          aria-controls="project-puzzle-board"
                          className={detailLinkClass}
                        >
                          View current work at BR-ND People
                        </a>
                      </div>
                    </div>
                  </DetailSection>
                </div>
              ) : (
                <div className="space-y-6">
                  <DetailSection
                    marker={<NumberBadge n={1} />}
                    title={activeTile.title}
                    headingId={`details-${activeTile.id}-overview`}
                  >
                    <div className={detailBodyClass}>
                      <div>{activeTile.roleLine}</div>
                      <p className="mt-1">{renderProjectDescription(activeTile.description)}</p>
                    </div>
                  </DetailSection>
                  {activeTile.bullets.length > 0 ? (
                    <DetailSection
                      marker={<NumberBadge n={2} />}
                      title="Key points"
                      headingId={`details-${activeTile.id}-key-points`}
                    >
                      <div
                        className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]"
                        role="list"
                      >
                        {activeTile.bullets.map((b) => (
                          <div key={b} role="listitem">
                            {b}
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "do" ? (
                    <DetailSection
                      marker={<PlusBadge />}
                      title="Credits"
                      headingId="details-do-credits"
                    >
                      <div className={detailBodyClass}>
                        <a
                          href="https://www.masterdigitaldesign.com/alumni/victor-jimoh-2"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={detailLinkClass}
                        >
                          Victor Jimoh · UX/UI Design
                        </a>
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "stroll" ? (
                    <DetailSection
                      marker={<PlusBadge />}
                      title="Credits"
                      headingId="details-stroll-credits"
                    >
                      <div
                        className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]"
                        role="list"
                      >
                        <div role="listitem">
                          <a
                            href="https://mehmetberkbostanci.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={detailLinkClass}
                          >
                            Mehmet Bostanci · Head Engineer
                          </a>
                        </div>
                        <div role="listitem">
                          <a
                            href="https://www.danielklein.design/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={detailLinkClass}
                          >
                            Dani Klein · Program Lead
                          </a>
                        </div>
                      </div>
                    </DetailSection>
                  ) : null}
                  {activeTile.id === "tiny" ? (
                    <DetailSection
                      marker={<PlusBadge />}
                      title="Credits"
                      headingId="details-tiny-credits"
                    >
                      <div
                        className="mt-1 space-y-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]"
                        role="list"
                      >
                        <div role="listitem">
                          <a
                            href="https://web.archive.org/web/20210509064724/http://stefandavid.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={detailLinkClass}
                          >
                            Stefan David von Franquemont
                          </a>{" "}
                          · 3D Artist
                        </div>
                        <div role="listitem">Sinyo Koene · Software Engineer</div>
                        <div role="listitem">
                          <a
                            href="https://www.illuzione.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={detailLinkClass}
                          >
                            Luz David von Franquemont
                          </a>{" "}
                          · Storytelling
                        </div>
                      </div>
                    </DetailSection>
                  ) : null}
                </div>
              )}
              {activeTile && hasGallery ? (
                <div
                  data-active-line
                  className="mt-7 w-full"
                  style={{ height: cell }}
                >
                  <div className="relative h-full min-h-full w-full">
                    {!isHorizontalLayout || shouldShowDesktopOpenCaseButton ? (
                      <button
                        type="button"
                        onClick={openGallery}
                        aria-haspopup="dialog"
                        aria-controls="project-gallery-overlay"
                        aria-expanded={isGalleryOpen && galleryTileId === activeTile.id}
                        className={openCaseButtonClass}
                      >
                        Open case
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openGallery}
                        onPointerEnter={() => {
                          if (!isFinePointer) return;
                          setIsOpenCaseHovering(true);
                        }}
                        onPointerLeave={() => {
                          setIsOpenCaseHovering(false);
                        }}
                        aria-haspopup="dialog"
                        aria-controls="project-gallery-overlay"
                        aria-expanded={isGalleryOpen && galleryTileId === activeTile.id}
                        className="absolute inset-0 block h-full w-full rounded-[10px] bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25"
                      >
                        <span className="sr-only">Open case</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          </div>

          <aside
            data-entrance
            className={
              isHorizontalLayout
                ? `${splitPaneFooterBaseClass} text-[#111]/55`
                : "mt-8 pt-0 text-[14px] text-[#111]/55 sm:text-[12px]"
            }
          >
            <div className="flex w-full items-start justify-between gap-4 md:items-center md:py-1">
              <div className={`${detailMarkerSlotClass} shrink-0`}>
                <span
                  aria-hidden="true"
                  className={markerBadgeClass}
                >
                  i
                </span>
              </div>
              <address className="min-w-0 flex-1 not-italic">
                <p className="block whitespace-normal break-words lg:whitespace-nowrap lg:break-normal">
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
                    href="https://www.linkedin.com/in/ayukoene/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Linkedin
                  </a>{" "}
                  ·{" "}
                  <a
                    className={detailLinkClass}
                    href="https://www.instagram.com/ayukoene?igsh=YWxpdG5tZHZ5MjA0&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </p>
              </address>
            </div>
          </aside>
        </section>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-[100] bg-white transition-opacity duration-[820ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isGalleryOpen ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {galleryTile && floatingTileRect ? (
        <div
          ref={floatingTileRef}
          aria-hidden="true"
          className="safari-transition-rounded pointer-events-none fixed left-0 top-0 z-[132] overflow-hidden rounded-[10px] bg-[#f3f3f3] shadow-[0_24px_42px_rgba(17,17,17,0.2),0_0_0_1px_rgba(17,17,17,0.08),inset_0_1px_0_rgba(255,255,255,0.82)]"
          style={{
            left: floatingTileRect.left,
            top: floatingTileRect.top,
            width: floatingTileRect.width,
            height: floatingTileRect.height,
          }}
        >
          <div className="relative h-full w-full">
            <Image
              src={galleryTile.thumb}
              alt=""
              aria-hidden="true"
              fill
              sizes={`${Math.max(120, Math.round(floatingTileRect.width))}px`}
              className="safari-loading-fix object-cover"
            />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Close gallery overlay"
        onClick={closeGallery}
        onPointerEnter={() => {
          if (!isFinePointer) return;
          setIsCloseCaseHovering(true);
        }}
        onPointerLeave={() => {
          setIsCloseCaseHovering(false);
        }}
        className={`fixed inset-0 z-[108] transition-opacity duration-[820ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isGalleryOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="project-gallery-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={galleryTile ? `${galleryTile.title} gallery` : "Project gallery"}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className={`fixed z-[120] flex flex-col overflow-hidden border-l border-[#111]/12 bg-white transition-[transform,opacity] duration-[820ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isHorizontalLayout
            ? "right-0 top-0 bottom-0"
            : "left-0 right-0 bottom-0"
        } ${
          isGalleryOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={
          isHorizontalLayout
            ? {
                left: desktopOverlayLeft,
                transform: isGalleryOpen ? "translate3d(0,0,0)" : "translate3d(100%,0,0)",
              }
            : {
                top: MOBILE_GALLERY_OVERLAY_TOP,
                transform: isGalleryOpen ? "translate3d(0,0,0)" : "translate3d(0,100%,0)",
            }
        }
      >
        <div
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          ref={galleryScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-10 pb-8 md:px-14 md:pb-12"
          style={{ WebkitOverflowScrolling: "touch", paddingTop: galleryContentTopPadding }}
        >
          {galleryTile ? (
            <div className="space-y-4 md:space-y-5">
              {galleryTile.galleryHeader ? (
                <header className="w-full px-0 pt-0 pb-14 md:px-10 md:pt-0 md:pb-20">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(180px,0.5fr)_minmax(0,0.5fr)] md:gap-0">
                    {!isHorizontalLayout ? (
                      <button
                        type="button"
                        onClick={closeGallery}
                        className="w-fit inline-flex h-8 items-center rounded-full border border-[#111]/20 bg-white/90 px-3 text-[11px] uppercase tracking-[0.14em] text-[#111]/72 backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25"
                      >
                        Close case
                      </button>
                    ) : null}
                    <div className="space-y-6 md:pr-8">
                      {hasMetadataValue(galleryTile.galleryHeader.body) ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/64 max-w-[42ch]">
                            {galleryTile.galleryHeader.body}
                          </p>
                        </div>
                      ) : null}
                      {hasMetadataValue(galleryTile.galleryHeader.year) ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/44">
                            Year
                          </p>
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/64">
                            {galleryTile.galleryHeader.year}
                          </p>
                        </div>
                      ) : null}
                      {galleryTile.galleryHeader.deliverables.some((deliverable) =>
                        hasMetadataValue(deliverable)
                      ) ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/44">
                            Topics
                          </p>
                          <div className="space-y-0.5 text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/64">
                            {galleryTile.galleryHeader.deliverables
                              .filter((deliverable) => hasMetadataValue(deliverable))
                              .map((deliverable) => (
                                <p key={`${galleryTile.id}-deliverable-${deliverable}`}>{deliverable}</p>
                              ))}
                          </div>
                        </div>
                      ) : null}
                      {hasMetadataValue(galleryTile.galleryHeader.collaborators) ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/44">
                            Collaborators
                          </p>
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/64">
                            {galleryTile.galleryHeader.collaborators}
                          </p>
                        </div>
                      ) : null}
                      {galleryTile.galleryHeader.credits.some((credit) => hasMetadataValue(credit)) ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/44">
                            Credits
                          </p>
                          <div className="space-y-0.5 text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/64">
                            {galleryTile.galleryHeader.credits
                              .filter((credit) => hasMetadataValue(credit))
                              .map((credit) => (
                                <p key={`${galleryTile.id}-credit-${credit}`}>{credit}</p>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="md:border-l md:border-[#111]/14 md:pl-10">
                      <h2 className="max-w-[14ch] text-[clamp(34px,5.4vw,56px)] font-semibold leading-[0.97] tracking-[-0.022em] text-[#111]">
                        {galleryTile.galleryHeader.heroHeadline}
                      </h2>
                    </div>
                  </div>
                </header>
              ) : null}
              {galleryVideoSrc ? (
                <div className="overflow-hidden rounded-[12px] bg-[#f1f1f1]">
                  <div className="relative aspect-[4/3] w-full">
                    <video
                      key={`${galleryTile.id}-${galleryVideoSrc}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      controls={false}
                      disablePictureInPicture
                      disableRemotePlayback
                      controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                      className="pointer-events-none h-full w-full object-cover"
                      aria-label={`${galleryTile.title} gallery video`}
                    >
                      <source src={galleryVideoSrc} type="video/mp4" />
                    </video>
                  </div>
                </div>
              ) : null}
              {galleryTile.id === "ayu" ? (
                <header className="w-full px-0 pt-0 pb-14 md:px-10 md:pt-0 md:pb-20">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(180px,0.5fr)_minmax(0,0.5fr)] md:gap-0">
                    {!isHorizontalLayout ? (
                      <button
                        type="button"
                        onClick={closeGallery}
                        className="w-fit inline-flex h-8 items-center rounded-full border border-[#111]/20 bg-white/90 px-3 text-[11px] uppercase tracking-[0.14em] text-[#111]/72 backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25"
                      >
                        Close case
                      </button>
                    ) : null}
                    <div className="space-y-6 md:pr-8">
                      <p className="text-[11px] leading-[1.4] tracking-[0.02em] text-[#111]/64 max-w-[42ch]">
                        {AYU_GALLERY_DESCRIPTOR_PARTS.beforeArctic}
                        <a
                          href="https://arcticfever.co/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-[#111]/44 underline-offset-2 hover:decoration-[#111]/64"
                        >
                          {AYU_GALLERY_DESCRIPTOR_PARTS.afterArcticBeforeSinyo}
                        </a>
                        {AYU_GALLERY_DESCRIPTOR_PARTS.mid}
                        <button
                          type="button"
                          onClick={() => setGalleryTileId("brnd")}
                          className="underline decoration-[#111]/44 underline-offset-2 hover:decoration-[#111]/64 text-left"
                        >
                          {AYU_GALLERY_DESCRIPTOR_PARTS.afterSinyo}
                        </button>
                        {AYU_GALLERY_DESCRIPTOR_PARTS.end}
                      </p>
                    </div>
                    <div className="md:border-l md:border-[#111]/14 md:pl-10">
                      <h2 className="max-w-[14ch] text-[clamp(34px,5.4vw,56px)] font-semibold leading-[0.97] tracking-[-0.022em] text-[#111]">
                        {AYU_GALLERY_HEADING}
                      </h2>
                    </div>
                  </div>
                </header>
              ) : null}
              {galleryTile.id === "tiny" && galleryImages.includes(TINY_TRAITS_IMAGE) ? (
                <div className="overflow-hidden rounded-[12px] bg-[#f1f1f1]">
                  <Image
                    src={TINY_TRAITS_IMAGE}
                    alt={`${galleryTile.title} traits`}
                    width={1920}
                    height={1080}
                    sizes={isHorizontalLayout ? "54vw" : "100vw"}
                    className="h-auto w-full"
                  />
                </div>
              ) : null}
              {galleryTile.id === "ayu" && (ayuPersonalImages.length > 0 || ayuProjectImages.length > 0) ? (
                <div className="space-y-3">
                  {ayuPersonalImages.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1 md:gap-2 md:pb-2">
                      {ayuPersonalImages.map((imageSrc, index) => (
                        <div
                          key={`${galleryTile.id}-personal-${imageSrc}-${index}`}
                          className="relative aspect-square w-[88px] shrink-0 overflow-hidden rounded-[8px] bg-[#f1f1f1] md:w-[112px]"
                        >
                          <Image
                            src={imageSrc}
                            alt={`${galleryTile.title} image ${index + 1}`}
                            fill
                            sizes="(min-width: 768px) 112px, 88px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {/*
                  {ayuProjectImages.length > 0 ? (
                    <div className={AYU_PROJECT_GRID_CLASS}>
                      {ayuProjectImages.map((imageSrc, index) => (
                        <div
                          key={`${galleryTile.id}-project-${imageSrc}-${index}`}
                          className={`relative overflow-hidden rounded-[12px] bg-[#f1f1f1] ${getGalleryBentoSpanClass(
                            index,
                            ayuProjectImages.length
                          )}`}
                        >
                          <Image
                            src={imageSrc}
                            alt={`${galleryTile.title} project image ${index + 1}`}
                            fill
                            sizes={isHorizontalLayout ? "26vw" : "44vw"}
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  */}
                </div>
              ) : galleryStandaloneImages.length > 0 ? (
                galleryTile.id === "brnd" && galleryStandaloneImages.length === 4 ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-6 md:gap-3">
                    {/* Left: main BR-ND image */}
                    <div
                      className="relative w-full rounded-[12px] bg-[#f1f1f1] overflow-hidden h-full min-h-0 aspect-[4/3] md:aspect-auto md:col-span-4 md:row-span-3"
                    >
                      <Image
                        src={galleryStandaloneImages[0]}
                        alt={`${galleryTile.title} gallery image 1`}
                        fill
                        sizes={isHorizontalLayout ? "26vw" : "44vw"}
                        className="object-cover"
                      />
                    </div>
                    {/* Right: GIF + 23plusone video stacked in one card */}
                    <div
                      className="relative w-full rounded-[12px] bg-[#f1f1f1] overflow-hidden h-full min-h-0 md:col-span-2 md:row-span-3"
                    >
                      <div className="flex h-full flex-col gap-2">
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <Image
                            src={galleryStandaloneImages[1]}
                            alt={`${galleryTile.title} gallery image 2`}
                            fill
                            sizes={isHorizontalLayout ? "13vw" : "44vw"}
                            className="object-cover"
                          />
                        </div>
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <video
                            src={galleryStandaloneImages[2]}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            controls={false}
                            disablePictureInPicture
                            disableRemotePlayback
                            controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                            className="h-full w-full object-cover"
                            aria-label={`${galleryTile.title} gallery video 3`}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Full-width website refresh video below the first row */}
                    <div className="relative w-full rounded-[12px] bg-[#f1f1f1] overflow-hidden md:col-span-6">
                      <video
                        src={galleryStandaloneImages[3]}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                        className="h-full w-full object-cover"
                        aria-label={`${galleryTile.title} gallery video 4`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={galleryBentoGridClass}>
                    {galleryStandaloneImages.map((imageSrc, index) => (
                      <div
                        key={`${galleryTile.id}-${imageSrc}-${index}`}
                        className={`relative w-full rounded-[12px] bg-[#f1f1f1] overflow-hidden ${isGalleryMediaVideo(imageSrc) ? "self-start" : "h-full min-h-0"} ${getGalleryBentoSpanClass(
                          index,
                          galleryStandaloneImages.length
                        )}`}
                      >
                        {isGalleryMediaVideo(imageSrc) ? (
                          <video
                            src={imageSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            controls={false}
                            disablePictureInPicture
                            disableRemotePlayback
                            controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                            className="w-full h-auto max-w-full rounded-[12px]"
                            aria-label={`${galleryTile.title} gallery video ${index + 1}`}
                          />
                        ) : (
                          <Image
                            src={imageSrc}
                            alt={`${galleryTile.title} gallery image ${index + 1}`}
                            fill
                            sizes={isHorizontalLayout ? "26vw" : "44vw"}
                            className="object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : null}
              {galleryTile.links && galleryTile.links.length > 0 ? (
                galleryTile.id === "do" && doGalleryLinks ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-6 md:gap-3">
                    {doGalleryBentoLinks.map((link, index) => {
                      const isExplainer =
                        doGalleryLinks.explainer?.label === link.label &&
                        doGalleryLinks.explainer?.href === link.href;
                      const isResearchPaper = isResearchPaperLink(link);
                      const isPortfolioPdf = isPortfolioPdfLink(link);
                      const doPdfPreviewClassName =
                        isResearchPaper || isPortfolioPdf
                          ? "h-[62vh] md:h-[78vh]"
                          : undefined;
                      const doTileSpanClass = isExplainer
                        ? "col-span-1 md:col-span-6"
                        : isResearchPaper
                          ? "col-span-1 md:col-span-2"
                          : isPortfolioPdf
                            ? "col-span-1 md:col-span-4"
                            : getGalleryBentoSpanClass(index, doGalleryBentoLinks.length);
                      return (
                        <GalleryLinkCard
                          key={`${galleryTile.id}-${link.label}-${link.href}`}
                          link={link}
                          projectTitle={galleryTile.title}
                          isHorizontalLayout={isHorizontalLayout}
                          autoPlayVideo={isExplainer}
                          pdfPreviewClassName={doPdfPreviewClassName}
                          className={doTileSpanClass}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className={galleryBentoGridClass}>
                    {galleryTile.links.map((link, index, links) => (
                      <GalleryLinkCard
                        key={`${galleryTile.id}-${link.label}-${link.href}`}
                        link={link}
                        projectTitle={galleryTile.title}
                        isHorizontalLayout={isHorizontalLayout}
                        className={getGalleryBentoSpanClass(index, links.length)}
                      />
                    ))}
                  </div>
                )
              ) : null}
              {nextGalleryProject ? (
                !isHorizontalLayout ? (
                  <div className="flex w-full justify-end -mr-10 md:-mr-14">
                    <button
                      type="button"
                      onClick={openNextGalleryProject}
                      className="mt-5 inline-flex h-8 items-center rounded-full border border-[#111]/20 bg-white/90 px-3 text-[11px] uppercase tracking-[0.14em] text-[#111]/72 backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25"
                    >
                      Next project
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openNextGalleryProject}
                    onMouseEnter={() => {
                      if (!isFinePointer) return;
                      setIsNextProjectHovering(true);
                    }}
                    onMouseLeave={() => {
                      setIsNextProjectHovering(false);
                    }}
                    className="mt-1 block h-[50vh] w-full px-0 text-left text-[11px] uppercase tracking-[0.14em] text-[#111]/55 transition hover:text-[#111]/75 focus-visible:outline-none"
                  >
                    Next project
                  </button>
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </main>
  );
}
