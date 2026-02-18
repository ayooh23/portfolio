export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectGalleryHeader = {
  label: string;
  title: string;
  subheadline: string;
  body: string;
  collaborators: string;
  year: string;
  deliverables: string[];
  heroHeadline: string;
  credits: string[];
};

export type Project = {
  id: string;
  title: string;
  roleLine: string;
  description: string;
  bullets: string[];
  thumb: string;
  links?: ProjectLink[];
  galleryHeader?: ProjectGalleryHeader;
  isProfile?: boolean;
};

export const LOADER_TYPE_TEXT = "Hello! How Ayu?";
export const LOADER_SUBLINE_TEXT = "Slide through my projects...";
export const ACTIVE_CELL_HINT_TEXT = "Drag here to\n learn more.";
export const DMS_RESEARCH_PAPER_PDF =
  "/documents/Evaluating_High-tech_Decision-making_Strategies_AyuKoene.pdf";
export const OLVG_RESEARCH_PAPER_PDF = "/documents/MDD-RR-S2-AyuKoene.pdf";
export const OLVG_PORTFOLIO_PDF = "/documents/MDD-Portfolio-S2-Resit-AyuKoene.pdf";

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
    galleryHeader: {
      label: "Work",
      title: "BR-ND People",
      subheadline: "Four years building from the inside out.",
      body: "BR-ND People is a creative change agency founded by Alexander Koene and Kim Cramer. I've spent four years here as the person who makes things: systems, tools, client work, and the internal infrastructure that keeps a small studio doing big work. It taught me how to move fast without losing precision, and how to lead projects when there's no safety net.",
      collaborators: "(none)",
      year: "2021-Present",
      deliverables: ["Service design systems", "Research and strategy", "Digital brand platforms"],
      heroHeadline: "Strategy only works if someone builds the systems to hold it.",
      credits: ["Alexander Koene", "Kim Cramer"],
    },
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
      { label: "Watch DO Explainer", href: "/images/projects/do/DO_explainer.mp4" },
      { label: "Download Research Paper", href: OLVG_RESEARCH_PAPER_PDF },
      { label: "Download Portfolio PDF", href: OLVG_PORTFOLIO_PDF },
    ],
    galleryHeader: {
      label: "Case Study",
      title: "Dokter & Opvang",
      subheadline: "Designing care that doesn't stop at the exit door.",
      body: "OLVG is one of Amsterdam's largest hospitals, but this project lived in the gaps between institutions. What happens to a homeless patient after they're discharged? We designed the infrastructure to answer that, connecting hospitals, NGOs, and social services that had never been built to talk to each other. The work was technically complex, emotionally heavy, and exactly the kind of problem design should be solving.",
      collaborators: "Deloitte Digital, OLVG, HvA",
      year: "2024-2025",
      deliverables: ["Care pathway redesign", "Operational prototypes", "Cross-sector service toolkit"],
      heroHeadline: "We built the infrastructure for care that follows people into the hard parts.",
      credits: ["Ayu Koene", "Frontline care teams", "Social workers"],
    },
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
      { label: "Download Portfolio PDF", href: "/documents/MDD-Portfolio-25-S1-AyuKoene.pdf" },
    ],
    galleryHeader: {
      label: "Product",
      title: "Stroll",
      subheadline: "Navigation that feels like intuition, not instruction.",
      body: "Stroll started from a simple frustration: why does getting from A to B mean staring at a screen the whole way? We built a haptic navigation device powered by AI, something you feel rather than watch. It went from concept to exhibition at Dutch Design Week 2024 and ThingsCon, and it's still one of the projects where the making and the thinking felt most inseparable.",
      collaborators: "Monks",
      year: "2024-2025",
      deliverables: ["Haptic wayfinding", "AI interaction prototype", "Exhibition-ready concept"],
      heroHeadline: "We built a way to move through cities without looking at a screen.",
      credits: ["Ayu Koene", "Mehmet Bostanci", "Daniel Klein"],
    },
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
    galleryHeader: {
      label: "Thesis Research",
      title: "ASML · DMS Evaluation",
      subheadline: "Making invisible thinking visible.",
      body: "ASML builds the machines that make every chip on the planet. For my thesis, I got to ask a different kind of question: how do their engineers actually think when the information is incomplete and the stakes are enormous? I designed a simulation workshop, part game and part research instrument, to make those invisible decision patterns visible. It sits at an odd intersection of design research and engineering rigour, which felt exactly right.",
      collaborators: "ASML systems engineers",
      year: "2023-2024",
      deliverables: ["Simulation workshop", "Decision research model", "Thesis publication"],
      heroHeadline: "We revealed how engineers decide under pressure by building a game to watch them play.",
      credits: ["Ayu Koene", "University of Twente"],
    },
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
    thumb: "/images/projects/tiny/tiny4.png",
    links: [],
    galleryHeader: {
      label: "Venture",
      title: "Tiny Troubles",
      subheadline: "Causing trouble for all the right reasons.",
      body: "Tiny Troubles was something we built before we fully knew what we were building. A platform using Web3 to connect digital creativity with real social impact, started in 2019, before NFTs were either exciting or embarrassing. It didn't scale the way we hoped, but it taught me what early-stage product building actually costs: in time, in decisions, in learning to hold a vision while the ground keeps shifting.",
      collaborators: "(none)",
      year: "2019-2021",
      deliverables: ["Venture concept", "Brand system", "Impact funding experiments"],
      heroHeadline: "We turned digital creativity into social impact before anyone called it Web3.",
      credits: [
        "Ayu Koene",
        "Sinyo Koene",
        "Stefan David von Franquemont",
        "Luz David von Franquemont",
      ],
    },
  },
];

export const AYU_TILE: Project = {
  id: "ayu",
  title: "Ayu Koene",
  roleLine: "Strategic designer",
  description:
    "I'm Ayu, a strategic designer who started in mechanical engineering and ended up somewhere more interesting. I work at the intersection of design, technology, and business strategy: the place where vision meets execution and things actually get made. Outside of work, I'm usually cooking something ambitious, on a mountain with skis, or plotting the next trip somewhere I've never been.",
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
  ],
  stroll: ["/images/thumb_stroll.jpg"],
  dms: [
    "/images/thumb_dms.png",
  ],
  tiny: [
    "/images/projects/tiny/tiny4.png",
    "/images/projects/tiny/tiny1.jpeg",
    "/images/projects/tiny/tiny2.jpeg",
    "/images/projects/tiny/tiny3.jpeg",
    "/images/thumb_tiny.jpeg",
    "/images/projects/tiny/tiny-traits.jpg",
  ],
};
