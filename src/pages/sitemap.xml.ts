import type { APIRoute } from "astro";
import { modpacks } from "../data/modpacks";
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://gyzenn-communityy.vercel.app");
  const paths = [
    "/",
    "/modpacks/",
    "/zalith/",
    "/komunitas/",
    "/casda-network/",
    ...modpacks.map((m) => `/modpacks/${m.id}/`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${new URL(path, base)}</loc></url>`).join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
