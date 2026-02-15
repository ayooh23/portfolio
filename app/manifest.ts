import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ayu Koene · Strategic Designer",
    short_name: "Ayu Koene",
    description:
      "Strategic designer with a background in mechanical engineering, digital design, and brand strategy.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f4",
    theme_color: "#f7f6f4",
    icons: [
      {
        src: "/fav_ayooh.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/fav_ayooh.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
