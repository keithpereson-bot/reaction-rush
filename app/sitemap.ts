import type { MetadataRoute } from "next";
import { SITE } from "@/config/game";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/reaction", "/impossible-color", "/daily", "/leaderboard", "/about", "/privacy", "/terms"];
  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/reaction" ? 0.9 : 0.5,
  }));
}
