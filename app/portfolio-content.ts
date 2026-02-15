export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  roleLine: string;
  description: string;
  bullets: string[];
  thumb: string;
  links?: ProjectLink[];
  isProfile?: boolean;
};

export const LOADER_TYPE_TEXT = "Hello! How Ayu?";
export const LOADER_SUBLINE_TEXT = "Slide through my projects...";
export const ACTIVE_CELL_HINT_TEXT = "Drag here to\n learn more.";
export const DMS_RESEARCH_PAPER_PDF =
  "/documents/Evaluating_High-tech_Decision-making_Strategies_AyuKoene.pdf";
export const OLVG_RESEARCH_PAPER_PDF = "/documents/MDD-RR-S2-AyuKoene.pdf";

export const LOADING_GALLERY = [
  "/images/ayu03.jpg",
  "/images/ayu08.jpg",
  "/images/ayu10.jpg",
  "/images/ayu18.jpg",
  "/images/ayu25.jpg",
  "/images/ayu.jpg",
];

export const PROJECTS: Project[] = [
  {
    id: "brnd",
    title: "BR-ND People",
    roleLine: "Design & Innovation Lead · 2021–Present",
    description:
      "Creative change agency working on culture, strategy, and expression. · I run design and innovation - split between building internal tools/systems and leading external client projects across healthcare, public sector, and creative industries. Small studio means wearing many hats: project management, research design, visual identity, prototyping, client delivery.",
    bullets: [
      "Internal work: Tools and frameworks for transformation projects. Workflows that help us work better. Brand contributions across visual identity and digital.",
      "Client work: Research and strategy. Brand equity studies. Service design. Stakeholder alignment. Innovation programs. Healthcare, public sector, enterprise.",
    ],
    thumb: "/images/thumb_br-ndpeople.jpg",
    links: [{ label: "Visit website", href: "https://br-ndpeople.com" }],
  },
  {
    id: "do",
    title: "OLVG · D&O (Dokter & Opvang)",
    roleLine: "Service Design Lead · 2024–2025",
    description:
      "Because real care doesn't stop at the exit door. · Healthcare innovation supporting vulnerable patients across hospitals, NGOs, and social services.",
    bullets: [
      "Designed service flows and digital platforms connecting hospitals, NGOs, and public services, each with different constraints and languages.",
      "Rapidly prototyped and validated tools with frontline staff during actual shifts, iterating based on real use.",
      "Created systems where accessibility and operational reality both win; nobody should have to choose between what's right and what's possible.",
    ],
    thumb: "/images/thumb_do.jpg",
    links: [
      {
        label: "Read article",
        href: "https://www.hva.nl/nieuws/2025/5/studenten-master-digital-design-ontwikkelen-database-om-arts-te-helpen-bij-doorverwijzing-dak--en-thuislozen",
      },
      { label: "Watch Trailer", href: "https://youtu.be/K2KjvjNbcvQ" },
      { label: "Download Research Paper", href: OLVG_RESEARCH_PAPER_PDF },
    ],
  },
  {
    id: "stroll",
    title: "Stroll",
    roleLine: "Co-founder & Product Lead · 2024–2025",
    description:
      "What if navigation felt like intuition? · Early-stage product exploring new grounds in AI-powered navigation, no screens required.",
    bullets: [
      "Framed product strategy and experimentation roadmap, from idea to testable prototype.",
      "Designed haptic interaction patterns that guide without directing, working at the intersection of AI, embodied interaction, and spatial computing.",
      "Ran rapid validation cycles to figure out what works, learning by building and testing rather than theorizing.",
    ],
    thumb: "/images/thumb_stroll.jpg",
    links: [
      { label: "Read case", href: "https://www.masterdigitaldesign.com/case/stroll" },
      { label: "TH/NGScon", href: "https://thingscon.org" },
      { label: "Dutch Design Week", href: "https://site.ddw.nl/en/programme/15121/stroll" },
    ],
  },
  {
    id: "dms",
    title: "ASML · DMS Evaluation",
    roleLine: "Innovation & Systems Design (Thesis) · 2023–2024",
    description:
      "When engineers play games, researchers learn how they think. · Research project exploring decision-making in deep-tech semiconductor manufacturing through simulation.",
    bullets: [
      "Designed an abstract simulation workshop where systems engineers played through scenarios while researchers observed their thinking patterns.",
      "Built the game mechanics and facilitation framework that made invisible decision-making visible and analyzable.",
      "Translated findings into insights about how technical teams navigate uncertainty when stakes are high and information is incomplete, working between design research and engineering rigor.",
    ],
    thumb: "/images/thumb_dms.png",
    links: [{ label: "Download Research Paper", href: DMS_RESEARCH_PAPER_PDF }],
  },
  {
    id: "tiny",
    title: "Tiny Troubles",
    roleLine: "Co-founder · 2019–2021",
    description:
      "Planet Earth is worth causing trouble for. · Early-stage platform using Web3 to bridge digital creativity and real-world social impact.",
    bullets: [
      "Co-led product strategy and positioning for a platform exploring new grounds, testing how digital art could fund tangible good through emerging tech.",
      "Designed the experience and brand identity, working at the intersection of Web3, community, and social impact.",
      "Learned what it actually takes to build and ship a product from zero, including legal structures, finances, and keeping a small team aligned when everyone is doing different things.",
    ],
    thumb: "/images/thumb_tiny.jpeg",
    links: [],
  },
];

export const AYU_TILE: Project = {
  id: "ayu",
  title: "Ayu Koene",
  roleLine: "Strategic designer",
  description:
    "Hello! I'm Ayu, a strategic designer with a background in mechanical engineering, digital design, and brand strategy. I build concepts from early vision to tangible outcomes, working at the intersection of design, technology, and business. I've always been passionate about creating appealing & functional things, on- and offline.",
  bullets: [],
  thumb: "/images/ayu.jpg",
  links: [],
  isProfile: true,
};

export const TILES: Project[] = [...PROJECTS, AYU_TILE];

export const PROJECT_IMAGE_SEQUENCES: Record<string, string[]> = {
  ayu: LOADING_GALLERY,
  brnd: [
    "/images/thumb_br-ndpeople.jpg",
    "/images/projects/brnd/brnd1.jpg",
    "/images/projects/brnd/brnd2.gif",
  ],
  do: [
    "/images/thumb_do.jpg",
    "/images/projects/do/do1.png",
  ],
  stroll: [
    "/images/thumb_stroll.jpg",
    "/images/projects/stroll/stroll1.png",
    "/images/projects/stroll/stroll2.jpg",
    "/images/projects/stroll/stroll3.png",
  ],
  dms: [
    "/images/thumb_dms.png",
  ],
  tiny: [
    "/images/thumb_tiny.jpeg",
    "/images/projects/tiny/tiny1.jpeg",
    "/images/projects/tiny/tiny2.jpeg",
    "/images/projects/tiny/tiny3.jpeg",
    "/images/projects/tiny/tiny4.png",
  ],
};
