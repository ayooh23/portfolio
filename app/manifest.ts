import type { MetadataRoute } from "next";
import { SITE_DEFAULT_TITLE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_DEFAULT_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
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
