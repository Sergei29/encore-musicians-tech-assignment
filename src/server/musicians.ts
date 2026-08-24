import musiciansData from "../../data/musicians.json";
import type { MusicianProfile, MusicianSearchResponse } from "../types";

const musicians = musiciansData as MusicianProfile[];

// Simulated network latency, applied to every lookup. It's jittered, so
// responses can arrive in a different order than they were requested —
// just like a real network. It lives here (not in HTTP middleware) so it
// applies however the data is reached. Please keep it: building a UI that
// behaves well while requests are in flight is part of the challenge.
const MIN_LATENCY_MS = 200;
const MAX_LATENCY_MS = 900;

const simulateNetworkLatency = () =>
  new Promise((resolve) =>
    setTimeout(resolve, MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS))
  );

/**
 * Search musician profiles.
 *
 * Supported params (all optional):
 *   q         — case-insensitive substring match on the profile name
 *   category  — case-insensitive exact match against a profile's categories
 *   minPrice  — only profiles with averagePrice >= minPrice
 *   maxPrice  — only profiles with averagePrice <= maxPrice
 *   sort      — "price-asc" | "price-desc" | "rating" (by averagePrice / rating)
 *   offset    — pagination offset (default 0)
 *   limit     — page size (default 10, max 30)
 */
export async function searchMusicians(
  params: URLSearchParams
): Promise<MusicianSearchResponse> {
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const category = (params.get("category") ?? "").trim().toLowerCase();
  const minPrice = Number(params.get("minPrice")) || 0;
  const maxPrice = Number(params.get("maxPrice")) || Infinity;
  const sort = params.get("sort") ?? "";
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const limit = Math.min(30, Math.max(1, Number(params.get("limit")) || 10));

  const results = musicians.filter(
    (m) =>
      (!q || m.title.toLowerCase().includes(q)) &&
      (!category || m.categories.some((c) => c.toLowerCase() === category)) &&
      m.averagePrice >= minPrice &&
      m.averagePrice <= maxPrice
  );

  if (sort === "price-asc") results.sort((a, b) => a.averagePrice - b.averagePrice);
  if (sort === "price-desc") results.sort((a, b) => b.averagePrice - a.averagePrice);
  if (sort === "rating") results.sort((a, b) => b.rating - a.rating);

  await simulateNetworkLatency();

  return {
    results: results.slice(offset, offset + limit),
    total: results.length,
    offset,
    limit
  };
}

/** Distinct categories across all profiles, e.g. for a filter dropdown. */
export async function getCategories(): Promise<string[]> {
  await simulateNetworkLatency();
  return [...new Set(musicians.flatMap((m) => m.categories))].sort();
}
