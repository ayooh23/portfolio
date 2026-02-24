export const detailRowClass = "grid grid-cols-[18px_1fr] items-start gap-2.5";
export const detailMarkerSlotClass = "flex h-[18px] items-center justify-center";
export const detailTitleClass = "text-[15px] font-medium text-[#111]/85 sm:text-[13px]";
export const detailBodyClass =
  "mt-1 text-[15px] leading-[1.7] text-[#111]/60 sm:text-[12px] sm:leading-[1.75]";
export const detailLinkClass =
  "underline decoration-[#111]/20 underline-offset-2 transition hover:decoration-[#111]/50 hover:text-[#111] focus-visible:outline focus-visible:ring-1 focus-visible:ring-[#111]/35 focus-visible:ring-offset-1";
export const splitPaneDesktopTabletPaddingClass = "py-10 px-8";
export const splitPaneHeaderClass =
  "grid grid-cols-[18px_1fr] items-center gap-2.5 text-[15px] font-medium text-[#111]/80 sm:text-[12px]";
export const splitPaneFooterBaseClass = "mt-4 min-h-[36px] text-[14px] leading-[1.75] sm:mt-3 sm:text-[12px]";
export const inlineActionControlClass =
  "group inline-flex h-9 items-center gap-3 self-start rounded px-0 text-left cursor-pointer transition hover:text-[#111] focus-visible:outline focus-visible:ring-1 focus-visible:ring-[#111]/30 focus-visible:ring-offset-1";
export const openCaseButtonClass =
  "inline-flex h-8 items-center rounded-full border border-[#111]/20 px-3 text-[11px] uppercase tracking-[0.14em] text-[#111]/72 transition hover:bg-[#111]/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25";
export const galleryOverlayButtonClass =
  "w-fit inline-flex h-8 items-center rounded-full border border-[#111] bg-[#111] px-3 text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-[#2a2a2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/35";

export const LOADER_SEEN_SESSION_KEY = "ayu-portfolio-loader-seen";
export const markerBadgeClass =
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#111]/72 text-[10px] leading-none text-[#111]/72";
export const galleryBentoGridClass =
  "grid grid-cols-1 gap-2 md:grid-cols-6 md:auto-rows-[clamp(112px,10vw,188px)] md:gap-3";

export const overlaySettleEase = "power3.out";
export const overlayMotionDurationMs = 820;
export const overlayCleanupBufferMs = 220;
export const overlayTileLeadSeconds = 0.06;
export const MOBILE_GALLERY_OVERLAY_TOP = 0;

export const PROJECT_GALLERY_VIDEOS: Record<string, string> = {
  tiny: "/images/projects/tiny/tiny-gallery.mp4",
};

export const TINY_TRAITS_IMAGE = "/images/projects/tiny/tiny-traits.jpg";
export const TINY_ROW_IMAGE_ORDER = [
  "/images/projects/tiny/tiny1.jpeg",
  "/images/projects/tiny/tiny2.jpeg",
  "/images/projects/tiny/tiny3.jpeg",
  "/images/thumb_tiny.jpeg",
];

export const AYU_PERSONAL_IMAGE_ORDER = [
  "/images/ayu03.jpg",
  "/images/ayu08.jpg",
  "/images/ayu10.jpg",
  "/images/ayu18.jpg",
  "/images/ayu25.jpg",
];

export const AYU_PROJECT_IMAGE_ORDER = [
  "/images/ClimateControl_architecture.png",
  "/images/GrabAChair_CNCproduct.png",
  "/images/AR_windtunnel.jpg",
  "/images/Branding_RekelRegie_OutfoxIT.jpg",
];

export const AYU_GALLERY_HEADING = "Trained to build, drawn to create.";
export const AYU_GALLERY_DESCRIPTOR_PARTS = {
  beforeArctic:
    "My name is Ayu. Based in Amsterdam, frequently elsewhere. I work at the intersection of design, technology, and business, bridging vision and execution across whatever the project needs. I like to get things done, and done well. Outside of that: mountains, photography, tacos with ",
  afterArcticBeforeSinyo: "Arctic Fever",
  mid: ", and prototyping with my twin ",
  afterSinyo: "Sinyo",
  end: ".",
};

export const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

export const VIDEO_POSTERS: Record<string, string> = {
  "/images/projects/do/DO_explainer.mp4": "/images/projects/do/DO_explainer-Cover.jpg",
};
