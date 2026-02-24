import gsap from "gsap";
import type { ProjectLink } from "@/app/portfolio-content";
import { DIRECT_VIDEO_EXTENSIONS, overlaySettleEase } from "@/components/portfolio/constants";

export type GridSize = { cols: number; rows: number };
export type TileTouchAction = "auto" | "none" | "pan-x" | "pan-y";

export type GalleryLinkPreview =
  | { kind: "none" }
  | { kind: "webpage"; embedSrc: string }
  | { kind: "pdf"; embedSrc: string }
  | { kind: "video"; embedSrc: string; mode: "iframe" | "native" };

export function isAdjacent(a: number, b: number, cols: number) {
  const ax = a % cols;
  const ay = Math.floor(a / cols);
  const bx = b % cols;
  const by = Math.floor(b / cols);
  const manhattan = Math.abs(ax - bx) + Math.abs(ay - by);
  return manhattan === 1;
}

export function cellXY(index: number, cols: number, cell: number, gap: number) {
  const x = (index % cols) * (cell + gap);
  const y = Math.floor(index / cols) * (cell + gap);
  return { x, y };
}

export function getTileTouchAction(from: number, emptyIndices: number[], cols: number): TileTouchAction {
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

export function getEaseTimeProgressForDistanceProgress(distanceProgress: number) {
  const clampedProgress = Math.max(0, Math.min(1, distanceProgress));
  if (clampedProgress <= 0 || clampedProgress >= 1) return clampedProgress;

  const ease = gsap.parseEase(overlaySettleEase) as (value: number) => number;
  let low = 0;
  let high = 1;

  for (let i = 0; i < 16; i += 1) {
    const mid = (low + high) / 2;
    if (ease(mid) < clampedProgress) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

export function getGalleryBentoSpanClass(index: number, total: number) {
  if (total <= 1) return "aspect-[4/3] md:aspect-auto md:col-span-6 md:row-span-4";
  if (total === 2) {
    return "aspect-[4/3] md:aspect-auto md:col-span-3 md:row-span-3";
  }
  if (total === 3) {
    const threeItemPattern = [
      "aspect-[4/3] md:aspect-auto md:col-span-6 md:row-span-3",
      "aspect-[4/3] md:aspect-auto md:col-span-3 md:row-span-2",
      "aspect-[4/3] md:aspect-auto md:col-span-3 md:row-span-2",
    ];
    return threeItemPattern[index % threeItemPattern.length];
  }
  if (total === 4) {
    const fourItemPattern = [
      "aspect-[4/3] md:aspect-auto md:col-span-4 md:row-span-3",
      "aspect-[4/3] md:aspect-auto md:col-span-2 md:row-span-2",
      "aspect-[4/3] md:aspect-auto md:col-span-2 md:row-span-1",
      "aspect-[4/3] md:aspect-auto md:col-span-6 md:row-span-2",
    ];
    return fourItemPattern[index % fourItemPattern.length];
  }

  const pattern = [
    "aspect-[4/3] md:aspect-auto md:col-span-4 md:row-span-3",
    "aspect-[4/3] md:aspect-auto md:col-span-2 md:row-span-2",
    "aspect-[4/3] md:aspect-auto md:col-span-2 md:row-span-2",
    "aspect-[4/3] md:aspect-auto md:col-span-4 md:row-span-2",
    "aspect-[4/3] md:aspect-auto md:col-span-3 md:row-span-2",
    "aspect-[4/3] md:aspect-auto md:col-span-3 md:row-span-2",
  ];
  return pattern[index % pattern.length];
}

export function hasMetadataValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && normalized !== "(none)" && normalized !== "none";
}

export function isGalleryMediaVideo(src: string) {
  const lower = src.toLowerCase();
  return DIRECT_VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function parseHref(href: string) {
  try {
    return new URL(href, "https://portfolio.local");
  } catch {
    return null;
  }
}

export function isPdfHref(href: string) {
  const normalizedPath = href.toLowerCase().split(/[?#]/)[0];
  return normalizedPath?.endsWith(".pdf") ?? false;
}

export function isDirectVideoHref(href: string) {
  const normalizedPath = href.toLowerCase().split(/[?#]/)[0];
  return DIRECT_VIDEO_EXTENSIONS.some((extension) => normalizedPath?.endsWith(extension));
}

function getYouTubeEmbedSrc(href: string) {
  const parsed = parseHref(href);
  if (!parsed) return null;

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean);
  let videoId = "";

  if (hostname === "youtu.be") {
    videoId = segments[0] ?? "";
  } else if (hostname === "youtube.com" || hostname === "m.youtube.com") {
    if (segments[0] === "watch") {
      videoId = parsed.searchParams.get("v") ?? "";
    } else if (segments[0] === "embed" || segments[0] === "shorts") {
      videoId = segments[1] ?? "";
    }
  }

  const safeVideoId = videoId.replace(/[^A-Za-z0-9_-]/g, "");
  if (!safeVideoId) return null;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  return `https://www.youtube.com/embed/${safeVideoId}?${params.toString()}`;
}

export function getPdfSrc(href: string) {
  const [baseHref] = href.split("#");
  return baseHref;
}

export function getPdfCoverEmbedSrc(href: string) {
  const baseHref = getPdfSrc(href);
  return `${baseHref}#page=1&zoom=page-fit&pagemode=none&toolbar=0&navpanes=0`;
}

export function resolveGalleryLinkPreview(href: string): GalleryLinkPreview {
  const trimmedHref = href.trim();
  if (!trimmedHref) return { kind: "none" };

  if (isPdfHref(trimmedHref)) {
    return { kind: "pdf", embedSrc: getPdfSrc(trimmedHref) };
  }

  const youTubeEmbedSrc = getYouTubeEmbedSrc(trimmedHref);
  if (youTubeEmbedSrc) {
    return { kind: "video", embedSrc: youTubeEmbedSrc, mode: "iframe" };
  }

  if (isDirectVideoHref(trimmedHref)) {
    return { kind: "video", embedSrc: trimmedHref, mode: "native" };
  }

  if (
    trimmedHref.startsWith("http://") ||
    trimmedHref.startsWith("https://") ||
    trimmedHref.startsWith("/")
  ) {
    return { kind: "webpage", embedSrc: trimmedHref };
  }

  return { kind: "none" };
}

export function isArticleLink(link: ProjectLink) {
  return /article/i.test(link.label);
}

export function isPaperLink(link: ProjectLink) {
  return /paper/i.test(link.label) || isPdfHref(link.href);
}

export function isResearchPaperLink(link: ProjectLink) {
  return /research paper/i.test(link.label);
}

export function isPortfolioPdfLink(link: ProjectLink) {
  return /portfolio pdf/i.test(link.label);
}

export function isExplainerVideoLink(link: ProjectLink) {
  return /explainer|trailer|video/i.test(link.label) || isDirectVideoHref(link.href);
}
