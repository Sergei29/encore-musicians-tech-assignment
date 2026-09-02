export interface MusicianSearchResponse {
  results: MusicianProfile[];
  total: number;
  offset: number;
  limit: number;
}

export interface MusicianProfile {
  url: string;
  title: string;
  description: string;
  rating: number;
  numReviews: number;
  photo: string;
  categories: string[];
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  location: string;
}

export type MusicianSort =
  "price-asc" | "price-desc" | "rating-asc" | "rating-desc";

export interface FetchMusiciansParams {
  search: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  sort: MusicianSort;
  offset: number;
  limit?: number;
  signal?: AbortSignal;
}

export interface MusicianFiltersState {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: MusicianSort;
}
