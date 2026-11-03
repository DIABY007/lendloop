import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LendLoop — Neighborhood Tool Lending Board",
    short_name: "LendLoop",
    description:
      "Borrow what you need. Lend what you don't. Community-first tool sharing with automated workflows.",
    start_url: "/",
    display: "standalone",
    background_color: "#151311",
    theme_color: "#151311",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/Logo.png",
        sizes: "500x500",
        type: "image/png",
      },
    ],
  };
}
