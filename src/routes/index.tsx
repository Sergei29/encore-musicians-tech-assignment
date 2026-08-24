import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  MusicianSearchResponse,
  FetchMusiciansParams,
  MusicianSort,
} from "../types";
import { CATEGORIES } from "../lib";

export const Route = createFileRoute("/")({ component: Home });

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

const getNextPageParam = (
  lastPage: MusicianSearchResponse,
): number | undefined => {
  const nextOffset = lastPage.offset + lastPage.results.length;

  return nextOffset < lastPage.total ? nextOffset : undefined;
};

const fetchMusicians = async ({
  search,
  category,
  minPrice,
  maxPrice,
  sort,
  offset,
  limit = 10,
  signal,
}: FetchMusiciansParams): Promise<MusicianSearchResponse> => {
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
};
/**
 * Starter code only — this simply proves the API wiring works.
 * Replace it with your search page.
 */
function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState<MusicianSort>("rating-desc");

  const debouncedSearch = useDebouncedValue(search, 300);

  const musiciansQuery = useInfiniteQuery({
    queryKey: [
      "musicians",
      {
        search: debouncedSearch,
        category,
        minPrice,
        maxPrice,
        sort,
      },
    ],

    initialPageParam: 0,

    queryFn: ({ pageParam, signal }) =>
      fetchMusicians({
        search: debouncedSearch,
        category,
        minPrice: minPrice === "" ? undefined : Number(minPrice),
        maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
        sort,
        offset: pageParam,
        limit: 10,
        signal,
      }),

    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.results.length;

      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
  });

  const totalResults = musiciansQuery.data?.pages[0]?.total ?? 0;
  const musicians =
    musiciansQuery.data?.pages.flatMap((page) => page.results) ?? [];

  const loadedResults = musicians.length;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Encore Musician Search</h1>
      <div className="mt-6 mb-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="gap-0 flex flex-col">
          <label className="text-sm font-medium text-gray-700" htmlFor="search">
            Search
          </label>
          <input
            type="text"
            id="search"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>

        <div className="gap-0 flex flex-col">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="" key="all">
              All categories
            </option>
            {CATEGORIES.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </div>

        <div className="gap-0 flex flex-col">
          <label
            htmlFor="minPrice"
            className="text-sm font-medium text-gray-700"
          >
            Min Price
          </label>
          <input
            type="text"
            id="minPrice"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value);
            }}
          />
        </div>
        <div className="gap-0 flex flex-col">
          <label
            htmlFor="maxPrice"
            className="text-sm font-medium text-gray-700"
          >
            Max Price
          </label>
          <input
            type="text"
            id="maxPrice"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
            }}
          />
        </div>

        <div className="gap-0 flex flex-col">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as MusicianSort)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="rating-asc">Rating: Low to High</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <p className="mt-2 text-gray-600">
        {musiciansQuery.data
          ? `Showing ${loadedResults} of ${totalResults} profiles.`
          : "Loading…"}
      </p>

      {musiciansQuery.isPending && (
        <p className="mt-2 text-gray-600">Loading…</p>
      )}

      {musiciansQuery.isError && (
        <p className="mt-2 text-red-600">
          Error: {(musiciansQuery.error as Error).message}
        </p>
      )}

      {musiciansQuery.isSuccess && musiciansQuery.data?.pages.length === 0 && (
        <p className="mt-2 text-gray-600">No results found.</p>
      )}

      <ul>
        {musiciansQuery.data?.pages.map((page, pageIndex) => (
          <li key={pageIndex}>
            {page.results.map((musician) => (
              <div key={musician.url} className="border-b py-4">
                <h2 className="text-lg font-semibold">{musician.title}</h2>
                <p>{musician.description}</p>
                <p>
                  Rating: {musician.rating} ({musician.numReviews} reviews)
                </p>
                <p>
                  Price Range: ${musician.minPrice} - ${musician.maxPrice}
                </p>
                <p>Location: {musician.location}</p>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
