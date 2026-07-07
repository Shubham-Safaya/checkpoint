#!/usr/bin/env node
/** Generates dist/sitemap.xml at build time from the route inventory (§11). */
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "https://shubham-safaya.github.io/checkpoint";
const destinations = JSON.parse(readFileSync(new URL("../src/data/travel-destinations.json", import.meta.url), "utf8"));
const guides = JSON.parse(readFileSync(new URL("../src/data/guides/immigration-guides.json", import.meta.url), "utf8"));

const routes = [
  "/", "/profile", "/pathways", "/immigration", "/immigration/eb1a-tracker",
  ...Object.keys(guides).map((s) => `/immigration/${s}`),
  "/travel", ...destinations.map((d) => `/travel/${d.id}`),
  "/money", "/housing", "/colleges", "/my-list",
];

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${BASE}${r}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
writeFileSync(new URL("../dist/sitemap.xml", import.meta.url), xml);
console.log(`sitemap.xml: ${routes.length} routes`);
