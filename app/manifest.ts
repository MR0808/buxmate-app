import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buxmate",
    short_name: "Buxmate",
    description:
      "Private event planning for organisers — guests, RSVPs, activities and payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#e07a3a",
  };
}
