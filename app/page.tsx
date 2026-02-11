"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type Project = {
  id: string;
  title: string;
  roleLine: string;
  description: string;
  bullets: string[];
  thumb: string;
  link: string;
  isProfile?: boolean;
};

function NumberBadge({ n }: { n: number }) {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[11px] font-medium text-[#111]">
      {n}
    </div>
  );
}

type GridSize = { cols: number; rows: number };

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

export default function Portfolio() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // puzzle refs
  const boardRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activePanelRef = useRef<HTMLDivElement | null>(null);
  const prevActiveIdRef = useRef<string | null>(null);


  const projects: Project[] = useMemo(
    () => [
      {
        id: "brnd",
        title: "BR-ND People",
        roleLine: "Design & Innovation Lead · 2021–2025",
        description:
          "Creative change agency working across brand, culture, strategy, and expression.",
        bullets: [
          "Designed digital and physical tools to support organisational change.",
          "Developed new service concepts and frameworks with multidisciplinary teams.",
          "Led workshops, concepting sessions and prototype development.",
        ],
        thumb: "/images/thumb_br-ndpeople.jpg",
        link: "#brnd",
      },
      {
        id: "do",
        title: "OLVG · D&O (Dokter & Opvang)",
        roleLine: "Service & Product Designer · 2024–2025",
        description:
          "Digital platform and physical referral system for emergency departments supporting vulnerable patients.",
        bullets: [
          "Designed service flows, interfaces and physical artefacts across healthcare stakeholders.",
          "Prototyped and tested tools with frontline staff.",
          "Translated complex care pathways into clear, usable systems.",
        ],
        thumb: "/images/thumb_do.jpg",
        link: "#do",
      },
      {
        id: "stroll",
        title: "Stroll",
        roleLine: "Founder & Product Strategist · 2024–2025",
        description:
          "AI-powered, screen-free navigation concept exploring new ways of moving through urban space.",
        bullets: [
          "Designed haptic interaction logic and physical-digital product experience.",
          "Built and tested prototypes to explore user behaviour and desirability.",
          "Developed product vision, narrative and concept positioning.",
        ],
        thumb: "/images/thumb_stroll.jpg",
        link: "/stroll",
      },
      {
        id: "dms",
        title: "ASML · DMS Evaluation",
        roleLine: "Innovation & Systems Design (Thesis) · 2023–2024",
        description:
          "Research and design project within a deep-tech semiconductor context.",
        bullets: [
          "Developed simulation-driven design tools supporting systems engineering workflows.",
          "Translated complex technical challenges into usable design frameworks.",
          "Validated concepts with engineers and researchers.",
        ],
        thumb: "/images/thumb_dms.png",
        link: "#dms",
      },
      {
        id: "tiny",
        title: "Tiny Troubles",
        roleLine: "Co-founder & Product Designer · 2019–2021",
        description:
          "Digital art and storytelling platform exploring emotional expression through interactive design.",
        bullets: [
          "Designed digital experiences and brand system for a community-driven platform.",
          "Led concept development and creative direction across multiple releases.",
        ],
        thumb: "/images/thumb_tiny.jpeg",
        link: "#tiny",
      },
    ],
    []
  );

  const ayuTile: Project = useMemo(
    () => ({
      id: "ayu",
      title: "Ayu Koene",
      roleLine: "Strategic designer",
      description:
        "Hello! My name is Ayu. I'm a strategic designer with a background in mechanical engineering, digital design, and brand strategy. I'm experienced in building concepts from early vision to tangible prototypes by working at the intersection of design, technology and culture.",
      bullets: [],
      thumb: "/images/ayu.jpg",
      link: "",
      isProfile: true,
    }),
    []
  );

  const tiles: Project[] = useMemo(() => [...projects, ayuTile], [projects, ayuTile]);

  // --- Layout knobs: 3x3 grid, 6 tiles + 3 empty
  const grid: GridSize = { cols: 3, rows: 3 };
  const totalCells = grid.cols * grid.rows; // 9
  const activeCellIndex = 8; // bottom-right = active tile

  // Board fills first-half width; cell/gap derived from measured container
  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const [boardContainerWidth, setBoardContainerWidth] = useState(576);
  useEffect(() => {
    const el = boardWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoardContainerWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cell = boardContainerWidth / (grid.cols + (grid.cols - 1) * 0.1); // 3 cells + 2 gaps (gap = cell*0.1)
  const gap = cell * 0.1;

  // puzzle state: tile -> cellIndex (6 tiles; 3 cells empty at 4,6,7)
  const [tilePos, setTilePos] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const order = [5, 0, 1, 2, 3, 8]; // ayu last so ayu at 8 (active)
    tiles.forEach((t, i) => (initial[t.id] = order[i]));
    return initial;
  });

  // empty indices (3 of them)
  const currentEmptyIndices = useMemo(() => {
    const occupied = new Set(Object.values(tilePos));
    return Array.from({ length: totalCells }, (_, i) => i).filter((i) => !occupied.has(i));
  }, [tilePos, totalCells]);

  // active = tile in bottom-right (index 8)
  const activeTile = useMemo(() => {
    for (const t of tiles) {
      if (tilePos[t.id] === activeCellIndex) return t;
    }
    return null;
  }, [tiles, tilePos, activeCellIndex]);

  // prevent any page scrolling
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  // initial entrance
  useEffect(() => {
    if (!rootRef.current) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-entrance]", { opacity: 0, y: 6 });
      gsap.to("[data-entrance]", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.03,
        delay: 0.06,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

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
        duration: 0.45,
        ease: "power3.out",
      });
    }
  }, [tilePos, tiles, grid.cols, cell, gap]);

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
    if (!el) return;

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    gsap.to(el, { scale: 1, duration: 0.18, ease: "power2.out" });

    const axis = st.axis;
    const targetIndex = st.targetIndex;

    if (
      axis !== null &&
      targetIndex !== null &&
      targetIndex >= 0 &&
      targetIndex < totalCells
    ) {
      let travel = axis === "x" ? dx : dy;
      travel *= st.sign;
      travel = Math.max(0, Math.min(st.max, travel));
      const shouldSwap = travel > st.max * 0.45;

      if (shouldSwap) {
        setTilePos((prev) => ({ ...prev, [id]: targetIndex }));
      }
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
    setTilePos(next);
  };

  return (
    <div ref={rootRef} className="h-screen w-screen overflow-hidden bg-white text-[#111]">
      <div className="flex h-full">
        {/* Left half: puzzle full height; right padding matches second half left */}
        <div className="flex min-w-0 flex-1 flex-col py-10 pl-12 pr-12">
          <div data-entrance className="flex items-center gap-3 text-[12px] font-medium text-[#111]/80">
            <NumberBadge n={0} />
            <span>Currently on display</span>
          </div>

          <div className="mt-5 flex flex-1 min-h-0 flex-col w-full min-w-0">
            <div className="flex flex-1 items-center w-full min-w-0">
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
                {/* Empty cells (3 placeholders) */}
                {currentEmptyIndices.map((idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="absolute rounded-[10px] bg-[#f3f3f3]"
                    style={{
                      width: cell,
                      height: cell,
                      left: cellXY(idx, grid.cols, cell, gap).x,
                      top: cellXY(idx, grid.cols, cell, gap).y,
                    }}
                  />
                ))}

                {/* Tiles */}
                {tiles.map((tile) => (
                  <button
                    key={tile.id}
                    ref={(node) => {
                      tileRefs.current[tile.id] = node;
                    }}
                    type="button"
                    onPointerDown={onTilePointerDown(tile)}
                    className={[
                      "absolute left-0 top-0",
                      "rounded-[10px] bg-[#f3f3f3] overflow-hidden",
                      "focus-visible:ring-2 focus-visible:ring-[#111]/20 outline-none",
                      "transition-opacity duration-200",
                    ].join(" ")}
                    style={{ width: cell, height: cell }}
                    aria-label={`Tile: ${tile.title}`}
                  >
                    <Image
                      src={tile.thumb}
                      alt={tile.title}
                      width={360}
                      height={360}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-white/0 transition duration-300 hover:bg-white/10" />
                  </button>
                ))}
                </div>
              </div>
            </div>
            <div data-entrance className="mt-3 flex items-center justify-between text-[12px] leading-[1.75] text-[#111]/60">
              <button
                type="button"
                onClick={shuffleTiles}
                className="cursor-pointer underline-offset-2 transition hover:text-[#111] hover:underline focus-visible:outline focus-visible:ring-1 focus-visible:ring-[#111]/30 focus-visible:ring-offset-1 rounded"
              >
                Shuffle
              </button>
              <span>Slide a tile to see its details. ↑</span>
            </div>
          </div>
        </div>

        {/* Right half: left padding matches first half right */}
        <div className="flex min-w-0 flex-1 flex-col border-l border-[#111]/10 py-10 pl-12 pr-12">
          <div data-entrance className="min-h-0 flex-1 overflow-auto">
            <div ref={activePanelRef}>
              {activeTile === null ? null : activeTile.isProfile ? (
                <div className="space-y-6">
                  <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                    <div className="pt-[2px]">
                      <NumberBadge n={1} />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#111]/85">Profile</div>
                      <p className="mt-1 text-[12px] leading-[1.75] text-[#111]/60">
                        {activeTile.description}
                      </p>
                    </div>
                  </div>
                  <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                    <div className="pt-[2px]">
                      <NumberBadge n={2} />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#111]/85">Education</div>
                      <div className="mt-1 text-[12px] leading-[1.75] text-[#111]/60">
                        <div>MSc Digital Design · Amsterdam University of Applied Sciences</div>
                        <div>BSc Mechanical Engineering · University of Twente &amp; Vrije Universiteit Amsterdam</div>
                      </div>
                    </div>
                  </div>
                  <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                    <div className="pt-[2px]">
                      <NumberBadge n={3} />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#111]/85">Capabilities</div>
                      <div className="mt-1 text-[12px] leading-[1.75] text-[#111]/60">
                        Product &amp; service concepting · Experience design · Prototyping &amp; MVPs · Systems thinking ·
                        Design research &amp; synthesis · AI as creative tool · Storytelling &amp; narrative
                      </div>
                    </div>
                  </div>
                  <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                    <div className="pt-[2px]">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[12px] font-medium text-[#111]/70">
                        +
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#111]/85">Latest explorations</div>
                      <div className="mt-1 text-[12px] leading-[1.75] text-[#111]/60">Cursor [12-02-2026]</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                    <div className="pt-[2px]">
                      <NumberBadge n={1} />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#111]/85">{activeTile.title}</div>
                      <div className="mt-1 text-[12px] leading-[1.75] text-[#111]/60">
                        <div>{activeTile.roleLine}</div>
                        <p className="mt-1">{activeTile.description}</p>
                      </div>
                    </div>
                  </div>
                  {activeTile.bullets.length > 0 ? (
                    <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                      <div className="pt-[2px]">
                        <NumberBadge n={2} />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-[#111]/85">Key points</div>
                        <div className="mt-1 space-y-1 text-[12px] leading-[1.75] text-[#111]/60">
                          {activeTile.bullets.map((b) => (
                            <div key={b}>{b}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {activeTile.link ? (
                    <div data-active-line className="grid grid-cols-[24px_1fr] gap-3">
                      <div className="pt-[2px]">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[12px] font-medium text-[#111]/70">
                          +
                        </div>
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-[#111]/85">More</div>
                        <div className="mt-1 text-[12px] leading-[1.75] text-[#111]/60">
                          <a
                            href={activeTile.link}
                            target={activeTile.link.startsWith("http") ? "_blank" : undefined}
                            rel={activeTile.link.startsWith("http") ? "noreferrer" : undefined}
                            className="underline decoration-[#111]/20 underline-offset-2 transition hover:decoration-[#111]/50 hover:text-[#111]"
                          >
                            Open ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <aside data-entrance className="mt-auto pt-8 text-[11px] text-[#111]/55">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#111]/15 text-[#111]/70">
                i
              </span>
              <span>Ayu Koene · 23 01 2001</span>
            </div>
            <div className="mt-2">Amsterdam · Mexico · Remote</div>
            <div className="mt-2">
              +31 6 10 67 22 83 ·{" "}
              <a
                className="underline decoration-[#111]/20 underline-offset-2 transition hover:decoration-[#111]/50 hover:text-[#111]"
                href="mailto:ayukoene@gmail.com"
              >
                ayukoene@gmail.com
              </a>{" "}
              · ayukoene.com
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
