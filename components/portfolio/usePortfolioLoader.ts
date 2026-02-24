import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LOADER_SEEN_SESSION_KEY } from "@/components/portfolio/constants";

type UsePortfolioLoaderParams = {
  loadingGallery: string[];
  loaderTypeText: string;
  loaderSublineText: string;
};

export function usePortfolioLoader({
  loadingGallery,
  loaderTypeText,
  loaderSublineText,
}: UsePortfolioLoaderParams) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const loaderOverlayRef = useRef<HTMLDivElement | null>(null);
  const loaderContentRef = useRef<HTMLDivElement | null>(null);
  const loaderImageFrameRef = useRef<HTMLDivElement | null>(null);
  const loaderCursorRef = useRef<HTMLSpanElement | null>(null);
  const loaderSublineCursorRef = useRef<HTMLSpanElement | null>(null);
  const loaderTypeCharsRef = useRef(0);
  const loaderSublineCharsRef = useRef(0);
  const loaderImageIndexRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loaderTypeChars, setLoaderTypeChars] = useState(0);
  const [loaderSublineChars, setLoaderSublineChars] = useState(0);
  const [loaderImageIndex, setLoaderImageIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const src of loadingGallery) {
      const img = new window.Image();
      img.src = src;
    }
  }, [loadingGallery]);

  useEffect(() => {
    const overlayEl = loaderOverlayRef.current;
    const contentEl = loaderContentRef.current;
    const frameEl = loaderImageFrameRef.current;
    const rootEl = rootRef.current;
    if (!overlayEl || !contentEl || !rootEl) return;

    const completeLoading = () => {
      setIsLoading((prevLoading) => {
        if (!prevLoading) return prevLoading;
        return false;
      });
    };

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      const rafId = window.requestAnimationFrame(() => {
        setLoaderTypeChars(loaderTypeText.length);
        setLoaderSublineChars(loaderSublineText.length);
        setLoaderImageIndex(Math.max(loadingGallery.length - 1, 0));
        completeLoading();
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

    const estimatedMs =
      (timing.progressDuration + timing.holdDuration + timing.overlayOutDuration + timing.entranceDuration) *
      1000;
    const failSafeTimeoutId = window.setTimeout(() => {
      tl.progress(1);
      completeLoading();
    }, Math.max(estimatedMs * 2, 8000));

    tl.eventCallback("onComplete", () => {
      try {
        window.sessionStorage.setItem(LOADER_SEEN_SESSION_KEY, "1");
      } catch {
        // no-op when session storage isn't available
      }
      window.clearTimeout(failSafeTimeoutId);
      completeLoading();
    });

    return () => {
      window.clearTimeout(failSafeTimeoutId);
      tl.kill();
    };
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

  return {
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
  };
}
