import { useState } from "react";
import type { ProjectLink } from "@/app/portfolio-content";
import { VIDEO_POSTERS } from "@/components/portfolio/constants";
import {
  getPdfCoverEmbedSrc,
  getPdfSrc,
  resolveGalleryLinkPreview,
} from "@/components/portfolio/helpers";

type GalleryLinkCardProps = {
  link: ProjectLink;
  projectTitle: string;
  isHorizontalLayout: boolean;
  className?: string;
  autoPlayVideo?: boolean;
  pdfPreviewClassName?: string;
};

export default function GalleryLinkCard({
  link,
  projectTitle,
  isHorizontalLayout,
  className,
  autoPlayVideo = false,
  pdfPreviewClassName,
}: GalleryLinkCardProps) {
  const preview = resolveGalleryLinkPreview(link.href);
  const isExternal = link.href.startsWith("http://") || link.href.startsWith("https://");
  const hasEmbed = preview.kind !== "none";
  const pdfEmbedSrc =
    preview.kind === "pdf"
      ? isHorizontalLayout
        ? getPdfCoverEmbedSrc(preview.embedSrc)
        : getPdfSrc(preview.embedSrc)
      : null;
  const [isVideoMuted, setIsVideoMuted] = useState(autoPlayVideo);

  return (
    <article
      className={`h-full overflow-hidden rounded-[12px] bg-[#f3f3f3] shadow-[inset_0_0_0_1px_rgba(17,17,17,0.06)] ${className ?? ""}`}
    >
      {hasEmbed ? null : (
        <a
          href={link.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="group flex min-h-[120px] items-center justify-center px-5 py-4 transition-colors duration-300 hover:bg-[#ececec] focus-visible:bg-[#e7e7e7] focus-visible:outline-none md:min-h-[138px] md:px-6 md:py-5"
        >
          <span className="sr-only">{`Open ${projectTitle} ${link.label}`}</span>
          <span
            aria-hidden="true"
            className="text-[18px] leading-none text-[#111]/50 transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
          >
            ↗
          </span>
        </a>
      )}
      {hasEmbed ? (
        <div className="bg-white">
          {preview.kind === "video" ? (
            <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
              {preview.mode === "native" ? (
                <>
                  <video
                    autoPlay={autoPlayVideo}
                    muted={isVideoMuted}
                    loop={autoPlayVideo}
                    controls={!autoPlayVideo}
                    playsInline
                    preload="metadata"
                    poster={VIDEO_POSTERS[preview.embedSrc] ?? undefined}
                    className="h-full w-full object-cover"
                    aria-label={`${projectTitle} ${link.label} video preview`}
                  >
                    <source src={preview.embedSrc} />
                  </video>
                  {autoPlayVideo ? (
                    <button
                      type="button"
                      onClick={() => setIsVideoMuted((prevMuted) => !prevMuted)}
                      className="absolute right-3 top-3 z-10 inline-flex h-8 items-center rounded-full border border-white/30 bg-black/55 px-3 text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:bg-black/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
                    >
                      {isVideoMuted ? "Audio on" : "Audio off"}
                    </button>
                  ) : null}
                </>
              ) : (
                <iframe
                  src={preview.embedSrc}
                  title={`${projectTitle} ${link.label} video preview`}
                  loading="lazy"
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
          ) : null}
          {preview.kind === "pdf" ? (
            <div
              className={`relative w-full bg-white ${
                isHorizontalLayout ? "overflow-auto" : "overflow-hidden"
              } ${pdfPreviewClassName ?? "aspect-[3/4]"}`}
            >
              <iframe
                src={pdfEmbedSrc ?? preview.embedSrc}
                title={`${projectTitle} ${link.label} PDF cover`}
                loading="lazy"
                className="h-full w-full border-0"
              />
              {!isHorizontalLayout ? (
                <a
                  href={preview.embedSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center rounded-full border border-[#111]/15 bg-white/94 px-3 py-1 text-[10px] uppercase tracking-[0.13em] text-[#111]/74 shadow-[0_10px_22px_rgba(17,17,17,0.14)] backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25"
                >
                  Open PDF
                </a>
              ) : null}
            </div>
          ) : null}
          {preview.kind === "webpage" ? (
            <div
              className={`relative w-full overflow-hidden bg-white ${
                isHorizontalLayout
                  ? "h-[68vh] min-h-[520px] max-h-[780px]"
                  : "h-[62vh] min-h-[420px] max-h-[680px]"
              }`}
            >
              <iframe
                src={preview.embedSrc}
                title={`${projectTitle} ${link.label} webpage preview`}
                loading="lazy"
                className="h-full w-full border-0"
                sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
