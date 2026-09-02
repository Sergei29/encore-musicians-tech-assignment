import type {
  FetchMusiciansParams,
  MusicianFiltersState,
  MusicianSearchResponse,
} from "@/types";

export const CATEGORIES = [
  "Acoustic Duo",
  "Acoustic Guitarist",
  "Bollywood",
  "Cellist",
  "Classical",
  "Classical Guitarist",
  "Corporate",
  "DJ",
  "Electronic",
  "Flamenco",
  "Folk",
  "Function Band",
  "Funk",
  "Gospel",
  "Guitarist",
  "Harpist",
  "Indie",
  "Jazz",
  "Jazz Band",
  "Party",
  "Pianist",
  "Pop",
  "Rock",
  "Saxophonist",
  "Singer",
  "Soul",
  "Soul Band",
  "String Quartet",
  "Violinist",
  "Wedding",
];

export const DEFAULT_FILTERS: MusicianFiltersState = {
  search: "",
  category: "",
  minPrice: undefined,
  maxPrice: undefined,
  sort: "rating-desc",
};

export async function fetchMusicians({
  search,
  category,
  minPrice,
  maxPrice,
  sort,
  offset,
  limit = 10,
  signal,
}: FetchMusiciansParams): Promise<MusicianSearchResponse> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set("q", trimmedSearch);
  }

  if (category) {
    params.set("category", category);
  }

  if (minPrice !== undefined) {
    params.set("minPrice", String(minPrice));
  }

  if (maxPrice !== undefined) {
    params.set("maxPrice", String(maxPrice));
  }

  if (sort) {
    params.set("sort", sort);
  }

  const response = await fetch(`/api/musicians?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch musicians: ${response.status}`);
  }

  return response.json() as Promise<MusicianSearchResponse>;
}
